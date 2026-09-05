"""
Tests for the LAMESE AI data pipeline.
"""

from pathlib import Path

import pandas as pd

from app.core.config_loader import load_config
from app.data.dataset_loader import DatasetLoader
from app.data.validator import validate_dataset
from app.data.preprocessor import create_preprocessor
from app.data.splitter import feature_selection, split_data


# ==========================================================
# DATASET LOADING
# ==========================================================

def test_dataset_loader():
    """Verify that the configured dataset can be loaded."""

    settings = load_config()

    assert settings is not None

    loader = DatasetLoader(settings)
    df = loader.load()

    assert isinstance(df, pd.DataFrame)
    assert not df.empty


# ==========================================================
# DATASET VALIDATION
# ==========================================================

def test_dataset_validation():
    """Verify that the current dataset passes validation."""

    settings = load_config()

    loader = DatasetLoader(settings)
    df = loader.load()

    result = validate_dataset(df)

    assert result is None or result is True


# ==========================================================
# FEATURE SELECTION
# ==========================================================

def test_feature_selection():
    """Verify that features and target are separated correctly."""

    settings = load_config()

    loader = DatasetLoader(settings)
    df = loader.load()

    X, y = feature_selection(df)

    assert isinstance(X, pd.DataFrame)
    assert isinstance(y, pd.Series)

    assert len(X) == len(y)
    assert "HeartDisease" not in X.columns
    assert y.name == "HeartDisease"


# ==========================================================
# DATA SPLITTING
# ==========================================================

def test_data_split():
    """Verify train, validation, and test datasets are created."""

    settings = load_config()

    loader = DatasetLoader(settings)
    df = loader.load()

    X, y = feature_selection(df)

    (
        X_train,
        X_validation,
        X_test,
        y_train,
        y_validation,
        y_test,
    ) = split_data(X, y)

    assert len(X_train) > 0
    assert len(X_validation) > 0
    assert len(X_test) > 0

    assert len(y_train) == len(X_train)
    assert len(y_validation) == len(X_validation)
    assert len(y_test) == len(X_test)

    assert (
        len(X_train)
        + len(X_validation)
        + len(X_test)
        == len(X)
    )


# ==========================================================
# PREPROCESSOR
# ==========================================================

def test_preprocessor_creation():
    """Verify that the preprocessing pipeline is created."""

    preprocessor = create_preprocessor()

    assert preprocessor is not None
    assert hasattr(preprocessor, "transformers")

    transformer_names = {
        transformer[0]
        for transformer in preprocessor.transformers
    }

    assert "categorical" in transformer_names
    assert "numerical" in transformer_names