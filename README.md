#  Tucumán Eventos API

Sistema automatizado para obtener, procesar y administrar bares y eventos de San Miguel de Tucumán.

---

##  Stack utilizado

- **Node.js + Express** — API REST
- **JSON file** — Base de datos simulada (sin necesidad de instalar DB)
- **xlsx** — Lectura de archivos Excel para automatización
- **@google/generative-ai** — Integración con Gemini para generar descripciones
- **express-rate-limit** — Protección anti-scraping

---

##  Cómo instalar y correr

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/tucuman-eventos.git
cd tucuman-eventos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con tu API key de Gemini:

```bash
cp .env.example .env
```

Editar `.env`:
```
GEMINI_API_KEY=tu_api_key_de_gemini
PORT=3000
```

> **Conseguir API key de Gemini (gratis):** https://aistudio.google.com/app/apikey

### 4. Iniciar la API

```bash
npm start
# o para desarrollo con hot reload:
npm run dev
```

La API corre en: `http://localhost:3000`

---

##  Endpoints disponibles

### Health check
```
GET /
```

### CRUD de Eventos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/eventos` | Lista todos los eventos activos |
| GET | `/eventos?categoria=bar` | Filtra por categoría |
| GET | `/eventos?nombre=cafe` | Busca por nombre |
| GET | `/eventos/:id` | Obtiene un evento por ID |
| POST | `/eventos` | Crea un nuevo evento |
| PUT | `/eventos/:id` | Edita un evento existente |
| DELETE | `/eventos/:id` | Desactiva (soft delete) un evento |
| GET | `/eventos/logs/historial` | Ver historial de acciones |

### IA con Gemini

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ia/describir/:id` | Genera descripción para un evento |
| POST | `/ia/describir-todos` | Genera descripción para todos los que no tienen |

---

##  Ejemplos de uso

### Crear un evento
```bash
curl -X POST http://localhost:3000/eventos \
  -H "Content-Type: application/json" \
  -H "User-Agent: MiApp/1.0" \
  -d '{
    "nombre": "Bar La Esquina",
    "ubicacion": "Córdoba 450, Tucumán",
    "categoria": "bar",
    "fuente": "manual"
  }'
```

### Generar descripción con IA
```bash
curl -X POST http://localhost:3000/ia/describir/1 \
  -H "User-Agent: MiApp/1.0"
```

### Generar descripciones para todos
```bash
curl -X POST http://localhost:3000/ia/describir-todos \
  -H "User-Agent: MiApp/1.0"
```

---

##  Automatización (carga desde Excel)

### Paso 1: Generar el Excel de ejemplo
```bash
node scripts/generarExcelEjemplo.js
```

Esto crea `automation/nuevos_eventos.xlsx` con datos de prueba.

### Paso 2: Ejecutar la automatización
```bash
npm run automate
# equivalente a: node automation/cargarDesdeExcel.js
```

El script:
1. Lee el Excel `automation/nuevos_eventos.xlsx`
2. Compara cada fila con los eventos existentes
3. **Detecta duplicados** (exactos y difusos)
4. Agrega solo los nuevos
5. Registra todo en `data/logs.json`

### Formato del Excel

El Excel debe tener estas columnas (primera fila = encabezados):

| nombre | ubicacion | categoria | fuente |
|--------|-----------|-----------|--------|
| Bar La Yapa | Córdoba 450 | bar | excel |

---

##  Protección Anti-Scraping

La API implementa varias capas de protección:

| Mecanismo | Descripción |
|-----------|-------------|
| **Rate Limiting** | Máx 100 peticiones por IP cada 15 min (escritura: 20) |
| **User-Agent obligatorio** | Rechaza peticiones sin User-Agent |
| **Bloqueo de bots** | Bloquea `python-requests`, `curl`, `wget`, `scrapy`, etc. |
| **Manejo de errores global** | Errores controlados con mensajes claros |

---

##  Criterio Técnico

### ¿Cómo se evitan duplicados?

Se usa un algoritmo de similitud basado en **bigramas de Jaccard**:
- Se normalizan los nombres (minúsculas, sin tildes, sin caracteres especiales)
- Se calculan los bigramas de cada nombre
- Si la similitud supera el **70%** → se considera duplicado

Esto permite detectar casos como:
- `"Bar El Español"` vs `"El Español Bar"` → duplicado ✅
- `"O'Brien Irish Bar"` vs `"Bar Irlandés O'Brien"` → duplicado ✅

### ¿Cómo escalarías este sistema?

1. Reemplazar el JSON por **MongoDB o PostgreSQL**
2. Agregar un sistema de colas (**Bull + Redis**) para la automatización
3. Autenticación con **JWT** para proteger las rutas de escritura
4. Deploy en **Railway, Render o Vercel** con CI/CD automático
5. Scheduler con **node-cron** para ejecutar la automatización periódicamente

### ¿Qué problemas puede tener este flujo?

- El JSON no soporta escrituras concurrentes (si dos procesos escriben a la vez, puede haber pérdida de datos)
- La detección difusa puede dar falsos positivos con nombres muy cortos
- La API de Gemini puede fallar o tener rate limits propios
- El Excel puede tener filas con formatos inconsistentes

### ¿Cómo mejorarías la calidad de los datos?

- Normalizar direcciones usando la **API de Google Maps Geocoding**
- Validar categorías contra un listado fijo (enum)
- Agregar un sistema de aprobación manual antes de publicar
- Implementar un pipeline de limpieza con IA para nombres inconsistentes

---

##  Estructura del proyecto

```
tucuman-eventos/
├── index.js                    # Servidor Express principal
├── package.json
├── .env.example                # Template de variables de entorno
├── .gitignore
│
├── data/
│   ├── eventos.json            # Base de datos (JSON)
│   └── logs.json               # Historial de acciones
│
├── routes/
│   ├── eventos.js              # CRUD de eventos
│   └── ia.js                   # Rutas de IA (Gemini)
│
├── middleware/
│   └── antiScraping.js         # Rate limiting y protección
│
├── utils/
│   └── db.js                   # Helpers para leer/escribir JSON
│
├── automation/
│   ├── cargarDesdeExcel.js     # Script de automatización
│   └── nuevos_eventos.xlsx     # Excel de ejemplo (generado)
│
└── scripts/
    └── generarExcelEjemplo.js  # Genera el Excel de prueba
```

---

##  Categorías disponibles

`bar` | `boliche` | `cafe` | `peña` | `restaurante` | `recital` | `evento`

---

## Licencia

MIT


![Diagrama de Flujo del Sistema](./docs/image.png)


