"""
This file is responsible for creating configured ML models.
"""

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from app.ml.protocol import ModelProtocol
from app.core.settings import ModelSettings


def create_model(
    settings: ModelSettings,
) -> ModelProtocol:
    """
    Args:
        settings: Configuration for the machine learning model.

    Returns:
        ModelProtocol: Configured machine learning model.

    Raises:
        ValueError: If the model type is unsupported.
    """

    if not settings.type:
        raise ValueError("Configured model not found")

    if settings.type == "random_forest":
        return RandomForestClassifier(
            n_estimators=settings.n_estimators,
            random_state=settings.random_state,
        )

    if settings.type == "logistic_regression":
        return LogisticRegression(
            max_iter=1000,
        )

    raise ValueError(
        f"Unsupported model type: {settings.type}"
    )