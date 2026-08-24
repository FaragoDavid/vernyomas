import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: 'vernyomas-deb42.firebaseapp.com',
  projectId: 'vernyomas-deb42',
  storageBucket: 'vernyomas-deb42.firebasestorage.app',
  messagingSenderId: '160195154757',
  appId: '1:160195154757:web:197b467d764b65a023642c',
});

export const db = getFirestore(app);
export { app };
