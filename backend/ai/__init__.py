"""
AI Module Package Initialization
"""

from backend.ai.advisor import ai_advisor_service, AiAdvisorService
from backend.ai.gemini_client import GeminiClient
from backend.ai.fallback import FallbackEngine
from backend.ai.glossary import GlossaryService

__all__ = [
    "ai_advisor_service",
    "AiAdvisorService",
    "GeminiClient",
    "FallbackEngine",
    "GlossaryService",
]
