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
    getElementById: () => null
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
  Array: Array,
  escapeHtml: s => s
};
vm.createContext(context);

// Extract relevant constants and functions
const codeToRun = `
${appJsContent.substring(appJsContent.indexOf('const DEFAULT_HEALTH_SETTINGS'), appJsContent.indexOf('function openHealthSettingsModal'))}
${appJsContent.substring(appJsContent.indexOf('function formatVehicleDistance'), appJsContent.indexOf('function getActiveVehicle'))}
${appJsContent.substring(appJsContent.indexOf('function calculateMonthsDiff'), appJsContent.indexOf('function renderVehicleHealth'))}
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
console.log('\n¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
