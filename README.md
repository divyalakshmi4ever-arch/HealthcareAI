# 🏥 HealthcareAI — Hackathon Web Application Prototype

An intelligent preventive health screening and virtual clinical triage web prototype built with HTML5, CSS3, and JavaScript.

> [!IMPORTANT]
> **⚠️ NON-DIAGNOSTIC HACKATHON PROTOTYPE DISCLAIMER**  
> HealthcareAI is an interactive prototype developed for demonstration and educational evaluation during hackathons. **It does not provide medical diagnoses, clinical treatment advice, or validated AI forecasts.** All risk percentages and doctor chat exchanges are deterministic simulations based on synthetic sample datasets. For real medical concerns, always consult a licensed healthcare professional.

---

## 🌟 Application Features & Pages

1. **Home Page (`index.html`)**
   - Hackathon project mission and architectural pillars.
   - Interactive overview cards linking to all platform modules.
   - 4-step triage flow diagram (Patient Input &rarr; Risk Engine &rarr; Explainability &rarr; Doctor Triage).
   - High-visibility safety and research disclaimers.

2. **Patient Dashboard (`dashboard.html`)**
   - Patient identity overview (Sarah Jenkins, 42, ID: `HC-2026-981`).
   - 6 Live Wearable Biomarker Cards (Heart Rate, Blood Pressure, Fasting Glucose, SpO2, BMI, Sleep Duration).
   - Interactive SVG 7-day systolic/diastolic blood pressure & heart rate visualizer.
   - Synced AI Risk stratification badge and upcoming teleconsultation schedule.

3. **Health Risk Screening Form & Symptom Checker (`screening.html`)**
   - 3-step structured clinical questionnaire:
     - **Step 1:** Demographics & Lifestyle (Age, Sex, Activity level, Height/Weight, Smoking history).
     - **Step 2:** Clinical Biometrics (Systolic/Diastolic BP, Glucose, Cholesterol).
     - **Step 3:** Symptom Checklist & Genetic Family History.
   - **✨ 1-Click "Fill Demo Data" button** for fast, frictionless judging presentations.

4. **Screening Results & AI Risk Prediction Demo (`results.html`)**
   - Large primary non-diagnostic safety disclaimer.
   - Dynamic SVG semi-circle gauge displaying composite risk index (0–100).
   - Transparent feature attribution breakdown explaining key contributors.
   - Biomarker status table with clinical reference ranges.
   - Actionable lifestyle guidance and direct 1-click transition to remote doctor consultation.

5. **Remote Doctor Teleconsultation (`consultation.html`)**
   - Interactive simulated telehealth room with Dr. Elena Rostova.
   - Active call timer counter, mute/unmute mic toggle, and camera on/off controls.
   - Real-time clinical chat simulator where the doctor answers patient questions.
   - Specialist network directory with credentials, ratings, and hospital affiliations.
   - Appointment scheduling modal that saves confirmed bookings to local storage.

6. **Electronic Health Records (`records.html`)**
   - Centralized patient EMR summary.
   - Filterable diagnostic archive (Laboratory, Cardiology, Immunization).
   - Interactive "Upload / Add Record" modal with instant UI updates.

---

## 📁 Project File Structure

```text
HealthcareAI/
├── index.html              # Home page & project introduction
├── dashboard.html          # Patient health dashboard & vitals
├── screening.html          # Multi-step health risk screening form
├── results.html            # AI disease-risk prediction results & disclaimer
├── records.html            # Electronic health records & lab reports
├── consultation.html       # Remote doctor consultation & video room
├── css/
│   └── styles.css          # Modern healthcare design system & responsive CSS
├── js/
│   ├── app.js              # Global sample data, local storage & toasts
│   ├── screening.js        # Multi-step form validation & risk engine
│   └── consultation.js     # Telehealth room controls & simulated chat
└── README.md               # Documentation & local setup guide
```

---

## 🚀 How to Run Locally

To use the saved diabetes, heart, and kidney model demonstrations, run the Flask
application. The existing static-only options below remain available for the
original front-end experience without model predictions.

### Flask application with ML model demonstrations

From the `HealthcareAI` project directory, install dependencies and start Flask:

```bash
python -m pip install -r ml/requirements.txt
python app.py
```

Open **http://127.0.0.1:5000**. The prediction panel is on the Risk Screening
page. The application loads the existing files in `ml/models/`; it does not
retrain or replace them. Predictions are educational demonstrations, not
medically validated, and must not be used for diagnosis or treatment.

### Existing static-only ways to run the front end

### Option 1: Direct Browser Launch (No installation required)
Simply double-click `index.html` in your file explorer, or right-click `index.html` and select **Open with &rarr; Google Chrome** (or Edge, Firefox, Safari).

### Option 2: Python Local Server (Recommended)
Open PowerShell or your terminal in the `HealthcareAI` directory and run:

```bash
# Python 3
python -m http.server 8000
```
Then open your browser at:  
👉 **http://localhost:8000**

### Option 3: Node.js / npx serve
```bash
npx serve .
```
Then open the local URL shown in your terminal (typically `http://localhost:3000`).

### Option 4: VS Code Live Server
If you are using Visual Studio Code, right-click `index.html` and choose **"Open with Live Server"**.

---

## 🎯 Demo Walkthrough Script for Hackathon Judges

1. Start at `index.html` — showcase the problem statement and the core pillars.
2. Click **"Launch Health Risk Screening"** to navigate to `screening.html`.
3. Click the top button **"✨ Fill Demo Data"** to auto-populate sample patient biometrics.
4. Advance through the 3 steps and click **"Generate AI Risk Stratification"**.
5. On `results.html`, highlight the **safety disclaimer**, the **dynamic risk score gauge**, and the **explainability factor breakdown**.
6. Click **"Start Virtual Doctor Consultation Now"** to open `consultation.html`.
7. Demonstrate the live call controls (mute microphone, toggle camera, chat with Dr. Rostova).
8. Navigate to `dashboard.html` and `records.html` to showcase the unified patient health timeline.
