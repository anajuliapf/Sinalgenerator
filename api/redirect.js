const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

function parseRecord(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.status(400).send('Código não informado.');
    return;
  }

  const raw = await redis.get(code);

  if (!raw) {
    res.status(404).send('Esse QR code não existe ou foi removido.');
    return;
  }

  const data = parseRecord(raw);
  res.writeHead(302, { Location: data.destino });
  res.end();
};
