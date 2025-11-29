import pandas as pd
import numpy as np
import json
import ast
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib

import os
import argparse
import json
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import lightgbm as lgb
from tqdm import tqdm



#!/usr/bin/env python3
"""
hospital_forecast_train.py

Usage:
    python hospital_forecast_train.py --data path/to/historical.csv --out_dir models/

Description:
- Expects a CSV with at least these columns:
    Date (YYYY-MM-DD), patient_count, aqi, temperature_c, accident_count, festival
- Trains LightGBM quantile models for patient_count (p50 & p90) using lag features.
- Exports models and a preprocessing pipeline (joblib files) to --out_dir
- Provides functions to produce 7-day forecasts given ONLY today's AQI/temp (creates scenarios),
  and to compute bed_count and staff_required.
Dependencies: pandas, numpy, scikit-learn, lightgbm, joblib, tqdm
Install: pip install pandas numpy scikit-learn lightgbm joblib tqdm
"""


# -----------------------------
# Configurable hyperparameters
# -----------------------------
LAG_DAYS = [1, 2, 3, 7, 14]
ROLL_WINDOWS = [3, 7, 14]
TARGET = "patient_count"
DATE_COL = "Date"

# LightGBM params (can be tuned)
LGB_PARAMS = {
    "objective": "quantile",
    "metric": "quantile",
    "learning_rate": 0.05,
    "num_leaves": 32,
    "min_data_in_leaf": 20,
    "feature_fraction": 0.8,
    "bagging_fraction": 0.8,
    "bagging_freq": 5,
    "verbosity": -1,
}


# -----------------------------
# Utility / Feature functions
# -----------------------------
def read_data(path):
    df = pd.read_csv(path, parse_dates=[DATE_COL])
    df = df.sort_values(DATE_COL).reset_index(drop=True)
    # normalize festival column if missing
    if "festival" not in df.columns:
        df["festival"] = "None"
    df["festival"] = df["festival"].fillna("None")
    return df

def add_calendar_features(df):
    df['day'] = df['Date'].dt.day
    df['month'] = df['Date'].dt.month
    df['year'] = df['Date'].dt.year
    df['weekofyear'] = df['Date'].dt.isocalendar().week.astype(int)

    df["day_of_week"] = df[DATE_COL].dt.weekday  # 0=Mon..6=Sun
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["month"] = df[DATE_COL].dt.month
    df["day"] = df[DATE_COL].dt.day
    return df

def add_lags_and_rolls(df, target_col=TARGET, lag_days=LAG_DAYS, roll_windows=ROLL_WINDOWS):
    df = df.copy()
    for lag in lag_days:
        df[f"{target_col}_lag_{lag}"] = df[target_col].shift(lag)
    for w in roll_windows:
        df[f"{target_col}_rmean_{w}"] = df[target_col].shift(1).rolling(window=w, min_periods=1).mean()
        df[f"{target_col}_rstd_{w}"] = df[target_col].shift(1).rolling(window=w, min_periods=1).std().fillna(0)
    # lag aqi and temp if present
    if "aqi" in df.columns:
        for lag in [1,2,3]:
            df[f"aqi_lag_{lag}"] = df["aqi"].shift(lag)
    if "temperature_c" in df.columns:
        for lag in [1,2,3]:
            df[f"temp_lag_{lag}"] = df["temperature_c"].shift(lag)
    return df

def encode_festival_windows(df, window=3):
    """
    Create binary flags for festival windows: main day and +/- window days.
    Assumes festival column contains festival name or 'None'.
    """
    df = df.copy()
    df["festival_main"] = (df["festival"] != "None").astype(int)
    # Create one-hot for common festivals (keeps 'OtherFestival' if present)
    festivals = df["festival"].unique().tolist()
    festivals = [f for f in festivals if f != "None"]
    for fest in festivals:
        df[f"fest_{fest}"] = (df["festival"] == fest).astype(int)
    return df

def process_staff_details(df):
    def parse_staff_json(val):
        if pd.isna(val):
            return {}
        if isinstance(val, dict):
            return val

        s = str(val).strip()
        if s == "" or s.lower() in ["nan", "none"]:
            return {}

        # Try json and ast
        for loader in (json.loads, ast.literal_eval):
            try:
                parsed = loader(s)
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                continue

        # Fallback manual parsing
        out = {}
        try:
            s2 = s.strip("{} ")
            parts = [p.strip() for p in s2.split(",") if ":" in p]
            for p in parts:
                k, v = p.split(":", 1)
                k = k.strip().strip('"').strip("'")
                v = v.strip().strip('"').strip("'")

                try:
                    out[k] = int(float(v))
                except:
                    num = "".join(ch for ch in v if ch.isdigit())
                    out[k] = int(num) if num else 0
        except:
            pass
        return out

    parsed = df['staff_required_details'].apply(parse_staff_json)

    df['nurses_required'] = parsed.apply(lambda d: int(d.get('nurses', d.get('nurse', 0))))
    df['doctors_required'] = parsed.apply(lambda d: int(d.get('doctors', d.get('doctor', 0))))
    df['support_required'] = parsed.apply(lambda d: int(d.get('support', d.get('support_staff', 0))))

    return df


def preprocess_pipeline(df, training=True):
    """
    Build features and return X, y, feature_columns
    """
    df = df.copy()
    df = add_calendar_features(df)
    df = encode_festival_windows(df)
    df = process_staff_details(df)
    df = add_lags_and_rolls(df)
    
    # Fill missing numeric values with reasonable defaults
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    # keep Date and target separate
    if TARGET in df.columns:
        y = df[TARGET].copy()
    else:
        y = None
    # Drop rows with NaN in target (initial lags)
    if training and TARGET in df.columns:
        df = df[~y.isna()].reset_index(drop=True)
        y = df[TARGET].copy()
    # Fill numeric NaNs (from lags) with medians or zeros
    for col in num_cols:
        df[col] = df[col].fillna(df[col].median() if df[col].notna().sum() > 0 else 0)
    
    # Categorical columns to include
    cat_cols = ['festival', 'advisory', 'most_required_med_category', 'staff_required_details']
    cat_cols = [c for c in cat_cols if c in df.columns]
    # Prepare one-hot encoder for festivals - we'll handle externally when saving
    # Select feature columns (exclude Date and raw target)
    exclude = [DATE_COL, TARGET,cat_cols]
    feature_cols = [c for c in df.columns if c not in exclude]
    X = df[feature_cols].copy()
    X = X.select_dtypes(include=[np.number])
    return X, y, feature_cols



# -----------------------------
# Modeling functions
# -----------------------------
def train_quantile_lgb(X, y, q, params=None, n_splits=3):
    """
    Train LightGBM quantile regressor for quantile q (0<q<1).
    Returns trained model (trained on full data after cross-val).
    """
    params = params.copy() if params is not None else {}
    params["objective"] = "quantile"
    params["alpha"] = q
    # simple time series split for validation
    tscv = TimeSeriesSplit(n_splits=n_splits)
    models = []
    val_scores = []
    for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
        X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
        X_val, y_val = X.iloc[val_idx], y.iloc[val_idx]
        lgb_train = lgb.Dataset(X_train, label=y_train)
        lgb_val = lgb.Dataset(X_val, label=y_val, reference=lgb_train)
        callbacks = [lgb.early_stopping(stopping_rounds=50)]
        bst = lgb.train(params,lgb_train,num_boost_round=1000, valid_sets=[lgb_train, lgb_val],callbacks=callbacks)

        models.append(bst)
        # validation metric: quantile loss
        pred = bst.predict(X_val, num_iteration=bst.best_iteration)
        qloss = np.mean(np.maximum(q*(y_val-pred), (q-1)*(y_val-pred)))
        val_scores.append(qloss)
        print(f"Fold {fold} q={q} val quantile-loss: {qloss:.4f}")
    # Retrain on full dataset with best params and rounds average (simple approach)
    # Get average best_iteration
    best_iters = [m.best_iteration for m in models]
    avg_iter = int(np.mean(best_iters))
    print(f"Retraining final model for q={q} with num_boost_round={avg_iter}")
    final = lgb.train( params, lgb.Dataset(X, label=y),num_boost_round=avg_iter, callbacks=[lgb.log_evaluation(period=0)])

    return final, {"fold_scores": val_scores, "avg_iter": avg_iter}



# -----------------------------
# Scenario generation helpers
# -----------------------------
def build_exogenous_scenarios(today_aqi, today_temp, month, climatology_aqi=None, climatology_temp=None):
    """
    Return dictionary: {'best': {'aqi':[7 values], 'temp':[7 values]}, ...}
    Simple deterministic scenario generator as described in conversation.
    """
    if climatology_aqi is None:
        climatology_aqi = {m: 150 for m in range(1,13)}
    if climatology_temp is None:
        climatology_temp = {m: 28 for m in range(1,13)}
    alpha = 0.75
    median_a = []
    median_t = []
    prev_a = float(today_aqi)
    prev_t = float(today_temp)
    for d in range(7):
        clim_a = climatology_aqi.get(month, 150)
        clim_t = climatology_temp.get(month, 28)
        next_a = alpha * prev_a + (1 - alpha) * clim_a
        next_t = alpha * prev_t + (1 - alpha) * clim_t
        median_a.append(max(0, int(round(next_a))))
        median_t.append(int(round(next_t)))
        prev_a = next_a
        prev_t = next_t
    # worst: add spikes on first 2 days
    worst_a = [min(1000, int(a + max(20, 0.2 * a) + (80 if i < 2 else 0))) for i, a in enumerate(median_a)]
    worst_t = [t + 1 for t in median_t]
    best_a = [max(5, int(a * 0.85)) for a in median_a]
    best_t = [t - 1 for t in median_t]
    return {
        "best": {"aqi": best_a, "temp": best_t},
        "median": {"aqi": median_a, "temp": median_t},
        "worst": {"aqi": worst_a, "temp": worst_t},
    }

# -----------------------------
# Recursive forecasting
# -----------------------------
def recursive_forecast(models_dict, last_history_df, exog_scenario, feature_cols, scaler=None):
    """
    Recursive forecast for 7 days using one-step LightGBM models.
    models_dict: dict with quantile models, e.g. {'p50': model, 'p90': model}
    last_history_df: dataframe containing latest known rows (with same features)
    exog_scenario: dict {'aqi': [7], 'temp':[7]}
    feature_cols: columns used by model
    scaler: optional sklearn scaler used at training time to transform X
    Returns dict of forecasts per quantile: {'p50': [7], 'p90': [7]}
    """
    history = last_history_df.copy().reset_index(drop=True)
    preds = {k: [] for k in models_dict.keys()}
    df = history.copy()
    for day in range(7):
        # build a single-row feature vector for next day based on last rows
        next_date = df[DATE_COL].max() + pd.Timedelta(days=1)
        row = {"Date": next_date}
        # calendar features
        row["day_of_week"] = next_date.weekday()
        row["is_weekend"] = 1 if row["day_of_week"] >= 5 else 0
        row["month"] = next_date.month
        row["day"] = next_date.day
        # exogenous values from scenario
        row["aqi"] = exog_scenario["aqi"][day]
        row["temperature_c"] = exog_scenario["temp"][day]
        # festival - unknown; set to 'None' (or you can pass a future festival calendar)
        row["festival"] = "None"
        # compute lags/rolling features using recent df
        for lag in LAG_DAYS:
            colname = f"{TARGET}_lag_{lag}"
            if len(df) >= lag:
                row[colname] = df[TARGET].iloc[-lag]
            else:
                row[colname] = int(df[TARGET].iloc[-1])  # fallback
        for w in ROLL_WINDOWS:
            row[f"{TARGET}_rmean_{w}"] = df[TARGET].iloc[-w:].mean() if len(df) >= 1 else df[TARGET].mean()
            row[f"{TARGET}_rstd_{w}"] = df[TARGET].iloc[-w:].std() if len(df) >= 1 else df[TARGET].std()
        # aqi/temp lags
        for lag in [1,2,3]:
            col = f"aqi_lag_{lag}"
            if len(df) >= lag+0:
                row[col] = df["aqi"].iloc[-lag]
            else:
                row[col] = row["aqi"]
        for lag in [1,2,3]:
            col = f"temp_lag_{lag}"
            if len(df) >= lag+0:
                row[col] = df["temperature_c"].iloc[-lag]
            else:
                row[col] = row["temperature_c"]
        # festival flags default
        row["festival_main"] = 0
        # create DataFrame
        X_row = pd.DataFrame([row])
        # create one-hot festival features (present at training) - ensure all feature_cols exist
        for c in feature_cols:
            if c not in X_row.columns:
                X_row[c] = 0
        X_row = X_row[feature_cols]
        # scale if needed
        if scaler:
            X_in = scaler.transform(X_row)
        else:
            X_in = X_row.values
        # predict for each quantile model
        for qname, model in models_dict.items():
            pred = model.predict(X_row, num_iteration=model.best_iteration) if hasattr(model, "best_iteration") else model.predict(X_row)
            pred_val = float(pred[0])
            preds[qname].append(max(0, int(round(pred_val))))
        # append predicted median (or p50) into df so next day lags can use it (use p50)
        next_patient = preds.get("p50", preds[list(preds.keys())[0]])[-1]
        # append a new row to df with predicted patient_count and exog to continue recursion
        new_df_row = {
            "Date": X_row.iloc[0].get("Date", next_date),
            TARGET: next_patient,
            "aqi": X_row.iloc[0].get("aqi", exog_scenario["aqi"][day]),
            "temperature_c": X_row.iloc[0].get("temperature_c", exog_scenario["temp"][day]),
            "festival": "None",
        }
        df = df.append(new_df_row, ignore_index=True)
    return preds



# -----------------------------
# Training entrypoint
# -----------------------------
def train_pipeline(data_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    df = read_data(data_path)
    print(f"Loaded {len(df)} rows from {data_path}")
    X, y, feature_cols = preprocess_pipeline(df, training=True)
    print(f"Feature columns count: {len(feature_cols)}")
    # keep feature columns order for future
    feature_cols = list(X.columns)
    X = X[feature_cols]
    # simple scaler for numeric features (we'll use a StandardScaler)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    # wrap scaler + feature_cols into saved pipeline
    preproc = {"scaler": scaler, "feature_cols": feature_cols}
    joblib.dump(preproc, os.path.join(out_dir, "preproc.joblib"))
    print("Saved preprocessing pipeline")
    # Train p50 and p90 models
    models_meta = {}
    for q in [0.5, 0.9]:
        params = LGB_PARAMS.copy()
        params["alpha"] = q
        print(f"Training quantile model for q={q}")
        model, info = train_quantile_lgb(pd.DataFrame(X_scaled, columns=feature_cols), y.reset_index(drop=True), q, params=params)
        fname = os.path.join(out_dir, f"lgb_q{int(q*100)}.txt")
        model.save_model(fname)
        models_meta[f"q{int(q*100)}"] = {"path": fname, "info": info}
        print(f"Saved model q{q} -> {fname}")
    # save metadata
    meta = {"models": models_meta, "feature_cols": feature_cols, "date_trained": datetime.now().isoformat()}
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("Training completed. Models and preprocessing saved to", out_dir)



# -----------------------------
# Bed & Staff calculators
# -----------------------------
import math
def compute_beds(patient_counts):
    """
    Simple bed estimator: smoother than raw patient_count.
    Uses rule bed_count = ceil(patient_count * 0.20 + random(-3, +8))
    """
    beds = []
    for pc in patient_counts:
        noise = np.random.randint(-3, 9)
        bed = math.ceil(pc * 0.20 + noise)
        bed = max(0, bed)
        beds.append(bed)
    return beds

def compute_staff(patient_counts, bed_counts):
    """
    nurses = ceil(beds / 8)  # or 10 depending on policy
    doctors = ceil(patient / 20)
    support = ceil(patient / 50) + 5
    returns list of dicts
    """
    staff = []
    for pc, bd in zip(patient_counts, bed_counts):
        nurses = math.ceil(bd / 8)  # use 8 patients per nurse for metro hospital
        doctors = math.ceil(pc / 20) if pc > 0 else 1
        support = math.ceil(pc / 50) + 5
        staff.append({"nurses": nurses, "doctors": doctors, "support": support, "total": nurses + doctors + support})
    return staff


# -----------------------------
# Example usage to forecast 7 days (post-training)
# -----------------------------
def load_models(out_dir):
    meta = json.load(open(os.path.join(out_dir, "meta.json"), "r"))
    preproc = joblib.load(os.path.join(out_dir, "preproc.joblib"))
    feature_cols = preproc["feature_cols"]
    scaler = preproc["scaler"]
    models = {}
    for qkey, info in meta["models"].items():
        path = info["path"]
        m = lgb.Booster(model_file=path)
        models[qkey] = m
    return models, scaler, feature_cols

def forecast_7_days_from_today(out_dir, history_csv, today_date_str, today_aqi, today_temp):
    """
    Loads models and history, then produces 7-day forecasts using scenario approach.
    history_csv must contain the last ~30 days of data including today.
    """
    models, scaler, feature_cols = load_models(out_dir)
    # models keys are 'q50' and 'q90'
    models_dict = {"p50": models["q50"], "p90": models["q90"]}
    hist = pd.read_csv(history_csv, parse_dates=[DATE_COL])
    hist = hist.sort_values(DATE_COL).reset_index(drop=True)
    # Ensure history includes today row
    today_date = pd.to_datetime(today_date_str)
    if hist[DATE_COL].max() < today_date:
        # append today's row
        new_row = {DATE_COL: today_date, "patient_count": hist[TARGET].iloc[-1], "aqi": today_aqi, "temperature_c": today_temp, "festival": "None"}
        hist = hist.append(new_row, ignore_index=True)
    # build scenarios
    month = today_date.month
    scenarios = build_exogenous_scenarios(today_aqi, today_temp, month)
    results = {}
    for sname, exog in scenarios.items():
        preds = recursive_forecast(models_dict, hist.tail(30), exog, feature_cols, scaler=None)
        # preds is dict {'p50':[7], 'p90':[7]}
        beds = compute_beds(preds["p50"])
        staff = compute_staff(preds["p90"], beds)  # use p90 for staff to be conservative
        results[sname] = {"patient_p50": preds["p50"], "patient_p90": preds["p90"], "beds": beds, "staff": staff}
    return results

# -----------------------------
# CLI
# -----------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to historical CSV")
    parser.add_argument("--out_dir", required=True, help="Directory to save models")
    parser.add_argument("--action", choices=["train", "forecast"], default="train")
    parser.add_argument("--history_csv", help="History CSV for forecasting (last 30 days)")
    parser.add_argument("--today", help="Today's date YYYY-MM-DD for forecasting")
    parser.add_argument("--today_aqi", type=int, help="Today's AQI for scenario gen")
    parser.add_argument("--today_temp", type=float, help="Today's temperature for scenario gen")
    args = parser.parse_args()
    if args.action == "train":
        train_pipeline(args.data, args.out_dir)
    else:
        if not (args.history_csv and args.today and args.today_aqi is not None and args.today_temp is not None):
            raise ValueError("For forecast action, please provide --history_csv, --today, --today_aqi, --today_temp")
        res = forecast_7_days_from_today(args.out_dir, args.history_csv, args.today, args.today_aqi, args.today_temp)
        print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
