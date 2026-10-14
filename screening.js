/**
 * HealthcareAI - Health Risk Screening & Symptom Checker Engine
 * Hackathon Prototype Demonstration
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const totalSteps = 3;

  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnFillDemo = document.getElementById('btnFillDemo');
  const form = document.getElementById('screeningForm');

  function updateStepsUI() {
    // Show/hide step sections
    for (let i = 1; i <= totalSteps; i++) {
      const stepElem = document.getElementById(`step-${i}`);
      const stepIndicator = document.getElementById(`step-indicator-${i}`);
      if (stepElem) {
        stepElem.style.display = (i === currentStep) ? 'block' : 'none';
      }
      if (stepIndicator) {
        if (i < currentStep) {
          stepIndicator.className = 'step-item completed';
        } else if (i === currentStep) {
          stepIndicator.className = 'step-item active';
        } else {
          stepIndicator.className = 'step-item';
        }
      }
    }

    // Toggle button visibility
    if (btnPrev) {
      btnPrev.style.display = (currentStep === 1) ? 'none' : 'inline-flex';
    }
    if (btnNext) {
      btnNext.style.display = (currentStep === totalSteps) ? 'none' : 'inline-flex';
    }
    if (btnSubmit) {
      btnSubmit.style.display = (currentStep === totalSteps) ? 'inline-flex' : 'none';
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        updateStepsUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepsUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  let currentScreeningMode = 'patient';

  window.switchScreeningMode = function(mode) {
    currentScreeningMode = mode;
    const btnPatient = document.getElementById('btnModePatient');
    const btnWorker = document.getElementById('btnModeWorker');
    const workerSection = document.getElementById('workerAssistedSection');

    if (mode === 'health_worker') {
      if (btnWorker) btnWorker.classList.add('active');
      if (btnPatient) btnPatient.classList.remove('active');
      if (workerSection) workerSection.style.display = 'block';
      showToast("Switched to Health Worker Assisted Mode. Patient consent is required.", "info");
    } else {
      if (btnPatient) btnPatient.classList.add('active');
      if (btnWorker) btnWorker.classList.remove('active');
      if (workerSection) workerSection.style.display = 'none';
      showToast("Switched to Patient Self-Mode.", "info");
    }
  };

  function validateStep(step) {
    if (step === 1) {
      // Validate Assisted Health Worker Mode Consent
      if (currentScreeningMode === 'health_worker') {
        const consentBox = document.getElementById('consentCheckbox');
        const workerName = document.getElementById('workerName').value.trim();
        const workerId = document.getElementById('workerId').value.trim();

        if (!workerName || !workerId) {
          showToast("⚠️ Please enter the Field Worker Name and Health Worker ID.", "warning");
          return false;
        }

        if (!consentBox || !consentBox.checked) {
          showToast("⚠️ Patient Consent Required: You must check the consent verification box before proceeding.", "danger");
          if (consentBox) consentBox.focus();
          return false;
        }
      }

      const age = document.getElementById('age').value;
      if (!age || age < 1 || age > 120) {
        showToast('Please enter a valid age between 1 and 120.', 'warning');
        return false;
      }
    } else if (step === 2) {
      const systolic = document.getElementById('systolic').value;
      const diastolic = document.getElementById('diastolic').value;
      if (!systolic || !diastolic) {
        showToast('Please provide blood pressure values.', 'warning');
        return false;
      }
    }
    return true;
  }

  // Quick Demo Auto-Fill Handler
  if (btnFillDemo) {
    btnFillDemo.addEventListener('click', () => {
      // Step 1
      document.getElementById('patientName').value = "Sarah Jenkins";
      document.getElementById('age').value = "42";
      document.getElementById('gender').value = "female";
      document.getElementById('height').value = "168";
      document.getElementById('weight').value = "68.5";
      document.getElementById('activityLevel').value = "moderate";
      document.getElementById('smokingStatus').value = "never";

      // Step 2
      document.getElementById('systolic').value = "128";
      document.getElementById('diastolic').value = "84";
      document.getElementById('fastingGlucose').value = "98";
      document.getElementById('cholesterolLevel').value = "195";

      // Step 3
      const checkboxes = document.querySelectorAll('input[name="symptoms"]');
      checkboxes.forEach(cb => {
        cb.checked = (cb.value === "occasional_fatigue" || cb.value === "mild_headache");
      });

      const historyBoxes = document.querySelectorAll('input[name="familyHistory"]');
      historyBoxes.forEach(hb => {
        hb.checked = (hb.value === "hypertension");
      });

      document.dispatchEvent(new Event('screening-demo-filled'));
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const name = document.getElementById('patientName').value || "Demo Patient";
      const age = parseInt(document.getElementById('age').value, 10) || 40;
      const gender = document.getElementById('gender').value || "unspecified";
      const height = parseFloat(document.getElementById('height').value) || 170;
      const weight = parseFloat(document.getElementById('weight').value) || 70;
      const activity = document.getElementById('activityLevel').value;
      const smoking = document.getElementById('smokingStatus').value;

      const systolic = parseInt(document.getElementById('systolic').value, 10) || 120;
      const diastolic = parseInt(document.getElementById('diastolic').value, 10) || 80;
      const glucose = parseInt(document.getElementById('fastingGlucose').value, 10) || 95;
      const cholesterol = parseInt(document.getElementById('cholesterolLevel').value, 10) || 190;

      const selectedSymptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(el => el.value);
      const selectedHistory = Array.from(document.querySelectorAll('input[name="familyHistory"]:checked')).map(el => el.value);

      // Compute simulated risk index
      const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
      
      let baseScore = 15; // baseline index

      // Age contribution
      if (age > 50) baseScore += 12;
      else if (age > 40) baseScore += 6;

      // Blood pressure contribution
      if (systolic >= 140 || diastolic >= 90) baseScore += 24;
      else if (systolic >= 125 || diastolic >= 82) baseScore += 12;

      // Glucose contribution
      if (glucose >= 126) baseScore += 22;
      else if (glucose >= 100) baseScore += 10;

      // BMI contribution
      if (bmi >= 30) baseScore += 16;
      else if (bmi >= 25) baseScore += 8;

      // Smoking
      if (smoking === 'current') baseScore += 20;
      else if (smoking === 'former') baseScore += 6;

      // Activity
      if (activity === 'sedentary') baseScore += 10;
      else if (activity === 'active') baseScore -= 6;

      // Symptoms & History
      if (selectedSymptoms.includes('chest_tightness')) baseScore += 20;
      if (selectedSymptoms.includes('shortness_breath')) baseScore += 15;
      if (selectedHistory.includes('cardiovascular')) baseScore += 12;
      if (selectedHistory.includes('diabetes')) baseScore += 10;

      // Clamp score 5 - 95
      const riskScore = Math.min(Math.max(baseScore, 8), 92);

      let riskCategory = "low";
      let overallRisk = "Low Risk Profile";
      if (riskScore > 65) {
        riskCategory = "elevated";
        overallRisk = "Elevated Risk Profile";
      } else if (riskScore > 30) {
        riskCategory = "moderate";
        overallRisk = "Moderate Risk Profile";
      }

      // Build breakdown factors
      const factors = [
        {
          name: "Blood Pressure",
          value: `${systolic}/${diastolic} mmHg`,
          status: systolic > 130 ? "Elevated (Pre-hypertensive)" : "Within Acceptable Range",
          severity: systolic > 130 ? "warning" : "normal"
        },
        {
          name: "Body Mass Index (BMI)",
          value: `${bmi} kg/m²`,
          status: bmi >= 25 ? "Above optimal threshold" : "Optimal range",
          severity: bmi >= 25 ? "warning" : "normal"
        },
        {
          name: "Fasting Blood Glucose",
          value: `${glucose} mg/dL`,
          status: glucose >= 100 ? "Borderline pre-diabetic marker" : "Normal fasting range",
          severity: glucose >= 100 ? "warning" : "normal"
        },
        {
          name: "Total Cholesterol",
          value: `${cholesterol} mg/dL`,
          status: cholesterol > 200 ? "Borderline elevated" : "Desirable target",
          severity: cholesterol > 200 ? "warning" : "normal"
        },
        {
          name: "Lifestyle & Activity",
          value: activity.charAt(0).toUpperCase() + activity.slice(1),
          status: activity === 'sedentary' ? "Sedentary risk multiplier" : "Active metabolic protection",
          severity: activity === 'sedentary' ? "warning" : "normal"
        }
      ];

      // Generate explainability insights
      const aiInsights = [
        `Composite synthetic model assigns a risk index of ${riskScore}/100 based on standard epidemiological weightings.`,
        `Primary contributing indicators: ${systolic > 125 ? "Resting systolic pressure" : "Age profile"} and ${selectedHistory.length ? "familial risk factors" : "lifestyle biometrics"}.`,
        "This evaluation is generated by a deterministic hackathon demonstration algorithm and does NOT constitute clinical diagnosis."
      ];

      // Recommendations
      const recommendations = [
        {
          title: "Routine Vitals Log",
          desc: "Log daily resting blood pressure and heart rate using our Patient Dashboard to observe moving weekly averages."
        },
        {
          title: "Nutritional & Cardio Guidance",
          desc: "Adopt low-sodium Mediterranean or DASH dietary habits with 150 minutes of moderate aerobic activity weekly."
        },
        {
          title: "Doctor Teleconsultation",
          desc: "Schedule a virtual review with a board-certified physician to interpret these findings in comprehensive clinical context."
        }
      ];

      const assessmentResult = {
        timestamp: new Date().toISOString(),
        patientName: name,
        age: age,
        gender: gender,
        bmi: bmi,
        systolic: systolic,
        diastolic: diastolic,
        glucose: glucose,
        cholesterol: cholesterol,
        riskScore: riskScore,
        overallRisk: overallRisk,
        riskCategory: riskCategory,
        symptoms: selectedSymptoms,
        history: selectedHistory,
        screeningMode: currentScreeningMode,
        assistedBy: currentScreeningMode === 'health_worker' ? document.getElementById('workerName').value.trim() : null,
        workerId: currentScreeningMode === 'health_worker' ? document.getElementById('workerId').value.trim() : null,
        consentVerified: currentScreeningMode === 'health_worker' ? (document.getElementById('consentCheckbox') && document.getElementById('consentCheckbox').checked) : true,
        factors: factors,
        aiInsights: aiInsights,
        recommendations: recommendations
      };

      localStorage.setItem('currentAssessment', JSON.stringify(assessmentResult));

      // Show toast and redirect
      showToast("Assessment processed! Navigating to AI analysis...", "info");
      setTimeout(() => {
        window.location.href = "results.html";
      }, 700);
    });
  }

  // Initial step setup
  updateStepsUI();
});
