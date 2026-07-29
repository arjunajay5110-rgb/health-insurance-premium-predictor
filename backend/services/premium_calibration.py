import os
import logging

logger = logging.getLogger("health_insurance_api")

# Module-level default constants
DEFAULT_CALIBRATION_FACTOR = float(os.getenv("PREMIUM_CALIBRATION_FACTOR", "0.05"))
DEFAULT_USD_TO_INR_RATE = float(os.getenv("USD_TO_INR_RATE", "85.0"))

class IndianPremiumCalibrationService:
    def __init__(self):
        self.base_calibration_factor = DEFAULT_CALIBRATION_FACTOR
        self.usd_to_inr_rate = DEFAULT_USD_TO_INR_RATE

    def calibrate(self, raw_usd_prediction: float, risk_level: str) -> dict:
        """
        Calibrate raw US dollar prediction into realistic Indian health insurance premium rates.
        Produces realistic Indian market ranges (typically ₹15,000–₹60,000/yr or ₹1,250–₹5,000/mo).
        Supports dynamic adjustment based on user risk profile.
        """
        base_factor = getattr(self, 'base_calibration_factor', DEFAULT_CALIBRATION_FACTOR)
        inr_rate = getattr(self, 'usd_to_inr_rate', DEFAULT_USD_TO_INR_RATE)

        # Dynamic risk adjustment multiplier based on profile risk level
        risk_level_clean = str(risk_level).lower() if risk_level else 'low'
        if risk_level_clean == 'low':
            risk_multiplier = 0.85
        elif risk_level_clean == 'high':
            risk_multiplier = 1.25
        else:
            risk_multiplier = 1.00

        effective_factor = base_factor * risk_multiplier

        # Convert USD prediction to INR base
        raw_inr = raw_usd_prediction * inr_rate

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
