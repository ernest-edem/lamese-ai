"""
This file trains ML models for testing
"""

import pandas as pd
from app.ml.protocol import ModelProtocol

def train_model(
        model: ModelProtocol,
        X_train: pd.DataFrame,
        y_train: pd.Series,
) -> ModelProtocol:
    """
    Args:
        model: ML model to be trained
        X_train: Training feature
        y_train: Training target
    Returns:
         ModelProtocol: Trained ML model
    """
    model.fit(X_train, y_train)

    return model

