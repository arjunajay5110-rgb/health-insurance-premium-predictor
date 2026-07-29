import logging
from typing import List, Dict, Any
from ml.prediction import prediction_engine
from services.premium_calibration import calibration_service

logger = logging.getLogger("health_insurance_api")

# Configurable Family Floater Discount Tiers
FAMILY_DISCOUNT_TIERS = {
    2: 0.05,   # 5% discount for 2 members
    3: 0.08,   # 8% discount for 3 members
    4: 0.10,   # 10% discount for 4 members
    5: 0.12,   # 12% discount for 5+ members
}

# Configurable Child Coverage Flat Base Rate (INR per child per year)
CHILD_FLAT_RATE_INR = 2500

class FamilyAggregationService:
    def __init__(self, discount_tiers: Dict[int, float] = None, child_rate: int = CHILD_FLAT_RATE_INR):
        self.discount_tiers = discount_tiers or FAMILY_DISCOUNT_TIERS
        self.child_rate = child_rate

    def get_discount_percentage(self, member_count: int) -> float:
        """Return discount percentage based on total family member count."""
        if member_count <= 1:
            return 0.0
        if member_count in self.discount_tiers:
            return self.discount_tiers[member_count]
        return self.discount_tiers.get(5, 0.12)  # Max discount tier for 5+ members

    def compute_health_metrics(self, age: int, bmi: float, smoker: str) -> Dict[str, Any]:
        """Compute Health Metrics (Status, Health Score 0-100, Risk Level)."""
        if bmi < 18.5:
            bmi_status = "Underweight"
            bmi_deduction = 15
        elif bmi <= 24.9:
            bmi_status = "Healthy"
            bmi_deduction = 0
        elif bmi <= 29.9:
            bmi_status = "Overweight"
            bmi_deduction = 10
        else:
            bmi_status = "Obese"
            bmi_deduction = 25

        smoker_deduction = 30 if smoker == 'yes' else 0
        age_deduction = 15 if age >= 50 else (5 if age >= 35 else 0)

        health_score = max(10, min(100, 100 - (bmi_deduction + smoker_deduction + age_deduction)))

        if health_score >= 90:
            health_status = "Excellent"
        elif health_score >= 75:
            health_status = "Good"
        elif health_score >= 60:
            health_status = "Moderate"
        else:
            health_status = "Needs Attention"

        if smoker == 'yes' or bmi > 29.9 or bmi < 18.5 or age >= 55:
            risk_level = "High" if (smoker == 'yes' and bmi > 29.9) else "Moderate"
        else:
            risk_level = "Low"

        return {
            "bmi_status": bmi_status,
            "health_score": health_score,
            "health_status": health_status,
            "risk_level": risk_level
        }

    def generate_wellness_suggestions(self, bmi_status: str, smoker: str, risk_level: str, age: int) -> List[str]:
        """Generate member-specific wellness suggestions."""
        tips = []
        if smoker == 'yes':
            tips.append("🚭 Tobacco Cessation: Quitting smoking can reduce individual premium rates by up to 35%.")
        if bmi_status == "Obese":
            tips.append("🥗 Weight Management: Consult a nutritionist to aim for a healthy BMI (18.5-24.9).")
        elif bmi_status == "Overweight":
            tips.append("🚶 Active Lifestyle: 30 minutes of daily brisk walking can help normalize BMI.")
        if age >= 50:
            tips.append("🩺 Preventive Screening: Schedule annual comprehensive health and cardiac screenings.")
        if not tips:
            tips.append("✨ Excellent Health Maintenance: Continue balanced nutrition, hydration, and regular exercise.")
        return tips

    def process_family_floater(self, members: List[Dict[str, Any]], policy_region: str = "southeast") -> Dict[str, Any]:
        """Independent ML prediction per adult member + transparent Floater Discount aggregation."""
        if not members:
            raise ValueError("At least one family member is required.")

        member_results = []
        total_individual_subtotal = 0
        total_scores = 0
        total_ages = 0
        total_bmis = 0
        num_smokers = 0
        num_healthy = 0
        influence_insights = []

        # 1. Predict each member independently
        for m in members:
            name = m.get("name", "Member")
            rel = m.get("relationship", "Primary")
            age = int(m.get("age", 35))
            gender = str(m.get("gender", "female")).lower()
            smoker = str(m.get("smoker", "no")).lower()
            height_cm = float(m.get("height_cm", 170.0))
            weight_kg = float(m.get("weight_kg", 70.0))
            num_children = int(m.get("children", 0))
            mem_region = str(m.get("region", policy_region)).lower()
            is_child = rel.lower() == "child" or age < 18

            # Resolve BMI
            if is_child:
                calc_bmi = round(weight_kg / ((height_cm / 100.0) ** 2), 2) if height_cm and weight_kg else 18.5
            else:
                calc_bmi = round(weight_kg / ((height_cm / 100.0) ** 2), 2)

            metrics = self.compute_health_metrics(age, calc_bmi, smoker)

            # Determine individual premium
            if is_child:
                # Pediatric coverage flat rate
                indiv_annual_inr = self.child_rate
                indiv_monthly_inr = round(indiv_annual_inr / 12)
            else:
                # Run adult ML model prediction independently
                raw_usd = prediction_engine.predict_raw_usd(
                    age=age,
                    gender=gender,
                    bmi=calc_bmi,
                    children=num_children,
                    smoker=smoker,
                    region=mem_region
                )
                calibrated = calibration_service.calibrate(raw_usd, metrics["risk_level"])
                indiv_annual_inr = calibrated["annual_premium"]
                indiv_monthly_inr = calibrated["monthly_premium"]

            total_individual_subtotal += indiv_annual_inr
            total_scores += metrics["health_score"]
            total_ages += age
            total_bmis += calc_bmi

            if smoker == 'yes':
                num_smokers += 1

            if metrics["bmi_status"] == "Healthy" and smoker == 'no':
                num_healthy += 1

            wellness = self.generate_wellness_suggestions(metrics["bmi_status"], smoker, metrics["risk_level"], age)

            member_results.append({
                "name": name,
                "relationship": rel,
                "age": age,
                "gender": gender,
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "bmi": calc_bmi,
                "bmi_status": metrics["bmi_status"],
                "smoker": smoker,
                "is_child": is_child,
                "children": num_children,
                "region": mem_region,
                "risk_level": metrics["risk_level"],
                "health_score": metrics["health_score"],
                "health_status": metrics["health_status"],
                "wellness_suggestions": wellness,
                "individual_annual_inr": indiv_annual_inr,
                "individual_monthly_inr": indiv_monthly_inr,
            })

        # 2. Family Floater Discount & Final Premium Calculation
        member_count = len(member_results)
        discount_pct = self.get_discount_percentage(member_count)
        discount_amount = round(total_individual_subtotal * discount_pct)
        final_annual_inr = round(total_individual_subtotal - discount_amount)
        final_monthly_inr = round(final_annual_inr / 12)

        avg_score = round(total_scores / member_count)
        avg_age = round(total_ages / member_count, 1)
        avg_bmi = round(total_bmis / member_count, 1)

        # Sort members by individual annual premium descending
        sorted_members = sorted(member_results, key=lambda x: x["individual_annual_inr"], reverse=True)
        highest_risk_name = f"{sorted_members[0]['relationship']} ({sorted_members[0]['name']})"

        has_high_risk = any(x["risk_level"] == "High" for x in member_results)
        overall_risk = "High" if has_high_risk else ("Moderate" if avg_score < 80 else "Low")

        # 3. Premium Influence Insights
        if num_smokers > 0:
            influence_insights.append(f"{num_smokers} member(s) are smokers, which increases individual risk surcharges.")
        obese_members = [m['name'] for m in member_results if m['bmi_status'] == 'Obese']
        if obese_members:
            influence_insights.append(f"{len(obese_members)} member(s) ({', '.join(obese_members)}) are in the Obese BMI category.")
        older_members = [m['name'] for m in member_results if m['age'] >= 50]
        if older_members:
            influence_insights.append(f"{len(older_members)} member(s) are above 50 years of age.")
        if num_healthy > 0:
            influence_insights.append(f"{num_healthy} member(s) have a Healthy BMI & non-smoker status, helping lower overall rates.")
        if discount_amount > 0:
            influence_insights.append(f"Family Floater Discount saved ₹{discount_amount:,} ({int(discount_pct*100)}% off subtotal).")

        return {
            "success": True,
            "policy_type": "Family Floater",
            "annual_premium": final_annual_inr,
            "monthly_premium": final_monthly_inr,
            "subtotal_annual_premium": total_individual_subtotal,
            "discount_percentage": int(discount_pct * 100),
            "discount_amount": discount_amount,
            "currency": "₹",
            "family_summary": {
                "total_members": member_count,
                "average_age": avg_age,
                "average_bmi": avg_bmi,
                "num_smokers": num_smokers,
                "num_healthy": num_healthy,
                "members": sorted_members,
                "highest_risk_member": highest_risk_name,
                "average_health_score": avg_score,
                "overall_family_risk": overall_risk,
                "influence_insights": influence_insights
            }
        }

family_aggregation_service = FamilyAggregationService()
