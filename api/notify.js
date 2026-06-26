// Vercel serverless function — broadcasts push notifications via FCM V1 API
// Env vars required in Vercel dashboard:
//   FIREBASE_SERVICE_ACCOUNT  — full service account JSON (stringified)
//   NOTIFY_SECRET             — any secret string you choose

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { secret, title, body, tokens } = req.body || {};

  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  if (!tokens?.length) return res.status(400).json({ error: 'No tokens provided' });

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }

    const messaging = getMessaging();

    // FCM V1 multicast — max 500 tokens per call
    const CHUNK = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < tokens.length; i += CHUNK) {
      const chunk = tokens.slice(i, i + CHUNK);
      const result = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        webpush: {
          notification: { icon: '/android-chrome-192x192.png', badge: '/favicon-32x32.png' },
          fcmOptions: { link: '/dashboard' },
        },
      });
      successCount += result.successCount;
      failureCount += result.failureCount;
    }

    return res.status(200).json({ ok: true, successCount, failureCount });
  } catch (err) {
    console.error('FCM error:', err);
    return res.status(500).json({ error: err.message });
  }
}
