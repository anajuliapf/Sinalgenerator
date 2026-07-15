const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = Redis.fromEnv();

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

function parseRecord(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'JSON inválido.' });
    }
  }

  const { code, destino, editToken } = body || {};

  if (!code || !destino || !editToken) {
    return res.status(400).json({ error: 'Faltam campos obrigatórios.' });
  }

  const raw = await redis.get(code);
  if (!raw) {
    return res.status(404).json({ error: 'Código não encontrado.' });
  }

  const data = parseRecord(raw);
  if (!tokenMatches(editToken, data.tokenHash)) {
    return res.status(401).json({ error: 'Link de edição inválido pra esse QR code.' });
  }

  data.destino = destino;
  data.updatedAt = new Date().toISOString();
  await redis.set(code, JSON.stringify(data));

  return res.status(200).json({ ok: true, updatedAt: data.updatedAt });
};
