/* ==========================================================================
AutoCare - Core Logic (v14: Bi-Directional Seamless iOS Swipe Physics)
========================================================================== */

// GarageOne Core Application Engine - Local Offline First (IndexedDB + Local Backups)

let appState = {
currency: 'CRC',
geminiApiKey: '',
groqApiKey: '',
aiEngineMode: 'groq_key',
vehicles: [],
activeVehicleId: '',
documents: [],
services: [],
fuels: [],
reminders: [],
users: [],
emergencyContacts: []
};

let currentUser = null;
let isAuthenticated = false;

const USER_KEY = 'GARAGEONE_USER';
const USERS_KEY = 'GARAGEONE_USERS_LIST';

const DEFAULT_ADMIN_USER = {
id: '00000000-0000-4000-a000-000000000001',
username: 'admin',
name: 'Administrador Principal',
email: 'admin@garageone.app',
password: '1234',
role: 'admin',
permissions: {
tabGarage: true,
tabMaintenance: true,
tabFuel: true,
tabGuantera: true,
tabAI: true,
tabReports: true,
tabSettings: true,
canManageUsers: false
},
pinEnabled: false,
pin: '',
createdAt: new Date().toISOString()
};

const ADMIN_PASSWORD_KEY = 'GARAGEONE_ADMIN_PWD';

function getStoredAdminPassword() {
try { return localStorage.getItem(ADMIN_PASSWORD_KEY) || '1234'; } catch (e) { return '1234'; }
}

function storeAdminPassword(pwd) {
try { localStorage.setItem(ADMIN_PASSWORD_KEY, pwd); } catch (e) { }
}

function getRolePermissionsPreset(role) {
if (role === 'admin') {
return { tabGarage: true, tabMaintenance: true, tabFuel: true, tabGuantera: true, tabAI: true, tabReports: true, tabSettings: true, canManageUsers: true };
} else if (role === 'mecanico') {
return { tabGarage: true, tabMaintenance: true, tabFuel: false, tabGuantera: true, tabAI: true, tabReports: true, tabSettings: true, canManageUsers: false };
} else if (role === 'cliente') {
return { tabGarage: true, tabMaintenance: false, tabFuel: true, tabGuantera: true, tabAI: true, tabReports: true, tabSettings: true, canManageUsers: false };
} else {
return { tabGarage: true, tabMaintenance: true, tabFuel: true, tabGuantera: true, tabAI: true, tabReports: true, tabSettings: true, canManageUsers: false };
}
}

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

let SERVICE_CATEGORIES = ['Aceite', 'Frenos', 'Llantas', 'Filtros', 'Bujías', 'Batería', 'Transmisión', 'Correa', 'Trámite', 'Otro'];

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
emergencyContacts: []
};

appState = loadState();
currentUser = loadUser();
isAuthenticated = false;
let failedLoginAttempts = 0;
let lockoutUntil = 0;

function formatCurrency(amount) {
const num = Number(amount || 0);
const curr = appState.currency || 'CRC';
const hasDecimals = num % 1 !== 0;
const opts = hasDecimals
? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
: { maximumFractionDigits: 2 };

if (curr === 'CRC') return '₡' + num.toLocaleString('es-CR', opts);
if (curr === 'USD') return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
if (curr === 'EUR') return '€' + num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
return '₡' + num.toLocaleString('es-CR', opts);
}

function openModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.add('open');
if (modalId === 'modalNewCategory') {
renderCustomCategoriesList();
}
}
}

function closeModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.remove('open');
}
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
checkAuth();
setTodayDates();
await initAsyncStorage();

// Run initial reminder check and set periodic timer (every 30s)
checkAndSendDueNotifications();
setInterval(checkAndSendDueNotifications, 30000);

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

// BroadcastChannel for Live Cross-Tab & Web/App User Sync
const userSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('garageone_user_database_sync') : null;

function getUsersList() {
if (appState.users && Array.isArray(appState.users) && appState.users.length > 0) {
return appState.users;
}
try {
const raw = localStorage.getItem(USERS_KEY);
let list = raw ? JSON.parse(raw) : [];
return Array.isArray(list) ? list : [];
} catch (e) {
return [];
}
}

async function saveUsersList(usersList) {
try {
localStorage.setItem(USERS_KEY, JSON.stringify(usersList));
} catch (e) { }

for (const u of usersList) {
await LocalDB.put(STORES.USERS, u);
}
appState.users = usersList;

if (userSyncChannel) {
try { userSyncChannel.postMessage({ type: 'USER_DATABASE_UPDATED' }); } catch (e) { }
}
if (typeof SyncService !== 'undefined' && SyncService.syncUnified) {
SyncService.syncUnified();
}
}

function loadUser() {
try {
const u = localStorage.getItem(USER_KEY);
if (u) {
const parsed = JSON.parse(u);
if (parsed && (parsed.username || parsed.name || parsed.email)) return parsed;
}
return null;
} catch (e) {
return null;
}
}

function getUserStorageKey(user = currentUser) {
if (user && (user.id || user.username)) {
const keyStr = (user.id || user.username).toLowerCase().replace(/[^a-z0-9_]/g, '_');
return `AUTOCARE_DATA_USER_${keyStr}`;
}
return 'AUTOCARE_DATA_USER_default';
}

async function saveUser(user) {
currentUser = user;
if (user) {
try {
localStorage.setItem(USER_KEY, JSON.stringify(user));
} catch (e) { }
await SyncService.executeCrud(user.id ? 'UPDATE' : 'CREATE', STORES.USERS, user);
} else {
localStorage.removeItem(USER_KEY);
}
appState = loadState();
}

let currentRecoveryOTP = null;
let currentRecoveryTargetUser = null;

function showLoginForm() {
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const formForgotPass = document.getElementById('formForgotPass');
const formResetPassword = document.getElementById('formResetPassword');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const loginUser = document.getElementById('loginUser');

if (formLogin) formLogin.style.display = 'block';
if (formRegister) formRegister.style.display = 'none';
if (formForgotPass) formForgotPass.style.display = 'none';
if (formResetPassword) formResetPassword.style.display = 'none';

const defaultUser = currentUser ? (currentUser.username || currentUser.name || '') : '';
if (loginUser && !loginUser.value) {
loginUser.value = defaultUser;
}

const username = loginUser && loginUser.value ? loginUser.value : defaultUser;
if (authTitle) authTitle.textContent = username ? `Hola, ${escapeHtml(username)}` : 'Bienvenido a GarageOne';
if (authSubtitle) authSubtitle.textContent = 'Ingresa tu usuario y contraseña para acceder';
}

function showRegisterForm() {
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const formForgotPass = document.getElementById('formForgotPass');
const formResetPassword = document.getElementById('formResetPassword');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');

if (formLogin) formLogin.style.display = 'none';
if (formRegister) formRegister.style.display = 'block';
<div id="documentList" class="log-list">
<!-- Dynamic Document Cards -->
</div>
</section>

<!-- TAB 4: Asistente IA Mecánico -->
<section id="tabAI" class="tab-content">
<div class="section-header">
<div class="section-header-title">
<h1>Asistente IA Mecánico</h1>
<p class="subtitle">Análisis inteligente y consultas mecánicas</p>
</div>
</div>

<div id="aiConnectionStatusBanner" style="margin-bottom:12px;"></div>

<!-- Tarjeta de Configuración de IA (Servidor & API Key) -->
<div class="settings-card" id="aiEngineInfoCard" style="margin-bottom:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
<h3 style="margin:0; font-size:1rem; display:flex; align-items:center; gap:8px;">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
Servidor de Inteligencia Artificial (API)
</h3>
</div>

<!-- Banner destacado superior indicando IA conectada u Offline -->
<div id="aiTopStatusBanner" style="margin-bottom:14px; padding:12px 14px; border-radius:12px; font-size:0.88rem; font-weight:700; display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(142,142,147,0.12); border:1px solid rgba(142,142,147,0.3); color:#e2e8f0;">
<div style="display:flex; align-items:center; gap:10px;" id="aiTopStatusText">
<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8e8e93;"></span>
<span>Usando Modo Offline</span>
</div>
</div>

<p class="subtitle" style="margin-bottom:12px; font-size:0.83rem;">Selecciona tu proveedor de Inteligencia Artificial e ingresa tu Token / API Key para activar la conexión en vivo.</p>

<div class="form-group" style="margin-bottom:12px;">
<label style="font-size:0.8rem; font-weight:600; color:#e2e8f0;">Proveedor de Inteligencia Artificial (Online)</label>
<select id="aiEngineModeSelect" class="form-control" onchange="onAiEngineModeChange(this.value)">
<option value="gemini_key">Google Gemini API (Key / Token)</option>
<option value="groq_key">Groq Llama 3.3 (Key / Token)</option>
</select>
</div>

<div class="form-group" id="geminiKeyContainer" style="margin-bottom:12px; display:block;">
<label style="font-size:0.8rem; font-weight:600; color:#e2e8f0;">Token / API Key de Google Gemini</label>
<input type="password" id="geminiApiKeyInput" class="form-control" placeholder="Ingresa tu clave (ej. AIzaSy...)" oninput="onGeminiKeyInput(this.value)">
</div>

<div class="form-group" id="groqKeyContainer" style="margin-bottom:12px; display:none;">
<label style="font-size:0.8rem; font-weight:600; color:#e2e8f0;">Token / API Key de Groq</label>
<input type="password" id="groqApiKeyInput" class="form-control" placeholder="Ingresa tu clave (ej. gsk_...)" oninput="onGroqKeyInput(this.value)">
</div>

<!-- Disposición Responsiva Móvil de Botones Conectar/Desconectar -->
<div style="margin-top:14px; margin-bottom:6px;">
<div style="display:flex; gap:8px; width:100%;">

localRecoveryTargetUser = matched;
const targetLabel = document.getElementById('forgotEmailSentTarget');
if (targetLabel) targetLabel.textContent = matched.username || matched.email;

const step1 = document.getElementById('forgotStep1');
const step2 = document.getElementById('forgotStep2');
if (step1) step1.style.display = 'none';
if (step2) step2.style.display = 'block';
}

async function handleForgotPassword(e) {
if (e) e.preventDefault();

const newPassInput = document.getElementById('forgotNewPassword');
const confirmPassInput = document.getElementById('forgotConfirmPassword');
const passError = document.getElementById('forgotPassError');
if (passError) { passError.style.display = 'none'; passError.textContent = ''; }

const newPassword = newPassInput ? newPassInput.value.trim() : '';
const confirmPassword = confirmPassInput ? confirmPassInput.value.trim() : '';

if (!localRecoveryTargetUser) {
if (passError) {
passError.textContent = 'Selecciona primero una cuenta válida.';
passError.style.display = 'block';
}
return;
}

if (!newPassword || newPassword.length < 3) {
if (passError) {
passError.textContent = 'La nueva contraseña debe tener al menos 3 caracteres.';
passError.style.display = 'block';
}
return;
}

if (newPassword !== confirmPassword) {
if (passError) {
passError.textContent = 'Las contraseñas no coinciden.';
passError.style.display = 'block';
}
return;
}

try {
await AuthService.resetPasswordLocal(localRecoveryTargetUser.username || localRecoveryTargetUser.email, newPassword);
alert('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
showLoginForm();
const loginUser = document.getElementById('loginUser');
if (loginUser) loginUser.value = localRecoveryTargetUser.email || localRecoveryTargetUser.username;
localRecoveryTargetUser = null;
} catch (err) {
if (passError) {
passError.textContent = err.message || 'Error al actualizar la contraseña.';
passError.style.display = 'block';
}
}
}

function checkAuth() {
const authScreen = document.getElementById('authScreen');
const appShell = document.getElementById('appShell');

currentUser = AuthService.getCurrentUser();
isAuthenticated = AuthService.isAuthenticated();

if (isAuthenticated) {
if (authScreen) authScreen.style.display = 'none';
if (appShell) appShell.style.display = 'block';
try {
loadAppStateFromDB().then(() => {
switchTab('tabGarage');
renderApp();
if (typeof renderGuantera === 'function') renderGuantera();
if (typeof renderAiChatHistory === 'function') renderAiChatHistory();
renderUserSettings();
});
} catch (err) {
console.error('Error al renderizar la app:', err);
}
} else {
if (authScreen) authScreen.style.display = 'flex';
if (appShell) appShell.style.display = 'none';
showLoginForm();
}
}

async function handleRegister(e) {
if (e) e.preventDefault();

const userInput = document.getElementById('regUser');
const emailInput = document.getElementById('regEmail');
const passInput = document.getElementById('regPassword');
const confirmPassInput = document.getElementById('regConfirmPassword');

const userError = document.getElementById('userError');
const emailError = document.getElementById('emailError');
const passError = document.getElementById('passError');
const confirmPassError = document.getElementById('confirmPassError');

if (userError) userError.style.display = 'none';
if (emailError) emailError.style.display = 'none';
if (passError) passError.style.display = 'none';
if (confirmPassError) confirmPassError.style.display = 'none';

const username = userInput ? userInput.value.trim() : '';
const email = emailInput ? emailInput.value.trim() : '';
const password = passInput ? passInput.value.trim() : '';
const confirmPassword = confirmPassInput ? confirmPassInput.value.trim() : '';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
if (emailError) {
emailError.textContent = 'Por favor ingresa un correo electrónico válido.';
emailError.style.display = 'block';
}
return;
}

if (!password || password.length < 6) {
if (passError) {
passError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
passError.style.display = 'block';
}
return;
}

if (password !== confirmPassword) {
if (confirmPassError) {
confirmPassError.textContent = 'Las contraseñas no coinciden.';
confirmPassError.style.display = 'block';
}
return;
}

try {
await AuthService.register(email, password, { username, name: username });
currentUser = AuthService.getCurrentUser();
isAuthenticated = AuthService.isAuthenticated();
checkAuth();
} catch (err) {
const msg = err.message || 'Error registrando la cuenta.';
if (passError) {
passError.textContent = msg;
passError.style.color = '#ff453a';
passError.style.display = 'block';
}
}
}
<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
<div>
<h3 style="margin:0; font-size:1rem;">Diagnóstico e Historial de Sincronización</h3>
<p class="subtitle" style="font-size:0.78rem; margin-top:2px;">Consulta los eventos de sincronización en tiempo real y cola offline.</p>
</div>
<button type="button" class="btn btn-secondary btn-sm" onclick="openSyncLogsModal()" style="font-weight:700; font-size:0.78rem; padding:6px 12px;">
🔍 Ver Log Diagnóstico
</button>
</div>
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
</span>
<span class="nav-label" data-i18n="navGlovebox">Guantera</span>
</button>

<button class="nav-item" onclick="switchTab('tabAI', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
</span>
<span class="nav-label" data-i18n="navAI">IA</span>
</button>

<button class="nav-item" onclick="switchTab('tabReports', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
</span>
<span class="nav-label" data-i18n="navReports">Reportes</span>
</button>
</nav>

} catch (err) {
if (loginError) {
loginError.textContent = err.message || 'Error al iniciar sesión.';
loginError.style.display = 'block';
}

if (password !== confirmPassword) {
if (confirmPassError) {
confirmPassError.textContent = 'Las contraseñas no coinciden.';
<div class="form-group" style="margin-bottom:12px;">
<label data-i18n="lblLanguage">Idioma de la App / App Language</label>
<select id="settingLanguage" class="form-control" onchange="changeLanguageSetting(this.value)">
<option value="es">Español (Spanish)</option>
<option value="en">English (Inglés)</option>
</select>
</div>
<div class="form-group">
<label data-i18n="lblCurrency">Moneda del Sistema</label>
<select id="settingCurrency" class="form-control" onchange="changeCurrencySetting(this.value)">
<option value="CRC">Colones costarricenses (₡)</option>
<option value="USD">Dólares estadounidenses ($)</option>
<option value="EUR">Euros (€)</option>
</select>
</div>
</div>

<div class="settings-card" id="backupCard">
<h3 style="margin-bottom:8px;">Respaldos</h3>
<p class="subtitle" style="margin-bottom:12px; font-size:0.82rem;">Exporta e importa tus datos y configuración en XML.</p>
<div style="display:flex; gap:8px; flex-wrap:wrap;">
<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('backupImportInput').click()">Importar XML</button>
<input id="backupImportInput" type="file" accept=".xml,text/xml,application/xml" style="display:none" onchange="importBackupXml(event)">
</div>
<div class="form-group" style="margin:14px 0 6px;">
<label style="font-size:0.8rem;">Respaldo automático</label>
<select id="backupFrequency" class="form-control" onchange="saveBackupFrequency(this.value)">
<option value="off">Desactivado</option><option value="daily">Diario</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option>
</select>
</div>
<!-- Bottom Navigation Bar -->
<nav class="bottom-nav">
<button class="nav-item active" onclick="switchTab('tabGarage', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h2m8 0h2"/></svg>
</span>
<span class="nav-label" data-i18n="navGarage">Garaje</span>
</button>

<button class="nav-item" onclick="switchTab('tabMaintenance', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
</span>
<span class="nav-label" data-i18n="navServices">Servicios</span>
</button>

<button class="nav-item" onclick="switchTab('tabFuel', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 11h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"/><path d="M3 22h12"/><path d="M7 9h4"/></svg>
</span>
<span class="nav-label" data-i18n="navFuel">Gasolina</span>
</button>

<button class="nav-item" onclick="switchTab('tabGuantera', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
</span>
<span class="nav-label" data-i18n="navGlovebox">Guantera</span>
</button>

<button class="nav-item" onclick="switchTab('tabAI', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
</span>
<span class="nav-label" data-i18n="navAI">IA</span>
</button>

<button class="nav-item" onclick="switchTab('tabReports', this)">
<span class="nav-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
</span>
<span class="nav-label" data-i18n="navReports">Reportes</span>
</button>
</nav>

</div>

<!-- MODALS -->

<!-- Modal: Agregar / Editar Vehículo -->
<div id="modalVehicle" class="modal-backdrop">
align-items: center;
gap: 10px;
margin-bottom: 14px;
border-bottom: 1px solid var(--border-color);
padding-bottom: 12px;
}

.ai-badge {
background: #ffffff;
color: #000000;
font-size: 0.75rem;
font-weight: 800;
padding: 3px 9px;
border-radius: 6px;
}

.ai-item-row { margin-bottom: 12px; }
.ai-item-title { font-size: 0.92rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.ai-item-body { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.45; }

.ai-response-box {
background: var(--bg-secondary);
border: 1px solid var(--border-color);
border-radius: var(--radius-md);
padding: 14px;
margin-top: 14px;
font-size: 0.9rem;
color: var(--text-primary);
line-height: 1.5;
white-space: pre-line;
}

/* Logs List */
.log-list { display: flex; flex-direction: column; gap: 8px; }

.log-item-main { display: flex; gap: 12px; align-items: center; }

.log-icon-badge {
width: 40px; height: 40px; border-radius: 12px;
background: var(--bg-secondary); border: 1px solid var(--border-color);
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

function saveChangePassword() {
const currentPassInput = document.getElementById('currentPasswordInput');
const newPassInput = document.getElementById('newPasswordInput');
const confirmPassInput = document.getElementById('confirmNewPasswordInput');
const statusEl = document.getElementById('changePasswordStatus');

const currentPass = currentPassInput ? currentPassInput.value.trim() : '';
const newPass = newPassInput ? newPassInput.value.trim() : '';
const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';

const showStatus = (msg, color) => {
if (statusEl) {
statusEl.textContent = msg;
statusEl.style.color = color;
statusEl.style.display = 'block';
}
};

if (!currentUser) {
showStatus('No hay sesión activa.', '#ff453a');
return;
}

// Verify current password against stored user password
const storedPass = currentUser.password || (currentUser.username === 'admin' ? getStoredAdminPassword() : '');
if (!currentPass || String(storedPass) !== String(currentPass)) {
showStatus('La contraseña actual es incorrecta.', '#ff453a');
return;
padding: 6px 14px;
border-radius: 20px;
font-size: 0.85rem;
font-weight: 800;
text-transform: uppercase;
letter-spacing: 0.5px;
margin-bottom: 10px;
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.health-status-excellent { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
.health-status-verygood { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
.health-status-good { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
.health-status-warning { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
.health-status-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

.health-hero-text {
font-size: 0.88rem;
color: var(--text-secondary);
line-height: 1.45;
margin-bottom: 10px;
}

.health-next-service {
background: rgba(255, 255, 255, 0.05);
border-left: 3px solid #38bdf8;
padding: 8px 12px;
border-radius: 6px;
font-size: 0.82rem;
color: var(--text-primary);
}

.health-confidence-banner {
background: rgba(15, 23, 42, 0.7);
border: 1px dashed rgba(148, 163, 184, 0.3);
border-radius: var(--radius-md);
padding: 12px 14px;
margin-top: 14px;
font-size: 0.82rem;
}

.health-confidence-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 6px;
}

.health-confidence-title {
font-weight: 700;
color: var(--text-primary);
display: flex;
align-items: center;
gap: 6px;
}

.health-confidence-tips {
margin-top: 6px;
color: #94a3b8;
font-size: 0.78rem;
line-height: 1.4;
}

.health-alerts-container {
margin-bottom: 16px;
}

.health-alert-item {
display: flex;
align-items: flex-start;
gap: 10px;
padding: 12px 14px;
border-radius: var(--radius-md);
margin-bottom: 8px;
font-size: 0.85rem;
line-height: 1.4;
}

.health-alert-danger { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
.health-alert-warning { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #fde047; }
.health-alert-info { background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; }
.health-alert-success { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; }

.health-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 14px;
margin-bottom: 20px;
}

.health-card {
background: var(--bg-card);
border: 1px solid var(--border-color);
border-radius: var(--radius-lg);
padding: 16px;
display: flex;
flex-direction: column;
justify-content: space-between;
transition: transform 0.2s ease, border-color 0.2s ease;
}

.health-card:hover {
border-color: rgba(56, 189, 248, 0.4);
transform: translateY(-2px);
}

.health-card-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 12px;
}

.health-card-title {
font-size: 0.95rem;
font-weight: 700;
color: var(--text-primary);
display: flex;
align-items: center;
gap: 8px;
}

.health-card-score {
font-size: 1rem;
font-weight: 800;
}

.health-card-progress {
width: 100%;
height: 8px;
background: rgba(255, 255, 255, 0.08);
border-radius: 4px;
overflow: hidden;
margin-bottom: 10px;
}

.health-card-progress-fill {
height: 100%;
border-radius: 4px;
transition: width 0.5s ease;
}

.health-card-details {
font-size: 0.8rem;
color: var(--text-secondary);
line-height: 1.4;
margin-bottom: 12px;
flex: 1;
}

.health-card-footer {
display: flex;
justify-content: space-between;
align-items: center;
border-top: 1px solid var(--border-color);
padding-top: 10px;
margin-top: 4px;
}

/* Logs List */
.log-list { display: flex; flex-direction: column; gap: 8px; }
appState.activeVehicleId = appState.vehicles[0].id;
}
}

async function initAsyncStorage() {
await SyncService.init();
await loadAppStateFromDB();

SyncService.onStateChanged(async () => {
await loadAppStateFromDB();

if (activeUserId) {
if (appState.vehicles && Array.isArray(appState.vehicles)) {
appState.vehicles.forEach(v => { if (v && !v.userId) v.userId = activeUserId; });
}
if (appState.documents && Array.isArray(appState.documents)) {
appState.documents.forEach(d => { if (d && !d.userId) d.userId = activeUserId; });
}
if (appState.reminders && Array.isArray(appState.reminders)) {
appState.reminders.forEach(r => { if (r && !r.userId) r.userId = activeUserId; });
}
if (appState.services && Array.isArray(appState.services)) {
appState.services.forEach(s => { if (s && !s.userId) s.userId = activeUserId; });
}
if (appState.fuels && Array.isArray(appState.fuels)) {
appState.fuels.forEach(f => { if (f && !f.userId) f.userId = activeUserId; });
}
}
}

function resetAllSwipeItems() {
document.querySelectorAll('.swipe-content').forEach(el => {
el.style.transform = 'translateX(0px)';
});
<option value="Auxilio">Auxilio / Grúa 24/7</option>
<option value="Taller">Taller Mecánico</option>
<option value="Seguro">Aseguradora</option>
<option value="Electromecánico">Electromecánico / Llantas</option>
<option value="Emergencia">Contacto de Emergencia</option>
</select>
</div>
<div class="form-group">
<label>Notas / Horarios (Opcional)</label>
<input type="text" id="contactNotes" class="form-control" placeholder="">
</div>
<div class="modal-footer">
<button type="button" class="btn btn-tertiary" onclick="closeModal('modalContact')">Cancelar</button>
<button type="submit" class="btn btn-primary">Guardar Contacto</button>
</div>
</form>
</div>
</div>


<script src="auth-service.js?v=613"></script>
<script src="db.js?v=613"></script>
<script src="sync-service.js?v=613"></script>
<script src="app.js?v=613"></script>
<script>
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('sw.js?v=613').catch(err => console.log('ServiceWorker error: ', err));
}
</script>
</body>
</html>
const container = document.getElementById('syncLogsContainer');
if (!container) return;

const logs = await SyncService.getLogs();
if (logs.length === 0) {
container.innerHTML = '<span style="color:#8e8e93;">Sin registros de sincronización aún.</span>';
return;
}

container.innerHTML = logs.map(l => {
let color = '#38bdf8';
if (l.type === 'error') color = '#ff453a';
if (l.type === 'success') color = '#30d158';
if (l.type === 'warn') color = '#ffd60a';

const timeStr = new Date(l.timestamp).toLocaleTimeString();
return `<div style="margin-bottom:4px;"><span style="color:#8e8e93;">[${timeStr}]</span> <span style="color:${color}; font-weight:700;">[${l.type.toUpperCase()}]</span> ${escapeHtml(l.message)}</div>`;
}).join('');
}

resolve(null);
}
}).catch(() => resolve(null));
});
}

async function loadAppStateFromDB() {
const activeUserId = currentUser && currentUser.id;
if (!activeUserId) {
appState.vehicles = []; appState.services = []; appState.fuels = [];
appState.documents = []; appState.reminders = []; appState.users = [];
return;
}
const belongsToActiveUser = item => item && (item.userId === activeUserId || !item.userId || item.userId === 'local_user') && !item.isDeleted;
appState.vehicles = (await LocalDB.getAll(STORES.VEHICLES)).filter(belongsToActiveUser);
appState.services = (await LocalDB.getAll(STORES.SERVICES)).filter(belongsToActiveUser);
appState.fuels = (await LocalDB.getAll(STORES.FUELS)).filter(belongsToActiveUser);
appState.documents = (await LocalDB.getAll(STORES.DOCUMENTS)).filter(belongsToActiveUser);
appState.reminders = (await LocalDB.getAll(STORES.REMINDERS)).filter(belongsToActiveUser);
appState.users = (await LocalDB.getAll(STORES.USERS)).filter(item => item && item.id === activeUserId && !item.isDeleted);

// Restore cached emergency contacts for active user
try {
const key = getUserStorageKey(currentUser);
const saved = localStorage.getItem(key);
if (saved) {
const parsed = JSON.parse(saved);
if (parsed && Array.isArray(parsed.emergencyContacts)) {
appState.emergencyContacts = parsed.emergencyContacts;
</div>
<div class="form-group">
<label>Categoría</label>
<select id="contactCategory" class="form-control">
<option value="Auxilio">Auxilio / Grúa 24/7</option>
<option value="Taller">Taller Mecánico</option>
<option value="Seguro">Aseguradora</option>
<option value="Electromecánico">Electromecánico / Llantas</option>
<option value="Emergencia">Contacto de Emergencia</option>
</select>
</div>
<div class="form-group">
<label>Notas / Horarios (Opcional)</label>
<input type="text" id="contactNotes" class="form-control" placeholder="">
</div>
<div class="modal-footer">
<button type="button" class="btn btn-tertiary" onclick="closeModal('modalContact')">Cancelar</button>
<button type="submit" class="btn btn-primary">Guardar Contacto</button>
</div>
</form>
</div>
</div>


<script src="auth-service.js?v=613"></script>
<script src="db.js?v=613"></script>
<script src="sync-service.js?v=613"></script>
<script src="app.js?v=613"></script>
<script>
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('sw.js?v=613').catch(err => console.log('ServiceWorker error: ', err));
}
</script>
</body>
</html>

</div>
<div class="health-card-footer">
<span style="font-size:0.75rem; color:var(--text-secondary);">Reportes</span>
<button class="btn btn-secondary btn-sm" onclick="switchTab('tabReports')" style="font-size:0.75rem; padding:4px 10px;">Ver historial</button>
</div>
</div>
</div>
`;
}

function renderMiniVehiclesList() {
const container = document.getElementById('allVehiclesList');
if (!container) return;

if (appState.vehicles.length === 0) {
container.innerHTML = '<p class="subtitle">No hay vehículos registrados.</p>';
return;
}

container.innerHTML = appState.vehicles.map(v => `


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

function autoOptimizeStorageImagesSilent() {
const compressDataUrl = (dataUrl, maxDim = 500, quality = 0.5, callback) => {
if (!dataUrl || !dataUrl.startsWith('data:image')) return callback(dataUrl);
let barColor = '#38bdf8';
if (percent > 70) barColor = '#ffd60a';
if (percent > 90) barColor = '#ff453a';

const totalPhotos = (appState.services || []).filter(s => s.receipt).length +
(appState.documents || []).filter(d => d.file).length +
(appState.vehicles || []).filter(v => v.photo).length;

container.innerHTML = `
</form>
</div>
</div>

<!-- Modal: Sync Diagnostic Logs -->
<div id="modalSyncLogs" class="modal-backdrop">
<div class="modal-card" style="max-width:600px;">
<div class="modal-header">
<h3>Historial de Sincronización (Sync Log)</h3>
<button class="close-btn" onclick="closeModal('modalSyncLogs')">✕</button>
</div>
<div id="syncLogsContainer" style="max-height:350px; overflow-y:auto; background:rgba(0,0,0,0.4); padding:12px; border-radius:10px; font-family:monospace; font-size:0.78rem; line-height:1.4;">
<!-- Dynamic logs -->
</div>
<div class="modal-footer" style="margin-top:12px;">
<button type="button" class="btn btn-secondary btn-sm" onclick="renderSyncLogsUI()">🔄 Actualizar</button>
<button type="button" class="btn btn-tertiary btn-sm" onclick="closeModal('modalSyncLogs')">Cerrar</button>
</div>
</div>
</div>
if (document.getElementById('fuelDate')) document.getElementById('fuelDate').value = todayStr;
}

function getActiveVehicle() {
return appState.vehicles.find(v => v.id === appState.activeVehicleId) || appState.vehicles[0];
}

function switchTab(tabId, el) {
if (currentUser && currentUser.role !== 'admin' && currentUser.permissions) {
if (currentUser.permissions[tabId] === false) {
alert('No tienes permisos asignados para acceder a este módulo.');
if (tabId !== 'tabGarage') {
switchTab('tabGarage');
}
return;
}
}

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
'tabAI': 4,
'tabReports': 5
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
saveStateToIDB(appState);
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
const heroEl = document.getElementById('activeVehicleHero');
if (!heroEl) return;

const veh = getActiveVehicle();
if (!veh) {
heroEl.innerHTML = `
<div style="text-align:center; padding:20px;">
<h3>No tienes vehículos registrados</h3>
<p class="subtitle" style="margin-bottom:12px;">Agrega tu primer auto para comenzar</p>
<button class="btn btn-primary" onclick="openVehicleModal()">+ Agregar Vehículo</button>
</div>
`;
renderServiceList('');
renderFuelList('');
return;
}

heroEl.innerHTML = `
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
}

// Direct Deletion Functions
async function deleteVehicleDirect(vehId) {
if (!vehId) return;
const servicesToDelete = (appState.services || []).filter(s => s.vehicleId === vehId);
const fuelsToDelete = (appState.fuels || []).filter(f => f.vehicleId === vehId);
const documentsToDelete = (appState.documents || []).filter(d => d.vehicleId === vehId);
const remindersToDelete = (appState.reminders || []).filter(r => r.vehicleId === vehId);

await SyncService.executeCrud('DELETE', STORES.VEHICLES, { id: vehId });

for (const s of servicesToDelete) {
await SyncService.executeCrud('DELETE', STORES.SERVICES, { id: s.id });
}
for (const f of fuelsToDelete) {
await SyncService.executeCrud('DELETE', STORES.FUELS, { id: f.id });
}
for (const d of documentsToDelete) {
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: d.id });
}
for (const r of remindersToDelete) {
await SyncService.executeCrud('DELETE', STORES.REMINDERS, { id: r.id });
}

if (appState.activeVehicleId === vehId) {
const remaining = await LocalDB.getAll(STORES.VEHICLES);
appState.activeVehicleId = remaining.length > 0 ? remaining[0].id : '';
}

await loadAppStateFromDB();
renderApp();
}

async function deleteServiceDirect(servId) {
if (!servId) return;
await SyncService.executeCrud('DELETE', STORES.SERVICES, { id: servId });
await loadAppStateFromDB();
renderApp();
}

async function deleteFuelDirect(fuelId) {
if (!fuelId) return;
await SyncService.executeCrud('DELETE', STORES.FUELS, { id: fuelId });
await loadAppStateFromDB();
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
.rem-checkbox svg {
width: 16px;
height: 16px;
stroke-width: 3;
}

/* AI Quick Prompt Chips */
.ai-chip {
background: var(--bg-secondary) !important;
border: 1px solid var(--border-color) !important;
color: var(--text-primary) !important;
border-radius: 16px !important;
font-size: 0.78rem !important;
padding: 5px 12px !important;
white-space: nowrap;
}

.ai-chip:hover, .ai-chip:active {
border-color: #0a84ff !important;
color: #0a84ff !important;
}

/* Rich Response Box Styling */
.ai-response-box {
background: rgba(15, 23, 42, 0.8);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: var(--radius-md);
padding: 14px;
margin-top: 14px;
font-size: 0.88rem;
line-height: 1.5;
color: #e2e8f0;
}

.ai-response-box p {
margin-bottom: 8px;
}

.ai-response-box strong {
color: #ffffff;
}

/* Switch Toggle Styles */
.switch {
position: relative;
display: inline-block;
width: 48px;
height: 28px;
flex-shrink: 0;
}

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
async function deleteVehicleDirect(vehId, event = null) {
if (event) {
try {
event.preventDefault();
event.stopPropagation();
} catch (e) { }
}
if (!vehId) return;

if (!confirm('¿Estás seguro de que deseas eliminar este vehículo y todos sus datos asociados?')) {
return;
}

const targetIdStr = String(vehId);

const servicesToDelete = (appState.services || []).filter(s => String(s.vehicleId) === targetIdStr);
const fuelsToDelete = (appState.fuels || []).filter(f => String(f.vehicleId) === targetIdStr);
const documentsToDelete = (appState.documents || []).filter(d => String(d.vehicleId) === targetIdStr);
const remindersToDelete = (appState.reminders || []).filter(r => String(r.vehicleId) === targetIdStr);

appState.vehicles = (appState.vehicles || []).filter(v => String(v.id) !== targetIdStr);
appState.services = (appState.services || []).filter(s => String(s.vehicleId) !== targetIdStr);
appState.fuels = (appState.fuels || []).filter(f => String(f.vehicleId) !== targetIdStr);
appState.documents = (appState.documents || []).filter(d => String(d.vehicleId) !== targetIdStr);
appState.reminders = (appState.reminders || []).filter(r => String(r.vehicleId) !== targetIdStr);
saveState();

await LocalDB.delete(STORES.VEHICLES, vehId);
await LocalDB.delete(STORES.VEHICLES, targetIdStr);
await SyncService.executeCrud('DELETE', STORES.VEHICLES, { id: vehId });

for (const s of servicesToDelete) {
await LocalDB.delete(STORES.SERVICES, s.id);
await SyncService.executeCrud('DELETE', STORES.SERVICES, { id: s.id });
}
for (const f of fuelsToDelete) {
await LocalDB.delete(STORES.FUELS, f.id);
await SyncService.executeCrud('DELETE', STORES.FUELS, { id: f.id });
}
for (const d of documentsToDelete) {
await LocalDB.delete(STORES.DOCUMENTS, d.id);
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: d.id });
}
for (const r of remindersToDelete) {
await LocalDB.delete(STORES.REMINDERS, r.id);
await SyncService.executeCrud('DELETE', STORES.REMINDERS, { id: r.id });
}

if (String(appState.activeVehicleId) === targetIdStr) {
appState.activeVehicleId = appState.vehicles.length > 0 ? appState.vehicles[0].id : '';
}
saveState();

await loadAppStateFromDB();
appState.documents = (appState.documents || []).filter(d => String(d.vehicleId) !== targetIdStr);
appState.reminders = (appState.reminders || []).filter(r => String(r.vehicleId) !== targetIdStr);
saveState();

await LocalDB.delete(STORES.VEHICLES, vehId);
await LocalDB.delete(STORES.VEHICLES, targetIdStr);
await SyncService.executeCrud('DELETE', STORES.VEHICLES, { id: vehId });

for (const s of servicesToDelete) {
await LocalDB.delete(STORES.SERVICES, s.id);
await SyncService.executeCrud('DELETE', STORES.SERVICES, { id: s.id });
}
for (const f of fuelsToDelete) {
await LocalDB.delete(STORES.FUELS, f.id);
await SyncService.executeCrud('DELETE', STORES.FUELS, { id: f.id });
}
for (const d of documentsToDelete) {
await LocalDB.delete(STORES.DOCUMENTS, d.id);
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: d.id });
}
for (const r of remindersToDelete) {
await LocalDB.delete(STORES.REMINDERS, r.id);
await SyncService.executeCrud('DELETE', STORES.REMINDERS, { id: r.id });
}
background: #30d158;
border-color: #30d158;
color: #ffffff;
box-shadow: 0 0 10px rgba(48, 209, 88, 0.4);
}

.rem-checkbox svg {
width: 16px;
height: 16px;
stroke-width: 3;
}

/* AI Quick Prompt Chips */
.ai-chip {
background: var(--bg-secondary) !important;
border: 1px solid var(--border-color) !important;
color: var(--text-primary) !important;
border-radius: 16px !important;
font-size: 0.78rem !important;
padding: 5px 12px !important;
white-space: nowrap;
}

.ai-chip:hover, .ai-chip:active {
border-color: #0a84ff !important;
color: #0a84ff !important;
}

/* Rich Response Box Styling */
.ai-response-box {
background: rgba(15, 23, 42, 0.8);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: var(--radius-md);
padding: 14px;
margin-top: 14px;
font-size: 0.88rem;
line-height: 1.5;
color: #e2e8f0;
}

.ai-response-box p {
margin-bottom: 8px;
}

.ai-response-box strong {
color: #ffffff;
}

/* Switch Toggle Styles */
.switch {
position: relative;
renderUserReminders();
renderRemindersTab();
}

async function deleteReminderDirect(remId) {
if (!remId) return;
await SyncService.executeCrud('DELETE', STORES.REMINDERS, { id: remId });
await loadAppStateFromDB();
renderUserReminders();
renderRemindersTab();
}

// Emergency Contacts & Important Phone Numbers Engine
function renderEmergencyContacts() {
const container = document.getElementById('emergencyContactsList');
if (!container) return;

const contacts = appState.emergencyContacts || [];
if (contacts.length === 0) {
container.innerHTML = `<p class="subtitle" style="text-align:center; color:rgba(255,255,255,0.7); width:100%; grid-column: 1 / -1;">No hay números guardados.<br>Toca •"+ Guardar Número" para registrar tus talleres, grúa o seguro.</p>`;
return;
}

container.innerHTML = contacts.map(c => `
<div class="swipe-container">
<div class="swipe-action-bg">
<button class="swipe-action-btn" onclick="deleteEmergencyContactDirect('${c.id}')">
${SVG_ICONS.trash}
<span>${t('deleteBtn', 'Eliminar')}</span>
document.getElementById('formReminder').reset();
renderUserReminders();
renderRemindersTab();
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
container.innerHTML = `<p class="subtitle" style="text-align:center; padding:20px;">No has agregado ningún documento a la Guantera Digital.<br>Toca •"+ Documento" para registrar tu Póliza, RTV o Licencia.</p>`;
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
<button type="button" class="swipe-action-btn" onclick="deleteDocumentDirect('${d.id}', event)">
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

async function deleteDocumentDirect(docId) {
if (!docId) return;
if (confirm('¿Eliminar este documento de la Guantera?')) {
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: docId });
await loadAppStateFromDB();
renderApp();
}
}

function viewDocumentFile(docId) {
const doc = (appState.documents || []).find(d => d.id === docId);
if (doc && doc.file) {
document.getElementById('receiptContainer').innerHTML = `
<img src="${doc.file}" alt="Documento ${escapeHtml(doc.title)}">
vehicleId: veh.id,
title, category, targetKm, targetDate, time, repeat, notes,
status: 'pending',
createdAt: new Date().toISOString()
};
appState.reminders = appState.reminders || [];
appState.reminders.push(targetRem);
await SyncService.executeCrud('CREATE', STORES.REMINDERS, targetRem);
}
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
await loadAppStateFromDB();
renderUserReminders();
renderRemindersTab();
}

// Emergency Contacts & Important Phone Numbers Engine
function getEmergencyContactsFromDocs() {
const docs = appState.documents || [];
return docs
.filter(d => d && (d.type === 'contact' || d.phone) && !d.isDeleted)
.map(d => ({
id: d.id,
name: d.title || 'Contacto',
phone: d.phone || '',
category: d.category || 'Auxilio',
notes: d.notes || ''
}));
}

renderUserReminders();
renderRemindersTab();
}

// Emergency Contacts & Important Phone Numbers Engine
function getEmergencyContactsFromDocs() {
const docs = appState.documents || [];
return docs
.filter(d => d && (d.type === 'contact' || d.phone) && !d.isDeleted)
.map(d => ({
id: d.id,
name: d.title || 'Contacto',
phone: d.phone || '',
category: d.category || 'Auxilio',
notes: d.notes || ''
}));
}

function renderEmergencyContacts() {
const container = document.getElementById('emergencyContactsList');
if (!container) return;

const contacts = getEmergencyContactsFromDocs();
appState.emergencyContacts = contacts;

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
const contacts = getEmergencyContactsFromDocs();
const c = contacts.find(item => item.id === contactId);
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

async function saveEmergencyContact(e) {
e.preventDefault();
const contactId = document.getElementById('contactId').value;
const name = document.getElementById('contactName').value.trim();
const phone = document.getElementById('contactPhone').value.trim();
const category = document.getElementById('contactCategory').value;
const notes = document.getElementById('contactNotes') ? document.getElementById('contactNotes').value.trim() : '';

if (!name || !phone) return;

const veh = getActiveVehicle();
const vehicleId = veh ? veh.id : null;

if (contactId) {
let existingDoc = (appState.documents || []).find(d => d.id === contactId);
if (existingDoc) {
existingDoc.title = name;
existingDoc.phone = phone;
existingDoc.category = category;
existingDoc.notes = notes;
existingDoc.updatedAt = new Date().toISOString();
await SyncService.executeCrud('UPDATE', STORES.DOCUMENTS, existingDoc);
}
} else {
const newDoc = {
id: LocalDB.generateUUID(),
vehicleId: vehicleId,
type: 'contact',
category: category || 'Auxilio',
title: name,
phone: phone,
notes: notes,
expDate: new Date().toISOString().split('T')[0],
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString()
};
await SyncService.executeCrud('CREATE', STORES.DOCUMENTS, newDoc);
}

saveState();
closeModal('modalContact');
document.getElementById('formContact').reset();
await loadAppStateFromDB();
renderEmergencyContacts();
renderGuantera();
}

async function deleteEmergencyContactDirect(contactId) {
if (!confirm('¿Eliminar este contacto de la Guantera?')) return;
const targetIdStr = String(contactId);
appState.documents = (appState.documents || []).filter(item => String(item.id) !== targetIdStr);
saveState();
await LocalDB.delete(STORES.DOCUMENTS, contactId);
await LocalDB.delete(STORES.DOCUMENTS, targetIdStr);
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: contactId });
await loadAppStateFromDB();
renderEmergencyContacts();
renderGuantera();
}

function callContact(phone) {
if (!phone) return;
const cleanPhone = phone.replace(/[^0-9+]/g, '');
window.location.href = `tel:${cleanPhone}`;
}

// Render Dynamic Filter Pills for Maintenance Tab

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

function renderCustomCategoriesList() {
const container = document.getElementById('customCategoriesListContainer');
if (!container) return;

const cats = SERVICE_CATEGORIES || [];
container.innerHTML = cats.map(cat => `
<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:8px; font-size:0.83rem; border:1px solid rgba(255,255,255,0.08);">
<span style="color:#ffffff; font-weight:600;">${escapeHtml(cat)}</span>
<div style="display:flex; gap:4px;">
<button type="button" class="btn btn-secondary btn-sm" style="font-size:0.7rem; padding:2px 6px;" onclick="editCategoryName('${escapeHtml(cat)}')">Editar</button>
<button type="button" class="btn btn-tertiary btn-sm" style="font-size:0.7rem; padding:2px 6px; color:#ff453a;" onclick="deleteCategory('${escapeHtml(cat)}')">Eliminar</button>
</div>
</div>
`).join('');
}

function editCategoryName(oldName) {
const newName = prompt('Ingresa el nuevo nombre para este servicio:', oldName);
if (!newName || !newName.trim() || newName.trim() === oldName) return;

const idx = SERVICE_CATEGORIES.indexOf(oldName);
if (idx !== -1) {
SERVICE_CATEGORIES[idx] = newName.trim();
}

(appState.services || []).forEach(s => {
if (s.category === oldName) s.category = newName.trim();
});

saveState();
populateServCategorySelect();
renderMaintenanceFilterPills();
renderCustomCategoriesList();
}

function deleteCategory(catName) {
if (SERVICE_CATEGORIES.length <= 1) {
alert('Debe existir al menos una categoría de servicio.');
return;
}
if (!confirm(`¿Eliminar el servicio "${catName}"?`)) return;

const idx = SERVICE_CATEGORIES.indexOf(catName);
if (idx !== -1) {
SERVICE_CATEGORIES.splice(idx, 1);
}

saveState();
populateServCategorySelect();
renderMaintenanceFilterPills();
renderCustomCategoriesList();
• <strong>Próximo Cambio de Aceite Sintético:</strong> Estimado a los <strong style="color:#ffffff;">${nextOilKm.toLocaleString()} KM</strong> (${Math.max(100, nextOilKm - veh.km).toLocaleString()} km restantes).<br>
• <strong>Revisión del Sistema de Frenos:</strong> Inspección recomendada de pastillas y discos en <strong style="color:#ffffff;">3 meses</strong>.<br>
• <strong>Correa / Cadena de Distribución:</strong> Sustitución o revisión preventiva programada hacia los <strong style="color:#ffffff;">${nextTimingBeltKm.toLocaleString()} KM</strong>.
</div>
</div>

<!-- Customized IA Recommendations Box -->
<div class="ai-item-row" style="margin-bottom:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:10px 12px; border-radius:10px;">
<div class="ai-item-title" style="font-weight:700; color:#ffffff; font-size:0.88rem; margin-bottom:4px;">
alert('Debe existir al menos una categoría de servicio.');
return;
}
if (!confirm(`¿Eliminar el servicio "${catName}"?`)) return;

const idx = SERVICE_CATEGORIES.indexOf(catName);
if (idx !== -1) {
SERVICE_CATEGORIES.splice(idx, 1);
}

saveState();
populateServCategorySelect();
renderMaintenanceFilterPills();
renderCustomCategoriesList();
}

// Save New Custom Category
function saveNewCategory(e) {
e.preventDefault();
const name = document.getElementById('newCatName').value.trim();
if (!name) return;

if (!SERVICE_CATEGORIES.includes(name)) {
SERVICE_CATEGORIES.push(name);
}

saveState();
closeModal('modalNewCategory');
document.getElementById('formNewCategory').reset();

populateServCategorySelect();
renderMaintenanceFilterPills();
renderCustomCategoriesList();
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

const docs = (appState.documents || []).filter(d => String(d.vehicleId) === String(veh.id) && d.type !== 'contact' && !d.isDeleted);

if (docs.length === 0) {
container.innerHTML = `<p class="subtitle" style="text-align:center; padding:20px;">No has agregado ningún documento a la Guantera Digital.<br>Toca •"+ Documento" para registrar tu Póliza, RTV o Licencia.</p>`;
return;
}

docs.sort((a, b) => new Date(a.expDate) - new Date(b.expDate));

const today = new Date().toISOString().split('T')[0];

container.innerHTML = docs.map(d => {
<div class="log-icon-badge">${SVG_ICONS.document}</div>
<div>
<div class="log-title">${escapeHtml(d.title)}</div>
<div class="log-meta">Vence: <strong>${d.expDate || d.expirationDate || ''}</strong> ${d.phone ? '• Tel: ' + escapeHtml(d.phone) : ''}</div>
${d.notes ? `<div class="log-meta" style="font-style:italic;">Nota: ${escapeHtml(d.notes)}</div>` : ''}
</div>
</div>
<div class="log-item-side" style="display:flex; flex-direction:column; align-items:flex-end; justify-content:center; gap:4px; flex-shrink:0; min-width:max-content; text-align:right;">
<span class="badge-subtle ${badgeClass}" style="white-space:nowrap; font-weight:700;">${statusText}</span>
${d.file ? `<button class="btn btn-secondary btn-sm" style="margin-top:4px; padding:2px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); viewDocumentFile('${d.id}')">Ver Adjunto</button>` : ''}
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
const title = document.getElementById('docTitle').value.trim();
const expDate = document.getElementById('docExpDate').value;
const phone = document.getElementById('docPhone').value.trim();
const notes = document.getElementById('docNotes') ? document.getElementById('docNotes').value.trim() : '';
const fileInput = document.getElementById('docFile');

if (!title || !expDate) {
alert('Por favor completa los campos requeridos (Título y Fecha de Vencimiento).');
return;
}

let targetDoc = docId ? (appState.documents || []).find(d => d.id === docId) : null;

const processAndSave = async (fileBase64) => {
if (targetDoc) {
targetDoc.type = type;
targetDoc.title = title;
targetDoc.expDate = expDate;
targetDoc.phone = phone;
targetDoc.notes = notes;
if (fileBase64) targetDoc.file = fileBase64;
targetDoc.updatedAt = new Date().toISOString();
await SyncService.executeCrud('UPDATE', STORES.DOCUMENTS, targetDoc);
} else {
const newDoc = {
id: LocalDB.generateUUID(),
vehicleId: veh.id,
type, title, expDate, phone, notes, file: fileBase64 || '',
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString()
};
appState.documents = appState.documents || [];
appState.documents.push(newDoc);
await SyncService.executeCrud('CREATE', STORES.DOCUMENTS, newDoc);
}

saveState();
closeModal('modalDocument');
document.getElementById('formDocument').reset();
await loadAppStateFromDB();
renderGuantera();
renderApp();
};

if (fileInput && fileInput.files && fileInput.files[0]) {
readAndCompressImage(fileInput.files[0], processAndSave);
} else {
processAndSave('');
}
}

async function deleteDocumentDirect(docId, event = null) {
if (event) {
try {
event.preventDefault();
event.stopPropagation();
} catch (e) { }
}
if (!docId) return;
if (confirm('¿Eliminar este documento de la Guantera?')) {
const targetIdStr = String(docId);
appState.documents = (appState.documents || []).filter(item => String(item.id) !== targetIdStr);
saveState();
await LocalDB.delete(STORES.DOCUMENTS, docId);
await LocalDB.delete(STORES.DOCUMENTS, targetIdStr);
await SyncService.executeCrud('DELETE', STORES.DOCUMENTS, { id: docId });
await loadAppStateFromDB();
renderGuantera();
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
`;
openModal('modalReceiptViewer');
}
}

function renderAiSettingsInputs() {
const modeSelect = document.getElementById('aiEngineModeSelect');
const groqInput = document.getElementById('groqApiKeyInput');
const geminiInput = document.getElementById('geminiApiKeyInput');

let mode = appState.aiEngineMode || 'gemini_key';
if (mode !== 'gemini_key' && mode !== 'groq_key') mode = 'gemini_key';
appState.aiEngineMode = mode;

if (modeSelect) modeSelect.value = mode;
if (groqInput) groqInput.value = appState.groqApiKey || '';
if (geminiInput) geminiInput.value = appState.geminiApiKey || '';

onAiEngineModeChange(mode);
}

// AI Mechanical Diagnostic & Prediction Engine
function renderAIDiagnostic() {
renderAiSettingsInputs();

const statusBanner = document.getElementById('aiConnectionStatusBanner');
if (statusBanner) {
statusBanner.innerHTML = '';
statusBanner.style.display = 'none';
}

const container = document.getElementById('aiDiagnosticCard');
if (!container) return;

const veh = getActiveVehicle();
if (!veh) {
container.innerHTML = '<p class="subtitle" style="text-align:center; padding:12px;">Agrega tu primer vehículo en la pestaña Garaje para generar un diagnóstico inteligente de salud vehicular y recomendaciones de IA.</p>';
return;
}

const services = appState.services.filter(s => s.vehicleId === veh.id);
return {
...DEFAULT_HEALTH_SETTINGS,
...parsed,
weights: { ...DEFAULT_HEALTH_SETTINGS.weights, ...(parsed.weights || {}) }
};
}
} catch (e) {}
appState.healthSettings = DEFAULT_HEALTH_SETTINGS;
return DEFAULT_HEALTH_SETTINGS;
}

function openHealthSettingsModal() {
const cfg = getHealthSettings();

const elOil = document.getElementById('hsOilKm');
const elTires = document.getElementById('hsTiresKm');
const elPads = document.getElementById('hsBrakePadsKm');
const elDiscs = document.getElementById('hsBrakeDiscsKm');
const elBat = document.getElementById('hsBatteryMonths');
const elFilt = document.getElementById('hsFiltersKm');

container.innerHTML = `
<div class="ai-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
<div>
<h3 style="margin:0; font-size:1.05rem; display:flex; align-items:center; gap:6px;">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
Diagnóstico y Predicción IA - ${escapeHtml(veh.name)}
</h3>
<span style="font-size:0.78rem; color:var(--text-secondary);">${veh.year} • ${escapeHtml(veh.plate || 'Sin Placa')} • ${(Number(veh.km) || 0).toLocaleString()} KM</span>
</div>
<span class="badge-subtle ${healthBadgeClass}" style="font-size:0.78rem; font-weight:700;">${healthScore}% ${healthStatusText}</span>
</div>

<div style="background:rgba(255,255,255,0.06); padding:10px 12px; border-radius:10px; margin-bottom:12px;">
<div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#cbd5e1; margin-bottom:6px;">
<span>Índice de Salud y Conservación Vehicular</span>
<strong style="color:#38bdf8;">${healthScore} / 100 PTS</strong>
</div>
<div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
<div style="width:${healthScore}%; height:100%; background:${healthScore >= 85 ? '#30d158' : healthScore >= 70 ? '#ffd60a' : '#ff453a'}; border-radius:4px;"></div>
</div>
</div>

<div class="ai-item-row" style="margin-bottom:10px; background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.2); padding:10px 12px; border-radius:10px;">
<div class="ai-item-title" style="font-weight:700; color:#38bdf8; font-size:0.88rem; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
Predicción Inteligente de Mantenimientos Futuros
</div>
<div class="ai-item-body" style="font-size:0.83rem; color:#cbd5e1; line-height:1.4;">
• <strong>Próximo Cambio de Aceite Sintético:</strong> Estimado a los <strong style="color:#ffffff;">${nextOilKm.toLocaleString()} KM</strong> (${Math.max(100, nextOilKm - veh.km).toLocaleString()} km restantes).<br>
if (userChats.length === 0) {
container.innerHTML = '<p class="subtitle" style="font-size:0.8rem; margin:4px 0; text-align:center;">No tienes conversaciones anteriores guardadas.</p>';
return;
}

const recent = userChats.slice(0, 10);

container.innerHTML = recent.map(chat => {
const isActive = chat.id === currentActiveAiChatId;
const msgCount = (chat.messages || []).length;
const dateStr = (chat.updatedAt || chat.createdAt || '').split('T')[0];

return `
<div style="display:flex; justify-content:space-between; align-items:center; background:${isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${isActive ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}; padding:8px 12px; border-radius:8px;">
<div style="cursor:pointer; flex:1; overflow:hidden;" onclick="loadAiChat('${chat.id}')">
<strong style="font-size:0.85rem; color:${isActive ? '#38bdf8' : '#ffffff'}; display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(chat.title || 'Consulta de IA')}</strong>
<span style="font-size:0.75rem; color:var(--text-secondary);">${dateStr} • ${msgCount} mensaje(s)</span>
</div>
<button type="button" class="btn btn-tertiary btn-sm" style="color:#ff453a; font-size:0.75rem; padding:2px 6px;" onclick="deleteAiChat('${chat.id}', event)">Eliminar</button>
}

const allChats = await LocalDB.getAll(STORES.AI_CHATS);
const userChats = (allChats || [])
.filter(c => c && c.userId === currentUser.id && !c.isDeleted)
.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

if (userChats.length === 0) {
container.innerHTML = '<p class="subtitle" style="font-size:0.8rem; margin:4px 0; text-align:center;">No tienes conversaciones anteriores guardadas.</p>';
return;
closeModal('modalHealthSettings');
renderVehicleHealth();
}

function navigateToHealthHistory(targetTab, filterKeyword) {
switchTab(targetTab);
if (targetTab === 'tabMaintenance' && filterKeyword) {
const input = document.getElementById('maintenanceSearchInput');
if (input) {
input.value = filterKeyword;
if (typeof renderMaintenanceList === 'function') renderMaintenanceList();
}
}
}

function calculateMonthsDiff(d1Str, d2Str) {
if (!d1Str) return 0;
const d1 = new Date(d1Str);
const d2 = d2Str ? new Date(d2Str) : new Date();
if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
return Math.max(0, months);
}

function calculateDaysDiff(d1Str) {
if (!d1Str) return 999;
const target = new Date(d1Str);
const today = new Date();
today.setHours(0,0,0,0);
target.setHours(0,0,0,0);
const diffTime = target.getTime() - today.getTime();
return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateVehicleHealth(veh) {
const cfg = getHealthSettings();
if (!veh) return null;

const currentKm = Number(veh.km || 0);
const services = (appState.services || []).filter(s => s.vehicleId === veh.id);
const documents = (appState.documents || []).filter(d => d.vehicleId === veh.id);
const reminders = (appState.reminders || []).filter(r => r.vehicleId === veh.id);
const fuels = (appState.fuels || []).filter(f => f.vehicleId === veh.id);

const missingList = [];
let evaluatedWeightSum = 0;
let weightedHealthSum = 0;

// 1. Aceite
const oilServices = services.filter(s => 
(s.category && s.category.toLowerCase() === 'aceite') ||
(s.title && s.title.toLowerCase().includes('aceite')) ||
(s.description && s.description.toLowerCase().includes('aceite'))
).sort((a, b) => new Date(b.date) - new Date(a.date));

let oilData = { hasData: false, score: 100, remainingKm: cfg.oilKm, detail: 'Sin historial registrado', alert: null };
if (oilServices.length > 0) {
const lastOil = oilServices[0];
const lastKm = Number(lastOil.mileage || lastOil.km || currentKm);
const interval = Number(lastOil.nextKm || (lastKm + cfg.oilKm)) - lastKm;
const effInterval = interval > 0 ? interval : cfg.oilKm;
const kmUsed = Math.max(0, currentKm - lastKm);
const remKm = Math.max(0, effInterval - kmUsed);
const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / effInterval) * 100)));

oilData = {
hasData: true,
score: score,
remainingKm: remKm,
usedKm: kmUsed,
interval: effInterval,
lastDate: lastOil.date,
oilType: lastOil.title || 'Aceite de motor',
detail: `Restan ${remKm.toLocaleString()} km`
};
    if (remKm <= 1000) {
      oilData.alert = `Próximo cambio de aceite en ${remKm.toLocaleString()} km.`;
    }
  } else {
    missingItems.push({ name: 'Último cambio de aceite', key: 'aceite' });
  }

  // 2. Llantas
  const tireServices = services.filter(s =>
    (s.category && (s.category.toLowerCase() === 'llantas' || s.category.toLowerCase() === 'neumaticos')) ||
    (s.title && (s.title.toLowerCase().includes('llanta') || s.title.toLowerCase().includes('neumatic'))) ||
    (s.description && s.description.toLowerCase().includes('llanta'))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let tireData = { hasData: false, score: 0, categoryKey: 'llantas', remainingKm: cfg.tiresKm, detail: 'Sin historial de llantas', alert: null };
  if (tireServices.length > 0) {
    const lastTire = tireServices[0];
    const lastKm = Number(lastTire.mileage || lastTire.km || currentKm);
    const lifespan = cfg.tiresKm;
    const kmUsed = Math.max(0, currentKm - lastKm);
    const remKm = Math.max(0, lifespan - kmUsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / lifespan) * 100)));
    const condText = score >= 60 ? 'Buenas condiciones' : (score >= 30 ? 'Desgaste moderado' : 'Reemplazo cercano');

    tireData = {
      hasData: true,
      score: score,
      categoryKey: 'llantas',
      remainingKm: remKm,
      usedKm: kmUsed,
      condition: condText,
      detail: `${condText} • Restan ${remKm.toLocaleString()} km`
    };
    if (score < 25) {
      tireData.alert = `La vida útil de llantas es inferior al 25% (restan ${remKm.toLocaleString()} km).`;
    }
  } else {
    missingItems.push({ name: 'Cambio de llantas', key: 'llantas' });
  }

// 3. Frenos
const brakeServices = services.filter(s =>
(s.category && s.category.toLowerCase() === 'frenos') ||
(s.title && (s.title.toLowerCase().includes('freno') || s.title.toLowerCase().includes('pastilla') || s.title.toLowerCase().includes('disco'))) ||
(s.description && s.description.toLowerCase().includes('freno'))
).sort((a, b) => new Date(b.date) - new Date(a.date));

responseBox.innerHTML = '';
}
if (input) input.value = '';
if (input) input.focus();
renderAiChatHistory();
}

function continueAiChat(event) {
if (event) event.preventDefault();
const input = document.getElementById('aiContinuationQuestion');
const question = input ? input.value.trim() : '';
if (question) askAIAssistantDirect(question);
}

async function deleteAiChat(chatId, e) {
if (e) e.stopPropagation();
if (!chatId) return;
if (confirm('¿Deseas borrar esta conversación de tu historial?')) {
const targetIdStr = String(chatId);
await LocalDB.delete(STORES.AI_CHATS, chatId);
await LocalDB.delete(STORES.AI_CHATS, targetIdStr);
await SyncService.executeCrud('DELETE', STORES.AI_CHATS, { id: chatId });
if (String(currentActiveAiChatId) === targetIdStr) {
startNewAiChat();
} else {
renderAiChatHistory();
}
}
}

function askQuickPrompt(promptText) {
const input = document.getElementById('aiUserQuestion');
if (input) {
input.value = promptText;
askAIAssistantDirect(promptText);

const promptText = `Eres el Asistente Técnico, Mecánico Experto e Inteligencia Artificial Principal de GarageOne.
Información del Vehículo Actual: ${vehContext}
Mantenimientos Recientes: ${recentServicesText}
Recordatorios: ${pendingRemindersText}
Consulta: "${question}"`;

let responseText = '';
let isLive = false;
const activeChatForContext = currentActiveAiChatId ? await LocalDB.get(STORES.AI_CHATS, currentActiveAiChatId) : null;
const conversationContext = activeChatForContext && Array.isArray(activeChatForContext.messages)
? activeChatForContext.messages.slice(-8).map(message => `${message.role === 'user' ? 'Usuario' : 'Asistente'}: ${message.content}`).join('\
: '';
const enhancedPromptText = conversationContext ? `${promptText}\

const mode = appState.aiEngineMode || 'gemini_key';
const activeKey = (mode === 'gemini_key') ? appState.geminiApiKey : appState.groqApiKey;

if (activeKey && activeKey.trim().length > 5) {
const aiRes = await executeAiQuery(enhancedPromptText, question);
if (aiRes.success) {
isLive = true;
const liveBadge = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(48,209,88,0.15); color:#30d158; border:1px solid rgba(48,209,88,0.3); padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; margin-bottom:12px;">🟢 Respuesta en Vivo con IA (${escapeHtml(aiRes.providerName)})</div><br>`;
let filterData = { hasData: false, score: 100, remainingKm: cfg.filtersKm, detail: 'Sin historial de filtros', alert: null };
if (filterServices.length > 0) {
const lastFilt = filterServices[0];
const lastKm = Number(lastFilt.mileage || lastFilt.km || currentKm);
const kmUsed = Math.max(0, currentKm - lastKm);
const remKm = Math.max(0, cfg.filtersKm - kmUsed);
const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / cfg.filtersKm) * 100)));

filterData = {
hasData: true,
score: score,
remainingKm: remKm,
detail: `Restan ${remKm.toLocaleString()} km`
};
if (score < 25) {
const isExisting = Boolean(chatObj && chatObj.id);
if (!chatObj || chatObj.userId !== currentUser.id) {
const newChatId = 'chat_' + LocalDB.generateUUID();
chatObj = {
id: newChatId,
userId: currentUser.id,
vehicleId: veh ? veh.id : null,
title: question.length > 35 ? question.substring(0, 35) + '...' : question,
messages: []
};
currentActiveAiChatId = newChatId;
}
chatObj.messages = chatObj.messages || [];
chatObj.messages.push({ role: 'user', content: question, timestamp: new Date().toISOString() });
chatObj.messages.push({ role: 'assistant', content: responseText, timestamp: new Date().toISOString() });

await LocalDB.put(STORES.AI_CHATS, chatObj);
await SyncService.executeCrud(isExisting ? 'UPDATE' : 'CREATE', STORES.AI_CHATS, chatObj);
await loadAiChat(chatObj.id);
}
} catch (err) {
console.error('Error en IA:', err);
const offlineBadge = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; margin-bottom:12px;">💡 Asistente Mecánico Offline</div><br>`;
const responseText = getSmartOfflineResponse(question, getActiveVehicle(), '', '', '');
responseBox.innerHTML = offlineBadge + (responseText ? responseText.replace(/\
if (input) input.value = '';

if (currentUser && currentUser.id) {
let chatObj = currentActiveAiChatId ? await LocalDB.get(STORES.AI_CHATS, currentActiveAiChatId) : null;
const isExisting = Boolean(chatObj && chatObj.id);
if (!chatObj || chatObj.userId !== currentUser.id) {
const newChatId = 'chat_' + LocalDB.generateUUID();
chatObj = {
id: newChatId,
userId: currentUser.id,
vehicleId: veh ? veh.id : null,
title: question.length > 35 ? question.substring(0, 35) + '...' : question,
messages: []
};
currentActiveAiChatId = newChatId;
}
chatObj.messages = chatObj.messages || [];
chatObj.messages.push({ role: 'user', content: question, timestamp: new Date().toISOString() });
chatObj.messages.push({ role: 'assistant', content: responseText, timestamp: new Date().toISOString() });

await LocalDB.put(STORES.AI_CHATS, chatObj);
await SyncService.executeCrud(isExisting ? 'UPDATE' : 'CREATE', STORES.AI_CHATS, chatObj);
await loadAiChat(chatObj.id);
}
} catch (err) {
console.error('Error en IA:', err);
const offlineBadge = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; margin-bottom:12px;">💡 Asistente Mecánico Offline</div><br>`;
const responseText = getSmartOfflineResponse(question, getActiveVehicle(), '', '', '');
responseBox.innerHTML = offlineBadge + (responseText ? responseText.replace(/\
if (input) input.value = '';
}
}

function getSmartOfflineResponse(question, veh, vehContext, recentServicesText, pendingRemindersText) {
const qLower = (question || '').toLowerCase().trim();
const userName = currentUser ? (currentUser.name || currentUser.username).split(' ')[0] : 'amigo';
const vehName = veh ? veh.name : 'tu vehículo';
return;
}

const t0 = Date.now();
const listRes = await fetchGeminiModelsList(activeGeminiKey);
const dt = Date.now() - t0;

if (listRes.success) {
const modelNames = listRes.models.map(m => m.name.replace('models/', '')).join(', ');
logs.push(`<span style="color:#30d158;">[OK] Google GenAI (ListModels): HTTP 200 OK (${dt} ms). Modelos vigentes activos: ${escapeHtml(modelNames)}</span>`);

const queryRes = await executeGeminiQuery('Hola', activeGeminiKey);
if (queryRes.success) {
appState.aiApiConnected = true;
docScore = 100;
}
docScores.push(docScore);
docDetails.push(`${doc.name || doc.type}: ${statusText}`);
});
}

function calculateVehicleHealth(veh) {
  const cfg = getHealthSettings();
  if (!veh) return null;

  const currentKm = Number(veh.km || 0);
  const services = (appState.services || []).filter(s => s.vehicleId === veh.id);
  const documents = (appState.documents || []).filter(d => d.vehicleId === veh.id);
  const reminders = (appState.reminders || []).filter(r => r.vehicleId === veh.id);
  const fuels = (appState.fuels || []).filter(f => f.vehicleId === veh.id);

  const missingItems = [];

  // 1. Aceite
  const oilServices = services.filter(s => 
    (s.category && s.category.toLowerCase() === 'aceite') ||
    (s.title && s.title.toLowerCase().includes('aceite')) ||
    (s.description && s.description.toLowerCase().includes('aceite'))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let oilData = { hasData: false, score: 0, categoryKey: 'aceite', remainingKm: cfg.oilKm, detail: 'Sin historial registrado', alert: null };
  if (oilServices.length > 0) {
    const lastOil = oilServices[0];
    const lastKm = Number(lastOil.mileage || lastOil.km || currentKm);
    const interval = Number(lastOil.nextKm || (lastKm + cfg.oilKm)) - lastKm;
    const effInterval = interval > 0 ? interval : cfg.oilKm;
    const kmUsed = Math.max(0, currentKm - lastKm);
    const remKm = Math.max(0, effInterval - kmUsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / effInterval) * 100)));

    oilData = {
      hasData: true,
      score: score,
      categoryKey: 'aceite',
      remainingKm: remKm,
      usedKm: kmUsed,
      interval: effInterval,
      lastDate: lastOil.date,
      oilType: lastOil.title || 'Aceite de motor',
      detail: `Restan ${remKm.toLocaleString()} km`
    };
    if (remKm <= 1000) {
      oilData.alert = `Próximo cambio de aceite en ${remKm.toLocaleString()} km.`;
    }
  } else {
    missingItems.push({ name: 'Último cambio de aceite', key: 'aceite' });
  }

  // 2. Llantas
  const tireServices = services.filter(s =>
    (s.category && (s.category.toLowerCase() === 'llantas' || s.category.toLowerCase() === 'neumaticos')) ||
    (s.title && (s.title.toLowerCase().includes('llanta') || s.title.toLowerCase().includes('neumatic'))) ||
    (s.description && s.description.toLowerCase().includes('llanta'))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let tireData = { hasData: false, score: 0, categoryKey: 'llantas', remainingKm: cfg.tiresKm, detail: 'Sin historial de llantas', alert: null };
  if (tireServices.length > 0) {
    const lastTire = tireServices[0];
    const lastKm = Number(lastTire.mileage || lastTire.km || currentKm);
    const lifespan = cfg.tiresKm;
    const kmUsed = Math.max(0, currentKm - lastKm);
    const remKm = Math.max(0, lifespan - kmUsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / lifespan) * 100)));
    const condText = score >= 60 ? 'Buenas condiciones' : (score >= 30 ? 'Desgaste moderado' : 'Reemplazo cercano');

    tireData = {
      hasData: true,
      score: score,
      categoryKey: 'llantas',
      remainingKm: remKm,
      usedKm: kmUsed,
      condition: condText,
      detail: `${condText} • Restan ${remKm.toLocaleString()} km`
    };
    if (score < 25) {
      tireData.alert = `La vida útil de llantas es inferior al 25% (restan ${remKm.toLocaleString()} km).`;
    }
  } else {
    missingItems.push({ name: 'Cambio de llantas', key: 'llantas' });
  }

  // 3. Frenos
  const brakeServices = services.filter(s =>
    (s.category && s.category.toLowerCase() === 'frenos') ||
    (s.title && (s.title.toLowerCase().includes('freno') || s.title.toLowerCase().includes('pastilla') || s.title.toLowerCase().includes('disco'))) ||
    (s.description && s.description.toLowerCase().includes('freno'))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let brakeData = { hasData: false, score: 0, categoryKey: 'frenos', remainingKm: cfg.brakePadsKm, detail: 'Sin historial de frenos', alert: null };
  if (brakeServices.length > 0) {
    const lastBrake = brakeServices[0];
    const lastKm = Number(lastBrake.mileage || lastBrake.km || currentKm);
    const isDisc = (lastBrake.title || '').toLowerCase().includes('disco');
    const lifespan = isDisc ? cfg.brakeDiscsKm : cfg.brakePadsKm;
    const kmUsed = Math.max(0, currentKm - lastKm);
    const remKm = Math.max(0, lifespan - kmUsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / lifespan) * 100)));

    brakeData = {
      hasData: true,
      score: score,
      categoryKey: 'frenos',
      remainingKm: remKm,
      usedKm: kmUsed,
      detail: `Restan ${remKm.toLocaleString()} km`
    };
    if (score < 25) {
      brakeData.alert = `Desgaste de frenos crítico. Restan solo ${remKm.toLocaleString()} km.`;
    }
  } else {
    missingItems.push({ name: 'Cambio de frenos', key: 'frenos' });
  }

  // 4. Batería
  const batServices = services.filter(s =>
    (s.category && (s.category.toLowerCase() === 'batería' || s.category.toLowerCase() === 'bateria')) ||
    (s.title && (s.title.toLowerCase().includes('batería') || s.title.toLowerCase().includes('bateria')))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let batteryData = { hasData: false, score: 0, categoryKey: 'batería', remainingMonths: cfg.batteryMonths, detail: 'Sin historial de batería', alert: null };
  if (batServices.length > 0) {
    const lastBat = batServices[0];
    const monthsElapsed = calculateMonthsDiff(lastBat.date);
    const lifespanM = cfg.batteryMonths;
    const remMonths = Math.max(0, lifespanM - monthsElapsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (monthsElapsed / lifespanM) * 100)));

    batteryData = {
      hasData: true,
      score: score,
      categoryKey: 'batería',
      remainingMonths: remMonths,
      monthsElapsed: monthsElapsed,
      detail: `Instalada hace ${monthsElapsed} meses • Restan ${remMonths} meses`
    };
    if (monthsElapsed >= Math.floor(lifespanM * 0.8)) {
      batteryData.alert = `La batería supera el 80% de su vida útil (instalada hace ${monthsElapsed} meses).`;
    }
  } else {
    missingItems.push({ name: 'Último cambio de batería', key: 'batería' });
  }

  // 5. Filtros
  const filterServices = services.filter(s =>
    (s.category && s.category.toLowerCase() === 'filtros') ||
    (s.title && (s.title.toLowerCase().includes('filtro') || s.title.toLowerCase().includes('filter')))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let filterData = { hasData: false, score: 0, categoryKey: 'filtros', remainingKm: cfg.filtersKm, detail: 'Sin historial de filtros', alert: null };
  if (filterServices.length > 0) {
    const lastFilt = filterServices[0];
    const lastKm = Number(lastFilt.mileage || lastFilt.km || currentKm);
    const kmUsed = Math.max(0, currentKm - lastKm);
    const remKm = Math.max(0, cfg.filtersKm - kmUsed);
    const score = Math.max(0, Math.min(100, Math.round(100 - (kmUsed / cfg.filtersKm) * 100)));

    filterData = {
      hasData: true,
      score: score,
      categoryKey: 'filtros',
      remainingKm: remKm,
      detail: `Restan ${remKm.toLocaleString()} km`
    };
    if (score < 25) {
      filterData.alert = `Filtros requieren reemplazo cercano (restan ${remKm.toLocaleString()} km).`;
    }
  } else {
    missingItems.push({ name: 'Cambio de filtros', key: 'filtros' });
  }

  // 6. Correas
  const beltServices = services.filter(s =>
    (s.category && (s.category.toLowerCase() === 'correa' || s.category.toLowerCase() === 'correas')) ||
    (s.title && (s.title.toLowerCase().includes('correa') || s.title.toLowerCase().includes('distribucion') || s.title.toLowerCase().includes('banda')))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let beltData = { hasData: false, score: 0, categoryKey: 'correa', detail: 'Sin historial de correas', alert: null };
  if (beltServices.length > 0) {
    const lastBelt = beltServices[0];
    const lastKm = Number(lastBelt.mileage || lastBelt.km || currentKm);
    const kmUsed = Math.max(0, currentKm - lastKm);
    const kmPct = (kmUsed / cfg.beltKm) * 100;
    const monthsElapsed = calculateMonthsDiff(lastBelt.date);
    const monthPct = (monthsElapsed / cfg.beltMonths) * 100;

    const worstWear = Math.max(kmPct, monthPct);
    const score = Math.max(0, Math.min(100, Math.round(100 - worstWear)));
    const remKm = Math.max(0, cfg.beltKm - kmUsed);

    beltData = {
      hasData: true,
      score: score,
      categoryKey: 'correa',
      remainingKm: remKm,
      detail: `Uso: ${Math.round(worstWear)}% • Restan ${remKm.toLocaleString()} km`
    };
    if (score < 25) {
      beltData.alert = `Correa de distribución supera el 75% de desgaste estimado.`;
    }
  } else {
    missingItems.push({ name: 'Revisión de correas', key: 'correa' });
  }

  // 7. Documentación
  let docScores = [];
  let docAlerts = [];
  let docDetails = [];

  if (documents.length > 0) {
    documents.forEach(doc => {
      const days = calculateDaysDiff(doc.expiryDate || doc.expirationDate || doc.fechaVencimiento);
      let statusText = 'Vigente';
      let docScore = 100;

      if (days <= 0) {
        statusText = 'Vencido';
        docScore = 0;
        docAlerts.push(`${doc.name || doc.type || 'Documento'} se encuentra VENCIDO.`);
      } else if (days <= 30) {
        statusText = `Vence en ${days} días`;
        docScore = 50;
        docAlerts.push(`${doc.name || doc.type || 'Documento'} vence en ${days} días.`);
      } else {
        statusText = 'Vigente';
        docScore = 100;
      }
      docScores.push(docScore);
      docDetails.push(`${doc.name || doc.type}: ${statusText}`);
    });
  }

  const hasDocsData = documents.length > 0;
  const docAvgScore = hasDocsData ? Math.round(docScores.reduce((a, b) => a + b, 0) / docScores.length) : 0;
  if (!hasDocsData) missingItems.push({ name: 'Documentación del vehículo', key: 'guantera' });

  const docData = {
    hasData: hasDocsData,
    score: docAvgScore,
    categoryKey: 'guantera',
    details: docDetails.length > 0 ? docDetails.join(' • ') : 'Sin documentos registrados',
    alerts: docAlerts
  };

  // 8. Recordatorios
  let dueRem = 0, upcomingRem = 0, pendingRem = 0;
  reminders.forEach(r => {
    const days = calculateDaysDiff(r.dueDate || r.date);
    if (r.status === 'completed' || r.completed) return;
    if (days < 0) dueRem++;
    else if (days <= 7) upcomingRem++;
    else pendingRem++;
  });

  // 9. Gastos
  const currentYear = new Date().getFullYear();
  let totalHistoric = 0;
  let yearTotal = 0;

  services.forEach(s => {
    const cost = Number(s.cost || s.totalCost || 0);
    totalHistoric += cost;
    if (s.date && new Date(s.date).getFullYear() === currentYear) {
      yearTotal += cost;
    }
  });

  fuels.forEach(f => {
    const cost = Number(f.cost || f.totalCost || 0);
    totalHistoric += cost;
    if (f.date && new Date(f.date).getFullYear() === currentYear) {
      yearTotal += cost;
    }
  });

  const monthlyAvg = yearTotal > 0 ? Math.round(yearTotal / Math.max(1, new Date().getMonth() + 1)) : 0;

  // RELIABILITY & SCORE CALCULATION
  const componentsList = [
    { name: 'Aceite', data: oilData, weight: cfg.weights.oil },
    { name: 'Llantas', data: tireData, weight: cfg.weights.tires },
    { name: 'Frenos', data: brakeData, weight: cfg.weights.brakes },
    { name: 'Batería', data: batteryData, weight: cfg.weights.battery },
    { name: 'Filtros', data: filterData, weight: cfg.weights.filters },
    { name: 'Correas', data: beltData, weight: cfg.weights.belts },
    { name: 'Documentación', data: docData, weight: cfg.weights.docs }
  ];

  const presentComponents = componentsList.filter(c => c.data.hasData);
  const confidencePct = Math.round((presentComponents.length / componentsList.length) * 100);

  let evaluatedWeightSum = 0;
  let weightedHealthSum = 0;

  if (presentComponents.length > 0) {
    presentComponents.forEach(c => {
      evaluatedWeightSum += c.weight;
      weightedHealthSum += (c.data.score * c.weight);
    });
  }

  const rawHealthPct = evaluatedWeightSum > 0 
    ? Math.round(weightedHealthSum / evaluatedWeightSum)
    : 0;

  // Summary Metrics Breakdown
  const evaluatedCount = presentComponents.length;
  const healthyCount = presentComponents.filter(c => c.data.score >= 70).length;
  const warningCount = presentComponents.filter(c => c.data.score < 70).length;
  const noDataCount = componentsList.length - presentComponents.length;

  // Confidence Levels: Low (<50%), Medium (50-70%), High (>70%)
  let overallHealthPct = null;
  let ratingLabel = 'SIN INFORMACIÓN SUFICIENTE';
  let ratingClass = 'health-status-nodata';
  let ratingColor = '#64748b';
  let confidenceColor = '#ef4444';
  let confidenceMsg = 'No hay suficiente historial para calcular una salud confiable.';

  if (confidencePct >= 70) {
    overallHealthPct = rawHealthPct;
    confidenceColor = '#10b981';
    confidenceMsg = 'El análisis es altamente confiable porque existe suficiente historial del vehículo.';
    if (rawHealthPct >= 95) {
      ratingLabel = 'EXCELENTE';
      ratingClass = 'health-status-excellent';
      ratingColor = '#3b82f6';
    } else if (rawHealthPct >= 85) {
      ratingLabel = 'MUY BUENO';
      ratingClass = 'health-status-verygood';
      ratingColor = '#10b981';
    } else if (rawHealthPct >= 70) {
      ratingLabel = 'BUENO';
      ratingClass = 'health-status-good';
      ratingColor = '#eab308';
    } else if (rawHealthPct >= 50) {
      ratingLabel = 'REQUIERE ATENCIÓN';
      ratingClass = 'health-status-warning';
      ratingColor = '#f97316';
    } else {
      ratingLabel = 'CRÍTICO';
      ratingClass = 'health-status-critical';
      ratingColor = '#ef4444';
    }
  } else if (confidencePct >= 50) {
    overallHealthPct = rawHealthPct;
    ratingLabel = 'SALUD ESTIMADA';
    ratingClass = 'health-status-warning';
    ratingColor = '#f97316';
    confidenceColor = '#f97316';
    confidenceMsg = 'El análisis es una estimación. Agregue más datos para mayor precisión.';
  }

  // Aggregate Smart Alerts
  const allSmartAlerts = [];
  if (oilData.alert) allSmartAlerts.push({ type: 'warning', text: oilData.alert });
  if (tireData.alert) allSmartAlerts.push({ type: 'danger', text: tireData.alert });
  if (brakeData.alert) allSmartAlerts.push({ type: 'danger', text: brakeData.alert });
  if (batteryData.alert) allSmartAlerts.push({ type: 'warning', text: batteryData.alert });
  if (filterData.alert) allSmartAlerts.push({ type: 'info', text: filterData.alert });
  if (beltData.alert) allSmartAlerts.push({ type: 'danger', text: beltData.alert });
  if (docData.alerts && docData.alerts.length > 0) {
    docData.alerts.forEach(a => allSmartAlerts.push({ type: 'warning', text: a }));
  }
  if (dueRem > 0) {
    allSmartAlerts.push({ type: 'danger', text: `Tienes ${dueRem} recordatorio(s) de servicio VENCIDOS.` });
  }

  // Maintenance Assistant Smart Answers
  let lowestComp = null;
  if (presentComponents.length > 0) {
    const sorted = [...presentComponents].sort((a, b) => a.data.score - b.data.score);
    lowestComp = sorted[0];
  }

  let firstAction = 'Todo funciona correctamente.';
  if (dueRem > 0) {
    firstAction = `Atender ${dueRem} recordatorio(s) vencido(s).`;
  } else if (lowestComp && lowestComp.data.score < 70) {
    firstAction = `Revisar ${lowestComp.name} (${lowestComp.data.score}% de vida útil).`;
  } else if (oilData.hasData && oilData.remainingKm <= 1000) {
    firstAction = `Cambiar aceite pronto (restan ${oilData.remainingKm.toLocaleString()} km).`;
  } else if (missingItems.length > 0) {
    firstAction = `Registrar ${missingItems[0].name.toLowerCase()} para aumentar la confiabilidad.`;
  }

  let worstWearText = lowestComp ? `${lowestComp.name} (${lowestComp.data.score}%)` : 'Sin datos suficientes';
  let nextServiceText = 'No hay servicios inmediatos pendientes.';
  if (oilData.hasData && oilData.remainingKm > 0) {
    nextServiceText = `Cambio de aceite (${oilData.remainingKm.toLocaleString()} km restantes)`;
  } else if (dueRem > 0) {
    nextServiceText = `${dueRem} servicio(s) vencido(s) en Recordatorios`;
  }

  let docStatusSummary = docData.hasData ? (docData.alerts.length > 0 ? `${docData.alerts.length} por vencer/vencidos` : 'Todos vigentes') : 'Sin documentos registrados';

  const lastEvaluationText = getRelativeTimeString(veh.lastHealthUpdate || Date.now());

  return {
    veh,
    overallHealthPct,
    rawHealthPct,
    ratingLabel,
    ratingClass,
    ratingColor,
    confidencePct,
    confidenceColor,
    confidenceMsg,
    missingItems,
    evaluatedCount,
    healthyCount,
    warningCount,
    noDataCount,
    firstAction,
    worstWearText,
    nextServiceText,
    docStatusSummary,
    lastEvaluationText,
    allSmartAlerts,
    oilData,
    tireData,
    brakeData,
    batteryData,
    filterData,
    beltData,
    docData,
    remindersSummary: { dueRem, upcomingRem, pendingRem },
    expensesSummary: { yearTotal, monthlyAvg, totalHistoric }
  };
}

function renderVehicleHealth() {
</div>
</div>}

function setAppTheme(themeName) {
  applyAppTheme();
}

function renderMonthlySpendChart(fuels) {
  const chartContainer = document.getElementById('monthlyChart');
  if (!chartContainer) return;
  
  if (!fuels || fuels.length === 0) {
    chartContainer.innerHTML = '<p class="subtitle">Registra cargas de combustible para visualizar gastos mensuales.</p>';
    return;
  }

  const monthlyTotals = {};
  fuels.forEach(f => {
    if (!f.date) return;
    const monthKey = f.date.substring(0, 7); // "YYYY-MM"
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (Number(f.cost) || 0);
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
        <div style="display:flex; justify-space-between:space-between; font-size:0.85rem; margin-bottom:4px;">
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
  if (!chartContainer) return;
  if (!services || services.length === 0) {
    chartContainer.innerHTML = '<p class="subtitle">Registra servicios para ver desglose de gastos.</p>';
    return;
  }

  const categoryTotals = {};
  services.forEach(s => {
    categoryTotals[s.category] = (categoryTotals[s.category] || 0) + (Number(s.cost) || 0);
  });

  const categories = Object.keys(categoryTotals);
  let html = `<div style="display:flex; flex-direction:column; gap:8px; width:100%;">`;
  let grandTotal = services.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

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
  const title = document.getElementById('servTitle').value.trim();
  const cost = parseFloat(document.getElementById('servCost').value);
  const date = document.getElementById('servDate').value;
  const km = parseInt(document.getElementById('servKm').value);
  const shop = document.getElementById('servShop').value.trim();
  const notes = document.getElementById('servNotes') ? document.getElementById('servNotes').value.trim() : '';
  const receiptInput = document.getElementById('servReceipt');

  if (!title) {
    alert('Por favor ingresa la descripción del servicio o mantenimiento.');
    return;
  }

  const safeCost = isNaN(cost) || cost < 0 ? 0 : cost;
  const safeKm = isNaN(km) || km < 0 ? veh.km : km;

  let targetServ = servId ? appState.services.find(s => s.id === servId) : null;

  const processAndSave = async (receiptBase64) => {
    const servData = {
      id: servId || undefined,
      vehicleId: veh.id,
      category, title, cost: safeCost, date, km: safeKm, shop, notes,
      receipt: receiptBase64 || (targetServ ? targetServ.receipt : '')
    };

    await SyncService.executeCrud(targetServ ? 'UPDATE' : 'CREATE', STORES.SERVICES, servData);

    if (safeKm > veh.km) {
      veh.km = safeKm;
      await SyncService.executeCrud('UPDATE', STORES.VEHICLES, veh);
    }

    closeModal('modalService');
    document.getElementById('formService').reset();
    setTodayDates();
    renderApp();
  };

  if (receiptInput && receiptInput.files && receiptInput.files[0]) {
    readAndCompressImage(receiptInput.files[0], processAndSave);
  } else {
    processAndSave('');
  }
}
</div>
</div>
`;
}
const safeVolume = isNaN(volume) || volume <= 0 ? 1 : volume;
const safeKm = isNaN(km) || km < 0 ? veh.km : km;

let targetFuel = fuelId ? appState.fuels.find(f => f.id === fuelId) : null;

const fuelData = {
id: fuelId || undefined,
vehicleId: veh.id,
cost: safeCost, volume: safeVolume, km: safeKm, date, notes
};

await SyncService.executeCrud(targetFuel ? 'UPDATE' : 'CREATE', STORES.FUELS, fuelData);

if (safeKm > veh.km) {
veh.km = safeKm;
await SyncService.executeCrud('UPDATE', STORES.VEHICLES, veh);
}

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
saveState();
return { success: false, error: 'Sin conexión a IA en línea configurada.' };
}

async function runAiDiagnostic() {
const logBox = document.getElementById('aiDiagnosticLog');
const badge = document.getElementById('aiModeStatusBadge');
if (!logBox) return;

logBox.style.display = 'block';
logBox.innerHTML = '<span style="color:#38bdf8;">Iniciando Generación de Diagnóstico Real...</span><br>';

const groqInput = document.getElementById('groqApiKeyInput');
const geminiInput = document.getElementById('geminiApiKeyInput');
const modeSelect = document.getElementById('aiEngineModeSelect');
let selectedMode = modeSelect ? modeSelect.value : (appState.aiEngineMode || 'groq_key');
if (selectedMode !== 'groq_key' && selectedMode !== 'gemini_key') selectedMode = 'groq_key';

if (groqInput && groqInput.value.trim()) appState.groqApiKey = groqInput.value.trim();
if (geminiInput && geminiInput.value.trim()) appState.geminiApiKey = geminiInput.value.trim();
saveState();

const activeGroqKey = (appState.groqApiKey || '').trim();
const activeGeminiKey = (appState.geminiApiKey || '').trim();

if (selectedMode === 'groq_key' && !activeGroqKey) {
logBox.innerHTML += `<span style="color:#38bdf8;">[AVISO] Groq Llama 3.3: Ingresa tu API Key en la configuración para generar el reporte.</span>`;
return;
}
if (selectedMode === 'gemini_key' && !activeGeminiKey) {
logBox.innerHTML += `<span style="color:#38bdf8;">[AVISO] Google Gemini API: Ingresa tu API Key en la configuración para generar el reporte.</span>`;
return;
}

const veh = getActiveVehicle();
if (!veh) {
logBox.innerHTML += `<span style="color:#38bdf8;">[AVISO] Debes tener un vehículo activo para generar el diagnóstico.</span>`;
return;
}

logBox.innerHTML += '<span style="color:#38bdf8;">Conectando con el motor de Inteligencia Artificial para analizar tu vehículo...</span><br>';

const promptText = `Actúa como un Ingeniero Mecánico Experto. Realiza una evaluación exhaustiva del estado de este vehículo basándote en la siguiente información:
Vehículo: ${veh.name} (Año ${veh.year}, ${veh.type})
Kilometraje Actual: ${veh.km.toLocaleString()} KM
Servicios Previos Registrados: ${appState.services.filter(s => s.vehicleId === veh.id).length}

Estructura tu respuesta exactamente así:
### 📋 Diagnóstico de Salud
(Brinda un resumen rápido de cómo se encuentra el auto según su edad y kilometraje)

### 🔧 Predicción de Desgaste
(Lista de componentes que están próximos a fallar o requerir cambio)

### 🚨 Recomendaciones Críticas
(Qué debe hacer el dueño inmediatamente)`;

const aiRes = await executeAiQuery(promptText, "Generar diagnóstico integral");

if (aiRes.success) {
appState.aiApiConnected = true;
saveState();
logBox.style.display = 'none';

// Formatear texto y mostrar en el card
const formatText = (txt) => {
return txt
.replace(/### (.*?)\
.replace(/## (.*?)\
.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
</div>
<div style="background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.2); padding:14px; border-radius:10px; font-size:0.88rem; color:#cbd5e1; line-height:1.5;">
${formatText(aiRes.text)}
</div>
`;
}
} else {
appState.aiApiConnected = false;
saveState();
logBox.innerHTML += `<br><span style="color:#ff453a;">[ERROR] Error al contactar la IA: ${escapeHtml(aiRes.error || 'Problema de red')}</span>`;
}
}


function saveGeminiKey(key) {
appState.geminiApiKey = key.trim();
saveState();
}

// Mini Vehicle List (iOS Swipe-to-Delete)
}
} else {
appState.aiApiConnected = false;
saveState();
logBox.innerHTML += `<br><span style="color:#ff453a;">[ERROR] Error al contactar la IA: ${escapeHtml(aiRes.error || 'Problema de red')}</span>`;
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
container.innerHTML = '<p class="subtitle">No hay vehículos registrados.</p>';
return;
}

container.innerHTML = appState.vehicles.map(v => `
<div class="swipe-container">
<div class="swipe-action-bg">
<button type="button" class="swipe-action-btn" onclick="deleteVehicleDirect('${v.id}', event)">
${SVG_ICONS.trash}
<span>Eliminar</span>
</button>
</div>
<div class="swipe-content vehicle-mini-item ${v.id === appState.activeVehicleId ? 'active-veh' : ''}">
<div style="cursor:pointer; flex:1;" onclick="selectActiveVehicle('${v.id}')">
}
}


function saveGeminiKey(key) {

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
<button type="button" class="swipe-action-btn" onclick="deleteVehicleDirect('${v.id}', event)">
${SVG_ICONS.trash}
<span>Eliminar</span>
</button>
</div>
<div class="swipe-content vehicle-mini-item ${v.id === appState.activeVehicleId ? 'active-veh' : ''}">
<div style="cursor:pointer; flex:1;" onclick="selectActiveVehicle('${v.id}')">
<strong>${escapeHtml(v.name)} (${v.year}) ${v.id === appState.activeVehicleId ? '<span style="color:#38bdf8; font-size:0.75rem; margin-left:6px; font-weight:700;">(Activo)</span>' : ''}</strong>
<div class="veh-info-sub">${escapeHtml(v.plate) || 'Sin Placa'} • ${v.km.toLocaleString()} km</div>
</div>
<div class="veh-actions">
<button class="btn btn-secondary btn-sm" onclick="editVehicle('${v.id}')">${SVG_ICONS.edit} Editar</button>
function editVehicle(vehId) {
openVehicleModal(vehId);
}

function saveVehicle(e) {
e.preventDefault();
const vehId = document.getElementById('vehId').value;
const type = document.getElementById('vehType').value;
const brand = document.getElementById('vehBrand').value.trim();
const model = document.getElementById('vehModel').value.trim();
const name = [brand, model].filter(Boolean).join(' ') || 'Vehículo sin nombre';
const yearInputVal = document.getElementById('vehYear').value;
const year = parseInt(yearInputVal);
const plate = document.getElementById('vehPlate').value.trim();
const kmInputVal = document.getElementById('vehKm').value;
const km = parseInt(kmInputVal);
const photoInput = document.getElementById('vehPhoto');

if (!brand || !model) {
alert('Por favor ingresa la marca y el modelo del vehículo.');
return;
}
const currentYear = new Date().getFullYear();
if (isNaN(year) || year < 1900 || year > currentYear + 2) {
alert(`Por favor ingresa un año válido para el vehículo (entre 1900 y ${currentYear + 2}).`);
return;
}
const safeKm = isNaN(km) || km < 0 ? 0 : km;

let targetVeh = vehId ? appState.vehicles.find(v => v.id === vehId) : null;

const processAndSave = async (photoBase64) => {
const vehData = {
id: vehId || undefined,
type, name, brand, model, year, plate, km: safeKm,
photo: photoBase64 || (targetVeh ? targetVeh.photo : '')
};

const saved = await SyncService.executeCrud(targetVeh ? 'UPDATE' : 'CREATE', STORES.VEHICLES, vehData);
appState.activeVehicleId = saved.id;

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
<button type="button" class="swipe-action-btn" onclick="deleteServiceDirect('${s.id}', event)">
${SVG_ICONS.trash}
<span>Eliminar</span>
</button>
</div>
<div class="swipe-content log-item-card" onclick="openServiceModal('${s.id}')">
<div class="log-item-main">
<div class="log-icon-badge">${svgCategoryMap[s.category] || SVG_ICONS.wrench}</div>
<div>
<div class="log-title">${escapeHtml(s.title)}</div>

const settingLang = document.getElementById('settingLanguage');
if (settingLang) settingLang.value = appState.language || 'es';

const geminiInput = document.getElementById('geminiApiKeyInput');
const geminiBadge = document.getElementById('geminiStatusBadge');
if (geminiInput) geminiInput.value = appState.geminiApiKey || '';
if (geminiBadge) {
if (appState.geminiApiKey) {
geminiBadge.className = 'badge-subtle badge-green';
geminiBadge.textContent = 'Conectada ⭐';
} else {
geminiBadge.className = 'badge-subtle badge-blue';
geminiBadge.textContent = 'No configurada';
}
}

const symbol = appState.currency === 'USD' ? '$' : appState.currency === 'EUR' ? '€' : '₡';
document.querySelectorAll('.currency-lbl').forEach(el => el.textContent = symbol);

applyNavigationPermissions();
function exportDataXML() {
try {
const usersList = getUsersList();
const exportPayload = {
appState: appState,
currentUser: currentUser,
usersList: usersList,
version: 'V15',
exportDate: new Date().toISOString()
};

const xmlString = objectToXML(exportPayload, 'GarageOneBackup');
const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const downloadAnchor = document.createElement('a');
downloadAnchor.href = url;
downloadAnchor.download = `garageone_respaldo_${new Date().toISOString().split('T')[0]}.xml`;
document.body.appendChild(downloadAnchor);
downloadAnchor.click();
document.body.removeChild(downloadAnchor);
setTimeout(() => URL.revokeObjectURL(url), 1000);
} catch (err) {
alert('Error al exportar la copia de seguridad XML: ' + err.message);
}
}

function importDataXML(e) {
const file = e.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = function(evt) {
try {
const content = evt.target.result;
let imported = null;

if (file.name.endsWith('.json') || content.trim().startsWith('{')) {
imported = JSON.parse(content);
} else {
imported = xmlToObject(content);
}

let targetState = imported;
if (imported.appState && imported.vehicles === undefined) {
targetState = imported.appState;
}

if (targetState && targetState.vehicles && Array.isArray(targetState.vehicles)) {
appState = sanitizeState(targetState);

if (imported.usersList && Array.isArray(imported.usersList)) {
saveUsersList(imported.usersList);
}
if (imported.currentUser) {
saveUser(imported.currentUser);
isAuthenticated = true;
} else if (!currentUser && appState.vehicles && appState.vehicles.length > 0) {
isAuthenticated = true;
}

saveState();
renderApp();
checkAuth();
alert('¡Copia de seguridad (XML) restaurada con éxito! Todos tus vehículos, registros e información fueron recuperados.');
} else {
alert('El archivo no contiene un formato de respaldo válido de GarageOne.');
}
} catch (err) {
alert('Error al leer el archivo de respaldo: ' + err.message);
}
};
reader.readAsText(file);
}

// Report Sharing (Text & Email)
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
if (!container) return;
const veh = getActiveVehicle();
let list = appState.fuels.filter(f => f.vehicleId === vehId);
list.sort((a, b) => Number(b.km) - Number(a.km));

const effEl = document.getElementById('fuelEfficiencyVal');
const costEl = document.getElementById('costPerKmVal');

if (list.length >= 2) {
let sortedAsc = [...list].sort((a, b) => Number(a.km) - Number(b.km));
let totalKmDiff = Number(sortedAsc[sortedAsc.length - 1].km) - Number(sortedAsc[0].km);
let totalVolume = sortedAsc.reduce((sum, f) => sum + Number(f.volume || f.liters || 0), 0);
let totalCost = sortedAsc.reduce((sum, f) => sum + Number(f.cost || 0), 0);

let efficiency = (totalKmDiff > 0 && totalVolume > 0) ? (totalKmDiff / totalVolume).toFixed(1) : 0;
let costPerKm = totalKmDiff > 0 ? (totalCost / totalKmDiff) : 0;

if (effEl) effEl.textContent = efficiency > 0 ? `${efficiency} km/L` : '0 km/L';
if (costEl) costEl.textContent = costPerKm > 0 ? `${formatCurrency(costPerKm)}/km` : `${formatCurrency(0)}/km`;
} else if (list.length === 1) {
let f = list[0];
let vol = Number(f.volume || f.liters || 0);
let cost = Number(f.cost || 0);
let km = Number(f.km || (veh ? veh.km : 0));

let costPerKm = (km > 0 && cost > 0) ? (cost / km) : 0;
if (pwdContainer) pwdContainer.style.display = 'block';

// Hide auth method selector (PIN vs Password)
const authMethodSelector = document.querySelector('.settings-card h3');
const pinMethodRow = document.getElementById('authMethodPwdLabel');
if (pinMethodRow) pinMethodRow.closest('div[style]') && (pinMethodRow.closest('div[style]').style.display = 'none');
}

const settingCurr = document.getElementById('settingCurrency');
if (settingCurr) settingCurr.value = appState.currency || 'CRC';

const settingLang = document.getElementById('settingLanguage');
if (settingLang) settingLang.value = appState.language || 'es';

await loadAppStateFromDB();

renderApp();
renderUserSettings();
renderRemindersTab();
renderGuantera();
if (typeof renderAIDiagnostic === 'function') renderVehicleHealth();
if (typeof renderAiChatHistory === 'function') renderVehicleHealth();
if (typeof renderReports === 'function') renderReports();

alert('Respaldo importado correctamente.');
} catch (error) {
console.error('Error importando XML:', error);
alert(error.message || 'No fue posible importar el respaldo.');
}
}

const geminiInput = document.getElementById('geminiApiKeyInput');
const geminiBadge = document.getElementById('geminiStatusBadge');
if (geminiInput) geminiInput.value = appState.geminiApiKey || '';
if (geminiBadge) {
if (appState.geminiApiKey) {
geminiBadge.className = 'badge-subtle badge-green';
geminiBadge.textContent = 'Conectada ⭐';
} else {
geminiBadge.className = 'badge-subtle badge-blue';
geminiBadge.textContent = 'No configurada';
}
}

const symbol = appState.currency === 'USD' ? '$' : appState.currency === 'EUR' ? '€' : '₡';
document.querySelectorAll('.currency-lbl').forEach(el => el.textContent = symbol);

applyNavigationPermissions();
renderStorageStats();
renderBackupStatus();
applyLanguageTranslations();
}

function changeCurrencySetting(val) {
appState.currency = val;
saveState();
renderUserSettings();
renderApp();
}


const BACKUP_SETTINGS_KEY = 'GARAGEONE_BACKUP_SETTINGS';
const BACKUP_DATA_STORES = ['vehicles', 'services', 'fuels', 'documents', 'reminders', 'users', 'ai_chats'];

function getBackupSettings() {
try { return JSON.parse(localStorage.getItem(BACKUP_SETTINGS_KEY)) || { frequency: 'off', lastAutoAt: null }; }
catch (e) { return { frequency: 'off', lastAutoAt: null }; }
}

function saveBackupFrequency(frequency) {
const settings = getBackupSettings();
settings.frequency = frequency || 'off';
localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(settings));
renderBackupStatus();
}

async function buildBackupPayload() {
const stores = {};
for (const storeName of BACKUP_DATA_STORES) {
const dbItems = await LocalDB.getAll(storeName);
}

async function exportBackupXml(automatic = false) {
const xml = await backupXmlText();
const now = new Date().toISOString();
if (automatic) {
await retainAutomaticBackup(xml, now);
return;
}
const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `garageone-respaldo-${now.slice(0, 10)}.xml`;
link.click();
URL.revokeObjectURL(link.href);
}

async function createManualBackup() {
const xml = await backupXmlText();
await retainAutomaticBackup(xml, new Date().toISOString());
await renderBackupStatus();
}

async function downloadStoredBackup(backupId) {
const backup = await LocalDB.get(STORES.BACKUPS, backupId);
if (!backup) return;
const link = document.createElement('a');
link.href = URL.createObjectURL(new Blob([backup.xml], { type: 'application/xml;charset=utf-8' }));
link.download = `garageone-respaldo-${backup.createdAt.slice(0, 10)}.xml`;
link.click();
URL.revokeObjectURL(link.href);
}

async function deleteStoredBackup(backupId) {
await LocalDB.delete(STORES.BACKUPS, backupId);
await renderBackupStatus();
}

async function importBackupXml(event) {
const file = event.target.files && event.target.files[0];
event.target.value = '';
if (!file) return;
try {
const xml = (await file.text()).replace(/^\uFEFF/, '').trim();
const rootMatch = xml.match(/^<\?xml[^>]*>\s*<garageone-backup\b[^>]*>([\s\S]*)<\/garageone-backup>\s*$/i);
const payloadMatch = rootMatch && rootMatch[1].match(/<payload\b(?=[^>]*\bencoding\s*=\s*["']base64["'])[^>]*>([\s\S]*?)<\/payload>/i);
if (!payloadMatch) throw new Error('El archivo no es un respaldo XML válido de GarageOne.');
const payload = decodeBackupPayload(payloadMatch[1]);
if (!payload || !payload.stores || !payload.configuration) throw new Error('El respaldo está incompleto.');
if (!confirm('La importación reemplazará los datos locales actuales. ¿Deseas continuar?')) return;
await exportBackupXml(true);
for (const storeName of BACKUP_DATA_STORES) {
await LocalDB.clear(storeName);
if (Array.isArray(payload.stores[storeName])) await LocalDB.putMany(storeName, payload.stores[storeName]);
}
appState = sanitizeState(payload.configuration);
saveState();
await loadAppStateFromDB();
renderApp(); renderUserSettings(); renderRemindersTab(); renderGuantera();
alert('Respaldo importado correctamente.');
} catch (error) { alert(error.message || 'No fue posible importar el respaldo.'); }
}

async function runScheduledBackup() {
const settings = getBackupSettings();
if (settings.frequency === 'off') return;
const spans = { daily: 86400000, weekly: 604800000, monthly: 2592000000 };
if (settings.lastAutoAt && Date.now() - new Date(settings.lastAutoAt).getTime() < spans[settings.frequency]) return;
await exportBackupXml(true);
settings.lastAutoAt = new Date().toISOString();
localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(settings));
renderBackupStatus();
}

async function renderBackupStatus() {
const settings = getBackupSettings();
const select = document.getElementById('backupFrequency');
const status = document.getElementById('backupStatus');
const history = document.getElementById('backupHistory');
if (select) select.value = settings.frequency;
const backups = await LocalDB.getAll(STORES.BACKUPS);
if (status) status.textContent = settings.frequency === 'off' ? 'Respaldo automático desactivado.' : `Frecuencia: ${settings.frequency}. Se conservan hasta 3 respaldos locales.${settings.lastAutoAt ? ` Último: ${new Date(settings.lastAutoAt).toLocaleString()}.` : ''}`;
if (history) {
const latest = backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
history.innerHTML = latest.length ? latest.map(backup => `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 8px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:0.76rem;"><span>${new Date(backup.createdAt).toLocaleString()}</span><span style="display:flex; gap:5px;"><button type="button" class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:0.7rem;" onclick="downloadStoredBackup('${backup.id}')">Descargar</button><button type="button" class="btn btn-tertiary btn-sm" style="padding:3px 6px; font-size:0.7rem; color:#ff453a;" onclick="deleteStoredBackup('${backup.id}')">Eliminar</button></span></div>`).join('') : '<span>Sin respaldos locales todavía.</span>';
}
}

// Reports & Financial Overview
function populateReportMonthFilter(services, fuels) {
const select = document.getElementById('reportMonthFilter');
if (!select) return;

const currentVal = select.value || 'all';
const monthSet = new Set();
const monthNamesEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

services.forEach(s => { if (s.date) monthSet.add(s.date.substring(0, 7)); });
fuels.forEach(f => { if (f.date) monthSet.add(f.date.substring(0, 7)); });

const sortedMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
let html = `<option value="all">Todos los meses (Histórico)</option>`;

sortedMonths.forEach(mKey => {
const [year, monthNum] = mKey.split('-');
const name = monthNamesEs[parseInt(monthNum, 10) - 1] || mKey;
html += `<option value="${mKey}">${name} ${year}</option>`;
});

select.innerHTML = html;
if (sortedMonths.includes(currentVal) || currentVal === 'all') {
select.value = currentVal;
}
}

function renderReports() {
const vehId = appState.activeVehicleId;
const allServices = appState.services.filter(s => s.vehicleId === vehId);
const allFuels = appState.fuels.filter(f => f.vehicleId === vehId);

}

async function deleteStoredBackup(backupId) {
await LocalDB.delete(STORES.BACKUPS, backupId);
await renderBackupStatus();
}

async function importBackupXml(event) {
const file = event.target.files && event.target.files[0];
event.target.value = '';
if (!file) return;
try {
const xml = (await file.text()).replace(/^\uFEFF/, '').trim();
const rootMatch = xml.match(/^<\?xml[^>]*>\s*<garageone-backup\b[^>]*>([\s\S]*)<\/garageone-backup>\s*$/i);
const payloadMatch = rootMatch && rootMatch[1].match(/<payload\b(?=[^>]*\bencoding\s*=\s*["']base64["'])[^>]*>([\s\S]*?)<\/payload>/i);
if (!payloadMatch) throw new Error('El archivo no es un respaldo XML válido de GarageOne.');
const payload = decodeBackupPayload(payloadMatch[1]);
if (!payload || !payload.stores || !payload.configuration) throw new Error('El respaldo está incompleto.');
if (!confirm('La importación reemplazará los datos locales actuales. ¿Deseas continuar?')) return;
const latest = backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
history.innerHTML = latest.length ? latest.map(backup => `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 8px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:0.76rem;"><span>${new Date(backup.createdAt).toLocaleString()}</span><span style="display:flex; gap:5px;"><button type="button" class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:0.7rem;" onclick="downloadStoredBackup('${backup.id}')">Descargar</button><button type="button" class="btn btn-tertiary btn-sm" style="padding:3px 6px; font-size:0.7rem; color:#ff453a;" onclick="deleteStoredBackup('${backup.id}')">Eliminar</button></span></div>`).join('') : '<span>Sin respaldos locales todavía.</span>';
}
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
const monthKey = s.date.substring(0, 7); // •"YYYY-MM"
monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + s.cost;
});

fuels.forEach(f => {
if (!f.date) return;
const monthKey = f.date.substring(0, 7); // •"YYYY-MM"
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
async function saveAdminUser(e) {
e.preventDefault();
const userId = document.getElementById('adminUserId').value;
const username = document.getElementById('adminUserUsername').value.trim();
const name = document.getElementById('adminUserName').value.trim();
const email = document.getElementById('adminUserEmail').value.trim();
const password = document.getElementById('adminUserPassword').value.trim();
const role = document.getElementById('adminUserRole').value;

if (!username || username.length < 2) {
alert('Por favor ingresa un nombre de usuario válido (mínimo 2 caracteres).');
return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
alert('Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).');
return;
}

const permissions = {
tabGarage: role === 'admin' ? true : document.getElementById('permTabGarage').checked,
tabMaintenance: role === 'admin' ? true : document.getElementById('permTabMaintenance').checked,
tabFuel: role === 'admin' ? true : document.getElementById('permTabFuel').checked,
tabGuantera: role === 'admin' ? true : document.getElementById('permTabGuantera').checked,
tabAI: role === 'admin' ? true : document.getElementById('permTabAI').checked,
tabReports: role === 'admin' ? true : document.getElementById('permTabReports').checked,
tabSettings: true,
canManageUsers: role === 'admin'
};

let list = getUsersList();

if (userId) {
const idx = list.findIndex(u => u.id === userId);
if (idx !== -1) {
const existingUser = list[idx];
const existingPass = existingUser.password || '1234';
const isCreatedByAdmin = (existingUser.createdByAdmin === true) || (existingUser.username && existingUser.username.toLowerCase() === 'admin');

const updatedPass = isCreatedByAdmin ? (password ? password : existingPass) : existingPass;

const updatedUser = {
...existingUser,
username,
name,
email,
password: updatedPass,
role,
permissions,
createdByAdmin: isCreatedByAdmin
};

await SyncService.executeCrud('UPDATE', STORES.USERS, updatedUser);

if (currentUser && currentUser.id === userId) {
currentUser = updatedUser;
saveUser(currentUser);
}
}
} else {
const existing = list.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
if (existing) {
alert(`El nombre de usuario "${username}" ya existe.`);
return;
}
const newUser = {
id: 'usr_' + Date.now(),
username, name, email,
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
const title = document.getElementById('servTitle').value.trim();
const cost = parseFloat(document.getElementById('servCost').value);
const date = document.getElementById('servDate').value;
const km = parseInt(document.getElementById('servKm').value);
const shop = document.getElementById('servShop').value.trim();
const notes = document.getElementById('servNotes') ? document.getElementById('servNotes').value.trim() : '';
const receiptInput = document.getElementById('servReceipt');

if (!title) {
alert('Por favor ingresa la descripción del servicio o mantenimiento.');
return;
}

const safeCost = isNaN(cost) || cost < 0 ? 0 : cost;
const safeKm = isNaN(km) || km < 0 ? veh.km : km;

let targetServ = servId ? appState.services.find(s => s.id === servId) : null;

const processAndSave = async (receiptBase64) => {
const servData = {
id: servId || undefined,
vehicleId: veh.id,
category, title, cost: safeCost, date, km: safeKm, shop, notes,
receipt: receiptBase64 || (targetServ ? targetServ.receipt : '')
};

await SyncService.executeCrud(targetServ ? 'UPDATE' : 'CREATE', STORES.SERVICES, servData);

if (safeKm > veh.km) {
veh.km = safeKm;
await SyncService.executeCrud('UPDATE', STORES.VEHICLES, veh);
}

await loadAppStateFromDB();
closeModal('modalService');
document.getElementById('formService').reset();
setTodayDates();
renderApp();
};

if (receiptInput && receiptInput.files && receiptInput.files[0]) {
readAndCompressImage(receiptInput.files[0], processAndSave);
} else {
processAndSave('');
}
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
<h4 style="margin:0 0 6px 0; color:#b45309; font-size:0.95rem;">Mantenimientos Pendientes y Próximos (Para Atención del Mecánico)</h4>
<ul style="margin:0; padding-left:20px; font-size:0.83rem; color:#78350f;">
${reminders.map(r => `
<li style="margin-bottom:4px;">
<strong style="color:#78350f;">${escapeHtml(r.title)}</strong> (${escapeHtml(r.category)}) 
${r.targetKm ? ` • Meta: ${r.targetKm.toLocaleString()} KM` : ''}
${r.targetDate ? ` • Fecha Meta: ${r.targetDate}` : ''}
${r.notes ? ` • <em>${escapeHtml(r.notes)}</em>` : ''}
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

// XML Backup Serialization & Deserialization Engine
function objectToXML(obj, rootName = 'GarageOneBackup') {
function serialize(val, name) {
if (val === null || val === undefined) {
return `<${name} type="null"/>`;
}
const type = typeof val;
if (type === 'boolean' || type === 'number') {
return `<${name} type="${type}">${val}</${name}>`;
}
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









if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
window.print();
}
}

function readAndCompressImage(file, callback) {
if (!file) return callback('');
const reader = new FileReader();
reader.onload = function (e) {
const img = new Image();
img.onload = function () {
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
img.onerror = function () {
callback(e.target.result);
};
img.src = e.target.result;
};
reader.readAsDataURL(file);
}

// XML Backup Serialization & Deserialization Engine
function objectToXML(obj, rootName = 'GarageOneBackup') {
function serialize(val, name) {
if (val === null || val === undefined) {
return `<${name} type="null"/>`;
}
const type = typeof val;
if (type === 'boolean' || type === 'number') {
return `<${name} type="${type}">${val}</${name}>`;
}
if (type === 'string') {
const escaped = val
.replace(/&/g, '&amp;')
document.getElementById('adminUserUsername').value = u.username || '';
document.getElementById('adminUserName').value = u.name || '';
document.getElementById('adminUserEmail').value = u.email || '';
document.getElementById('adminUserPassword').value = '';
document.getElementById('adminUserRole').value = u.role || 'estandar';

const p = u.permissions || getRolePermissionsPreset(u.role || 'estandar');
document.getElementById('permTabGarage').checked = p.tabGarage !== false;
document.getElementById('permTabMaintenance').checked = p.tabMaintenance !== false;
document.getElementById('permTabFuel').checked = p.tabFuel !== false;
document.getElementById('permTabGuantera').checked = p.tabGuantera !== false;
document.getElementById('permTabAI').checked = p.tabAI !== false;
document.getElementById('permTabReports').checked = p.tabReports !== false;

// RULE: Password option appears ONLY if user was created by admin (createdByAdmin === true or admin account)
const isPassEditable = (u.createdByAdmin === true) || (u.username && u.username.toLowerCase() === 'admin');
if (passContainer) {
passContainer.style.display = isPassEditable ? 'block' : 'none';
}
}
} else {
handleAdminRolePresetChange('estandar');
if (passContainer) {
passContainer.style.display = 'block';
}
}

openModal('modalAdminUser');
}

async function saveAdminUser(e) {
e.preventDefault();
const userId = document.getElementById('adminUserId').value;
const username = document.getElementById('adminUserUsername').value.trim();
const name = document.getElementById('adminUserName').value.trim();
const email = document.getElementById('adminUserEmail').value.trim();
const password = document.getElementById('adminUserPassword').value.trim();
const role = document.getElementById('adminUserRole').value;

if (!username || username.length < 2) {
alert('Por favor ingresa un nombre de usuario válido (mínimo 2 caracteres).');
return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
alert('Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).');
return;
}

const permissions = {
tabGarage: role === 'admin' ? true : document.getElementById('permTabGarage').checked,
tabMaintenance: role === 'admin' ? true : document.getElementById('permTabMaintenance').checked,
tabFuel: role === 'admin' ? true : document.getElementById('permTabFuel').checked,
tabGuantera: role === 'admin' ? true : document.getElementById('permTabGuantera').checked,
tabAI: role === 'admin' ? true : document.getElementById('permTabAI').checked,
tabReports: role === 'admin' ? true : document.getElementById('permTabReports').checked,
tabSettings: true,
canManageUsers: role === 'admin'
};

let list = getUsersList();

if (userId) {
const idx = list.findIndex(u => u.id === userId);
if (idx !== -1) {
const existingUser = list[idx];
const existingPass = existingUser.password || '1234';
const isCreatedByAdmin = (existingUser.createdByAdmin === true) || (existingUser.username && existingUser.username.toLowerCase() === 'admin');

const updatedPass = isCreatedByAdmin ? (password ? password : existingPass) : existingPass;

const updatedUser = {
...existingUser,
username,
name,
email,
password: updatedPass,
role,
permissions,
createdByAdmin: isCreatedByAdmin
};

await SyncService.executeCrud('UPDATE', STORES.USERS, updatedUser);

if (currentUser && currentUser.id === userId) {
currentUser = updatedUser;
saveUser(currentUser);
}
}
} else {
const existing = list.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
if (existing) {
alert(`El nombre de usuario "${username}" ya existe.`);
return;
}
const newUser = {
id: 'usr_' + Date.now(),
username, name, email,
password: password || '1234',
role, permissions,
pinEnabled: false, pin: '', createdAt: new Date().toISOString(),
createdByAdmin: true // Tag as created by admin (experimental user)
};

await SyncService.executeCrud('CREATE', STORES.USERS, newUser);
}

closeModal('modalAdminUser');
renderUserSettings();
applyNavigationPermissions();
}

async function deleteAdminUser(userId) {
const list = getUsersList();
const u = list.find(item => item.id === userId);
if (!u) return;

if (u.username && u.username.toLowerCase() === 'admin') {
alert('No puedes eliminar al Administrador principal.');
return;
}

if (confirm(`¿Deseas eliminar al usuario "${u.username}"?`)) {
await SyncService.executeCrud('DELETE', STORES.USERS, { id: userId });
renderUserSettings();
}
}

function renderAdminUsersList() {
const container = document.getElementById('adminUsersListContainer');
if (!container) return;

const usersList = getUsersList();

if (usersList.length === 0) {
container.innerHTML = '<p class="subtitle" style="text-align:center; padding:10px;">No hay usuarios registrados.</p>';
return;
}

const roleBadgeMap = {
admin: { label: 'Administrador', class: 'badge-blue' },
mecanico: { label: 'Mecánico / Taller', class: 'badge-blue' },
cliente: { label: 'Cliente', class: 'badge-blue' },
estandar: { label: 'Estándar', class: 'badge-blue' },
custom: { label: 'Personalizado', class: 'badge-blue' }
};

container.innerHTML = `
<div style="display:flex; flex-direction:column; gap:8px;">
${usersList.map(u => {
const rInfo = roleBadgeMap[u.role || 'estandar'] || roleBadgeMap.estandar;
const p = u.permissions || getRolePermissionsPreset(u.role || 'estandar');
const allowedModules = [
p.tabGarage !== false ? 'Garaje' : '',
p.tabMaintenance !== false ? 'Servicios' : '',
p.tabFuel !== false ? 'Gasolina' : '',
p.tabGuantera !== false ? 'Guantera' : '',
p.tabAI !== false ? 'IA' : '',
p.tabReports !== false ? 'Reportes' : ''
].filter(Boolean).join(', ');

const isSelf = currentUser && currentUser.id === u.id;
const isAdminUser = u.username && u.username.toLowerCase() === 'admin';
const isCreatedByAdmin = (u.createdByAdmin === true) || isAdminUser;

return `
<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
<div style="flex:1; min-width:180px;">
<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
<strong style="font-size:0.92rem; color:#ffffff;">${escapeHtml(u.name || u.username)}</strong>
<span class="badge-subtle ${rInfo.class}" style="font-size:0.72rem; padding:2px 8px;">${rInfo.label}</span>
${isCreatedByAdmin && !isAdminUser ? '<span class="badge-subtle badge-blue" style="font-size:0.7rem; padding:2px 6px;">Creado por Admin</span>' : ''}
${!isCreatedByAdmin ? '<span class="badge-subtle badge-green" style="font-size:0.7rem; padding:2px 6px;">Autorregistrado</span>' : ''}
${isSelf ? '<span style="font-size:0.72rem; color:#38bdf8;">(Tú)</span>' : ''}
</div>
<div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">
Usuario: <strong>${escapeHtml(u.username)}</strong>
</div>
<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
Módulos permitidos: <strong>${allowedModules || 'Ninguno'}</strong>
</div>
</div>
<div style="display:flex; gap:6px;">
<button class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:4px 8px;" onclick="openAdminUserModal('${u.id}')">Editar</button>
${!isAdminUser && !isSelf ? `<button class="btn btn-tertiary btn-sm" style="font-size:0.75rem; padding:4px 8px; color:#ff453a;" onclick="deleteAdminUser('${u.id}')">Eliminar</button>` : ''}
</div>
</div>
`;
}).join('')}
</div>
`;
}


\r
\r

