import os
import time
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any

try:
    from backend.ml.prediction import prediction_engine
    from backend.services.premium_calibration import calibration_service
    from backend.services.family_aggregation import family_aggregation_service
    from backend.ai.router import router as ai_router
except ModuleNotFoundError:
    from ml.prediction import prediction_engine
    from services.premium_calibration import calibration_service
    from services.family_aggregation import family_aggregation_service
    from ai.router import router as ai_router

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("health_insurance_api")

app = FastAPI(
    title="Health Insurance Premium Predictor API",
    description="Production backend API with Family Floater Estimator & AI Insurance Advisor",
    version="3.0.0"
)

# Register modular AI router
app.include_router(ai_router)

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

@app.on_event("startup")
def startup_event():
    """Load LightGBM model and StandardScaler ONCE during application startup."""
    try:
        prediction_engine.load_artifacts()
        logger.info("FastAPI startup: ML Artifacts successfully loaded into global memory.")
    except Exception as e:
        logger.error(f"FastAPI startup failed to load ML artifacts: {str(e)}")

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

class FamilyMember(BaseModel):
    name: str = Field(..., description="Name or role of member (e.g. Primary, Spouse, Child)")
    relationship: str = Field(..., description="Relationship: 'Primary', 'Spouse', 'Child', 'Parent'")
    age: int = Field(..., ge=1, le=100)
    gender: str = Field(...)
    smoker: str = Field(...)
    height_cm: Optional[float] = Field(None)
    weight_kg: Optional[float] = Field(None)
    bmi: Optional[float] = Field(None)
    children: Optional[int] = Field(0)
    region: Optional[str] = Field("southeast")

class FamilyPredictRequest(BaseModel):
    region: str = Field("southeast", description="Policy region")
    members: List[FamilyMember] = Field(..., min_items=1)

def compute_health_metrics(age: int, bmi: float, smoker: str):
    """Compute BMI status, Health Score (0-100), Health Status, and Risk Level."""
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

@app.get("/api/health")
def health_check():
    """Endpoint for load balancer health monitoring."""
    return {
        "status": "healthy",
        "model_loaded": prediction_engine._is_loaded,
        "version": "3.0.0"
    }

@app.post("/api/predict")
def predict_premium(payload: PredictRequest):
    """Predict annual and monthly health insurance premium in INR using ML engine & calibration layer."""
    start_time = time.time()

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
        metrics = compute_health_metrics(payload.age, calc_bmi, payload.smoker)

        raw_usd_prediction = prediction_engine.predict_raw_usd(
            age=payload.age,
            gender=payload.gender,
            bmi=calc_bmi,
            children=payload.children,
            smoker=payload.smoker,
            region=payload.region
        )

        calibrated_result = calibration_service.calibrate(
            raw_usd_prediction=raw_usd_prediction,
            risk_level=metrics["risk_level"]
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "success": True,
            "annual_premium": calibrated_result["annual_premium"],
            "monthly_premium": calibrated_result["monthly_premium"],
            "currency": "₹",
            "model": "LightGBM",
            "processing_time_ms": elapsed_ms,
            "health_snapshot": {
                "age": payload.age,
                "gender": payload.gender,
                "bmi": calc_bmi,
                "bmi_status": metrics["bmi_status"],
                "smoker": payload.smoker,
                "children": payload.children,
                "region": payload.region,
                "risk_level": metrics["risk_level"],
                "health_score": metrics["health_score"],
                "health_status": metrics["health_status"]
            },
            "inputs": {
                "age": payload.age,
                "gender": payload.gender,
                "bmi": calc_bmi,
                "children": payload.children,
                "smoker": payload.smoker,
                "region": payload.region,
                "bmi_category_obese": bool(calc_bmi > 29.9)
            }
        }

    except Exception as e:
        logger.error(f"Error during prediction execution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating prediction: {str(e)}"
        )

@app.post("/api/predict/family")
def predict_family_premium(payload: FamilyPredictRequest):
    """Estimate Family Floater Health Insurance Premium based on independent ML predictions + floater discount."""
    if not payload.members:
        raise HTTPException(status_code=400, detail="At least one family member is required.")

    try:
        member_dicts = [m.dict() for m in payload.members]
        result = family_aggregation_service.calculate_family_floater(member_dicts, payload.region)
        return result
    except Exception as e:
        logger.error(f"Error during family floater prediction: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while estimating family floater premium: {str(e)}"
        )
