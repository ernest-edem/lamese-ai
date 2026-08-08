"""
LAMESE AI application entry point.
"""

from app.core.config_loader import load_config
from app.core.logger import logger


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


if __name__ == "__main__":
    main()