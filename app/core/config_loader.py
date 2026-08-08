"""
Configuration loader for LAMESE AI.

This module loads the application configuration from a JSON file
and converts it into strongly typed configuration objects.
"""

import json
from pathlib import Path

from app.core.logger import logger
from app.core.settings import (
    ApplicationSettings,
    DataSettings,
    LoggingSettings,
    ModelSettings,
    Settings,
)

DEFAULT_CONFIG_PATH = Path("config/config.json")

def load_config(config_path: Path = DEFAULT_CONFIG_PATH,) -> Settings | None:
    """
    Args:
        config_path: The file path of config.json
    Returns:
        Settings | None: Loaded application settings, or None if
        configuration loading fails.
    """

    logger.info("Loading application configuration...")

    try:
        config_file = Path(config_path)

        if not config_file.exists():
            logger.error(
                "Configuration file does not exist."
            )
            return None

        with config_file.open(
            "r",
            encoding="utf-8",
        ) as file:
            config = json.load(file)

        application = ApplicationSettings(
            **config["application"]
        )

        logging_settings = LoggingSettings(
            **config["logging"]
        )

        data = DataSettings(
            **config["data"]
        )

        model = ModelSettings(
            **config["model"]
        )

        settings = Settings(
            application=application,
            logging=logging_settings,
            data=data,
            model=model,
        )

        logger.info("Configuration loaded successfully.")

        return settings

    except FileNotFoundError:
        logger.exception("Configuration file not found.")

        return None

    except json.JSONDecodeError:
        logger.exception("Invalid JSON format in config.json.")

        return None

    except KeyError:
        logger.exception("Configuration is missing one or more required keys.")

        return None

    except Exception:
        logger.exception("An unexpected error occurred while loading the configuration.")

        return None