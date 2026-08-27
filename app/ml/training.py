"""
Training workflow for LAMESE AI.
"""

from pathlib import Path

import pandas as pd
from sklearn.pipeline import Pipeline

from app.ml.model_persistence import save_model
from app.ml.trainer import train_pipeline
from app.ml.evaluator import evaluate_pipeline


def train(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    model_path: Path,
) -> float:
    """
    Train, evaluate, and save the machine-learning pipeline.

    Args:
        pipeline: Configured machine-learning pipeline.
        X_train: Training features.
        y_train: Training target.
        X_test: Testing features.
        y_test: Testing target.
        model_path: Path where the trained pipeline is saved.

    Returns:
        float: Model accuracy.
    """

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