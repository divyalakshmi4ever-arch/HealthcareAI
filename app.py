"""Flask application for the HealthcareAI educational ML demonstrations."""

import json
import math
import os
import warnings
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from sklearn.exceptions import InconsistentVersionWarning
from werkzeug.exceptions import BadRequest

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(PROJECT_DIR, "ml", "models")
PAGE_NAMES = {
    "index.html",
    "dashboard.html",
    "screening.html",
    "results.html",
    "records.html",
    "report.html",
    "consultation.html",
}
MODEL_NAMES = ("diabetes", "heart", "kidney")
DISCLAIMER = (
    "Educational demonstration only. These predictions are not medically "
    "validated and must not be used for diagnosis or treatment."
)

app = Flask(__name__, static_folder=None)


def _read_feature_metadata(name):
    metadata_path = os.path.join(MODEL_DIR, f"{name}_features.json")
    try:
        with open(metadata_path, encoding="utf-8") as metadata_file:
            return json.load(metadata_file)
    except FileNotFoundError as error:
        raise RuntimeError(f"Feature metadata is missing for the {name} model.") from error
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Feature metadata for the {name} model is invalid.") from error


@lru_cache(maxsize=len(MODEL_NAMES))
def _load_model(name):
    if name not in MODEL_NAMES:
        raise ValueError(f"Unknown model: {name}")

    model_path = os.path.join(MODEL_DIR, f"{name}_model.joblib")
    if not os.path.isfile(model_path):
        raise RuntimeError(f"Trained model is missing for {name}.")

    try:
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always", InconsistentVersionWarning)
            model = joblib.load(model_path)
        logged_warnings = set()
        for warning in caught:
            warning_key = (warning.category, str(warning.message))
            if warning_key in logged_warnings:
                continue
            logged_warnings.add(warning_key)
            app.logger.warning(
                "%s while loading %s: %s",
                warning.category.__name__,
                name,
                warning.message,
            )
    except (OSError, ValueError, EOFError, ImportError) as error:
        raise RuntimeError(f"Could not load the saved {name} model: {error}") from error

    return model


def _feature_schema(name, metadata, model):
    if name == "diabetes":
        if not isinstance(metadata, list) or not metadata:
            raise RuntimeError("Diabetes feature metadata must be a non-empty list.")
        numeric_features = metadata
        categorical_features = []
    else:
        if not isinstance(metadata, dict):
            raise RuntimeError(f"{name.title()} feature metadata must be an object.")
        numeric_features = metadata.get("numeric_features")
        categorical_features = metadata.get("categorical_features")
        if not isinstance(numeric_features, list) or not isinstance(
            categorical_features, list
        ):
            raise RuntimeError(f"{name.title()} feature types are missing from metadata.")
        features = metadata.get("features")
        if not isinstance(features, list) or set(features) != set(
            numeric_features + categorical_features
        ):
            raise RuntimeError(f"{name.title()} feature metadata is inconsistent.")

    if not all(isinstance(column, str) for column in numeric_features):
        raise RuntimeError(f"{name.title()} numeric feature names are invalid.")

    categories = {}
    if categorical_features:
        try:
            preprocessor = model.named_steps["preprocessor"]
            for transformer_name, transformer, columns in preprocessor.transformers_:
                if transformer_name == "remainder":
                    continue
                if not hasattr(transformer, "named_steps"):
                    continue
                encoder = transformer.named_steps.get("onehot")
                if encoder is None:
                    continue
                categories.update(
                    {
                        column: [
                            value
                            for value in values.tolist()
                            if value != "__missing__"
                        ]
                        for column, values in zip(columns, encoder.categories_)
                    }
                )
        except (AttributeError, KeyError, TypeError, ValueError) as error:
            raise RuntimeError(
                f"Could not read fitted category values for {name}."
            ) from error
        if set(categories) != set(categorical_features):
            raise RuntimeError(
                f"Fitted category values do not match {name} feature metadata."
            )

    features = numeric_features + categorical_features
    return [
        {
            "name": column,
            "kind": "numeric" if column in numeric_features else "categorical",
            "required": name == "diabetes",
            "allowed_values": categories.get(column, []),
        }
        for column in features
    ]


@lru_cache(maxsize=len(MODEL_NAMES))
def _model_config(name):
    metadata = _read_feature_metadata(name)
    model = _load_model(name)
    schema = _feature_schema(name, metadata, model)
    if set(model.classes_) != {0, 1} and set(model.classes_) != {0.0, 1.0}:
        raise RuntimeError(f"The saved {name} model does not expose binary classes 0 and 1.")

    if name == "diabetes":
        labels = {"0": "No diabetes (class 0)", "1": "Diabetes (class 1)"}
        positive_class = 1
    elif name == "heart":
        labels = {
            "0": "No heart disease (class 0)",
            "1": "Heart disease present (class 1)",
        }
        positive_class = 1
    else:
        mapping = metadata.get("target_labels", {})
        labels = {
            str(value): "Chronic kidney disease (class 1)"
            if label == metadata.get("positive_class")
            else "No chronic kidney disease (class 0)"
            for label, value in mapping.items()
        }
        positive_class = mapping.get(metadata.get("positive_class"))
        if positive_class not in (0, 1):
            raise RuntimeError("Kidney target label metadata is inconsistent.")

    return {
        "name": name,
        "metadata": metadata,
        "model": model,
        "features": schema,
        "labels": labels,
        "positive_class": positive_class,
    }


def _model_summaries():
    summaries = []
    for name in MODEL_NAMES:
        config = _model_config(name)
        summaries.append(
            {
                "id": name,
                "name": name.title(),
                "features": config["features"],
                "feature_count": len(config["features"]),
                "positive_class": config["labels"][str(config["positive_class"])],
                "disclaimer": DISCLAIMER,
            }
        )
    return summaries


def _validate_features(config, payload):
    if not isinstance(payload, dict):
        return None, "The request body must be a JSON object."
    features = payload.get("features")
    if not isinstance(features, dict):
        return None, "Provide inputs as an object in the 'features' field."

    schema_by_name = {feature["name"]: feature for feature in config["features"]}
    expected = set(schema_by_name)
    supplied = set(features)
    missing = expected - supplied
    unexpected = supplied - expected
    if missing:
        return None, f"Missing required feature(s): {', '.join(sorted(missing))}."
    if unexpected:
        return None, f"Unexpected feature(s): {', '.join(sorted(unexpected))}."

    values = {}
    errors = []
    for name, definition in schema_by_name.items():
        value = features[name]
        if value is None or value == "":
            if definition["required"]:
                errors.append(f"{name} is required and must be numeric.")
            else:
                values[name] = np.nan
            continue

        if definition["kind"] == "numeric":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors.append(f"{name} must be a JSON number.")
            elif not math.isfinite(value):
                errors.append(f"{name} must be finite.")
            else:
                values[name] = value
            continue

        allowed = definition["allowed_values"]
        matches_category = any(
            (
                isinstance(value, (int, float))
                and not isinstance(value, bool)
                and isinstance(candidate, (int, float))
                and not isinstance(candidate, bool)
                and value == candidate
            )
            or (type(value) is type(candidate) and value == candidate)
            for candidate in allowed
        )
        if not matches_category:
            errors.append(f"{name} must be one of the model's allowed categories.")
        else:
            values[name] = value

    if errors:
        return None, " ".join(errors)
    return pd.DataFrame([values]), None


@app.get("/")
def index():
    return send_from_directory(PROJECT_DIR, "index.html")


@app.get("/<path:page_name>")
def page(page_name):
    if page_name not in PAGE_NAMES:
        return jsonify(error="Page not found."), 404
    return send_from_directory(PROJECT_DIR, page_name)


@app.get("/css/<path:filename>")
def css_file(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, "css"), filename)


@app.get("/js/<path:filename>")
def javascript_file(filename):
    return send_from_directory(os.path.join(PROJECT_DIR, "js"), filename)


@app.get("/sample_report.pdf")
def sample_report():
    return send_from_directory(PROJECT_DIR, "sample_report.pdf")


@app.get("/api/models")
def list_models():
    try:
        return jsonify(models=_model_summaries(), disclaimer=DISCLAIMER)
    except (RuntimeError, OSError) as error:
        app.logger.exception("Could not load model metadata.")
        return jsonify(error=str(error), disclaimer=DISCLAIMER), 503


@app.post("/api/predict/<name>")
def predict(name):
    if name not in MODEL_NAMES:
        return jsonify(error="Unknown model. Choose diabetes, heart, or kidney."), 404
    if not request.is_json:
        return jsonify(error="Content-Type must be application/json."), 400
    try:
        payload = request.get_json()
    except BadRequest:
        return jsonify(error="Request body must contain valid JSON."), 400

    try:
        config = _model_config(name)
    except (RuntimeError, OSError, ValueError) as error:
        app.logger.exception("Model unavailable: %s", name)
        return jsonify(error=str(error), disclaimer=DISCLAIMER), 503

    frame, validation_error = _validate_features(config, payload)
    if validation_error:
        return jsonify(error=validation_error, disclaimer=DISCLAIMER), 400

    try:
        model = config["model"]
        prediction = model.predict(frame)[0]
        probabilities = model.predict_proba(frame)[0]
        probability_by_class = {
            str(int(label)): float(probability)
            for label, probability in zip(model.classes_, probabilities)
        }
        prediction_key = str(int(prediction))
        positive_class_key = str(int(config["positive_class"]))
        return jsonify(
            model=name,
            prediction={
                "value": int(prediction),
                "label": config["labels"][prediction_key],
                "model_score": round(probability_by_class[prediction_key], 4),
            },
            positive_class_probability=round(
                probability_by_class[positive_class_key], 4
            ),
            disclaimer=DISCLAIMER,
        )
    except (ValueError, TypeError, KeyError, AttributeError) as error:
        app.logger.exception("Prediction failed for %s.", name)
        return jsonify(error=f"Prediction could not be completed: {error}", disclaimer=DISCLAIMER), 422


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
