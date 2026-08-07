/**
 * GarageOne - AuthService
 * Single-point offline-first local authentication manager.
 * Stores user profiles natively in LocalDB (IndexedDB) and localStorage.
 */

const DEFAULT_PERMISSIONS = {
  tabGarage: true,
  tabMaintenance: true,
  tabFuel: true,
  tabGuantera: true,
  tabAI: true,
  tabReports: true,
  tabSettings: true,
  canManageUsers: true
};

class AuthServiceEngine {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.cloudSessionActive = false;
    this.passwordRecoveryActive = false;
    this.emailConfirmationActive = false;
    this.onAuthChangedCallbacks = [];
  }

  async init() {
    try {
      await LocalDB.init();
      let storedUserRaw = localStorage.getItem('GARAGEONE_ACTIVE_USER') || localStorage.getItem('GARAGEONE_USER');
      if (storedUserRaw) {
        try {
          this.currentUser = JSON.parse(storedUserRaw);
        } catch (e) {
          this.currentUser = null;
        }
      }

      if (!this.currentUser) {
        const users = await LocalDB.getAll(STORES.USERS);
        if (users && users.length > 0) {
          this.currentUser = users[0];
          localStorage.setItem('GARAGEONE_ACTIVE_USER', JSON.stringify(this.currentUser));
        }
      }
    } catch (e) {
      console.error('[AuthService] Error inicializando sesión local:', e);
    }
  }

  onAuthChanged(cb) {
    if (typeof cb === 'function') {
      this.onAuthChangedCallbacks.push(cb);
    }
  }

  notifyAuthChanged() {
    this.onAuthChangedCallbacks.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }

  isAuthenticated() {
    let isSessionActive = false;
    try {
      isSessionActive = (sessionStorage.getItem('GARAGEONE_SESSION_AUTHENTICATED') === 'true') ||
                        (localStorage.getItem('GARAGEONE_SESSION_AUTHENTICATED') === 'true');
    } catch (e) {}
    return isSessionActive && this.currentUser !== null;
  }

  setSessionAuthenticated(active = true) {
    try {
      if (active) {
        sessionStorage.setItem('GARAGEONE_SESSION_AUTHENTICATED', 'true');
        localStorage.setItem('GARAGEONE_SESSION_AUTHENTICATED', 'true');
      } else {
        sessionStorage.removeItem('GARAGEONE_SESSION_AUTHENTICATED');
        localStorage.removeItem('GARAGEONE_SESSION_AUTHENTICATED');
      }
    } catch (e) {}
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isPasswordRecoveryActive() {
    return this.passwordRecoveryActive;
  }

  isEmailConfirmationActive() {
    return this.emailConfirmationActive;
  }

  hasCloudSession() {
    return false;
  }

  async login(emailOrUser, password) {
    if (!emailOrUser) throw new Error('Ingresa tu correo o nombre de usuario.');
    const users = await LocalDB.getAll(STORES.USERS);
    const cleanQuery = String(emailOrUser).trim().toLowerCase();
    
    let matchedUser = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanQuery) ||
      (u.username && u.username.toLowerCase() === cleanQuery)
    );

    if (!matchedUser) {
      // Auto-create local user profile on first login for instant access
      matchedUser = {
        id: LocalDB.generateUUID(),
        email: cleanQuery.includes('@') ? cleanQuery : `${cleanQuery}@garageone.local`,
        username: cleanQuery.includes('@') ? cleanQuery.split('@')[0] : cleanQuery,
        name: cleanQuery.includes('@') ? cleanQuery.split('@')[0] : cleanQuery,
        password: password || '',
        role: 'estandar',
        permissions: DEFAULT_PERMISSIONS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await LocalDB.put(STORES.USERS, matchedUser);
    } else if (password && matchedUser.password && matchedUser.password !== password) {
      throw new Error('La contraseña ingresada no es correcta.');
    }

    this.currentUser = matchedUser;
    this.setSessionAuthenticated(true);
    try {
      localStorage.setItem('GARAGEONE_ACTIVE_USER', JSON.stringify(matchedUser));
      localStorage.setItem('GARAGEONE_USER', JSON.stringify(matchedUser));
    } catch (e) {}
    this.notifyAuthChanged();
    return this.currentUser;
  }

  async register(emailOrUser, password, userData = {}) {
    if (!emailOrUser) throw new Error('Ingresa un nombre de usuario o correo válido.');

    const users = await LocalDB.getAll(STORES.USERS);
    const cleanQuery = String(emailOrUser).trim().toLowerCase();

    const existing = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanQuery) ||
      (u.username && u.username.toLowerCase() === cleanQuery)
    );
    if (existing) {
      throw new Error('Ya existe una cuenta con este nombre o correo en este dispositivo.');
    }

    const isFirstUser = !users || users.length === 0;

    const newUser = {
      id: LocalDB.generateUUID(),
      email: cleanQuery.includes('@') ? cleanQuery : `${cleanQuery}@garageone.local`,
      username: userData.username || (cleanQuery.includes('@') ? cleanQuery.split('@')[0] : cleanQuery),
      name: userData.name || (cleanQuery.includes('@') ? cleanQuery.split('@')[0] : cleanQuery),
      password: password || '',
      role: isFirstUser ? 'admin' : (userData.role || 'estandar'),
      permissions: isFirstUser ? { tabGarage: true, tabMaintenance: true, tabFuel: true, tabGuantera: true, tabAI: true, tabReports: true, tabSettings: true, canManageUsers: true } : DEFAULT_PERMISSIONS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await LocalDB.put(STORES.USERS, newUser);
    this.currentUser = newUser;
    this.setSessionAuthenticated(true);
    try {
      localStorage.setItem('GARAGEONE_ACTIVE_USER', JSON.stringify(newUser));
      localStorage.setItem('GARAGEONE_USER', JSON.stringify(newUser));
    } catch (e) {}
    this.notifyAuthChanged();
    return this.currentUser;
  }

  async logout() {
    this.currentUser = null;
    this.setSessionAuthenticated(false);
    try {
      localStorage.removeItem('GARAGEONE_ACTIVE_USER');
      localStorage.removeItem('GARAGEONE_USER');
    } catch (e) {}
    this.notifyAuthChanged();
    return true;
  }

  async resetPasswordLocal(emailOrUser, newPassword) {
    if (!emailOrUser) throw new Error('Ingresa un usuario o correo válido.');
    if (!newPassword) throw new Error('Ingresa tu nueva contraseña.');
    
    const users = await LocalDB.getAll(STORES.USERS);
    const cleanQuery = String(emailOrUser).trim().toLowerCase();

    let matchedUser = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanQuery) ||
      (u.username && u.username.toLowerCase() === cleanQuery)
    );

    if (!matchedUser) {
      throw new Error('No se encontró ninguna cuenta registrada con este nombre o correo.');
    }

    matchedUser.password = newPassword;
    matchedUser.updatedAt = new Date().toISOString();
    await LocalDB.put(STORES.USERS, matchedUser);
    return matchedUser;
  }

  async updatePassword(password) {
    if (!password) throw new Error('Ingresa una contraseña válida.');
    if (this.currentUser) {
      this.currentUser.password = password;
      this.currentUser.updatedAt = new Date().toISOString();
      await LocalDB.put(STORES.USERS, this.currentUser);
      try {
        localStorage.setItem('GARAGEONE_ACTIVE_USER', JSON.stringify(this.currentUser));
      } catch (e) {}
    }
    this.passwordRecoveryActive = false;
    return true;
  }
}

// Global Singleton Instance
window.AuthService = new AuthServiceEngine();
