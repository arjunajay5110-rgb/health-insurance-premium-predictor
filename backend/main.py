import os
import time
import logging
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("health_insurance_api")

app = FastAPI(
    title="Health Insurance Premium Predictor API",
    description="Production backend API for predicting annual health insurance premiums using LightGBM",
    version="1.2.0"
)

# CORS Configuration using environment variables
allowed_origin_env = os.getenv("ALLOWED_ORIGIN", "*")
allowed_origins = [origin.strip() for origin in allowed_origin_env.split(",")] if allowed_origin_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for ML artifacts (loaded ONLY ONCE during startup)
model = None
scaler = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "insurance_lightgbm_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "insurance_scaler.pkl")

# Configurable Exchange Rates
usd_to_inr_rate = float(os.getenv("DEFAULT_EXCHANGE_RATE_USD_TO_INR", "85.0"))

EXCHANGE_RATES = {
    "USD": {"rate": 1.0, "symbol": "$", "flag": "🇺🇸", "name": "USD ($)"},
    "INR": {"rate": usd_to_inr_rate, "symbol": "₹", "flag": "🇮🇳", "name": "INR (₹)"},
    "EUR": {"rate": 0.92, "symbol": "€", "flag": "🇪🇺", "name": "EUR (€)"},
    "GBP": {"rate": 0.79, "symbol": "£", "flag": "🇬🇧", "name": "GBP (£)"},
    "AED": {"rate": 3.67, "symbol": "د.إ", "flag": "🇦🇪", "name": "AED (د.إ)"},
    "CAD": {"rate": 1.37, "symbol": "C$", "flag": "🇨🇦", "name": "CAD (C$)"},
    "AUD": {"rate": 1.53, "symbol": "A$", "flag": "🇦🇺", "name": "AUD (A$)"},
    "SGD": {"rate": 1.34, "symbol": "S$", "flag": "🇸🇬", "name": "SGD (S$)"},
    "JPY": {"rate": 155.0, "symbol": "¥", "flag": "🇯🇵", "name": "JPY (¥)"},
}

@app.on_event("startup")
def load_ml_artifacts():
    """Load LightGBM model and StandardScaler ONCE into global memory during FastAPI startup."""
    global model, scaler
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            logger.info("Successfully loaded LightGBM model and StandardScaler ONCE during application startup.")
        else:
            logger.error(f"Artifact files missing: {MODEL_PATH} or {SCALER_PATH}")
    except Exception as e:
        logger.error(f"Failed to load ML artifacts: {str(e)}")

class PredictRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age in years (18-100)")
    gender: str = Field(..., description="Gender: 'female' or 'male'")
    smoker: str = Field(..., description="Smoker status: 'yes' or 'no'")
    region: str = Field(..., description="Region: 'northeast', 'northwest', 'southeast', or 'southwest'")
    children: int = Field(..., ge=0, le=10, description="Number of children/dependents (0-10)")
    bmi: Optional[float] = Field(None, ge=10.0, le=70.0, description="Body Mass Index")
    height_cm: Optional[float] = Field(None, ge=50.0, le=250.0, description="Height in centimeters")
    weight_kg: Optional[float] = Field(None, ge=20.0, le=300.0, description="Weight in kilograms")

    @validator('gender')
    def validate_gender(cls, v):
        v_clean = v.strip().lower()
        if v_clean not in ['female', 'male']:
            raise ValueError("Gender must be 'female' or 'male'")
        return v_clean

    @validator('smoker')
    def validate_smoker(cls, v):
        v_clean = v.strip().lower()
        if v_clean not in ['yes', 'no']:
            raise ValueError("Smoker status must be 'yes' or 'no'")
        return v_clean

    @validator('region')
    def validate_region(cls, v):
        v_clean = v.strip().lower()
        valid_regions = ['northeast', 'northwest', 'southeast', 'southwest']
        if v_clean not in valid_regions:
            raise ValueError(f"Region must be one of {valid_regions}")
        return v_clean

@app.get("/api/health")
def health_check():
    """Endpoint for load balancer health monitoring."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "version": "1.2.0"
    }

@app.post("/api/predict")
def predict_premium(payload: PredictRequest):
    """Predict annual health insurance premium using the loaded LightGBM regressor."""
    start_time = time.time()
    logger.info(f"Prediction request: age={payload.age}, gender={payload.gender}, smoker={payload.smoker}, region={payload.region}")

    if model is None or scaler is None:
        logger.error("Prediction attempted while ML model is uninitialized.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Machine learning model is not loaded on server."
        )

    # 1. Resolve BMI (direct or derived from height and weight)
    calc_bmi = payload.bmi
    if calc_bmi is None:
        if payload.height_cm is not None and payload.weight_kg is not None:
            height_m = payload.height_cm / 100.0
            calc_bmi = payload.weight_kg / (height_m ** 2)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'bmi' OR both 'height_cm' and 'weight_kg' must be provided."
            )

    calc_bmi = round(float(calc_bmi), 2)
    if calc_bmi < 10.0 or calc_bmi > 70.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Calculated BMI {calc_bmi} is outside valid range (10.0 - 70.0)."
        )

    try:
        # 2. Categorical mapping & encoding matching exact notebook logic
        is_female = 1.0 if payload.gender == 'female' else 0.0
        is_smoker = 1.0 if payload.smoker == 'yes' else 0.0
        region_southeast = 1.0 if payload.region == 'southeast' else 0.0
        bmi_obese = 1.0 if calc_bmi > 29.9 else 0.0

        # 3. Apply StandardScaler to numeric features ['age', 'bmi', 'children']
        raw_numeric = np.array([[float(payload.age), float(calc_bmi), float(payload.children)]])
        scaled_numeric = scaler.transform(raw_numeric)

        # 4. Construct exact feature vector: ['age', 'isfemale', 'bmi', 'children', 'is_smoker', 'region_southeast', 'bmi_category_Obese']
        feature_vector = np.array([[
            scaled_numeric[0, 0],
            is_female,
            scaled_numeric[0, 1],
            scaled_numeric[0, 2],
            is_smoker,
            region_southeast,
            bmi_obese
        ]])

        # 5. Run inference using loaded LightGBM model
        raw_usd_prediction = float(model.predict(feature_vector)[0])
        estimated_premium_usd = round(max(0.0, raw_usd_prediction), 2)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Prediction successful: ${estimated_premium_usd:,.2f} in {elapsed_ms}ms")

        return {
            "success": True,
            "estimated_premium": estimated_premium_usd,
            "currency": "$",
            "currency_code": "USD",
            "model": "LightGBM",
            "processing_time_ms": elapsed_ms,
            "exchange_rates": EXCHANGE_RATES,
            "inputs": {
                "age": payload.age,
                "gender": payload.gender,
                "bmi": calc_bmi,
                "children": payload.children,
                "smoker": payload.smoker,
                "region": payload.region,
                "bmi_category_obese": bool(bmi_obese)
            }
        }

    except Exception as e:
        logger.error(f"Error during prediction execution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating prediction: {str(e)}"
        )
