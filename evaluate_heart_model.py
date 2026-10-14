"""
Evaluate the saved heart disease model on its deterministic holdout split.

DISCLAIMER:
This is an educational demonstration using a public dataset, not a medically
validated model. It must not be used for diagnosis or treatment.
"""

import json
import os

import joblib

from train_heart_model import (
    FEATURES_PATH,
    MODEL_PATH,
    load_dataset,
    prepare_data,
    print_metrics,
    split_data,
)


def evaluate():
    """Load the saved model and report metrics for the fixed holdout split."""
    if not os.path.isfile(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained heart model not found: {MODEL_PATH}. "
            "Run train_heart_model.py first."
        )
    if not os.path.isfile(FEATURES_PATH):
        raise FileNotFoundError(f"Heart feature metadata not found: {FEATURES_PATH}")

    try:
        with open(FEATURES_PATH, encoding="utf-8") as metadata_file:
            metadata = json.load(metadata_file)
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Could not read heart feature metadata: {error}") from error

    feature_columns = metadata.get("features")
    if not isinstance(feature_columns, list) or not feature_columns:
        raise ValueError("Heart feature metadata does not contain a valid feature list.")

    model = joblib.load(MODEL_PATH)
    frame = load_dataset()
    X, y = prepare_data(frame)
    if X.columns.tolist() != feature_columns:
        raise ValueError(
            "Dataset feature columns do not match the columns used to train the model."
        )
    _, X_test, _, y_test = split_data(X, y)

    predictions = model.predict(X_test)
    print(f"Evaluated saved model on {len(X_test)} holdout records.")
    print_metrics(y_test, predictions)
    print(
        "DISCLAIMER: This is an educational demonstration using a public dataset, "
        "not a medically validated model. It must not be used for diagnosis or treatment."
    )


if __name__ == "__main__":
    try:
        evaluate()
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(f"Heart model evaluation failed: {error}") from error
