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
class ModelSettings:
    """Machine learning model configuration."""

    type: str
    n_estimators: int
    model_output_path: str


@dataclass(slots=True)
class Settings:
    """Root application settings."""

    application: ApplicationSettings
    logging: LoggingSettings
    data: DataSettings
    model: ModelSettings