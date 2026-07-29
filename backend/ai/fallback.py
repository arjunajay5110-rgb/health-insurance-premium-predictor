"""
Offline Fallback Conversational Engine for Personal AI Health & Insurance Advisor
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("health_insurance_api")

class FallbackEngine:
    """Offline domain response generator providing highly personalized, conversational answers when Gemini API is unconfigured or unavailable."""

    def generate_response(self, query: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate a personalized, complete conversational answer based on user query and prediction context."""
        q = query.strip().lower()

        # Out-of-scope filter
        out_of_scope_keywords = ['ipl', 'cricket', 'football', 'movie', 'weather', 'president', 'capital', 'code', 'python', 'recipe', 'game', 'song', 'java', 'react']
        if any(kw in q for kw in out_of_scope_keywords):
            return "I am specialized specifically in health insurance, premium estimation, health risk metrics, and wellness guidance. Please ask me a question related to insurance policies, health scores, or health coaching!"

        # Extract user context metrics if available
        has_context = bool(context and isinstance(context, dict))
        snapshot = context.get("health_snapshot", {}) if has_context else {}
        summary = context.get("family_summary", {}) if has_context else {}

        annual = context.get("annual_premium", 27653) if has_context else 27653
        monthly = context.get("monthly_premium", 2304) if has_context else 2304

        age = snapshot.get("age", 35)
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")
        score = snapshot.get("health_score", 85)
        risk = snapshot.get("risk_level", "Low")
        children = snapshot.get("children", 0)

        is_smoker = smoker == 'yes'

        # 1. Weight Loss / 7-Day Plan / BMI Coaching
        if any(k in q for k in ['weight', 'lose weight', 'reduce weight', 'bmi', '7-day', '7 day', 'plan']):
            if has_context:
                intro = f"Based on your health assessment, your BMI is currently **{bmi}**, which falls into the **{bmi_status}** category. You're already doing great by being a non-smoker!" if not is_smoker else f"Based on your health assessment, your BMI is currently **{bmi}** ({bmi_status} category) and your Health Score is **{score}/100**."
            else:
                intro = "Managing weight safely is one of the most effective ways to support long-term wellness and lower insurance risk tiers."

            return f"""{intro}

Here is a structured **7-Day Weight Loss & Wellness Starter Plan** designed for your profile:

### 7-Day Weight Loss Starter Plan

- **Day 1–2 (Hydration & Baseline)**: Drink 3 liters of water daily. Replace sugary drinks with green tea or lemon water. Track your baseline daily steps (aim for 7,000 steps).
- **Day 3–4 (Nutrition Adjustment)**: Fill half your lunch and dinner plates with non-starchy vegetables. Incorporate lean protein (lentils, eggs, chicken, or tofu).
- **Day 5 (Active Cardio Focus)**: Complete a 30-minute brisk walk or light cycling session.
- **Day 6 (Strength & Mobility)**: Perform 15 minutes of bodyweight exercises (squats, wall push-ups, light core stretch).
- **Day 7 (Review & Sleep Optimization)**: Ensure 7–8 hours of quality sleep tonight. Review your energy levels and prepare meals for next week.

### Insurance & Underwriting Impact
Gradually reducing your BMI into the healthy range (18.5–24.9) will boost your **Health Score ({score}/100)** and qualify you for preferred underwriting rates during annual policy renewals.

*Note: This guidance is for educational purposes and should not replace advice from a qualified healthcare professional.*

What type of physical activity or exercise do you currently enjoy most?"""

        # 2. Premium Reduction / Explain Premium
        if any(k in q for k in ['explain my premium', 'reduce premium', 'why is my premium', 'lower premium', 'how is premium', 'too high']):
            if has_context:
                smoker_insight = "Since you are already a non-smoker, your biggest opportunity for optimization is maintaining a healthy BMI." if not is_smoker else "Quitting smoking is your single biggest opportunity—tobacco surcharges add up to 30-50% to premiums."
                intro = f"For your profile (Age: {age}, BMI: {bmi} - {bmi_status}, Health Score: {score}/100), your estimated rate is **₹{annual:,} / Year** (approx. **₹{monthly:,} / Month**). {smoker_insight}"
            else:
                intro = "Health insurance premiums are determined by a combination of age tiers, BMI, smoking status, family size, and region."

            return f"""{intro}

### Key Drivers for Your Profile

- **Body Mass Index ({bmi} - {bmi_status})**: Body Mass Index directly impacts underwriting risk tiers.
- **Age Tier ({age} Years)**: Medical inflation standards adjust by age brackets.
- **Smoking Status**: {'Non-smoker discount active.' if not is_smoker else 'Tobacco risk surcharge applied.'}

### 3 Action Steps to Reduce Premium Costs

1. **Improve Health Metrics**: A higher Health Score qualifies you for preferred wellness renewal discounts.
2. **Opt for Higher Voluntary Deductibles**: Choosing a small voluntary deductible lowers annual premiums by 10–20%.
3. **Consider Family Floater Coverage**: If insuring dependents, combining coverage under a floater plan yields multi-policy discounts.

Would you like me to explain how adding a deductible could reduce your annual rate?"""

        # 3. "Am I Healthy?" / Health Assessment
        if any(k in q for k in ['am i healthy', 'my score', 'health score', 'health status']):
            if has_context:
                return f"""Your latest **Health Score is {score} / 100**, which places your profile in the **{risk} Risk** tier ({bmi_status} BMI category).

You are doing very well with your non-smoker status! To move your Health Score closer to 90+, focusing on bringing your BMI into the 18.5–24.9 healthy range will produce the most significant impact.

Would you like a 30-day nutrition and exercise plan to help boost your Health Score?"""
            else:
                return "To evaluate your exact health score and risk tier, please calculate your premium prediction above so I can analyze your metrics!"

        # 4. Insurance Policy Selection / Comparison ("Which is better?")
        if any(k in q for k in ['which is better', 'what insurance', 'recommend insurance', 'policy choice', 'individual or family']):
            if has_context and (children > 0 or summary.get("total_members", 1) > 1):
                recommendation = "**Recommendation**: A **Family Floater Plan** is clearly better for your household."
                reason = f"Since you have {children + 1} family members listed, a Family Floater policy shares a single sum insured (e.g. ₹10 Lakhs) across all members at a significantly lower cost than buying separate policies."
                tradeoff = "Trade-off: A major illness by one member uses up part of the shared pool. However, for young families, the multi-policy savings outweigh separate policy costs."
            else:
                recommendation = "**Recommendation**: An **Individual Health Policy** is preferable."
                reason = f"At age {age} with single coverage, an Individual Policy provides a dedicated, unshared Sum Insured that cannot be exhausted by anyone else."
                tradeoff = "Trade-off: Higher cost if you plan to add dependents soon."

            return f"""{recommendation}

### Why This Choice Fits Your Profile
{reason}

### Trade-Off Comparison
- {tradeoff}
- **Alternative**: If you have senior parents over 60, keeping them on a separate Senior Citizen plan protects your primary family floater pool.

Are you looking for basic hospitalization coverage, or would you like to include maternity/critical illness riders?"""

        # 5. Deductible / Co-pay / Claims
        if any(k in q for k in ['deductible', 'copay', 'co-payment', 'waiting period', 'cashless']):
            return """### Cost-Sharing & Policy Terms Explained

- **Deductible**: The initial fixed amount (e.g., ₹10,000) you pay out-of-pocket before insurance coverage kicks in. Higher deductibles lower your annual premium.
- **Co-payment (Co-pay)**: A fixed percentage split of every claim bill (e.g., 10% co-pay). On a ₹1,00,000 bill, you pay ₹10,000 and insurer pays ₹90,000.
- **Waiting Period**: A 30-day initial window for general illnesses and 2–4 years for pre-existing conditions.

*Strategic Advice*: Voluntary deductibles are ideal if you have corporate insurance or emergency savings.

Would you like help deciding what deductible amount suits your budget?"""

        # 6. Default Fallback Response
        if has_context:
            return f"""Based on your active profile:
- **Health Score**: {score} / 100 ({risk} Risk)
- **BMI**: {bmi} ({bmi_status})
- **Estimated Premium**: ₹{annual:,} / Year

I can help you build a 7-day wellness plan, optimize your insurance premium, or compare policy options!

What specific goal would you like to work on today?"""
        else:
            return """I am Aegis AI, your Personal Health & Insurance Advisor! I can help you with wellness coaching, weight loss plans, insurance policy comparisons, and premium reduction strategies.

To give you deeply personalized guidance, please calculate your premium prediction above so I can analyze your health profile! What insurance or health question can I answer for you?"""
