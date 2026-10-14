/**
 * HealthcareAI - Core Application Logic & State Management
 * Hackathon Prototype Demonstration
 */

// Initialize default sample data into localStorage if not present
(function initDefaultSampleData() {
  if (!localStorage.getItem('healthcare_patient')) {
    const defaultPatient = {
      id: "HC-2026-981",
      name: "Sarah Jenkins",
      age: 42,
      gender: "Female",
      bloodGroup: "O+",
      heightCm: 168,
      weightKg: 68.5,
      bmi: 24.3,
      allergies: ["Penicillin"],
      chronicConditions: ["Mild Seasonal Allergies"],
      emergencyContact: "David Jenkins (+1-555-0192)"
    };
    localStorage.setItem('healthcare_patient', JSON.stringify(defaultPatient));
  }

  if (!localStorage.getItem('healthcare_vitals')) {
    const defaultVitals = {
      heartRate: { value: 74, unit: "bpm", status: "Optimal", trend: "stable" },
      bloodPressure: { systolic: 122, diastolic: 80, unit: "mmHg", status: "Normal", trend: "down" },
      bloodGlucose: { value: 96, unit: "mg/dL", status: "Optimal (Fasting)", trend: "stable" },
      spO2: { value: 98, unit: "%", status: "Healthy", trend: "stable" },
      bmi: { value: 24.3, unit: "kg/m²", status: "Normal weight", trend: "stable" },
      sleep: { value: 7.4, unit: "hrs/night", status: "Adequate", trend: "up" }
    };
    localStorage.setItem('healthcare_vitals', JSON.stringify(defaultVitals));
  }

  if (!localStorage.getItem('healthcare_records')) {
    const defaultRecords = [
      {
        id: "REC-104",
        date: "2026-10-02",
        category: "Laboratory",
        title: "Comprehensive Metabolic Panel (CMP)",
        facility: "Metro Health Labs",
        physician: "Dr. Elena Rostova",
        status: "Normal",
        notes: "All kidney and liver markers within target reference intervals."
      },
      {
        id: "REC-103",
        date: "2026-09-14",
        category: "Cardiology",
        title: "12-Lead Resting Electrocardiogram (ECG)",
        facility: "City Cardiology Center",
        physician: "Dr. Marcus Vance",
        status: "Normal Sinus",
        notes: "Normal sinus rhythm, HR 72 bpm, no ischemic ST changes detected."
      },
      {
        id: "REC-102",
        date: "2026-08-20",
        category: "Laboratory",
        title: "Lipid Profile & HbA1c",
        facility: "Metro Health Labs",
        physician: "Dr. David Chen",
        status: "Borderline",
        notes: "Total Cholesterol: 198 mg/dL, LDL: 114 mg/dL, HbA1c: 5.4% (Non-diabetic)."
      },
      {
        id: "REC-101",
        date: "2026-05-11",
        category: "Immunization",
        title: "Seasonal Influenza & Tdap Booster",
        facility: "Community Health Clinic",
        physician: "Dr. Amira Patel",
        status: "Completed",
        notes: "Tolerated well without adverse reaction."
      }
    ];
    localStorage.setItem('healthcare_records', JSON.stringify(defaultRecords));
  }

  if (!localStorage.getItem('healthcare_doctors')) {
    const defaultDoctors = [
      {
        id: "DOC-01",
        name: "Dr. Marcus Vance, MD, FACC",
        specialty: "Cardiovascular Medicine",
        experience: "14 yrs experience",
        hospital: "Heart & Vascular Institute",
        rating: 4.9,
        reviewsCount: 184,
        available: "Available Today",
        nextSlot: "Today at 03:30 PM",
        avatarInitials: "MV",
        color: "#0284c7"
      },
      {
        id: "DOC-02",
        name: "Dr. Elena Rostova, MD",
        specialty: "Internal Medicine & Preventive Care",
        experience: "11 yrs experience",
        hospital: "Metro Preventive Health",
        rating: 4.95,
        reviewsCount: 220,
        available: "Available Now",
        nextSlot: "Instant Teleconsult",
        avatarInitials: "ER",
        color: "#0d9488"
      },
      {
        id: "DOC-03",
        name: "Dr. David Chen, MD, FACE",
        specialty: "Endocrinology & Metabolic Health",
        experience: "16 yrs experience",
        hospital: "Endocrine Care Specialists",
        rating: 4.88,
        reviewsCount: 142,
        available: "Tomorrow Morning",
        nextSlot: "Tomorrow at 10:00 AM",
        avatarInitials: "DC",
        color: "#6366f1"
      },
      {
        id: "DOC-04",
        name: "Dr. Amira Patel, MD",
        specialty: "Family & Telehealth General Practitioner",
        experience: "8 yrs experience",
        hospital: "Virtual Care Network",
        rating: 4.92,
        reviewsCount: 310,
        available: "Available Now",
        nextSlot: "Instant Teleconsult",
        avatarInitials: "AP",
        color: "#10b981"
      }
    ];
    localStorage.setItem('healthcare_doctors', JSON.stringify(defaultDoctors));
  }

  if (!localStorage.getItem('healthcare_appointments')) {
    const defaultAppointments = [
      {
        id: "APT-201",
        doctorName: "Dr. Elena Rostova, MD",
        specialty: "Internal Medicine & Preventive Care",
        date: "2026-10-16",
        time: "10:30 AM",
        type: "Virtual Video Consultation",
        status: "Upcoming"
      }
    ];
    localStorage.setItem('healthcare_appointments', JSON.stringify(defaultAppointments));
  }

  // Pre-seed a default assessment if none exists
  if (!localStorage.getItem('currentAssessment')) {
    const defaultAssessment = {
      timestamp: new Date().toISOString(),
      patientName: "Sarah Jenkins",
      age: 42,
      gender: "Female",
      overallRisk: "Low to Moderate",
      riskScore: 24, // out of 100
      riskCategory: "moderate",
      factors: [
        { name: "Blood Pressure", value: "124/82 mmHg", status: "Pre-hypertension stage (Borderline)", severity: "warning" },
        { name: "Fasting Glucose", value: "96 mg/dL", status: "Optimal Range", severity: "normal" },
        { name: "BMI", value: "24.3 kg/m²", status: "Healthy Weight", severity: "normal" },
        { name: "Physical Activity", value: "Moderate (3x / week)", status: "Meets baseline guidance", severity: "normal" },
        { name: "Family History", value: "Cardiovascular", status: "Elevated genetic risk factor", severity: "warning" }
      ],
      aiInsights: [
        "Cardiovascular risk index is estimated in the lower-moderate quadrant based on systolic blood pressure and familial cardiac history.",
        "Metabolic health profile is well-maintained with optimal fasting glucose levels.",
        "Recommended action: Maintain regular aerobic exercise and schedule a preventive consultation."
      ],
      recommendations: [
        { title: "Blood Pressure Tracking", desc: "Monitor resting morning blood pressure 2-3 times per week to establish stable trending." },
        { title: "Dietary Sodium Management", desc: "Limit sodium intake to under 2,000 mg/day following DASH diet principles." },
        { title: "Preventive Care Review", desc: "Share these findings with a licensed clinician during your next routine wellness checkup." }
      ]
    };
    localStorage.setItem('currentAssessment', JSON.stringify(defaultAssessment));
  }

  // Pre-seed Community Health Visit Schedule (Demo Data)
  if (!localStorage.getItem('healthcare_camps')) {
    const defaultCamps = [
      {
        id: "CAMP-01",
        name: "Primary Health Center Outreach",
        tamilName: "ஆரம்ப சுகாதார நிலைய மருத்துவ முகாம்",
        location: "Community Center, Thiruvanmiyur, Chennai",
        date: "2026-10-24",
        time: "08:30 AM - 01:30 PM",
        services: ["Blood Pressure Check", "Random Blood Glucose", "BMI Assessment", "Doctor Tele-Guidance"],
        servicesTa: ["ரத்த அழுத்த பரிசோதனை", "ரத்த சர்க்கரை அளவு", "உடல் நிறை குறியீடு (BMI)", "மருத்துவ ஆலோசனை"],
        status: "Upcoming Demo Camp",
        doctorsAssigned: "Dr. Elena Rostova & Field Nurses"
      },
      {
        id: "CAMP-02",
        name: "Urban Health Post Mobile Camp",
        tamilName: "நகர்ப்புற நடமாடும் சுகாதார முகாம்",
        location: "Panchayat Hall, Velachery Main Road",
        date: "2026-10-28",
        time: "09:00 AM - 02:00 PM",
        services: ["Hypertension Triage", "Fasting Glucose Screening", "Diet & Lifestyle Counseling"],
        servicesTa: ["உயர் ரத்த அழுத்த பரிசோதனை", "சர்க்கரை நோய் கண்டறிதல்", "உணவு & வாழ்க்கை முறை ஆலோசனை"],
        status: "Upcoming Demo Camp",
        doctorsAssigned: "Dr. Marcus Vance (Cardio Triage)"
      },
      {
        id: "CAMP-03",
        name: "Rural Wellness Screening Camp",
        tamilName: "கிராமப்புற நலவாழ்வு பரிசோதனை முகாம்",
        location: "Panchayat Union School, Tambaram West",
        date: "2026-11-02",
        time: "09:30 AM - 02:30 PM",
        services: ["Vitals Baseline", "Diabetes Risk Assessment", "ECG Screening Demo"],
        servicesTa: ["அடிப்படை உடல் பரிசோதனை", "நீரிழிவு இடர் மதிப்பீடு", "ECG மாதிரி பரிசோதனை"],
        status: "Upcoming Demo Camp",
        doctorsAssigned: "Dr. Amira Patel & ASHA Health Team"
      }
    ];
    localStorage.setItem('healthcare_camps', JSON.stringify(defaultCamps));
  }
})();

/* ==========================================================================
   FEATURE 2: TAMIL / ENGLISH TRANSLATIONS & i18n ENGINE
   ========================================================================== */
const I18N = {
  en: {
    // Navigation
    "nav_home": "Home",
    "nav_dashboard": "Patient Dashboard",
    "nav_screening": "Risk Screening",
    "nav_results": "AI Results Demo",
    "nav_records": "Health Records",
    "nav_consult": "Doctor Teleconsult",
    "nav_start_btn": "Start Screening",
    "banner_text": "Demonstration Only • Non-Diagnostic System • Simulated Clinical Intelligence",
    "banner_badge": "Hackathon Prototype",

    // Home Page
    "hero_pill": "Hackathon Edition: Preventive Healthcare AI Platform",
    "hero_title": "Smart Health Screening & Virtual Clinical Triage",
    "hero_desc": "Empowering patients with early risk detection, explainable wellness insights, and instant connectivity to remote clinical specialists.",
    "btn_launch_screening": "Launch Health Risk Screening",
    "btn_view_dashboard": "View Patient Dashboard",
    "home_modules_title": "Interactive Prototype Modules",
    "home_modules_subtitle": "Explore the five interconnected layers of the HealthcareAI platform prototype.",
    "disclaimer_title": "Prototype & Research Demonstration Notice",
    "disclaimer_text": "HealthcareAI is built as a proof-of-concept prototype for our hackathon. All risk evaluations and scores use deterministic sample heuristics. This application does not provide real medical diagnosis, professional medical advice, or clinical treatments. Always consult licensed medical professionals for health decisions.",

    // Community Health Camps
    "camps_title": "Community Health Visit Schedule",
    "camps_subtitle": "Upcoming field screening camps for rural & urban health outreach (Clearly Labeled Demo Schedule)",
    "camps_demo_notice": "DEMO SCHEDULE: Sample community outreach events for hackathon demonstration. Not confirmed real-world events.",
    "camps_services_label": "Screening Services:",

    // Screening Modes & Consent
    "screening_title": "Health Risk Screening & Symptom Checker",
    "screening_subtitle": "A standardized preliminary assessment tool for preventive cardiovascular and metabolic risk stratification.",
    "mode_patient": "👤 Patient Self-Mode",
    "mode_worker": "🩺 Health Worker Assisted Mode",
    "worker_card_title": "Health Worker Assisted Screening Protocol",
    "worker_card_desc": "You are assisting a patient to record their health biometrics. Verify informed consent prior to entering data.",
    "worker_name_label": "Field Worker / Volunteer Name",
    "worker_id_label": "Health Worker ID",
    "consent_label": "Patient Consent Verified: The patient has been informed that this is a non-diagnostic demonstration screening and has granted permission to record their health metrics.",

    // Appointments & Doctor Availability
    "doctor_avail_title": "Doctor Availability (Demo Schedule)",
    "doctor_avail_sub": "Available clinical specialists for virtual teleconsultation demo. Choose a time slot to book.",
    "btn_book_appointment": "Book Consultation",
    "my_appointments_title": "My Booked Appointments",
    "reminder_prefix": "UPCOMING CONSULTATION REMINDER (DEMO):",
    "btn_join_teleconsult": "Join Consultation Demo",
    "slot_booked_error": "⚠️ This demo time slot is already booked! Please select another time.",
    "slot_booked_success": "Appointment booked successfully!",

    // Teleconsultation
    "tele_title": "Virtual Doctor Teleconsultation",
    "tele_subtitle": "Real-time encrypted video connection, biometric sharing, and physician clinical notes.",
    "state_booked_title": "State 1: Appointment Booked",
    "state_waiting_title": "State 2: Waiting to Join Room",
    "state_active_title": "State 3: Simulated Consultation Demo",
    "btn_proceed_waiting": "Proceed to Waiting Lobby",
    "btn_join_active": "Join Consultation Demo Now",
    "btn_end_call": "End Consultation"
  },

  ta: {
    // Navigation
    "nav_home": "முகப்பு",
    "nav_dashboard": "நோயாளி பலகை",
    "nav_screening": "இடர் பரிசோதனை",
    "nav_results": "மாதிரி முடிவுகள்",
    "nav_records": "மருத்துவ பதிவுகள்",
    "nav_consult": "மருத்துவர் ஆலோசனை",
    "nav_start_btn": "பரிசோதனை தொடங்க",
    "banner_text": "மாதிரி விளக்கம் மட்டுமே • நோயறிதல் கருவி அல்ல • மாதிரி மருத்துவ நுண்ணறிவு",
    "banner_badge": "ஹேக்கத்தான் மாதிரி",

    // Home Page
    "hero_pill": "ஹேக்கத்தான் பதிப்பு: தடுப்பு சுகாதார AI தளம்",
    "hero_title": "ஸ்மார்ட் சுகாதாரப் பரிசோதனை & நேரலை மருத்துவ ஆலோசனை",
    "hero_desc": "ஆரம்பகால உடல்நல இடர் கண்டறிதல், எளிய சுகாதார வழிகாட்டல் மற்றும் தொலைதூர மருத்துவ நிபுணர்களுடன் உடனடி இணைப்பு.",
    "btn_launch_screening": "இடர் பரிசோதனையைத் தொடங்குக",
    "btn_view_dashboard": "நோயாளி பலகையைக் காண்க",
    "home_modules_title": "ஊடாடும் மாதிரி பிரிவுகள்",
    "home_modules_subtitle": "HealthcareAI தளத்தின் ஐந்து முக்கிய பகுதிகளை ஆராயுங்கள்.",
    "disclaimer_title": "முக்கிய மாதிரி விளக்க அறிவிப்பு",
    "disclaimer_text": "HealthcareAI என்பது ஹேக்கத்தான் போட்டிக்கான மாதிரி தளம் மட்டுமே. இதில் காட்டப்படும் முடிவுகள் அனைத்தும் மாதிரி மதிப்பீடுகள் ஆகும். இது உண்மையான மருத்துவ நோயறிதல் அல்லது சிகிச்சை பரிந்துரை அல்ல. உங்கள் உடல்நலத்திற்கு அங்கீகரிக்கப்பட்ட மருத்துவரை அணுகவும்.",

    // Community Health Camps
    "camps_title": "சமூக நல மருத்துவ முகாம் அட்டவணை",
    "camps_subtitle": "கிராமப்புற & நகர்ப்புற பகுதிகளில் நடைபெறவுள்ள இலவச மாதிரி மருத்துவ முகாம்கள்",
    "camps_demo_notice": "மாதிரி அட்டவணை: ஹேக்கத்தான் விளக்கத்திற்காக உருவாக்கப்பட்ட மாதிரி முகாம்கள். இது உறுதிசெய்யப்பட்ட உண்மையான நிகழ்வு அல்ல.",
    "camps_services_label": "வழங்கப்படும் சேவைகள்:",

    // Screening Modes & Consent
    "screening_title": "உடல்நல இடர் பரிசோதனை & அறிகுறிகள் சரிபார்ப்பு",
    "screening_subtitle": "இதய மற்றும் வளர்சிதை மாற்ற இடர்களை முன்கூட்டியே கணிக்க உதவும் எளிய மாதிரிப் பரிசோதனை.",
    "mode_patient": "👤 நோயாளி சுய முறை",
    "mode_worker": "🩺 சுகாதாரப் பணியாளர் உதவி முறை",
    "worker_card_title": "சுகாதாரப் பணியாளர் உதவிப் பரிசோதனை நெறிமுறை",
    "worker_card_desc": "நீங்கள் ஒரு நோயாளிக்கு பரிசோதனை செய்ய உதவுகிறீர்கள். விவரங்களைப் பதிவு செய்வதற்கு முன் அவர்களின் ஒப்புதலைப் பெறுங்கள்.",
    "worker_name_label": "சுகாதாரப் பணியாளர் / தன்னார்வலர் பெயர்",
    "worker_id_label": "பணியாளர் அடையாள எண் (ID)",
    "consent_label": "நோயாளி ஒப்புதல் சரிபார்க்கப்பட்டது: இது ஒரு மாதிரி பரிசோதனை என்பதை நோயாளி புரிந்துகொண்டு தனது உடல்நலத் தகவல்களைப் பதிவு செய்ய முழு மனதுடன் ஒப்புதல் அளித்துள்ளார்.",

    // Appointments & Doctor Availability
    "doctor_avail_title": "மருத்துவர் நேர அட்டவணை (மாதிரி தகவல்)",
    "doctor_avail_sub": "நேரலை மாதிரி ஆலோசனைக்கான சிறப்பு மருத்துவர்கள். உங்கள் வசதிக்கேற்ப நேரத்தைத் தேர்ந்தெடுக்கவும்.",
    "btn_book_appointment": "முன்பதிவு செய்க",
    "my_appointments_title": "எனது மருத்துவ முன்பதிவுகள்",
    "reminder_prefix": "வரவிருக்கும் ஆலோசனை நினைவூட்டல் (மாதிரி):",
    "btn_join_teleconsult": "ஆலோசனையில் இணைக",
    "slot_booked_error": "⚠️ இந்த மாதிரி நேரம் ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது! தயவுசெய்து வேறு நேரத்தைத் தேர்ந்தெடுக்கவும்.",
    "slot_booked_success": "முன்பதிவு வெற்றிகரமாக முடிந்தது!",

    // Teleconsultation
    "tele_title": "மெய்நிகர் மருத்துவர் ஆலோசனை",
    "tele_subtitle": "பாதுகாப்பான வீடியோ இணைப்பு, உடல்நலத் தகவல் பகிர்வு மற்றும் மருத்துவ குறிப்புகள்.",
    "state_booked_title": "நிலை 1: முன்பதிவு உறுதி செய்யப்பட்டது",
    "state_waiting_title": "நிலை 2: அறைக்குள் இணைய காத்திருத்தல்",
    "state_active_title": "நிலை 3: நேரடி மாதிரி ஆலோசனை",
    "btn_proceed_waiting": "காத்திருப்பு அறைக்குச் செல்க",
    "btn_join_active": "இப்போது ஆலோசனையில் இணைக",
    "btn_end_call": "ஆலோசனையை முடிக்க"
  }
};

function getCurrentLang() {
  return localStorage.getItem('healthcare_lang') || 'en';
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ta') lang = 'en';
  localStorage.setItem('healthcare_lang', lang);

  // Update button active states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Apply translations to all data-i18n elements
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Apply placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Refresh dynamic sections
  if (typeof renderAppointmentsList === 'function') renderAppointmentsList();
  if (typeof renderCommunityCamps === 'function') renderCommunityCamps();
  renderAppointmentReminder();
}

// In-App Reminder Banner Renderer
function renderAppointmentReminder() {
  const container = document.querySelector('.container');
  if (!container) return;

  const apts = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
  const existingBanner = document.getElementById('inAppReminderBanner');

  if (!apts || apts.length === 0) {
    if (existingBanner) existingBanner.remove();
    return;
  }

  // Get next upcoming appointment
  const nextApt = apts[0];
  const lang = getCurrentLang();
  const dict = I18N[lang] || I18N.en;

  if (!existingBanner) {
    const banner = document.createElement('div');
    banner.id = 'inAppReminderBanner';
    banner.className = 'inapp-reminder-banner';
    banner.innerHTML = `
      <div class="reminder-content">
        <div class="reminder-icon">⏰</div>
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #1e3a8a;">
            ${dict.reminder_prefix} ${nextApt.doctorName}
          </div>
          <div style="font-size: 0.85rem; color: #334155; margin-top: 2px;">
            <strong>${nextApt.date}</strong> at <strong>${nextApt.time}</strong> • ${nextApt.specialty}
            <span style="margin-left: 8px; font-size: 0.78rem; color: #64748b;">(In-app demo reminder only • No SMS sent)</span>
          </div>
        </div>
      </div>
      <div>
        <a href="consultation.html?aptId=${nextApt.id}" class="btn btn-primary btn-sm" style="white-space:nowrap;">
          <span>${dict.btn_join_teleconsult} &rarr;</span>
        </a>
      </div>
    `;
    container.insertBefore(banner, container.firstChild);
  } else {
    // Update existing
    existingBanner.querySelector('.reminder-content > div:last-child').innerHTML = `
      <div style="font-weight: 800; font-size: 0.95rem; color: #1e3a8a;">
        ${dict.reminder_prefix} ${nextApt.doctorName}
      </div>
      <div style="font-size: 0.85rem; color: #334155; margin-top: 2px;">
        <strong>${nextApt.date}</strong> at <strong>${nextApt.time}</strong> • ${nextApt.specialty}
        <span style="margin-left: 8px; font-size: 0.78rem; color: #64748b;">(In-app demo reminder only • No SMS sent)</span>
      </div>
    `;
  }
}

// Prevent Duplicate Bookings Check
function isSlotBooked(doctorName, date, time) {
  const currentList = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
  return currentList.some(apt => 
    apt.doctorName.toLowerCase() === doctorName.toLowerCase() &&
    apt.date === date &&
    apt.time === time
  );
}

// Book Appointment with Duplicate Prevention
function bookDemoAppointment(doctor, date, time, notes) {
  const lang = getCurrentLang();
  const dict = I18N[lang] || I18N.en;

  if (isSlotBooked(doctor, date, time)) {
    showToast(dict.slot_booked_error, "danger");
    return false;
  }

  const currentList = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
  const newApt = {
    id: `APT-${Math.floor(100 + Math.random() * 900)}`,
    doctorName: doctor,
    specialty: "Telehealth Consultation",
    date: date,
    time: time,
    type: "Virtual HD Video Demo",
    notes: notes || "Review preliminary AI screening risk assessment",
    status: "Confirmed"
  };

  currentList.unshift(newApt);
  localStorage.setItem('healthcare_appointments', JSON.stringify(currentList));

  showToast(`🎉 ${dict.slot_booked_success} (${doctor} - ${date} at ${time})`, "info");
  renderAppointmentReminder();
  return true;
}

// Mobile Menu Navigation Toggle & Language Init
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.btn-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Setup language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-lang');
      setLanguage(selected);
    });
  });

  // Apply saved language on page load
  setLanguage(getCurrentLang());
  renderAppointmentReminder();
});

// Toast Notification Utility
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Modal helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}
