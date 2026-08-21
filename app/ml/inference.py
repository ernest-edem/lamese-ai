"""
Inference workflow for LAMESE AI.
"""

from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline

from app.ml.model_persistence import load_model
from app.ml.predictor import (
    predict,
    predict_probability,
)


def load_trained_model(
    model_path: Path,
) -> Pipeline:
    """
    Load the trained machine-learning pipeline.

    Args:
        model_path: Path to the saved model.

    Returns:
        Pipeline: Loaded trained pipeline.
    """

    return load_model(model_path)


def predict_patient(
    pipeline: Pipeline,
    patient: pd.DataFrame,
) -> np.ndarray:
    """
    Generate a prediction for a patient.

    Args:
        pipeline: Trained machine-learning pipeline.
        patient: Patient data.

    Returns:
        np.ndarray: Prediction.
    """

    return predict(
        pipeline,
        patient,
    )


def predict_patient_probability(
    pipeline: Pipeline,
    patient: pd.DataFrame,
) -> np.ndarray:
    """
    Generate prediction probabilities for a patient.

    Args:
        pipeline: Trained machine-learning pipeline.
        patient: Patient data.

    Returns:
        np.ndarray: Prediction probabilities.
    """

    return predict_probability(
        pipeline,
        patient,
    )