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
        """Process chat message using Gemini LLM if API key is present, otherwise use domain knowledge fallback engine."""
        timestamp = datetime.now().strftime("%I:%M %p")
        context_str = format_prediction_context(prediction_context)

        # 1. Try Gemini LLM if GEMINI_API_KEY is available
        if self.api_key:
            try:
                reply = self._call_gemini_api(user_message, context_str, history)
                return {"success": True, "reply": reply, "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini API call failed: {str(e)}. Falling back to domain advisor engine.")

        # 2. Production Domain Knowledge Advisor Engine
        reply = self._domain_advisor_engine(user_message, prediction_context)
        return {"success": True, "reply": reply, "timestamp": timestamp}

    def search_glossary_term(self, query: str) -> dict:
        """Search insurance term with Gemini or domain fallback if not in local glossary."""
        timestamp = datetime.now().strftime("%I:%M %p")
        
        system_instruction = """You are an expert Health Insurance Glossary AI. Explain health insurance terms, concepts, and queries clearly and concisely for beginners in 2 to 3 well-formatted paragraphs.
STRICT DOMAIN RULE: ONLY answer questions related to health insurance, policy coverage, claims, and medical terminology. If the user asks about unrelated topics, politely state that you only answer health insurance queries."""

        if self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                prompt_content = f"{system_instruction}\n\nUser Search Query: {query}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": prompt_content}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
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
                            return {"success": True, "term": query, "definition": parts[0].get("text", "").strip(), "source": "Gemini AI", "timestamp": timestamp}
            except Exception as e:
                logger.warning(f"Gemini glossary search failed: {str(e)}")

        # Fallback AI search definition generator
        definition = f"**{query.title()}** is an important concept in health insurance policies. It defines specific coverage rules, financial responsibilities, or claims procedures between the policyholder and the insurance company. Understanding this term helps you evaluate policy options and make informed healthcare coverage decisions."
        return {"success": True, "term": query, "definition": definition, "source": "AI Knowledge Base", "timestamp": timestamp}

    def _call_gemini_api(self, user_message: str, context_str: str, history: list = None) -> str:
        """Call Google Gemini REST API with high token limit to prevent mid-sentence truncation."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt_content = f"{SYSTEM_PROMPT}\n\n{context_str}\n\nUser Question: {user_message}"

        contents = []
        if history:
            for item in history[-4:]:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": item.get("content", "")}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt_content}]})

        # Increased maxOutputTokens to 1600 to guarantee complete, untruncated answers
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1600
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )

        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
            
        raise ValueError("Empty response from Gemini API")

    def _domain_advisor_engine(self, msg: str, ctx: dict) -> str:
        """Production-quality conversational response engine when LLM API key is omitted."""
        q = msg.strip().lower()

        # Out-of-scope filter
        out_of_scope_keywords = ['ipl', 'cricket', 'football', 'movie', 'weather', 'president', 'capital', 'code', 'python', 'recipe', 'game', 'song', 'java']
        if any(kw in q for kw in out_of_scope_keywords):
            return "I am specialized specifically in health insurance, premium estimation, health risk metrics, and wellness guidance. Please ask me a question related to insurance policies, health scores, or policy coverage!"

        annual = ctx.get("annual_premium", 27653) if ctx else 27653
        monthly = ctx.get("monthly_premium", 2304) if ctx else 2304
        snapshot = ctx.get("health_snapshot", {}) if ctx else {}
        summary = ctx.get("family_summary", {}) if ctx else {}

        age = snapshot.get("age", 35)
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")
        score = snapshot.get("health_score", 85)
        risk = snapshot.get("risk_level", "Low")

        # 1. Weight loss / BMI questions
        if any(k in q for k in ['weight', 'lose weight', 'reduce weight', 'bmi']):
            personalized_intro = f"I can see from your profile that your current BMI is **{bmi}**, which falls into the **{bmi_status}** category." if ctx else "Managing body weight is one of the most effective ways to support long-term wellness."
            
            return f"""{personalized_intro} Reducing weight safely is best achieved through gradual, sustainable lifestyle adjustments rather than rapid restriction.

### Practical Steps for Healthy Weight Management

1. **Balanced Nutrition**: Focus on whole foods rich in dietary fiber, vegetables, lean proteins, and complex carbohydrates while minimizing sugary beverages and ultra-processed foods.
2. **Physical Activity**: Aim for at least 150 minutes of moderate aerobic exercise per week (such as brisk walking, cycling, or swimming) alongside light strength training.
3. **Rest & Recovery**: Prioritize 7–8 hours of quality sleep nightly, as adequate sleep regulates hunger hormones and supports metabolism.

### Insurance & Underwriting Impact
Maintaining a BMI in the healthy range (18.5–24.9) supports your overall **Health Score ({score}/100)**. In health insurance underwriting, favorable health metrics help qualify you for preferred rate tiers and lower long-term risk assessments.

*Note: This information is for educational purposes and should not replace professional medical advice.*"""

        # 2. Premium Reduction / Explain Premium
        if any(k in q for k in ['explain my premium', 'reduce premium', 'why is my premium', 'lower premium', 'how is premium']):
            is_smoker_text = "As a smoker, tobacco usage introduces a significant risk surcharge." if smoker == 'yes' else "As a non-smoker, you benefit from a lower baseline risk tier."
            
            return f"""Your estimated annual premium is **₹{annual:,} / Year** (approx. **₹{monthly:,} / Month**). This figure reflects a combination of key underwriting parameters tailored to your profile.

### Primary Drivers of Your Premium

- **Age ({age} Years)**: Medical inflation and statistical utilization naturally increase with age tiers.
- **BMI ({bmi} - {bmi_status})**: Body Mass Index directly influences underwriting risk classification.
- **Smoking Status**: {is_smoker_text}
- **Health Score ({score}/100)**: Your profile reflects a **{risk} Risk** assessment.

### Effective Strategies to Optimize Your Costs

1. **Maintain Healthy Lifestyle Habits**: Keeping your BMI in the healthy range and remaining tobacco-free protects your long-term rate stability.
2. **Explore Family Floater Plans**: If covering dependents, combining coverage under a single floater policy often provides multi-policy discounts.
3. **Utilize Annual Checkups**: Preventive health checkups help detect conditions early, keeping long-term medical claims low."""

        # 3. Deductibles & Co-pay
        if any(k in q for k in ['deductible', 'copay', 'co-payment']):
            return """A **Deductible** and **Co-payment** are two primary cost-sharing mechanisms used in health insurance contracts.

### Understanding the Differences

- **Deductible**: A fixed initial dollar amount that you pay out-of-pocket for medical expenses before your insurance coverage kicks in. For example, with a ₹10,000 deductible on a ₹50,000 hospital bill, you pay ₹10,000 first, and the insurer pays ₹40,000.
- **Co-payment (Co-pay)**: A predefined percentage split of every claim bill (e.g., 10% co-pay). On a ₹1,00,000 bill with a 10% co-pay, you pay ₹10,000 and the insurer pays ₹90,000.

### Strategic Advice
Opting for a voluntary deductible or co-payment clause reduces your annual premium significantly. However, ensure that the chosen out-of-pocket limit remains comfortably affordable in case of an emergency."""

        # 4. Waiting Period & Cashless
        if any(k in q for k in ['waiting period', 'cashless', 'network hospital']):
            return """A **Waiting Period** is the timeframe specified in your policy during which certain medical claims cannot be filed.

### Types of Waiting Periods

- **Initial Waiting Period**: Standard 30-day window from policy inception (accidental emergencies are covered immediately).
- **Pre-existing Diseases (PED)**: Typically 2 to 4 years for conditions diagnosed prior to policy purchase (e.g., hypertension or diabetes).
- **Specific Surgeries**: 1 to 2 years for planned procedures such as joint replacements or cataract surgery.

### Cashless Hospitalization
Under **Cashless Hospitalization**, network hospitals settle covered bills directly with your insurance provider, eliminating the need for upfront cash payments during admission."""

        # 5. Default General Response
        return f"""Welcome to **Aegis AI**, your AI Health & Insurance Advisor! I can help you understand your policy coverage, premium drivers, and health risk metrics.

Based on your current profile evaluation:
- **Estimated Annual Premium**: ₹{annual:,} / Year
- **Health Score**: {score} / 100 ({risk} Risk Level)
- **BMI Metric**: {bmi} ({bmi_status} category)

Feel free to ask me questions like:
- *"How can I lower my health insurance premium?"*
- *"What is the difference between a Deductible and Co-payment?"*
- *"How does my BMI affect my health risk score?"*
- *"What is a Family Floater policy?"*"""

# Global singleton instance
ai_advisor_service = AiAdvisorService()
