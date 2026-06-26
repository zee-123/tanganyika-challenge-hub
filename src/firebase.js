import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcCgQY-MYUoJDExzI6kz9lfar4bTOhJ1M",
  authDomain: "tanganyika-challenge-hub.firebaseapp.com",
  projectId: "tanganyika-challenge-hub",
  storageBucket: "tanganyika-challenge-hub.firebasestorage.app",
  messagingSenderId: "656784965853",
  appId: "1:656784965853:web:0af203ab222e196b1b5b34",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export default app;
