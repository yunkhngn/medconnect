export default async function handler(req, res) {
  try {
    const { channel, uid, expire = 3600 } = req.query;
    if (!channel || !uid) {
      return res.status(400).json({ error: 'Missing channel or uid' });
    }

    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080';
    const url = `${backendBase}/api/agora/token?channel=${encodeURIComponent(channel)}&uid=${encodeURIComponent(uid)}&expire=${encodeURIComponent(expire)}`;

    const resp = await fetch(url, { method: 'GET' });
    const text = await resp.text();
    try {
      const data = JSON.parse(text);
      res.status(resp.status).json(data);
    } catch {
      res.status(resp.status).send(text);
    }
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
}


