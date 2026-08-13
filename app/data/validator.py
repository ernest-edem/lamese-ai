"""
This files responsibility is to validate the dataset;
check whether it is empty. If not, check whether there exist the
target column
"""


import pandas as pd

from app.core.logger import logger


def validate_dataset(df: pd.DataFrame) -> None:
    """
    Validate the dataset before it enters the ML pipeline.

    Args:
        df: Dataset to validate.

    Raises:
        ValueError: If the dataset is empty.
        ValueError: If the required target column is missing.
    """

    if df.empty:
        raise ValueError("Dataset is empty")

    if "HeartDisease" not in df.columns:
        raise ValueError(
            "Required target column 'HeartDisease' is missing"
        )

    logger.info("Dataset validation successful.")

