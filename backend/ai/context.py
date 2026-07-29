def format_prediction_context(ctx: dict) -> str:
    """Format user's latest prediction context into a readable string for the AI system prompt."""
    if not ctx:
        return "No prediction has been generated yet for this session."

    annual = ctx.get("annual_premium", 0)
    monthly = ctx.get("monthly_premium", 0)
    snapshot = ctx.get("health_snapshot", {})

    age = snapshot.get("age", "N/A")
    gender = snapshot.get("gender", "N/A")
    bmi = snapshot.get("bmi", "N/A")
    bmi_status = snapshot.get("bmi_status", "N/A")
    smoker = snapshot.get("smoker", "N/A")
    children = snapshot.get("children", "N/A")
    region = snapshot.get("region", "N/A")
    risk = snapshot.get("risk_level", "N/A")
    score = snapshot.get("health_score", "N/A")
    health_status = snapshot.get("health_status", "N/A")

    return f"""
CURRENT USER PREDICTION CONTEXT:
- Estimated Annual Premium: ₹{annual:,} / year
- Estimated Monthly Premium: ₹{monthly:,} / month
- Health Score: {score}/100 ({health_status})
- Risk Level: {risk}
- Age: {age} Years
- Gender: {gender}
- BMI: {bmi} ({bmi_status})
- Smoking Status: {'Smoker' if smoker == 'yes' else 'Non-Smoker'}
- Children / Dependents: {children}
- Region: {region}
""".strip()
