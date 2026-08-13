"""
LAMESE AI application entry point.
"""

from app.core.config_loader import load_config
from app.core.logger import logger
from app.ml.model_factory import create_model
from app.data.dataset_loader import DatasetLoader
from app.data.validator import validate_dataset

def main():
    """
    Start LAMESE AI application.
    """

    logger.info("Starting LAMESE AI application...")

    settings = load_config()

    if settings is None:
        logger.critical(
            "Application startup failed due to configuration error."
        )
        return

    logger.info("LAMESE AI initialized successfully.")


    loader = DatasetLoader(settings)

    df = loader.load()

    model = create_model(
        settings.model,
    )

    validate_dataset(df)




if __name__ == "__main__":
    main()