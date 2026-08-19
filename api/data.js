import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const url = process.env.APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.APPS_SCRIPT_SHARED_SECRET;

  if (!url || !secret) {
    return res.status(503).json({
      ok: false,
      error: 'Google data bridge is not configured yet.'
    });
  }

  const payload = req.body || {};
  const ts = Date.now();
  const canonical = `${ts}.${JSON.stringify(payload)}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(canonical)
    .digest('hex');

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ts, payload, signature }),
      redirect: 'follow'
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: 'Apps Script returned a non-JSON response.' };
    }

    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: 'Could not reach Google Apps Script.',
      detail: error?.message || String(error)
    });
  }
}
