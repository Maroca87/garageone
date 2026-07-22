/* ==========================================================================
   AutoCare - Core Logic (v14: Bi-Directional Seamless iOS Swipe Physics)
   ========================================================================== */

const STORAGE_KEY = 'AUTOCARE_DATA_V14';
const USER_KEY = 'AUTOCARE_USER_V14';

// Security: Helper to escape user HTML inputs
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SVG Vector Icons Collection
const SVG_ICONS = {
  car: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h2m8 0h2"/></svg>`,
  oil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m14 10-2 2-2-2"/><path d="M5 18a7 7 0 1 0 14 0 7 7 0 0 0-14 0z"/></svg>`,
  brakes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6m-9-9h6m6 0h6"/></svg>`,
  tires: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5m0 8v5m-9-9h5m8 0h5"/></svg>`,
  filters: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>`,
  spark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  battery: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="12" rx="2"/><line x1="22" y1="11" x2="22" y2="15"/><line x1="6" y1="13" x2="10" y2="13"/><line x1="14" y1="13" x2="14" y2="13"/></svg>`,
  transmission: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  belt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
  document: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  fuel: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 11h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"/><path d="M3 22h12"/><path d="M7 9h4"/></svg>`,
  wrench: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  zap: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  alertTriangle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 1 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
};

const SERVICE_CATEGORIES = ['Aceite', 'Frenos', 'Llantas', 'Filtros', 'Bujías', 'Batería', 'Transmisión', 'Correa', 'Trámite', 'Otro'];

// Default Seed Data
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

// Currency Formatter
function formatCurrency(amount) {
  const curr = appState.currency || 'CRC';
  if (curr === 'CRC') return '₡' + Math.round(amount).toLocaleString('es-CR');
  if (curr === 'USD') return '$' + amount.toFixed(2);
  if (curr === 'EUR') return '€' + amount.toFixed(2);
  return '₡' + Math.round(amount).toLocaleString('es-CR');
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  setTodayDates();
  await initAsyncStorage();

  // Close modals when clicking dark backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // Reset slid-open swipe items on document click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.swipe-container')) {
      resetAllSwipeItems();
    }
  });

  // Close active modal on Escape key
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

  const username = currentUser ? (currentUser.username || currentUser.name || '') : '';
  if (authTitle) authTitle.textContent = username ? `Hola, ${escapeHtml(username)}` : 'Bienvenido a GarageOne';
  
  if (currentUser && currentUser.pinEnabled && currentUser.pin) {
    if (authSubtitle) authSubtitle.textContent = 'Ingresa tu contraseña o PIN para desbloquear';
  } else {
    if (authSubtitle) authSubtitle.textContent = 'Ingresa tu contraseña para acceder';
  }
}

function showRegisterForm() {
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');

  if (formLogin) formLogin.style.display = 'none';
  if (formRegister) formRegister.style.display = 'block';
  if (authTitle) authTitle.textContent = 'GarageOne';
  if (authSubtitle) authSubtitle.textContent = 'Crea tu usuario y contraseña de acceso';
}

function checkAuth() {
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('appShell');

  if (!currentUser) {
    isAuthenticated = false;
    showRegisterForm();
  }

  if (isAuthenticated) {
    if (authScreen) authScreen.style.display = 'none';
    if (appShell) appShell.style.display = 'block';
    try {
      renderApp();
      renderUserSettings();
    } catch (err) {
      console.error('Error al renderizar la app:', err);
    }
  } else {
    if (authScreen) authScreen.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';
    if (currentUser) {
      showLoginForm();
    } else {
      showRegisterForm();
    }
  }
}

function handleRegister(e) {
  e.preventDefault();

  const userInput = document.getElementById('regUser');
  const passInput = document.getElementById('regPassword');
  const confirmPassInput = document.getElementById('regConfirmPassword');

  const userError = document.getElementById('userError');
  const passError = document.getElementById('passError');
  const confirmPassError = document.getElementById('confirmPassError');

  if (userError) userError.style.display = 'none';
  if (passError) passError.style.display = 'none';
  if (confirmPassError) confirmPassError.style.display = 'none';

  let hasError = false;

  const username = userInput ? userInput.value.trim() : '';
  const password = passInput ? passInput.value.trim() : '';
  const confirmPassword = confirmPassInput ? confirmPassInput.value.trim() : '';

  if (!username || username.length < 3) {
    if (userError) {
      userError.textContent = 'El usuario debe tener al menos 3 caracteres.';
      userError.style.display = 'block';
    }
    hasError = true;
  }

  if (!password || password.length < 4) {
    if (passError) {
      passError.textContent = 'La contraseña debe tener al menos 4 caracteres.';
      passError.style.display = 'block';
    }
    hasError = true;
  }

  if (password !== confirmPassword) {
    if (confirmPassError) {
      confirmPassError.textContent = 'Las contraseñas no coinciden.';
      confirmPassError.style.display = 'block';
    }
    hasError = true;
  }

  if (hasError) return;

  saveUser({
    username: username,
    name: username,
    password: password,
    pinEnabled: false,
    pin: '',
    faceIdEnabled: false
  });

  isAuthenticated = true;
  checkAuth();
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById('loginPin');
  const loginError = document.getElementById('loginError');
  if (loginError) loginError.style.display = 'none';

  if (Date.now() < lockoutUntil) {
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
    if (loginError) {
      loginError.textContent = `Demasiados intentos fallidos. Intenta de nuevo en ${remaining}s.`;
      loginError.style.display = 'block';
    }
    return;
  }

  const inputVal = pinInput ? String(pinInput.value).trim() : '';

  if (currentUser) {
    const isPassCorrect = currentUser.password && (inputVal === currentUser.password);
    const isPinCorrect = currentUser.pinEnabled && currentUser.pin && (inputVal === currentUser.pin);

    if (!isPassCorrect && !isPinCorrect) {
      failedLoginAttempts++;
      if (failedLoginAttempts >= 5) {
        lockoutUntil = Date.now() + 30000;
        failedLoginAttempts = 0;
        if (loginError) {
          loginError.textContent = 'Demasiados intentos fallidos. Acceso bloqueado por 30 segundos.';
          loginError.style.display = 'block';
        }
      } else {
        if (loginError) {
          loginError.textContent = currentUser.pinEnabled
            ? `Contraseña o PIN incorrecto (${5 - failedLoginAttempts} intentos restantes).`
            : `Contraseña incorrecta (${5 - failedLoginAttempts} intentos restantes).`;
          loginError.style.display = 'block';
        }
      }
      return;
    }
  }

  isAuthenticated = true;
  failedLoginAttempts = 0;
  lockoutUntil = 0;
  if (pinInput) pinInput.value = '';
  checkAuth();
}

function resetUserPin(e) {
  if (e) e.preventDefault();
  if (confirm('¿Deseas restablecer las credenciales y crear un usuario nuevo?')) {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    isAuthenticated = false;
    showRegisterForm();
  }
}

function togglePinOption(enabled) {
  const container = document.getElementById('pinSetupContainer');
  const statusEl = document.getElementById('settingPinStatus');
  if (statusEl) statusEl.style.display = 'none';

  if (!currentUser) return;

  if (enabled) {
    if (container) container.style.display = 'block';
  } else {
    currentUser.pinEnabled = false;
    currentUser.pin = '';
    saveUser(currentUser);
    if (container) container.style.display = 'none';
    renderUserSettings();
  }
}

function saveNewPin() {
  const pinInput = document.getElementById('settingPinInput');
  const statusEl = document.getElementById('settingPinStatus');
  const pinVal = pinInput ? pinInput.value.trim() : '';

  if (!pinVal || pinVal.length < 4 || isNaN(pinVal)) {
    if (statusEl) {
      statusEl.style.color = '#ff453a';
      statusEl.textContent = 'El PIN debe ser un número de 4 a 6 dígitos.';
      statusEl.style.display = 'block';
    }
    return;
  }

  if (currentUser) {
    currentUser.pinEnabled = true;
    currentUser.pin = String(pinVal);
    saveUser(currentUser);
    if (statusEl) {
      statusEl.style.color = '#30d158';
      statusEl.textContent = '¡PIN guardado y activado exitosamente!';
      statusEl.style.display = 'block';
    }
    if (pinInput) pinInput.value = '';
    renderUserSettings();
  }
}

function handleLogout() {
  isAuthenticated = false;
  checkAuth();
}

// State Management
function sanitizeState(parsed) {
  let state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...parsed };
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
  state.documents = (state.documents || []).filter(d => d.vehicleId !== 'v1');
  state.services = (state.services || []).filter(s => s.vehicleId !== 'v1');
  state.fuels = (state.fuels || []).filter(f => f.vehicleId !== 'v1');
  state.reminders = (state.reminders || []).filter(r => r.vehicleId !== 'v1');
  state.emergencyContacts = state.emergencyContacts || DEFAULT_STATE.emergencyContacts;
  return state;
}

function loadState() {
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = sanitizeState(parsed);
    }
  } catch (e) { console.error('Error loading state:', e); }
  return sanitizeState(state);
}

function resetAllSwipeItems() {
  document.querySelectorAll('.swipe-content').forEach(el => {
    el.style.transform = 'translateX(0px)';
  });
}

// High-Capacity Storage Engine (IndexedDB + LocalStorage 50MB Expansion)
const IDB_NAME = 'GarageOneDB';
const IDB_STORE = 'appStateStore';

function openIDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

function loadStateFromIDB() {
  return new Promise((resolve) => {
    openIDB().then(db => {
      if (!db) return resolve(null);
      try {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get('appState');
        req.onsuccess = (e) => resolve(e.target.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    }).catch(() => resolve(null));
  });
}

async function initAsyncStorage() {
  try {
    const idbState = await loadStateFromIDB();
    if (idbState) {
      const localRaw = localStorage.getItem(STORAGE_KEY) || '';
      const idbRaw = JSON.stringify(idbState);
      if (idbRaw.length >= localRaw.length && idbState.vehicles) {
        appState = sanitizeState(idbState);
        renderApp();
        renderStorageStats();
      }
    }
  } catch (e) {
    console.warn('Error loading IndexedDB state on startup:', e);
  }
}

async function saveStateToIDB(data) {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(data, 'appState');
  } catch (e) {
    console.log('IndexedDB save fallback:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn('LocalStorage limit reached, saving to IndexedDB high-capacity store...', e);
  }
  saveStateToIDB(appState);
  renderStorageStats();
}

function getStorageUsage() {
  try {
    const raw = JSON.stringify(appState);
    const bytes = new Blob([raw]).size;
    const kb = (bytes / 1024).toFixed(1);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const maxMb = 50;
    const percent = Math.min(100, Math.round((bytes / (maxMb * 1024 * 1024)) * 100));
    return { bytes, kb, mb, percent, maxMb };
  } catch (e) {
    return { bytes: 0, kb: '0', mb: '0', percent: 0, maxMb: 50 };
  }
}

function renderStorageStats() {
  const container = document.getElementById('storageUsageContainer');
  if (!container) return;

  const usage = getStorageUsage();
  let barColor = '#38bdf8';
  if (usage.percent > 70) barColor = '#ffd60a';
  if (usage.percent > 90) barColor = '#ff453a';

  const totalPhotos = (appState.services || []).filter(s => s.receipt).length +
                     (appState.documents || []).filter(d => d.file).length +
                     (appState.vehicles || []).filter(v => v.photo).length;

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:6px;">
      <span>Espacio Ocupado: <strong>${usage.mb} MB</strong> (${usage.kb} KB)</span>
      <span style="font-weight:700; color:${barColor};">${usage.percent}% de 50MB Ampliado</span>
    </div>
    <div style="width:100%; height:10px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(255,255,255,0.05);">
      <div style="width:${Math.max(1, usage.percent)}%; height:100%; background:${barColor}; border-radius:5px; transition:width 0.3s ease; box-shadow:0 0 10px ${barColor}66;"></div>
    </div>
    <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:#30d158; margin-bottom:6px;">
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#30d158; box-shadow:0 0 8px #30d158;"></span>
      <strong>Almacenamiento IndexedDB (50MB+ Ampliado): Activo y Sincronizado</strong>
    </div>
    <div style="font-size:0.78rem; color:#cbd5e1; line-height:1.4;">
      • ${appState.vehicles ? appState.vehicles.length : 0} vehículo(s) • ${appState.services ? appState.services.length : 0} servicio(s) • ${totalPhotos} archivo(s)/foto(s) respaldados.
    </div>
  `;
}

function optimizeStorageImages() {
  let count = 0;

  const compressDataUrl = (dataUrl, maxDim = 500, quality = 0.5, callback) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return callback(dataUrl);
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w <= maxDim && h <= maxDim && dataUrl.length < 40000) return callback(dataUrl);

      if (w > h && w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else if (h > maxDim) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      count++;
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  };

  let tasks = [];
  (appState.services || []).forEach(s => {
    if (s.receipt && s.receipt.length > 40000) {
      tasks.push(cb => compressDataUrl(s.receipt, 500, 0.5, res => { s.receipt = res; cb(); }));
    }
  });

  (appState.documents || []).forEach(d => {
    if (d.file && d.file.length > 40000) {
      tasks.push(cb => compressDataUrl(d.file, 500, 0.5, res => { d.file = res; cb(); }));
    }
  });

  (appState.vehicles || []).forEach(v => {
    if (v.photo && v.photo.length > 40000) {
      tasks.push(cb => compressDataUrl(v.photo, 500, 0.5, res => { v.photo = res; cb(); }));
    }
  });

  if (tasks.length === 0) {
    alert('¡Tus datos e imágenes ya están 100% optimizados!');
    renderStorageStats();
    return;
  }

  let completed = 0;
  tasks.forEach(fn => {
    fn(() => {
      completed++;
      if (completed === tasks.length) {
        saveState();
        renderStorageStats();
        alert(`¡Optimización finalizada! Se comprimieron ${count} imagen(es) liberando memoria para uso en producción.`);
      }
    });
  });
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

  let html = appState.vehicles.map(v => {
    const isActive = v.id === appState.activeVehicleId;
    return `<button class="pill ${isActive ? 'active' : ''}" onclick="selectActiveVehicle('${v.id}')">${escapeHtml(v.name)} ${v.plate ? `(${escapeHtml(v.plate)})` : ''}</button>`;
  }).join('');

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

// Bi-Directional Seamless iOS Swipe Physics Engine
function initSwipeListeners() {
  const items = document.querySelectorAll('.swipe-content');
  items.forEach(el => {
    if (el.dataset.swipeInit) return;
    el.dataset.swipeInit = 'true';

    let startX = 0;
    let startY = 0;
    let initialOffset = 0;
    let isSwiping = false;
    let isPressed = false;
    let currentX = 0;

    const getCoords = (e) => {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const handleStart = (e) => {
      const coords = getCoords(e);
      startX = coords.x;
      startY = coords.y;
      isPressed = true;
      isSwiping = false;
      const transformVal = window.getComputedStyle(el).transform;
      if (transformVal !== 'none') {
        const matrix = new WebKitCSSMatrix(transformVal);
        initialOffset = matrix.m41 || 0;
      } else {
        initialOffset = 0;
      }
    };

    const handleMove = (e) => {
      if (!isPressed) return;
      const coords = getCoords(e);
      const deltaX = coords.x - startX;
      const deltaY = coords.y - startY;

      if (!isSwiping) {
        if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
          isSwiping = true;
          el.classList.add('swiping');
        } else {
          return;
        }
      }

      let newX = initialOffset + deltaX;
      if (newX > 0) newX = 0;
      if (newX < -90) newX = -90;

      currentX = newX;
      el.style.transform = `translateX(${newX}px)`;
    };

    const handleEnd = () => {
      if (!isPressed) return;
      isPressed = false;

      if (isSwiping) {
        el.classList.remove('swiping');
        if (currentX < -40) {
          el.style.transform = `translateX(-80px)`;
        } else {
          el.style.transform = `translateX(0px)`;
        }
      }
    };

    el.addEventListener('touchstart', handleStart, { passive: true });
    el.addEventListener('touchmove', handleMove, { passive: true });
    el.addEventListener('touchend', handleEnd, { passive: true });

    el.addEventListener('mousedown', handleStart);
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseup', handleEnd);
    el.addEventListener('mouseleave', handleEnd);

    // Auto-close when clicking on the open item body
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

// Direct Deletion Functions
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

function deleteServiceDirect(servId) {
  appState.services = appState.services.filter(s => s.id !== servId);
  saveState();
  renderApp();
}

function deleteFuelDirect(fuelId) {
  appState.fuels = appState.fuels.filter(f => f.id !== fuelId);
  saveState();
  renderApp();
}

// User Configured Reminders Engine (100% User-Managed)
let currentReminderFilter = 'all';

function filterReminders(filterType, el) {
  currentReminderFilter = filterType;
  document.querySelectorAll('#reminderFilterPills .pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRemindersTab();
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Tu navegador o dispositivo no soporta notificaciones de sistema.');
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      alert('¡Notificaciones activadas con éxito! GarageOne te avisará de tus recordatorios pendientes.');
      checkAndSendDueNotifications();
    } else {
      alert('Permiso de notificaciones no concedido.');
    }
  });
}

function checkAndSendDueNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const veh = getActiveVehicle();
  if (!veh) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const reminders = (appState.reminders || []).filter(r => !r.completed && (!r.vehicleId || r.vehicleId === veh.id));

  reminders.forEach(r => {
    let isDue = false;
    if (r.targetKm && veh.km >= r.targetKm) isDue = true;
    if (r.targetDate && r.targetDate <= todayStr) isDue = true;

    if (isDue) {
      new Notification(`GarageOne - ${veh.name}`, {
        body: `Recordatorio Pendiente: ${r.title}`,
        icon: 'icons/icon-192.png'
      });
    }
  });
}

function renderRemindersListHelper(remindersList, veh) {
  if (!remindersList || remindersList.length === 0) {
    return `
      <div class="user-reminder-card" style="justify-content:center; text-align:center;">
        <span class="subtitle">No hay recordatorios registrados.<br>Toca "+ Recordatorio" para agregar uno.</span>
      </div>
    `;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const repeatLabelsMap = { '1m': 'Cada 1 mes', '3m': 'Cada 3 meses', '6m': 'Cada 6 meses', '12m': 'Cada 1 año', '5000km': 'Cada 5.000 KM', '10000km': 'Cada 10.000 KM' };

  return remindersList.map(r => {
    let statusBadge = '';
    let isUrgent = false;
    let isUpcoming = false;
    let detailsText = [];

    if (r.targetKm) {
      const remainingKm = r.targetKm - veh.km;
      if (remainingKm <= 0) {
        isUrgent = true;
        detailsText.push(`Excedido por ${Math.abs(remainingKm).toLocaleString()} km (Meta: ${r.targetKm.toLocaleString()} km)`);
      } else if (remainingKm <= 2000) {
        isUpcoming = true;
        detailsText.push(`Próximo: faltan ${remainingKm.toLocaleString()} km (Meta: ${r.targetKm.toLocaleString()} km)`);
      } else {
        detailsText.push(`Meta KM: ${r.targetKm.toLocaleString()} km (${remainingKm.toLocaleString()} km restantes)`);
      }
    }

    if (r.targetDate) {
      const diffDays = Math.ceil((new Date(r.targetDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        isUrgent = true;
        detailsText.push(`Vencido el ${r.targetDate} (${Math.abs(diffDays)}d atrás)`);
      } else if (diffDays <= 30) {
        isUpcoming = true;
        detailsText.push(`Vence el ${r.targetDate} (en ${diffDays}d)`);
      } else {
        detailsText.push(`Meta Fecha: ${r.targetDate}`);
      }
    }

    const repeatText = (r.repeat && r.repeat !== 'none') ? ` • 🔄 ${repeatLabelsMap[r.repeat] || r.repeat}` : '';

    if (r.completed) {
      statusBadge = '<span class="badge-subtle badge-green">Completado ✓</span>';
    } else if (isUrgent) {
      statusBadge = '<span class="badge-subtle badge-red">Atención Pendiente</span>';
    } else if (isUpcoming) {
      statusBadge = '<span class="badge-subtle badge-yellow">Próximo</span>';
    } else {
      statusBadge = '<span class="badge-subtle badge-blue">Al día</span>';
    }

    const cardClass = r.completed ? '' : isUrgent ? 'urgent' : isUpcoming ? 'upcoming' : '';

    return `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteReminderDirect('${r.id}')">
            ${SVG_ICONS.trash}
            <span>${t('deleteBtn', 'Eliminar')}</span>
          </button>
        </div>
        <div class="swipe-content user-reminder-card ${cardClass}" onclick="openReminderModal('${r.id}')">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="reminder-title" style="${r.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${escapeHtml(r.title)}</span>
              ${statusBadge}
            </div>
            <div class="reminder-meta">${escapeHtml(detailsText.join(' • ')) || 'Configurado por usuario'}${repeatText}</div>
            ${r.notes ? `<div class="reminder-meta" style="font-style:italic;">${escapeHtml(r.notes)}</div>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" onclick="toggleReminderComplete('${r.id}')" style="padding:4px 8px;" title="Marcar como completado">
              ${r.completed ? 'Desmarcar' : '✓ Listo'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderUserReminders() {
  const container = document.getElementById('userRemindersList');
  if (!container) return;
  const veh = getActiveVehicle();
  if (!veh) { container.innerHTML = ''; return; }

  const reminders = (appState.reminders || []).filter(r => !r.vehicleId || r.vehicleId === veh.id);
  container.innerHTML = renderRemindersListHelper(reminders, veh);
}

function renderRemindersTab() {
  const container = document.getElementById('fullRemindersList');
  if (!container) return;
  const veh = getActiveVehicle();
  if (!veh) { container.innerHTML = '<p class="subtitle" style="text-align:center; padding:20px;">No hay vehículo activo.</p>'; return; }

  let list = (appState.reminders || []).filter(r => !r.vehicleId || r.vehicleId === veh.id);

  if (currentReminderFilter === 'pending') {
    list = list.filter(r => !r.completed);
  } else if (currentReminderFilter === 'completed') {
    list = list.filter(r => r.completed);
  }

  container.innerHTML = renderRemindersListHelper(list, veh);
}

function openReminderModal(remId = null) {
  const form = document.getElementById('formReminder');
  if (form) form.reset();
  document.getElementById('remId').value = '';
  document.getElementById('modalReminderTitle').textContent = 'Nuevo Recordatorio';

  if (remId) {
    const r = (appState.reminders || []).find(item => item.id === remId);
    if (r) {
      document.getElementById('modalReminderTitle').textContent = 'Editar Recordatorio';
      document.getElementById('remId').value = r.id;
      document.getElementById('remTitle').value = r.title;
      document.getElementById('remCategory').value = r.category || 'Mantenimiento';
      document.getElementById('remTargetKm').value = r.targetKm || '';
      document.getElementById('remTargetDate').value = r.targetDate || '';
      if (document.getElementById('remRepeat')) document.getElementById('remRepeat').value = r.repeat || 'none';
      document.getElementById('remNotes').value = r.notes || '';
    }
  }

  openModal('modalReminder');
}

function saveReminder(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) { alert('Primero debes registrar un vehículo.'); return; }

  const remId = document.getElementById('remId').value;
  const title = document.getElementById('remTitle').value.trim();
  const category = document.getElementById('remCategory').value;
  const targetKmVal = document.getElementById('remTargetKm').value;
  const targetDate = document.getElementById('remTargetDate').value;
  const repeat = document.getElementById('remRepeat') ? document.getElementById('remRepeat').value : 'none';
  const notes = document.getElementById('remNotes').value.trim();

  const targetKm = targetKmVal ? parseInt(targetKmVal) : null;

  if (!title) return;

  if (remId) {
    const existing = (appState.reminders || []).find(r => r.id === remId);
    if (existing) {
      existing.title = title;
      existing.category = category;
      existing.targetKm = targetKm;
      existing.targetDate = targetDate;
      existing.repeat = repeat;
      existing.notes = notes;
    }
  } else {
    const newRem = {
      id: 'rem_' + Date.now(),
      vehicleId: veh.id,
      title, category, targetKm, targetDate, repeat, notes, completed: false
    };
    appState.reminders = appState.reminders || [];
    appState.reminders.push(newRem);
  }

  saveState();
  closeModal('modalReminder');
  document.getElementById('formReminder').reset();
  renderUserReminders();
  renderRemindersTab();
}

function toggleReminderComplete(remId) {
  const rem = (appState.reminders || []).find(r => r.id === remId);
  if (rem) {
    rem.completed = !rem.completed;

    // Recurrence logic: if marked completed and repeat is set, spawn next reminder
    if (rem.completed && rem.repeat && rem.repeat !== 'none') {
      const nextRem = {
        id: 'rem_' + Date.now(),
        vehicleId: rem.vehicleId,
        title: rem.title,
        category: rem.category,
        targetKm: rem.targetKm,
        targetDate: rem.targetDate,
        repeat: rem.repeat,
        notes: rem.notes,
        completed: false
      };

      if (rem.repeat === '5000km' && rem.targetKm) {
        nextRem.targetKm = rem.targetKm + 5000;
      } else if (rem.repeat === '10000km' && rem.targetKm) {
        nextRem.targetKm = rem.targetKm + 10000;
      } else if (rem.targetDate) {
        const d = new Date(rem.targetDate);
        if (rem.repeat === '1m') d.setMonth(d.getMonth() + 1);
        else if (rem.repeat === '3m') d.setMonth(d.getMonth() + 3);
        else if (rem.repeat === '6m') d.setMonth(d.getMonth() + 6);
        else if (rem.repeat === '12m') d.setFullYear(d.getFullYear() + 1);
        nextRem.targetDate = d.toISOString().split('T')[0];
      }

      appState.reminders.push(nextRem);
    }

    saveState();
    renderUserReminders();
    renderRemindersTab();
  }
}

function deleteReminderDirect(remId) {
  appState.reminders = (appState.reminders || []).filter(r => r.id !== remId);
  saveState();
  renderUserReminders();
  renderRemindersTab();
}

// Emergency Contacts & Important Phone Numbers Engine
function renderEmergencyContacts() {
  const container = document.getElementById('emergencyContactsList');
  if (!container) return;

  const contacts = appState.emergencyContacts || [];
  if (contacts.length === 0) {
    container.innerHTML = `<p class="subtitle" style="text-align:center; color:rgba(255,255,255,0.7); width:100%; grid-column: 1 / -1;">No hay números guardados.<br>Toca "+ Guardar Número" para registrar tus talleres, grúa o seguro.</p>`;
    return;
  }

  container.innerHTML = contacts.map(c => `
    <div class="swipe-container">
      <div class="swipe-action-bg">
        <button class="swipe-action-btn" onclick="deleteEmergencyContactDirect('${c.id}')">
          ${SVG_ICONS.trash}
          <span>${t('deleteBtn', 'Eliminar')}</span>
        </button>
      </div>
      <div class="swipe-content contact-card-item" onclick="openContactModal('${c.id}')">
        <div class="contact-info">
          <span class="contact-name">${escapeHtml(c.name)}</span>
          <span class="contact-sub">${escapeHtml(c.category)} • ${escapeHtml(c.phone)}</span>
          ${c.notes ? `<span class="contact-sub" style="font-style:italic;">${escapeHtml(c.notes)}</span>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation()">
          <button class="btn-call-direct" onclick="callContact('${escapeHtml(c.phone)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${t('callBtn', 'Llamar')}</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(initSwipeListeners, 50);
}

function openContactModal(contactId = null) {
  const form = document.getElementById('formContact');
  if (form) form.reset();
  document.getElementById('contactId').value = '';
  document.getElementById('modalContactTitle').textContent = 'Nuevo Contacto Importante';

  if (contactId) {
    const c = (appState.emergencyContacts || []).find(item => item.id === contactId);
    if (c) {
      document.getElementById('modalContactTitle').textContent = 'Editar Contacto';
      document.getElementById('contactId').value = c.id;
      document.getElementById('contactName').value = c.name;
      document.getElementById('contactPhone').value = c.phone;
      document.getElementById('contactCategory').value = c.category || 'Auxilio';
      if (document.getElementById('contactNotes')) document.getElementById('contactNotes').value = c.notes || '';
    }
  }

  openModal('modalContact');
}

function saveEmergencyContact(e) {
  e.preventDefault();
  const contactId = document.getElementById('contactId').value;
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const category = document.getElementById('contactCategory').value;
  const notes = document.getElementById('contactNotes') ? document.getElementById('contactNotes').value.trim() : '';

  if (!name || !phone) return;

  appState.emergencyContacts = appState.emergencyContacts || [];

  if (contactId) {
    const existing = appState.emergencyContacts.find(c => c.id === contactId);
    if (existing) {
      existing.name = name;
      existing.phone = phone;
      existing.category = category;
      existing.notes = notes;
    }
  } else {
    const newContact = {
      id: 'c_' + Date.now(),
      name, phone, category, notes
    };
    appState.emergencyContacts.push(newContact);
  }

  saveState();
  closeModal('modalContact');
  document.getElementById('formContact').reset();
  renderEmergencyContacts();
}

function deleteEmergencyContactDirect(contactId) {
  appState.emergencyContacts = (appState.emergencyContacts || []).filter(c => c.id !== contactId);
  saveState();
  renderEmergencyContacts();
}

function callContact(phone) {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${cleanPhone}`;
}

// Render Dynamic Filter Pills for Maintenance Tab
function renderMaintenanceFilterPills() {
  const container = document.getElementById('maintenanceFilterPills');
  if (!container) return;

  let html = `<button class="pill ${currentFilter === 'all' ? 'active' : ''}" onclick="filterLogs('all', this)">Todos</button>`;
  
  SERVICE_CATEGORIES.forEach(cat => {
    html += `<button class="pill ${currentFilter === cat ? 'active' : ''}" onclick="filterLogs('${cat}', this)">${escapeHtml(cat)}</button>`;
  });
  
  container.innerHTML = html;
}

// Populate Category Dropdown in Modal Service
function populateServCategorySelect() {
  const select = document.getElementById('servCategory');
  if (!select) return;

  const currentVal = select.value;
  let html = '';
  SERVICE_CATEGORIES.forEach(cat => {
    html += `<option value="${cat}">${escapeHtml(cat)}</option>`;
  });

  select.innerHTML = html;
  if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
    select.value = currentVal;
  }
}

function handleServCategoryChange(val) {
  if (val === '__NEW__') {
    openModal('modalNewCategory');
    document.getElementById('servCategory').selectedIndex = 0;
  }
}

// Save New Custom Category
function saveNewCategory(e) {
  e.preventDefault();
  const name = document.getElementById('newCatName').value.trim();
  if (!name) return;

  if (!SERVICE_CATEGORIES.includes(name)) {
    SERVICE_CATEGORIES.push(name);
  }

  closeModal('modalNewCategory');
  document.getElementById('formNewCategory').reset();

  populateServCategorySelect();
  const select = document.getElementById('servCategory');
  if (select) select.value = name;
}

// Guantera Digital Functions
function renderGuantera() {
  renderEmergencyContacts();
  const container = document.getElementById('documentList');
  if (!container) return;

  const veh = getActiveVehicle();
  if (!veh) {
    container.innerHTML = '<p class="subtitle" style="text-align:center; padding:20px;">No hay vehículo activo.</p>';
    return;
  }

  const docs = (appState.documents || []).filter(d => d.vehicleId === veh.id);

  if (docs.length === 0) {
    container.innerHTML = `<p class="subtitle" style="text-align:center; padding:20px;">No has agregado ningún documento a la Guantera Digital.<br>Toca "+ Documento" para registrar tu Póliza, RTV o Licencia.</p>`;
    return;
  }

  docs.sort((a, b) => new Date(a.expDate) - new Date(b.expDate));

  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = docs.map(d => {
    let badgeClass = 'badge-green';
    let statusText = 'Vigente';

    const diffDays = Math.ceil((new Date(d.expDate) - new Date(today)) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      badgeClass = 'badge-red';
      statusText = `VENCIDO (${Math.abs(diffDays)}d)`;
    } else if (diffDays <= 30) {
      badgeClass = 'badge-yellow';
      statusText = `Vence en ${diffDays}d`;
    }

    return `
      <div class="swipe-container">
        <div class="swipe-action-bg">
          <button class="swipe-action-btn" onclick="deleteDocumentDirect('${d.id}')">
            ${SVG_ICONS.trash}
            <span>Eliminar</span>
          </button>
        </div>
        <div class="swipe-content log-item-card" onclick="openDocumentModal('${d.id}')">
          <div class="log-item-main">
            <div class="log-icon-badge">${SVG_ICONS.document}</div>
            <div>
              <div class="log-title">${escapeHtml(d.title)}</div>
              <div class="log-meta">Vence: <strong>${d.expDate}</strong> ${d.phone ? '• Tel: ' + escapeHtml(d.phone) : ''}</div>
              ${d.notes ? `<div class="log-meta" style="font-style:italic;">Nota: ${escapeHtml(d.notes)}</div>` : ''}
            </div>
          </div>
          <div class="log-item-side">
            <span class="badge-subtle ${badgeClass}">${statusText}</span>
            ${d.file ? `<button class="btn btn-secondary btn-sm" style="margin-top:6px; padding:2px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); viewDocumentFile('${d.id}')">Ver Adjunto</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openDocumentModal(docId = null) {
  const form = document.getElementById('formDocument');
  if (form) form.reset();
  document.getElementById('docId').value = '';
  if (document.getElementById('docFile')) document.getElementById('docFile').value = '';
  document.getElementById('modalDocumentTitle').textContent = 'Agregar Documento';

  if (docId) {
    const d = (appState.documents || []).find(item => item.id === docId);
    if (d) {
      document.getElementById('modalDocumentTitle').textContent = 'Editar Documento';
      document.getElementById('docId').value = d.id;
      document.getElementById('docType').value = d.type;
      document.getElementById('docTitle').value = d.title;
      document.getElementById('docExpDate').value = d.expDate;
      document.getElementById('docPhone').value = d.phone || '';
      if (document.getElementById('docNotes')) document.getElementById('docNotes').value = d.notes || '';
    }
  }

  openModal('modalDocument');
}

function saveDocument(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) { alert('Primero debes registrar un vehículo.'); return; }

  const docId = document.getElementById('docId').value;
  const type = document.getElementById('docType').value;
  const title = document.getElementById('docTitle').value;
  const expDate = document.getElementById('docExpDate').value;
  const phone = document.getElementById('docPhone').value;
  const notes = document.getElementById('docNotes') ? document.getElementById('docNotes').value.trim() : '';
  const fileInput = document.getElementById('docFile');

  let targetDoc = docId ? (appState.documents || []).find(d => d.id === docId) : null;

  const processAndSave = (fileBase64) => {
    if (targetDoc) {
      targetDoc.type = type;
      targetDoc.title = title;
      targetDoc.expDate = expDate;
      targetDoc.phone = phone;
      targetDoc.notes = notes;
      if (fileBase64) targetDoc.file = fileBase64;
    } else {
      const newDoc = {
        id: 'd_' + Date.now(),
        vehicleId: veh.id,
        type, title, expDate, phone, notes, file: fileBase64
      };
      appState.documents = appState.documents || [];
      appState.documents.push(newDoc);
    }

    saveState();
    closeModal('modalDocument');
    document.getElementById('formDocument').reset();
    renderApp();
  };

  if (fileInput.files && fileInput.files[0]) {
    readAndCompressImage(fileInput.files[0], processAndSave);
  } else {
    processAndSave('');
  }
}

function deleteDocumentDirect(docId) {
  if (confirm('¿Eliminar este documento de la Guantera?')) {
    appState.documents = (appState.documents || []).filter(d => d.id !== docId);
    saveState();
    renderApp();
  }
}

function viewDocumentFile(docId) {
  const doc = (appState.documents || []).find(d => d.id === docId);
  if (doc && doc.file) {
    document.getElementById('receiptContainer').innerHTML = `
      <img src="${doc.file}" alt="Documento ${escapeHtml(doc.title)}">
    `;
    openModal('modalReceiptViewer');
  }
}

// AI Mechanical Diagnostic Engine
function renderAIDiagnostic() {
  const container = document.getElementById('aiDiagnosticCard');
  if (!container) return;

  const veh = getActiveVehicle();
  if (!veh) {
    container.innerHTML = '<p class="subtitle" style="text-align:center; padding:10px;">Agrega tu primer vehículo en la pestaña Garaje para generar un diagnóstico inteligente.</p>';
    return;
  }

  const services = appState.services.filter(s => s.vehicleId === veh.id);
  const fuels = appState.fuels.filter(f => f.vehicleId === veh.id);
  const reminders = (appState.reminders || []).filter(r => r.vehicleId === veh.id && !r.completed);
  const docs = (appState.documents || []).filter(d => d.vehicleId === veh.id);

  let currentYear = new Date().getFullYear();
  let vehicleAge = Math.max(1, currentYear - veh.year);
  let avgKmPerYear = Math.round(veh.km / vehicleAge);

  let lastService = services.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const statusBanner = document.getElementById('aiConnectionStatusBanner');
  if (statusBanner) {
    if (appState.geminiApiKey) {
      statusBanner.innerHTML = `
        <div style="background:rgba(48,209,88,0.12); border:1px solid rgba(48,209,88,0.3); border-radius:12px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#30d158; box-shadow:0 0 8px #30d158;"></span>
            <strong style="color:#30d158; font-size:0.88rem;">Conectado a Google Gemini IA en Vivo ✓</strong>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="switchTab('tabSettings')" style="font-size:0.75rem; padding:4px 10px;">Ajustes</button>
        </div>`;
    } else {
      statusBanner.innerHTML = `
        <div style="background:rgba(255,214,10,0.12); border:1px solid rgba(255,214,10,0.3); border-radius:12px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <strong style="color:#ffd60a; display:block; font-size:0.88rem;">Modo Experto Integrado (Offline)</strong>
            <span style="font-size:0.78rem; color:#cbd5e1;">Ingresa tu API Key gratuita de Google Gemini en Ajustes para activar la IA en vivo de Google.</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="switchTab('tabSettings')" style="font-size:0.78rem; padding:6px 12px;">Conectar Gemini</button>
        </div>`;
    }
  }

  container.innerHTML = `
    <div class="ai-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
      <div>
        <h3 style="margin:0; font-size:1.05rem;">Diagnóstico IA - ${escapeHtml(veh.name)}</h3>
        <span style="font-size:0.78rem; color:var(--text-secondary);">${veh.year} • ${escapeHtml(veh.plate || 'Sin Placa')} • ${veh.km.toLocaleString()} KM</span>
      </div>
      <span class="ai-badge" style="background:#0a84ff; color:#fff; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;">Perfil Activo</span>
    </div>

    <div class="ai-item-row" style="margin-bottom:8px;">
      <div class="ai-item-title" style="font-weight:700; color:#ffffff;">Expediente de este Vehículo</div>
      <div class="ai-item-body" style="font-size:0.85rem; color:#cbd5e1;">
        • <strong>${services.length} Mantenimiento(s)</strong> (${lastService ? 'Último: ' + escapeHtml(lastService.title) + ' el ' + lastService.date : 'Sin registros recientes'}).<br>
        • <strong>${fuels.length} Recarga(s)</strong> de gasolina acumuladas.<br>
        • <strong>${reminders.length} Recordatorio(s)</strong> personalizados pendientes.<br>
        • <strong>${docs.length} Documento(s)</strong> en la Guantera Digital.
      </div>
    </div>

    <div class="ai-item-row">
      <div class="ai-item-title" style="font-weight:700; color:#ffffff;">Uso y Asesoría Técnica</div>
      <div class="ai-item-body" style="font-size:0.85rem; color:#cbd5e1;">
        Promedio de uso estimado: <strong>${avgKmPerYear.toLocaleString()} km/año</strong>.<br>
        ${veh.km >= 50000 
          ? `Al superar los 50.000 km en este ${escapeHtml(veh.name)}, es recomendable revisar fajas de distribución, bujías, líquido de frenos y soportes de motor.` 
          : `Revisa la presión de inflado en llantas en frío y mantén el aceite limpio para maximizar el rendimiento.`}
      </div>
    </div>
  `;
}

// Quick Prompt Handler for Chip Buttons
function askQuickPrompt(promptText) {
  const input = document.getElementById('aiUserQuestion');
  if (input) {
    input.value = promptText;
    const form = document.getElementById('formAIChat');
    if (form) {
      askAIAssistantDirect(promptText);
    }
  }
}

function askAIAssistant(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('aiUserQuestion');
  const question = input ? input.value.trim() : '';
  if (question) askAIAssistantDirect(question);
}

// Conversational & Fine-Tuned AI Assistant
async function askAIAssistantDirect(question) {
  const input = document.getElementById('aiUserQuestion');
  const responseBox = document.getElementById('aiChatResponse');

  if (!question || !responseBox) return;

  responseBox.style.display = 'block';
  responseBox.innerHTML = '<div style="display:flex; align-items:center; gap:8px;"><span>🤖</span> <em>Analizando expediente del vehículo y consultando a la IA...</em></div>';

  const veh = getActiveVehicle();
  const services = veh ? appState.services.filter(s => s.vehicleId === veh.id).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const fuels = veh ? appState.fuels.filter(f => f.vehicleId === veh.id) : [];
  const reminders = veh ? (appState.reminders || []).filter(r => r.vehicleId === veh.id && !r.completed) : [];

  const recentServicesText = services.slice(0, 5).map(s => `- ${s.date}: ${s.category} (${s.title}) - ${formatCurrency(s.cost)}`).join('\n') || 'Sin servicios previos registrados';
  const pendingRemindersText = reminders.map(r => `- ${r.title} (${r.category}) ${r.targetKm ? 'Meta: ' + r.targetKm.toLocaleString() + ' KM' : ''}`).join('\n') || 'Sin recordatorios pendientes';

  const vehContext = veh 
    ? `${veh.name} (Año ${veh.year}, ${veh.type}, ${veh.km.toLocaleString()} KM en Odómetro, Placa: ${veh.plate || 'N/A'})` 
    : 'vehículo no seleccionado';

  const formatText = (txt) => {
    return txt
      .replace(/### (.*?)\n/g, '<h4 style="color:#38bdf8; margin:12px 0 4px 0; font-size:0.95rem;">$1</h4>')
      .replace(/## (.*?)\n/g, '<h3 style="color:#ffffff; margin:14px 0 6px 0; font-size:1.05rem;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 5px; border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const qLower = question.toLowerCase();
  const greetings = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hi', 'saludos', 'quien eres', 'quien sos', 'ayuda'];

  if (greetings.some(g => qLower === g || qLower.startsWith(g + ' ') || qLower.endsWith(' ' + g))) {
    setTimeout(() => {
      const userName = currentUser ? currentUser.name.split(' ')[0] : '';
      responseBox.innerHTML = formatText(`**¡Hola${userName ? ' ' + escapeHtml(userName) : ''}! Soy tu Asistente Mecánico IA de GarageOne.**\n\nEstoy listo para asesorarte sobre tu **${escapeHtml(vehContext)}**.\n\nPuedo diagnosticar averías, analizar ruidos, revisar testigos del tablero (Check Engine), recomendar repuestos y verificar mantenimientos según tu kilometraje.\n\n¿Qué problema o duda tienes sobre tu auto?`);
      if (input) input.value = '';
    }, 250);
    return;
  }

  let lastGeminiApiError = '';

  // 1. LIVE GOOGLE GEMINI API ENGINE
  if (appState.geminiApiKey) {
    try {
      const promptText = `Eres el Asistente Técnico y Mecánico Automotriz de GarageOne con Inteligencia Artificial.
Vehículo actual del usuario: ${vehContext}
Mantenimientos recientes registrados:
${recentServicesText}
Recordatorios pendientes:
${pendingRemindersText}

Consulta del Usuario: "${question}"

Instrucciones de Respuesta:
- Responde de forma clara, natural, precisa y útil en español.
- Si el usuario hace una pregunta general (como un saludo, quién eres, un concepto o consejo básico de autos), responde de manera conversacional, directa y amigable.
- Si el usuario consulta sobre un problema técnico, falla, ruido o testigo de alerta, incluye:
  • Severidad / Nivel de Riesgo (🔴 Alto, 🟡 Moderado, 🟢 Informativo)
  • Diagnóstico Técnico y Causas Probables
  • Recomendaciones o Pasos Inmediatos a Seguir.`;

      const candidateUrls = [
        appState.geminiWorkingUrl,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${appState.geminiApiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${appState.geminiApiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${appState.geminiApiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${appState.geminiApiKey}`
      ].filter(Boolean);

      let resData = null;
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
          });
          const data = await res.json();
          if (res.ok && data.candidates && data.candidates[0].content.parts[0].text) {
            resData = data;
            appState.geminiWorkingUrl = url;
            saveState();
            break;
          } else if (data.error) {
            lastGeminiApiError = data.error.message;
          }
        } catch (e) {
          console.log('Error testing endpoint:', url, e);
          lastGeminiApiError = e.message;
        }
      }

      if (resData && resData.candidates && resData.candidates[0].content.parts[0].text) {
        const liveBadge = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(48,209,88,0.15); color:#30d158; border:1px solid rgba(48,209,88,0.3); padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; margin-bottom:12px;">⚡ Respuesta en Vivo por Google Gemini IA</div><br>`;
        responseBox.innerHTML = liveBadge + formatText(resData.candidates[0].content.parts[0].text);
        if (input) input.value = '';
        return;
      }
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      lastGeminiApiError = err.message;
    }
  }

  // 2. ENHANCED OFFLINE EXPERT MECHANICAL ENGINE
  setTimeout(() => {
    const offlineBadge = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; margin-bottom:12px;">🛠️ Asistente Mecánico Integrado (Modo Offline)</div><br>`;
    
    let errorNotice = '';
    if (appState.geminiApiKey && lastGeminiApiError) {
      errorNotice = `<div style="background:rgba(255,69,58,0.15); color:#ff453a; border:1px solid rgba(255,69,58,0.3); padding:8px 12px; border-radius:10px; font-size:0.82rem; margin-bottom:12px;">⚠️ <strong>Error en Google Gemini API:</strong> ${escapeHtml(lastGeminiApiError)}<br><span style="color:#cbd5e1; font-size:0.76rem;">Se muestra respuesta del motor mecánico local como respaldo.</span></div>`;
    }

    let response = '';

    if (qLower.includes('check engine') || qLower.includes('luz de motor') || qLower.includes('testigo') || qLower.includes('obd')) {
      response = `🔴 **Nivel de Severidad: URGENCIA MODERADA / ALTA**\n\n🛠️ **Diagnóstico Técnico para ${escapeHtml(vehContext)}:**\n• Sensor de Oxígeno (O2) defectuoso o descalibrado.\n• Tapón de combustible mal cerrado (fuga del sistema EVAP).\n• Sensor de Flujo de Aire (MAF) sucio o falla en cuerpo de aceleración.\n• Misfire (falla de encendido en cilindro) por bujía o bobina degradada.\n\n🔍 **Componentes a Inspeccionar:**\n• Escáner OBD2 (Verificar código P0300, P0420 o P0135).\n• Juego de bujías e inspección de cables/bobinas.\n\n📋 **Análisis por Kilometraje (${veh ? veh.km.toLocaleString() : 0} KM):**\n• Si no has cambiado bujías en los últimos 30.000 KM, es la causa #1 de Check Engine.\n\n⏱️ **Acción Recomendada:**\n• Si la luz es fija, conduce suavemente al taller. Si la luz **parpadea**, apaga el motor de inmediato.`;
    } else if (qLower.includes('fuga') || qLower.includes('gota') || qLower.includes('charco') || qLower.includes('mancha')) {
      response = `🔴 **Nivel de Severidad: ALTA**\n\n🛠️ **Diagnóstico Técnico de Fluidos (${escapeHtml(vehContext)}):**\n• **Líquido Marrón/Negro:** Aceite de motor (retén de cigüeñal, cárter o filtro flojo).\n• **Líquido Rojo/Transparente Aceitoso:** Aceite de caja automática (ATF) o dirección hidráulica.\n• **Líquido Verde/Rosa/Azul:** Coolant / Refrigerante (radiador o manguera perforada).\n• **Líquido Transparente Amarillento Olor Fuerte:** Fluido de frenos (URGENCIA).\n\n🔍 **Componentes a Inspeccionar:**\n• Empaque de tapa de válvulas, tapón de cárter y depósito de frenos.\n\n⏱️ **Acción Inmediata:**\n• Mide varilla de aceite y nivel de coolant antes de encender el motor.`;
    } else if (qLower.includes('calienta') || qLower.includes('temperatura') || qLower.includes('refrigerante') || qLower.includes('vapor') || qLower.includes('radiador')) {
      response = `🔴 **Nivel de Severidad: CRÍTICA (RIESGO DE DAÑO GRAVE)**\n\n🛠️ **Diagnóstico de Sobrecalentamiento (${escapeHtml(vehContext)}):**\n• Termostato trabado en posición cerrada.\n• Electroventilador quemado, fusible soplado o termoswitch fallado.\n• Fuga de refrigerante en manguera principal o tapón de radiador.\n• Empaque de cabezote (culata) soplado.\n\n🔍 **Componentes a Inspeccionar:**\n• Nivel de coolant en tanque de expansión, bomba de agua y abanico radiador.\n\n⏱️ **Acción Inmediata:**\n• **Apaga el motor de inmediato.** Espera 30 min. **NUNCA abras la tapa del radiador caliente.**`;
    } else if (qLower.includes('freno') || qLower.includes('chillido') || qLower.includes('pedal') || qLower.includes('vibracion al frenar')) {
      response = `🟡 **Nivel de Severidad: MODERADA / ALTA**\n\n🛠️ **Diagnóstico de Frenado:**\n• **Chillido Agudo Metal con Metal:** Pastillas al límite de desgaste.\n• **Pedal Esponjoso / Se va al fondo:** Aire en líneas o líquido DOT4 degradado por humedad.\n• **Vibración en Pedal/Volante al frenar:** Discos alabeados (torcidos por shock térmico).\n\n🔍 **Componentes a Inspeccionar:**\n• Grosor de pastillas, espesor de discos y cilindro maestro.\n\n⏱️ **Acción Inmediata:**\n• Inspeccionar espesor de pastillas de freno antes de viajes largos.`;
    } else if (qLower.includes('ruido') || qLower.includes('golpe') || qLower.includes('crujido') || qLower.includes('volante') || qLower.includes('vibra')) {
      response = `🟡 **Nivel de Severidad: MODERADA**\n\n🛠️ **Diagnóstico de Suspensión y Dirección:**\n• **Golpe seco al pasar huecos:** Bujes de meseta, bocinas o compensadores gastados.\n• **Vibración a más de 80 km/h:** Desbalanceo de ruedas o rin torcido.\n• **Crujido al girar todo el volante:** Punta de eje / triseta / junta homocinética.\n\n🔍 **Componentes a Inspeccionar:**\n• Terminales de dirección, rótulas, balanceo de llantas y bujes.\n\n⏱️ **Acción Inmediata:**\n• Realizar alineación y balanceo en centro de llantas.`;
    } else if (qLower.includes('bateria') || qLower.includes('arranca') || qLower.includes('start') || qLower.includes('starter') || qLower.includes('alternador')) {
      response = `🟡 **Nivel de Severidad: MODERADA**\n\n🛠️ **Diagnóstico del Sistema Eléctrico:**\n• **Sonido 'Tak-tak-tak' al encender:** Batería descargada o bornes sulfatados.\n• **Tablero tenue y testigo de batería en rojo:** Alternador no está cargando.\n• **Motor gira muy lento:** Batería cumplió su vida útil (2-3 años promedio).\n\n🔍 **Componentes a Inspeccionar:**\n• Voltaje de batería en reposo (>12.6V) y alternador cargando (13.8V - 14.4V).\n\n⏱️ **Acción Inmediata:**\n• Limpiar bornes con agua/bicarbonato o medir voltaje con multímetro.`;
    } else if (qLower.includes('humo') || qLower.includes('escape')) {
      response = `🟡 **Nivel de Severidad: MODERADA / ALTA**\n\n🛠️ **Diagnóstico de Humo en Escape:**\n• **Humo Azulado:** Aceite entrando a la cámara (sellos de válvula o anillos gastados).\n• **Humo Blanco Denso:** Refrigerante ingresando al motor (empaque de culata).\n• **Humo Negro:** Mezcla rica (exceso de gasolina / filtro de aire muy sucio / inyector goteando).\n\n🔍 **Componentes a Inspeccionar:**\n• Compresión de cilindros, filtro de aire y estado de inyectores.\n\n⏱️ **Acción Inmediata:**\n• Monitorear consumo de aceite y coolant diariamente.`;
    } else {
      response = `🟢 **Nivel de Severidad: PREVENTIVA / INFORMATIVA**\n\n🛠️ **Asesoría Técnica Experta para ${escapeHtml(vehContext)}:**\n\nAcerca de *"<sup>${escapeHtml(question)}</sup>"*:\n\n🔍 **Recomendaciones de Mantenimiento:**\n• Para un vehículo con **${veh ? veh.km.toLocaleString() : 0} KM**, asegúrate de realizar cambio de aceite y filtro cada 5.000 KM (mineral) o 10.000 KM (sintético).\n• Inspecciona fajas de distribución y accesorios cada 40.000 KM.\n• Mantén al día tu bitácora registrando cada servicio en la pestaña **Servicios** de GarageOne.`;
    }

    responseBox.innerHTML = errorNotice + offlineBadge + formatText(response);
    if (input) input.value = '';
  }, 300);
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('geminiApiKeyInput');
  const btn = document.getElementById('btnToggleApiKey');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = 'Ocultar';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = 'Mostrar';
  }
}

async function testAndSaveGeminiKey() {
  const input = document.getElementById('geminiApiKeyInput');
  const msgBox = document.getElementById('geminiKeyStatusMsg');
  const badge = document.getElementById('geminiStatusBadge');

  const key = input ? input.value.trim() : '';

  if (!key) {
    appState.geminiApiKey = '';
    delete appState.geminiWorkingUrl;
    saveState();
    if (badge) {
      badge.className = 'badge-subtle badge-yellow';
      badge.textContent = 'No configurada';
    }
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.style.color = '#ffd60a';
      msgBox.textContent = 'API Key removida.';
    }
    return;
  }

  if (msgBox) {
    msgBox.style.display = 'block';
    msgBox.style.color = '#38bdf8';
    msgBox.textContent = 'Verificando API Key con Google Gemini...';
  }

  const candidateEndpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  ];

  let success = false;
  let workingUrl = '';
  let lastErrorMessage = '';

  for (const url of candidateEndpoints) {
    try {
      const isGet = url.includes('/models?key=');
      const res = await fetch(url, {
        method: isGet ? 'GET' : 'POST',
        headers: isGet ? {} : { 'Content-Type': 'application/json' },
        body: isGet ? undefined : JSON.stringify({ contents: [{ parts: [{ text: 'Hola' }] }] })
      });

      const data = await res.json();

      if (res.ok) {
        if (isGet && data.models && data.models.length > 0) {
          success = true;
          const genModel = data.models.find(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
          if (genModel) {
            const mName = genModel.name.replace(/^models\//, '');
            workingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${key}`;
          }
          break;
        } else if (data.candidates && data.candidates.length > 0) {
          success = true;
          workingUrl = url;
          break;
        }
      } else if (data.error) {
        lastErrorMessage = data.error.message;
      }
    } catch (e) {
      console.log('Error testing endpoint:', url, e);
    }
  }

  if (success) {
    appState.geminiApiKey = key;
    if (workingUrl) appState.geminiWorkingUrl = workingUrl;
    saveState();
    if (badge) {
      badge.className = 'badge-subtle badge-green';
      badge.textContent = 'Conectada ✓';
    }
    if (msgBox) {
      msgBox.style.color = '#30d158';
      msgBox.textContent = '¡Conexión exitosa! Tu API Key de Google Gemini IA está activa y lista para usar.';
    }
  } else {
    if (msgBox) {
      msgBox.style.color = '#ff453a';
      msgBox.textContent = `❌ Error: ${lastErrorMessage || 'No se pudo validar la API Key con Google.'}`;
    }
  }
}

function saveGeminiKey(key) {
  appState.geminiApiKey = key.trim();
  saveState();
}

// Mini Vehicle List (iOS Swipe-to-Delete)
function renderMiniVehiclesList() {
  const container = document.getElementById('allVehiclesList');
  if (!container) return;

  if (appState.vehicles.length === 0) {
    container.innerHTML = '<p class="subtitle">No hay vehículos registrados.</p>';
    return;
  }

  container.innerHTML = appState.vehicles.map(v => `
    <div class="swipe-container">
      <div class="swipe-action-bg">
        <button class="swipe-action-btn" onclick="deleteVehicleDirect('${v.id}')">
          ${SVG_ICONS.trash}
          <span>Eliminar</span>
        </button>
      </div>
      <div class="swipe-content vehicle-mini-item ${v.id === appState.activeVehicleId ? 'active-veh' : ''}">
        <div style="cursor:pointer; flex:1;" onclick="selectActiveVehicle('${v.id}')">
          <strong>${escapeHtml(v.name)} (${v.year}) ${v.id === appState.activeVehicleId ? '✓' : ''}</strong>
          <div class="veh-info-sub">${escapeHtml(v.plate) || 'Sin Placa'} • ${v.km.toLocaleString()} km</div>
        </div>
        <div class="veh-actions">
          <button class="btn btn-secondary btn-sm" onclick="editVehicle('${v.id}')">${SVG_ICONS.edit} Editar</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Vehicle CRUD
function openVehicleModal(vehId = null) {
  const form = document.getElementById('formVehicle');
  if (form) form.reset();
  document.getElementById('vehId').value = '';
  if (document.getElementById('vehPhoto')) document.getElementById('vehPhoto').value = '';
  document.getElementById('modalVehicleTitle').textContent = 'Nuevo Vehículo';

  if (vehId) {
    const v = appState.vehicles.find(item => item.id === vehId);
    if (v) {
      document.getElementById('modalVehicleTitle').textContent = 'Editar Vehículo';
      document.getElementById('vehId').value = v.id;
      document.getElementById('vehType').value = v.type;
      document.getElementById('vehName').value = v.name;
      document.getElementById('vehYear').value = v.year;
      document.getElementById('vehPlate').value = v.plate || '';
      document.getElementById('vehKm').value = v.km;
    }
  }

  openModal('modalVehicle');
}

function editVehicle(vehId) {
  openVehicleModal(vehId);
}

function saveVehicle(e) {
  e.preventDefault();
  const vehId = document.getElementById('vehId').value;
  const type = document.getElementById('vehType').value;
  const name = document.getElementById('vehName').value;
  const year = parseInt(document.getElementById('vehYear').value);
  const plate = document.getElementById('vehPlate').value;
  const km = parseInt(document.getElementById('vehKm').value);
  const photoInput = document.getElementById('vehPhoto');

  let targetVeh = vehId ? appState.vehicles.find(v => v.id === vehId) : null;

  const processAndSave = (photoBase64) => {
    if (targetVeh) {
      targetVeh.type = type;
      targetVeh.name = name;
      targetVeh.year = year;
      targetVeh.plate = plate;
      targetVeh.km = km;
      if (photoBase64) targetVeh.photo = photoBase64;
    } else {
      const newVeh = {
        id: 'v_' + Date.now(),
        type, name, year, plate, km, photo: photoBase64
      };
      appState.vehicles.push(newVeh);
      appState.activeVehicleId = newVeh.id;
    }

    saveState();
    closeModal('modalVehicle');
    document.getElementById('formVehicle').reset();
    renderApp();
  };

  if (photoInput.files && photoInput.files[0]) {
    readAndCompressImage(photoInput.files[0], processAndSave);
  } else {
    processAndSave('');
  }
}

// Maintenance Log List (iOS Swipe-to-Delete)
let currentFilter = 'all';

function filterLogs(cat, el) {
  currentFilter = cat;
  document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  renderServiceList(appState.activeVehicleId);
}

function renderServiceList(vehId) {
  const container = document.getElementById('serviceLogList');
  let list = appState.services.filter(s => s.vehicleId === vehId);

  if (currentFilter !== 'all') {
    list = list.filter(s => s.category === currentFilter);
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (list.length === 0) {
    container.innerHTML = `<p class="subtitle" style="text-align:center; padding:20px;">Sin registros en esta categoría.</p>`;
    return;
  }

  const svgCategoryMap = {
    'Aceite': SVG_ICONS.oil,
    'Frenos': SVG_ICONS.brakes,
    'Llantas': SVG_ICONS.tires,
    'Filtros': SVG_ICONS.filters,
    'Bujías': SVG_ICONS.spark,
    'Batería': SVG_ICONS.battery,
    'Transmisión': SVG_ICONS.transmission,
    'Correa': SVG_ICONS.belt,
    'Trámite': SVG_ICONS.document,
    'Otro': SVG_ICONS.wrench
  };

  container.innerHTML = list.map(s => `
    <div class="swipe-container">
      <div class="swipe-action-bg">
        <button class="swipe-action-btn" onclick="deleteServiceDirect('${s.id}')">
          ${SVG_ICONS.trash}
          <span>Eliminar</span>
        </button>
      </div>
      <div class="swipe-content log-item-card" onclick="openServiceModal('${s.id}')">
        <div class="log-item-main">
          <div class="log-icon-badge">${svgCategoryMap[s.category] || SVG_ICONS.wrench}</div>
          <div>
            <div class="log-title">${escapeHtml(s.title)}</div>
            <div class="log-meta">${s.date} • ${s.km.toLocaleString()} km ${s.shop ? `• ${escapeHtml(s.shop)}` : ''}</div>
            ${s.notes ? `<div class="log-meta" style="font-style:italic;">Nota: ${escapeHtml(s.notes)}</div>` : ''}
            ${s.receipt ? `<span class="receipt-chip" onclick="event.stopPropagation(); viewReceipt('${s.id}')">${SVG_ICONS.document} Factura</span>` : ''}
          </div>
        </div>
        <div class="log-item-side">
          <div class="log-cost">${formatCurrency(s.cost)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function openServiceModal(servId = null) {
  const form = document.getElementById('formService');
  if (form) form.reset();
  document.getElementById('servId').value = '';
  if (document.getElementById('servReceipt')) document.getElementById('servReceipt').value = '';
  document.getElementById('modalServiceTitle').textContent = 'Registrar Mantenimiento';
  populateServCategorySelect();
  setTodayDates();

  if (servId) {
    const s = appState.services.find(item => item.id === servId);
    if (s) {
      document.getElementById('modalServiceTitle').textContent = 'Editar Mantenimiento';
      document.getElementById('servId').value = s.id;
      document.getElementById('servCategory').value = s.category;
      document.getElementById('servTitle').value = s.title;
      document.getElementById('servCost').value = s.cost;
      document.getElementById('servDate').value = s.date;
      document.getElementById('servKm').value = s.km;
      document.getElementById('servShop').value = s.shop || '';
      if (document.getElementById('servNotes')) document.getElementById('servNotes').value = s.notes || '';
    }
  }

  openModal('modalService');
}

// Fuel Log List (iOS Swipe-to-Delete)
function renderFuelList(vehId) {
  const container = document.getElementById('fuelLogList');
  let list = appState.fuels.filter(f => f.vehicleId === vehId);
  list.sort((a, b) => b.km - a.km);

  if (list.length >= 2) {
    let totalKmDiff = list[0].km - list[list.length - 1].km;
    let totalVolume = list.slice(0, -1).reduce((sum, f) => sum + f.volume, 0);
    let totalCost = list.reduce((sum, f) => sum + f.cost, 0);

    let efficiency = totalVolume > 0 ? (totalKmDiff / totalVolume).toFixed(1) : 0;
    let costPerKm = totalKmDiff > 0 ? (totalCost / totalKmDiff) : 0;

    document.getElementById('fuelEfficiencyVal').textContent = `${efficiency} km/L`;
    document.getElementById('costPerKmVal').textContent = `${formatCurrency(costPerKm)}/km`;
  } else {
    document.getElementById('fuelEfficiencyVal').textContent = `N/A`;
    document.getElementById('costPerKmVal').textContent = `N/A`;
  }

  if (list.length === 0) {
    container.innerHTML = `<p class="subtitle" style="text-align:center; padding:20px;">Sin registros de gasolina.</p>`;
    return;
  }

  container.innerHTML = list.map(f => `
    <div class="swipe-container">
      <div class="swipe-action-bg">
        <button class="swipe-action-btn" onclick="deleteFuelDirect('${f.id}')">
          ${SVG_ICONS.trash}
          <span>Eliminar</span>
        </button>
      </div>
      <div class="swipe-content log-item-card" onclick="openFuelModal('${f.id}')">
        <div class="log-item-main">
          <div class="log-icon-badge">${SVG_ICONS.fuel}</div>
          <div>
            <div class="log-title">${f.volume} Litros</div>
            <div class="log-meta">${f.date} • Odómetro: ${f.km.toLocaleString()} km</div>
            ${f.notes ? `<div class="log-meta" style="font-style:italic;">Nota: ${escapeHtml(f.notes)}</div>` : ''}
          </div>
        </div>
        <div class="log-item-side">
          <div class="log-cost">${formatCurrency(f.cost)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function openFuelModal(fuelId = null) {
  const form = document.getElementById('formFuel');
  if (form) form.reset();
  document.getElementById('fuelId').value = '';
  document.getElementById('modalFuelTitle').textContent = 'Registrar Gasolina';
  setTodayDates();

  if (fuelId) {
    const f = appState.fuels.find(item => item.id === fuelId);
    if (f) {
      document.getElementById('modalFuelTitle').textContent = 'Editar Gasolina';
      document.getElementById('fuelId').value = f.id;
      document.getElementById('fuelCost').value = f.cost;
      document.getElementById('fuelVolume').value = f.volume;
      document.getElementById('fuelKm').value = f.km;
      document.getElementById('fuelDate').value = f.date;
      if (document.getElementById('fuelNotes')) document.getElementById('fuelNotes').value = f.notes || '';
    }
  }

  openModal('modalFuel');
}

// User Settings Render
function renderUserSettings() {
  if (currentUser) {
    const profileNameEl = document.getElementById('userProfileName');
    if (profileNameEl) profileNameEl.textContent = currentUser.username || currentUser.name || '-';

    const togglePin = document.getElementById('togglePinSetting');
    const pinStatusText = document.getElementById('pinStatusText');
    const pinContainer = document.getElementById('pinSetupContainer');

    if (togglePin) togglePin.checked = !!currentUser.pinEnabled;
    if (pinStatusText) {
      pinStatusText.textContent = currentUser.pinEnabled
        ? `PIN activado (${currentUser.pin ? '••••' : 'No configurado'})`
        : 'Permite desbloquear la app con un PIN numérico';
    }
    if (pinContainer) {
      pinContainer.style.display = currentUser.pinEnabled ? 'block' : 'none';
    }
  }

  const settingCurr = document.getElementById('settingCurrency');
  if (settingCurr) settingCurr.value = appState.currency || 'CRC';

  const settingLang = document.getElementById('settingLanguage');
  if (settingLang) settingLang.value = appState.language || 'es';

  const geminiInput = document.getElementById('geminiApiKeyInput');
  const geminiBadge = document.getElementById('geminiStatusBadge');
  if (geminiInput) geminiInput.value = appState.geminiApiKey || '';
  if (geminiBadge) {
    if (appState.geminiApiKey) {
      geminiBadge.className = 'badge-subtle badge-green';
      geminiBadge.textContent = 'Conectada ✓';
    } else {
      geminiBadge.className = 'badge-subtle badge-yellow';
      geminiBadge.textContent = 'No configurada';
    }
  }

  const symbol = appState.currency === 'USD' ? '$' : appState.currency === 'EUR' ? '€' : '₡';
  document.querySelectorAll('.currency-lbl').forEach(el => el.textContent = symbol);

  renderStorageStats();
  applyLanguageTranslations();
}

function changeCurrencySetting(val) {
  appState.currency = val;
  saveState();
  renderUserSettings();
  renderApp();
}

// Reports & Financial Overview
function renderReports() {
  const vehId = appState.activeVehicleId;
  const services = appState.services.filter(s => s.vehicleId === vehId);
  const fuels = appState.fuels.filter(f => f.vehicleId === vehId);

  const totalServSpend = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuelSpend = fuels.reduce((sum, f) => sum + f.cost, 0);

  document.getElementById('totalServiceSpend').textContent = formatCurrency(totalServSpend);
  document.getElementById('totalFuelSpend').textContent = formatCurrency(totalFuelSpend);

  renderCategoryDonutChart(services);
  renderMonthlyExpensesChart(services, fuels);
}

function renderMonthlyExpensesChart(services, fuels) {
  const chartContainer = document.getElementById('monthlyExpensesChart');
  if (!chartContainer) return;

  if (services.length === 0 && fuels.length === 0) {
    chartContainer.innerHTML = '<p class="subtitle">Registra mantenimientos o gasolina para ver desglose mensual.</p>';
    return;
  }

  const monthlyTotals = {};

  services.forEach(s => {
    if (!s.date) return;
    const monthKey = s.date.substring(0, 7); // "YYYY-MM"
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + s.cost;
  });

  fuels.forEach(f => {
    if (!f.date) return;
    const monthKey = f.date.substring(0, 7); // "YYYY-MM"
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + f.cost;
  });

  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => b.localeCompare(a));

  if (sortedMonths.length === 0) {
    chartContainer.innerHTML = '<p class="subtitle">Sin datos de fecha válidos para desglosar.</p>';
    return;
  }

  const maxMonthSpend = Math.max(...Object.values(monthlyTotals));
  const monthNamesEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  let html = `<div style="display:flex; flex-direction:column; gap:10px; width:100%;">`;

  sortedMonths.forEach(mKey => {
    const [year, monthNum] = mKey.split('-');
    const monthName = monthNamesEs[parseInt(monthNum, 10) - 1] || mKey;
    const total = monthlyTotals[mKey];
    const percent = maxMonthSpend > 0 ? Math.round((total / maxMonthSpend) * 100) : 0;

    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
          <span><strong>${monthName} ${year}</strong></span>
          <span style="font-weight:700; color:#30d158;">${formatCurrency(total)}</span>
        </div>
        <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
          <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #0a84ff, #30d158); border-radius:4px;"></div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  chartContainer.innerHTML = html;
}

function renderCategoryDonutChart(services) {
  const chartContainer = document.getElementById('categoryChart');
  if (services.length === 0) {
    chartContainer.innerHTML = '<p class="subtitle">Registra servicios para ver desglose de gastos.</p>';
    return;
  }

  const categoryTotals = {};
  services.forEach(s => {
    categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.cost;
  });

  const categories = Object.keys(categoryTotals);
  let html = `<div style="display:flex; flex-direction:column; gap:8px; width:100%;">`;
  let grandTotal = services.reduce((sum, s) => sum + s.cost, 0);

  categories.forEach((cat) => {
    let cost = categoryTotals[cat];
    let percent = grandTotal > 0 ? Math.round((cost / grandTotal) * 100) : 0;

    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
          <span>${escapeHtml(cat)}</span>
          <span style="font-weight:700;">${formatCurrency(cost)} (${percent}%)</span>
        </div>
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
          <div style="width:${percent}%; height:100%; background:#ffffff; border-radius:3px;"></div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  chartContainer.innerHTML = html;
}

// Modals
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    if (id === 'modalService' && !document.getElementById('servId').value) {
      const form = document.getElementById('formService');
      if (form) form.reset();
      document.getElementById('servId').value = '';
      setTodayDates();
    } else if (id === 'modalFuel' && !document.getElementById('fuelId').value) {
      const form = document.getElementById('formFuel');
      if (form) form.reset();
      document.getElementById('fuelId').value = '';
      setTodayDates();
    } else if (id === 'modalDocument' && !document.getElementById('docId').value) {
      const form = document.getElementById('formDocument');
      if (form) form.reset();
      document.getElementById('docId').value = '';
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Forms
function saveOdometer(e) {
  e.preventDefault();
  const km = parseInt(document.getElementById('quickOdometerInput').value);
  const veh = getActiveVehicle();
  if (veh && km) {
    veh.km = km;
    saveState();
    closeModal('modalOdometer');
    renderApp();
  }
}

function saveService(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) { alert('Primero debes registrar un vehículo.'); return; }
  const servId = document.getElementById('servId').value;
  const category = document.getElementById('servCategory').value;
  const title = document.getElementById('servTitle').value;
  const cost = parseFloat(document.getElementById('servCost').value);
  const date = document.getElementById('servDate').value;
  const km = parseInt(document.getElementById('servKm').value);
  const shop = document.getElementById('servShop').value;
  const notes = document.getElementById('servNotes') ? document.getElementById('servNotes').value.trim() : '';
  const receiptInput = document.getElementById('servReceipt');

  let targetServ = servId ? appState.services.find(s => s.id === servId) : null;

  const processAndSave = (receiptBase64) => {
    if (targetServ) {
      targetServ.category = category;
      targetServ.title = title;
      targetServ.cost = cost;
      targetServ.date = date;
      targetServ.km = km;
      targetServ.shop = shop;
      targetServ.notes = notes;
      if (receiptBase64) targetServ.receipt = receiptBase64;
    } else {
      const newServ = {
        id: 's_' + Date.now(),
        vehicleId: veh.id,
        category, title, cost, date, km, shop, notes, receipt: receiptBase64
      };
      appState.services.push(newServ);
    }
    if (km > veh.km) veh.km = km;
    saveState();
    closeModal('modalService');
    document.getElementById('formService').reset();
    setTodayDates();
    renderApp();
  };

  if (receiptInput.files && receiptInput.files[0]) {
    readAndCompressImage(receiptInput.files[0], processAndSave);
  } else {
    processAndSave('');
  }
}

function saveFuel(e) {
  e.preventDefault();
  const veh = getActiveVehicle();
  if (!veh) { alert('Primero debes registrar un vehículo.'); return; }
  const fuelId = document.getElementById('fuelId').value;
  const cost = parseFloat(document.getElementById('fuelCost').value);
  const volume = parseFloat(document.getElementById('fuelVolume').value);
  const km = parseInt(document.getElementById('fuelKm').value);
  const date = document.getElementById('fuelDate').value;
  const notes = document.getElementById('fuelNotes') ? document.getElementById('fuelNotes').value.trim() : '';

  let targetFuel = fuelId ? appState.fuels.find(f => f.id === fuelId) : null;

  if (targetFuel) {
    targetFuel.cost = cost;
    targetFuel.volume = volume;
    targetFuel.km = km;
    targetFuel.date = date;
    targetFuel.notes = notes;
  } else {
    const newFuel = {
      id: 'f_' + Date.now(),
      vehicleId: veh.id,
      cost, volume, km, date, notes
    };
    appState.fuels.push(newFuel);
  }

  if (km > veh.km) veh.km = km;
  saveState();
  closeModal('modalFuel');
  document.getElementById('formFuel').reset();
  setTodayDates();
  renderApp();
}

function viewReceipt(serviceId) {
  const serv = appState.services.find(s => s.id === serviceId);
  if (serv && serv.receipt) {
    document.getElementById('receiptContainer').innerHTML = `
      <img src="${serv.receipt}" alt="Factura de ${escapeHtml(serv.title)}">
    `;
    openModal('modalReceiptViewer');
  }
}

function generateCertifiedReport() {
  const veh = getActiveVehicle();
  if (!veh) return;
  const services = appState.services.filter(s => s.vehicleId === veh.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const fuels = appState.fuels.filter(f => f.vehicleId === veh.id);
  const reminders = (appState.reminders || []).filter(r => r.vehicleId === veh.id && !r.completed);

  const totalServSpend = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuelSpend = fuels.reduce((sum, f) => sum + f.cost, 0);
  const totalSpend = totalServSpend + totalFuelSpend;

  const lastService = services[0];
  const emissionDate = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });

  const container = document.getElementById('certifiedDocumentContent');
  container.innerHTML = `
    <div class="cert-header" style="border-bottom:2px solid #000000; padding-bottom:12px; margin-bottom:16px; background:#ffffff; color:#000000;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h1 style="color:#000000; margin:0 0 4px 0; font-size:1.4rem; text-transform:uppercase; letter-spacing:0.5px;">GARAGEONE - EXPEDIENTE TÉCNICO Y MANTENIMIENTO</h1>
          <p style="color:#475569; margin:0; font-size:0.85rem; font-weight:600;">Reporte Detallado de Servicios Mecánicos para Taller</p>
        </div>
        <div style="text-align:right; font-size:0.8rem; color:#475569;">
          <div>Emisión: <strong style="color:#000000;">${emissionDate}</strong></div>
          <div>Propietario: <strong style="color:#000000;">${currentUser ? escapeHtml(currentUser.name) : 'Cliente'}</strong></div>
        </div>
      </div>
    </div>

    <!-- Vehicle Specs Box -->
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; margin-bottom:16px; color:#0f172a;">
      <h3 style="margin:0 0 8px 0; font-size:1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Ficha del Vehículo</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; font-size:0.85rem; color:#1e293b;">
        <div><strong style="color:#0f172a;">Vehículo:</strong> ${escapeHtml(veh.name)}</div>
        <div><strong style="color:#0f172a;">Placa / Matrícula:</strong> ${escapeHtml(veh.plate) || 'SIN PLACA'}</div>
        <div><strong style="color:#0f172a;">Año:</strong> ${veh.year}</div>
        <div><strong style="color:#0f172a;">Tipo:</strong> ${escapeHtml(veh.type)}</div>
        <div><strong style="color:#0f172a;">Odómetro Actual:</strong> ${veh.km.toLocaleString()} KM</div>
        <div><strong style="color:#0f172a;">Última Revisión:</strong> ${lastService ? lastService.date : 'Sin registro'}</div>
      </div>
    </div>

    <!-- Financial & Service Overview -->
    <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
      <div style="flex:1; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; text-align:center;">
        <span style="display:block; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Total Servicios</span>
        <strong style="font-size:1.1rem; color:#0f172a;">${services.length} Mantenimiento(s)</strong>
      </div>
      <div style="flex:1; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; text-align:center;">
        <span style="display:block; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Inversión Mantenimiento</span>
        <strong style="font-size:1.1rem; color:#0f172a;">${formatCurrency(totalServSpend)}</strong>
      </div>
      <div style="flex:1; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; text-align:center;">
        <span style="display:block; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Total Combustible</span>
        <strong style="font-size:1.1rem; color:#0f172a;">${formatCurrency(totalFuelSpend)} (${fuels.length} cargas)</strong>
      </div>
    </div>

    <!-- Detailed Services Table -->
    <h3 style="margin:16px 0 8px 0; font-size:1.05rem; color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:4px;">
      Historial Detallado de Trabajos y Repuestos
    </h3>

    ${services.length === 0 ? `
      <p style="text-align:center; padding:16px; color:#64748b; font-style:italic;">No hay servicios registrados para este vehículo.</p>
    ` : `
      <table class="cert-table" style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:0.82rem; background:#ffffff; color:#0f172a;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff; text-align:left;">
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">Fecha</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">KM</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">Categoría</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">Trabajo Realizado</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">Detalles / Repuestos / Garantía</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a;">Taller / Mecánico</th>
            <th style="padding:8px; border:1px solid #0f172a; color:#ffffff; background:#0f172a; text-align:right;">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${services.map((s, idx) => `
            <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; color:#0f172a; border-bottom:1px solid #cbd5e1;">
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a; white-space:nowrap;"><strong style="color:#0f172a;">${s.date}</strong></td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a; white-space:nowrap;">${s.km.toLocaleString()} km</td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a;"><strong style="color:#0f172a;">${escapeHtml(s.category)}</strong></td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a;"><strong style="color:#0f172a;">${escapeHtml(s.title)}</strong></td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#334155;">${escapeHtml(s.notes) || '<span style="color:#94a3b8;">Sin notas adicionales</span>'}</td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a;">${escapeHtml(s.shop) || 'Mecánico Privado'}</td>
              <td style="padding:8px; border:1px solid #cbd5e1; color:#0f172a; text-align:right; font-weight:700;">${formatCurrency(s.cost)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `}

    <!-- Pending / Recommended Maintenance for Mechanic -->
    ${reminders.length > 0 ? `
      <div style="margin-top:16px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:12px; color:#78350f;">
        <h4 style="margin:0 0 6px 0; color:#b45309; font-size:0.95rem;">⚠️ Mantenimientos Pendientes y Próximos (Para Atención del Mecánico)</h4>
        <ul style="margin:0; padding-left:20px; font-size:0.83rem; color:#78350f;">
          ${reminders.map(r => `
            <li style="margin-bottom:4px;">
              <strong style="color:#78350f;">${escapeHtml(r.title)}</strong> (${escapeHtml(r.category)}) 
              ${r.targetKm ? ` • Meta: ${r.targetKm.toLocaleString()} KM` : ''}
              ${r.targetDate ? ` • Fecha Meta: ${r.targetDate}` : ''}
              ${r.notes ? ` — <em>${escapeHtml(r.notes)}</em>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="margin-top:24px; border-top:1px solid #cbd5e1; padding-top:10px; font-size:0.75rem; color:#64748b; text-align:center; background:#ffffff;">
      GarageOne • Expediente Vehicular Inteligente • Documento preparado para entrega al Taller / Mecánico
    </div>
  `;

  openModal('modalCertifiedReport');
}

function downloadReportPDF() {
  const veh = getActiveVehicle();
  const element = document.getElementById('certifiedDocumentContent');
  if (!element || !veh) return;

  const cleanName = (veh.plate || veh.name).replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Expediente_Mecanico_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Create in-DOM overlay container for WebKit / iOS compatibility (avoids blank -9999px paint bug)
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.zIndex = '999999';
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#0f172a';
  wrapper.style.overflowY = 'auto';
  wrapper.style.padding = '20px';
  wrapper.style.boxSizing = 'border-box';

  const clone = element.cloneNode(true);
  clone.style.maxWidth = '750px';
  clone.style.margin = '0 auto';
  clone.style.background = '#ffffff';
  clone.style.color = '#0f172a';
  clone.style.fontFamily = 'Arial, Helvetica, sans-serif';

  // Ensure all text inside clone is dark black/slate
  const allNodes = clone.querySelectorAll('*');
  allNodes.forEach(el => {
    if (el.tagName === 'TH' || el.style.background.includes('0f172a')) {
      el.style.color = '#ffffff';
    } else {
      el.style.color = '#0f172a';
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  if (window.html2pdf) {
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 1.5, 
        useCORS: false, 
        allowTaint: true,
        scrollY: 0, 
        scrollX: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    }).catch(err => {
      console.error('Error al generar PDF con html2pdf:', err);
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      window.print();
    });
  } else {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    window.print();
  }
}

function readAndCompressImage(file, callback) {
  if (!file) return callback('');
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 600;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = function() {
      callback(e.target.result);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `autocare_respaldo_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported.vehicles && Array.isArray(imported.vehicles) && imported.services && Array.isArray(imported.services)) {
        appState = imported;
        saveState();
        renderApp();
        alert('Copia de seguridad cargada con éxito.');
      } else {
        alert('Formato JSON no válido.');
      }
    } catch (err) {
      alert('Error al leer archivo JSON.');
    }
  };
  reader.readAsText(file);
}

// Report Sharing (Text & Email)
function shareReportText() {
  const veh = getActiveVehicle();
  if (!veh) return;
  const services = appState.services.filter(s => s.vehicleId === veh.id);
  const fuels = appState.fuels.filter(f => f.vehicleId === veh.id);
  const totalServ = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuel = fuels.reduce((sum, f) => sum + f.cost, 0);

  const text = `🚗 Expediente de Vehículo - GarageOne\n\n` +
    `• Vehículo: ${veh.name} (${veh.year})\n` +
    `• Placa: ${veh.plate || 'N/A'}\n` +
    `• Odómetro: ${veh.km.toLocaleString()} KM\n\n` +
    `📊 Resumen de Inversión:\n` +
    `• Mantenimiento: ${formatCurrency(totalServ)} (${services.length} servicios)\n` +
    `• Combustible: ${formatCurrency(totalFuel)} (${fuels.length} cargas)\n` +
    `• Total Invertido: ${formatCurrency(totalServ + totalFuel)}\n\n` +
    `Generado con GarageOne.`;

  if (navigator.share) {
    navigator.share({
      title: `Expediente ${veh.name}`,
      text: text
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Resumen copiado al portapapeles.');
    }).catch(() => {
      alert(text);
    });
  } else {
    alert(text);
  }
}

function shareReportEmail() {
  const veh = getActiveVehicle();
  if (!veh) return;
  const services = appState.services.filter(s => s.vehicleId === veh.id);
  const fuels = appState.fuels.filter(f => f.vehicleId === veh.id);
  const totalServ = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuel = fuels.reduce((sum, f) => sum + f.cost, 0);

  const subject = `Expediente de Mantenimiento - ${veh.name} (${veh.plate || 'GarageOne'})`;
  const body = `HISTORIAL DE MANTENIMIENTO Y SERVICIOS - GARAGEONE\n\n` +
    `Vehículo: ${veh.name} (${veh.year})\n` +
    `Placa: ${veh.plate || 'N/A'}\n` +
    `Odómetro Actual: ${veh.km.toLocaleString()} KM\n\n` +
    `RESUMEN FINANCIERO:\n` +
    `- Total Mantenimiento: ${formatCurrency(totalServ)} (${services.length} registros)\n` +
    `- Total Combustible: ${formatCurrency(totalFuel)} (${fuels.length} recargas)\n` +
    `- Inversión Total: ${formatCurrency(totalServ + totalFuel)}\n\n` +
    `Generado por GarageOne.`;

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Internationalization (i18n) Engine
const I18N_DICT = {
  es: {
    navGarage: 'Garaje',
    navServices: 'Servicios',
    navFuel: 'Gasolina',
    navGlovebox: 'Guantera',
    navAI: 'IA',
    navReports: 'Reportes',
    subtitleGarage: 'Tu taller y control vehicular inteligente',
    titleMaintenance: 'Servicios y Mantenimientos',
    subMaintenance: 'Historial mecánico y preventivo',
    btnAddService: '+ Registrar Servicio',
    titleFuel: 'Control de Gasolina',
    subFuel: 'Registro de recargas y consumo de combustible',
    btnAddFuel: '+ Registrar Gasolina',
    guanteraTitle: 'Guantera Digital',
    guanteraSubtitle: 'Papeles, seguro, RTV y directorio de asistencia',
    contactsTitle: 'Números Importantes',
    contactsSubtitle: 'Desliza para borrar. Toca para llamar a talleres, grúa o seguro',
    btnAddContact: '+ Guardar Número',
    docsTitle: 'Documentos del Vehículo',
    btnAddDoc: '+ Agregar Documento',
    titleAI: 'Asistente IA Mecánico',
    subAI: 'Análisis inteligente y consultas mecánicas',
    aiQueryTitle: 'Consulta a la IA',
    aiQuerySub: 'Preguntas rápidas o consulta personalizada:',
    btnAskAI: 'Consultar a la IA',
    titleReports: 'Reportes y Finanzas',
    subReports: 'Inversión detallada en mantenimientos y combustible',
    cardTotalServ: 'Total Mantenimiento',
    cardTotalFuel: 'Total Combustible',
    cardCatBreakdown: 'Desglose de Gastos por Categoría',
    cardMonthBreakdown: 'Desglose de Gastos por Mes',
    reportTitle: 'Historial de Mantenimientos y Reparaciones',
    reportSubtitle: 'Genera un documento formal con todas las reparaciones mecánicas, servicios, talleres y fechas registradas para este vehículo, listo para compartir o imprimir en PDF.',
    btnViewReport: 'Ver / Imprimir Expediente (PDF)',
    btnShareText: 'Compartir Texto',
    btnShareEmail: 'Correo',
    titleSettings: 'Ajustes Generales',
    subSettings: 'Configuración de cuenta e intervalos',
    profileTitle: 'Perfil de Usuario',
    lblUsername: 'Usuario',
    secAuthTitle: 'Seguridad y Autenticación',
    pinTitle: 'Acceso con PIN',
    pinSubtitle: 'Permite desbloquear la app con un PIN numérico',
    btnSavePin: 'Guardar PIN',
    prefTitle: 'Preferencias',
    lblLanguage: 'Idioma de la App / App Language',
    lblCurrency: 'Moneda del Sistema',
    backupTitle: 'Respaldo y Seguridad',
    btnExport: 'Exportar Datos (JSON)',
    btnImport: 'Importar Datos (JSON)',
    btnLogout: 'Bloquear / Cerrar Sesión',
    certifiedModalTitle: 'Expediente de Venta',
    btnPrint: 'Imprimir / PDF',
    noVehicles: 'No hay vehículos registrados.',
    noServices: 'Sin mantenimientos registrados para este vehículo.',
    noFuels: 'Sin recargas de gasolina registradas.',
    noReminders: 'No hay recordatorios pendientes.',
    noDocs: 'Sin documentos registrados en la guantera.',
    noContacts: 'No hay números guardados.',
    callBtn: 'Llamar',
    deleteBtn: 'Eliminar',
    urgentBadge: 'Atención requerida',
    okBadge: 'Al día',
    validDoc: 'Vigente',
    expiredDoc: 'Vencido',
    dueSoonDoc: 'Por vencer'
  },
  en: {
    navGarage: 'Garage',
    navServices: 'Services',
    navFuel: 'Fuel',
    navGlovebox: 'Glovebox',
    navAI: 'AI',
    navReports: 'Reports',
    subtitleGarage: 'Smart vehicle management and workshop assistant',
    titleMaintenance: 'Services & Maintenance',
    subMaintenance: 'Mechanical and preventive service history',
    btnAddService: '+ Add Service',
    titleFuel: 'Fuel Log',
    subFuel: 'Refuel entries and fuel consumption tracking',
    btnAddFuel: '+ Log Fuel',
    guanteraTitle: 'Digital Glovebox',
    guanteraSubtitle: 'Documents, insurance, inspection & assistance directory',
    contactsTitle: 'Important Numbers',
    contactsSubtitle: 'Swipe left to delete. Tap to call mechanic, tow or insurance',
    btnAddContact: '+ Save Number',
    docsTitle: 'Vehicle Documents',
    btnAddDoc: '+ Add Document',
    titleAI: 'AI Mechanic Assistant',
    subAI: 'Smart diagnostic analysis and mechanic Q&A',
    aiQueryTitle: 'Ask AI Mechanic',
    aiQuerySub: 'Quick topics or custom question:',
    btnAskAI: 'Ask AI Assistant',
    titleReports: 'Reports & Expenses',
    subReports: 'Detailed breakdown of maintenance and fuel spend',
    cardTotalServ: 'Total Maintenance',
    cardTotalFuel: 'Total Fuel',
    cardCatBreakdown: 'Expense Breakdown by Category',
    cardMonthBreakdown: 'Expense Breakdown by Month',
    reportTitle: 'Maintenance & Service History',
    reportSubtitle: 'Generate an official certified vehicle report with all mechanical repairs, services, and costs ready to share or print to PDF.',
    btnViewReport: 'View / Print Report (PDF)',
    btnShareText: 'Share Text',
    btnShareEmail: 'Email',
    titleSettings: 'General Settings',
    subSettings: 'Account configuration and preferences',
    profileTitle: 'User Profile',
    lblUsername: 'Username',
    secAuthTitle: 'Security & Authentication',
    pinTitle: 'PIN Access',
    pinSubtitle: 'Unlock the application with a 4-6 digit numeric PIN',
    btnSavePin: 'Save PIN',
    prefTitle: 'Preferences',
    lblLanguage: 'App Language / Idioma de la App',
    lblCurrency: 'System Currency',
    backupTitle: 'Backup & Security',
    btnExport: 'Export Data (JSON)',
    btnImport: 'Import Data (JSON)',
    btnLogout: 'Lock / Log Out',
    certifiedModalTitle: 'Vehicle Service Record',
    btnPrint: 'Print / PDF',
    noVehicles: 'No vehicles added yet.',
    noServices: 'No maintenance records found for this vehicle.',
    noFuels: 'No fuel entries logged yet.',
    noReminders: 'No pending reminders.',
    noDocs: 'No documents stored in glovebox.',
    noContacts: 'No phone numbers saved.',
    callBtn: 'Call',
    deleteBtn: 'Delete',
    urgentBadge: 'Attention needed',
    okBadge: 'Up to date',
    validDoc: 'Valid',
    expiredDoc: 'Expired',
    dueSoonDoc: 'Expiring soon'
  }
};

function t(key, fallback = '') {
  const lang = appState.language || 'es';
  if (I18N_DICT[lang] && I18N_DICT[lang][key]) return I18N_DICT[lang][key];
  if (I18N_DICT.es && I18N_DICT.es[key]) return I18N_DICT.es[key];
  return fallback || key;
}

function changeLanguageSetting(lang) {
  appState.language = lang || 'es';
  saveState();
  applyLanguageTranslations();
  renderUserSettings();
  renderApp();
  renderEmergencyContacts();
  renderDocuments();
  renderUserReminders();
  renderRemindersTab();
}

function applyLanguageTranslations() {
  const lang = appState.language || 'es';
  const dict = I18N_DICT[lang] || I18N_DICT.es;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}


