"""
Train a heart disease classifier from the Cleveland heart dataset.

DISCLAIMER:
This is an educational demonstration using a public dataset, not a medically
validated model. It must not be used for diagnosis or treatment.
"""

import json
import os

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "heart.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "heart_model.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "heart_features.json")

FEATURE_COLUMNS = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]
TARGET_COLUMN = "target"
CATEGORICAL_FEATURES = [
    "sex",
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal",
]
NUMERIC_FEATURES = [
    column for column in FEATURE_COLUMNS if column not in CATEGORICAL_FEATURES
]
TARGET_MAPPING = {
    "0": 0,
    "1-4": 1,
}


def load_dataset():
    """Read and validate the headerless Cleveland heart CSV."""
    print(f"Loading heart dataset: {DATA_PATH}")
    if not os.path.isfile(DATA_PATH):
        raise FileNotFoundError(f"Heart dataset not found: {DATA_PATH}")

    try:
        frame = pd.read_csv(
            DATA_PATH,
            header=None,
            names=FEATURE_COLUMNS + [TARGET_COLUMN],
            na_values=["?"],
        )
    except (OSError, pd.errors.ParserError, UnicodeDecodeError) as error:
        raise ValueError(f"Could not read heart dataset: {error}") from error

    expected_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    if frame.columns.tolist() != expected_columns:
        raise ValueError("Heart CSV columns do not match the expected 14-column schema.")
    if frame.empty:
        raise ValueError("Heart CSV contains no records.")

    try:
        frame = frame.apply(pd.to_numeric, errors="raise")
    except (TypeError, ValueError) as error:
        raise ValueError(f"Heart CSV must contain numeric values or '?': {error}") from error

    missing = int(frame.isna().sum().sum())
    print(f"Loaded {len(frame)} records; found {missing} missing values.")
    return frame


def prepare_data(frame):
    """Separate features and safely map original Cleveland target grades to binary."""
    target = frame[TARGET_COLUMN]
    missing_targets = int(target.isna().sum())
    if missing_targets:
        print(
            f"Dropping {missing_targets} record(s) with missing target values; "
            "target labels are not imputed."
        )

    valid_target = target.notna()
    X = frame.loc[valid_target, FEATURE_COLUMNS].copy()
    original_target = target.loc[valid_target]
    if not original_target.isin([0, 1, 2, 3, 4]).all():
        invalid = sorted(original_target.loc[~original_target.isin([0, 1, 2, 3, 4])].unique())
        raise ValueError(
            f"Expected Cleveland target grades 0 through 4; found invalid values: {invalid}"
        )

    y = (original_target > 0).astype("int64")
    if y.nunique() != 2 or y.value_counts().min() < 2:
        raise ValueError(
            "Both disease-presence classes must have at least two labeled records "
            "for a stratified train/test split."
        )
    print(
        "Target interpretation: grade 0 = no disease (0); grades 1-4 = "
        "disease present (1)."
    )
    return X, y


def split_data(X, y):
    """Return the fixed, stratified holdout split used by both scripts."""
    return train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )


def create_pipeline():
    """Construct preprocessing and classifier steps, fitted only on training data."""
    numeric_pipeline = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocessing = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    return Pipeline(
        steps=[
            ("preprocessor", preprocessing),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=200,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )


def print_metrics(y_test, predictions):
    """Print binary classification metrics with disease present as positive."""
    print("Test-set metrics (positive class: heart disease present):")
    print(f"  Accuracy:  {accuracy_score(y_test, predictions):.4f}")
    print(
        f"  Precision: {precision_score(y_test, predictions, zero_division=0):.4f}"
    )
    print(f"  Recall:    {recall_score(y_test, predictions, zero_division=0):.4f}")
    print(f"  F1-score:  {f1_score(y_test, predictions, zero_division=0):.4f}")
    print("  Confusion matrix (rows/columns: no disease=0, disease present=1):")
    print(confusion_matrix(y_test, predictions, labels=[0, 1]))


def train():
    """Train and persist the heart disease model and feature metadata."""
    print("Starting heart disease model training...")
    frame = load_dataset()
    X, y = prepare_data(frame)
    X_train, X_test, y_train, y_test = split_data(X, y)
    print(f"Training records: {len(X_train)} | Test records: {len(X_test)}")

    model = create_pipeline()
    print("Fitting RandomForestClassifier pipeline...")
    model.fit(X_train, y_train)
    print_metrics(y_test, model.predict(X_test))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    feature_metadata = {
        "dataset": "Cleveland heart disease dataset",
        "target_column": TARGET_COLUMN,
        "target_mapping": TARGET_MAPPING,
        "positive_class": "heart disease present",
        "features": FEATURE_COLUMNS,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "split": {
            "test_size": 0.2,
            "random_state": 42,
            "stratified": True,
        },
    }
    with open(FEATURES_PATH, "w", encoding="utf-8") as metadata_file:
        json.dump(feature_metadata, metadata_file, indent=2)

    print(f"Model saved to: {MODEL_PATH}")
    print(f"Feature metadata saved to: {FEATURES_PATH}")
    print(
        "DISCLAIMER: This is an educational demonstration using a public dataset, "
        "not a medically validated model. It must not be used for diagnosis or treatment."
    )


if __name__ == "__main__":
    try:
        train()
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(f"Heart model training failed: {error}") from error
