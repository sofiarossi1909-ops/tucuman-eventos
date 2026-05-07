// lib/core/geminiClient.js
// Instancia única (singleton) del cliente de Gemini
// Se inicializa una sola vez y se reutiliza en toda la app

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY, GEMINI_MODEL } = require("./constants");

let _client = null;
let _model = null;

function getGeminiModel() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en el archivo .env");
  }

  // Si ya fue inicializado, reutilizamos la misma instancia
  if (_model) return _model;

  _client = new GoogleGenerativeAI(GEMINI_API_KEY);
  _model = _client.getGenerativeModel({ model: GEMINI_MODEL });

  console.log(`✅ [Gemini] Cliente inicializado con modelo: ${GEMINI_MODEL}`);
  return _model;
}

module.exports = { getGeminiModel };
