from pathlib import Path

import joblib
from sklearn.pipeline import Pipeline

from app.core.logger import logger


def save_model(
    pipeline: Pipeline,
    model_path: Path,
) -> None:
    """
    Save the trained machine learning pipeline.

    Args:
        pipeline: Trained machine learning pipeline.
        model_path: Path where the pipeline will be saved.
    """

    model_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        model_path,
    )

    logger.info(
        "Trained model saved to '%s'.",
        model_path,
    )


def load_model(
    model_path: Path,
) -> Pipeline:
    """
    Load a trained machine learning pipeline.

    Args:
        model_path: Path to the saved pipeline.

    Returns:
        Pipeline: Loaded trained machine learning pipeline.

    Raises:
        FileNotFoundError:
            If the model file does not exist.
    """

    if not model_path.exists():
        raise FileNotFoundError(
            f"Trained model not found: {model_path}"
        )

    pipeline = joblib.load(model_path)

    logger.info(
        "Model loaded successfully from '%s'.",
        model_path,
    )

    return pipeline