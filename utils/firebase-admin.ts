import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
};

const apps = getApps();

if (!apps.length) {
  initializeApp(firebaseAdminConfig);
}

export const auth = getAuth(); 