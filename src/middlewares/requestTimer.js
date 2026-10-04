// Middleware PERSONALIZADO (a diferencia de morgan/cors/helmet, este lo escribimos nosotros).
// Mide cuánto tarda cada petición en resolverse.
const requestTimer = (req, res, next) => {
  const start = Date.now();

  // 'finish' se dispara cuando Express ya envió la respuesta completa
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(`[timer] ${req.method} ${req.originalUrl} → ${durationMs}ms`);
  });

  next(); // sin esto, la petición se queda "colgada" para siempre
};

module.exports = requestTimer;
