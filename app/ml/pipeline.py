"""
This module creates the machine learning pipeline
that combines feature transformation and a configured model.
"""


from sklearn.pipeline import Pipeline

from app.ml.protocol import ModelProtocol


def create_pipeline(
    preprocessor,
    model: ModelProtocol,
) -> Pipeline:
    """
    Create an ML pipeline combining preprocessing and a model.

    Args:
        preprocessor: Feature transformation pipeline.
        model: Configured machine learning model.

    Returns:
        Pipeline: Combined preprocessing and model pipeline.
    """

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    return pipeline