"""
Tests for the LAMESE AI FastAPI application.
"""

from fastapi.testclient import TestClient

from app.api.main import app


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
# HEALTH CHECK
# ==========================================================

def test_health_check():
    """Verify that the health endpoint is available."""

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["service"] == "LAMESE AI"


# ==========================================================
# PREDICTION
# ==========================================================

def test_prediction_endpoint():
    """Verify that the prediction endpoint returns a valid response."""

    response = client.post(
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


def test_prediction_values():
    """Verify the prediction values returned by the API."""

    response = client.post(
        "/predict",
        json=VALID_PATIENT,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction"] in [0, 1]
    assert 0.0 <= data["probability"] <= 1.0
    assert data["threshold_prediction"] in [0, 1]
    assert data["threshold"] == 0.62


def test_prediction_explanation():
    """Verify that SHAP returns all original model features."""

    response = client.post(
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

def test_prediction_rejects_missing_field():
    """Verify that invalid requests are rejected."""

    invalid_patient = VALID_PATIENT.copy()

    del invalid_patient["Age"]

    response = client.post(
        "/predict",
        json=invalid_patient,
    )

    assert response.status_code == 422


def test_prediction_rejects_invalid_fasting_blood_sugar():
    """Verify Pydantic validation for FastingBS."""

    invalid_patient = VALID_PATIENT.copy()
    invalid_patient["FastingBS"] = 2

    response = client.post(
        "/predict",
        json=invalid_patient,
    )

    assert response.status_code == 422