"""
Threshold selection utilities for LAMESE AI.
"""

import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_score,
    recall_score,
)


def select_threshold(
    pipeline: Pipeline,
    X_validation: pd.DataFrame,
    y_validation: pd.Series,
    minimum_recall: float,
    minimum_threshold: float,
    maximum_threshold: float,
    threshold_step: float,
) -> float:
    """
    Select a probability threshold using validation data.

    The selected threshold must satisfy the minimum
    recall requirement. Among valid thresholds, the
    threshold with the highest precision is selected.

    Args:
        pipeline: Trained machine-learning pipeline.
        X_validation: Validation features.
        y_validation: Validation target values.
        minimum_recall: Minimum acceptable recall.

    Returns:
        float: Selected probability threshold.

    Raises:
        ValueError:
            If no threshold satisfies the minimum recall.
    """

    probability = pipeline.predict_proba(
        X_validation,
    )

    positive_probability = probability[:, 1]

    thresholds = np.arange(
        minimum_threshold,
        maximum_threshold + threshold_step,
        threshold_step,
    )

    candidates = []

    for threshold in thresholds:

        prediction = (
            positive_probability >= threshold
        ).astype(int)

        precision = precision_score(
            y_validation,
            prediction,
            zero_division=0,
        )

        recall = recall_score(
            y_validation,
            prediction,
            zero_division=0,
        )

        if recall >= minimum_recall:
            candidates.append(
                (
                    threshold,
                    precision,
                    recall,
                )
            )

    if not candidates:
        raise ValueError(
            "No threshold satisfies the minimum recall requirement."
        )

    selected_threshold = max(
        candidates,
        key=lambda candidate: candidate[1],
    )[0]

    return float(selected_threshold)


def predict_with_threshold(
    pipeline: Pipeline,
    new_patient: pd.DataFrame,
    threshold: float,
) -> int:
    """
    Generate a prediction using a custom probability threshold.

    Args:
        pipeline: Trained machine-learning pipeline.
        new_patient: Patient data.
        threshold: Probability threshold for positive classification.

    Returns:
        int: Prediction based on the supplied threshold.

    Raises:
        ValueError:
            If threshold is outside the range 0.0 to 1.0.
    """

    if not 0.0 <= threshold <= 1.0:
        raise ValueError(
            "Threshold must be between 0.0 and 1.0."
        )

    probability = pipeline.predict_proba(
        new_patient,
    )

    positive_probability = probability[:, 1]

    prediction = (
        positive_probability >= threshold
    ).astype(int)

    return int(prediction[0])