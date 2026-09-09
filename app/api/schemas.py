"""
API request and response schemas for LAMESE AI.
"""

from typing import Literal

from pydantic import BaseModel, Field


# ==========================================================
# REQUEST SCHEMA
# ==========================================================

class PatientInput(BaseModel):
    """Patient features accepted by the prediction API."""

    Age: int = Field(
        ...,
        ge=0,
        le=120,
        description="Patient age in years.",
    )

    Sex: Literal["M", "F"] = Field(
        ...,
        description="Patient sex.",
    )

    ChestPainType: Literal[
        "ATA",
        "NAP",
        "ASY",
        "TA",
    ] = Field(
        ...,
        description="Chest pain type.",
    )

    RestingBP: float = Field(
        ...,
        ge=0,
        le=300,
        description="Resting blood pressure.",
    )

    Cholesterol: float = Field(
        ...,
        ge=0,
        le=1000,
        description="Serum cholesterol level.",
    )

    FastingBS: int = Field(
        ...,
        ge=0,
        le=1,
        description="Fasting blood sugar indicator.",
    )

    RestingECG: Literal[
        "Normal",
        "ST",
        "LVH",
    ] = Field(
        ...,
        description="Resting electrocardiogram result.",
    )

    MaxHR: float = Field(
        ...,
        ge=0,
        le=300,
        description="Maximum heart rate achieved.",
    )

    ExerciseAngina: Literal[
        "Y",
        "N",
    ] = Field(
        ...,
        description="Exercise-induced angina indicator.",
    )

    Oldpeak: float = Field(
        ...,
        ge=-20,
        le=20,
        description="ST depression induced by exercise.",
    )

    ST_Slope: Literal[
        "Up",
        "Flat",
        "Down",
    ] = Field(
        ...,
        description="Slope of the peak exercise ST segment.",
    )


# ==========================================================
# RESPONSE SCHEMA
# ==========================================================

class PredictionResponse(BaseModel):
    """Prediction response returned by the API."""

    prediction: Literal[0, 1]

    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    threshold_prediction: Literal[0, 1]

    threshold: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    explanation: dict[str, float]