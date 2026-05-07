// index.js
// Punto de entrada principal de la API

const express = require("express");
const { PORT } = require("./lib/core/constants"); // carga dotenv y valida config
const cors = require("cors");

const {
  limiter,
  blockSuspiciousAgents,
  requireHeaders,
  errorHandler,
} = require("./middleware/antiScraping");

const eventosRouter = require("./routes/eventos");
const iaRouter = require("./routes/ia");

const app = express();


// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors());                     // Permite peticiones desde el frontend
app.use(express.json());             // Parsea el body como JSON
app.use(express.static("public"));   // Sirve el frontend (index.html)
app.use(limiter);                    // Rate limiting general
app.use(requireHeaders);             // Requiere User-Agent
app.use(blockSuspiciousAgents);      // Bloquea bots/scrapers conocidos

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use("/eventos", eventosRouter);
app.use("/ia", iaRouter);

// ─── Ruta raíz (health check) ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Bares y Eventos de Tucumán funcionando ✅",
    version: "1.0.0",
    endpoints: {
      GET:    ["/eventos", "/eventos/:id", "/eventos/logs/historial"],
      POST:   ["/eventos", "/ia/describir/:id", "/ia/describir-todos"],
      PUT:    ["/eventos/:id"],
      DELETE: ["/eventos/:id"],
    },
  });
});

// ─── Ruta 404 ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// ─── Manejo global de errores ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET    http://localhost:${PORT}/eventos`);
  console.log(`   POST   http://localhost:${PORT}/eventos`);
  console.log(`   PUT    http://localhost:${PORT}/eventos/:id`);
  console.log(`   DELETE http://localhost:${PORT}/eventos/:id`);
  console.log(`   POST   http://localhost:${PORT}/ia/describir-todos\n`);
});

module.exports = app;
