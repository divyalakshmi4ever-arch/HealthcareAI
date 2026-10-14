"""
HealthcareAI - Diabetes Health Indicators Model Training
--------------------------------------------------------
Trains a Random Forest classifier using the public Diabetes Health
Indicators survey dataset.

DISCLAIMER:
This is an educational demonstration using a public survey dataset, not a
medically validated model. It must not be used for diagnosis or treatment.
"""

import json
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "diabetes.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "diabetes_model.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "diabetes_features.json")
TARGET_COLUMN = "Diabetes_binary"


def train():
    """Train, evaluate, and save the Diabetes Health Indicators classifier."""
    print("Starting Diabetes Health Indicators model training...")
    print(f"Loading dataset from: {DATA_PATH}")

    if not os.path.isfile(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset not found at '{DATA_PATH}'. "
            "Place diabetes.csv in ml/data/ and try again."
        )

    try:
        df = pd.read_csv(DATA_PATH)
    except (OSError, pd.errors.ParserError, UnicodeDecodeError) as error:
        raise ValueError(f"Could not read dataset '{DATA_PATH}': {error}") from error

    if TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"Required target column '{TARGET_COLUMN}' was not found in the dataset."
        )
    if df.columns.duplicated().any():
        raise ValueError("Dataset contains duplicate column names.")

    feature_cols = [column for column in df.columns if column != TARGET_COLUMN]
    if not feature_cols:
        raise ValueError("Dataset does not contain any feature columns.")

    print(f"Loaded {len(df):,} records with {len(feature_cols)} feature columns.")
    print("Preparing target and handling missing values...")

    try:
        y = pd.to_numeric(df[TARGET_COLUMN], errors="raise")
        X = df[feature_cols].apply(pd.to_numeric, errors="raise")
    except (TypeError, ValueError) as error:
        raise ValueError(
            "Target and feature columns must contain numeric Diabetes Health "
            f"Indicators data: {error}"
        ) from error

    valid_target = y.notna()
    dropped_target_rows = int((~valid_target).sum())
    X = X.loc[valid_target].copy()
    y = y.loc[valid_target]
    if dropped_target_rows:
        print(f"Dropped {dropped_target_rows:,} rows with a missing target.")

    if not y.isin([0, 1]).all():
        raise ValueError(f"'{TARGET_COLUMN}' must contain only binary values 0 and 1.")
    if y.nunique() != 2 or y.value_counts().min() < 2:
        raise ValueError(
            "The target must contain at least two records for each class "
            "to create a stratified train/test split."
        )
    if X.empty:
        raise ValueError("No records remain after removing rows with a missing target.")

    missing_counts = X.isna().sum()
    missing_values = int(missing_counts.sum())
    if missing_values:
        medians = X.median()
        all_missing_columns = medians[medians.isna()].index
        if len(all_missing_columns):
            medians.loc[all_missing_columns] = 0
            print(
                "Filled entirely missing feature columns with 0: "
                + ", ".join(all_missing_columns)
            )
        X = X.fillna(medians)
        print(f"Imputed {missing_values:,} missing feature values using column medians.")
    else:
        print("No missing feature values found.")

    print("Splitting data into stratified training and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(
        f"Training set: {len(X_train):,} records | "
        f"Test set: {len(X_test):,} records"
    )

    model = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    print("Training RandomForestClassifier...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    print("Test-set metrics:")
    print(f"  Accuracy:  {accuracy_score(y_test, predictions):.4f}")
    print(
        f"  Precision: {precision_score(y_test, predictions, zero_division=0):.4f}"
    )
    print(f"  Recall:    {recall_score(y_test, predictions, zero_division=0):.4f}")
    print(f"  F1-score:  {f1_score(y_test, predictions, zero_division=0):.4f}")
    print("  Confusion matrix (labels 0, 1):")
    print(confusion_matrix(y_test, predictions, labels=[0, 1]))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    with open(FEATURES_PATH, "w", encoding="utf-8") as feature_file:
        json.dump(feature_cols, feature_file, indent=2)

    print("Model training complete.")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Feature names saved to: {FEATURES_PATH}")
    print(
        "DISCLAIMER: This is an educational demonstration using a public survey "
        "dataset, not a medically validated model. It must not be used for "
        "diagnosis or treatment."
    )


if __name__ == "__main__":
    try:
        train()
    except (FileNotFoundError, ValueError, OSError) as error:
        raise SystemExit(f"Training failed: {error}") from error
