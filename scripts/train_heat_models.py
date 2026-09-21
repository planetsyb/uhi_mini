from pathlib import Path
import json
import warnings

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

try:
    from lightgbm import LGBMRegressor
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

BASE = Path(__file__).resolve().parents[1]
DATA_FILE = BASE / "data" / "Bengaluru_wards_LST_NDVI_NDBI_NDWI_2026_04_25.csv"
MODEL_DIR = BASE / "models"
REPORT_DIR = BASE / "reports"

MODEL_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)

FEATURES = ["NDVI_mean", "NDBI_mean", "NDWI_mean"]
TARGET = "LST_mean_C"
RANDOM_STATE = 42

df = pd.read_csv(DATA_FILE)
df = df.dropna(subset=FEATURES + [TARGET]).copy()

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=RANDOM_STATE
)

models = {
    "Random Forest": RandomForestRegressor(
        n_estimators=500,
        max_depth=8,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),
    "XGBoost": XGBRegressor(
        objective="reg:squarederror",
        n_estimators=400,
        learning_rate=0.04,
        max_depth=4,
        subsample=0.85,
        colsample_bytree=0.9,
        reg_lambda=1.0,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
}

if LIGHTGBM_AVAILABLE:
    models["LightGBM"] = LGBMRegressor(
        objective="regression",
        n_estimators=400,
        learning_rate=0.04,
        num_leaves=15,
        max_depth=-1,
        subsample=0.85,
        colsample_bytree=0.9,
        random_state=RANDOM_STATE,
        verbosity=-1
    )

metrics_rows = []
trained_models = {}

for name, model in models.items():
    model.fit(X_train, y_train)
    prediction = model.predict(X_test)

    mae = mean_absolute_error(y_test, prediction)
    rmse = mean_squared_error(y_test, prediction) ** 0.5
    r2 = r2_score(y_test, prediction)

    metrics_rows.append({
        "Model": name,
        "MAE_C": round(float(mae), 4),
        "RMSE_C": round(float(rmse), 4),
        "R2": round(float(r2), 4)
    })

    trained_models[name] = model

metrics = pd.DataFrame(metrics_rows).sort_values("RMSE_C")
metrics.to_csv(REPORT_DIR / "model_comparison.csv", index=False)

best_name = metrics.iloc[0]["Model"]
best_model = trained_models[best_name]

joblib.dump(best_model, MODEL_DIR / "ward_heat_model.joblib")

metadata = {
    "model_name": best_name,
    "target": TARGET,
    "features": FEATURES,
    "training_rows": int(len(df)),
    "train_rows": int(len(X_train)),
    "test_rows": int(len(X_test)),
    "random_state": RANDOM_STATE,
    "scope": "Single-date ward-level prototype using Landsat 9 observations from 25 April 2026.",
    "limitation": (
        "This is not a temporally independent operational forecast. "
        "A multi-date dataset and spatial/temporal validation are required."
    )
}

with open(MODEL_DIR / "model_metadata.json", "w", encoding="utf-8") as file:
    json.dump(metadata, file, indent=2)

importance = permutation_importance(
    best_model,
    X_test,
    y_test,
    n_repeats=30,
    random_state=RANDOM_STATE,
    scoring="neg_mean_absolute_error"
)

importance_df = pd.DataFrame({
    "Feature": FEATURES,
    "Permutation_Importance_Mean": importance.importances_mean,
    "Permutation_Importance_SD": importance.importances_std
}).sort_values("Permutation_Importance_Mean", ascending=False)

importance_df.to_csv(REPORT_DIR / "permutation_feature_importance.csv", index=False)

plt.figure(figsize=(8, 5))
plt.barh(
    importance_df["Feature"],
    importance_df["Permutation_Importance_Mean"],
    xerr=importance_df["Permutation_Importance_SD"],
    color="#176b87"
)
plt.gca().invert_yaxis()
plt.xlabel("Decrease in negative MAE after shuffling feature")
plt.title(f"Permutation Feature Importance — {best_name}")
plt.tight_layout()
plt.savefig(REPORT_DIR / "permutation_feature_importance.png", dpi=300)
plt.close()

best_prediction = best_model.predict(X_test)

plt.figure(figsize=(6.5, 6))
plt.scatter(y_test, best_prediction, color="#d94801", alpha=0.75)
minimum = min(y_test.min(), best_prediction.min())
maximum = max(y_test.max(), best_prediction.max())
plt.plot([minimum, maximum], [minimum, maximum], "--", color="black")
plt.xlabel("Observed Ward Mean LST (°C)")
plt.ylabel("Predicted Ward Mean LST (°C)")
plt.title(f"Observed vs Predicted LST — {best_name}")
plt.grid(alpha=0.25)
plt.tight_layout()
plt.savefig(REPORT_DIR / "observed_vs_predicted_lst.png", dpi=300)
plt.close()

print("----- Heat Model Comparison -----")
print(metrics.to_string(index=False))
print("\nBest model:", best_name)
print("Saved model:", MODEL_DIR / "ward_heat_model.joblib")
print("Saved metadata:", MODEL_DIR / "model_metadata.json")
print("Saved comparison:", REPORT_DIR / "model_comparison.csv")
print("Saved importance:", REPORT_DIR / "permutation_feature_importance.csv")
print("\nIMPORTANT LIMITATION:")
print(metadata["limitation"])