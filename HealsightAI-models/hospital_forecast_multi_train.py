#!/usr/bin/env python3
"""
FULL MULTI-TARGET TRAINING SCRIPT FOR HOSPITAL PREDICTION
==========================================================

Usage:
    python hospital_full_multitarget_train.py --data history.csv --out_dir models/

Creates:
    models/
      preproc.joblib
      meta.json
      patient_count/model.txt
      bed_count/model.txt
      ...
"""

import os
import json
import argparse
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from tqdm import tqdm
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
import ast

# ---------------- TARGETS & FEATURES ---------------- #

features = [
    'day_of_week', 'is_weekend', 'festival_enc', 'is_festival',
    'aqi', 'temperature_c', 'day', 'month', 'year', 'weekofyear'
]

targets = [
    "patient_count", "bed_count", "staff_required_total", "accident_count",
    "nurses_required", "doctors_required", "support_required",
    "Antibiotic", "Analgesic", "Antipyretic", "Respiratory",
    "Cardiovascular", "Diabetes", "Gastrointestinal", "Anti-allergic", "ORS"
]

DATE_COL = "Date"

LGB_PARAMS = {
    "objective": "regression",
    "metric": "rmse",
    "learning_rate": 0.04,
    "num_leaves": 45,
    "feature_fraction": 0.8,
    "bagging_fraction": 0.8,
    "bagging_freq": 5,
    "min_data_in_leaf": 25,
    "verbosity": -1
}


# ------------------- PREPROCESSING ------------------- #

def read_data(path):
    df = pd.read_csv(path, parse_dates=[DATE_COL])
    df = df.sort_values(DATE_COL).reset_index(drop=True)
    if "festival" not in df.columns:
        df["festival"] = "None"
    df["festival"] = df["festival"].fillna("None")
    return df


def parse_staff(val):
    if pd.isna(val) or str(val).strip() == "":
        return {}
    try:
        return ast.literal_eval(val)
    except:
        return {}


def add_derived_staff_cols(df):
    parsed = df["staff_required_details"].apply(parse_staff) if "staff_required_details" in df.columns else None
    if parsed is not None:
        df["nurses_required"] = parsed.apply(lambda d: d.get("nurses", d.get("nurse", 0)))
        df["doctors_required"] = parsed.apply(lambda d: d.get("doctors", d.get("doctor", 0)))
        df["support_required"] = parsed.apply(lambda d: d.get("support", d.get("support_staff", 0)))

    return df


def add_calendar_features(df):
    df["day"] = df[DATE_COL].dt.day
    df["month"] = df[DATE_COL].dt.month
    df["year"] = df[DATE_COL].dt.year
    df["weekofyear"] = df[DATE_COL].dt.isocalendar().week.astype(int)
    df["day_of_week"] = df[DATE_COL].dt.weekday
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["festival_enc"] = df["festival"].astype("category").cat.codes
    df["is_festival"] = (df["festival"] != "None").astype(int)
    return df


def add_lags(df):
    for target in targets:
        if target in df.columns:
            for lag in [1, 2, 3, 7, 14]:
                df[f"{target}_lag_{lag}"] = df[target].shift(lag)
    return df


def add_rolling(df):
    for target in targets:
        if target in df.columns:
            for w in [3, 7, 14]:
                df[f"{target}_rmean_{w}"] = df[target].shift(1).rolling(w, min_periods=1).mean()
                df[f"{target}_rstd_{w}"] = df[target].shift(1).rolling(w, min_periods=1).std().fillna(0)
    return df


def preprocess(df):
    df = add_derived_staff_cols(df)
    df = add_calendar_features(df)
    df = add_lags(df)
    df = add_rolling(df)
    df = df.dropna().reset_index(drop=True)
    return df


# ------------------- TRAINING ------------------- #

def train_model(df, target, out_dir):
    print(f"\n▶ Training: {target}")

    X = df[features].copy()
    y = df[target].copy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    tscv = TimeSeriesSplit(n_splits=3)
    best_iters = []

    for fold, (train_idx, val_idx) in enumerate(tscv.split(X_scaled)):
        X_train, X_val = X_scaled[train_idx], X_scaled[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        train_ds = lgb.Dataset(X_train, label=y_train)
        val_ds = lgb.Dataset(X_val, label=y_val, reference=train_ds)

        model = lgb.train(LGB_PARAMS, train_ds,
                          valid_sets=[train_ds, val_ds],
                          num_boost_round=2500,
                          callbacks=[lgb.early_stopping(80)])

        best_iters.append(model.best_iteration)
        print(f"Fold {fold} Best Iteration: {model.best_iteration}")

    final_iter = int(np.mean(best_iters))
    print(f"📍 Final Training on Full Data: {final_iter} rounds")

    final = lgb.train(LGB_PARAMS, lgb.Dataset(X_scaled, label=y),
                      num_boost_round=final_iter,
                      callbacks=[lgb.log_evaluation(period=0)])

    target_dir = os.path.join(out_dir, target)
    os.makedirs(target_dir, exist_ok=True)

    final.save_model(os.path.join(target_dir, "model.txt"))
    joblib.dump(scaler, os.path.join(target_dir, "scaler.joblib"))

    return {"target": target, "path": f"{target}/model.txt", "iters": final_iter}


def train_all(data_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    df = read_data(data_path)
    df = preprocess(df)

    meta = {"trained_at": datetime.now().isoformat(), "models": {}}

    for target in tqdm(targets):
        if target in df.columns:
            meta["models"][target] = train_model(df, target, out_dir)

    joblib.dump({"features": features}, os.path.join(out_dir, "preproc.joblib"))
    json.dump(meta, open(os.path.join(out_dir, "meta.json"), "w"), indent=2)

    print("\n🚀 Training Finished Successfully!")


# ------------------- CLI ------------------- #

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", required=True)
    p.add_argument("--out_dir", required=True)
    args = p.parse_args()
    train_all(args.data, args.out_dir)


if __name__ == "__main__":
    main()
