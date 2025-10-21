/* script.js - Versión corregida y optimizada */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- UTIL y DATOS ---------- */
  function nextNDates(n) {
    const arr = [];
    const base = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }
  
  const NEXT_30 = nextNDates(30);
  const today = new Date();
  
  const DOCTORS = [
    { id: "m1", name: "Dr. Juan Pérez", type: "general", img: "https://i.pravatar.cc/100?img=12", bio: "Atención primaria y promoción de salud." },
    { id: "m2", name: "Dra. Ana González", type: "control", img: "https://i.pravatar.cc/100?img=5", bio: "Control de enfermedades crónicas." },
    { id: "m3", name: "Dr. Luis Gómez", type: "ges", img: "https://i.pravatar.cc/100?img=15", bio: "Manejo de patologías GES y coordinación." },
    { id: "m4", name: "Dra. Carla Rojas", type: "odontologia", img: "https://i.pravatar.cc/100?img=20", bio: "Odontología general y preventiva." },
    { id: "m5", name: "Dr. Felipe Soto", type: "general", img: "https://i.pravatar.cc/100?img=22", bio: "Medicina familiar y atención integral." },
    { id: "m6", name: "Dra. Valeria Ruiz", type: "control", img: "https://i.pravatar.cc/100?img=30", bio: "Control y seguimiento de pacientes." }
  ];
  
  function makeAvailability() { 
    return NEXT_30.filter(_ => Math.random() > 0.3); 
  }
  
  const doctorsData = DOCTORS.map(d => ({ 
    ...d, 
    availability: makeAvailability(), 
    schedules: ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00"] 
  }));

  // Datos simulados de pacientes
  const PATIENTS_DB = {
    '12345678-9': {
      name: 'María González',
      password: '123456',
      status: 'ges',
      statusLabel: 'Paciente GES',
      priority: 'high'
    },
    '87654321-0': {
      name: 'Carlos Pérez',
      password: '123456',
      status: 'control',
      statusLabel: 'Control médico',
      priority: 'medium'
    },
    '11223344-5': {
      name: 'Ana Rodríguez',
      password: '123456',
      status: 'odontologia',
      statusLabel: 'Tratamiento odontológico',
      priority: 'medium'
    }
  };

  /* ---------- DOM refs ---------- */
  const filtroTipo = document.getElementById("filtroTipo");
  const cardsWrap = document.getElementById("cardsWrap");
  const panelHorarios = document.getElementById("panelHorarios");
  const panelMedicoName = document.getElementById("panelMedicoName");
  const panelMedicoTipo = document.getElementById("panelMedicoTipo");
  const panelFechaTitle = document.getElementById("panelFechaTitle");
  const horariosList = document.getElementById("horariosList");

  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const patientNameInput = document.getElementById("patientName");
  const notifyEmail = document.getElementById("notifyEmail");
  const notifyWhatsapp = document.getElementById("notifyWhatsapp");
  const btnConfirm = document.getElementById("btnConfirm");
  const closeConfirm = document.getElementById("closeConfirm");

  // Elementos de login
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const patientRut = document.getElementById('patientRut');
  const patientPassword = document.getElementById('patientPassword');
  const patientStatusBanner = document.getElementById('patientStatusBanner');
  const patientNameDisplay = document.getElementById('patientNameDisplay');
  const patientStatusDisplay = document.getElementById('patientStatusDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  // Elementos de vista unificada
  const refreshAvailability = document.getElementById('refreshAvailability');
  const toggleView = document.getElementById('toggleView');
  const quickSlots = document.getElementById('quickSlots');
  const unifiedGrid = document.getElementById('unifiedGrid');

  // Variables de estado
  let selectedDoctor = null;
  let selectedDate = null;
  let selectedTime = null;
  let currentPatient = null;
  let patientStatus = null;

  /* ---------- Helpers ---------- */
  function tipoLabel(key) {
    switch(key) {
      case "general": return "Consulta médica general";
      case "control": return "Control médico";
      case "ges": return "GES";
      case "odontologia": return "Odontología";
      default: return key;
    }
  }
  
  function toYMD(date) { 
    return date.toISOString().slice(0,10); 
  }
  
  function getMonthName(dt) { 
    return dt.toLocaleString('es-CL',{ month:'long', year:'numeric' }); 
  }

  function getAvailabilityLevel(doctor) {
    const availableDays = doctor.availability.length;
    if (availableDays >= 10) return 'high';
    if (availableDays >= 5) return 'medium';
    return 'low';
  }

  function getNextAvailableSlots(limit = 6) {
    const slots = [];
    doctorsData.forEach(doctor => {
      doctor.availability.slice(0, 2).forEach(date => {
        doctor.schedules.slice(0, 2).forEach(time => {
          if (slots.length < limit) {
            slots.push({
              doctor: doctor,
              date: date,
              time: time,
              specialty: tipoLabel(doctor.type)
            });
          }
        });
      });
    });
    return slots.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function getPrioritySlots(patientStatus) {
    const prioritySlots = [];
    
    let relevantDoctors = [];
    
    switch(patientStatus) {
      case 'ges':
        relevantDoctors = doctorsData.filter(d => d.type === 'ges' || d.type === 'general');
        break;
      case 'control':
        relevantDoctors = doctorsData.filter(d => d.type === 'control' || d.type === 'general');
        break;
      case 'odontologia':
        relevantDoctors = doctorsData.filter(d => d.type === 'odontologia');
        break;
      default:
        relevantDoctors = doctorsData;
    }
    
    relevantDoctors.forEach(doc => {
      doc.availability.slice(0, 3).forEach(date => {
        doc.schedules.slice(0, 2).forEach(time => {
          prioritySlots.push({
            doctor: doc,
            date: date,
            time: time,
            specialty: tipoLabel(doc.type),
            priority: patientStatus
          });
        });
      });
    });
    
    return prioritySlots.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /* ---------- Render Functions ---------- */
  function renderQuickSlots() {
    if (!quickSlots) return;
    
    const slots = patientStatus ? getPrioritySlots(patientStatus) : getNextAvailableSlots();
    
    quickSlots.innerHTML = '';
    
    if (slots.length === 0) {
      quickSlots.innerHTML = `
        <div class="no-slots">
          <p>No hay horarios disponibles para tu tipo de consulta en este momento.</p>
          <button onclick="showAllSlots()" class="show-all-btn">Ver todos los horarios</button>
        </div>
      `;
      return;
    }
    
    slots.slice(0, 6).forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = 'quick-slot';
      if (patientStatus) slotElement.classList.add('priority-slot');
      
      slotElement.innerHTML = `
        <div class="quick-slot-header">
          <div class="quick-slot-doctor">${slot.doctor.name}</div>
          <div class="quick-slot-time">${new Date(slot.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} ${slot.time}</div>
        </div>
        <div class="quick-slot-type">${slot.specialty}</div>
        ${patientStatus ? `<div class="priority-badge ${slot.priority}">${slot.priority === 'ges' ? 'GES' : slot.priority === 'control' ? 'Control' : 'Odontología'}</div>` : ''}
        <button class="quick-slot-btn" data-doctor-id="${slot.doctor.id}" data-date="${slot.date}" data-time="${slot.time}">
          Agendar ahora
        </button>
      `;
      quickSlots.appendChild(slotElement);
    });
  }

  function renderConsultationSlots() {
    const consultationSlots = document.getElementById('consultationSlots');
    if (!consultationSlots) return;
    
    // Filtrar doctores según el estado del paciente
    let allowedTypes = [];
    
    if (patientStatus === 'ges') {
      allowedTypes = ['ges', 'general'];
    } else if (patientStatus === 'control') {
      allowedTypes = ['control', 'general'];
    } else if (patientStatus === 'odontologia') {
      allowedTypes = ['odontologia'];
    } else {
      // Paciente no logueado o sin estado específico
      allowedTypes = ['general', 'odontologia'];
    }
    
    const filteredDoctors = doctorsData.filter(d => allowedTypes.includes(d.type));
    const slots = [];
    
    filteredDoctors.forEach(doctor => {
      doctor.availability.slice(0, 2).forEach(date => {
        doctor.schedules.slice(0, 2).forEach(time => {
          slots.push({
            doctor: doctor,
            date: date,
            time: time,
            specialty: tipoLabel(doctor.type)
          });
        });
      });
    });
    
    consultationSlots.innerHTML = '';
    
    if (slots.length === 0) {
      consultationSlots.innerHTML = `
        <div class="no-slots">
          <p>No hay horarios disponibles para tu tipo de consulta.</p>
        </div>
      `;
      return;
    }
    
    slots.slice(0, 4).forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = 'consultation-slot';
      
      slotElement.innerHTML = `
        <div class="consultation-slot-header">
          <div class="consultation-slot-doctor">${slot.doctor.name}</div>
          <div class="consultation-slot-time">${new Date(slot.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} ${slot.time}</div>
        </div>
        <div class="consultation-slot-type">${slot.specialty}</div>
        <button class="consultation-slot-btn" data-doctor-id="${slot.doctor.id}" data-date="${slot.date}" data-time="${slot.time}">
          Agendar
        </button>
      `;
      consultationSlots.appendChild(slotElement);
    });
  }

  function renderUnifiedView() {
    if (!unifiedGrid) return;
    
    const specialties = [...new Set(doctorsData.map(d => d.type))];
    
    unifiedGrid.innerHTML = '';
    
    specialties.forEach(specialty => {
      const specialtyDoctors = doctorsData.filter(d => d.type === specialty);
      const totalAvailability = specialtyDoctors.reduce((sum, d) => sum + d.availability.length, 0);
      
      const card = document.createElement('div');
      card.className = 'specialty-card';
      
      const countClass = totalAvailability >= 10 ? '' : totalAvailability >= 5 ? 'low' : 'none';
      
      card.innerHTML = `
        <div class="specialty-header">
          <div class="specialty-name">${tipoLabel(specialty)}</div>
          <div class="availability-count ${countClass}">${totalAvailability} horarios</div>
        </div>
        <div class="availability-list">
          ${specialtyDoctors.slice(0, 3).map(doctor => `
            <div class="availability-item" data-doctor-id="${doctor.id}">
              <div class="availability-info">
                <div class="availability-doctor">${doctor.name}</div>
                <div class="availability-time">
                  <span class="availability-indicator ${getAvailabilityLevel(doctor)}"></span>
                  ${doctor.availability.length} días disponibles
                </div>
              </div>
              <button class="availability-btn">Ver horarios</button>
            </div>
          `).join('')}
        </div>
      `;
      
      unifiedGrid.appendChild(card);
    });
  }

  function renderCards(filterType = "") {
    if (!cardsWrap) return;
    
    cardsWrap.innerHTML = "";
    const list = filterType ? doctorsData.filter(d => d.type === filterType) : doctorsData;
    
    list.forEach(doc => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = doc.id;

      // head
      const head = document.createElement("div"); 
      head.className = "card-head";
      head.innerHTML = `<img class="photo" src="${doc.img}" alt="${doc.name}"><div class="info"><h3>${doc.name}</h3><p>${tipoLabel(doc.type)}</p></div>`;
      card.appendChild(head);

      // desc hidden
      const desc = document.createElement("div"); 
      desc.className = "desc"; 
      desc.textContent = doc.bio; 
      card.appendChild(desc);

      // calendar container
      const cal = document.createElement("div"); 
      cal.className = "calendar"; 
      card.appendChild(cal);
      buildCalendar(cal, doc);

      // click on card (not on day)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".day")) return;
        document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        // show desc
        document.querySelectorAll(".desc").forEach(d => d.style.display = "none");
        desc.style.display = "block";
      });

      cardsWrap.appendChild(card);
    });
  }

  function buildCalendar(container, doc) {
    container.innerHTML = "";

    const monthDate = new Date(); // current month
    const header = document.createElement("div"); 
    header.className = "cal-header";
    header.innerHTML = `<div class="cal-month">${getMonthName(monthDate)}</div>`;
    container.appendChild(header);

    const weekdays = document.createElement("div"); 
    weekdays.className = "cal-weekdays";
    ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].forEach(l => { 
      const w = document.createElement("div"); 
      w.textContent = l; 
      weekdays.appendChild(w); 
    });
    container.appendChild(weekdays);

    const grid = document.createElement("div"); 
    grid.className = "cal-grid";

    const year = monthDate.getFullYear(); 
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // blanks
    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement("div"); 
      blank.className = "day disabled"; 
      blank.textContent = ""; 
      grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div"); 
      cell.className = "day"; 
      cell.textContent = d;
      const cellDate = new Date(year, month, d);
      const ymd = toYMD(cellDate);

      // disable if before today or not in next 30 days
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const isBeforeToday = cellDate.setHours(0,0,0,0) < startOfToday;
      const inWindow = NEXT_30.indexOf(ymd) !== -1;

      if (isBeforeToday || !inWindow) {
        cell.classList.add("disabled");
      } else {
        const has = doc.availability.includes(ymd);
        if (has) {
          cell.classList.add("available");
          cell.addEventListener("click", (ev) => {
            ev.stopPropagation();
            // mark selected within this calendar
            const parentGrid = cell.parentElement;
            parentGrid.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
            cell.classList.add("selected");
            // action: show schedules panel for this doc+date
            onDateSelected(doc, ymd, cell);
          });
        } else {
          // day in window but not available
          cell.classList.add("disabled");
        }
      }

      grid.appendChild(cell);
    }

    container.appendChild(grid);
  }

  /* ---------- Login Functions ---------- */
  function handleLogin(e) {
    e.preventDefault();
    
    const rut = patientRut.value.trim();
    const password = patientPassword.value.trim();
    
    if (!rut || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const patient = PATIENTS_DB[rut];
    
    if (!patient || patient.password !== password) {
      alert('RUT o contraseña incorrectos');
      return;
    }
    
    // Login exitoso
    currentPatient = patient;
    patientStatus = patient.status;
    
    // Actualizar UI
    patientNameDisplay.textContent = patient.name;
    patientStatusDisplay.innerHTML = `${patient.statusLabel} <span class="status-badge ${patient.status}">${patient.status.toUpperCase()}</span>`;
    
    // Ocultar login, mostrar banner
    loginModal.classList.add('hidden');
    patientStatusBanner.classList.remove('hidden');
    
    // Renderizar slots prioritarios
    renderQuickSlots();
    renderConsultationSlots();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
      alert(`Bienvenido ${patient.name}. Te mostramos horarios prioritarios para tu ${patient.statusLabel.toLowerCase()}.`);
    }, 500);
  }

  function handleLogout() {
    currentPatient = null;
    patientStatus = null;
    
    // Ocultar banner, mostrar login
    patientStatusBanner.classList.add('hidden');
    loginModal.classList.remove('hidden');
    
    // Limpiar formulario
    patientRut.value = '';
    patientPassword.value = '';
    
    // Renderizar slots normales
    renderQuickSlots();
    renderConsultationSlots();
  }

  /* ---------- Quick Book Functions ---------- */
  function quickBook(doctorId, date, time) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) return;
    
    selectedDoctor = doctor;
    selectedDate = date;
    selectedTime = time;
    
    // Llenar automáticamente el modal
    const namePreview = patientNameInput.value.trim() || "[Nombre no ingresado]";
    const message = `Estimado ${namePreview}, su ${tipoLabel(doctor.type)} con el Dr. ${doctor.name} se agendará para el ${new Date(date).toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })} a las ${time}.`;
    confirmMessage.textContent = message;
    
    confirmModal.classList.remove('hidden');
    updateConfirmState();
  }

  function selectDoctorForUnified(doctorId) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) return;
    
    // Mostrar cards tradicionales
    cardsWrap.style.display = 'grid';
    
    // Filtrar solo el doctor seleccionado
    renderCards();
    document.querySelectorAll('.card').forEach(card => {
      if (card.dataset.id !== doctorId) {
        card.style.display = 'none';
      } else {
        card.classList.add('selected');
        const desc = card.querySelector('.desc');
        if (desc) desc.style.display = 'block';
      }
    });
  }

  function showAllSlots() {
    patientStatus = null;
    renderQuickSlots();
    renderConsultationSlots();
  }

  /* ---------- Date Selection ---------- */
  function onDateSelected(doc, ymd, cellElement) {
    selectedDoctor = doc; 
    selectedDate = ymd; // store

    // Hide other cards
    document.querySelectorAll(".card").forEach(c => {
      if (c.dataset.id !== doc.id) c.style.display = "none";
      else {
        c.classList.add("selected");
        const desc = c.querySelector(".desc"); 
        if (desc) desc.style.display = "block";
      }
    });

    // Build horarios
    panelMedicoName.textContent = doc.name;
    panelMedicoTipo.textContent = tipoLabel(doc.type);
    panelFechaTitle.textContent = new Date(ymd).toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

    horariosList.innerHTML = "";
    doc.schedules.forEach(h => {
      const row = document.createElement("div"); 
      row.className = "hora-row";
      const lbl = document.createElement("div"); 
      lbl.className = "hora-label"; 
      lbl.textContent = h;
      const btn = document.createElement("button"); 
      btn.className = "hora-btn"; 
      btn.textContent = "Reservar";
      btn.addEventListener("click", () => {
        selectedTime = h;
        openConfirmModal();
      });
      row.appendChild(lbl); 
      row.appendChild(btn);
      horariosList.appendChild(row);
    });

    // Show panel and set its height equal to selected card
    panelHorarios.classList.remove("hidden");
    // set height
    const selCard = document.querySelector(`.card[data-id="${doc.id}"]`);
    if (selCard) {
      // compute height px and apply to panel
      const h = selCard.getBoundingClientRect().height;
      panelHorarios.style.minHeight = `${Math.max(h, 200)}px`;
      panelHorarios.style.maxHeight = `${Math.max(h, 200)}px`;
    }
  }

  /* ---------- Confirm Modal Logic ---------- */
  function openConfirmModal() {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    // fill message with logged patient name
    const patientName = currentPatient ? currentPatient.name : "[Nombre no ingresado]";
    const doctorTitle = selectedDoctor.name.includes('Dra.') ? 'Dra.' : 'Dr.';
    const message = `Estimado ${patientName}, su ${tipoLabel(selectedDoctor.type)} con el ${doctorTitle} ${selectedDoctor.name} se agendará para el ${new Date(selectedDate).toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })} a las ${selectedTime}.`;
    confirmMessage.textContent = message;
    // open modal
    confirmModal.classList.remove("hidden");
    // initialize confirm button state
    updateConfirmState();
  }

  function closeConfirmModal() {
    confirmModal.classList.add("hidden");
  }

  function updateConfirmState() {
    const notifyOk = notifyEmail.checked || notifyWhatsapp.checked;
    btnConfirm.disabled = !notifyOk;
  }

  // confirm action
  function confirmReservation() {
    const patient = currentPatient ? currentPatient.name : "[Nombre no ingresado]";
    const notifyBy = [];
    if (notifyEmail.checked) notifyBy.push("correo");
    if (notifyWhatsapp.checked) notifyBy.push("whatsapp");

    const doctorTitle = selectedDoctor.name.includes('Dra.') ? 'Dra.' : 'Dr.';
    const doctorName = selectedDoctor.name.replace(/^(Dr\.|Dra\.)\s*/, '');
    const finalMessage = `Tu reserva ha quedado confirmada con el ${doctorTitle} ${doctorName} para el día ${new Date(selectedDate).toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })} a las ${selectedTime}.\n\nEs importante que asista a la hora médica ya que faltar le quita el cupo a una persona que necesita la hora.`;

    // Simulación de confirmación: en producción se envía al backend
    alert(finalMessage);

    // After confirm reset UI
    closeConfirmModal();
    resetView();
  }

  /* ---------- Reset View ---------- */
  function resetView() {
    panelHorarios.classList.add("hidden");
    panelHorarios.style.minHeight = "";
    panelHorarios.style.maxHeight = "";
    selectedDoctor = null; 
    selectedDate = null; 
    selectedTime = null;
    // show all cards again
    document.querySelectorAll(".card").forEach(c => {
      c.style.display = "";
      c.classList.remove("selected");
      const desc = c.querySelector(".desc"); 
      if (desc) desc.style.display = "none";
      c.querySelectorAll(".day.selected").forEach(d => d.classList.remove("selected"));
    });
    // clear confirm modal inputs
    notifyEmail.checked = false;
    notifyWhatsapp.checked = true; // Default to WhatsApp
    btnConfirm.disabled = false;
    // Mostrar vista unificada por defecto
    const unifiedGrid = document.getElementById('unifiedGrid');
    const consultationSlots = document.getElementById('consultationSlots');
    
    if (unifiedGrid && consultationSlots) {
      unifiedGrid.style.display = 'block';
      consultationSlots.style.display = 'none';
      if (toggleView) toggleView.textContent = 'Vista individual';
      renderUnifiedView();
    }
  }

  /* ---------- Event Bindings ---------- */
  // Login events
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Filter events
  if (filtroTipo) {
    filtroTipo.addEventListener("change", () => {
      resetView();
      renderCards(filtroTipo.value);
    });
  }

  // Confirm modal events
  if (closeConfirm) {
    closeConfirm.addEventListener("click", closeConfirmModal);
  }
  // Removed patientNameInput event listener since field no longer exists
  if (notifyEmail) {
    notifyEmail.addEventListener("change", updateConfirmState);
  }
  if (notifyWhatsapp) {
    notifyWhatsapp.addEventListener("change", updateConfirmState);
  }
  if (btnConfirm) {
    btnConfirm.addEventListener("click", confirmReservation);
  }

  // Refresh availability
  if (refreshAvailability) {
    refreshAvailability.addEventListener('click', () => {
      renderQuickSlots();
      setTimeout(() => {
        alert('Disponibilidad actualizada');
      }, 500);
    });
  }

  // Event delegation for quick booking buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-slot-btn') || e.target.classList.contains('consultation-slot-btn')) {
      const doctorId = e.target.getAttribute('data-doctor-id');
      const date = e.target.getAttribute('data-date');
      const time = e.target.getAttribute('data-time');
      if (doctorId && date && time) {
        quickBook(doctorId, date, time);
      }
    }
    
    // Handle availability items clicks
    if (e.target.classList.contains('availability-item') || e.target.closest('.availability-item')) {
      const item = e.target.classList.contains('availability-item') ? e.target : e.target.closest('.availability-item');
      const doctorId = item.getAttribute('data-doctor-id');
      if (doctorId) {
        selectDoctorForUnified(doctorId);
      }
    }
  });

  // Toggle view - now inside consultation-availability
  if (toggleView) {
    toggleView.addEventListener('click', () => {
      const unifiedGrid = document.getElementById('unifiedGrid');
      const consultationSlots = document.getElementById('consultationSlots');
      
      if (unifiedGrid && consultationSlots) {
        const isUnified = unifiedGrid.style.display !== 'none';
        if (isUnified) {
          unifiedGrid.style.display = 'none';
          consultationSlots.style.display = 'grid';
          toggleView.textContent = 'Vista unificada';
        } else {
          unifiedGrid.style.display = 'block';
          consultationSlots.style.display = 'none';
          toggleView.textContent = 'Vista individual';
          renderUnifiedView();
        }
      }
    });
  }

  // click outside confirm-content to close modal
  if (confirmModal) {
    confirmModal.addEventListener("click", (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });
  }

  // Make functions globally available
  window.quickBook = quickBook;
  window.selectDoctorForUnified = selectDoctorForUnified;
  window.showAllSlots = showAllSlots;

  /* ---------- Initial Render ---------- */
  renderCards();
  renderUnifiedView();
  renderQuickSlots();
  renderConsultationSlots();

  // CSS adicional para slots prioritarios
  const priorityStyles = `
    .priority-slot {
      border-left: 4px solid #374151;
    }

    .priority-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .priority-badge.ges {
      background: #dbeafe;
      color: #1e40af;
    }

    .priority-badge.control {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge.odontologia {
      background: #d1fae5;
      color: #065f46;
    }

    .no-slots {
      text-align: center;
      padding: 20px;
      color: #6b7280;
    }

    .show-all-btn {
      background: #374151;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 12px;
    }

    .show-all-btn:hover {
      background: #1f2937;
    }
  `;

  // Agregar estilos al head
  const styleSheet = document.createElement('style');
  styleSheet.textContent = priorityStyles;
  document.head.appendChild(styleSheet);
});












