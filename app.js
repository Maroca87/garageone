/* ==========================================================================
   GarageOne - Core Logic (v200)
   ========================================================================== */

const STORAGE_KEY = 'GARAGEONE_DATA_V200';
const USER_KEY = 'GARAGEONE_USER_V200';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SVG_ICONS = {
  car: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h2m8 0h2"/></svg>`,
  oil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m14 10-2 2-2-2"/><path d="M5 18a7 7 0 1 0 14 0 7 7 0 0 0-14 0z"/></svg>`,
  brakes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6m-9-9h6m6 0h6"/></svg>`,
  tires: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5m0 8v5m-9-9h5m8 0h5"/></svg>`,
  filters: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>`,
  spark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  battery: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="12" rx="2"/><line x1="22" y1="11" x2="22" y2="15"/><line x1="6" y1="13" x2="10" y2="13"/><line x1="14" y1="13" x2="14" y2="13"/></svg>`,
  transmission: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  belt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
  document: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  fuel: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 11h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"/><path d="M3 22h12"/><path d="M7 9h4"/></svg>`,
  wrench: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  zap: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

// Descriptive Mechanics Service Categories
const SERVICE_CATEGORIES = [
  'Cambio de Aceite de Motor y Filtro',
  'Inspección y Cambio de Pastillas/Discos de Freno',
  'Rotación, Alineación y Balanceo de Llantas',
  'Cambio de Filtros (Aire, Cabina, Combustible)',
  'Cambio de Bujías y Limpieza de Inyectores',
  'Revisión y Cambio de Batería',
  'Mantenimiento y Cambio de Aceite de Transmisión',
  'Cambio de Correa de Distribución / Faja',
  'Trámite de Vehículo (Marchamo / RTV / Seguro)',
  'Mantenimiento Correctivo / Reparación General'
];

const DEFAULT_STATE = {
  currency: 'CRC',
  geminiApiKey: '',
  vehicles: [],
  activeVehicleId: '',
  documents: [],
  services: [],
  fuels: [],
  reminders: [],
  emergencyContacts: [
    {
      id: 'c1',
      name: 'Grúa / Auxilio 24/7 INS',
      phone: '800-800-911',
      category: 'Auxilio'
    },
    {
      id: 'c2',
      name: 'Taller Mecánico Central',
      phone: '2222-3333',
      category: 'Taller'
    },
    {
      id: 'c3',
      name: 'Asistencia de Emergencia',
      phone: '911',
      category: 'Emergencia'
    }
  ]
};

let appState = loadState();
let currentUser = loadUser();
let isAuthenticated = false;
let failedLoginAttempts = 0;
let lockoutUntil = 0;

function formatCurrency(amount) {
  const curr = appState.currency || 'CRC';
  if (curr === 'CRC') return '₡' + Math.round(amount).toLocaleString('es-CR');
  if (curr === 'USD') return '$' + amount.toFixed(2);
  if (curr === 'EUR') return '€' + amount.toFixed(2);
  return '₡' + Math.round(amount).toLocaleString('es-CR');
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setTodayDates();

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.swipe-container')) resetAllSwipeItems();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    }
  });
});

function loadUser() {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (e) { return null; }
}

function saveUser(user) {
  currentUser = user;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function showLoginForm() {
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  if (formLogin) formLogin.style.display = 'block';
  if (formRegister) formRegister.style.display = 'none';
  const firstName = (currentUser && currentUser.name) ? currentUser.name.split(' ')[0] : '';
  if (authTitle) authTitle.textContent = firstName ? `Hola, ${escapeHtml(firstName)}` : 'Bienvenido a GarageOne';
  if (authSubtitle) authSubtitle.textContent = (currentUser && currentUser.pin) ? 'Ingresa tu PIN para desbloquear' : 'Crea o ingresa tu PIN';
}

function showRegisterForm() {
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  if (formLogin) formLogin.style.display = 'none';
  if (formRegister) formRegister.style.display = 'block';
  if (authTitle) authTitle.textContent = 'Crear Cuenta en GarageOne';
  if (authSubtitle) authSubtitle.textContent = 'Registra tus datos y define un PIN';
}

function checkAuth() {
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('appShell');
  currentUser = loadUser();
  if (isAuthenticated) {
    if (authScreen) authScreen.style.display = 'none';
    if (appShell) appShell.style.display = 'block';
    renderApp();
  } else {
    if (authScreen) authScreen.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';
    showLoginForm();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const pinInput = document.getElementById('loginPin');
  const errorDiv = document.getElementById('loginError');
  const pin = pinInput ? pinInput.value.trim() : '';

  if (lockoutUntil && Date.now() < lockoutUntil) {
    const waitSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
    if (errorDiv) errorDiv.textContent = `Demasiados intentos fallidos. Espera ${waitSecs}s.`;
    return;
  }

  if (!currentUser || !currentUser.pin) {
    showRegisterForm();
    return;
  }

  if (pin === currentUser.pin) {
    isAuthenticated = true;
    failedLoginAttempts = 0;
    if (pinInput) pinInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
    checkAuth();
    requestNotificationPermission();
  } else {
    failedLoginAttempts++;
    if (failedLoginAttempts >= 4) {
      lockoutUntil = Date.now() + 30000;
      if (errorDiv) errorDiv.textContent = 'PIN incorrecto. Bloqueado por 30 segundos.';
    } else {
      if (errorDiv) errorDiv.textContent = `PIN incorrecto (${failedLoginAttempts}/4 intentos).`;
    }
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pin = document.getElementById('regPin').value.trim();

  if (!name || !email || !pin) return;
  if (pin.length < 4) {
    document.getElementById('pinError').textContent = 'El PIN debe tener al menos 4 dígitos.';
    return;
  }

  saveUser({ name, email, pin });
  isAuthenticated = true;
  checkAuth();
  requestNotificationPermission();
}

function resetUserPin(e) {
  if (e) e.preventDefault();
  if (confirm('¿Deseas restablecer la cuenta de usuario para crear un nuevo PIN? Tus vehículos y datos se mantendrán seguros.')) {
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    isAuthenticated = false;
    showRegisterForm();
  }
}

function handleLogout() {
  isAuthenticated = false;
  checkAuth();
}

function loadState() {
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      if (state.vehicles) {
        state.vehicles = state.vehicles.filter(v => v.id !== 'v1' && !v.name.includes('Toyota'));
        if (state.vehicles.length > 0) {
          if (!state.vehicles.some(v => v.id === state.activeVehicleId)) {
            state.activeVehicleId = state.vehicles[0].id;
          }
        } else {
          state.activeVehicleId = '';
        }
      }
    }
  } catch (e) { console.error('Error loading state:', e); }
  state.documents = (state.documents || []).filter(d => d.vehicleId !== 'v1');
  state.services = (state.services || []).filter(s => s.vehicleId !== 'v1');
  state.fuels = (state.fuels || []).filter(f => f.vehicleId !== 'v1');
  state.reminders = (state.reminders || []).filter(r => r.vehicleId !== 'v1');
  state.emergencyContacts = state.emergencyContacts || DEFAULT_STATE.emergencyContacts;
  return state;
}

function resetAllSwipeItems() {
  document.querySelectorAll('.swipe-content').forEach(el => {
    el.style.transform = 'translateX(0px)';
  });
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) { alert('Aviso: Memoria local llena.'); }
}

function setTodayDates() {
  const todayStr = new Date().toISOString().split('T')[0];
  if (document.getElementById('servDate')) document.getElementById('servDate').value = todayStr;
  if (document.getElementById('fuelDate')) document.getElementById('fuelDate').value = todayStr;
}

function getActiveVehicle() {
  return appState.vehicles.find(v => v.id === appState.activeVehicleId) || appState.vehicles[0];
}

function switchTab(tabId, el) {
  resetAllSwipeItems();
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.header-icon-btn').forEach(b => b.classList.remove('active'));
  
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');

  const btnRem = document.getElementById('btnHeaderReminders');
  const btnSet = document.getElementById('btnHeaderSettings');
  if (btnRem) {
    btnRem.style.display = 'flex';
    if (tabId === 'tabReminders') btnRem.classList.add('active');
    else btnRem.classList.remove('active');
  }
  if (btnSet) {
    btnSet.style.display = 'flex';
    if (tabId === 'tabSettings') btnSet.classList.add('active');
    else btnSet.classList.remove('active');
  }

  const navMap = {
    'tabGarage': 0,
    'tabMaintenance': 1,
    'tabFuel': 2,
    'tabGuantera': 3,
    'tabReports': 4
  };
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  if (navMap[tabId] !== undefined && navItems[navMap[tabId]]) {
    navItems[navMap[tabId]].classList.add('active');
  }

  if (tabId === 'tabReminders') renderRemindersTab();
  if (tabId === 'tabAI') renderAIDiagnostic();
  if (tabId === 'tabReports') renderReports();
  if (tabId === 'tabSettings') renderUserSettings();
  if (tabId === 'tabGuantera') renderGuantera();

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function selectActiveVehicle(vehId) {
  resetAllSwipeItems();
  appState.activeVehicleId = vehId;
  saveState();
  renderApp();
  renderRemindersTab();
  renderAIDiagnostic();
  renderReports();
  renderGuantera();
}

function renderVehicleSelectorPills() {
  const container = document.getElementById('vehicleSelectorPills');
  if (!container) return;

  if (!appState.vehicles || appState.vehicles.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  appState.vehicles.forEach(v => {
    const isActive = v.id === appState.activeVehicleId;
    html += `
      <button class="pill ${isActive ? 'active' : ''}" onclick="selectActiveVehicle('${v.id}')">
        ${escapeHtml(v.name)} (${escapeHtml(v.plate) || 'Sin Placa'})
      </button>
    `;
  });
  html += `<button class="pill" onclick="openVehicleModal()" style="border-style:dashed;">+ Nuevo Carro</button>`;
  container.innerHTML = html;
}

function renderApp() {
  renderVehicleSelectorPills();
  renderUserReminders();
  renderMiniVehiclesList();
  renderMaintenanceFilterPills();
  populateServCategorySelect();
  renderGuantera();
  const veh = getActiveVehicle();
  if (!veh) {
    document.getElementById('activeVehicleHero').innerHTML = `
      <div style="text-align:center; padding:20px;">
        <h3>No tienes vehículos registrados</h3>
        <p class="subtitle" style="margin-bottom:12px;">Agrega tu primer auto para comenzar</p>
        <button class="btn btn-primary" onclick="openVehicleModal()">+ Agregar Vehículo</button>
      </div>
    `;
    return;
  }

  document.getElementById('activeVehicleHero').innerHTML = `
    <div class="hero-main-info">
      <div>
        <div class="hero-title">${escapeHtml(veh.name)}</div>
        <span class="hero-plate">${escapeHtml(veh.plate) || 'SIN PLACA'} • ${escapeHtml(veh.type)} • ${veh.year}</span>
      </div>
      <div class="hero-odometer-box" onclick="openModal('modalOdometer')" style="cursor:pointer;" title="Toca para actualizar odómetro">
        <span class="hero-odometer-lbl">Odómetro ${SVG_ICONS.zap}</span>
        <span class="hero-odometer-val">${veh.km.toLocaleString()} km</span>
      </div>
    </div>
    ${veh.photo ? `<img src="${veh.photo}" class="hero-image-preview" alt="Foto Vehículo">` : ''}
  `;

  renderServiceList(veh.id);
  renderFuelList(veh.id);

  setTimeout(initSwipeListeners, 50);
}

function initSwipeListeners() {
  const items = document.querySelectorAll('.swipe-content');
  items.forEach(el => {
    if (el.dataset.swipeInit) return;
    el.dataset.swipeInit = 'true';

    let startX = 0;
    let startY = 0;
    let initialOffset = 0;
    let isSwiping = false;

    const handleStart = (e) => {
      isSwiping = true;
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const transformVal = window.getComputedStyle(el).transform;
      if (transformVal !== 'none') {
        const matrix = new WebKitCSSMatrix(transformVal);
        initialOffset = matrix.m41;
      } else {
        initialOffset = 0;
      }
      el.classList.add('swiping');
    };

    const handleMove = (e) => {
      if (!isSwiping) return;
      const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        let newX = initialOffset + diffX;
        if (newX < -90) newX = -90;
        if (newX > 0) newX = 0;
        el.style.transform = `translateX(${newX}px)`;
      }
    };

    const handleEnd = () => {
      if (!isSwiping) return;
      isSwiping = false;
      el.classList.remove('swiping');
      const transformVal = window.getComputedStyle(el).transform;
      if (transformVal !== 'none') {
        const matrix = new WebKitCSSMatrix(transformVal);
        if (matrix.m41 < -40) {
          el.style.transform = `translateX(-85px)`;
        } else {
          el.style.transform = `translateX(0px)`;
        }
      }
    };

    el.addEventListener('touchstart', handleStart, { passive: true });
    el.addEventListener('touchmove', handleMove, { passive: true });
    el.addEventListener('touchend', handleEnd);

    el.addEventListener('mousedown', handleStart);
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseup', handleEnd);
    el.addEventListener('mouseleave', handleEnd);

    el.addEventListener('click', (evt) => {
      if (isSwiping) {
        evt.stopPropagation();
        return;
      }
      const transformVal = window.getComputedStyle(el).transform;
      const matrix = new WebKitCSSMatrix(transformVal);
      if (matrix.m41 < -10) {
        evt.stopPropagation();
        el.style.transform = `translateX(0px)`;
      }
    });
  });
}

function deleteVehicleDirect(vehId) {
  appState.vehicles = appState.vehicles.filter(item => item.id !== vehId);
  appState.services = appState.services.filter(s => s.vehicleId !== vehId);
  appState.fuels = appState.fuels.filter(f => f.vehicleId !== vehId);

  if (appState.activeVehicleId === vehId) {
    appState.activeVehicleId = appState.vehicles.length > 0 ? appState.vehicles[0].id : '';
  }

  saveState();
  renderApp();
}

function openVehicleModal(vehId = null) {
  const modal = document.getElementById('modalVehicle');
  const title = document.getElementById('modalVehicleTitle');
  const form = document.getElementById('formVehicle');
  form.reset();

  if (vehId) {
    const veh = appState.vehicles.find(v => v.id === vehId);
    if (veh) {
      title.textContent = 'Editar Vehículo';
      document.getElementById('vehId').value = veh.id;
      document.getElementById('vehType').value = veh.type;
      document.getElementById('vehName').value = veh.name;
      document.getElementById('vehYear').value = veh.year;
      document.getElementById('vehPlate').value = veh.plate || '';
      document.getElementById('vehKm').value = veh.km;
    }
  } else {
    title.textContent = 'Nuevo Vehículo';
    document.getElementById('vehId').value = '';
  }
  openModal('modalVehicle');
}

function saveVehicle(e) {
  e.preventDefault();
  const id = document.getElementById('vehId').value;
  const type = document.getElementById('vehType').value;
  const name = document.getElementById('vehName').value.trim();
  const year = parseInt(document.getElementById('vehYear').value) || 2023;
  const plate = document.getElementById('vehPlate').value.trim().toUpperCase();
  const km = parseInt(document.getElementById('vehKm').value) || 0;
  const photoInput = document.getElementById('vehPhoto');

  const processSave = (photoData = '') => {
    if (id) {
      const veh = appState.vehicles.find(v => v.id === id);
      if (veh) {
        veh.type = type; veh.name = name; veh.year = year; veh.plate = plate; veh.km = km;
        if (photoData) veh.photo = photoData;
      }
    } else {
      const newVeh = {
        id: 'v_' + Date.now(),
        type, name, year, plate, km,
        photo: photoData
      };
      appState.vehicles.push(newVeh);
      appState.activeVehicleId = newVeh.id;
    }
    saveState();
    closeModal('modalVehicle');
    renderApp();
  };

  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => processSave(evt.target.result);
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    const existingVeh = appState.vehicles.find(v => v.id === id);
    processSave(existingVeh ? existingVeh.photo : '');
  }
}

function renderMiniVehiclesList() {
  const container = document.getElementById('allVehiclesList');
  if (!container) return;
  if (!appState.vehicles || appState.vehicles.length === 0) {
    container.innerHTML = `<p class="subtitle">No hay vehículos adicionales en tu garaje.</p>`;
    return;
  }

  let html = '';
  appState.vehicles.forEach(v => {
    const isActive = v.id === appState.activeVehicleId;
    html += `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteVehicleDirect('${v.id}')">
            ${SVG_ICONS.trash} <span>Borrar</span>
          </button>
        </div>
        <div class="swipe-content ${isActive ? 'vehicle-mini-item active-veh' : 'vehicle-mini-item'}">
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.95rem;">
              ${escapeHtml(v.name)} ${isActive ? '<span class="badge-subtle badge-green" style="margin-left:6px; font-size:0.68rem;">Activo</span>' : ''}
            </div>
            <div class="veh-info-sub">${escapeHtml(v.plate) || 'Sin Placa'} • ${v.year} • ${v.km.toLocaleString()} km</div>
          </div>
          <div class="veh-actions">
            <button class="btn btn-secondary btn-sm" onclick="selectActiveVehicle('${v.id}')">Seleccionar</button>
            <button class="btn btn-tertiary btn-sm" onclick="openVehicleModal('${v.id}')">${SVG_ICONS.edit}</button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateOdometer(e) {
  e.preventDefault();
  const kmVal = parseInt(document.getElementById('newOdometerKm').value);
  const veh = getActiveVehicle();
  if (veh && !isNaN(kmVal)) {
    veh.km = kmVal;
    saveState();
    closeModal('modalOdometer');
    renderApp();
    checkAndSendDueNotifications();
  }
}

function populateServCategorySelect() {
  const select = document.getElementById('servCategory');
  if (!select) return;
  select.innerHTML = SERVICE_CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function openNewCategoryModal() {
  document.getElementById('formNewCategory').reset();
  openModal('modalNewCategory');
}

function saveNewCategory(e) {
  e.preventDefault();
  const name = document.getElementById('newCatName').value.trim();
  if (name && !SERVICE_CATEGORIES.includes(name)) {
    SERVICE_CATEGORIES.push(name);
    populateServCategorySelect();
    alert(`Tipo de servicio "${name}" creado exitosamente.`);
  }
  closeModal('modalNewCategory');
}

function renderServiceList(vehicleId) {
  const container = document.getElementById('serviceLogList');
  if (!container) return;
  const list = (appState.services || []).filter(s => s.vehicleId === vehicleId);

  if (list.length === 0) {
    container.innerHTML = `<div class="text-center" style="padding:20px; color:var(--text-secondary);">No hay mantenimientos registrados para este vehículo.</div>`;
    return;
  }

  let html = '';
  list.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
    html += `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteServiceDirect('${item.id}')">
            ${SVG_ICONS.trash} <span>Borrar</span>
          </button>
        </div>
        <div class="swipe-content">
          <div class="log-item-main" style="flex:1;">
            <div class="log-icon-badge">${SVG_ICONS.wrench}</div>
            <div>
              <div class="log-title">${escapeHtml(item.title)}</div>
              <div class="log-meta">${escapeHtml(item.category)} • ${item.date} • ${item.km.toLocaleString()} km ${item.shop ? '• ' + escapeHtml(item.shop) : ''}</div>
              ${item.receipt ? `<button class="receipt-chip" onclick="viewReceipt('${item.id}')">${SVG_ICONS.document} Ver Comprobante</button>` : ''}
            </div>
          </div>
          <div class="log-cost">${formatCurrency(item.cost)}</div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function deleteServiceDirect(id) {
  appState.services = appState.services.filter(s => s.id !== id);
  saveState();
  renderApp();
}

function saveService(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) return;

  const id = document.getElementById('servId').value;
  const category = document.getElementById('servCategory').value;
  const title = document.getElementById('servTitle').value.trim();
  const cost = parseFloat(document.getElementById('servCost').value) || 0;
  const date = document.getElementById('servDate').value;
  const km = parseInt(document.getElementById('servKm').value) || veh.km;
  const shop = document.getElementById('servShop').value.trim();
  const notes = document.getElementById('servNotes').value.trim();
  const receiptInput = document.getElementById('servReceipt');

  const processSave = (receiptData = '') => {
    if (id) {
      const item = appState.services.find(s => s.id === id);
      if (item) {
        item.category = category; item.title = title; item.cost = cost;
        item.date = date; item.km = km; item.shop = shop; item.notes = notes;
        if (receiptData) item.receipt = receiptData;
      }
    } else {
      appState.services.push({
        id: 's_' + Date.now(),
        vehicleId: veh.id,
        category, title, cost, date, km, shop, notes,
        receipt: receiptData
      });
    }
    if (km > veh.km) veh.km = km;
    saveState();
    closeModal('modalService');
    renderApp();
  };

  if (receiptInput && receiptInput.files && receiptInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => processSave(evt.target.result);
    reader.readAsDataURL(receiptInput.files[0]);
  } else {
    const existing = appState.services.find(s => s.id === id);
    processSave(existing ? existing.receipt : '');
  }
}

function viewReceipt(serviceId) {
  const item = appState.services.find(s => s.id === serviceId);
  if (!item || !item.receipt) return;
  const container = document.getElementById('receiptContainer');
  container.innerHTML = `<img src="${item.receipt}" alt="Factura / Comprobante">`;
  openModal('modalReceiptViewer');
}

function renderFuelList(vehicleId) {
  const container = document.getElementById('fuelLogList');
  if (!container) return;
  const list = (appState.fuels || []).filter(f => f.vehicleId === vehicleId);

  if (list.length === 0) {
    container.innerHTML = `<div class="text-center" style="padding:20px; color:var(--text-secondary);">No hay recargas de combustible registradas.</div>`;
    return;
  }

  let html = '';
  list.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
    html += `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteFuelDirect('${item.id}')">
            ${SVG_ICONS.trash} <span>Borrar</span>
          </button>
        </div>
        <div class="swipe-content">
          <div class="log-item-main" style="flex:1;">
            <div class="log-icon-badge">${SVG_ICONS.fuel}</div>
            <div>
              <div class="log-title">${item.volume} Litros</div>
              <div class="log-meta">${item.date} • ${item.km.toLocaleString()} km ${item.notes ? '• ' + escapeHtml(item.notes) : ''}</div>
            </div>
          </div>
          <div class="log-cost">${formatCurrency(item.cost)}</div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function deleteFuelDirect(id) {
  appState.fuels = appState.fuels.filter(f => f.id !== id);
  saveState();
  renderApp();
}

function saveFuel(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) return;

  const cost = parseFloat(document.getElementById('fuelCost').value) || 0;
  const volume = parseFloat(document.getElementById('fuelVolume').value) || 0;
  const km = parseInt(document.getElementById('fuelKm').value) || veh.km;
  const date = document.getElementById('fuelDate').value;
  const notes = document.getElementById('fuelNotes').value.trim();

  appState.fuels.push({
    id: 'f_' + Date.now(),
    vehicleId: veh.id,
    cost, volume, km, date, notes
  });

  if (km > veh.km) veh.km = km;
  saveState();
  closeModal('modalFuel');
  renderApp();
}

function renderRemindersTab() {
  renderUserReminders('fullRemindersList');
}

function openReminderModal(remId = null) {
  const form = document.getElementById('formReminder');
  form.reset();
  if (remId) {
    const rem = appState.reminders.find(r => r.id === remId);
    if (rem) {
      document.getElementById('remId').value = rem.id;
      document.getElementById('remTitle').value = rem.title;
      document.getElementById('remCategory').value = rem.category || 'Mantenimiento';
      document.getElementById('remTargetKm').value = rem.targetKm || '';
      document.getElementById('remTargetDate').value = rem.targetDate || '';
      document.getElementById('remRepeat').value = rem.repeat || 'none';
      document.getElementById('remNotes').value = rem.notes || '';
    }
  } else {
    document.getElementById('remId').value = '';
  }
  openModal('modalReminder');
}

function saveReminder(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) return;

  const id = document.getElementById('remId').value;
  const title = document.getElementById('remTitle').value.trim();
  const category = document.getElementById('remCategory').value;
  const targetKm = parseInt(document.getElementById('remTargetKm').value) || null;
  const targetDate = document.getElementById('remTargetDate').value || null;
  const repeat = document.getElementById('remRepeat').value;
  const notes = document.getElementById('remNotes').value.trim();

  if (id) {
    const rem = appState.reminders.find(r => r.id === id);
    if (rem) {
      rem.title = title; rem.category = category;
      rem.targetKm = targetKm; rem.targetDate = targetDate;
      rem.repeat = repeat; rem.notes = notes;
    }
  } else {
    appState.reminders.push({
      id: 'r_' + Date.now(),
      vehicleId: veh.id,
      title, category, targetKm, targetDate, repeat, notes,
      completed: false
    });
  }

  saveState();
  closeModal('modalReminder');
  renderApp();
  renderRemindersTab();
}

function toggleReminderCompleted(remId) {
  const rem = appState.reminders.find(r => r.id === remId);
  const veh = getActiveVehicle();
  if (!rem) return;

  rem.completed = !rem.completed;

  if (rem.completed && rem.repeat && rem.repeat !== 'none' && veh) {
    let nextTargetDate = rem.targetDate;
    let nextTargetKm = rem.targetKm;

    if (rem.repeat === '1m') {
      const d = rem.targetDate ? new Date(rem.targetDate) : new Date();
      d.setMonth(d.getMonth() + 1);
      nextTargetDate = d.toISOString().split('T')[0];
    } else if (rem.repeat === '3m') {
      const d = rem.targetDate ? new Date(rem.targetDate) : new Date();
      d.setMonth(d.getMonth() + 3);
      nextTargetDate = d.toISOString().split('T')[0];
    } else if (rem.repeat === '6m') {
      const d = rem.targetDate ? new Date(rem.targetDate) : new Date();
      d.setMonth(d.getMonth() + 6);
      nextTargetDate = d.toISOString().split('T')[0];
    } else if (rem.repeat === '12m') {
      const d = rem.targetDate ? new Date(rem.targetDate) : new Date();
      d.setFullYear(d.getFullYear() + 1);
      nextTargetDate = d.toISOString().split('T')[0];
    } else if (rem.repeat === '5000km') {
      nextTargetKm = (veh.km || 0) + 5000;
    } else if (rem.repeat === '10000km') {
      nextTargetKm = (veh.km || 0) + 10000;
    }

    appState.reminders.push({
      id: 'r_' + Date.now(),
      vehicleId: veh.id,
      title: rem.title,
      category: rem.category,
      targetKm: nextTargetKm,
      targetDate: nextTargetDate,
      repeat: rem.repeat,
      notes: rem.notes,
      completed: false
    });
  }

  saveState();
  renderApp();
  renderRemindersTab();
}

function deleteReminderDirect(remId) {
  appState.reminders = appState.reminders.filter(r => r.id !== remId);
  saveState();
  renderApp();
  renderRemindersTab();
}

function renderUserReminders(targetContainerId = 'userRemindersList') {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  const veh = getActiveVehicle();
  if (!veh) {
    container.innerHTML = `<p class="subtitle" style="padding:10px;">No hay vehículo activo.</p>`;
    return;
  }

  const list = (appState.reminders || []).filter(r => r.vehicleId === veh.id);
  if (list.length === 0) {
    container.innerHTML = `
      <div class="predictive-card">
        <div>
          <div class="predictive-title">Sin recordatorios configurados</div>
          <div class="predictive-desc">Agrega alertas personalizadas para aceite, llantas o marchamo.</div>
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  list.forEach(r => {
    let statusClass = r.completed ? 'completed' : 'pending';
    let kmText = r.targetKm ? `${r.targetKm.toLocaleString()} km` : '';
    let dateText = r.targetDate ? r.targetDate : '';
    let targetStr = [kmText, dateText].filter(Boolean).join(' • ');

    html += `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteReminderDirect('${r.id}')">
            ${SVG_ICONS.trash} <span>Borrar</span>
          </button>
        </div>
        <div class="swipe-content" style="${r.completed ? 'opacity:0.6;' : ''}">
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.92rem; ${r.completed ? 'text-decoration:line-through;' : ''}">
              ${escapeHtml(r.title)}
            </div>
            <div class="veh-info-sub">${escapeHtml(r.category || 'Mantenimiento')} ${targetStr ? '• ' + targetStr : ''} ${r.repeat && r.repeat !== 'none' ? '↻ Recurrente' : ''}</div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn ${r.completed ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleReminderCompleted('${r.id}')">
              ${r.completed ? '✓ Listo' : 'Marcar Completado'}
            </button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function openDocumentModal(docId = null) {
  const form = document.getElementById('formDocument');
  form.reset();
  if (docId) {
    const doc = appState.documents.find(d => d.id === docId);
    if (doc) {
      document.getElementById('docId').value = doc.id;
      document.getElementById('docType').value = doc.type;
      document.getElementById('docTitle').value = doc.title;
      document.getElementById('docExpDate').value = doc.expDate;
      document.getElementById('docPhone').value = doc.phone || '';
      document.getElementById('docNotes').value = doc.notes || '';
    }
  } else {
    document.getElementById('docId').value = '';
  }
  openModal('modalDocument');
}

function saveDocument(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) return;

  const id = document.getElementById('docId').value;
  const type = document.getElementById('docType').value;
  const title = document.getElementById('docTitle').value.trim();
  const expDate = document.getElementById('docExpDate').value;
  const phone = document.getElementById('docPhone').value.trim();
  const notes = document.getElementById('docNotes').value.trim();
  const fileInput = document.getElementById('docFile');

  const processSave = (fileData = '') => {
    if (id) {
      const doc = appState.documents.find(d => d.id === id);
      if (doc) {
        doc.type = type; doc.title = title; doc.expDate = expDate;
        doc.phone = phone; doc.notes = notes;
        if (fileData) doc.file = fileData;
      }
    } else {
      appState.documents.push({
        id: 'd_' + Date.now(),
        vehicleId: veh.id,
        type, title, expDate, phone, notes,
        file: fileData
      });
    }
    saveState();
    closeModal('modalDocument');
    renderGuantera();
  };

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => processSave(evt.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    const existing = appState.documents.find(d => d.id === id);
    processSave(existing ? existing.file : '');
  }
}

function renderGuantera() {
  const docContainer = document.getElementById('documentsList');
  const contactsContainer = document.getElementById('emergencyContactsList');
  const veh = getActiveVehicle();

  if (contactsContainer) {
    let cHtml = '';
    (appState.emergencyContacts || []).forEach(c => {
      cHtml += `
        <div class="settings-row" style="padding:6px 0;">
          <div>
            <strong style="color:#ffffff;">${escapeHtml(c.name)}</strong>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(c.category || 'Contacto')}</div>
          </div>
          <a href="tel:${escapeHtml(c.phone)}" class="btn btn-secondary btn-sm" style="color:#30d158; border-color:rgba(48,209,88,0.3);">
            📞 ${escapeHtml(c.phone)}
          </a>
        </div>
      `;
    });
    contactsContainer.innerHTML = cHtml;
  }

  if (!docContainer) return;
  if (!veh) {
    docContainer.innerHTML = `<p class="subtitle">No hay vehículo activo.</p>`;
    return;
  }

  const docs = (appState.documents || []).filter(d => d.vehicleId === veh.id);
  if (docs.length === 0) {
    docContainer.innerHTML = `<div class="text-center" style="padding:20px; color:var(--text-secondary);">No hay documentos registrados para este vehículo.</div>`;
    return;
  }

  let html = '';
  docs.forEach(doc => {
    html += `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteDocumentDirect('${doc.id}')">
            ${SVG_ICONS.trash} <span>Borrar</span>
          </button>
        </div>
        <div class="swipe-content">
          <div class="log-item-main" style="flex:1;">
            <div class="log-icon-badge">${SVG_ICONS.document}</div>
            <div>
              <div class="log-title">${escapeHtml(doc.title)}</div>
              <div class="log-meta">${escapeHtml(doc.type)} • Vence: ${doc.expDate} ${doc.phone ? '• ' + escapeHtml(doc.phone) : ''}</div>
            </div>
          </div>
          <div class="veh-actions">
            <button class="btn btn-tertiary btn-sm" onclick="openDocumentModal('${doc.id}')">${SVG_ICONS.edit}</button>
          </div>
        </div>
      </div>
    `;
  });
  docContainer.innerHTML = html;
}

function deleteDocumentDirect(id) {
  appState.documents = appState.documents.filter(d => d.id !== id);
  saveState();
  renderGuantera();
}

function openContactModal() {
  document.getElementById('formContact').reset();
  openModal('modalContact');
}

function saveEmergencyContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const category = document.getElementById('contactCategory').value;

  if (name && phone) {
    appState.emergencyContacts.push({
      id: 'c_' + Date.now(),
      name, phone, category
    });
    saveState();
    renderGuantera();
  }
  closeModal('modalContact');
}

function renderReports() {
  const veh = getActiveVehicle();
  if (!veh) return;

  const services = (appState.services || []).filter(s => s.vehicleId === veh.id);
  const fuels = (appState.fuels || []).filter(f => f.vehicleId === veh.id);

  const totalServ = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const totalFuel = fuels.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  if (document.getElementById('totalServiceSpend')) {
    document.getElementById('totalServiceSpend').textContent = formatCurrency(totalServ);
  }
  if (document.getElementById('totalFuelSpend')) {
    document.getElementById('totalFuelSpend').textContent = formatCurrency(totalFuel);
  }

  const catBreakdown = {};
  services.forEach(s => {
    catBreakdown[s.category] = (catBreakdown[s.category] || 0) + (s.cost || 0);
  });

  const catContainer = document.getElementById('reportsCategoryBreakdown');
  if (catContainer) {
    let html = '';
    const keys = Object.keys(catBreakdown);
    if (keys.length === 0) {
      html = `<p class="subtitle">Sin gastos de mantenimiento registrados.</p>`;
    } else {
      keys.forEach(cat => {
        html += `
          <div class="settings-row">
            <span>${escapeHtml(cat)}</span>
            <strong>${formatCurrency(catBreakdown[cat])}</strong>
          </div>
        `;
      });
    }
    catContainer.innerHTML = html;
  }
}

function generateCertifiedReport() {
  const veh = getActiveVehicle();
  if (!veh) {
    alert('Selecciona un vehículo primero.');
    return;
  }
  const services = (appState.services || []).filter(s => s.vehicleId === veh.id);
  const container = document.getElementById('certifiedDocumentContent');
  if (!container) return;

  let html = `
    <div class="cert-header">
      <div>
        <h2 style="margin:0; font-size:1.4rem;">EXPEDIENTE TÉCNICO DE VEHÍCULO</h2>
        <p style="margin:4px 0 0 0; font-size:0.85rem; color:#64748b;">Reporte Certificado de Mantenimientos y Reparaciones</p>
      </div>
      <div style="text-align:right;">
        <strong style="font-size:1.1rem; color:#0f172a;">${escapeHtml(veh.name)}</strong>
        <div style="font-size:0.85rem; color:#64748b;">Placa: ${escapeHtml(veh.plate) || 'N/A'} • Odómetro: ${veh.km.toLocaleString()} km</div>
      </div>
    </div>
    <table class="cert-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Kilometraje</th>
          <th>Categoría / Servicio</th>
          <th>Título / Descripción</th>
          <th>Taller / Proveedor</th>
          <th>Costo</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (services.length === 0) {
    html += `<tr><td colspan="6" style="text-align:center; padding:12px;">Sin registros de mantenimiento.</td></tr>`;
  } else {
    services.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(s => {
      html += `
        <tr>
          <td>${s.date}</td>
          <td>${s.km.toLocaleString()} km</td>
          <td>${escapeHtml(s.category)}</td>
          <td>${escapeHtml(s.title)}</td>
          <td>${escapeHtml(s.shop || 'N/A')}</td>
          <td>${formatCurrency(s.cost)}</td>
        </tr>
      `;
    });
  }

  html += `
      </tbody>
    </table>
  `;
  container.innerHTML = html;
  openModal('modalCertifiedReport');
}

function renderUserSettings() {
  const nameEl = document.getElementById('userProfileName');
  const emailEl = document.getElementById('userProfileEmail');
  const currEl = document.getElementById('settingCurrency');

  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
  }
  if (currEl) currEl.value = appState.currency || 'CRC';
}

function changeCurrencySetting(val) {
  appState.currency = val;
  saveState();
  renderApp();
  renderReports();
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `GarageOne_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported && typeof imported === 'object') {
        appState = { ...appState, ...imported };
        saveState();
        renderApp();
        alert('Datos importados con éxito.');
      }
    } catch (err) { alert('Error al leer archivo JSON.'); }
  };
  reader.readAsText(file);
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function checkAndSendDueNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const veh = getActiveVehicle();
  if (!veh) return;

  const due = (appState.reminders || []).filter(r => r.vehicleId === veh.id && !r.completed);
  due.forEach(r => {
    if (r.targetKm && veh.km >= r.targetKm) {
      new Notification('GarageOne Recordatorio', {
        body: `Atención: ${r.title} para ${veh.name} alcanzó los ${r.targetKm.toLocaleString()} km.`,
        icon: 'icons/apple-touch-icon.png'
      });
    }
  });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function renderAIDiagnostic() {
  const card = document.getElementById('aiDiagnosticCard');
  if (!card) return;
  const veh = getActiveVehicle();
  if (!veh) {
    card.innerHTML = `<p class="subtitle">Agrega un vehículo para el diagnóstico inteligente.</p>`;
    return;
  }
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0;">Diagnóstico Preventivo IA</h3>
        <p class="subtitle" style="margin:2px 0 0 0;">Análisis para ${escapeHtml(veh.name)} (${veh.km.toLocaleString()} km)</p>
      </div>
      <span class="badge-subtle badge-green">Sistema Óptimo</span>
    </div>
  `;
}

function askQuickPrompt(question) {
  const input = document.getElementById('aiUserQuestion');
  if (input) {
    input.value = question;
    document.getElementById('formAIChat').dispatchEvent(new Event('submit'));
  }
}

function askAIAssistant(e) {
  e.preventDefault();
  const input = document.getElementById('aiUserQuestion');
  const responseBox = document.getElementById('aiChatResponse');
  const question = input.value.trim();
  if (!question) return;

  responseBox.style.display = 'block';
  responseBox.innerHTML = `<p class="subtitle">Consultando al Ingeniero Mecánico GarageOne...</p>`;

  setTimeout(() => {
    responseBox.innerHTML = `
      <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">Respuesta del Especialista:</div>
      <p style="margin:0; line-height:1.5; font-size:0.9rem;">
        Para "${escapeHtml(question)}": Se recomienda realizar una inspección visual directa del componente y revisar el nivel de fluidos. Si el síntoma persiste, consulta con un mecánico certificado.
      </p>
    `;
  }, 800);
}
