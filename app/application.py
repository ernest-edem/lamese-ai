"""
LAMESE AI application orchestration.
"""

from pathlib import Path

import pandas as pd

from app.core.config_loader import load_config
from app.core.logger import logger

from app.data.dataset_loader import DatasetLoader
from app.data.validator import validate_dataset
from app.data.preprocessor import create_preprocessor
from app.data.splitter import feature_selection, split_data

from app.ml.model_factory import create_model
from app.ml.training import train
from app.ml.inference import (
    load_trained_model,
    predict_patient,
    predict_patient_probability,
)

from app.ml.evaluator import (
    evaluate_pipeline,
    evaluate_thresholds,
)

from app.ml.threshold import (
    select_threshold,
    predict_with_threshold,
)

from app.ml.pipeline import create_pipeline
from app.ml.cross_validation import cross_validate_model
from app.ml.tuner import tune_model

from app.ml.explainability.shap_explainer import (
    explain_prediction,
)


class Application:
    """
    Coordinate the LAMESE AI application workflow.
    """

    def run(self) -> None:
        """
        Start the LAMESE AI application.
        """

        logger.info(
            "Starting LAMESE AI application..."
        )

        settings = load_config()

        if settings is None:
            logger.critical(
                "Application startup failed due to configuration error."
            )
            return

        logger.info(
            "LAMESE AI initialized successfully."
        )

        loader = DatasetLoader(settings)

        # =====================
        # Load Dataset
        # =====================
        df = loader.load()

        # =====================
        # Validate Dataset
        # =====================
        validate_dataset(df)

        # =====================
        # Dataset Preprocessor
        # =====================
        preprocessor = create_preprocessor()

        # =====================
        # Feature Selection
        # =====================
        X, y = feature_selection(df)

        # =====================
        # Split Data
        # =====================
        (
            X_train,
            X_validation,
            X_test,
            y_train,
            y_validation,
            y_test,
        ) = split_data(
            X,
            y,
        )

        # =====================
        # Create Model
        # =====================
        model = create_model(
            settings.model,
        )

        # =====================
        # Create ML Pipeline
        # =====================
        pipeline = create_pipeline(
            preprocessor,
            model,
        )

        # =====================
        # Hyperparameter Tuning
        # =====================
        pipeline = tune_model(
            pipeline,
            X_train,
            y_train,
        )

        # =====================
        # Cross Validation Model
        # =====================
        cv_mean, cv_std = cross_validate_model(
            pipeline,
            X_train,
            y_train,
            folds=5,
        )

        logger.info(
            "Cross-validation mean: %.4f",
            cv_mean,
        )

        logger.info(
            "Cross-validation standard deviation: %.4f",
            cv_std,
        )

        # =====================
        # Training Module
        # =====================
        accuracy = train(
            pipeline,
            X_train,
            y_train,
            X_test,
            y_test,
            Path(settings.model.model_output_path),
        )

        logger.info(
            "Training accuracy: %.4f",
            accuracy,
        )

        # =====================
        # Model Evaluation
        # =====================
        evaluate_thresholds(
            pipeline,
            X_validation,
            y_validation,
        )

        # =====================
        # Threshold Selection
        # =====================
        selected_threshold = select_threshold(
            pipeline,
            X_validation,
            y_validation,
            settings.model.threshold.minimum_recall,
            settings.model.threshold.minimum,
            settings.model.threshold.maximum,
            settings.model.threshold.step,
        )

        logger.info(
            "Selected threshold: %.2f",
            selected_threshold,
        )

        # =====================
        # Inference Implementation
        # =====================
        new_patient = pd.DataFrame(
            {
                "Age": [55],
                "Sex": ["M"],
                "ChestPainType": ["ATA"],
                "RestingBP": [140],
                "Cholesterol": [250],
                "FastingBS": [0],
                "RestingECG": ["Normal"],
                "MaxHR": [150],
                "ExerciseAngina": ["N"],
                "Oldpeak": [1.2],
                "ST_Slope": ["Up"],
            }
        )

        # =====================
        # Load Trained Model
        # =====================
        pipeline = load_trained_model(
            Path(settings.model.model_output_path)
        )

        # =====================
        # Threshold Prediction
        # =====================
        threshold_prediction = predict_with_threshold(
            pipeline,
            new_patient,
            selected_threshold,
        )

        logger.info(
            "Threshold prediction for new patient: %d",
            threshold_prediction,
        )

        # =====================
        # Prediction and Probability
        # =====================
        prediction = predict_patient(
            pipeline,
            new_patient,
        )

        probability = predict_patient_probability(
            pipeline,
            new_patient,
        )

        logger.info(
            "Prediction for new patient: %s",
            prediction,
        )

        logger.info(
            "Probability for new patient: %s",
            probability,
        )

        # =====================
        # SHAP Explainability
        # =====================
        explanation = explain_prediction(
            pipeline,
            new_patient,
        )

        logger.info(
            "SHAP explanation generated successfully."
        )

        for feature, contribution in explanation.items():
            logger.info(
                "SHAP contribution - %s: %+.6f",
                feature,
                contribution,
            )