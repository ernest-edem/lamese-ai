
import pandas as pd
from sklearn.pipeline import Pipeline

def train_pipeline(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
) -> Pipeline:
    """
    Train the machine learning pipeline.

    Args:
        pipeline: Configured ML pipeline.
        X_train: Training features.
        y_train: Training target.

    Returns:
        Pipeline: Trained machine learning pipeline.
    """
    pipeline.fit(X_train, y_train)

    return pipeline