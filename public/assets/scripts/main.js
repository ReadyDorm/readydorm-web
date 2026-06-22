/* ============================================================
   READYDORM — MAIN.JS
   Navegación · Animaciones · Formularios · Mapa simulado
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRevealAnimations();
  initForms();
  initMockClinicsMap();
});

/* -----------------------------------------------------------
   1. NAVEGACIÓN: hamburguesa, dropdown, scroll-spy
   ----------------------------------------------------------- */
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navActions = document.querySelector(".nav-actions");
  const dropdowns = [...document.querySelectorAll(".dropdown")];
  const navLinks = document.querySelectorAll(".nav-link, .dropdown-menu a");

  // Toggle del menú móvil
  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("open");
    navActions?.classList.toggle("open", Boolean(isOpen));
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  // Dropdowns del header
  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".dropdown-button");
    button?.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdowns.forEach((item) => {
        if (item !== dropdown) {
          item.classList.remove("open");
          item.querySelector(".dropdown-button")?.setAttribute("aria-expanded", "false");
        }
      });
      const isOpen = dropdown.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
        dropdown.querySelector(".dropdown-button")?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Cerrar menús al navegar
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        dropdown.querySelector(".dropdown-button")?.setAttribute("aria-expanded", "false");
      });
      navMenu?.classList.remove("open");
      navActions?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Scroll-spy para resaltar la sección activa en el menú
  const sections = [...document.querySelectorAll("main section[id]")];
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
      const activeLink = document.querySelector(`.nav-link[href="#${visible.target.id}"]`);
      activeLink?.classList.add("active");
    },
    { threshold: [0.18, 0.35, 0.6], rootMargin: "-90px 0px -55% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

/* -----------------------------------------------------------
   2. ANIMACIONES REVEAL al hacer scroll
   ----------------------------------------------------------- */
function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  elements.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------------------
   3. FORMULARIOS de login y registro
   ----------------------------------------------------------- */
function initForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Inicio de sesión correcto. Redirigiendo al inicio...");
    setTimeout(() => { window.location.href = "index.html#inicio"; }, 1100);
  });

  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Cuenta creada correctamente. Redirigiendo al inicio...");
    setTimeout(() => { window.location.href = "index.html#inicio"; }, 1100);
  });
}

/* -----------------------------------------------------------
   4. TOAST: notificaciones flotantes
   ----------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

function callEmergency(service, number) {
  showToast(`Llamando a ${service} (${number}) desde el directorio de auxilio.`);
}

/* -----------------------------------------------------------
   5. MAPA INTERACTIVO SIMULADO de clínicas cercanas
   ----------------------------------------------------------- */
function initMockClinicsMap() {
  const mockMap = document.getElementById("mockMap");
  if (!mockMap) return;

  const detectButton = document.getElementById("detectLocation");
  const recenterButton = document.getElementById("recenterMap");
  const statusElement = document.getElementById("locationStatus");
  const clinicList = document.getElementById("clinicList");
  const clinicCount = document.getElementById("clinicCount");
  const userMarker = document.getElementById("userMarker");
  const pins = [...document.querySelectorAll(".clinic-pin")];
  const filterButtons = [...document.querySelectorAll(".map-filter")];
  const activeRoute = document.getElementById("activeRoute");
  const routeTrail = document.getElementById("routeTrail");
  const mapInfoCard = document.getElementById("mapInfoCard");
  const routeDistance = document.getElementById("routeDistance");
  const routeTime = document.getElementById("routeTime");
  const nearestClinicName = document.getElementById("nearestClinicName");
  const zoomLabel = document.getElementById("mapZoomLabel");
  const zoomInButton = document.getElementById("zoomInMap");
  const zoomOutButton = document.getElementById("zoomOutMap");
  const resetViewButton = document.getElementById("resetMapView");

  const baseClinics = [
    {
      id: 0,
      name: "Clínica ReadyCare 24h",
      shortName: "ReadyCare 24h",
      address: "Av. La Marina 1235, San Miguel",
      status: "Emergencia 24h",
      type: "emergency",
      distance: 0.8,
      eta: 5,
      route: "M16 66 H64 V34"
    },
    {
      id: 1,
      name: "Clínica San Pablo",
      shortName: "San Pablo",
      address: "Av. El Polo 789, Surco",
      status: "Hospital privado",
      type: "general",
      distance: 1.6,
      eta: 9,
      route: "M16 66 H80 V18"
    },
    {
      id: 2,
      name: "Centro Médico Universitario",
      shortName: "Centro Universitario",
      address: "Av. Universitaria 1801, San Miguel",
      status: "Atención general",
      type: "general",
      distance: 2.1,
      eta: 12,
      route: "M16 66 H80"
    },
    {
      id: 3,
      name: "Hospital de Emergencias",
      shortName: "Hospital Emergencias",
      address: "Av. Grau 800, Cercado de Lima",
      status: "Urgencias",
      type: "emergency",
      distance: 2.6,
      eta: 15,
      route: "M16 66 H48 V82"
    },
    {
      id: 4,
      name: "Policlínico Magdalena",
      shortName: "Policlínico",
      address: "Jr. Castilla 540, Magdalena",
      status: "Atención básica",
      type: "general",
      distance: 3.2,
      eta: 18,
      route: "M16 66 H32 V34"
    }
  ];

  let sourceClinics = [...baseClinics];
  let clinics = [...sourceClinics];
  let currentFilter = "all";
  let currentZoom = 100;

  renderClinicList(clinics);
  activateClinic(0);
  updatePinsVisibility(clinics);

  detectButton?.addEventListener("click", () => {
    detectButton.disabled = true;
    detectButton.textContent = "Simulando...";
    statusElement.textContent = "Analizando ubicación del usuario...";

    setTimeout(() => {
      userMarker?.classList.add("detected");
      sourceClinics = baseClinics
        .map((c, i) => ({
          ...c,
          distance: Math.max(0.4, c.distance - (i % 2 === 0 ? 0.3 : 0.1)),
          eta: Math.max(3, c.eta - (i % 2 === 0 ? 2 : 1))
        }))
        .sort((a, b) => a.distance - b.distance);
      clinics = [...sourceClinics];
      updatePinDistanceLabels(sourceClinics);

      applyFilter(currentFilter, false);
      activateClinic(clinics[0].id);
      statusElement.textContent = "Ubicación detectada (simulada): 5 clínicas cercanas";
      detectButton.disabled = false;
      detectButton.textContent = "Actualizar simulación";
      showToast("Mapa actualizado con clínicas cercanas a tu ubicación.");
    }, 900);
  });

  recenterButton?.addEventListener("click", () => {
    currentZoom = 100;
    updateZoomState();
    userMarker?.classList.add("detected");
    activateClinic(clinics[0]?.id ?? 0);
    statusElement.textContent = "Mapa centrado en tu ubicación simulada";
    showToast("Vista del mapa centrada correctamente.");
  });

  zoomInButton?.addEventListener("click", () => {
    currentZoom = Math.min(125, currentZoom + 25);
    updateZoomState();
  });

  zoomOutButton?.addEventListener("click", () => {
    currentZoom = Math.max(75, currentZoom - 25);
    updateZoomState();
  });

  resetViewButton?.addEventListener("click", () => {
    currentZoom = 100;
    updateZoomState();
  });

  pins.forEach((pin) => {
    pin.addEventListener("click", () => activateClinic(Number(pin.dataset.clinicId)));
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      applyFilter(currentFilter);
    });
  });

  function applyFilter(filter, showMessage = true) {
    if (filter === "emergency") {
      clinics = sourceClinics.filter((c) => c.type === "emergency").sort((a, b) => a.distance - b.distance);
    } else if (filter === "close") {
      clinics = [...sourceClinics].sort((a, b) => a.distance - b.distance).slice(0, 3);
    } else if (filter === "general") {
      clinics = sourceClinics.filter((c) => c.type === "general").sort((a, b) => a.distance - b.distance);
    } else {
      clinics = [...sourceClinics].sort((a, b) => a.distance - b.distance);
    }

    renderClinicList(clinics);
    updatePinsVisibility(clinics);
    activateClinic(clinics[0]?.id ?? 0);
    if (showMessage) showToast(`Filtro aplicado: ${buttonLabel(filter)}`);
  }

  function buttonLabel(filter) {
    const labels = { all: "Todas", emergency: "24h", close: "Más cerca", general: "General" };
    return labels[filter] || "Todas";
  }

  function updatePinsVisibility(items) {
    const visibleIds = items.map((item) => item.id);
    pins.forEach((pin) => {
      pin.classList.toggle("is-hidden", !visibleIds.includes(Number(pin.dataset.clinicId)));
    });
  }

  function updatePinDistanceLabels(items) {
    items.forEach((clinic) => {
      const pin = pins.find((item) => Number(item.dataset.clinicId) === clinic.id);
      const label = pin?.querySelector("small");
      if (label) label.textContent = `${clinic.distance.toFixed(1)} km`;
    });
  }

  function renderClinicList(items) {
    clinicCount.textContent = `${items.length} resultado${items.length === 1 ? "" : "s"}`;
    clinicList.innerHTML = items
      .map((c) => `
        <article class="clinic-card" data-clinic-id="${c.id}">
          <h4>${c.name}</h4>
          <p>${c.address}</p>
          <div class="clinic-meta">
            <span class="meta-distance">${c.distance.toFixed(1)} km · ${c.eta} min</span>
            <span class="meta-status ${c.type}">${c.status}</span>
          </div>
          <a class="route-link" href="#mockMap">Ver ruta simulada →</a>
        </article>
      `)
      .join("");

    clinicList.querySelectorAll(".clinic-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        activateClinic(Number(card.dataset.clinicId));
        mockMap.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function activateClinic(id) {
    const selected = sourceClinics.find((c) => c.id === id) || sourceClinics[0];
    pins.forEach((pin) => pin.classList.toggle("active", Number(pin.dataset.clinicId) === selected.id));
    clinicList.querySelectorAll(".clinic-card").forEach((card) => {
      card.classList.toggle("active", Number(card.dataset.clinicId) === selected.id);
    });

    if (activeRoute) activeRoute.setAttribute("d", selected.route);
    if (routeTrail) routeTrail.setAttribute("d", selected.route);
    if (routeDistance) routeDistance.textContent = `${selected.distance.toFixed(1)} km`;
    if (routeTime) routeTime.textContent = `${selected.eta} min`;
    if (nearestClinicName) nearestClinicName.textContent = selected.shortName;

    if (mapInfoCard) {
      mapInfoCard.querySelector("h3").textContent = selected.name;
      mapInfoCard.querySelector("p").textContent = selected.address;
    }
    statusElement.textContent = `Ruta simulada hacia: ${selected.name}`;
  }

  function updateZoomState() {
    mockMap.classList.remove("zoom-in", "zoom-out");
    if (currentZoom > 100) mockMap.classList.add("zoom-in");
    if (currentZoom < 100) mockMap.classList.add("zoom-out");
    if (zoomLabel) zoomLabel.textContent = `${currentZoom}%`;
    showToast(`Zoom simulado: ${currentZoom}%`);
  }
}


/* ============================================================
   READYDORM — NUEVAS FUNCIONES (HU_01 – HU_50)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initSegmentTabs();
  initSOSDemo();
  initBSMTabs();
  initGestorTabs();
  initResidentGrid();
  initQuiz();
  initDrillTimer();
  updateBackpack();
});

/* ── TABS DE SEGMENTOS ─────────────────────────────────────── */
function initSegmentTabs() {
  const bar = document.getElementById("segTabBar");
  if (!bar) return;
  bar.querySelectorAll(".seg-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      bar.querySelectorAll(".seg-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".seg-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("seg-" + tab.dataset.seg);
      if (panel) panel.classList.add("active");
    });
  });
}

/* ── SOS DEMO ──────────────────────────────────────────────── */
function initSOSDemo() {
  const btn = document.getElementById("sosBtnHold");
  if (!btn) return;
  let holdTimer = null;
  let countdown = 3;
  let countInterval = null;

  const updateClock = () => {
    const el = document.getElementById("sosTimeDisplay");
    if (!el) return;
    const now = new Date();
    el.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  };
  updateClock();
  setInterval(updateClock, 10000);

  const startHold = () => {
    countdown = 3;
    const label = document.getElementById("sosBtnLabel");
    const sub   = document.getElementById("sosBtnSub");
    const core  = btn.querySelector(".shb-core");
    if (label) label.textContent = "3";
    if (sub)   sub.textContent = "suelta para cancelar";
    if (core)  core.classList.add("counting");
    countInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countInterval);
        cancelHold();
        triggerSOS();
      } else {
        if (label) label.textContent = String(countdown);
      }
    }, 1000);
  };

  const cancelHold = () => {
    clearInterval(countInterval);
    const label = document.getElementById("sosBtnLabel");
    const sub   = document.getElementById("sosBtnSub");
    const core  = btn.querySelector(".shb-core");
    if (label) label.textContent = "SOS";
    if (sub)   sub.textContent = "Mantener 3s";
    if (core)  core.classList.remove("counting");
  };

  btn.addEventListener("mousedown",  startHold);
  btn.addEventListener("touchstart", startHold, { passive: true });
  btn.addEventListener("mouseup",    cancelHold);
  btn.addEventListener("mouseleave", cancelHold);
  btn.addEventListener("touchend",   cancelHold);
}

function triggerSOS() {
  showSOSState("sosStateSent");
  showToast("🆘 SOS activado — 3 contactos notificados con GPS");
}

function cancelSOS() {
  showSOSState("sosStateCancelled");
  showToast("Alerta cancelada — tus contactos fueron informados");
}

function reportSafe() {
  showSOSState("sosStateSafe");
  showToast("✅ Tus contactos saben que estás a salvo");
}

function activateVoice() {
  showSOSState("sosStateVoice");
  setTimeout(() => {
    triggerSOS();
    showToast("🎤 Voz reconocida: SOS activado automáticamente");
  }, 2800);
}

function toggleTorch() {
  const btn    = document.getElementById("torchBtn");
  const status = document.getElementById("torchStatus");
  const isOn   = btn?.textContent.includes("apagada") === false && status?.textContent.includes("encendida");
  if (status) status.textContent = isOn ? "Linterna: apagada" : "Linterna: encendida 🔦";
  if (btn)    btn.textContent    = isOn ? "🔦 Linterna"      : "💡 Encendida";
  showToast(isOn ? "Linterna apagada" : "Linterna encendida ✓");
}

function showProximityAlert() {
  const pa = document.getElementById("proximityAlert");
  if (!pa) return;
  pa.style.display = "flex";
  setTimeout(() => { pa.style.display = "none"; }, 4000);
  showToast("⚠️ Alerta de piso activada — evacuación inmediata");
}

function showSOSState(id) {
  ["sosStateNormal","sosStateSent","sosStateCancelled","sosStateSafe","sosStateVoice"].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = "none";
  });
  const target = document.getElementById(id);
  if (target) target.style.display = "block";
}

function resetSOS() { showSOSState("sosStateNormal"); }

/* ── PERFIL & CONTACTOS ────────────────────────────────────── */
function saveMedical() {
  const bt = document.getElementById("bloodType")?.value;
  const al = document.getElementById("allergies")?.value;
  if (!al.trim()) {
    showToast("⚠️ El grupo sanguíneo es requerido para protocolos de emergencia");
    return;
  }
  showToast("✅ Ficha médica actualizada con éxito — Tipo " + bt);
}

function addContact() {
  const name  = document.getElementById("newContactName")?.value.trim();
  const phone = document.getElementById("newContactPhone")?.value.trim();
  if (!name || phone.length !== 9) {
    showToast("⚠️ El número debe contener exactamente 9 dígitos");
    return;
  }
  const list = document.getElementById("contactList");
  if (!list) return;
  const initials = name.charAt(0).toUpperCase();
  const item = document.createElement("div");
  item.className = "contact-item verified";
  item.innerHTML = `<div class="ci-avatar">${initials}</div><div class="ci-info"><strong>${name}</strong><small>+51 ${phone} · Vinculado</small></div><span class="ci-badge">✓</span>`;
  list.appendChild(item);
  document.getElementById("newContactName").value = "";
  document.getElementById("newContactPhone").value = "";
  showToast("✅ Contacto vinculado. SMS de invitación enviado.");
}

function toggleGPS(el)   { showToast(el.checked ? "GPS: solo durante SOS ✓" : "GPS: compartir siempre"); }
function toggleBio(el)   { showToast(el.checked ? "Acceso biométrico activado ✓" : "Biometría desactivada"); }
function toggleNotif(el) { showToast(el.checked ? "Notificaciones críticas: bypass silencio ✓" : "Notificaciones normales"); }

function selectResident(card, name) {
  document.querySelectorAll(".rs-card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");
  const status = name === "Carlos" ? "⚠️ sin reportar" : "✅ a salvo";
  const msg = document.getElementById("residentMsg");
  if (msg) msg.innerHTML = `Monitoreando: <strong>${name}</strong> — Estado: ${status}`;
}

/* ── COORDINACIÓN ──────────────────────────────────────────── */
function confirmTask(btn, name, task) {
  btn.textContent = "✓ Completado";
  btn.classList.add("done");
  btn.disabled = true;
  const msg = document.getElementById("taskConfirmMsg");
  if (msg) {
    msg.style.display = "block";
    msg.innerHTML = `<strong>✅ ${name}</strong> confirmó: "${task === 'gas' ? 'Llave de gas cortada' : task === 'luz' ? 'Electricidad cortada' : 'Evacuación iniciada'}" — Notificado al grupo.`;
  }
  showToast(`✅ Tarea confirmada por ${name}`);
}

function sendChatMsg() {
  const input = document.getElementById("chatInput");
  const box   = document.getElementById("chatBox");
  if (!input || !box || !input.value.trim()) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble sent";
  bubble.textContent = "Tú: " + input.value.trim();
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  input.value = "";
}

function sendQuick(msg) {
  const box = document.getElementById("chatBox");
  if (!box) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble sent";
  bubble.textContent = "Tú: " + msg;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function markSupplyDone() {
  const alert = document.getElementById("supplyAlertDemo");
  if (alert) { alert.style.background = "rgba(46,197,182,.12)"; alert.querySelector("span.sa-icon").textContent = "✅"; alert.querySelector("strong").textContent = "Agua embotellada — comprada"; }
  showToast("✅ Suministro registrado. Mochila actualizada.");
}

function registerExpense() {
  const concept = document.getElementById("expConcept")?.value.trim();
  const amount  = document.getElementById("expAmount")?.value.trim();
  if (!concept || !amount) { showToast("⚠️ Completa concepto y monto"); return; }
  const list = document.getElementById("expenseList");
  if (!list) return;
  const item = document.createElement("div");
  item.className = "expense-item";
  item.innerHTML = `<span>${concept}</span><strong>S/ ${parseFloat(amount).toFixed(2)}</strong>`;
  list.appendChild(item);
  document.getElementById("expConcept").value = "";
  document.getElementById("expAmount").value  = "";
  showToast(`✅ Gasto registrado: ${concept} — S/ ${amount}`);
}

function simulateIntrusion() {
  const status = document.getElementById("intrusionStatus");
  if (!status) return;
  status.innerHTML = `<span class="id-dot red"></span><div><strong style="color:var(--alert)">⚠ Acceso no autorizado detectado</strong><small>Pasadizo norte — 23:42 hrs</small></div>`;
  showToast("🚨 Alerta de intruso en pasadizo norte — piso 3");
  setTimeout(() => {
    status.innerHTML = `<span class="id-dot green"></span><div><strong>Piso seguro</strong><small>Falsa alarma descartada</small></div>`;
  }, 4000);
}

/* ── MOCHILA INTERACTIVA ────────────────────────────────────── */
function initBSMTabs() {
  const bar = document.getElementById("bsmTabBar");
  if (!bar) return;
  bar.querySelectorAll(".bsm-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      bar.querySelectorAll(".bsm-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".bsm-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("bsm-" + tab.dataset.bsm);
      if (panel) panel.classList.add("active");
    });
  });
}

function updateBackpack() {
  const items    = document.querySelectorAll(".bck-item input");
  const bar      = document.getElementById("bpBar");
  const scoreEl  = document.getElementById("backpackScore");
  if (!items.length) return;
  const checked  = [...items].filter(i => i.checked).length;
  const pct      = Math.round((checked / items.length) * 100);
  if (bar)     bar.style.width = pct + "%";
  if (scoreEl) scoreEl.textContent = `${checked} / ${items.length} elementos listos`;
  const scoreValue = document.getElementById("scoreValue");
  if (scoreValue) {
    const newScore = Math.round(50 + (pct * 0.5));
    scoreValue.textContent = newScore;
    const scoreLabel = document.getElementById("scoreLabel");
    if (scoreLabel) {
      if (newScore >= 80)      scoreLabel.textContent = "🟦 Usuario altamente preparado";
      else if (newScore >= 60) scoreLabel.textContent = "🟨 Usuario preparado";
      else                     scoreLabel.textContent = "🟥 Necesita mejorar";
    }
  }
}

/* ── QUIZ DE SEGURIDAD ──────────────────────────────────────── */
const QUIZ = [
  { q: "¿Qué hacer durante un sismo?", opts: ["Correr hacia la calle","Ubicarse bajo una mesa resistente","Usar el ascensor","Abrir todas las ventanas"], a: 1 },
  { q: "¿Cuántas horas debe cubrir una mochila de emergencia?", opts: ["24 horas","48 horas","72 horas","96 horas"], a: 2 },
  { q: "¿Cuál es el número de los bomberos en Perú?", opts: ["105","106","116","115"], a: 2 },
  { q: "Si hueles gas en tu vivienda, ¿qué haces primero?", opts: ["Encender la luz para ver mejor","Abrir ventanas y evacuar","Llamar desde adentro","Apagar el gas con agua"], a: 1 },
  { q: "Si el pasillo tiene humo en un incendio, debes:", opts: ["Correr erguido","Desplazarte agachado","Abrir ventanas","Esperar en el cuarto"], a: 1 }
];
let quizIdx = 0, quizScore = 0;

function initQuiz() {
  renderQuestion();
}

function renderQuestion() {
  const q = QUIZ[quizIdx];
  if (!q) return;
  const qEl   = document.getElementById("quizQuestion");
  const optsEl = document.getElementById("quizOptions");
  const progEl = document.getElementById("quizProgress");
  if (qEl)   qEl.textContent = q.q;
  if (progEl) progEl.textContent = `Pregunta ${quizIdx + 1} de ${QUIZ.length}`;
  if (optsEl) {
    optsEl.innerHTML = "";
    q.opts.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "qo-btn";
      btn.textContent = opt;
      btn.onclick = () => answerQuiz(i === q.a);
      optsEl.appendChild(btn);
    });
  }
}

function answerQuiz(correct) {
  if (correct) quizScore++;
  const opts = document.querySelectorAll(".qo-btn");
  const q    = QUIZ[quizIdx];
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.a)    btn.classList.add("correct");
    else              btn.classList.add("wrong");
  });
  setTimeout(() => {
    quizIdx++;
    if (quizIdx >= QUIZ.length) {
      showQuizResult();
    } else {
      renderQuestion();
    }
  }, 900);
}

function showQuizResult() {
  const area   = document.getElementById("quizArea");
  const result = document.getElementById("quizResult");
  const score  = document.getElementById("quizFinalScore");
  if (area)   area.style.display   = "none";
  if (result) result.style.display = "block";
  if (score)  score.textContent    = `¡Puntaje: ${quizScore}/${QUIZ.length}!`;
  if (quizScore >= 4) {
    const badge = document.getElementById("badgeGrid");
    if (badge) {
      const locked = badge.querySelector(".badge-item.locked");
      if (locked) locked.classList.replace("locked", "earned");
    }
    showToast("🏅 ¡Medalla desbloqueada: Experto en seguridad!");
  }
}

function resetQuiz() {
  quizIdx = 0; quizScore = 0;
  const area   = document.getElementById("quizArea");
  const result = document.getElementById("quizResult");
  if (area)   area.style.display   = "block";
  if (result) result.style.display = "none";
  renderQuestion();
}

/* ── SIMULACRO ──────────────────────────────────────────────── */
let drillInterval = null, drillSeconds = 0, drillStep = 0;
const DRILL_STEPS = [
  "Paso 1: Activa el botón SOS en tu teléfono",
  "Paso 2: Confirma tu rol (gas, luz o evacuación)",
  "Paso 3: Notifica a tus roommates y baja por las escaleras",
  "Paso 4: Llega al punto de encuentro y reporta 'Estoy a salvo'"
];

function initDrillTimer() {}

function startDrill() {
  const modal = document.getElementById("drillModal");
  if (modal) modal.style.display = "flex";
  drillSeconds = 0; drillStep = 0;
  updateDrillDisplay();
  clearInterval(drillInterval);
  drillInterval = setInterval(() => {
    drillSeconds++;
    updateDrillDisplay();
  }, 1000);
}

function updateDrillDisplay() {
  const timer = document.getElementById("drillTimer");
  const step  = document.getElementById("drillStep");
  const min   = String(Math.floor(drillSeconds / 60)).padStart(2, "0");
  const sec   = String(drillSeconds % 60).padStart(2, "0");
  if (timer) timer.textContent = min + ":" + sec;
  if (step)  step.textContent  = DRILL_STEPS[drillStep] || "Simulacro completado";
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById("ds" + i);
    if (!el) continue;
    if (i - 1 < drillStep)   el.classList.add("done"),   el.classList.remove("active");
    else if (i - 1 === drillStep) el.classList.add("active"), el.classList.remove("done");
    else el.classList.remove("done", "active");
  }
}

function advanceDrill() {
  drillStep++;
  if (drillStep >= DRILL_STEPS.length) {
    endDrill(true);
  } else {
    updateDrillDisplay();
  }
}

function endDrill(completed) {
  clearInterval(drillInterval);
  const modal = document.getElementById("drillModal");
  if (modal) modal.style.display = "none";
  if (completed) {
    const min = Math.floor(drillSeconds / 60), sec = drillSeconds % 60;
    showToast(`🏁 Simulacro completado en ${min}:${String(sec).padStart(2,"0")} min. ¡Tiempo registrado!`);
  }
}

function showTutorial() {
  const modal = document.getElementById("tutorialModal");
  if (modal) modal.style.display = "flex";
}
function closeTutorial() {
  const modal = document.getElementById("tutorialModal");
  if (modal) modal.style.display = "none";
}

/* ── VISTA CONTACTO/FAMILIA ─────────────────────────────────── */
function famConfirm() {
  showFamFeedback("✅ Alerta leída — Sofía sabe que estás en camino", "ok");
  showToast("Confirmación enviada al residente");
}
function famCall()    { showFamFeedback("📞 Llamando a Sofía... (+51 987 654 321)", "ok"); showToast("Marcando número de Sofía..."); }
function famRoute()   { showFamFeedback("🗺️ Ruta calculada: 12 min en auto desde tu ubicación", "ok"); showToast("Ruta abierta hacia Av. Larco 432"); }
function famMedical() { showFamFeedback("🩺 Sofía · Sangre: O+ · Alergias: Ninguna · Asma leve", "ok"); showToast("Ficha médica de Sofía cargada"); }

function showFamFeedback(msg, type) {
  const fb = document.getElementById("famFeedback");
  if (!fb) return;
  fb.style.display = "block";
  fb.className = "fam-feedback " + type;
  fb.textContent = msg;
}

function showFamAlert() {
  document.getElementById("famStateAlert").style.display   = "block";
  document.getElementById("famStateHistory").style.display = "none";
  document.querySelectorAll(".fam-tab-btn").forEach((b,i) => b.classList.toggle("active", i===0));
}
function showFamHistory() {
  document.getElementById("famStateAlert").style.display   = "none";
  document.getElementById("famStateHistory").style.display = "block";
  document.querySelectorAll(".fam-tab-btn").forEach((b,i) => b.classList.toggle("active", i===1));
}

/* ── DASHBOARD GESTOR ───────────────────────────────────────── */
const RESIDENTS = [
  {name:"Ana M.", floor:1}, {name:"Luis R.", floor:1}, {name:"Karen P.", floor:1},
  {name:"Jorge S.", floor:2}, {name:"Martina", floor:2}, {name:"Roberto", floor:2},
  {name:"Diego F.", floor:3}, {name:"Valeria", floor:3}, {name:"Andrea", floor:3},
  {name:"Carlos B.", floor:4}, {name:"Sofia L.", floor:4}, {name:"Miguel T.", floor:4},
  {name:"Rosa M.", floor:5}, {name:"Julio V.", floor:5}, {name:"Paola A.", floor:5},
  {name:"Edwin R.", floor:6}, {name:"Luz G.", floor:6}, {name:"Mario C.", floor:6}
];
let residentStates = {};

function initResidentGrid() {
  const grid = document.getElementById("residentGrid");
  if (!grid) return;
  RESIDENTS.forEach((r, i) => {
    residentStates[i] = ["safe","danger","unknown"][Math.floor(Math.random()*3)];
  });
  renderResidentGrid();
}

function renderResidentGrid() {
  const grid = document.getElementById("residentGrid");
  if (!grid) return;
  grid.innerHTML = RESIDENTS.map((r, i) => {
    const state = residentStates[i];
    return `<div class="rg-resident" onclick="toggleResidentSafe(${i})" title="Piso ${r.floor} · Click para marcar a salvo">
      <div class="rg-avatar">${r.name.charAt(0)}</div>
      <span class="rg-name">${r.name}</span>
      <div class="rg-dot ${state}"></div>
    </div>`;
  }).join("");
}

function toggleResidentSafe(i) {
  residentStates[i] = residentStates[i] === "safe" ? "unknown" : "safe";
  renderResidentGrid();
  const safe = Object.values(residentStates).filter(s=>s==="safe").length;
  showToast(`${safe}/${RESIDENTS.length} residentes reportados a salvo`);
}

function markAllSafe() {
  RESIDENTS.forEach((_, i) => { residentStates[i] = "safe"; });
  renderResidentGrid();
  showToast("✅ Todos los residentes marcados a salvo");
}

function resetResidents() {
  RESIDENTS.forEach((_, i) => { residentStates[i] = "unknown"; });
  renderResidentGrid();
  showToast("Estado de todos los residentes reiniciado");
}

function initGestorTabs() {
  const bar = document.getElementById("gestorTabBar");
  if (!bar) return;
  bar.querySelectorAll(".gestor-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      bar.querySelectorAll(".gestor-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".gestor-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("gtab-" + tab.dataset.gtab);
      if (panel) panel.classList.add("active");
    });
  });
}

function sendMassAlert() {
  const msg    = document.getElementById("massMsg")?.value.trim();
  const sector = document.getElementById("sectorSelect")?.value;
  if (!msg) { showToast("⚠️ Escribe un mensaje antes de emitir la alerta"); return; }
  const dest = sector === "all" ? "todo el edificio" : "sector: " + sector;
  showToast(`🚨 Alerta emitida a ${dest}: "${msg.substring(0,40)}..."`);
  document.getElementById("massMsg").value = "";
}

function moveMeetingPoint() {
  const pin = document.getElementById("mpmPin");
  if (!pin) return;
  const positions = [{bottom:"12px",right:"16px"},{bottom:"50px",left:"20px"},{top:"10px",right:"20px"}];
  const pos = positions[Math.floor(Math.random()*positions.length)];
  Object.assign(pin.style, {bottom:"auto",right:"auto",top:"auto",left:"auto",...pos});
  showToast("📍 Punto de encuentro actualizado en el mapa");
}

function assignBrigadier(btn, name) {
  const item = btn.closest(".brig-item");
  if (!item) return;
  item.classList.replace("pending", "active");
  const avatar = item.querySelector(".brig-avatar");
  if (avatar) avatar.style.background = "var(--support)";
  btn.replaceWith(Object.assign(document.createElement("span"), { className:"brig-badge", textContent:"🛡️ Brigadista" }));
  showToast(`✅ ${name} asignado como brigadista del edificio`);
}

function addEquipment(el) {
  const types  = ["🧯 PQS","🚿 Manguera","🪣 Balde"];
  const choice = types[Math.floor(Math.random()*types.length)];
  const newEl  = document.createElement("div");
  newEl.className = "em-item";
  newEl.innerHTML = `${choice.split(" ")[0]}<small>${choice.split(" ")[1]}</small>`;
  el.parentNode.insertBefore(newEl, el);
  showToast(`${choice} registrado en el mapa del edificio`);
}

function exportPDF() {
  showToast("📄 Generando PDF INDECI con resultados del simulacro mayo 2026...");
  setTimeout(() => showToast("✅ PDF descargado: Reporte_Simulacro_May2026.pdf"), 1800);
}

function submitDamageReport() {
  const floor = document.getElementById("damageFloor")?.value;
  const desc  = document.getElementById("damageDesc")?.value.trim();
  if (!desc) { showToast("⚠️ Describe el daño antes de enviar"); return; }
  showToast(`📋 Reporte enviado al ingeniero: ${floor} — ${desc.substring(0,30)}...`);
  document.getElementById("damageDesc").value = "";
  document.getElementById("photoMsg").textContent = "";
}

function simulatePhotoUpload() {
  const msg = document.getElementById("photoMsg");
  if (msg) msg.textContent = "📷 foto_grieta_col_norte.jpg adjuntada ✓";
  showToast("Foto adjuntada al reporte de daños");
}

function dismissFault(btn) {
  const item = btn.closest(".fq-item");
  if (item) { item.style.opacity = ".4"; item.style.pointerEvents = "none"; }
  showToast("Avería marcada como atendida ✓");
}

function addFault() {
  const faults = [
    {txt:"Corte de agua caliente — Piso 4", cls:"medium", dot:"med"},
    {txt:"Cable expuesto en pasadizo — Piso 2", cls:"high", dot:""},
    {txt:"Fuga en tubo de cocina — Piso 1", cls:"medium", dot:"med"}
  ];
  const f    = faults[Math.floor(Math.random()*faults.length)];
  const list = document.getElementById("faultQueue");
  if (!list) return;
  const item = document.createElement("div");
  item.className = "fq-item " + f.cls;
  item.innerHTML = `<span class="fq-dot ${f.dot}"></span><div><strong>${f.txt}</strong><small>Ahora · Reportado por residente</small></div><button class="btn btn-sm btn-primary" onclick="dismissFault(this)">Atender</button>`;
  list.prepend(item);
  showToast("🔔 Nueva avería recibida en cola de atención");
}

const EVAC_ROUTES = {
  1: {
    title: "Ruta recomendada: Piso 1",
    primary: "Escalera B → parque frontal",
    primaryMeta: "2 min · pasillo despejado · punto seguro A",
    alt: "Escalera A → patio lateral",
    altMeta: "3 min · usar si hay humo en pasillo central",
    mainPath: "M18 30 H58 V78 H86",
    altPath: "M18 30 H42 V16 H8",
    start: { left: "14%", top: "24%" }
  },
  2: {
    title: "Ruta recomendada: Piso 2",
    primary: "Pasillo sur → Escalera B → parque frontal",
    primaryMeta: "3 min · evita zona de ascensores · punto seguro A",
    alt: "Escalera A → estacionamiento abierto",
    altMeta: "4 min · ruta útil si hay bloqueo en cocina común",
    mainPath: "M28 70 H58 V78 H86",
    altPath: "M28 70 H42 V16 H8",
    start: { left: "24%", top: "66%" }
  },
  3: {
    title: "Ruta recomendada: Piso 3",
    primary: "Dormitorios → corredor central → Escalera B",
    primaryMeta: "4 min · seguir señalética verde · punto seguro A",
    alt: "Escalera A → patio lateral",
    altMeta: "5 min · prioritaria si la alarma viene del ala derecha",
    mainPath: "M68 30 H58 V78 H86",
    altPath: "M68 30 H42 V16 H8",
    start: { left: "66%", top: "25%" }
  },
  4: {
    title: "Ruta recomendada: Piso 4",
    primary: "Sala común → Escalera B → parque frontal",
    primaryMeta: "5 min · no usar ascensor · bajar por el lado derecho",
    alt: "Azotea técnica → Escalera A",
    altMeta: "6 min · solo si brigadista confirma pasillo despejado",
    mainPath: "M32 30 H58 V78 H86",
    altPath: "M32 30 H42 V16 H8",
    start: { left: "28%", top: "24%" }
  }
};

function selectEvacRoute(floor) {
  const route = EVAC_ROUTES[floor] || EVAC_ROUTES[1];
  document.querySelectorAll(".evac-floor").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.floor) === Number(floor));
  });
  const fields = {
    evacTitle: route.title,
    evacPrimary: route.primary,
    evacPrimaryMeta: route.primaryMeta,
    evacAlt: route.alt,
    evacAltMeta: route.altMeta
  };
  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  document.getElementById("evacRouteMain")?.setAttribute("d", route.mainPath);
  document.getElementById("evacRouteAlt")?.setAttribute("d", route.altPath);
  const start = document.getElementById("evacStart");
  if (start) start.textContent = `Piso ${floor}`;
  showToast(`Ruta de evacuación del piso ${floor} cargada.`);
}

function startRouteGuidance() {
  const title = document.getElementById("evacTitle")?.textContent || "Ruta recomendada";
  showToast(`${title}: sigue la línea verde hasta el punto seguro.`);
}

function subscribeNationalDrill() {
  showToast("Aviso de simulacro nacional activado. Recordatorio programado para el 31 de mayo, 10:00 a. m.");
}

const FIRST_AID_GUIDES = {
  rcp: ["RCP básica", "30 compresiones, 2 ventilaciones y llamada inmediata al 106."],
  quemaduras: ["Quemaduras", "Enfría con agua limpia 10 minutos, cubre con gasa y evita reventar ampollas."],
  asfixia: ["Asfixia", "Aplica maniobra abdominal si la persona no puede toser, hablar ni respirar."],
  fracturas: ["Fracturas", "Inmoviliza la zona, evita mover el hueso y espera ayuda médica."],
};

function showFirstAidGuide(guide) {
  const selected = FIRST_AID_GUIDES[guide] || FIRST_AID_GUIDES.rcp;
  document.querySelectorAll(".first-aid-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.guide === guide);
  });
  const preview = document.getElementById("firstAidPreview");
  if (preview) {
    preview.querySelector("strong").textContent = selected[0];
    preview.querySelector("span").textContent = selected[1];
  }
  showToast(`Guía rápida abierta: ${selected[0]}`);
}
