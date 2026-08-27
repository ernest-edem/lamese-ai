"""
Cross-validation utilities for LAMESE AI.
"""

import numpy as np
import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline

from app.core.logger import logger


def cross_validate_model(
    pipeline: Pipeline,
    X: pd.DataFrame,
    y: pd.Series,
    folds: int = 5,
) -> tuple[float, float]:
    """
    Evaluate a machine-learning pipeline using stratified
    k-fold cross-validation.

    Args:
        pipeline: Configured machine-learning pipeline.
        X: Training features.
        y: Training target.
        folds: Number of cross-validation folds.

    Returns:
        tuple[float, float]:
            Mean accuracy and standard deviation.
    """

    cross_validator = StratifiedKFold(
        n_splits=folds,
        shuffle=True,
        random_state=42,
    )

    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc",
    }

    results = cross_validate(
        pipeline,
        X,
        y,
        cv=cross_validator,
        scoring=scoring,
        n_jobs=-1,
    )

    accuracy_scores = results["test_accuracy"]
    precision_scores = results["test_precision"]
    recall_scores = results["test_recall"]
    f1_scores = results["test_f1"]
    roc_auc_scores = results["test_roc_auc"]

    logger.info(
        "Cross-validation accuracy scores: %s",
        np.round(accuracy_scores, 3),
    )

    logger.info(
        "Cross-validation mean accuracy: %.2f",
        accuracy_scores.mean(),
    )

    logger.info(
        "Cross-validation standard deviation: %.2f",
        accuracy_scores.std(),
    )

    logger.info(
        "Cross-validation mean precision: %.2f",
        precision_scores.mean(),
    )

    logger.info(
        "Cross-validation mean recall: %.2f",
        recall_scores.mean(),
    )

    logger.info(
        "Cross-validation mean F1: %.2f",
        f1_scores.mean(),
    )

    logger.info(
        "Cross-validation mean ROC-AUC: %.2f",
        roc_auc_scores.mean(),
    )

    return (
        float(accuracy_scores.mean()),
        float(accuracy_scores.std()),
    )