"""
Custom exceptions for the LAMESE AI application.
"""


class LameseAIError(Exception):
    """Base exception for all LAMESE AI errors."""


class DatasetError(LameseAIError):
    """Base exception for dataset-related errors."""


class DatasetNotFoundError(DatasetError):
    """Raised when the dataset file cannot be found."""


class DatasetLoadError(DatasetError):
    """Raised when the dataset cannot be loaded."""


class DatasetValidationError(DatasetError):
    """Raised when dataset validation fails."""


class ConfigurationError(LameseAIError):
    """Raised when configuration loading fails."""