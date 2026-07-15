const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = Redis.fromEnv();

// Só minúsculas e números, sem caracteres ambíguos (0/o, 1/l) — fácil de lembrar, escrever à mão ou ditar por telefone
const CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function generateCode(len = 5) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CHARS[crypto.randomInt(0, CHARS.length)];
  }
  return out;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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

  const { destino, tipo, label } = body || {};

  if (!destino || !tipo) {
    return res.status(400).json({ error: 'Faltam campos obrigatórios.' });
  }

  let code;
  for (let attempts = 0; attempts < 6; attempts++) {
    const candidate = generateCode();
    const existing = await redis.get(candidate);
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    return res.status(500).json({ error: 'Não foi possível gerar um código único, tente de novo.' });
  }

  // Token secreto de edição — só é mostrado uma vez, na resposta desta chamada.
  // Só o hash fica guardado; ninguém consegue recuperar o token original depois.
  const editToken = crypto.randomBytes(20).toString('hex');
  const tokenHash = hashToken(editToken);

  const record = {
    destino,
    tipo,
    label: label || '',
    tokenHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(code, JSON.stringify(record));

  return res.status(200).json({ code, editToken });
};
