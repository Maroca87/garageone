const fs = require('fs');
const path = require('path');

const repoDir = 'c:/Users/mrodriguez/.gemini/antigravity-ide/scratch/garage_one';

// 1. Check index.html buttons
const htmlPath = path.join(repoDir, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('--- VERIFICANDO INDEX.HTML ---');
const reportsSection = htmlContent.substring(htmlContent.indexOf('id="tabReports"'), htmlContent.indexOf('id="tabSettings"'));

const hasVerExpediente = reportsSection.includes('Ver expediente');
const hasEnviarFichaTecnica = reportsSection.includes('Enviar ficha técnica');
const hasEnviarTexto = reportsSection.includes('Compartir Texto') || reportsSection.includes('Enviar texto');
const hasEnviarCorreo = reportsSection.includes('Enviar por Correo');
const hasFichaPdf = reportsSection.includes('Ficha Técnica (PDF)');

console.log('Tiene "Ver expediente":', hasVerExpediente);
console.log('Tiene "Enviar ficha técnica":', hasEnviarFichaTecnica);
console.log('Tiene "Enviar texto" en reportes (debe ser false):', hasEnviarTexto);
console.log('Tiene "Enviar por correo" en reportes (debe ser false):', hasEnviarCorreo);
console.log('Tiene "Ficha Técnica (PDF)" en reportes (debe ser false):', hasFichaPdf);

if (!hasVerExpediente || !hasEnviarFichaTecnica || hasEnviarTexto || hasEnviarCorreo || hasFichaPdf) {
  console.error('ERROR en botones de index.html');
  process.exit(1);
}

// 2. Test app.js logic
console.log('\n--- VERIFICANDO APP.JS ---');
const appJsPath = path.join(repoDir, 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Check that sendVehicleSpec is defined
if (!appJsContent.includes('function sendVehicleSpec()')) {
  console.error('ERROR: sendVehicleSpec no está definida');
  process.exit(1);
}
console.log('sendVehicleSpec está definida: OK');

// Check that sortServicesDescending is defined
if (!appJsContent.includes('function sortServicesDescending(')) {
  console.error('ERROR: sortServicesDescending no está definida');
  process.exit(1);
}
console.log('sortServicesDescending está definida: OK');

// Evaluate health logic in sandbox
const vm = require('vm');
const context = {
  console: console,
  document: {
    getElementById: () => null,
    addEventListener: () => {}
  },
  window: {},
  navigator: {},
  appState: {
    services: [],
    documents: [],
    reminders: [],
    fuels: [],
    serviceCategories: []
  },
  Date: Date,
  Math: Math,
  Number: Number,
  String: String,
  currentFilter: 'all',
  STORES: { SERVICES: 'services', FUELS: 'fuels', VEHICLES: 'vehicles' },
  Array: Array,
  escapeHtml: s => s
};
vm.createContext(context);

// Extract relevant constants and functions
const codeToRun = `
${appJsContent.substring(appJsContent.indexOf('function reconcileVehicleOdometer'), appJsContent.indexOf('async function deleteFuelDirect'))}
${appJsContent.substring(appJsContent.indexOf('const DEFAULT_HEALTH_SETTINGS'), appJsContent.indexOf('function openHealthSettingsModal'))}
${appJsContent.substring(appJsContent.indexOf('function getVehicleUnit'), appJsContent.indexOf('function getActiveVehicle'))}
${appJsContent.substring(appJsContent.indexOf('function getRelativeTimeString'), appJsContent.indexOf('function renderVehicleHealth'))}
`;

vm.runInContext(codeToRun, context);

// Test 1: sortServicesDescending on same date
const testServices = [
  { id: 'old', date: '2026-09-22', km: 50000, category: 'Filtros' },
  { id: 'new', date: '2026-09-22', km: 100000, category: 'Filtros' }
];
const sorted = context.sortServicesDescending(testServices);
console.log('\nPrueba Ordenamiento Mismo Día:');
console.log('Primero debe ser "new" (100000 km):', sorted[0].id === 'new' ? 'PASÓ' : 'FALLÓ', '(id: ' + sorted[0].id + ')');
if (sorted[0].id !== 'new') process.exit(1);

// Test 2: Calculate health for filters newly registered
const veh = {
  id: 'veh1',
  name: 'Suzuki Vitara',
  km: 100000,
  unitDistance: 'km'
};
context.getActiveVehicle = () => veh;
context.appState.services = [
  { id: 's1', vehicleId: 'veh1', date: '2026-09-22', km: 100000, category: 'Filtros', title: 'Filtros' },
  { id: 's0', vehicleId: 'veh1', date: '2026-09-22', km: 50000, category: 'Filtros', title: 'Filtros' }
];

const healthResult = context.calculateVehicleHealth(veh);
console.log('\nPrueba Salud Filtros Recién Registrado:');
console.log('Score Filtros (debe ser 100):', healthResult.filterData.score, healthResult.filterData.score === 100 ? 'PASÓ' : 'FALLÓ');
console.log('Desgaste Filtros (debe ser 0%):', healthResult.filterData.wearPct, healthResult.filterData.wearPct === 0 ? 'PASÓ' : 'FALLÓ');
if (healthResult.filterData.score !== 100) process.exit(1);

// Test 3: Calculate health for brakes newly registered
context.appState.services.push({
  id: 'b1', vehicleId: 'veh1', date: '2026-09-22', km: 100000, category: 'Frenos', title: 'Frenos', brakePart: 'pastillas_delanteras'
});
const healthResult2 = context.calculateVehicleHealth(veh);
console.log('\nPrueba Salud Frenos Recién Registrado:');
console.log('Score Frenos (debe ser 100):', healthResult2.brakeData.score, healthResult2.brakeData.score === 100 ? 'PASÓ' : 'FALLÓ');
console.log('Desgaste Frenos (debe ser 0%):', healthResult2.brakeData.wearPct, healthResult2.brakeData.wearPct === 0 ? 'PASÓ' : 'FALLÓ');
if (healthResult2.brakeData.score !== 100) process.exit(1);

// Test 4: Tires calculation transparency
context.appState.services.push({
  id: 't1', vehicleId: 'veh1', date: '2025-01-01', km: 62500, category: 'Llantas', title: 'Llantas'
});
// 100000 - 62500 = 37500 km used out of 50000 km lifespan = 75% wear -> 25% health remaining
const healthResult3 = context.calculateVehicleHealth(veh);
console.log('\nPrueba Salud Llantas (37,500 km de uso en vida de 50,000 km):');
console.log('Salud restante Llantas (debe ser 25%):', healthResult3.tireData.score, healthResult3.tireData.score === 25 ? 'PASÓ' : 'FALLÓ');
console.log('Desgaste Llantas (debe ser 75%):', healthResult3.tireData.wearPct, healthResult3.tireData.wearPct === 75 ? 'PASÓ' : 'FALLÓ');
console.log('Texto Mayor Desgaste:', healthResult3.worstWearText);
if (!healthResult3.worstWearText.includes('75% desgaste • 25% salud restante')) {
  console.error('ERROR en formato de worstWearText');
  process.exit(1);
}

// Test 5: Check diagnostic data structure
console.log('\nPrueba Trazabilidad Diagnóstica:');
console.log('presentComponents existe:', Array.isArray(healthResult3.presentComponents));
console.log('Componentes evaluados:', healthResult3.presentComponents.map(c => `${c.name}: score=${c.data.score}%, peso=${c.weight}%, aporte=${c.contributionPts} pts, crítico=${c.isCritical}`).join(' | '));

// =========================================================================
// ODOMETER RECONCILIATION TESTS (MANDATORY CASES)
// =========================================================================
console.log('\n--- PRUEBAS OBLIGATORIAS DE RECONCILIACIÓN DE ODÓMETRO ---');

// CASO OBLIGATORIO 1:
// Odómetro actual: 120.000 km
// Servicio A: 100.000 km
// Servicio B: 110.000 km
// Servicio C: 130.000 km
// Al guardar Servicio C el odómetro sube a 130.000 km.
// Se elimina Servicio C.
// Resultado esperado: Odómetro del vehículo = 110.000 km. No debe quedar en 130.000 km.
const vehOdo1 = { id: 'veh_test1', km: 130000 };
context.appState.vehicles = [vehOdo1];
context.appState.activeVehicleId = 'veh_test1';
context.appState.services = [
  { id: 'servA', vehicleId: 'veh_test1', km: 100000, date: '2026-01-01', category: 'Aceite' },
  { id: 'servB', vehicleId: 'veh_test1', km: 110000, date: '2026-02-01', category: 'Filtros' },
  { id: 'servC', vehicleId: 'veh_test1', km: 130000, date: '2026-03-01', category: 'Frenos' }
];
context.confirm = () => true;
context.saveState = () => {};
context.renderApp = () => {};
context.LocalDB = { delete: async () => {} };

// Simular eliminación de Servicio C
context.deleteServiceDirect('servC');
console.log('\n[CASO 1] Eliminar Servicio C (130.000 km):');
console.log('Odómetro resultante (debe ser 110.000 km):', vehOdo1.km, vehOdo1.km === 110000 ? 'PASÓ' : 'FALLÓ');
if (vehOdo1.km !== 110000) {
  console.error('ERROR EN CASO 1: Odómetro no se reconcilió a 110.000 km');
  process.exit(1);
}

// CASO OBLIGATORIO 2:
// Odómetro actual: 130.000 km
// Servicio A: 100.000 km
// Servicio B: 110.000 km
// Eliminar Servicio A.
// Resultado: Odómetro sigue siendo 130.000 km o el valor legítimo actualmente almacenado.
const vehOdo2 = { id: 'veh_test2', km: 130000 };
context.appState.vehicles = [vehOdo2];
context.appState.activeVehicleId = 'veh_test2';
context.appState.services = [
  { id: 'servA2', vehicleId: 'veh_test2', km: 100000, date: '2026-01-01', category: 'Aceite' },
  { id: 'servB2', vehicleId: 'veh_test2', km: 110000, date: '2026-02-01', category: 'Filtros' }
];

context.deleteServiceDirect('servA2');
console.log('\n[CASO 2] Eliminar Servicio A (100.000 km con odómetro en 130.000 km):');
console.log('Odómetro resultante (debe mantenerse en 130.000 km):', vehOdo2.km, vehOdo2.km === 130000 ? 'PASÓ' : 'FALLÓ');
if (vehOdo2.km !== 130000) {
  console.error('ERROR EN CASO 2: Odómetro disminuyó artificialmente al eliminar servicio antiguo');
  process.exit(1);
}

// CASO 3: CASO ACTUAL DE 1.567.888 KM
// Vehículo afectado por registro de prueba eliminado previamente:
// Odómetro en 1.567.888 km sin servicio existente correspondiente
const vehCorrupted = { id: 'veh_curr', name: 'Auto Afectado', km: 1567888, unitDistance: 'km' };
context.appState.vehicles = [vehCorrupted];
context.appState.activeVehicleId = 'veh_curr';
context.getActiveVehicle = () => vehCorrupted;
context.appState.services = [
  { id: 's_real', vehicleId: 'veh_curr', date: '2026-09-22', km: 100000, category: 'Aceite', title: 'Aceite Sintético' }
];

// Al calcular salud o reconciliar, debe autorepararse a 100.000 km
const healthAutoRepaired = context.calculateVehicleHealth(vehCorrupted);
console.log('\n[CASO ACTUAL] Vehículo con odómetro huérfano de 1.567.888 KM:');
console.log('Odómetro reparado (debe ser 100.000 km):', vehCorrupted.km, vehCorrupted.km === 100000 ? 'PASÓ' : 'FALLÓ');
console.log('Score Aceite recalculado (debe ser 100):', healthAutoRepaired.oilData.score, healthAutoRepaired.oilData.score === 100 ? 'PASÓ' : 'FALLÓ');
console.log('Desgaste Aceite recalculado (debe ser 0%):', healthAutoRepaired.oilData.wearPct, healthAutoRepaired.oilData.wearPct === 0 ? 'PASÓ' : 'FALLÓ');

if (vehCorrupted.km !== 100000 || healthAutoRepaired.oilData.score !== 100) {
  console.error('ERROR EN CASO ACTUAL: No se reparó correctamente el odómetro o la salud');
  process.exit(1);
}

// PRUEBA DE sendVehicleSpec
console.log('\n--- PRUEBA DE EJECUCIÓN DE sendVehicleSpec ---');
const sendSpecCode = `
${appJsContent.substring(appJsContent.indexOf('function sendVehicleSpec()'), appJsContent.indexOf('const I18N_DICT'))}
`;
vm.runInContext(sendSpecCode, context);

let alertCalled = false;
let alertMsg = '';
context.alert = (msg) => { alertCalled = true; alertMsg = msg; };
context.confirm = () => false;
context.prompt = () => {};
context.navigator = {
  clipboard: {
    writeText: async () => {}
  }
};

// Vehículo con datos heterogéneos (números en displacement, booleano en abs, etc.)
const vehMixed = {
  id: 'veh_spec_test',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  km: 45000,
  displacement: 1800, // número
  doors: 4,          // número
  abs: true,         // booleano
  extras: 'Cámara de reversa'
};
context.getActiveVehicle = () => vehMixed;

(async () => {
  context.sendVehicleSpec();
  await new Promise(resolve => setTimeout(resolve, 50));
  console.log('sendVehicleSpec ejecutado sin errores:', alertCalled ? 'PASÓ' : 'FALLÓ', alertMsg ? `(${alertMsg.split('\n')[0]})` : '');
  if (!alertCalled) {
    console.error('ERROR: sendVehicleSpec no respondió con alerta/confirmación');
    process.exit(1);
  }

  console.log('\n¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
})();

