import csv
import os
import numpy as np
from sklearn.preprocessing import StandardScaler
from lightgbm import LGBMRegressor
import joblib

def main():
    csv_path = os.path.join(os.path.dirname(__file__), "..", "insurance.csv")
    if not os.path.exists(csv_path):
        print(f"Dataset file not found at {csv_path}")
        return

    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    # Deduplicate rows as done in notebook: df_cleaned.drop_duplicates()
    unique_rows = []
    seen = set()
    for r in rows:
        tup = tuple(r.items())
        if tup not in seen:
            seen.add(tup)
            unique_rows.append(r)

    print(f"Dataset total rows: {len(rows)}, deduplicated rows: {len(unique_rows)}")

    scaled_cols_raw = []
    X_list = []
    y_list = []

    for r in unique_rows:
        age = float(r['age'])
        sex = 1.0 if r['sex'] == 'female' else 0.0
        bmi = float(r['bmi'])
        children = float(r['children'])
        smoker = 1.0 if r['smoker'] == 'yes' else 0.0
        region_southeast = 1.0 if r['region'] == 'southeast' else 0.0
        bmi_obese = 1.0 if bmi > 29.9 else 0.0
        charges = float(r['charges'])

        scaled_cols_raw.append([age, bmi, children])
        X_list.append([age, sex, bmi, children, smoker, region_southeast, bmi_obese])
        y_list.append(charges)

    scaled_cols_raw = np.array(scaled_cols_raw)
    scaler = StandardScaler()
    scaled_cols = scaler.fit_transform(scaled_cols_raw)

    X_arr = np.array(X_list)
    # Replace age (0), bmi (2), children (3) with scaled versions
    X_arr[:, 0] = scaled_cols[:, 0]
    X_arr[:, 2] = scaled_cols[:, 1]
    X_arr[:, 3] = scaled_cols[:, 2]

    y_arr = np.array(y_list)

    model = LGBMRegressor(random_state=42)
    model.fit(X_arr, y_arr)

    backend_dir = os.path.dirname(__file__)
    model_path = os.path.join(backend_dir, "insurance_lightgbm_model.pkl")
    scaler_path = os.path.join(backend_dir, "insurance_scaler.pkl")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"Successfully saved LightGBM model to: {model_path}")
    print(f"Successfully saved StandardScaler to: {scaler_path}")

if __name__ == "__main__":
    main()
