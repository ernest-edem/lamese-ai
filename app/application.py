"""
LAMESE AI application orchestration.
"""

import pandas as pd

from pathlib import Path

from app.core.config_loader import load_config
from app.core.logger import logger

from app.data.dataset_loader import DatasetLoader
from app.data.validator import validate_dataset

from app.data.preprocessor import (
    create_preprocessor,
)

from app.data.splitter import (
    feature_selection,
    split_data,
)

from app.ml.model_factory import create_model

from app.ml.training import train

from app.ml.inference import (
    load_trained_model,
    predict_patient,
    predict_patient_probability,
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

        #=====================
        # Load Dataset
        #=====================
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
        # Transforming Categorical Features
        # =====================
        #preprocessor = encoding(df)

        # =====================
        # Feature Selection
        # =====================
        X, y = feature_selection(df)

        # =====================
        # Split Data
        # =====================
        X_train, X_test, y_train, y_test = split_data(
            X,
            y,
            #preprocessor,
        )

        # =====================
        # Create Model
        # =====================
        model = create_model(
            settings.model,
        )

        # =====================
        # Training Module
        # =====================
        accuracy = train(
            X_train,
            y_train,
            X_test,
            y_test,
            preprocessor,
            model,
            Path(settings.model.model_output_path),
        )

        # =====================
        # Inference Implementation
        # =====================

        new_patient = pd.DataFrame({
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
        })

        # =====================
        # Load Trained Model
        # =====================
        pipeline = load_trained_model(
            Path(settings.model.model_output_path)
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