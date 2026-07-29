import math
import logging
from typing import List, Dict, Any
try:
    from backend.ml.prediction import prediction_engine
    from backend.services.premium_calibration import calibration_service
except ModuleNotFoundError:
    from ml.prediction import prediction_engine
    from services.premium_calibration import calibration_service

logger = logging.getLogger("health_insurance_api")

# Configurable Family Floater Discount Factors
FLOATER_DISCOUNT_RATES = {
    2: 0.04,  # 4% discount for 2 members
    3: 0.07,  # 7% discount for 3 members
    4: 0.09,  # 9% discount for 4 members
    "default_5_plus": 0.12  # 12% discount for 5+ members
}

CHILD_LOADING_FACTOR = 0.08  # 8% of primary applicant's premium per child

class FamilyAggregationService:
    def calculate_family_floater(self, members: List[Dict[str, Any]], region: str) -> Dict[str, Any]:
        """
        Step 1: Predict each adult member independently using ML engine + calibration layer.
        Step 2: Compute Subtotal (Sum of individual premiums).
        Step 3: Apply Family Floater Discount based on member count & child loading.
        Step 4: Generate transparent calculation breakdown & premium influence factors.
        """
        adult_results = []
        child_results = []
        total_health_score = 0
        total_age = 0
        total_bmi = 0
        num_smokers = 0
        num_healthy_bmi = 0
        high_risk_reasons = []

        # Find primary member base for child calculation
        primary_member = next((m for m in members if m.get("relationship") == "Primary"), members[0])
        
        # Calculate Primary adult individual premium for reference
        primary_bmi = primary_member.get("bmi") or self._calc_bmi(primary_member.get("height_cm"), primary_member.get("weight_kg"))
        primary_metrics = self._compute_metrics(primary_member.get("age", 35), primary_bmi, primary_member.get("smoker", "no"))
        primary_raw_usd = prediction_engine.predict_raw_usd(
            age=primary_member.get("age", 35),
            gender=primary_member.get("gender", "male"),
            bmi=primary_bmi,
            children=0,
            smoker=primary_member.get("smoker", "no"),
            region=region
        )
        primary_calibrated = calibration_service.calibrate(primary_raw_usd, primary_metrics["risk_level"])
        primary_annual_inr = primary_calibrated["annual_premium"]

        for m in members:
            age = m.get("age", 30)
            is_child = age < 18 or m.get("relationship") == "Child"

            h = m.get("height_cm") or 170.0
            w = m.get("weight_kg") or 70.0
            calc_bmi = m.get("bmi") or self._calc_bmi(h, w)

            smoker = m.get("smoker", "no")
            gender = m.get("gender", "male")
            rel = m.get("relationship", "Member")
            name = m.get("name", rel)

            metrics = self._compute_metrics(age, calc_bmi, smoker)
            total_health_score += metrics["health_score"]
            total_age += age
            total_bmi += calc_bmi

            if smoker == "yes":
                num_smokers += 1
                high_risk_reasons.append(f"{name} ({rel}) is a smoker.")
            if metrics["bmi_status"] == "Healthy" and smoker == "no":
                num_healthy_bmi += 1
            if metrics["bmi_status"] == "Obese":
                high_risk_reasons.append(f"{name} ({rel}) is in the Obese BMI category ({calc_bmi}).")
            if age >= 50:
                high_risk_reasons.append(f"{name} ({rel}) is above 50 years of age ({age} yrs).")

            if is_child:
                # Children use pediatric loading rate (8% of primary adult rate)
                child_annual_inr = round(primary_annual_inr * CHILD_LOADING_FACTOR)
                child_results.append({
                    "name": name,
                    "relationship": rel,
                    "age": age,
                    "gender": gender,
                    "height_cm": h,
                    "weight_kg": w,
                    "bmi": calc_bmi,
                    "bmi_status": metrics["bmi_status"],
                    "smoker": smoker,
                    "health_score": metrics["health_score"],
                    "risk_level": metrics["risk_level"],
                    "health_status": metrics["health_status"],
                    "individual_annual_inr": child_annual_inr,
                    "is_child": True
                })
            else:
                # Adult member runs independent ML model prediction
                raw_usd = prediction_engine.predict_raw_usd(
                    age=age,
                    gender=gender,
                    bmi=calc_bmi,
                    children=0,
                    smoker=smoker,
                    region=region
                )
                calibrated = calibration_service.calibrate(raw_usd, metrics["risk_level"])
                adult_results.append({
                    "name": name,
                    "relationship": rel,
                    "age": age,
                    "gender": gender,
                    "height_cm": h,
                    "weight_kg": w,
                    "bmi": calc_bmi,
                    "bmi_status": metrics["bmi_status"],
                    "smoker": smoker,
                    "health_score": metrics["health_score"],
                    "risk_level": metrics["risk_level"],
                    "health_status": metrics["health_status"],
                    "individual_annual_inr": calibrated["annual_premium"],
                    "is_child": False
                })

        all_member_results = adult_results + child_results

        # Step 2: Sum Individual Premiums (Subtotal)
        subtotal_inr = sum(item["individual_annual_inr"] for item in all_member_results)

        # Step 3: Determine Family Floater Discount Percentage
        total_member_count = len(all_member_results)
        if total_member_count in FLOATER_DISCOUNT_RATES:
            discount_rate = FLOATER_DISCOUNT_RATES[total_member_count]
        elif total_member_count >= 5:
            discount_rate = FLOATER_DISCOUNT_RATES["default_5_plus"]
        else:
            discount_rate = 0.0

        discount_amount_inr = round(subtotal_inr * discount_rate)
        final_annual_inr = round(subtotal_inr - discount_amount_inr)
        final_monthly_inr = round(final_annual_inr / 12)

        # Aggregated Family Analytics
        avg_health_score = round(total_health_score / total_member_count)
        avg_age = round(total_age / total_member_count, 1)
        avg_bmi = round(total_bmi / total_member_count, 1)

        highest_risk_mem = max(all_member_results, key=lambda x: x["individual_annual_inr"])
        highest_risk_desc = f"{highest_risk_mem['relationship']} ({highest_risk_mem['name']})"

        has_high_risk = any(m["risk_level"] == "High" for m in all_member_results)
        overall_family_risk = "High" if has_high_risk else ("Moderate" if avg_health_score < 80 else "Low")

        # Premium Influence Insights
        influence_insights = []
        if high_risk_reasons:
            influence_insights.extend(high_risk_reasons[:3])
        if num_healthy_bmi > 0:
            influence_insights.append(f"{num_healthy_bmi} member(s) have Healthy BMI, keeping baseline rates favorable.")
        if discount_amount_inr > 0:
            influence_insights.append(f"Family Floater Multi-Policy Discount reduced total premium by ₹{discount_amount_inr:,} ({int(discount_rate * 100)}%).")

        return {
            "success": True,
            "policy_type": "Family Floater",
            "annual_premium": final_annual_inr,
            "monthly_premium": final_monthly_inr,
            "subtotal_annual_premium": subtotal_inr,
            "discount_amount": discount_amount_inr,
            "discount_percentage": int(discount_rate * 100),
            "currency": "₹",
            "family_summary": {
                "total_members": total_member_count,
                "average_age": avg_age,
                "average_bmi": avg_bmi,
                "num_smokers": num_smokers,
                "num_healthy": num_healthy_bmi,
                "members": all_member_results,
                "highest_risk_member": highest_risk_desc,
                "average_health_score": avg_health_score,
                "overall_family_risk": overall_family_risk,
                "influence_insights": influence_insights
            }
        }

    def _calc_bmi(self, height_cm: float, weight_kg: float) -> float:
        h = height_cm or 170.0
        w = weight_kg or 70.0
        return round(w / ((h / 100.0) ** 2), 2)

    def _compute_metrics(self, age: int, bmi: float, smoker: str) -> dict:
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

        smoker_deduction = 30 if smoker == "yes" else 0
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

        if smoker == "yes" or bmi > 29.9 or bmi < 18.5 or age >= 55:
            risk_level = "High" if (smoker == "yes" and bmi > 29.9) else "Moderate"
        else:
            risk_level = "Low"

        return {
            "bmi_status": bmi_status,
            "health_score": health_score,
            "health_status": health_status,
            "risk_level": risk_level
        }

family_aggregation_service = FamilyAggregationService()
