import pandas as pd
from sklearn.model_selection import train_test_split


def feature_selection(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Select features and target from the dataset.

    Args:
        df: Cleaned dataset.

    Returns:
        tuple[pd.DataFrame, pd.Series]:
            Selected features and target.
    """

    X = df.drop(columns="HeartDisease")
    y = df["HeartDisease"]

    return X, y


def split_data(
    X: pd.DataFrame,
    y: pd.Series,
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.Series,
    pd.Series,
]:
    """
    Split features and target into training and testing sets.

    Args:
        X: Selected features.
        y: Target values.

    Returns:
        tuple:
            X_train: Training features.
            X_test: Testing features.
            y_train: Training target.
            y_test: Testing target.
    """

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    return X_train, X_test, y_train, y_test