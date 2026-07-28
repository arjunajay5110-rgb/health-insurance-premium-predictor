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
        """Process chat message using Gemini LLM if API key is present, otherwise use domain knowledge fallback engine."""
        timestamp = datetime.now().strftime("%I:%M %p")
        context_str = format_prediction_context(prediction_context)

        # 1. Try Gemini LLM if GEMINI_API_KEY is available
        if self.api_key:
            try:
                reply = self._call_gemini_api(user_message, context_str, history)
                return {"success": True, "reply": reply, "timestamp": timestamp}
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8")
                logger.error(f"Gemini HTTP {e.code}: {body}")
                raise
            except Exception as e:
                logger.error(f"Gemini Error: {str(e)}")
                raise
                

        # 2. Domain Knowledge Advisor Engine
        reply = self._domain_advisor_engine(user_message, prediction_context)
        return {"success": True, "reply": reply, "timestamp": timestamp}

    def search_glossary_term(self, query: str) -> dict:
        """Search insurance term with Gemini or domain fallback if not in local glossary."""
        timestamp = datetime.now().strftime("%I:%M %p")
        
        system_instruction = """You are an expert Health Insurance Glossary AI. Explain health insurance terms, concepts, and queries clearly and concisely for beginners in 2 to 4 bullet points or short paragraphs.
STRICT DOMAIN RULE: ONLY answer questions related to health insurance, policy coverage, claims, and medical terminology. If the user asks about unrelated topics (e.g. sports, movies, weather), politely state that you only answer health insurance questions."""

        if self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
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
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8")
                logger.error(f"Gemini Glossary HTTP {e.code}: {body}")
            except Exception as e:
                logger.error(f"Gemini Glossary Error: {str(e)}")

        # Fallback AI search definition generator
        definition = f"**{query.title()}** is a health insurance concept. In insurance policies, it defines coverage rules, claims procedures, or financial responsibility between the policyholder and the insurance provider. For official terms, refer to your policy schedule."
        return {"success": True, "term": query, "definition": definition, "source": "AI Knowledge Base", "timestamp": timestamp}

    def _call_gemini_api(self, user_message: str, context_str: str, history: list = None) -> str:
        """Call Google Gemini REST API."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        prompt_content = f"{SYSTEM_PROMPT}\n\n{context_str}\n\nUser Question: {user_message}"

        contents = []
        if history:
            for item in history[-4:]:
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

    def _domain_advisor_engine(self, msg: str, ctx: dict) -> str:
        """Domain-restricted intelligent response engine when LLM key is omitted."""
        q = msg.strip().lower()

        out_of_scope_keywords = ['ipl', 'cricket', 'football', 'movie', 'weather', 'president', 'capital', 'code', 'python', 'recipe', 'game', 'song']
        if any(kw in q for kw in out_of_scope_keywords):
            return "I'm designed specifically to assist with health insurance, premium estimation, and wellness guidance. Please ask me a question related to health insurance, insurance terms, or your premium estimate!"

        annual = ctx.get("annual_premium", 27653) if ctx else 27653
        monthly = ctx.get("monthly_premium", 2304) if ctx else 2304
        snapshot = ctx.get("health_snapshot", {}) if ctx else {}

        age = snapshot.get("age", 35)
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")
        children = snapshot.get("children", 1)
        risk = snapshot.get("risk_level", "Low")
        score = snapshot.get("health_score", 90)

        if any(k in q for k in ['explain my premium', 'why is my premium', 'calculate', 'how is premium']):
            is_smoker_text = "As a smoker, tobacco usage significantly increases health risk factors." if smoker == 'yes' else "As a non-smoker, you benefit from lower risk pricing."
            return f"""Here is a breakdown of your estimated premium (**₹{annual:,} / Year** or **₹{monthly:,} / Month**):

• **Age ({age} Years)**: Age is a primary factor as healthcare usage naturally increases with age.
• **BMI ({bmi} - {bmi_status})**: Your Body Mass Index places you in the **{bmi_status}** category.
• **Smoking Status**: {is_smoker_text}
• **Dependents ({children} Children)**: Family size affects the overall coverage scope.

*Overall Profile Assessment*: Your health score is **{score}/100** ({risk} Risk Level). Maintaining a healthy lifestyle helps keep long-term insurance costs stable."""

        if 'high' in q or 'reduce' in q:
            reasons = []
            if smoker == 'yes':
                reasons.append("Tobacco consumption (smoking adds up to 30-50% risk surcharge)")
            if bmi > 29.9:
                reasons.append(f"Higher BMI ({bmi} - Obese category)")
            if age >= 50:
                reasons.append(f"Age tier ({age} years)")

            reason_str = "\n• " + "\n• ".join(reasons) if reasons else "\n• Natural age tier & medical inflation standard range."
            return f"""Your premium is influenced by the following key metrics:{reason_str}

**Ways to optimize long-term health insurance costs**:
1. **Maintain a healthy BMI** through balanced nutrition & exercise.
2. **Avoid smoking & tobacco products** to qualify for non-smoker discount tiers.
3. **Opt for wellness add-ons** & annual preventive checkups.
4. **Choose higher deductibles** if you have corporate base coverage."""

        if 'deductible' in q:
            return """**What is a Deductible?**

A **Deductible** is a fixed amount you must pay out-of-pocket for medical expenses before your insurance company begins paying claims.

*Example*: If your policy has a ₹10,000 deductible and a covered hospital bill is ₹50,000, you pay ₹10,000 first, and the insurer pays the remaining ₹40,000. Higher deductibles result in lower annual premiums."""

        if 'co-payment' in q or 'copay' in q:
            return """**What is Co-payment (Co-pay)?**

A **Co-payment** is a fixed percentage of the total claim bill that you agree to share with the insurance company for every claim.

*Example*: If your policy has a 10% co-payment clause and your hospital bill is ₹1,00,000, you pay ₹10,000 and the insurer pays ₹90,000."""

        if 'waiting period' in q:
            return """**What is a Waiting Period?**

A **Waiting Period** is the duration during which specific illnesses or pre-existing conditions are not covered under the insurance policy.

• **Initial Waiting Period**: Typically 30 days from policy inception (except accident claims).
• **Pre-existing Diseases (PED)**: Usually 2 to 4 years for pre-existing conditions like diabetes or hypertension.
• **Specific Procedures**: 1 to 2 years for surgeries like hernia or joint replacement."""

        if 'cashless' in q:
            return """**What is Cashless Hospitalization?**

**Cashless Hospitalization** allows you to receive medical treatment at network hospitals without paying the medical bills directly out-of-pocket. The insurance company settles covered hospital expenses directly with the network hospital."""

        if 'family' in q or 'individual' in q:
            return """**Difference Between Individual & Family Floater Plans**:

• **Individual Plan**: Separate sum insured dedicated to a single person. Ideal for senior citizens or high-risk individuals.
• **Family Floater Plan**: A single shared sum insured covering the entire family (spouse, children). Most cost-effective for young families."""

        if 'bmi' in q:
            return f"""**Body Mass Index (BMI)** measures body fat based on height and weight.

• **Underweight**: < 18.5
• **Healthy Range**: 18.5 – 24.9
• **Overweight**: 25.0 – 29.9
• **Obese**: ≥ 30.0

*Your Current BMI*: **{bmi}** ({bmi_status}). Maintaining a BMI in the healthy range reduces cardiovascular and metabolic risk factors."""

        if 'smok' in q:
            return """**How Does Smoking Affect Health Insurance?**

Insurers classify smokers as higher-risk individuals due to increased probability of respiratory and cardiovascular conditions.

• **Premium Impact**: Smokers often pay **30% to 50% higher premiums** compared to non-smokers.
• **Benefit of Quitting**: Non-smokers enjoy lower premium rates and higher policy eligibility."""

        return f"""I am your AI Insurance Advisor! Based on your health profile:

• Estimated Annual Premium: **₹{annual:,}**
• Health Score: **{score}/100** ({risk} Risk)

You can ask me questions such as:
• *Why is my premium high?*
• *What is a deductible or co-payment?*
• *What is cashless hospitalization?*
• *How can I improve my health score?*"""

# Global singleton instance
ai_advisor_service = AiAdvisorService()
