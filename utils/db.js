// utils/db.js
// Helpers para leer/escribir la base de datos JSON
// Usa los paths centralizados desde lib/core/constants

const fs = require("fs");
const { DB_PATH, LOGS_PATH } = require("../lib/core/constants");

// Leer todos los eventos del JSON
function leerEventos() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

// Guardar el array completo al JSON
function guardarEventos(datos) {
  fs.writeFileSync(DB_PATH, JSON.stringify(datos, null, 2), "utf-8");
}

// Escribir un log de acción
function escribirLog(accion, detalle) {
  const logs = JSON.parse(fs.readFileSync(LOGS_PATH, "utf-8"));
  logs.push({
    fecha: new Date().toISOString(),
    accion,
    detalle,
  });
  fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

module.exports = { leerEventos, guardarEventos, escribirLog };
