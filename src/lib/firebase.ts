import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyFakeKeyForLocalDevelopment-Portfolio',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'portfolio-liquid.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'portfolio-liquid',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'portfolio-liquid.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Check if valid Firebase configuration is supplied by user
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('FakeKey')
);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage.
 * If Firebase keys are not yet configured in .env, falls back to local data URL for preview.
 */
export async function uploadPortfolioFile(
  file: File,
  folder: string = 'uploads',
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!isFirebaseConfigured) {
    // Graceful fallback for local development: simulate upload progress and return Data URL or Object URL
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  }

  const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fileRef = ref(storage, `${folder}/${cleanName}`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error('Firebase upload error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

