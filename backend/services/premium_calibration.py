import os
import logging

logger = logging.getLogger("health_insurance_api")

class IndianPremiumCalibrationService:
    def __init__(self):
        # Base calibration factor from environment variable (default 0.05 ~ 5% of raw US conversion)
        self.base_calibration_factor = float(os.getenv("PREMIUM_CALIBRATION_FACTOR", "0.05"))
        self.usd_to_inr_rate = float(os.getenv("USD_TO_INR_RATE", "85.0"))

    def calibrate(self, raw_usd_prediction: float, risk_level: str) -> dict:
        """
        Calibrate raw US dollar prediction into realistic Indian health insurance premium rates.
        Produces realistic Indian market ranges (typically ₹15,000–₹60,000/yr or ₹1,250–₹5,000/mo).
        Supports dynamic adjustment based on user risk profile.
        """
        # Dynamic risk adjustment multiplier based on profile risk level
        risk_level_clean = risk_level.lower()
        if risk_level_clean == 'low':
            risk_multiplier = 0.85
        elif risk_level_clean == 'high':
            risk_multiplier = 1.25
        else:
            risk_multiplier = 1.00

        effective_factor = self.base_calibration_factor * risk_multiplier

        # Convert USD prediction to INR base
        raw_inr = raw_usd_prediction * self.usd_to_inr_rate

        # Apply Indian Market Calibration
        annual_inr = round(raw_inr * effective_factor)
        
        # Floor / Ceiling safety bounds for realistic Indian annual premiums (₹12,000 to ₹90,000)
        annual_inr = max(12000, min(90000, annual_inr))
        monthly_inr = round(annual_inr / 12)

        return {
            "annual_premium": annual_inr,
            "monthly_premium": monthly_inr,
            "currency": "₹"
        }

# Global singleton instance
calibration_service = IndianPremiumCalibrationService()
