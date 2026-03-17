
import { User, ObservationEntry } from '../types';

const DB_NAME = 'MILO_STELLAR_DB_v1';
const USER_STORE = 'users';
const DISCOVERY_STORE = 'discoveries';
const DB_VERSION = 3;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(DISCOVERY_STORE)) {
        db.createObjectStore(DISCOVERY_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const RegistryService = {
  saveUser: async (user: User): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(USER_STORE, 'readwrite');
    tx.objectStore(USER_STORE).put(user);
    return new Promise((res) => (tx.oncomplete = () => res()));
  },

  authenticate: async (email: string, pass: string): Promise<User | null> => {
    const db = await openDB();
    const tx = db.transaction(USER_STORE, 'readonly');
    const store = tx.objectStore(USER_STORE);
    return new Promise((resolve) => {
      const request = store.get(email);
      request.onsuccess = () => {
        const user = request.result as User;
        if (user && user.password === pass) {
          localStorage.setItem('milo_session', btoa(email));
          resolve(user);
        } else {
          resolve(null);
        }
      };
    });
  },

  getActiveSession: async (): Promise<User | null> => {
    const token = localStorage.getItem('milo_session');
    if (!token) return null;
    try {
      const email = atob(token);
      const db = await openDB();
      const tx = db.transaction(USER_STORE, 'readonly');
      const store = tx.objectStore(USER_STORE);
      return new Promise((resolve) => {
        const req = store.get(email);
        req.onsuccess = () => resolve(req.result || null);
      });
    } catch {
      return null;
    }
  },

  logout: () => localStorage.removeItem('milo_session')
};
