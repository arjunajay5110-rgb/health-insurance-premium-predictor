import os
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime
from ai.prompts import SYSTEM_PROMPT
from ai.context import format_prediction_context

logger = logging.getLogger("health_insurance_api")

class AiAdvisorService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def chat(self, user_message: str, prediction_context: dict = None, history: list = None) -> dict:
        """
        Primary LLM Chat Pipeline:
        Passes user message, full conversation history, prediction context, and system prompt directly to Gemini LLM.
        Keyword interception is disabled. Fallback engine is invoked ONLY on API failure / missing key.
        """
        timestamp = datetime.now().strftime("%I:%M %p")
        context_str = format_prediction_context(prediction_context)

        # 1. Primary Path: Call Gemini LLM API directly
        if self.api_key:
            try:
                reply = self._call_gemini_api(user_message, context_str, history)
                return {"success": True, "reply": reply, "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini API call failed ({str(e)}). Using emergency fallback engine.")

        # 2. Emergency Fallback Engine (Used ONLY when LLM API is unavailable)
        reply = self._emergency_fallback_engine(user_message, prediction_context, history)
        return {"success": True, "reply": reply, "timestamp": timestamp}

    def search_glossary_term(self, query: str) -> dict:
        """Search insurance term with Gemini or domain fallback if not in local glossary."""
        timestamp = datetime.now().strftime("%I:%M %p")
        
        system_instruction = """You are Aegis AI, an expert Health Insurance Glossary Advisor. Explain health insurance terms, concepts, and queries clearly and conversationally in 2 to 3 friendly paragraphs.
STRICT DOMAIN RULE: Answer questions related to health insurance, policy coverage, claims, nutrition, wellness, and medical terminology."""

        if self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                prompt_content = f"{system_instruction}\n\nUser Search Query: {query}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": prompt_content}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 400}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return {"success": True, "term": query, "definition": parts[0].get("text", "").strip(), "source": "Gemini AI", "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini glossary search failed: {str(e)}")

        definition = f"**{query.title()}** is an important health insurance concept. In policy contracts, it defines coverage boundaries, claims processing rules, or financial cost-sharing between you and your insurer. Understanding this helps you pick the right coverage for your family."
        return {"success": True, "term": query, "definition": definition, "source": "Aegis AI Knowledge Base", "timestamp": timestamp}

    def _call_gemini_api(self, user_message: str, context_str: str, history: list = None) -> str:
        """Call Google Gemini REST API with full conversation history and system instructions."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

        # Combine System Instructions with Prediction Context
        full_system_prompt = f"{SYSTEM_PROMPT}\n\n[LATEST USER PREDICTION CONTEXT]:\n{context_str if context_str else 'No prediction context generated yet for this session.'}"

        contents = []
        
        # Build turn-by-turn multi-turn conversation history for LLM
        if history:
            for item in history[-10:]:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": item.get("content", "")}]})
        
        # Append current user query
        contents.append({"role": "user", "parts": [{"text": user_message}]})

        payload = {
            "systemInstruction": {
                "parts": [{"text": full_system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 850
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
            
        raise ValueError("Empty or invalid candidate response from Gemini API")

    def _emergency_fallback_engine(self, msg: str, ctx: dict, history: list = None) -> str:
        """Dynamic emergency fallback engine used ONLY when LLM API connection fails or key is unconfigured."""
        q = msg.strip().lower()
        has_ctx = ctx is not None and "health_snapshot" in ctx
        snapshot = ctx.get("health_snapshot", {}) if has_ctx else {}

        score = snapshot.get("health_score", 85)
        risk = snapshot.get("risk_level", "Low")
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")

        # Greeting intent
        if any(k in q for k in ['hi', 'hello', 'hey', 'start', 'welcome']):
            if has_ctx:
                return f"👋 Welcome back!\n\nI've reviewed your latest health assessment. Your current Health Score is **{score}/100** ({risk} Risk Level).\n\nWhether you'd like to explore your premium estimate, discuss nutrition and fitness goals, or compare insurance coverage options, I'm here to help. What would you like to focus on?"
            else:
                return "👋 Welcome!\n\nI'm Aegis AI, your personal Health & Insurance Advisor. Once you calculate your insurance premium, I'll use your profile details for personalized insights.\n\nIn the meantime, feel free to ask me general questions about health insurance, nutrition, exercise, floaters, or insurance terms. What can I help you with today?"

        # Nutrition / Diet / Weight Loss intent
        if any(k in q for k in ['eat', 'food', 'diet', 'nutrition', 'weight', 'lose weight', 'protein', 'calories']):
            bmi_ref = f"With your current BMI at **{bmi}** ({bmi_status}), " if has_ctx else ""
            return f"{bmi_ref}building sustainable nutrition habits is key to long-term health.\n\n• **Focus on Whole Foods**: Prioritize vegetables, fruits, whole grains, and lean proteins (chicken, fish, tofu, legumes).\n• **Protein Intake**: Including 20–30g of protein per meal supports muscle retention and satiety.\n• **Hydration & Caloric Balance**: Drinking plenty of water and minimizing sugar-sweetened beverages supports metabolic wellness."

        # Fitness / Exercise intent
        if any(k in q for k in ['exercise', 'walk', 'workout', 'running', 'steps', 'gym', 'fitness']):
            return f"Consistent daily movement is one of the most effective ways to support heart health and maintain a strong health score.\n\n• **Daily Walking**: Aim for 30–45 minutes of brisk walking (7,000–10,000 steps daily).\n• **Strength & Cardio**: Combining moderate aerobic exercise with 2 days of resistance training builds endurance and joint health."

        # Premium / Policy intent
        if any(k in q for k in ['premium', 'why', 'cost', 'calculate', 'explain']):
            smoker_note = "Your non-smoker status keeps your base rate favorable." if smoker == 'no' else "Smoking surcharges impact the overall estimate."
            return f"Your estimated insurance premium is evaluated based on key risk factors like age, BMI ({bmi}), and lifestyle metrics. {smoker_note} Maintaining a healthy lifestyle and exploring multi-policy floaters are great ways to keep long-term costs economical."

        # General response
        return f"I'm here to assist with all your health, wellness, and insurance questions.\n\nFeel free to ask about:\n• Nutrition, weight management, and fitness routines\n• Health insurance floaters, deductibles, and co-payment\n• Understanding your premium and health score\n\nWhat would you like to explore next?"

# Global singleton instance
ai_advisor_service = AiAdvisorService()
