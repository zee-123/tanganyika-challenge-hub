// Vercel serverless function — broadcasts a push notification to all stored FCM tokens
// Env vars required (set in Vercel dashboard):
//   FCM_SERVER_KEY  — Firebase Cloud Messaging legacy server key
//   NOTIFY_SECRET   — A secret string to prevent unauthorized calls (set to anything you like)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { secret, title, body, tokens } = req.body || {};

  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  if (!tokens || !tokens.length) return res.status(400).json({ error: 'No tokens provided' });

  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) return res.status(500).json({ error: 'FCM_SERVER_KEY not configured' });

  // FCM Legacy HTTP API — send to up to 1000 tokens at a time
  const CHUNK = 1000;
  const results = [];

  for (let i = 0; i < tokens.length; i += CHUNK) {
    const chunk = tokens.slice(i, i + CHUNK);
    const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify({
        registration_ids: chunk,
        notification: { title, body, icon: '/android-chrome-192x192.png' },
        data: { click_action: '/dashboard' },
      }),
    });
    const json = await fcmRes.json();
    results.push(json);
  }

  return res.status(200).json({ ok: true, results });
}
