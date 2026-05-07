// lib/core/geminiClient.js
// Instancia única (singleton) del cliente de Gemini
// Se inicializa una sola vez y se reutiliza en toda la app

const Groq = require("groq-sdk");
const { GROQ_API_KEY, GROQ_MODEL } = require("./constants");

let _client = null;

function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY no está configurada en el archivo .env");
  }
  if (_client) return _client;
  _client = new Groq({ apiKey: GROQ_API_KEY });
  console.log(`✅ [Groq] Cliente inicializado con modelo: ${GROQ_MODEL}`);
  return _client;
}

module.exports = { getGroqClient, GROQ_MODEL };
