"""
Training workflow for LAMESE AI.
"""

from pathlib import Path

import pandas as pd

from app.core.logger import logger
from app.ml.model_persistence import save_model
from app.ml.pipeline import create_pipeline
from app.ml.trainer import train_pipeline
from app.ml.evaluator import evaluate_pipeline


def train(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    preprocessor,
    model,
    model_path: Path,
) -> float:
    """
    Train, evaluate, and save the machine-learning pipeline.

    Args:
        X_train: Training features.
        y_train: Training target.
        X_test: Testing features.
        y_test: Testing target.
        preprocessor: Feature preprocessing configuration.
        model: Configured machine-learning model.
        model_path: Path where the trained pipeline is saved.

    Returns:
        float: Model accuracy.
    """

    pipeline = create_pipeline(
        preprocessor,
        model,
    )

    train_pipeline(
        pipeline,
        X_train,
        y_train,
    )

    accuracy = evaluate_pipeline(
        pipeline,
        X_test,
        y_test,
    )

    save_model(
        pipeline,
        model_path,
    )

    return accuracy