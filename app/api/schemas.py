"""
API request and response schemas for LAMESE AI.
"""

from pydantic import BaseModel, Field


class PatientInput(BaseModel):
    """Patient features accepted by the prediction API."""

    Age: int = Field(..., ge=0)
    Sex: str
    ChestPainType: str
    RestingBP: float = Field(..., ge=0)
    Cholesterol: float = Field(..., ge=0)
    FastingBS: int = Field(..., ge=0, le=1)
    RestingECG: str
    MaxHR: float = Field(..., ge=0)
    ExerciseAngina: str
    Oldpeak: float
    ST_Slope: str


class PredictionResponse(BaseModel):
    """Prediction response returned by the API."""

    prediction: int
    probability: float
    threshold_prediction: int
    threshold: float
    explanation: dict[str, float]