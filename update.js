const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

function parseRecord(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Código não informado.' });
  }

  const raw = await redis.get(code);

  if (!raw) {
    return res.status(404).json({ error: 'Código não encontrado.' });
  }

  const data = parseRecord(raw);

  return res.status(200).json({
    destino: data.destino,
    tipo: data.tipo,
    label: data.label,
    updatedAt: data.updatedAt,
  });
};
