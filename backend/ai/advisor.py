"""
AI Advisor Orchestration Layer
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from backend.ai.gemini_client import GeminiClient, GeminiClientError
from backend.ai.fallback import FallbackEngine
from backend.ai.glossary import GlossaryService
from backend.ai.context import format_prediction_context
from backend.ai.utils import truncate_history

logger = logging.getLogger("health_insurance_api")

class AiAdvisorService:
    """Main orchestration service for AI Insurance Advisor capabilities."""

    def __init__(
        self,
        gemini_client: Optional[GeminiClient] = None,
        fallback_engine: Optional[FallbackEngine] = None,
        glossary_service: Optional[GlossaryService] = None
    ):
        self.gemini_client = gemini_client or GeminiClient()
        self.fallback_engine = fallback_engine or FallbackEngine()
        self.glossary_service = glossary_service or GlossaryService(self.gemini_client)

    def chat(
        self,
        user_message: str,
        prediction_context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Process chat query.
        Tries Gemini LLM client first; automatically falls back to FallbackEngine if Gemini fails or is unconfigured.
        """
        timestamp = datetime.now().strftime("%I:%M %p")
        clean_user_message = user_message.strip()
        context_str = format_prediction_context(prediction_context)
        sanitized_history = truncate_history(history, max_turns=6)

        # 1. Attempt Gemini LLM Generation if API Key is set
        if self.gemini_client.is_configured:
            try:
                reply = self.gemini_client.generate_chat_response(
                    user_message=clean_user_message,
                    context_str=context_str,
                    history=sanitized_history,
                    max_tokens=1600
                )
                return {"success": True, "reply": reply, "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini LLM error: {str(e)}. Falling back to FallbackEngine.")

        # 2. Offline Fallback Conversational Engine
        reply = self.fallback_engine.generate_response(clean_user_message, prediction_context)
        return {"success": True, "reply": reply, "timestamp": timestamp}

    def search_glossary_term(self, query: str) -> Dict[str, Any]:
        """Search an insurance term via GlossaryService."""
        return self.glossary_service.search_term(query)

# Global singleton instance exported for router compatibility
ai_advisor_service = AiAdvisorService()
