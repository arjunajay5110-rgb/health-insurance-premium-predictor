from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.ai.advisor import ai_advisor_service

router = APIRouter(prefix="/api/advisor", tags=["AI Advisor"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User chat question")
    prediction_context: Optional[Dict[str, Any]] = Field(default=None, description="User prediction context")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")

class GlossarySearchRequest(BaseModel):
    query: str = Field(..., description="Search query term")

@router.post("/chat")
def advisor_chat(payload: ChatRequest):
    """AI Insurance Advisor Chat Endpoint."""
    try:
        res = ai_advisor_service.chat(
            user_message=payload.message,
            prediction_context=payload.prediction_context,
            history=payload.history
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Advisor processing error: {str(e)}"
        )

@router.post("/glossary-search")
def glossary_search(payload: GlossarySearchRequest):
    """Smart Insurance Glossary Search (Gemini AI integration)."""
    try:
        res = ai_advisor_service.search_glossary_term(payload.query)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Glossary search error: {str(e)}"
        )
