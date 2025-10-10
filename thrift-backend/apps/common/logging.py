import logging
from django.conf import settings

def setup_error_logging():
    """Configure error logging."""
    logger = logging.getLogger('thriftee')
    logger.setLevel(logging.ERROR)
    
    handler = logging.FileHandler('logs/errors.log')
    handler.setLevel(logging.ERROR)
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

error_logger = setup_error_logging()

def log_error(error_type, message, extra_data=None):
    """Log error with context."""
    log_message = f"{error_type}: {message}"
    if extra_data:
        log_message += f" | Data: {extra_data}"
    error_logger.error(log_message)
