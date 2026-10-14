# 🌲 HealthcareAI — Machine Learning Module

A standalone Python machine learning demonstration module for the HealthcareAI hackathon project. Trains and evaluates a **Random Forest Classifier** on a synthetic cardiovascular & metabolic health screening dataset.

> [!CAUTION]
> **⚠️ NON-CLINICAL / SYNTHETIC DATA DISCLAIMER**  
> This machine learning module is strictly an educational and technological demonstration built for hackathon evaluation. **It was trained on synthetic data and DOES NOT produce a medically valid model.** It must never be used for actual medical screening, clinical diagnosis, or patient care.

---

## 📁 Directory Structure

```text
HealthcareAI/
└── ml/
    ├── requirements.txt         # Required Python packages
    ├── generate_data.py         # Generates labelled synthetic dataset
    ├── train_model.py           # Trains Random Forest & saves model file
    ├── evaluate_model.py        # Computes Precision, Recall, F1 & Confusion Matrix
    ├── README.md                # Execution guide & documentation
    ├── data/
    │   ├── synthetic_risk_data.csv   # Generated 1,200 synthetic records
    │   └── test_data.csv             # Holdout 20% test partition
    └── models/
        ├── rf_risk_model.joblib      # Serialized trained model
        └── feature_names.json        # Ordered feature schema
```

---

## 💻 Exact Commands to Run in VS Code

Open a terminal in VS Code (`Ctrl + ` ` or **Terminal &rarr; New Terminal**) inside your `HealthcareAI` project directory:

### Step 1: Install Required Packages
```bash
pip install -r ml/requirements.txt
```
*(Requires: `numpy`, `pandas`, `scikit-learn`, `joblib`)*

---

### Step 2: Generate the Synthetic Dataset
```bash
python ml/generate_data.py
```
**Output:** Creates `ml/data/synthetic_risk_data.csv` with 1,200 labelled synthetic patient records across 16 biometric and lifestyle features.

---

### Step 3: Train the Random Forest Classifier & Save Model
```bash
python ml/train_model.py
```
**Output:**
- Splits data 80% train / 20% test.
- Trains `RandomForestClassifier(n_estimators=100, max_depth=6)`.
- Persists the trained model to `ml/models/rf_risk_model.joblib`.
- Saves feature names list to `ml/models/feature_names.json`.
- Saves test set to `ml/data/test_data.csv`.

---

### Step 4: Evaluate the Model (Metrics & Confusion Matrix)
```bash
python ml/evaluate_model.py
```
**Output:**
- **Accuracy**, **Precision**, **Recall**, and **F1-Score**.
- **Confusion Matrix** with clear labels for True Positives, False Positives, False Negatives, and True Negatives.
- Detailed scikit-learn **Classification Report**.
- **Top Predictive Features** ranking (Feature Importances).
- Prominent non-clinical safety disclaimer.

---

## 📊 Feature Schema

| Feature Name | Type | Description |
|---|---|---|
| `age` | Integer | Patient age (20 - 80) |
| `gender` | Binary | 0 = Female, 1 = Male |
| `bmi` | Float | Body Mass Index (17.5 - 42.0 kg/m²) |
| `systolic_bp` | Integer | Systolic Blood Pressure (90 - 190 mmHg) |
| `diastolic_bp` | Integer | Diastolic Blood Pressure (60 - 120 mmHg) |
| `fasting_glucose` | Integer | Fasting Blood Glucose (70 - 240 mg/dL) |
| `total_cholesterol` | Integer | Total Serum Cholesterol (130 - 330 mg/dL) |
| `activity_level` | Categorical | 0 = Sedentary, 1 = Moderate, 2 = Active |
| `smoking_status` | Categorical | 0 = Never, 1 = Former, 2 = Current |
| `symptom_chest_tightness` | Binary | 0 = Absent, 1 = Present |
| `symptom_shortness_breath` | Binary | 0 = Absent, 1 = Present |
| `symptom_fatigue` | Binary | 0 = Absent, 1 = Present |
| `family_history_cardiovascular`| Binary | 0 = No, 1 = Yes |
| `family_history_hypertension` | Binary | 0 = No, 1 = Yes |
| `family_history_diabetes` | Binary | 0 = No, 1 = Yes |
| **`risk_label` (Target)** | Binary | **0 = Standard Risk, 1 = Elevated Risk** |
