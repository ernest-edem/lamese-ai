"""
SHAP explainability utilities for LAMESE AI.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import shap
from sklearn.pipeline import Pipeline


def _extract_positive_class_values(
    shap_values: Any,
) -> list[float]:
    """
    Extract SHAP values for the positive class.

    Args:
        shap_values: SHAP values returned by the explainer.

    Returns:
        list[float]: SHAP values for class 1.
    """

    if isinstance(shap_values, list):
        return shap_values[1][0].tolist()

    if shap_values.ndim == 3:
        return shap_values[0, :, 1].tolist()

    if shap_values.ndim == 2:
        return shap_values[0].tolist()

    raise ValueError(
        f"Unexpected SHAP value shape: {shap_values.shape}"
    )


def explain_prediction(
    pipeline: Pipeline,
    patient: pd.DataFrame,
) -> dict[str, float]:
    """
    Generate feature-level SHAP contributions for one patient.

    Args:
        pipeline: Trained machine-learning pipeline.
        patient: Patient feature data.

    Returns:
        dict[str, float]:
            Feature contributions ranked by absolute impact.
    """

    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]

    transformed_patient = preprocessor.transform(patient)

    if hasattr(transformed_patient, "toarray"):
        transformed_patient = transformed_patient.toarray()

    feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(
        transformed_patient
    )

    values = _extract_positive_class_values(shap_values)

    encoded_explanation = dict(
        zip(feature_names, values)
    )

    explanation: dict[str, float] = {}

    for feature_name, contribution in encoded_explanation.items():
        original_feature = feature_name

        if "__" in original_feature:
            original_feature = original_feature.split(
                "__",
                maxsplit=1,
            )[1]

        for categorical_feature in [
            "Sex",
            "ChestPainType",
            "RestingECG",
            "ExerciseAngina",
            "ST_Slope",
        ]:
            if original_feature.startswith(
                f"{categorical_feature}_"
            ):
                original_feature = categorical_feature
                break

        explanation[original_feature] = (
            explanation.get(original_feature, 0.0)
            + contribution
        )

    return dict(
        sorted(
            explanation.items(),
            key=lambda item: abs(item[1]),
            reverse=True,
        )
    )