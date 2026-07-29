"""
AI Helper Utility Functions & Decorators
"""

import json
import logging
import re
import functools
import time
from typing import Callable, Any, List, Dict, Optional

logger = logging.getLogger("health_insurance_api")


def safe_json_parse(json_str: str, default: Optional[Any] = None) -> Any:
    """Safely parse a JSON string without throwing unhandled exceptions."""
    if not json_str:
        return default
    try:
        return json.loads(json_str)
    except Exception as e:
        logger.warning(f"safe_json_parse error: {str(e)}")
        return default


def clean_markdown(text: str) -> str:
    """Clean and sanitize generated markdown text, removing trailing cut-offs or invalid characters."""
    if not text:
        return ""
    
    cleaned = text.strip()
    # Normalize multiple consecutive empty lines to a maximum of two
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned


def truncate_history(history: Optional[List[Dict[str, str]]], max_turns: int = 6) -> List[Dict[str, str]]:
    """Truncate conversation history to keep only the recent turns."""
    if not history:
        return []
    
    sanitized = []
    for item in history:
        if isinstance(item, dict) and "role" in item and "content" in item:
            role = "user" if item["role"] == "user" else "assistant"
            sanitized.append({"role": role, "content": str(item["content"]).strip()})
    
    return sanitized[-max_turns:]


def retry_on_failure(retries: int = 2, delay: float = 0.5, exceptions: tuple = (Exception,)) -> Callable:
    """Decorator to retry a function execution on temporary failures."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            for attempt in range(1, retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    logger.warning(f"Function '{func.__name__}' failed attempt {attempt}/{retries}: {str(e)}")
                    if attempt < retries:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator
