// routes/ia.js
const express = require("express");
const router = express.Router();
const { getGroqClient, GROQ_MODEL } = require("../lib/core/geminiClient");
const { leerEventos, guardarEventos, escribirLog } = require("../utils/db");
const { strictLimiter } = require("../middleware/antiScraping");

function buildPrompt(evento) {
  return `
Sos un experto en turismo y vida nocturna de Tucumán, Argentina.
Generá una descripción atractiva y breve (máximo 3 oraciones) para el siguiente lugar o evento:

- Nombre: ${evento.nombre}
- Ubicación: ${evento.ubicacion}
- Categoría: ${evento.categoria}

La descripción debe ser en español, amigable, y destacar lo que hace especial a este lugar.
No uses comillas ni asteriscos. Escribí solo el texto de la descripción.
  `.trim();
}

router.post("/describir/:id", strictLimiter, async (req, res) => {
  try {
    const client = getGroqClient();
    const eventos = leerEventos();
    const index = eventos.findIndex((e) => e.id === req.params.id && e.activo);

    if (index === -1) return res.status(404).json({ error: "Evento no encontrado." });

    const result = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: buildPrompt(eventos[index]) }],
    });

    const descripcion = result.choices[0].message.content.trim();
    eventos[index].descripcion = descripcion;
    guardarEventos(eventos);
    escribirLog("IA_DESCRIPCION", `Descripción generada para: ${eventos[index].nombre}`);

    res.json({ mensaje: "Descripción generada y guardada.", evento: eventos[index] });
  } catch (err) {
    console.error("[IA ERROR]", err.message);
    res.status(500).json({ error: "Error al generar la descripción con IA.", detalle: err.message });
  }
});

router.post("/describir-todos", strictLimiter, async (req, res) => {
  try {
    const client = getGroqClient();
    const eventos = leerEventos();
    const sinDesc = eventos.filter((e) => e.activo && (!e.descripcion || e.descripcion === ""));

    if (sinDesc.length === 0) {
      return res.json({ mensaje: "Todos los eventos ya tienen descripción.", actualizados: 0 });
    }

    let actualizados = 0;
    for (const evento of sinDesc) {
      try {
        const result = await client.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: buildPrompt(evento) }],
        });
        const idx = eventos.findIndex((e) => e.id === evento.id);
        eventos[idx].descripcion = result.choices[0].message.content.trim();
        actualizados++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (innerErr) {
        console.error(`[IA ERROR] Fallo en ${evento.nombre}:`, innerErr.message);
      }
    }

    guardarEventos(eventos);
    escribirLog("IA_DESCRIPCION_MASIVA", `Descripciones generadas para ${actualizados} eventos`);
    res.json({ mensaje: `Proceso completado. Se generaron ${actualizados} descripciones.`, actualizados });
  } catch (err) {
    res.status(500).json({ error: "Error en la generación masiva.", detalle: err.message });
  }
});

module.exports = router;