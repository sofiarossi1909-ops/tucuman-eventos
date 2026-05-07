// lib/core/constants.js
// Todas las constantes y configuración centralizada de la app
// Cualquier variable de entorno se lee UNA SOLA VEZ acá

require("dotenv").config();

const constants = {
  // ── Servidor ──────────────────────────────────────────────────────────────
  PORT: process.env.PORT || 3000,

  // ── Gemini IA ─────────────────────────────────────────────────────────────
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  GEMINI_MODEL: "gemini-2.0-flash-lite",

  // ── Paths ─────────────────────────────────────────────────────────────────
  DB_PATH: require("path").join(__dirname, "../../data/eventos.json"),
  LOGS_PATH: require("path").join(__dirname, "../../data/logs.json"),

  // ── Anti-scraping ─────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_STRICT_MAX: 20,

  // ── Duplicados ────────────────────────────────────────────────────────────
  SIMILARITY_THRESHOLD: 0.7,
};

// Validación al arrancar: avisa si falta la API key
if (!constants.GEMINI_API_KEY) {
  console.warn("  [CONFIG] GEMINI_API_KEY no está definida en el .env — la IA no va a funcionar.");
} else {
  console.log("[CONFIG] GEMINI_API_KEY cargada correctamente.");
}

module.exports = constants;
