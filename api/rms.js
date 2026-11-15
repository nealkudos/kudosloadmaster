// Read-only connection to Current RMS for LOADMASTER.
// The API key lives in Vercel environment variables and never reaches the browser.
//
// Environment variables (set in Vercel > Project > Settings > Environment Variables):
//   RMS_API_KEY          your Current RMS API key
//   LOADMASTER_PASSCODE  a passcode you choose; the page asks for it
//   RMS_SUBDOMAIN        optional, defaults to "kudosgroup"
//   RMS_BASE_URL         optional, defaults to https://api.current-rms.com/api/v1

const crypto = require('crypto');

// Only these read-only requests are allowed through:
//   /opportunities, /opportunities/<id>, /opportunities/<id>/opportunity_items
const ALLOWED_PATH = /^\/opportunities(\/\d+(\/opportunity_items)?)?$/;
const ALLOWED_PARAM = /^(page|per_page|q\[[a-z_]+\]|include\[\])$/;

function same(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const key = process.env.RMS_API_KEY;
  const pass = process.env.LOADMASTER_PASSCODE;
  const sub = process.env.RMS_SUBDOMAIN || 'kudosgroup';
  const base = process.env.RMS_BASE_URL || 'https://api.current-rms.com/api/v1';

  if (!key || !pass) {
    return res.status(500).json({ error: 'Not set up yet: RMS_API_KEY and LOADMASTER_PASSCODE are missing in Vercel.' });
  }
  if (!same(req.headers['x-passcode'], pass)) {
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Wrong passcode' });
  }

  const incoming = new URL(req.url, 'http://localhost').searchParams;
  const path = incoming.get('path') || '';
  if (!ALLOWED_PATH.test(path)) return res.status(400).json({ error: 'That Current RMS request is not allowed.' });

  const out = new URLSearchParams();
  for (const [k, v] of incoming) {
    if (k === 'path') continue;
    if (!ALLOWED_PARAM.test(k) || v.length > 200) return res.status(400).json({ error: 'That search option is not allowed.' });
    out.append(k, v);
  }

  try {
    const qs = out.toString();
    const upstream = await fetch(base + path + (qs ? '?' + qs : ''), {
      headers: { 'X-AUTH-TOKEN': key, 'X-SUBDOMAIN': sub, Accept: 'application/json' }
    });
    if (upstream.status === 401 || upstream.status === 403) {
      return res.status(502).json({ error: 'Current RMS rejected the API key. Check RMS_API_KEY and RMS_SUBDOMAIN in Vercel.' });
    }
    const text = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(upstream.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach Current RMS.' });
  }
};
