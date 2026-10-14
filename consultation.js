/**
 * HealthcareAI - Remote Doctor Consultation & Telepresence Flow Controller
 * INTELLATHON '26 Hackathon Prototype (Team ID: HCINTL032)
 */

const GOOGLE_MEET_URL = "https://meet.google.com/fse-qwkk-tpi";

document.addEventListener('DOMContentLoaded', () => {
  // Call state tracking
  let isCallActive = false;
  let isMuted = false;
  let isVideoOff = false;
  let callSeconds = 0;
  let timerInterval = null;
  let currentTeleState = 'booked'; // 'booked' | 'waiting' | 'active'

  const timerEl = document.getElementById('callTimer');
  const btnToggleMic = document.getElementById('btnToggleMic');
  const btnToggleVideo = document.getElementById('btnToggleVideo');
  const btnEndCall = document.getElementById('btnEndCall');
  const btnReconnect = document.getElementById('btnReconnect');
  const videoOverlay = document.getElementById('videoOverlay');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const btnJoinDoctorConsultation = document.getElementById('btnJoinDoctorConsultation');

  if (btnJoinDoctorConsultation) {
    btnJoinDoctorConsultation.addEventListener('click', () => {
      window.open(GOOGLE_MEET_URL, '_blank', 'noopener,noreferrer');
    });
  }

  // Parse URL Parameters to identify active appointment
  const urlParams = new URLSearchParams(window.location.search);
  const requestedAptId = urlParams.get('aptId');

  // Load appointments from localStorage
  const apts = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
  let activeApt = apts.find(a => a.id === requestedAptId) || apts[0] || {
    id: "APT-201",
    doctorName: "Dr. Elena Rostova, MD",
    specialty: "Internal Medicine & Preventive Care",
    date: "2026-10-16",
    time: "10:30 AM",
    type: "Virtual Video Consultation",
    notes: "Review preliminary AI screening risk assessment",
    status: "Confirmed"
  };

  // Populate appointment details in UI
  function updateAppointmentDetailsUI(apt) {
    activeApt = apt;
    document.querySelectorAll('.disp-apt-doctor').forEach(el => el.textContent = apt.doctorName);
    document.querySelectorAll('.disp-apt-specialty').forEach(el => el.textContent = apt.specialty);
    document.querySelectorAll('.disp-apt-date').forEach(el => el.textContent = apt.date);
    document.querySelectorAll('.disp-apt-time').forEach(el => el.textContent = apt.time);
    document.querySelectorAll('.disp-apt-id').forEach(el => el.textContent = apt.id);
    document.querySelectorAll('.disp-apt-notes').forEach(el => el.textContent = apt.notes || "Routine follow-up");
  }

  updateAppointmentDetailsUI(activeApt);

  // FEATURE 5: Telepresence State Machine
  window.transitionTeleState = function(targetState) {
    currentTeleState = targetState;

    const stateBooked = document.getElementById('teleStateBooked');
    const stateWaiting = document.getElementById('teleStateWaiting');
    const stateActive = document.getElementById('teleStateActive');

    const pillBooked = document.getElementById('pillStateBooked');
    const pillWaiting = document.getElementById('pillStateWaiting');
    const pillActive = document.getElementById('pillStateActive');

    // Hide all
    if (stateBooked) stateBooked.classList.remove('active-state');
    if (stateWaiting) stateWaiting.classList.remove('active-state');
    if (stateActive) stateActive.classList.remove('active-state');

    // Reset pills
    [pillBooked, pillWaiting, pillActive].forEach(p => {
      if (p) p.style.opacity = '0.5';
    });

    if (targetState === 'booked') {
      if (stateBooked) stateBooked.classList.add('active-state');
      if (pillBooked) pillBooked.style.opacity = '1';
      stopCallTimer();
    } else if (targetState === 'waiting') {
      if (stateWaiting) stateWaiting.classList.add('active-state');
      if (pillWaiting) pillWaiting.style.opacity = '1';
      stopCallTimer();
      showToast("Entered Pre-Consultation Waiting Lobby. Checking devices...", "info");
    } else if (targetState === 'active') {
      if (stateActive) stateActive.classList.add('active-state');
      if (pillActive) pillActive.style.opacity = '1';
      if (videoOverlay) videoOverlay.style.display = 'none';
      startCallTimer();
      showToast("Connected to Simulated Consultation Room with " + activeApt.doctorName, "info");
    }

    // Scroll to top of consultation area
    const container = document.getElementById('telepresenceWorkflowSection');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // If URL has aptId, start in booked state or waiting
  if (requestedAptId) {
    transitionTeleState('waiting');
  } else {
    transitionTeleState('booked');
  }

  // Timer controls
  function startCallTimer() {
    isCallActive = true;
    callSeconds = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      callSeconds++;
      const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
      const secs = String(callSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopCallTimer() {
    isCallActive = false;
    clearInterval(timerInterval);
  }

  // Toggle Microphone
  if (btnToggleMic) {
    btnToggleMic.addEventListener('click', () => {
      isMuted = !isMuted;
      btnToggleMic.classList.toggle('active-off', isMuted);
      btnToggleMic.title = isMuted ? "Unmute Microphone" : "Mute Microphone";
      showToast(isMuted ? "Microphone muted" : "Microphone unmuted", "info");
    });
  }

  // Toggle Video
  if (btnToggleVideo) {
    btnToggleVideo.addEventListener('click', () => {
      isVideoOff = !isVideoOff;
      btnToggleVideo.classList.toggle('active-off', isVideoOff);
      const pip = document.getElementById('userPip');
      if (pip) {
        pip.style.background = isVideoOff ? '#0f172a' : '#1e293b';
        pip.innerHTML = isVideoOff ? '<span style="font-size:0.7rem;color:#ef4444;">Cam Off</span>' : '<span>You (HD)</span>';
      }
      showToast(isVideoOff ? "Camera turned off" : "Camera turned on", "info");
    });
  }

  // End Call Button
  if (btnEndCall) {
    btnEndCall.addEventListener('click', () => {
      stopCallTimer();
      if (videoOverlay) {
        videoOverlay.style.display = 'flex';
      }
      showToast("Consultation ended. Summary saved to Patient Records.", "info");
    });
  }

  // Reconnect
  if (btnReconnect) {
    btnReconnect.addEventListener('click', () => {
      startCallTimer();
      if (videoOverlay) {
        videoOverlay.style.display = 'none';
      }
      showToast("Reconnected to " + activeApt.doctorName, "info");
    });
  }

  // Interactive Telehealth Chat
  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // Append Patient Message
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble chat-patient';
      userBubble.textContent = text;
      chatMessages.appendChild(userBubble);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulated Doctor response after short delay
      setTimeout(() => {
        const docResponses = [
          "Thank you for sharing that context. Looking at your recent screening indicators, your metrics look manageable with preventive lifestyle measures.",
          "Good question. I suggest maintaining a consistent morning blood pressure log for the next 10 days.",
          "I've noted that in your consultation summary. Let's make sure you stay well-hydrated and maintain moderate aerobic exercise.",
          "Please don't hesitate to reach back out if you feel any persistent discomfort or pressure."
        ];
        const randomReply = docResponses[Math.floor(Math.random() * docResponses.length)];

        const docBubble = document.createElement('div');
        docBubble.className = 'chat-bubble chat-doctor';
        docBubble.innerHTML = `<strong>${activeApt.doctorName.split(',')[0]}:</strong> ${randomReply}`;
        chatMessages.appendChild(docBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1200);
    });
  }

  // FEATURE 4: Doctor Availability & Interactive Slot Booking
  const availableDoctors = [
    {
      id: "DOC-01",
      name: "Dr. Marcus Vance, MD, FACC",
      specialty: "Cardiovascular Medicine",
      hospital: "Heart & Vascular Institute",
      rating: "★ 4.9 (184 reviews)",
      avatar: "MV",
      color: "#0284c7",
      dates: ["2026-10-16", "2026-10-17"],
      slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]
    },
    {
      id: "DOC-02",
      name: "Dr. Elena Rostova, MD",
      specialty: "Internal Medicine & Preventive Care",
      hospital: "Metro Preventive Health",
      rating: "★ 4.95 (220 reviews)",
      avatar: "ER",
      color: "#0d9488",
      dates: ["2026-10-16", "2026-10-18"],
      slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]
    },
    {
      id: "DOC-03",
      name: "Dr. David Chen, MD, FACE",
      specialty: "Endocrinology & Metabolic Health",
      hospital: "Endocrine Care Specialists",
      rating: "★ 4.88 (142 reviews)",
      avatar: "DC",
      color: "#6366f1",
      dates: ["2026-10-17", "2026-10-19"],
      slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]
    },
    {
      id: "DOC-04",
      name: "Dr. Amira Patel, MD",
      specialty: "Family & Telehealth Generalist",
      hospital: "Virtual Care Network",
      rating: "★ 4.92 (310 reviews)",
      avatar: "AP",
      color: "#10b981",
      dates: ["2026-10-16", "2026-10-17"],
      slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]
    }
  ];

  window.renderDoctorAvailabilitySection = function() {
    const grid = document.getElementById('doctorAvailabilityGrid');
    if (!grid) return;

    grid.innerHTML = availableDoctors.map(doc => {
      const selectedDate = doc.dates[0];
      
      const slotsHtml = doc.slots.map(slot => {
        const booked = isSlotBooked(doc.name, selectedDate, slot);
        if (booked) {
          return `<button class="slot-btn booked" disabled title="Already Booked (Demo)">${slot} (Booked)</button>`;
        } else {
          return `<button class="slot-btn" onclick="openDirectBooking('${doc.name}', '${doc.specialty}', '${selectedDate}', '${slot}')">${slot}</button>`;
        }
      }).join('');

      return `
        <div class="doctor-card" style="flex-direction:column; gap:14px;">
          <div style="display:flex; gap:14px; align-items:flex-start;">
            <div class="doctor-avatar" style="background:${doc.color}20; color:${doc.color};">${doc.avatar}</div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="font-size:1.05rem; font-weight:700; color:var(--secondary); margin-bottom:2px;">${doc.name}</h3>
                  <div style="font-size:0.84rem; color:${doc.color}; font-weight:600;">${doc.specialty}</div>
                </div>
                <span class="badge badge-warning">DEMO DATA</span>
              </div>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${doc.hospital} • ${doc.rating}</p>
            </div>
          </div>

          <div style="background:var(--bg-alt); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-light);">
            <div style="font-size:0.8rem; font-weight:700; color:#475569; display:flex; justify-content:space-between;">
              <span>Available Demo Slots: <strong>${selectedDate}</strong></span>
              <span style="font-size:0.75rem; color:#64748b;">(Click slot to book)</span>
            </div>
            <div class="slot-grid">
              ${slotsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // Render My Appointments on consultation page
  window.renderMyAppointmentsConsultation = function() {
    const listContainer = document.getElementById('consultMyAppointmentsList');
    if (!listContainer) return;

    const currentApts = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
    if (currentApts.length === 0) {
      listContainer.innerHTML = `<div style="padding:16px; text-align:center; color:#64748b;">No demo appointments booked yet. Select a slot above to book.</div>`;
      return;
    }

    listContainer.innerHTML = currentApts.map(apt => `
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-sm); margin-bottom:10px;">
        <div>
          <div style="font-weight:700; color:var(--secondary);">${apt.doctorName}</div>
          <div style="font-size:0.82rem; color:var(--text-muted);">${apt.specialty} • 🗓️ <strong>${apt.date}</strong> at <strong>${apt.time}</strong></div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="badge badge-success">Confirmed</span>
          <button class="btn btn-primary btn-sm" onclick="selectAndLaunchConsultation('${apt.id}')">
            Join Consultation Demo &rarr;
          </button>
        </div>
      </div>
    `).join('');
  };

  window.selectAndLaunchConsultation = function(aptId) {
    const currentApts = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
    const found = currentApts.find(a => a.id === aptId);
    if (found) {
      updateAppointmentDetailsUI(found);
      transitionTeleState('waiting');
    }
  };

  window.openDirectBooking = function(doctorName, specialty, date, slot) {
    const modalDoc = document.getElementById('modalDoctorName');
    const modalDate = document.getElementById('aptDate');
    const modalTime = document.getElementById('aptTime');

    if (modalDoc) modalDoc.value = doctorName;
    if (modalDate) modalDate.value = date;
    if (modalTime) modalTime.value = slot;

    openBookingModal(doctorName);
  };

  window.openBookingModal = function(doctorName) {
    const docInput = document.getElementById('modalDoctorName');
    if (docInput) docInput.value = doctorName || "Dr. Elena Rostova, MD";
    const bookModal = document.getElementById('bookAppointmentModal');
    if (bookModal) bookModal.classList.add('active');
  };

  window.closeBookingModal = function() {
    const bookModal = document.getElementById('bookAppointmentModal');
    if (bookModal) bookModal.classList.remove('active');
  };

  // Appointment Form Submission with Conflict Prevention
  const appointmentForm = document.getElementById('appointmentForm');
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const doctor = document.getElementById('modalDoctorName').value;
      const date = document.getElementById('aptDate').value;
      const time = document.getElementById('aptTime').value;
      const notes = document.getElementById('aptNotes').value;

      if (!date || !time) {
        showToast("Please choose both date and time slot.", "warning");
        return;
      }

      // Call global bookDemoAppointment with duplicate prevention
      const success = bookDemoAppointment(doctor, date, time, notes);
      if (success) {
        closeBookingModal();
        renderDoctorAvailabilitySection();
        renderMyAppointmentsConsultation();
        
        // Retrieve newly saved appointment and select it
        const currentList = JSON.parse(localStorage.getItem('healthcare_appointments') || '[]');
        if (currentList.length > 0) {
          updateAppointmentDetailsUI(currentList[0]);
          transitionTeleState('booked');
        }
      }
    });
  }

  // Initial renders
  renderDoctorAvailabilitySection();
  renderMyAppointmentsConsultation();
});
