"""
This file is responsible for model evaluation
"""

import pandas as pd
from sklearn.metrics import accuracy_score
from app.ml.protocol import ModelProtocol

def evaluate_model(
    model: ModelProtocol,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> float:
    """
    Args:
        model: trained random forest model
        X_test: Reserved feature for making predictions
        y_test: actual values of target for model evaluation
    Returns:
         float: Accuracy score ranging from 0.0 to 1.0.
    """

    prediction = model.predict(X_test)

    accuracy = accuracy_score(y_test, prediction)

    print("\nActual:    ", y_test.tolist())
    print("Predicted: ", prediction.tolist())

    return accuracy