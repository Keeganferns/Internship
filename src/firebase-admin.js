import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin with environment variables
const adminConfig = {
  credential: cert({
    type: 'service_account',
    project_id: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    private_key_id: import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: import.meta.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: import.meta.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: import.meta.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: import.meta.env.FIREBASE_ADMIN_AUTH_URI,
    token_uri: import.meta.env.FIREBASE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: import.meta.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: import.meta.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com'
  })
};

// Initialize the admin app if it doesn't exist
const adminApp = getApps().length === 0 ? initializeApp(adminConfig) : getApps()[0];

// Initialize services
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };
