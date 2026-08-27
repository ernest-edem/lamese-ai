"""
Hyperparameter tuning utilities for LAMESE AI.
"""

import pandas as pd

from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
)

from sklearn.pipeline import Pipeline

from app.core.logger import logger


def tune_model(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
) -> Pipeline:
    """
    Find the best model hyperparameters using
    stratified cross-validation.

    Args:
        pipeline: Configured machine-learning pipeline.
        X_train: Training features.
        y_train: Training target.

    Returns:
        Pipeline: Pipeline configured with the best
        hyperparameters.
    """

    parameter_grid = {
        "model__n_estimators": [
            50,
            100,
            150,
        ],
        "model__max_depth": [
            None,
            5,
            10,
        ],
        "model__min_samples_split": [
            2,
            5,
            10,
        ],
    }

    cross_validator = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    search = GridSearchCV(
        estimator=pipeline,
        param_grid=parameter_grid,
        cv=cross_validator,
        scoring="roc_auc",
        n_jobs=-1,
        refit=True,
    )

    search.fit(
        X_train,
        y_train,
    )

    logger.info(
        "Best hyperparameters: %s",
        search.best_params_,
    )

    logger.info(
        "Best cross-validation ROC-AUC: %.2f",
        search.best_score_,
    )

    return search.best_estimator_