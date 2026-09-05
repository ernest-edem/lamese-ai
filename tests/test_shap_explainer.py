"""
Tests for SHAP explainability.
"""

from pathlib import Path

import joblib
import pandas as pd

from app.ml.explainability.shap_explainer import explain_prediction


MODEL_PATH = Path("artifacts/model.pkl")


def load_pipeline():
    """Load the trained model pipeline used for SHAP testing."""
    return joblib.load(MODEL_PATH)


def create_sample_patient() -> pd.DataFrame:
    """Create a representative patient for SHAP explanation testing."""
    return pd.DataFrame(
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


def test_model_pipeline_loads():
    """Verify that the persisted model pipeline can be loaded."""
    pipeline = load_pipeline()

    assert pipeline is not None
    assert hasattr(pipeline, "named_steps")


def test_sample_patient_has_expected_features():
    """Verify that the SHAP test patient contains all model input features."""
    patient = create_sample_patient()

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

    assert set(patient.columns) == expected_features
    assert len(patient) == 1


def test_shap_explanation_returns_all_original_features():
    """Verify that SHAP returns aggregated contributions for all input features."""
    pipeline = load_pipeline()
    patient = create_sample_patient()

    explanation = explain_prediction(
        pipeline,
        patient,
    )

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

    assert isinstance(explanation, dict)
    assert set(explanation.keys()) == expected_features
    assert len(explanation) == len(expected_features)


def test_shap_explanation_contains_numeric_values():
    """Verify that all SHAP contributions are numeric."""
    pipeline = load_pipeline()
    patient = create_sample_patient()

    explanation = explain_prediction(
        pipeline,
        patient,
    )

    for feature, contribution in explanation.items():
        assert isinstance(feature, str)
        assert isinstance(contribution, (int, float))


def test_shap_explanation_is_aggregated():
    """Verify that one-hot encoded features are returned as original features."""
    pipeline = load_pipeline()
    patient = create_sample_patient()

    explanation = explain_prediction(
        pipeline,
        patient,
    )

    encoded_feature_prefixes = (
        "Sex_",
        "ChestPainType_",
        "RestingECG_",
        "ExerciseAngina_",
        "ST_Slope_",
    )

    for feature in explanation:
        assert not feature.startswith(encoded_feature_prefixes)