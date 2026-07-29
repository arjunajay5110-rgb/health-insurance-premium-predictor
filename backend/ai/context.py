def format_prediction_context(ctx: dict) -> str:
    """
    Format the user's latest prediction as supporting context.

    This information is background knowledge only.
    The AI should answer the user's question first and use this
    profile only when it is relevant.
    """

    if not ctx:
        return (
            "No prediction has been generated for this session. "
            "If the user's question requires personalized advice, "
            "politely ask them to generate a prediction first."
        )

    snapshot = ctx.get("health_snapshot", {})

    annual = ctx.get("annual_premium", 0)
    monthly = ctx.get("monthly_premium", 0)

    return f"""
Latest User Health Profile (Background Information)

Use this profile ONLY when it helps answer the user's question.
Do NOT repeat these values unless they are directly relevant.

Age: {snapshot.get("age", "N/A")}
Gender: {snapshot.get("gender", "N/A")}
BMI: {snapshot.get("bmi", "N/A")} ({snapshot.get("bmi_status", "N/A")})
Health Score: {snapshot.get("health_score", "N/A")}/100
Health Status: {snapshot.get("health_status", "N/A")}
Risk Level: {snapshot.get("risk_level", "N/A")}
Smoking Status: {"Smoker" if snapshot.get("smoker") == "yes" else "Non-Smoker"}
Children: {snapshot.get("children", "N/A")}
Region: {snapshot.get("region", "N/A")}

Estimated Premium
• Annual: ₹{annual:,}
• Monthly: ₹{monthly:,}

Important Instructions:

- Answer the user's question first.
- Treat this profile as background knowledge.
- Mention only the values that are useful for the current question.
- Never repeat the entire profile.
- Never force the discussion back to BMI or premium unless relevant.
""".strip()