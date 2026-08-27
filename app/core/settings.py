"""
Application configuration models.

This module defines the strongly-typed configuration objects used
throughout the LAMESE AI application.
"""

from dataclasses import dataclass


@dataclass(slots=True)
class ApplicationSettings:
    """Application metadata."""

    name: str
    version: str
    environment: str


@dataclass(slots=True)
class LoggingSettings:
    """Logging configuration."""

    level: str
    directory: str
    filename: str


@dataclass(slots=True)
class DataSettings:
    """Dataset configuration."""

    dataset_path: str
    test_size: float
    random_state: int


@dataclass(slots=True)
class ThresholdSettings:
    """Classification threshold configuration."""

    minimum_recall: float
    minimum: float
    maximum: float
    step: float

    def __post_init__(self) -> None:
        """Validate threshold configuration."""

        if not 0.0 <= self.minimum_recall <= 1.0:
            raise ValueError(
                "minimum_recall must be between 0.0 and 1.0."
            )

        if not 0.0 <= self.minimum <= 1.0:
            raise ValueError(
                "minimum threshold must be between 0.0 and 1.0."
            )

        if not 0.0 <= self.maximum <= 1.0:
            raise ValueError(
                "maximum threshold must be between 0.0 and 1.0."
            )

        if self.minimum >= self.maximum:
            raise ValueError(
                "minimum threshold must be less than maximum threshold."
            )

        if self.step <= 0.0:
            raise ValueError(
                "threshold step must be greater than 0."
            )


@dataclass(slots=True)
class ModelSettings:
    """Machine learning model configuration."""

    type: str
    n_estimators: int
    random_state: int
    model_output_path: str
    threshold: ThresholdSettings


@dataclass(slots=True)
class Settings:
    """Root application settings."""

    application: ApplicationSettings
    logging: LoggingSettings
    data: DataSettings
    model: ModelSettings