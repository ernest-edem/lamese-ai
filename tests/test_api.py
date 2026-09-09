"""
Tests for the LAMESE AI FastAPI application.
"""

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.main import app
from app.core.auth import get_current_user
from app.core.config_loader import load_config


client = TestClient(app)


# ==========================================================
# TEST DATA
# ==========================================================

VALID_PATIENT = {
    "Age": 55,
    "Sex": "M",
    "ChestPainType": "ATA",
    "RestingBP": 140,
    "Cholesterol": 250,
    "FastingBS": 0,
    "RestingECG": "Normal",
    "MaxHR": 150,
    "ExerciseAngina": "N",
    "Oldpeak": 1.2,
    "ST_Slope": "Up",
}


# ==========================================================
# AUTHENTICATED CLIENT
# ==========================================================

@pytest.fixture
def authenticated_client(monkeypatch):
    """
    Provide a test client with authentication successfully bypassed.

    The actual Supabase verification is tested separately. Prediction
    endpoint tests use this fixture so they remain deterministic and
    do not depend on an external Supabase service.
    """

    def mock_current_user():
        return {
            "id": "test-user-id",
            "email": "test@example.com",
        }

    app.dependency_overrides[get_current_user] = mock_current_user

    test_client = TestClient(app)

    yield test_client

    app.dependency_overrides.pop(get_current_user, None)


# ==========================================================
# HEALTH CHECK
# ==========================================================

def test_health_check():
    """Verify that the health endpoint is publicly available."""

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["service"] == "LAMESE AI"


# ==========================================================
# READINESS CHECK
# ==========================================================

def test_readiness_check():
    """Verify that the API reports ready when configuration and model exist."""

    response = client.get("/ready")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ready"
    assert data["service"] == "LAMESE AI"


def test_readiness_rejects_missing_configuration(monkeypatch):
    """Verify that readiness fails when configuration cannot be loaded."""

    monkeypatch.setattr(
        "app.api.main.load_config",
        lambda: None,
    )

    response = client.get("/ready")

    assert response.status_code == 503

    data = response.json()

    assert data["detail"] == (
        "Application is not ready: configuration could not be loaded."
    )


def test_readiness_rejects_missing_model(monkeypatch, tmp_path):
    """Verify that readiness fails when the trained model is unavailable."""

    settings = load_config()

    assert settings is not None

    missing_model_path = tmp_path / "missing_model.pkl"

    monkeypatch.setattr(
        settings.model,
        "model_output_path",
        str(missing_model_path),
    )

    monkeypatch.setattr(
        "app.api.main.load_config",
        lambda: settings,
    )

    response = client.get("/ready")

    assert response.status_code == 503

    data = response.json()

    assert data["detail"] == (
        "Application is not ready: trained model artifact was not found."
    )


# ==========================================================
# AUTHENTICATION
# ==========================================================

def test_prediction_requires_authentication():
    """Verify that prediction requests require authentication."""

    response = client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 401

    data = response.json()

    assert data["detail"] == "Authentication required."


def test_prediction_rejects_invalid_token(monkeypatch):
    """Verify that an invalid access token is rejected."""

    def reject_token(_access_token):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    monkeypatch.setattr(
        "app.core.auth.verify_supabase_access_token",
        reject_token,
    )

    response = client.post(
        "/predict",
        headers={
            "Authorization": "Bearer invalid-test-token",
        },
        json=VALID_PATIENT,
    )

    assert response.status_code == 401

    data = response.json()

    assert data["detail"] == (
        "Invalid or expired authentication token."
    )


# ==========================================================
# PREDICTION
# ==========================================================

def test_prediction_endpoint(authenticated_client):
    """Verify that an authenticated prediction request succeeds."""

    response = authenticated_client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 200

    data = response.json()

    assert "prediction" in data
    assert "probability" in data
    assert "threshold_prediction" in data
    assert "threshold" in data
    assert "explanation" in data


def test_prediction_values(authenticated_client):
    """Verify the prediction values returned by the API."""

    response = authenticated_client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 200

    data = response.json()

    settings = load_config()

    assert settings is not None

    assert data["prediction"] in [0, 1]
    assert 0.0 <= data["probability"] <= 1.0
    assert data["threshold_prediction"] in [0, 1]
    assert data["threshold"] == settings.model.threshold.selected


def test_prediction_uses_configured_threshold(
    authenticated_client,
    monkeypatch,
):
    """Verify that the API uses the configured selected threshold."""

    settings = load_config()

    assert settings is not None

    monkeypatch.setattr(
        settings.model.threshold,
        "selected",
        0.65,
    )

    monkeypatch.setattr(
        "app.api.main.load_config",
        lambda: settings,
    )

    response = authenticated_client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["threshold"] == 0.65


def test_prediction_explanation(authenticated_client):
    """Verify that SHAP returns all original model features."""

    response = authenticated_client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 200

    explanation = response.json()["explanation"]

    expected_features = {
        "Age",
        "Sex",
        "ChestPainType",
        "RestingBP",
        "Cholesterol",
        "FastingBS",
        "RestingECG",
        "MaxHR",
        "ExerciseAngina",
        "Oldpeak",
        "ST_Slope",
    }

    assert set(explanation.keys()) == expected_features

    for feature, contribution in explanation.items():
        assert isinstance(feature, str)
        assert isinstance(contribution, (int, float))


# ==========================================================
# VALIDATION
# ==========================================================

def test_prediction_rejects_missing_field(authenticated_client):
    """Verify that invalid requests are rejected."""

    invalid_patient = VALID_PATIENT.copy()

    del invalid_patient["Age"]

    response = authenticated_client.post(
        "/predict",
        json=invalid_patient,
    )

    assert response.status_code == 422


def test_prediction_rejects_invalid_fasting_blood_sugar(
    authenticated_client,
):
    """Verify Pydantic validation for FastingBS."""

    invalid_patient = VALID_PATIENT.copy()
    invalid_patient["FastingBS"] = 2

    response = authenticated_client.post(
        "/predict",
        json=invalid_patient,
    )

    assert response.status_code == 422