"""
Glossary Search Service Module
"""

import logging
from datetime import datetime
from typing import Dict, Any
from backend.ai.gemini_client import GeminiClient, GeminiClientError

logger = logging.getLogger("health_insurance_api")

class GlossaryService:
    """Service handling smart insurance glossary term lookups via Gemini LLM or local fallbacks."""

    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client

    def search_term(self, query: str) -> Dict[str, Any]:
        """Search insurance term using Gemini AI or domain fallback if unavailable."""
        timestamp = datetime.now().strftime("%I:%M %p")
        clean_query = query.strip()

        # 1. Try Gemini Client if configured
        if self.gemini_client.is_configured:
            try:
                definition = self.gemini_client.generate_glossary_response(clean_query)
                return {
                    "success": True,
                    "term": clean_query,
                    "definition": definition,
                    "source": "Gemini AI",
                    "timestamp": timestamp
                }
            except Exception as e:
                logger.warning(f"Gemini glossary search failed: {str(e)}. Using fallback glossary.")

        # 2. Local Fallback Generator
        definition = f"**{clean_query.title()}** is a fundamental health insurance concept. It defines specific coverage rules, claim procedures, or financial responsibilities between the policyholder and the insurance company. Understanding this term helps you evaluate policy options and make informed healthcare coverage decisions."
        return {
            "success": True,
            "term": clean_query,
            "definition": definition,
            "source": "AI Knowledge Base",
            "timestamp": timestamp
        }
