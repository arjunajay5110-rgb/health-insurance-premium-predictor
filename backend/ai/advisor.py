import os
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime
from backend.ai.prompts import SYSTEM_PROMPT
from backend.ai.context import format_prediction_context

logger = logging.getLogger("health_insurance_api")

class AiAdvisorService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def chat(self, user_message: str, prediction_context: dict = None, history: list = None) -> dict:
        """Process chat message using Gemini LLM if API key is present, otherwise use Aegis AI conversational engine."""
        timestamp = datetime.now().strftime("%I:%M %p")
        context_str = format_prediction_context(prediction_context)

        # 1. Try Gemini LLM if GEMINI_API_KEY is available
        if self.api_key:
            try:
                reply = self._call_gemini_api(user_message, context_str, history)
                return {"success": True, "reply": reply, "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini API call failed: {str(e)}. Falling back to Aegis AI conversational engine.")

        # 2. Aegis AI Conversational Engine Fallback
        reply = self._aegis_conversational_engine(user_message, prediction_context)
        return {"success": True, "reply": reply, "timestamp": timestamp}

    def search_glossary_term(self, query: str) -> dict:
        """Search insurance term with Gemini or domain fallback if not in local glossary."""
        timestamp = datetime.now().strftime("%I:%M %p")
        
        system_instruction = """You are Aegis AI, an expert Health Insurance Glossary Advisor. Explain health insurance terms, concepts, and queries clearly and conversationally in 2 to 3 friendly, structured paragraphs.
STRICT DOMAIN RULE: ONLY answer questions related to health insurance, policy coverage, claims, nutrition, wellness, and medical terminology."""

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
        """Call Google Gemini REST API."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt_content = f"{SYSTEM_PROMPT}\n\n{context_str}\n\nCustomer Question: {user_message}"

        contents = []
        if history:
            for item in history[-6:]:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": item.get("content", "")}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt_content}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 800
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
            
        raise ValueError("Empty response from Gemini API")

    def _aegis_conversational_engine(self, msg: str, ctx: dict) -> str:
        """Emulate Aegis AI Persona in conversational voice when LLM key is omitted."""
        q = msg.strip().lower()

        # Out-of-scope filter for completely unrelated topics
        out_of_scope_keywords = ['ipl', 'cricket', 'football', 'movie', 'weather', 'president', 'capital', 'code', 'python', 'recipe', 'game', 'song']
        if any(kw in q for kw in out_of_scope_keywords):
            return "I'm designed specifically to assist with health insurance, premium estimations, nutrition, exercise, and long-term wellness. Feel free to ask me anything about your health profile or policy options!"

        # Extract prediction details if active
        has_ctx = ctx is not None and "health_snapshot" in ctx
        snapshot = ctx.get("health_snapshot", {}) if has_ctx else {}
        annual = ctx.get("annual_premium", 27653) if has_ctx else 27653
        monthly = ctx.get("monthly_premium", 2304) if has_ctx else 2304

        age = snapshot.get("age", 35)
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")
        risk = snapshot.get("risk_level", "Low")
        score = snapshot.get("health_score", 90)

        # Welcome Experience Intents
        if any(k in q for k in ['hi', 'hello', 'hey', 'start', 'welcome']):
            if has_ctx:
                smoker_note = "Your non-smoker status is keeping your risk profile in a great position." if smoker == 'no' else "Focusing on tobacco cessation can provide substantial long-term premium savings."
                return f"👋 Welcome back!\n\nI've reviewed your latest health insurance prediction, and I'm ready to help. Looking at your profile, your Health Score is currently **{score}/100** ({risk} Risk). {smoker_note}\n\nWhether you'd like to understand why your premium was estimated the way it was, improve your health profile, compare plans, or ask nutrition and fitness questions, I'm here for you. What would you like to explore today?"
            else:
                return "👋 Welcome!\n\nI'm Aegis AI, your personal Health & Insurance Advisor. Once you calculate your insurance premium, I'll use your health profile to provide personalized guidance.\n\nUntil then, I can answer general questions about:\n• Health insurance plans & floaters\n• Nutrition & healthy eating\n• Exercise & weight management\n• BMI & Health Score\n• Deductibles, co-pay & waiting periods\n\nWhat would you like to know?"

        # Health & Nutrition Questions
        if any(k in q for k in ['weight', 'lose weight', 'diet', 'nutrition', 'eat', 'protein']):
            bmi_advice = f"Since your BMI is currently **{bmi}** ({bmi_status}), " if has_ctx else ""
            return f"{bmi_advice}focusing on a balanced diet rich in whole grains, lean proteins, and fibrous vegetables is one of the most effective ways to optimize energy levels and long-term health.\n\nHere are three practical steps:\n1. **Prioritize Protein & Fiber**: Including protein (eggs, chicken, tofu, lentils) in every meal keeps you satiated and supports muscle retention.\n2. **Hydrate Consistently**: Drink 2.5 to 3 liters of water daily, especially before meals.\n3. **Mindful Portions**: Reducing processed sugars and refined carbs helps maintain steady blood sugar levels.\n\nCombined with regular physical activity, healthy nutrition can also improve your overall Health Score and lower future insurance underwriting risks!"

        if any(k in q for k in ['exercise', 'walk', 'workout', 'running', 'gym', 'fitness']):
            return f"Regular physical activity is a cornerstone of cardiovascular health and long-term wellness.\n\nIf you're building a routine:\n• **Brisk Walking**: 30 to 45 minutes of brisk daily walking (around 7,000–10,000 steps) significantly improves blood pressure and metabolic health.\n• **Strength Training**: 2 to 3 sessions per week helps preserve muscle mass and boosts metabolism.\n• **Consistency**: Aim for at least 150 minutes of moderate aerobic activity weekly.\n\n{('Your current health score of ' + str(score) + '/100 shows a strong foundation—keeping active will help maintain that excellent score!') if has_ctx else 'Consistency in daily movement is key!'}"

        # Premium Explanation & Analysis
        if any(k in q for k in ['explain my premium', 'why is my premium', 'calculate', 'how is premium']):
            is_smoker_text = "As a smoker, tobacco usage significantly increases health risk factors." if smoker == 'yes' else "As a non-smoker, you benefit from lower risk pricing."
            return f"Let's look at what shapes your estimated premium:\n\n• **Age ({age} Years)**: Age is a primary factor because medical utilization statistically increases over time.\n• **BMI ({bmi} - {bmi_status})**: Your Body Mass Index places you in the **{bmi_status}** category.\n• **Smoking Status**: {is_smoker_text}\n\nOverall, your profile yields a Health Score of **{score}/100** ({risk} Risk Level). Taking steps to optimize BMI and maintaining healthy lifestyle habits help ensure your long-term insurance rates stay as economical as possible."

        if 'deductible' in q:
            return "**What is a Deductible?**\n\nA **Deductible** is a fixed amount you pay out-of-pocket for covered medical bills before your insurance policy begins paying claims.\n\n*Why it matters*: Choosing a policy with a modest deductible (e.g., ₹10,000) significantly reduces your annual premium rate. If you already have corporate coverage, a high-deductible top-up plan is often the most cost-effective way to get high sum insured coverage."

        if 'co-payment' in q or 'copay' in q:
            return "**What is Co-payment (Co-pay)?**\n\nA **Co-payment** is a clause where you agree to share a fixed percentage (e.g. 10% or 20%) of every claim bill with the insurer.\n\n*Trade-off*: Co-pay policies cost less annually, but mean higher out-of-pocket expenses during hospitalization. For younger profiles, 0% co-pay plans are generally recommended for full peace of mind."

        if 'waiting period' in q:
            return "**Understanding Waiting Periods**\n\nA **Waiting Period** is the timeframe during which specific illnesses or pre-existing conditions are not yet covered.\n\n• **Initial Wait**: 30 days for general illnesses.\n• **Pre-existing Diseases (PED)**: Usually 2 to 4 years for conditions diagnosed prior to buying the policy.\n• **Specific Procedures**: 1 to 2 years for surgeries like cataract or hernia.\n\n*Recommendation*: Buying health insurance earlier in life lets you clear waiting periods while you are healthy!"

        return f"I'm here as your AI Health & Insurance Advisor!\n\nWhether you'd like advice on:\n• Optimizing your nutrition, BMI, or fitness routine\n• Understanding your premium estimate\n• Comparing individual vs family floater plans\n• Exploring insurance terms like deductibles or co-pay\n\nHow can I help you today?"

# Global singleton instance
ai_advisor_service = AiAdvisorService()
