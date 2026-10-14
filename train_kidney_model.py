"""
HealthcareAI - Chronic Kidney Disease Model Training
----------------------------------------------------
Loads and trains on the Chronic Kidney Disease ARFF dataset.

DISCLAIMER:
This is an educational demonstration using a public dataset, not a medically
validated model. It must not be used for diagnosis or treatment.
"""

import json
import os
import re
from io import StringIO

import joblib
import numpy as np
import pandas as pd
from scipy.io import arff
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
DATA_PATH = os.path.join(BASE_DIR, "data", "chronic_kidney_disease.arff")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "kidney_model.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "kidney_features.json")
TARGET_COLUMN = "class"


def load_dataset():
    """Load ARFF data after explicitly handling malformed rows and missing markers."""
    print(f"Reading ARFF dataset: {DATA_PATH}")
    if not os.path.isfile(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    try:
        with open(DATA_PATH, encoding="utf-8") as dataset_file:
            lines = dataset_file.read().splitlines()
    except (OSError, UnicodeDecodeError) as error:
        raise ValueError(f"Could not read ARFF dataset: {error}") from error

    attribute_count = sum(
        bool(re.match(r"^\s*@attribute\b", line, flags=re.IGNORECASE))
        for line in lines
    )
    data_marker = next(
        (index for index, line in enumerate(lines) if line.strip().lower() == "@data"),
        None,
    )
    if attribute_count == 0 or data_marker is None:
        raise ValueError("ARFF file must declare attributes and contain an @data section.")

    cleaned_lines = lines[: data_marker + 1]
    malformed_rows = []
    trimmed_trailing_fields = 0
    empty_fields_marked_missing = 0

    for line_number, line in enumerate(lines[data_marker + 1 :], data_marker + 2):
        if not line.strip() or line.lstrip().startswith("%"):
            cleaned_lines.append(line)
            continue

        values = [value.strip() for value in line.split(",")]
        if len(values) == attribute_count + 1 and values[-1] == "":
            values.pop()
            trimmed_trailing_fields += 1

        if len(values) != attribute_count:
            malformed_rows.append((line_number, len(values)))
            continue

        empty_fields_marked_missing += sum(value == "" for value in values)
        cleaned_lines.append(",".join(value if value else "?" for value in values))

    if trimmed_trailing_fields:
        print(
            "Trimmed "
            f"{trimmed_trailing_fields} extra empty trailing field(s) in ARFF records."
        )
    if empty_fields_marked_missing:
        print(
            "Converted "
            f"{empty_fields_marked_missing} empty field(s) to missing markers."
        )
    for line_number, field_count in malformed_rows:
        print(
            f"Skipping malformed ARFF record at line {line_number}: "
            f"found {field_count} fields; expected {attribute_count}."
        )

    try:
        records, _ = arff.loadarff(StringIO("\n".join(cleaned_lines)))
    except (ValueError, UnicodeDecodeError) as error:
        raise ValueError(f"Could not parse ARFF records: {error}") from error

    frame = pd.DataFrame(records)
    if frame.empty:
        raise ValueError("No valid records were found in the ARFF dataset.")
    if frame.columns.duplicated().any():
        raise ValueError("ARFF dataset contains duplicate attribute names.")
    if TARGET_COLUMN not in frame.columns:
        raise ValueError(
            f"Expected target column '{TARGET_COLUMN}' was not found. "
            f"Available columns: {', '.join(frame.columns)}"
        )

    for column in frame.select_dtypes(include=["object"]).columns:
        frame[column] = frame[column].map(
            lambda value: value.decode("utf-8").strip()
            if isinstance(value, bytes)
            else value.strip()
            if isinstance(value, str)
            else value
        )
    frame = frame.replace("?", np.nan)

    print(
        f"Loaded {len(frame)} valid records and {len(frame.columns)} attributes. "
        f"Found {int(frame.isna().sum().sum())} missing values."
    )
    return frame


def train():
    """Train, evaluate, and save the kidney disease classifier."""
    print("Starting Chronic Kidney Disease model training...")
    frame = load_dataset()

    feature_columns = [column for column in frame.columns if column != TARGET_COLUMN]
    if not feature_columns:
        raise ValueError("Dataset does not contain any feature columns.")

    valid_target = frame[TARGET_COLUMN].notna()
    missing_target_count = int((~valid_target).sum())
    if missing_target_count:
        print(
            f"Dropping {missing_target_count} record(s) with missing target labels; "
            "target labels are never imputed."
        )

    X = frame.loc[valid_target, feature_columns].copy()
    target_labels = frame.loc[valid_target, TARGET_COLUMN].astype(str).str.strip()
    observed_labels = set(target_labels.unique())
    if observed_labels != {"ckd", "notckd"}:
        raise ValueError(
            "Expected observed target labels 'ckd' and 'notckd'; found "
            f"{sorted(observed_labels)}. No target labels were created."
        )

    label_mapping = {"notckd": 0, "ckd": 1}
    y = target_labels.map(label_mapping)

    numeric_features = [
        column
        for column in feature_columns
        if pd.api.types.is_numeric_dtype(X[column].dtype)
    ]
    categorical_features = [
        column
        for column in feature_columns
        if pd.api.types.is_object_dtype(X[column].dtype)
        or pd.api.types.is_string_dtype(X[column].dtype)
        or X[column].dtype.name == "category"
    ]
    unsupported_features = [
        column
        for column in feature_columns
        if column not in numeric_features and column not in categorical_features
    ]
    if unsupported_features:
        raise ValueError(
            "Unsupported feature data types: " + ", ".join(unsupported_features)
        )

    entirely_missing_numeric = [
        column for column in numeric_features if X[column].isna().all()
    ]
    if entirely_missing_numeric:
        raise ValueError(
            "Cannot safely impute numeric features with no observed values: "
            + ", ".join(entirely_missing_numeric)
        )

    print(f"Target labels: {label_mapping} (CKD is the positive class).")
    print(
        f"Features: {len(feature_columns)} total; {len(numeric_features)} numeric, "
        f"{len(categorical_features)} categorical."
    )
    print(
        "Pipeline preprocessing: numeric values use training-set medians; "
        "categorical missing values are retained as an explicit missing category."
    )

    transformers = []
    if numeric_features:
        numeric_pipeline = Pipeline(
            steps=[("imputer", SimpleImputer(strategy="median"))]
        )
        transformers.append(("numeric", numeric_pipeline, numeric_features))
    if categorical_features:
        categorical_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(strategy="constant", fill_value="__missing__"),
                ),
                ("onehot", OneHotEncoder(handle_unknown="ignore")),
            ]
        )
        transformers.append(("categorical", categorical_pipeline, categorical_features))

    preprocessing = ColumnTransformer(transformers=transformers)
    model = Pipeline(
        steps=[
            ("preprocessor", preprocessing),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=100,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )

    stratify_target = y if y.value_counts().min() >= 2 else None
    if stratify_target is None:
        print(
            "Warning: stratified splitting is not possible with fewer than "
            "two records in a target class; using an unstratified split."
        )
    else:
        print("Splitting data with stratification (test_size=0.2, random_state=42)...")

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=stratify_target,
        )
    except ValueError as error:
        if stratify_target is None:
            raise ValueError(f"Could not split dataset into train and test sets: {error}") from error
        print(f"Stratified split unavailable ({error}); retrying without stratification.")
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
        except ValueError as fallback_error:
            raise ValueError(
                f"Could not create a train/test split: {fallback_error}"
            ) from fallback_error

    print(f"Training records: {len(X_train)} | Test records: {len(X_test)}")
    print("Fitting RandomForestClassifier pipeline...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    print("Test-set metrics (positive class: ckd):")
    print(f"  Accuracy:  {accuracy_score(y_test, predictions):.4f}")
    print(
        f"  Precision: {precision_score(y_test, predictions, pos_label=1, zero_division=0):.4f}"
    )
    print(
        f"  Recall:    {recall_score(y_test, predictions, pos_label=1, zero_division=0):.4f}"
    )
    print(
        f"  F1-score:  {f1_score(y_test, predictions, pos_label=1, zero_division=0):.4f}"
    )
    print("  Confusion matrix (rows/columns ordered: notckd=0, ckd=1):")
    print(confusion_matrix(y_test, predictions, labels=[0, 1]))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    feature_information = {
        "target_column": TARGET_COLUMN,
        "target_labels": label_mapping,
        "positive_class": "ckd",
        "features": feature_columns,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "missing_value_preprocessing": {
            "numeric": "median imputation fitted on training data",
            "categorical": "explicit __missing__ category",
        },
    }
    with open(FEATURES_PATH, "w", encoding="utf-8") as feature_file:
        json.dump(feature_information, feature_file, indent=2)

    print(f"Pipeline saved to: {MODEL_PATH}")
    print(f"Feature information saved to: {FEATURES_PATH}")
    print(
        "DISCLAIMER: This is an educational demonstration using a public dataset, "
        "not a medically validated model. It must not be used for diagnosis or treatment."
    )


if __name__ == "__main__":
    try:
        train()
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(f"Training failed: {error}") from error
