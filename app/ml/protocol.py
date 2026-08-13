"""
This file creates a protocol or system that accepts
any ML model that fits the fit/predict contract
"""

from typing import Protocol

class ModelProtocol(Protocol):
    """
    This class defines model training protocol for the application
    """
    def fit(self, X, y):
        """
        Train model
        """
        return


    def predict(self, X):
        """
        Make predictions
        """
        return