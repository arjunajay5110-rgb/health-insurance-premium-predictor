import os
import logging
import joblib
import numpy as np

logger = logging.getLogger("health_insurance_api")

class PredictionEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._is_loaded = False

    def load_artifacts(self):
        """Load LightGBM model and StandardScaler ONCE during FastAPI startup."""
        if self._is_loaded:
            return

        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, "insurance_lightgbm_model.pkl")
        scaler_path = os.path.join(base_dir, "insurance_scaler.pkl")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            logger.error(f"Artifact files missing at {model_path} or {scaler_path}")
            raise FileNotFoundError("Machine learning model or scaler file not found.")

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self._is_loaded = True
        logger.info("PredictionEngine: Model and Scaler loaded ONCE into memory.")

    def predict_raw_usd(self, age: int, gender: str, bmi: float, children: int, smoker: str, region: str) -> float:
        """Run raw inference and return uncalibrated USD target prediction."""
        if not self._is_loaded:
            self.load_artifacts()

        # Categorical encodings matching notebook pipeline
        is_female = 1.0 if gender.lower() == 'female' else 0.0
        is_smoker = 1.0 if smoker.lower() == 'yes' else 0.0
        region_southeast = 1.0 if region.lower() == 'southeast' else 0.0
        bmi_obese = 1.0 if bmi > 29.9 else 0.0

        # Fast NumPy StandardScaler transformation
        raw_numeric = np.array([[float(age), float(bmi), float(children)]])
        scaled_numeric = self.scaler.transform(raw_numeric)

        # Feature vector: ['age', 'isfemale', 'bmi', 'children', 'is_smoker', 'region_southeast', 'bmi_category_Obese']
        feature_vector = np.array([[
            scaled_numeric[0, 0],
            is_female,
            scaled_numeric[0, 1],
            scaled_numeric[0, 2],
            is_smoker,
            region_southeast,
            bmi_obese
        ]])

        raw_usd_prediction = float(self.model.predict(feature_vector)[0])
        return max(0.0, raw_usd_prediction)

# Global singleton instance
prediction_engine = PredictionEngine()
