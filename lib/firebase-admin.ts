import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

export const adminApp = getApps()[0] || (projectId && clientEmail && privateKey
  ? initializeApp({
      credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
      storageBucket,
    })
  : undefined as any);

export const dbAdmin = adminApp ? getFirestore(adminApp) : undefined as any;
export const storageAdmin = adminApp ? getStorage(adminApp) : undefined as any;

