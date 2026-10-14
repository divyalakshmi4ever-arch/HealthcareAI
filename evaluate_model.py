"""
HealthcareAI - Random Forest Classifier Evaluation Module
---------------------------------------------------------
Evaluates the trained Random Forest model on the holdout test dataset.
Reports Precision, Recall, F1-score, Confusion Matrix, and Feature Importances.

DISCLAIMER:
This evaluation is based exclusively on synthetic data for demonstration purposes.
It DOES NOT represent real clinical validation.
"""

import os
import json
import pandas as pd
from sklearn.metrics import (
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    classification_report
)
import joblib

BASE_DIR = os.path.dirname(__file__)
TEST_DATA_PATH = os.path.join(BASE_DIR, "data", "test_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "rf_risk_model.joblib")
FEATURES_PATH = os.path.join(BASE_DIR, "models", "feature_names.json")

def evaluate():
    # 1. Verify model artifact exists
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Auto-running train_model.py first...")
        import train_model
        train_model.train()
    
    # 2. Load model and features
    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        feature_cols = json.load(f)
    
    # 3. Load test partition
    test_df = pd.read_csv(TEST_DATA_PATH)
    X_test = test_df[feature_cols]
    y_test = test_df["risk_label"]
    
    # 4. Generate predictions
    y_pred = model.predict(X_test)
    
    # 5. Compute core evaluation metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    # 6. Formatted Output Display
    print("=" * 72)
    print("    HEALTHCARE AI - RANDOM FOREST MODEL EVALUATION REPORT")
    print("=" * 72)
    print(f"📊 Total Holdout Test Samples: {len(y_test)}")
    print("-" * 72)
    print("🎯 CORE PERFORMANCE METRICS:")
    print(f"  • Accuracy:        {acc * 100:.2f}%")
    print(f"  • Precision:       {prec * 100:.2f}%  (True positives / All predicted elevated)")
    print(f"  • Recall:          {rec * 100:.2f}%  (True positives / All actual elevated)")
    print(f"  • F1-Score:        {f1:.4f}   (Harmonic mean of precision & recall)")
    print("-" * 72)
    
    # 7. Formatted Confusion Matrix
    print("🧮 CONFUSION MATRIX (Holdout Test Set):")
    print("  " + "-" * 56)
    print(f"  {'':<22} | {'Predicted Standard (0)':<16} | {'Predicted Elevated (1)':<16}")
    print("  " + "-" * 56)
    print(f"  {'Actual Standard (0)':<22} | {tn:<22} | {fp:<22} (False Positives)")
    print(f"  {'Actual Elevated (1)':<22} | {fn:<22} | {tp:<22} (True Positives)")
    print("  " + "-" * 56)
    print(f"  TN = {tn} (Correctly classified Standard Risk)")
    print(f"  FP = {fp} (Standard Risk flagged as Elevated)")
    print(f"  FN = {fn} (Elevated Risk missed - critical metric in healthcare)")
    print(f"  TP = {tp} (Correctly classified Elevated Risk)")
    print("-" * 72)
    
    # 8. Detailed Scikit-Learn Classification Report
    print("📋 DETAILED CLASSIFICATION REPORT:")
    target_names = ["Standard Risk (0)", "Elevated Risk (1)"]
    print(classification_report(y_test, y_pred, target_names=target_names, digits=4))
    print("-" * 72)
    
    # 9. Top Feature Importances
    importances = model.feature_importances_
    feat_importance_pairs = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    
    print("🌲 TOP PREDICTIVE FEATURES (Random Forest Importance Ranking):")
    for rank, (feat, imp) in enumerate(feat_importance_pairs[:8], 1):
        bar = "█" * int(imp * 40)
        print(f"  {rank:2d}. {feat:<30} {imp * 100:5.1f}%  {bar}")
    print("-" * 72)
    
    # 10. Non-Clinical Disclaimer
    print("⚠️  NON-CLINICAL DEMONSTRATION DISCLAIMER:")
    print("  1. This model was trained on synthetic demonstration data.")
    print("  2. Synthetic data performance metrics DO NOT imply real-world clinical validity.")
    print("  3. This module is strictly a technology demonstration for our hackathon project.")
    print("  4. It must NEVER be used to make diagnostic or therapeutic decisions.")
    print("=" * 72)

if __name__ == "__main__":
    evaluate()
