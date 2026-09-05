# LAMESE AI

LAMESE AI is a machine learning system for heart disease risk prediction using structured patient health data.

The project was developed as a practical, modular machine learning application with a clear separation between data preparation, model training, evaluation, inference, and explainability.

The system provides:

- Heart disease prediction
- Probability estimation
- Configurable decision threshold
- SHAP-based model explanations
- FastAPI prediction API
- Docker and Docker Compose deployment
- Automated test coverage
- Persisted trained model artifact

> **Medical Disclaimer:** LAMESE AI is an educational and research-oriented machine learning system. Its predictions are not medical diagnoses and should not be used as a substitute for professional medical advice, examination, or treatment.

---

## 1. Project Status

**Version:** `0.1.0`

**Release:** `v0.1.0`

**Status:** Dockerized and deployment verified

The `v0.1.0` release includes the complete machine learning workflow, prediction API, SHAP explainability, automated tests, Docker support, and Docker Compose deployment.

---

## 2. Technology Stack

### Backend

- Python 3.11
- FastAPI
- Uvicorn
- Pydantic

### Machine Learning

- pandas
- NumPy
- scikit-learn
- SHAP

### Testing

- pytest
- HTTPX

### Deployment

- Docker
- Docker Compose

### Configuration

- JSON-based application configuration

---

## 3. System Architecture

The system follows a modular machine learning architecture:

```text
                    ┌──────────────────────┐
                    │   Patient Input      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI API       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Input Validation   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Persisted ML Pipeline│
                    │                      │
                    │ Preprocessor         │
                    │        ↓             │
                    │ Random Forest        │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
          ┌──────────────────┐   ┌──────────────────┐
          │ Prediction       │   │ SHAP Explanation │
          │ Probability      │   │                  │
          │ Threshold        │   │ Feature Impact   │
          └──────────────────┘   └──────────────────┘