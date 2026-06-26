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
    if (!VAPID_KEY) { console.warn('FCM: VITE_FCM_VAPID_KEY not set'); return; }

    askedRef.current = true;

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Register the FCM service worker explicitly at its own scope
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;

        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: reg,
        });

        if (token) {
          console.log('FCM token saved:', token.slice(0, 20) + '…');
          await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
            token,
            uid: currentUser.uid,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } else {
          console.warn('FCM: no token returned');
        }

        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title) new Notification(title, { body, icon: '/android-chrome-192x192.png' });
        });
      } catch (err) {
        console.error('FCM setup error:', err);
      }
    };

    setup();
  }, [currentUser]);
}
