// routes/eventos.js
// CRUD completo para bares y eventos de Tucumán

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { leerEventos, guardarEventos, escribirLog } = require("../utils/db");
const { strictLimiter } = require("../middleware/antiScraping");

// ─── GET /eventos ─────────────────────────────────────────────────────────────
// Lista todos los eventos activos. Soporta ?categoria=bar y ?nombre=cafe
router.get("/", (req, res) => {
  try {
    let eventos = leerEventos().filter((e) => e.activo);

    // Filtro opcional por categoría
    if (req.query.categoria) {
      eventos = eventos.filter(
        (e) => e.categoria.toLowerCase() === req.query.categoria.toLowerCase()
      );
    }

    // Filtro opcional por nombre (búsqueda parcial)
    if (req.query.nombre) {
      eventos = eventos.filter((e) =>
        e.nombre.toLowerCase().includes(req.query.nombre.toLowerCase())
      );
    }

    res.json({ total: eventos.length, datos: eventos });
  } catch (err) {
    res.status(500).json({ error: "Error al leer los eventos." });
  }
});

// ─── GET /eventos/:id ─────────────────────────────────────────────────────────
// Trae un evento por su ID
router.get("/:id", (req, res) => {
  try {
    const eventos = leerEventos();
    const evento = eventos.find((e) => e.id === req.params.id && e.activo);

    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar el evento." });
  }
});

// ─── POST /eventos ────────────────────────────────────────────────────────────
// Crea un nuevo evento. Campos requeridos: nombre, ubicacion, categoria
router.post("/", strictLimiter, (req, res) => {
  try {
    const { nombre, ubicacion, categoria, fuente, descripcion } = req.body;

    // Validación básica
    if (!nombre || !ubicacion || !categoria) {
      return res.status(400).json({
        error: "Faltan campos requeridos: nombre, ubicacion, categoria.",
      });
    }

    const eventos = leerEventos();

    // Verificar duplicado exacto por nombre (case-insensitive)
    const duplicado = eventos.find(
      (e) => e.nombre.toLowerCase() === nombre.toLowerCase() && e.activo
    );
    if (duplicado) {
      return res.status(409).json({
        error: "Ya existe un evento con ese nombre.",
        existente: duplicado,
      });
    }

    const nuevo = {
      id: uuidv4(),
      nombre,
      ubicacion,
      categoria,
      fuente: fuente || "manual",
      fechaObtencion: new Date().toISOString().split("T")[0],
      activo: true,
      descripcion: descripcion || "",
    };

    eventos.push(nuevo);
    guardarEventos(eventos);
    escribirLog("CREAR", `Nuevo evento: ${nombre}`);

    res.status(201).json({ mensaje: "Evento creado correctamente.", evento: nuevo });
  } catch (err) {
    res.status(500).json({ error: "Error al crear el evento." });
  }
});

// ─── PUT /eventos/:id ─────────────────────────────────────────────────────────
// Actualiza un evento existente
router.put("/:id", strictLimiter, (req, res) => {
  try {
    const eventos = leerEventos();
    const index = eventos.findIndex((e) => e.id === req.params.id && e.activo);

    if (index === -1) {
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    // Merge: mantenemos los campos que no se envían
    const actualizado = {
      ...eventos[index],
      ...req.body,
      id: eventos[index].id, // el id nunca cambia
      activo: true,
    };

    eventos[index] = actualizado;
    guardarEventos(eventos);
    escribirLog("EDITAR", `Evento editado: ${actualizado.nombre} (id: ${actualizado.id})`);

    res.json({ mensaje: "Evento actualizado.", evento: actualizado });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el evento." });
  }
});

// ─── DELETE /eventos/:id ──────────────────────────────────────────────────────
// Desactiva (soft delete) un evento — no lo borra físicamente
router.delete("/:id", strictLimiter, (req, res) => {
  try {
    const eventos = leerEventos();
    const index = eventos.findIndex((e) => e.id === req.params.id && e.activo);

    if (index === -1) {
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    eventos[index].activo = false;
    guardarEventos(eventos);
    escribirLog("ELIMINAR", `Evento desactivado: ${eventos[index].nombre} (id: ${req.params.id})`);

    res.json({ mensaje: "Evento desactivado correctamente." });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el evento." });
  }
});

// ─── GET /eventos/logs/historial ──────────────────────────────────────────────
// Devuelve el historial de acciones (logs)
router.get("/logs/historial", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const logs = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/logs.json"), "utf-8")
    );
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: "Error al leer los logs." });
  }
});

module.exports = router;
