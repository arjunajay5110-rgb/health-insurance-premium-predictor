"""
Prediction Context Formatter for AI Advisor
"""

from typing import Dict, Any, Optional

def format_prediction_context(ctx: Optional[Dict[str, Any]] = None) -> str:
    """Format user prediction context into a detailed, readable block for system prompts."""
    if not ctx or not isinstance(ctx, dict):
        return "PREDICTION CONTEXT: No active prediction generated yet. (Mode: Pre-prediction general insurance QA)."

    # Family Floater Context
    if ctx.get("policy_type") == "Family Floater" or "family_summary" in ctx:
        summary = ctx.get("family_summary", {})
        members = summary.get("members", [])
        member_str_list = [
            f"- {m.get('name', 'Member')} ({m.get('relationship', 'Member')}): Age {m.get('age', 'N/A')}, BMI {m.get('bmi', 'N/A')} ({m.get('bmi_status', 'N/A')}), {str(m.get('smoker', 'no')).upper()} smoker, Health Score {m.get('health_score', 'N/A')}/100"
            for m in members
        ]
        members_formatted = "\n".join(member_str_list) if member_str_list else "None specified"

        return f"""CURRENT FAMILY FLOATER PREDICTION CONTEXT:
- Policy Type: Family Floater Plan
- Total Insured Members: {summary.get('total_members', len(members))}
- Final Annual Premium: ₹{ctx.get('annual_premium', 0):,} INR
- Final Monthly Premium: ₹{ctx.get('monthly_premium', 0):,} INR
- Base Subtotal: ₹{ctx.get('subtotal_annual_premium', ctx.get('annual_premium', 0)):,} INR
- Floater Discount: ₹{ctx.get('discount_amount', 0):,} INR ({ctx.get('discount_percentage', 0)}% Multi-Policy Discount)
- Average Family Health Score: {summary.get('average_health_score', 80)} / 100
- Overall Family Risk Level: {summary.get('overall_family_risk', 'Low')}
- Highest Risk Member: {summary.get('highest_risk_member', 'N/A')}
- Enrolled Family Members Detail:
{members_formatted}"""

    # Individual Context
    snapshot = ctx.get("health_snapshot", {})
    inputs = ctx.get("inputs", {})

    age = snapshot.get("age", inputs.get("age", 35))
    gender = snapshot.get("gender", inputs.get("gender", "female"))
    bmi = snapshot.get("bmi", inputs.get("bmi", 24.5))
    bmi_status = snapshot.get("bmi_status", "Healthy")
    smoker = snapshot.get("smoker", inputs.get("smoker", "no"))
    children = snapshot.get("children", inputs.get("children", 0))
    region = snapshot.get("region", inputs.get("region", "southeast"))
    score = snapshot.get("health_score", 85)
    health_status = snapshot.get("health_status", "Good")
    risk_level = snapshot.get("risk_level", "Low")
    annual = ctx.get("annual_premium", 0)
    monthly = ctx.get("monthly_premium", 0)

    return f"""CURRENT INDIVIDUAL PREDICTION CONTEXT:
- Policy Type: Individual Plan
- Estimated Annual Premium: ₹{annual:,} INR
- Estimated Monthly Premium: ₹{monthly:,} INR
- Age: {age} years
- Gender: {str(gender).capitalize()}
- BMI: {bmi} ({bmi_status} category)
- Smoking Status: {'Smoker' if str(smoker).lower() == 'yes' else 'Non-Smoker'}
- Dependents / Children: {children}
- Geographic Region: {str(region).capitalize()}
- Health Score: {score} / 100 ({health_status})
- Profile Risk Level: {risk_level} Risk"""
