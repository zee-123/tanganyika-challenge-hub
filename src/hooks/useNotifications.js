import { useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export function useNotifications(currentUser) {
  const askedRef = useRef(false);

  useEffect(() => {
    if (!currentUser || askedRef.current) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'denied') return;
    if (!VAPID_KEY) { console.warn('FCM: VITE_FCM_VAPID_KEY missing'); return; }

    askedRef.current = true;

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') { console.log('FCM: permission not granted'); return; }

        console.log('FCM: permission granted, getting token...');

        // Wait for any existing SW to be ready, then also register FCM SW
        let swReg;
        try {
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-push-scope' });
          await swReg.update();
          console.log('FCM: SW registered at', swReg.scope);
        } catch (swErr) {
          console.warn('FCM: SW registration failed, trying without:', swErr.message);
          swReg = undefined;
        }

        const messaging = getMessaging();
        const tokenOptions = { vapidKey: VAPID_KEY };
        if (swReg) tokenOptions.serviceWorkerRegistration = swReg;

        const token = await getToken(messaging, tokenOptions);

        if (token) {
          console.log('FCM: token obtained, saving to Firestore...');
          await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
            token,
            uid: currentUser.uid,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          console.log('FCM: token saved successfully ✅');
        } else {
          console.warn('FCM: no token returned — check VAPID key and SW');
        }

        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title) new Notification(title, { body, icon: '/android-chrome-192x192.png' });
        });
      } catch (err) {
        console.error('FCM setup error:', err.code || err.message, err);
      }
    };

    setup();
  }, [currentUser]);
}
