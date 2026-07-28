# Health Insurance Premium Predictor

A production-ready full-stack machine learning web application that predicts annual health insurance premiums based on individual demographic and health profiles.

The prediction engine is powered by a **LightGBM Regressor** trained on the Kaggle Medical Cost Personal Datasets.

---

## 🏗️ Architecture Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend**: FastAPI (Python 3.14), Scikit-Learn, LightGBM, Joblib, NumPy.
- **Deployment Readiness**:
  - Frontend → Vercel
  - Backend → Render

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── train_and_save.py           # ML model & scaler export script
│   ├── insurance_lightgbm_model.pkl# Serialized LightGBM Model
│   ├── insurance_scaler.pkl        # Serialized StandardScaler
│   ├── requirements.txt            # Python dependencies for Render
│   └── .env.example                # Backend environment configuration template
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router layout & pages
│   │   ├── components/             # Reusable UI components (Form, Result, Navbar, Hero, etc.)
│   │   ├── context/                # ThemeContext provider (Dark / Light Mode)
│   │   ├── lib/                    # API client utilities
│   │   └── types/                  # TypeScript interfaces
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   └── .env.example                # Frontend environment configuration template
├── insurance_ml.ipynb              # Notebook source of truth
├── insurance.csv                   # Historical training dataset
├── LICENSE                         # MIT Open Source License
└── README.md                       # Project documentation
```

---

## 🚀 Running Locally

### 1. Start Backend API Server
```bash
py -m uvicorn backend.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 2. Start Frontend Next.js Web App
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Machine Learning Pipeline Specs

1. **Features**:
   - `age`: Continuous (StandardScaler transformed)
   - `isfemale`: Binary (1 for female, 0 for male)
   - `bmi`: Continuous (StandardScaler transformed)
   - `children`: Continuous (StandardScaler transformed)
   - `is_smoker`: Binary (1 for yes, 0 for no)
   - `region_southeast`: Binary (1 for southeast, 0 otherwise)
   - `bmi_category_Obese`: Binary (1 for BMI > 29.9, 0 otherwise)

2. **Model Specs**:
   - Algorithm: `LGBMRegressor(random_state=42)`
   - R² Score: `88.5%`
   - Inference Time: `< 5ms`

---

## 📄 License
MIT License - see [LICENSE](LICENSE) for details.
