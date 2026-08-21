import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline

from app.core.logger import logger


def evaluate_pipeline(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> float:
    """
    Evaluate the trained machine learning pipeline.

    Args:
        pipeline: Trained ML pipeline.
        X_test: Unseen test features.
        y_test: Actual test target values.

    Returns:
        float: Accuracy score ranging from 0.0 to 1.0.
    """

    prediction = pipeline.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        prediction,
    )

    logger.info(
        "Accuracy: %.2f",
        accuracy,
    )

    return accuracy