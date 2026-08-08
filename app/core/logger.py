"""
This file defines the central logging system for LameseAI

This module configures a reusable logger with console output
and rotating file-based logging.
"""


import logging
import os
from logging.handlers import RotatingFileHandler

os.makedirs("logs", exist_ok=True)

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)

logger.propagate=False

if not logger.handlers:

    console_handler = logging.StreamHandler()

    file_handler = RotatingFileHandler(
        "logs/app.log",
        maxBytes=1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )

    formatter = logging.Formatter(
        "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
    )

    console_handler.setFormatter(formatter)

    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    logger.addHandler(file_handler)