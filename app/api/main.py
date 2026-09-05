"""
LAMESE AI FastAPI application.
"""

from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config_loader import load_config
from app.ml.inference import (
    load_trained_model,
    predict_patient,
    predict_patient_probability,
)
from app.ml.threshold import predict_with_threshold
from app.ml.explainability.shap_explainer import explain_prediction

from app.api.schemas import (
    PatientInput,
    PredictionResponse,
)


# ==========================================================
# APPLICATION
# ==========================================================

app = FastAPI(
    title="LAMESE AI",
    description="Heart Disease Prediction API",
    version="0.1.0",
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health_check() -> dict[str, str]:
    settings = load_config()

    if settings is None:
        return {
            "status": "unhealthy",
            "service": "LAMESE AI",
        }

    return {
        "status": "healthy",
        "service": "LAMESE AI",
    }


# ==========================================================
# PREDICTION
# ==========================================================

@app.post(
    "/predict",
    response_model=PredictionResponse,
)
def predict(patient: PatientInput) -> PredictionResponse:
    settings = load_config()

    if settings is None:
        raise HTTPException(
            status_code=500,
            detail="Application configuration could not be loaded.",
        )

    model_path = Path(
        settings.model.model_output_path
    )

    if not model_path.exists():
        raise HTTPException(
            status_code=500,
            detail="Trained model artifact was not found.",
        )

    try:
        pipeline = load_trained_model(model_path)

        patient_data = pd.DataFrame(
            [patient.model_dump()]
        )

        prediction = predict_patient(
            pipeline,
            patient_data,
        )

        probability = predict_patient_probability(
            pipeline,
            patient_data,
        )

        heart_disease_probability = float(
            probability[0][1]
        )

        selected_threshold = settings.model.threshold.selected

        threshold_prediction = predict_with_threshold(
            pipeline,
            patient_data,
            selected_threshold,
        )

        explanation = explain_prediction(
            pipeline,
            patient_data,
        )

        return PredictionResponse(
            prediction=int(prediction[0]),
            probability=heart_disease_probability,
            threshold_prediction=int(threshold_prediction),
            threshold=selected_threshold,
            explanation={
                feature: float(contribution)
                for feature, contribution in explanation.items()
            },
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}",
        ) from exc