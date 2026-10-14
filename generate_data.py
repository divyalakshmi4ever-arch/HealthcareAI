"""
HealthcareAI - Synthetic Dataset Generator
------------------------------------------
Generates a labelled synthetic dataset representing cardiovascular & metabolic
screening indicators for machine learning demonstration.

DISCLAIMER:
This dataset is purely synthetic and generated for educational and hackathon
demonstration purposes only. It DOES NOT represent real patient clinical data
and must NOT be used for real-world medical diagnosis or treatment decisions.
"""

import os
import csv
import random
import math

# Fixed seed for 100% reproducible demonstration results
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

TOTAL_SAMPLES = 1200
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "synthetic_risk_data.csv")

def generate_patient_record(patient_idx: int) -> dict:
    """Generate a single realistic synthetic patient screening record."""
    # Demographics
    age = random.randint(20, 80)
    gender = random.choice([0, 1])  # 0: Female, 1: Male
    
    # Body Mass Index (normal distribution around mean 26.5)
    bmi = round(random.gauss(26.5, 4.5), 1)
    bmi = max(17.5, min(42.0, bmi))
    
    # Blood Pressure (Systolic & Diastolic)
    systolic_bp = int(random.gauss(126, 18))
    systolic_bp = max(90, min(190, systolic_bp))
    
    # Diastolic usually correlates with systolic
    diastolic_bp = int(systolic_bp * 0.65 + random.gauss(0, 6))
    diastolic_bp = max(60, min(120, diastolic_bp))
    
    # Fasting Glucose (mg/dL)
    glucose = int(random.gauss(100, 24))
    glucose = max(70, min(240, glucose))
    
    # Total Cholesterol (mg/dL)
    cholesterol = int(random.gauss(195, 35))
    cholesterol = max(130, min(330, cholesterol))
    
    # Lifestyle factors
    activity_level = random.choices([0, 1, 2], weights=[0.35, 0.45, 0.20])[0]  # 0: Sedentary, 1: Moderate, 2: Active
    smoking_status = random.choices([0, 1, 2], weights=[0.60, 0.22, 0.18])[0]  # 0: Never, 1: Former, 2: Current
    
    # Symptoms (0: Absent, 1: Present)
    symptom_chest_tightness = 1 if (systolic_bp > 140 and random.random() < 0.25) or random.random() < 0.08 else 0
    symptom_shortness_breath = 1 if (bmi > 30 and random.random() < 0.30) or random.random() < 0.10 else 0
    symptom_fatigue = 1 if random.random() < 0.25 else 0
    
    # Family Medical History (0: No, 1: Yes)
    fam_cardiovascular = 1 if random.random() < 0.28 else 0
    fam_hypertension = 1 if random.random() < 0.40 else 0
    fam_diabetes = 1 if random.random() < 0.30 else 0
    
    # Synthetic ground truth risk calculation with clinical weighting + noise
    risk_score = 0
    
    # Age factor
    if age >= 60: risk_score += 20
    elif age >= 45: risk_score += 10
    
    # Blood pressure factor
    if systolic_bp >= 140 or diastolic_bp >= 90: risk_score += 25
    elif systolic_bp >= 130 or diastolic_bp >= 85: risk_score += 12
    
    # Glycemic factor
    if glucose >= 126: risk_score += 25
    elif glucose >= 100: risk_score += 10
    
    # BMI factor
    if bmi >= 30: risk_score += 15
    elif bmi >= 25: risk_score += 8
    
    # Smoking & activity
    if smoking_status == 2: risk_score += 18
    elif smoking_status == 1: risk_score += 6
    if activity_level == 0: risk_score += 10
    elif activity_level == 2: risk_score -= 8
    
    # Symptoms & genetics
    if symptom_chest_tightness == 1: risk_score += 16
    if symptom_shortness_breath == 1: risk_score += 10
    if fam_cardiovascular == 1: risk_score += 12
    if fam_hypertension == 1: risk_score += 8
    if fam_diabetes == 1: risk_score += 8
    
    # Add random biological variance / stochastic noise
    risk_score += random.gauss(0, 8)
    
    # Binary classification label:
    # 0 = Standard/Low Risk, 1 = Elevated Risk
    risk_label = 1 if risk_score >= 50 else 0
    
    return {
        "patient_id": f"SYN-{1000 + patient_idx}",
        "age": age,
        "gender": gender,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "fasting_glucose": glucose,
        "total_cholesterol": cholesterol,
        "activity_level": activity_level,
        "smoking_status": smoking_status,
        "symptom_chest_tightness": symptom_chest_tightness,
        "symptom_shortness_breath": symptom_shortness_breath,
        "symptom_fatigue": symptom_fatigue,
        "family_history_cardiovascular": fam_cardiovascular,
        "family_history_hypertension": fam_hypertension,
        "family_history_diabetes": fam_diabetes,
        "risk_label": risk_label
    }

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    records = [generate_patient_record(i) for i in range(TOTAL_SAMPLES)]
    fieldnames = list(records[0].keys())
    
    with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    
    pos_count = sum(r["risk_label"] for r in records)
    neg_count = TOTAL_SAMPLES - pos_count
    
    print("=" * 70)
    print("  HEALTHCARE AI - SYNTHETIC DATASET GENERATION COMPLETE")
    print("=" * 70)
    print(f"📁 Output file:      {OUTPUT_FILE}")
    print(f"📊 Total records:    {TOTAL_SAMPLES}")
    print(f"🏷️  Elevated Risk (1): {pos_count} ({pos_count / TOTAL_SAMPLES * 100:.1f}%)")
    print(f"🏷️  Standard Risk (0): {neg_count} ({neg_count / TOTAL_SAMPLES * 100:.1f}%)")
    print("-" * 70)
    print("⚠️  DEMONSTRATION DISCLAIMER:")
    print("This dataset is purely synthetic for hackathon technology demonstration.")
    print("It does NOT contain real patient data and CANNOT be used for real medical diagnosis.")
    print("=" * 70)

if __name__ == "__main__":
    main()
