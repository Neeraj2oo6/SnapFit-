import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

/**
 * Standard Firebase Web App configuration from Vite environment variables.
 * Rule: Must strictly use import.meta.env with VITE_ prefix.
 */
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

/**
 * Validates that an environment variable contains a genuine, non-placeholder value.
 * Rejects empty strings, placeholders (e.g. PASTE_YOUR_..., your_..., example, placeholder).
 */
export const isConfigValueProvided = (val) => {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim().toLowerCase();
  if (
    s === '' ||
    s.startsWith('paste_your_') ||
    s.startsWith('your_') ||
    s.startsWith('your-') ||
    s.includes('actual_api_key') ||
    s.includes('project_id') ||
    s.includes('sender_id') ||
    s.includes('app_id') ||
    s.includes('placeholder') ||
    s.includes('example') ||
    s === 'undefined' ||
    s === 'null'
  ) {
    return false;
  }
  return true;
};

/**
 * Validates all 6 required Vite Firebase environment variables.
 * Returns array of missing/placeholder variable names.
 */
export const getMissingFirebaseConfig = () => {
  const missing = [];
  if (!isConfigValueProvided(firebaseConfig.apiKey) || firebaseConfig.apiKey.trim().length < 20) {
    missing.push('VITE_FIREBASE_API_KEY');
  }
  if (!isConfigValueProvided(firebaseConfig.authDomain)) {
    missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  }
  if (!isConfigValueProvided(firebaseConfig.projectId)) {
    missing.push('VITE_FIREBASE_PROJECT_ID');
  }
  if (!isConfigValueProvided(firebaseConfig.storageBucket)) {
    missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  }
  if (!isConfigValueProvided(firebaseConfig.messagingSenderId)) {
    missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  }
  if (!isConfigValueProvided(firebaseConfig.appId)) {
    missing.push('VITE_FIREBASE_APP_ID');
  }
  return missing;
};

/**
 * Boolean flag: true ONLY when all 6 required Firebase keys are present with genuine values.
 */
export const isFirebaseConfigured = getMissingFirebaseConfig().length === 0;

/**
 * Firebase Connection Status architecture.
 * Possible states:
 * - "configuration_missing" : Required .env variables are missing or placeholders.
 * - "connecting"            : Valid config present, initializing Firebase client.
 * - "connected"             : Successfully initialized and connected to Firebase services.
 * - "connection_error"      : Initialization or network connection error occurred.
 */
let connectionStatus = isFirebaseConfigured ? 'connecting' : 'configuration_missing';
let connectionError = null;

export const getFirebaseConnectionStatus = () => ({
  status: connectionStatus,
  isConfigured: isFirebaseConfigured,
  missingKeys: getMissingFirebaseConfig(),
  error: connectionError
});

// Singletons for Firebase services
let app = null;
let auth = null;
let db = null;
let storage = null;
let functions = null;

if (isFirebaseConfigured) {
  try {
    // Prevent duplicate initialization: use getApps() and getApp()
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    // Initialize Firebase Auth with persistent local session
    auth = getAuth(app);
    try {
      setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn('Firebase setPersistence warning:', err.message);
      });
    } catch (persistErr) {
      console.warn('Firebase auth persistence error:', persistErr.message);
    }

    // Initialize Cloud Firestore with multi-tab offline cache
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      db = getFirestore(app);
    }

    // Initialize Firebase Storage
    try {
      storage = getStorage(app);
    } catch (storageErr) {
      console.warn('Firebase Storage init error:', storageErr.message);
    }

    // Initialize Firebase Cloud Functions
    try {
      functions = getFunctions(app);
    } catch (funcErr) {
      console.warn('Firebase Functions init error:', funcErr.message);
    }

    connectionStatus = 'connected';
    console.info('✓ Firebase successfully initialized with Project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('Firebase initialization encountered an unexpected error:', error);
    connectionStatus = 'connection_error';
    connectionError = error?.message || 'Failed to initialize Firebase';
    app = null;
    auth = null;
    db = null;
    storage = null;
    functions = null;
  }
} else {
  connectionStatus = 'configuration_missing';
  const missing = getMissingFirebaseConfig();
  console.info(
    `[SnapFit Firebase Notice] Firebase configuration pending. Missing/placeholder variables: ${missing.join(', ')}.`
  );
}

export const firebaseApp = app;
export { app, auth, db, storage, functions };
export default app;
