// automation/cargarDesdeExcel.js
// Script de automatización: lee un Excel y carga los datos en eventos.json
// Evita duplicados usando comparación de nombres (exacta y difusa)
// Registra logs de todo el proceso

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/eventos.json");
const LOGS_PATH = path.join(__dirname, "../data/logs.json");
const EXCEL_PATH = path.join(__dirname, "nuevos_eventos.xlsx");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function leerEventos() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function guardarEventos(datos) {
  fs.writeFileSync(DB_PATH, JSON.stringify(datos, null, 2), "utf-8");
}

function escribirLog(accion, detalle) {
  const logs = JSON.parse(fs.readFileSync(LOGS_PATH, "utf-8"));
  logs.push({ fecha: new Date().toISOString(), accion, detalle });
  fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

function generarId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// ─── Detección difusa de duplicados ──────────────────────────────────────────
// Normaliza un nombre quitando tildes, espacios extra y pasando a minúsculas
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s]/g, "")     // quita caracteres especiales
    .replace(/\s+/g, " ")            // normaliza espacios
    .trim();
}

// Calcula similitud entre dos strings (algoritmo de Jaccard sobre bigramas)
function similitud(a, b) {
  const normA = normalizar(a);
  const normB = normalizar(b);

  if (normA === normB) return 1;

  // Bigramas: ["ba","ar","rr"] de "bar"
  function bigramas(s) {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s[i] + s[i + 1]);
    return set;
  }

  const bgA = bigramas(normA);
  const bgB = bigramas(normB);
  const interseccion = [...bgA].filter((x) => bgB.has(x)).length;
  const union = new Set([...bgA, ...bgB]).size;

  return union === 0 ? 0 : interseccion / union;
}

// Busca si ya existe un evento similar en la base de datos
// Umbral: 0.7 = 70% de similitud → probable duplicado
function esDuplicado(nuevoNombre, eventosExistentes, umbral = 0.7) {
  for (const e of eventosExistentes) {
    if (!e.activo) continue;
    const sim = similitud(nuevoNombre, e.nombre);
    if (sim >= umbral) {
      return { duplicado: true, similitudContra: e.nombre, score: sim.toFixed(2) };
    }
  }
  return { duplicado: false };
}

// ─── Proceso principal ────────────────────────────────────────────────────────
function ejecutarAutomatizacion() {
  console.log("\n🤖 Iniciando automatización...\n");
  escribirLog("AUTOMATIZACION_INICIO", "Inicio de carga desde Excel");

  // Verificar que existe el Excel
  if (!fs.existsSync(EXCEL_PATH)) {
    const msg = `No se encontró el archivo: ${EXCEL_PATH}`;
    console.error("❌", msg);
    escribirLog("AUTOMATIZACION_ERROR", msg);
    process.exit(1);
  }

  // Leer el Excel
  const workbook = XLSX.readFile(EXCEL_PATH);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(hoja);

  console.log(`📊 Excel leído: ${filas.length} fila(s) encontrada(s)\n`);

  const eventosActuales = leerEventos();
  let agregados = 0;
  let duplicados = 0;
  let errores = 0;

  for (const fila of filas) {
    const nombre = fila["nombre"] || fila["Nombre"] || "";
    const ubicacion = fila["ubicacion"] || fila["Ubicacion"] || fila["Ubicación"] || "";
    const categoria = fila["categoria"] || fila["Categoria"] || fila["Categoría"] || "sin categoría";
    const fuente = fila["fuente"] || fila["Fuente"] || "excel";

    // Validar campos mínimos
    if (!nombre || !ubicacion) {
      console.warn(`⚠️  Fila saltada (faltan campos): ${JSON.stringify(fila)}`);
      errores++;
      continue;
    }

    // Verificar duplicado
    const check = esDuplicado(nombre, eventosActuales);
    if (check.duplicado) {
      console.log(`🔁 Duplicado detectado: "${nombre}" ≈ "${check.similitudContra}" (similitud: ${check.score})`);
      escribirLog("DUPLICADO_DETECTADO", `"${nombre}" similar a "${check.similitudContra}" (score: ${check.score})`);
      duplicados++;
      continue;
    }

    // Agregar el nuevo evento
    const nuevo = {
      id: generarId(),
      nombre,
      ubicacion,
      categoria,
      fuente,
      fechaObtencion: new Date().toISOString().split("T")[0],
      activo: true,
      descripcion: "",
    };

    eventosActuales.push(nuevo);
    console.log(`✅ Agregado: "${nombre}"`);
    escribirLog("AUTOMATIZACION_AGREGO", `Nuevo evento desde Excel: ${nombre}`);
    agregados++;
  }

  // Guardar si hubo cambios
  if (agregados > 0) {
    guardarEventos(eventosActuales);
  }

  // Resumen final
  console.log("\n─────────────────────────────────────");
  console.log(`📋 RESUMEN:`);
  console.log(`   ✅ Agregados:   ${agregados}`);
  console.log(`   🔁 Duplicados:  ${duplicados}`);
  console.log(`   ⚠️  Con errores: ${errores}`);
  console.log("─────────────────────────────────────\n");

  escribirLog("AUTOMATIZACION_FIN", `Fin: ${agregados} agregados, ${duplicados} duplicados, ${errores} errores`);
}

ejecutarAutomatizacion();
