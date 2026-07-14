const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

function getLinksStore() {
  const siteID = process.env.SINAL_SITE_ID;
  const token = process.env.SINAL_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: 'sinal-links', siteID, token });
  }
  return getStore('sinal-links');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function tokenMatches(token, storedHash) {
  const candidate = hashToken(token);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }

  const { code, destino, editToken } = body;

  if (!code || !destino || !editToken) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Faltam campos obrigatórios.' }) };
  }

  const store = getLinksStore();
  const raw = await store.get(code);
  if (!raw) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Código não encontrado.' }) };
  }

  const data = JSON.parse(raw);
  if (!tokenMatches(editToken, data.tokenHash)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Link de edição inválido pra esse QR code.' }) };
  }

  data.destino = destino;
  data.updatedAt = new Date().toISOString();
  await store.set(code, JSON.stringify(data));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, updatedAt: data.updatedAt }),
  };
};
