import sys
from loguru import logger
from app.core.config import settings


def setup_logger():
    logger.remove()
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> - {message}",
        colorize=True,
    )
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="30 days",
        level="INFO",
        compression="zip",
    )
