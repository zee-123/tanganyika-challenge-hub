import { useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export function useNotifications(currentUser) {
  const askedRef = useRef(false);

  useEffect(() => {
    if (!currentUser || askedRef.current || !VAPID_KEY) return;
    askedRef.current = true;

    // Only request if the browser supports it and permission not yet denied
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'denied') return;

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        const messaging = getMessaging();
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });

        if (token) {
          await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
            token,
            uid: currentUser.uid,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }

        // Show in-app notification toast when app is foregrounded
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title && 'Notification' in window) {
            new Notification(title, {
              body,
              icon: '/android-chrome-192x192.png',
              tag: 'challenge-hub-fg',
            });
          }
        });
      } catch {
        // Silently fail — notifications are non-critical
      }
    };

    setup();
  }, [currentUser]);
}
