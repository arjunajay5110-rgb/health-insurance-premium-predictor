"""
Offline Fallback Conversational Engine for AI Advisor
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("health_insurance_api")

class FallbackEngine:
    """Offline domain response generator providing conversational answers when Gemini API is unconfigured or unavailable."""

    def generate_response(self, query: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate a complete, structured conversational answer based on user query and prediction context."""
        q = query.strip().lower()

        # Out-of-scope filter
        out_of_scope_keywords = ['ipl', 'cricket', 'football', 'movie', 'weather', 'president', 'capital', 'code', 'python', 'recipe', 'game', 'song', 'java', 'react']
        if any(kw in q for kw in out_of_scope_keywords):
            return "I am specialized specifically in health insurance, premium estimation, health risk metrics, and wellness guidance. Please ask me a question related to insurance policies, health scores, or policy coverage!"

        # Extract user context metrics if available
        snapshot = context.get("health_snapshot", {}) if context else {}
        summary = context.get("family_summary", {}) if context else {}

        annual = context.get("annual_premium", 27653) if context else 27653
        monthly = context.get("monthly_premium", 2304) if context else 2304

        age = snapshot.get("age", 35)
        bmi = snapshot.get("bmi", 24.5)
        bmi_status = snapshot.get("bmi_status", "Healthy")
        smoker = snapshot.get("smoker", "no")
        score = snapshot.get("health_score", 85)
        risk = snapshot.get("risk_level", "Low")

        # 1. Weight Loss / BMI Questions
        if any(k in q for k in ['weight', 'lose weight', 'reduce weight', 'bmi']):
            personalized_intro = f"I can see from your profile that your current BMI is **{bmi}**, which falls into the **{bmi_status}** category." if context else "Managing body weight is one of the most effective ways to support long-term cardiovascular and metabolic health."
            
            return f"""{personalized_intro} Reducing weight safely is best achieved through gradual, sustainable lifestyle adjustments rather than rapid diet restrictions.

### Practical Steps for Healthy Weight Management

1. **Balanced Nutrition**: Focus on whole foods rich in dietary fiber, vegetables, lean proteins, and complex carbohydrates while minimizing sugary beverages and ultra-processed foods.
2. **Physical Activity**: Aim for at least 150 minutes of moderate aerobic exercise per week (such as brisk walking, cycling, or swimming) alongside light strength training.
3. **Rest & Recovery**: Prioritize 7–8 hours of quality sleep nightly, as adequate sleep regulates hunger hormones and supports metabolism.

### Insurance & Underwriting Impact
Maintaining a BMI in the healthy range (18.5–24.9) supports your overall **Health Score ({score}/100)**. In health insurance underwriting, favorable health metrics help qualify you for preferred rate tiers and lower long-term risk assessments.

*Note: This guidance is for educational purposes and should not replace professional medical advice.*"""

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

        # 3. Deductibles & Co-payment
        if any(k in q for k in ['deductible', 'copay', 'co-payment']):
            return """A **Deductible** and **Co-payment** are two primary cost-sharing mechanisms used in health insurance contracts.

### Understanding the Differences

- **Deductible**: A fixed initial dollar amount that you pay out-of-pocket for medical expenses before your insurance coverage kicks in. For example, with a ₹10,000 deductible on a ₹50,000 hospital bill, you pay ₹10,000 first, and the insurer pays ₹40,000.
- **Co-payment (Co-pay)**: A predefined percentage split of every claim bill (e.g., 10% co-pay). On a ₹1,00,000 bill with a 10% co-pay, you pay ₹10,000 and the insurer pays ₹90,000.

### Strategic Advice
Opting for a voluntary deductible or co-payment clause reduces your annual premium significantly. However, ensure that the chosen out-of-pocket limit remains comfortably affordable in case of an emergency."""

        # 4. Waiting Period & Cashless Hospitalization
        if any(k in q for k in ['waiting period', 'cashless', 'network hospital', 'claim']):
            return """A **Waiting Period** is the timeframe specified in your policy during which certain medical claims cannot be filed.

### Types of Waiting Periods

- **Initial Waiting Period**: Standard 30-day window from policy inception (accidental emergencies are covered immediately).
- **Pre-existing Diseases (PED)**: Typically 2 to 4 years for conditions diagnosed prior to policy purchase (e.g., hypertension or diabetes).
- **Specific Surgeries**: 1 to 2 years for planned procedures such as joint replacements or cataract surgery.

### Cashless Hospitalization
Under **Cashless Hospitalization**, network hospitals settle covered bills directly with your insurance provider, eliminating the need for upfront cash payments during admission."""

        # 5. Family Floater Questions
        if any(k in q for k in ['family', 'floater', 'parent', 'spouse', 'child']):
            num_members = summary.get("total_members", 2)
            subtotal = context.get("subtotal_annual_premium", annual) if context else annual
            discount = context.get("discount_amount", 0) if context else 0
            
            return f"""A **Family Floater Plan** provides a single shared sum insured that covers all enrolled family members under one unified premium policy.

### Key Benefits of Family Floater Coverage

- **Cost Efficiency**: Combining coverage for spouses, children, or parents is significantly more affordable than purchasing individual policies for every person.
- **Shared Coverage Limit**: If one family member requires hospitalization, they can utilize up to the full sum insured limit.
- **Multi-Policy Discounts**: Your family floater estimator applies a floater discount (e.g., saving ₹{discount:,} on a ₹{subtotal:,} subtotal for {num_members} members).

### Recommended Policy Configuration
Ensure that senior members (parents over 60) are evaluated carefully—in some cases, keeping senior parents on a dedicated policy protects the floater pool for younger family members."""

        # 6. Default Fallback Response
        return f"""I can help you understand your health insurance policy options, premium drivers, and health risk metrics.

Based on your current profile evaluation:
- **Estimated Annual Premium**: ₹{annual:,} / Year
- **Health Score**: {score} / 100 ({risk} Risk Level)
- **BMI Metric**: {bmi} ({bmi_status} category)

Feel free to ask me questions like:
- *"How can I lower my health insurance premium?"*
- *"What is the difference between a Deductible and Co-payment?"*
- *"How does my BMI affect my health risk score?"*
- *"What are the benefits of a Family Floater policy?"*"""
