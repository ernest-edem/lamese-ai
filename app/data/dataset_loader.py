"""
Dataset loading utilities for LAMESE AI.
"""

from pathlib import Path

import pandas as pd

from app.core.logger import logger
from app.core.settings import Settings
from app.data.exceptions import (
    DatasetLoadError,
    DatasetNotFoundError,
)


class DatasetLoader:
    """
    Load datasets used by the LAMESE AI application.
    """

    def __init__(self, settings: Settings) -> None:
        """
        Initialize the dataset loader.

        Args:
            settings: Application settings.
        """
        self.settings = settings

    def load(self) -> pd.DataFrame:
        """
        Load the configured dataset.

        Returns:
            A pandas DataFrame containing the dataset.

        Raises:
            DatasetNotFoundError:
                If the dataset file does not exist.
            DatasetLoadError:
                If the dataset cannot be loaded.
        """

        dataset_path = Path(
            self.settings.data.dataset_path
        )

        logger.info(
            "Loading dataset from '%s'.",
            dataset_path,
        )

        if not dataset_path.exists():
            logger.error(
                "Dataset file not found: %s",
                dataset_path,
            )
            raise DatasetNotFoundError(
                f"Dataset not found: {dataset_path}"
            )

        try:
            dataframe = pd.read_csv(dataset_path)

            logger.info(
                "Dataset loaded successfully."
            )

            logger.info(
                "Dataset shape: %s",
                dataframe.shape,
            )

            return dataframe

        except Exception as error:
            logger.exception(
                "Failed to load dataset."
            )
            raise DatasetLoadError(
                "Unable to load dataset."
            ) from error