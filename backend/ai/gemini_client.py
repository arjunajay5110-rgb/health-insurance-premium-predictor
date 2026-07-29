"""
Google Gemini REST API Client Module
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from backend.ai.prompts import SYSTEM_PROMPT, GLOSSARY_SYSTEM_PROMPT
from backend.ai.utils import clean_markdown, retry_on_failure

logger = logging.getLogger("health_insurance_api")

class GeminiClientError(Exception):
    """Custom exception raised when Gemini API calls fail."""
    pass

class GeminiClient:
    """Low-level client for Google Gemini Generate Content REST API."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.timeout = float(os.getenv("GEMINI_TIMEOUT", "12.0"))

    @property
    def is_configured(self) -> bool:
        """Return True if a valid GEMINI_API_KEY is present."""
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    @retry_on_failure(retries=2, delay=0.5, exceptions=(GeminiClientError,))
    def generate_chat_response(
        self,
        user_message: str,
        context_str: str,
        history: Optional[List[Dict[str, str]]] = None,
        max_tokens: int = 1600
    ) -> str:
        """Send chat request to Gemini REST API and return response string."""
        if not self.is_configured:
            raise GeminiClientError("GEMINI_API_KEY is not configured in environment.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        prompt_content = f"{SYSTEM_PROMPT}\n\n{context_str}\n\nUser Question: {user_message}"

        contents = []
        if history:
            for item in history:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": str(item.get("content", ""))}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt_content}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": max_tokens
            }
        }

        return self._execute_request(url, payload)

    @retry_on_failure(retries=2, delay=0.5, exceptions=(GeminiClientError,))
    def generate_glossary_response(self, query: str, max_tokens: int = 1000) -> str:
        """Send glossary definition query to Gemini REST API."""
        if not self.is_configured:
            raise GeminiClientError("GEMINI_API_KEY is not configured in environment.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        prompt_content = f"{GLOSSARY_SYSTEM_PROMPT}\n\nUser Search Query: {query}"

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt_content}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": max_tokens
            }
        }

        return self._execute_request(url, payload)

    def _execute_request(self, url: str, payload: Dict[str, Any]) -> str:
        """Execute HTTP POST request to Gemini REST API."""
        try:
            req_data = json.dumps(payload).encode('utf-8')
            request = urllib.request.Request(
                url,
                data=req_data,
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "").strip()
                        if text:
                            return clean_markdown(text)

            raise GeminiClientError("Received empty response payload from Gemini API.")

        except urllib.error.HTTPError as e:
            logger.error(f"Gemini API HTTPError code {e.code}")
            raise GeminiClientError(f"Gemini HTTPError {e.code}") from None
        except urllib.error.URLError as e:
            logger.error(f"Gemini API URLError: {str(e.reason)}")
            raise GeminiClientError(f"Gemini URLError: {str(e.reason)}") from None
        except Exception as e:
            logger.error(f"Gemini API Execution Error: {str(e)}")
            raise GeminiClientError(f"Gemini Error: {str(e)}") from None
