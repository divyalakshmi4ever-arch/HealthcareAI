document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('mlModelSelect');
  const description = document.getElementById('mlModelDescription');
  const featureFields = document.getElementById('mlFeatureFields');
  const form = document.getElementById('mlPredictionForm');
  const predictButton = document.getElementById('mlPredictButton');
  const status = document.getElementById('mlPredictionStatus');
  if (!modelSelect || !description || !featureFields || !form || !predictButton || !status) {
    return;
  }

  let models = [];
  let demoFillPending = false;
  const disclaimer =
    'Educational demonstration only. Predictions are not medically validated and must not be used for diagnosis or treatment.';

  const demoValues = {
    diabetes: {
      HighBP: 1,
      HighChol: 1,
      CholCheck: 1,
      BMI: 24.3,
      Smoker: 0,
      Stroke: 0,
      HeartDiseaseorAttack: 0,
      PhysActivity: 1,
      Fruits: 1,
      Veggies: 1,
      HvyAlcoholConsump: 0,
      AnyHealthcare: 1,
      NoDocbcCost: 0,
      GenHlth: 2,
      MentHlth: 0,
      PhysHlth: 0,
      DiffWalk: 0,
      Sex: 0,
      Age: 9,
      Education: 4,
      Income: 6
    },
    heart: {
      age: 63,
      sex: 1,
      cp: 1,
      trestbps: 145,
      chol: 233,
      fbs: 1,
      restecg: 2,
      thalach: 150,
      exang: 0,
      oldpeak: 2.3,
      slope: 3,
      ca: 0,
      thal: 6
    },
    kidney: {
      age: 48,
      bp: 80,
      sg: '1.020',
      al: '1',
      su: '0',
      rbc: 'normal',
      pc: 'normal',
      pcc: 'notpresent',
      ba: 'notpresent',
      bgr: 121,
      bu: 36,
      sc: 1.2,
      sod: 138,
      pot: 4.0,
      hemo: 15.4,
      pcv: 44,
      wbcc: 7800,
      rbcc: 5.2,
      htn: 'no',
      dm: 'no',
      cad: 'no',
      appet: 'good',
      pe: 'no',
      ane: 'no'
    }
  };

  function displayStatus(message, kind) {
    status.replaceChildren();
    if (!message) return;
    const alert = document.createElement('div');
    const alertClass = kind === 'error'
      ? 'alert-danger'
      : kind === 'success'
        ? 'alert-success'
        : 'alert-info';
    alert.className = `alert-box ${alertClass}`;
    const text = document.createElement('div');
    text.className = 'alert-text';
    text.textContent = message;
    alert.append(text);
    status.append(alert);
  }

  function readableName(name) {
    const labels = {
      HighBP: 'High blood pressure indicator',
      HighChol: 'High cholesterol indicator',
      CholCheck: 'Cholesterol check in past 5 years',
      BMI: 'Body mass index',
      Smoker: 'Smoking indicator',
      Stroke: 'Stroke indicator',
      HeartDiseaseorAttack: 'Heart disease or attack indicator',
      PhysActivity: 'Physical activity indicator',
      Fruits: 'Fruit consumption indicator',
      Veggies: 'Vegetable consumption indicator',
      HvyAlcoholConsump: 'Heavy alcohol consumption indicator',
      AnyHealthcare: 'Health care coverage indicator',
      NoDocbcCost: 'Unable to see doctor due to cost indicator',
      GenHlth: 'General health rating',
      MentHlth: 'Days of poor mental health',
      PhysHlth: 'Days of poor physical health',
      DiffWalk: 'Difficulty walking indicator',
      Sex: 'Sex category',
      Age: 'Age category',
      Education: 'Education category',
      Income: 'Income category',
      bp: 'Blood pressure',
      sg: 'Specific gravity',
      al: 'Albumin',
      su: 'Sugar',
      rbc: 'Red blood cells',
      pc: 'Pus cells',
      pcc: 'Pus cell clumps',
      ba: 'Bacteria',
      bgr: 'Blood glucose random',
      bu: 'Blood urea',
      sc: 'Serum creatinine',
      sod: 'Sodium',
      pot: 'Potassium',
      hemo: 'Hemoglobin',
      pcv: 'Packed cell volume',
      wbcc: 'White blood cell count',
      rbcc: 'Red blood cell count',
      htn: 'Hypertension indicator',
      dm: 'Diabetes mellitus indicator',
      cad: 'Coronary artery disease indicator',
      appet: 'Appetite',
      pe: 'Pedal edema indicator',
      ane: 'Anemia indicator',
      cp: 'Chest pain type',
      trestbps: 'Resting blood pressure',
      chol: 'Serum cholesterol',
      fbs: 'Fasting blood sugar category',
      restecg: 'Resting ECG category',
      thalach: 'Maximum heart rate achieved',
      exang: 'Exercise-induced angina indicator',
      oldpeak: 'ST depression',
      slope: 'ST segment slope',
      ca: 'Major vessels category',
      thal: 'Thalassemia category'
    };
    return labels[name] || name.replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function addField(modelId, feature) {
    const group = document.createElement('div');
    group.className = 'form-group';
    const id = `ml-${modelId}-${feature.name}`;
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = id;
    label.textContent = readableName(feature.name);
    group.append(label);

    let input;
    if (feature.kind === 'categorical') {
      input = document.createElement('select');
      input.className = 'form-control';
      for (const value of feature.allowed_values) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = String(value);
        input.append(option);
      }
    } else {
      input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'form-control';
    }
    input.id = id;
    input.name = feature.name;
    input.required = feature.required;

    if (!feature.required) {
      const missingOption = document.createElement('option');
      missingOption.value = '';
      missingOption.textContent = 'Not provided (model imputation)';
      if (input instanceof HTMLSelectElement) input.prepend(missingOption);
      else input.placeholder = 'Optional; model will impute';
    }
    group.append(input);
    return group;
  }

  function renderModel() {
    const model = models.find((item) => item.id === modelSelect.value);
    featureFields.replaceChildren();
    status.replaceChildren();
    if (!model) return;

    description.textContent =
      `${model.feature_count} dataset features. Positive class: ${model.positive_class}. ` +
      (model.id === 'diabetes'
        ? 'All values are required because this saved model does not include a missing-value imputer.'
        : 'Blank values are passed to the model pipeline for its trained missing-value imputation.');
    for (const feature of model.features) {
      featureFields.append(addField(model.id, feature));
    }
    predictButton.disabled = false;
  }

  function fillSelectedModelDemo() {
    const model = models.find((item) => item.id === modelSelect.value);
    const sample = model && demoValues[model.id];
    if (!model || !sample) {
      displayStatus('The selected model is not ready for demo data yet.', 'error');
      if (window.showToast) showToast('Model is not ready. Please try again.', 'warning');
      return false;
    }

    const populated = [];
    for (const feature of model.features) {
      const input = form.elements.namedItem(feature.name);
      const value = sample[feature.name];
      if (!input || value === undefined) {
        displayStatus(`Demo data is missing a value for ${feature.name}.`, 'error');
        if (window.showToast) showToast('Demo data could not be filled completely.', 'warning');
        return false;
      }

      if (feature.kind === 'categorical') {
        const validCategory = feature.allowed_values.some((allowed) =>
          typeof allowed === 'number' && typeof value === 'number'
            ? allowed === value
            : String(allowed) === String(value)
        );
        if (!validCategory) {
          displayStatus(`The ${feature.name} demo value is not an allowed category.`, 'error');
          if (window.showToast) showToast('Demo data does not match the model categories.', 'warning');
          return false;
        }
      } else if (typeof value !== 'number' || !Number.isFinite(value)) {
        displayStatus(`The ${feature.name} demo value must be numeric.`, 'error');
        if (window.showToast) showToast('Demo data contains an invalid number.', 'warning');
        return false;
      }

      input.value = String(value);
      populated.push(feature.name);
    }

    const verified = model.features.every((feature) => {
      const input = form.elements.namedItem(feature.name);
      const expected = sample[feature.name];
      if (feature.kind === 'numeric') return Number(input.value) === expected;
      return String(input.value) === String(expected)
        && feature.allowed_values.some((allowed) =>
          typeof allowed === 'number' && typeof expected === 'number'
            ? allowed === expected
            : String(allowed) === String(expected)
        );
    });

    if (!verified || populated.length !== model.feature_count) {
      displayStatus('Could not verify all demo values. Please check the model fields.', 'error');
      if (window.showToast) showToast('Demo data was not fully verified.', 'warning');
      return false;
    }

    const message = `${model.name} sample values populated and verified in all ${populated.length} model fields.`;
    displayStatus(`${message} ${disclaimer}`, 'success');
    if (window.showToast) showToast(`✨ ${message}`, 'success');
    return true;
  }

  document.addEventListener('screening-demo-filled', () => {
    if (!models.length) {
      demoFillPending = true;
      displayStatus('Loading saved model fields; demo data will fill when ready.', 'info');
      return;
    }
    fillSelectedModelDemo();
  });

  modelSelect.addEventListener('change', renderModel);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const model = models.find((item) => item.id === modelSelect.value);
    if (!model) return;

    const features = {};
    for (const feature of model.features) {
      const input = form.elements.namedItem(feature.name);
      if (feature.kind === 'numeric') {
        features[feature.name] = input.value === '' ? null : Number(input.value);
      } else if (input.value === '') {
        features[feature.name] = null;
      } else if (typeof feature.allowed_values[0] === 'number') {
        features[feature.name] = Number(input.value);
      } else {
        features[feature.name] = input.value;
      }
    }

    predictButton.disabled = true;
    predictButton.textContent = 'Running model...';
    displayStatus('', '');
    try {
      let response;
      try {
        response = await fetch(`/api/predict/${model.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features })
        });
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(
            'Cannot reach Flask. Start the app with "python app.py" and open ' +
            'http://127.0.0.1:5000/screening.html.'
          );
        }
        throw error;
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Flask returned an invalid response (HTTP ${response.status}).`);
      }
      if (!response.ok) throw new Error(data.error || 'Prediction request failed.');

      const alert = document.createElement('div');
      alert.className = 'alert-box alert-info';
      const result = document.createElement('div');
      result.className = 'alert-text';
      const title = document.createElement('strong');
      title.textContent = `Educational model output: ${data.prediction.label}`;
      const score = document.createElement('div');
      score.className = 'ml-prediction-score';
      score.textContent =
        `Model score for predicted class: ${(data.prediction.model_score * 100).toFixed(1)}%`;
      const positive = document.createElement('div');
      positive.textContent =
        `Positive-class model score: ${(data.positive_class_probability * 100).toFixed(1)}%`;
      const warning = document.createElement('p');
      warning.textContent = data.disclaimer;
      result.append(title, score, positive, warning);
      alert.append(result);
      status.replaceChildren(alert);
    } catch (error) {
      displayStatus(error.message || 'Prediction request could not be completed.', 'error');
    } finally {
      predictButton.disabled = false;
      predictButton.textContent = 'Run educational model demo';
    }
  });

  async function loadModels() {
    let response;
    try {
      response = await fetch('/api/models');
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          'Cannot reach Flask. Start the app with "python app.py" and open ' +
          'http://127.0.0.1:5000/screening.html.'
        );
      }
      throw error;
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Flask returned an invalid response (HTTP ${response.status}).`);
    }
    if (!response.ok) throw new Error(data.error || 'Could not load saved models.');
    return data;
  }

  loadModels()
    .then((data) => {
      models = data.models;
      modelSelect.replaceChildren();
      for (const model of models) {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = `${model.name} (${model.feature_count} features)`;
        modelSelect.append(option);
      }
      modelSelect.disabled = false;
      renderModel();
      if (demoFillPending) {
        demoFillPending = false;
        fillSelectedModelDemo();
      }
    })
    .catch((error) => {
      modelSelect.replaceChildren();
      const option = document.createElement('option');
      option.textContent = 'Models unavailable';
      modelSelect.append(option);
      displayStatus(error.message || 'Could not load saved models.', 'error');
    });
});
