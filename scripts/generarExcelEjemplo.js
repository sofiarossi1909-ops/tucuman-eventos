// scripts/generarExcelEjemplo.js
// Crea el archivo nuevos_eventos.xlsx de ejemplo para probar la automatización

const XLSX = require("xlsx");
const path = require("path");

const datos = [
  { nombre: "La Yapa Bar", ubicacion: "Crisóstomo Álvarez 502, Tucumán", categoria: "bar", fuente: "excel" },
  { nombre: "Café del Centro", ubicacion: "San Martín 678, Tucumán", categoria: "cafe", fuente: "excel" },
  // Este es un duplicado difuso: "Bar El Español" ya está en la DB
  { nombre: "El Español Bar", ubicacion: "25 de Mayo 453, Tucumán", categoria: "bar", fuente: "excel" },
  { nombre: "Pacha Tucumán", ubicacion: "Av. Belgrano 1800, Tucumán", categoria: "boliche", fuente: "excel" },
  { nombre: "Feria Artesanal del Parque", ubicacion: "Parque 9 de Julio, Tucumán", categoria: "evento", fuente: "excel" },
];

const ws = XLSX.utils.json_to_sheet(datos);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Eventos");

const outputPath = path.join(__dirname, "../automation/nuevos_eventos.xlsx");
XLSX.writeFile(wb, outputPath);

console.log("✅ Excel de ejemplo generado en:", outputPath);
console.log("📊 Filas incluidas:", datos.length);
console.log('ℹ️  "El Español Bar" debería detectarse como duplicado de "Bar El Español"');
