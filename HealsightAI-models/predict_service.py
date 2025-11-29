from fastapi import FastAPI
import joblib
import lightgbm as lgb
import numpy as np
import json
import os
from datetime import datetime, timedelta


app = FastAPI()

BASE_DIR = "models"

# Load metadata
meta = json.load(open(os.path.join(BASE_DIR, "meta.json")))
features = joblib.load(os.path.join(BASE_DIR, "preproc.joblib"))["features"]

# Load all models & scalers
models = {}
scalers = {}
for target in meta["models"].keys():
    model_path = os.path.join(BASE_DIR, target, "model.txt")
    scaler_path = os.path.join(BASE_DIR, target, "scaler.joblib")

    models[target] = lgb.Booster(model_file=model_path)
    scalers[target] = joblib.load(scaler_path)


@app.post("/predict")
def predict(data: dict):
    x = np.array([data[f] for f in features]).reshape(1, -1)
    
    preds = {}
    for target in models.keys():
        x_scaled = scalers[target].transform(x)
        preds[target] = float(models[target].predict(x_scaled)[0])

    return {"predictions": preds}




@app.post("/predict_week")
def predict_4_week(data: dict):
    results = []
    base_date = datetime.now()

    x = {f: data[f] for f in features}

    for i in range(7):
        future_date = base_date + timedelta(days=i)

        x["day"] = future_date.day
        x["month"] = future_date.month
        x["year"] = future_date.year
        x["weekofyear"] = future_date.isocalendar().week
        x["day_of_week"] = future_date.weekday()
        x["is_weekend"] = 1 if x["day_of_week"] >= 5 else 0

        xp = np.array([x[f] for f in features]).reshape(1, -1)

        preds = {}
        for target in models.keys():
            x_scaled = scalers[target].transform(xp)
            preds[target] = float(models[target].predict(x_scaled)[0])

        results.append({"date": str(future_date.date()), "predictions": preds})

    return {"forecast_7_days": results}