"""
Tests for LAMESE AI machine learning components.
"""

from pathlib import Path

import joblib
import pandas as pd

from app.core.config_loader import load_config
from app.data.preprocessor import create_preprocessor
from app.data.splitter import feature_selection
from app.ml.inference import (
    load_trained_model,
    predict_patient,
    predict_patient_probability,
)
from app.ml.model_factory import create_model
from app.ml.model_persistence import save_model
from app.ml.pipeline import create_pipeline
from app.ml.threshold import predict_with_threshold


MODEL_PATH = Path("artifacts/model.pkl")


# ==========================================================
# TEST DATA
# ==========================================================

VALID_PATIENT = pd.DataFrame(
    [
        {
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
    ]
)


# ==========================================================
# MODEL FACTORY
# ==========================================================

def test_model_factory_creates_model():
    """Verify that the configured model can be created."""

    settings = load_config()

    assert settings is not None

    model = create_model(settings.model)

    assert model is not None
    assert hasattr(model, "fit")
    assert hasattr(model, "predict")
    assert hasattr(model, "predict_proba")


# ==========================================================
# PIPELINE
# ==========================================================

def test_pipeline_creation():
    """Verify that the ML pipeline contains preprocessing and model steps."""

    settings = load_config()

    assert settings is not None

    preprocessor = create_preprocessor()
    model = create_model(settings.model)

    pipeline = create_pipeline(
        preprocessor,
        model,
    )

    assert pipeline is not None
    assert hasattr(pipeline, "named_steps")

    assert "preprocessor" in pipeline.named_steps
    assert "model" in pipeline.named_steps


# ==========================================================
# PERSISTED MODEL
# ==========================================================

def test_persisted_model_exists():
    """Verify that the trained model artifact exists."""

    assert MODEL_PATH.exists()
    assert MODEL_PATH.is_file()


def test_persisted_model_loads():
    """Verify that the persisted model can be loaded."""

    pipeline = load_trained_model(MODEL_PATH)

    assert pipeline is not None
    assert hasattr(pipeline, "named_steps")


# ==========================================================
# INFERENCE
# ==========================================================

def test_prediction_returns_binary_result():
    """Verify that inference returns a binary prediction."""

    pipeline = load_trained_model(MODEL_PATH)

    prediction = predict_patient(
        pipeline,
        VALID_PATIENT,
    )

    assert len(prediction) == 1
    assert int(prediction[0]) in [0, 1]


def test_prediction_probability_returns_valid_probability():
    """Verify that inference returns valid class probabilities."""

    pipeline = load_trained_model(MODEL_PATH)

    probability = predict_patient_probability(
        pipeline,
        VALID_PATIENT,
    )

    assert probability.shape == (1, 2)

    assert 0.0 <= float(probability[0][0]) <= 1.0
    assert 0.0 <= float(probability[0][1]) <= 1.0

    assert abs(
        float(probability[0][0])
        + float(probability[0][1])
        - 1.0
    ) < 1e-9


# ==========================================================
# THRESHOLD PREDICTION
# ==========================================================

def test_threshold_prediction_returns_binary_result():
    """Verify that threshold-based inference returns a binary result."""

    pipeline = load_trained_model(MODEL_PATH)

    prediction = predict_with_threshold(
        pipeline,
        VALID_PATIENT,
        threshold=0.62,
    )

    assert prediction in [0, 1]


# ==========================================================
# MODEL PERSISTENCE
# ==========================================================

def test_model_can_be_saved_and_reloaded(tmp_path):
    """Verify that a trained pipeline can be persisted and reloaded."""

    settings = load_config()

    assert settings is not None

    preprocessor = create_preprocessor()
    model = create_model(settings.model)

    pipeline = create_pipeline(
        preprocessor,
        model,
    )

    X, y = feature_selection(
        pd.read_csv(
            settings.data.dataset_path
        )
    )

    pipeline.fit(X, y)

    model_path = tmp_path / "test_model.pkl"

    save_model(
        pipeline,
        model_path,
    )

    assert model_path.exists()

    loaded_pipeline = joblib.load(model_path)

    assert loaded_pipeline is not None
    assert hasattr(loaded_pipeline, "named_steps")