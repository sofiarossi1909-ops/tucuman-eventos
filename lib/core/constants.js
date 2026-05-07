// lib/core/constants.js
// Todas las constantes y configuración centralizada de la app
// Cualquier variable de entorno se lee UNA SOLA VEZ acá

require("dotenv").config();
const path = require("path");

const constants = {
  PORT: process.env.PORT || 3000,

  GROQ_API_KEY: process.env.GROQ_API_KEY || null,
  GROQ_MODEL: "llama-3.3-70b-versatile",
  DB_PATH: path.join(__dirname, "../../data/eventos.json"),
  LOGS_PATH: path.join(__dirname, "../../data/logs.json"),

  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_STRICT_MAX: 20,

  SIMILARITY_THRESHOLD: 0.7,
};

if (!constants.GROQ_API_KEY) {
  console.warn("⚠️  [CONFIG] GROQ_API_KEY no está definida en el .env");
} else {
  console.log("✅ [CONFIG] GROQ_API_KEY cargada correctamente.");
}

module.exports = constants;