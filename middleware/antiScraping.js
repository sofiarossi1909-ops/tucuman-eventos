// middleware/antiScraping.js
// Protege la API contra scraping agresivo y peticiones maliciosas

const rateLimit = require("express-rate-limit");

// ─── 1. Rate Limiter general ────────────────────────────────────────────────
// Máximo 100 peticiones por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas peticiones desde esta IP. Intentá de nuevo en 15 minutos.",
  },
});

// ─── 2. Rate Limiter estricto para rutas sensibles ──────────────────────────
// Máximo 20 peticiones por IP cada 15 minutos (para POST/PUT/DELETE)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Límite de escritura alcanzado. Intentá de nuevo más tarde.",
  },
});

// ─── 3. Bloqueo de User-Agents sospechosos ──────────────────────────────────
const blockSuspiciousAgents = (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  const bloqueados = ["python-requests", "curl", "wget", "scrapy", "bot", "crawler", "spider"];

  const esSospechoso = bloqueados.some((agente) =>
    ua.toLowerCase().includes(agente)
  );

  if (esSospechoso) {
    return res.status(403).json({
      error: "Acceso denegado: User-Agent no permitido.",
    });
  }
  next();
};

// ─── 4. Validación de headers mínimos ───────────────────────────────────────
const requireHeaders = (req, res, next) => {
  const ua = req.headers["user-agent"];
  if (!ua || ua.trim() === "") {
    return res.status(400).json({
      error: "Petición inválida: falta User-Agent.",
    });
  }
  next();
};

// ─── 5. Manejo global de errores ────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido en el body." });
  }

  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor.",
  });
};

module.exports = { limiter, strictLimiter, blockSuspiciousAgents, requireHeaders, errorHandler };
