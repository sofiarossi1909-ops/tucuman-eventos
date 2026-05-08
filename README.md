# Tucumán Eventos API — Sistema Automatizado con IA

Sistema integral para la obtención, procesamiento y administración de establecimientos y eventos en San Miguel de Tucumán. Integra automatización de datos, detección inteligente de duplicados y enriquecimiento de contenido con Inteligencia Artificial.

---

## 🚀 Stack Tecnológico

- **Runtime:** Node.js + Express (API REST)
- **Persistencia:** JSON File System (base de datos simulada)
- **Procesamiento de datos:** Librería `xlsx` para ingesta de datasets
- **Inteligencia Artificial:** SDK `groq-sdk` (Groq API — llama-3.3-70b-versatile)
- **Seguridad:** `express-rate-limit` para mitigación de scraping

---

## ⚙️ Instalación y Configuración

### 1. Clonar el proyecto

```bash
git clone https://github.com/sofiarossi1909-ops/tucuman-eventos.git
cd tucuman-eventos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Copiar el archivo de ejemplo y completar con tu API key:

```bash
cp .env.example .env
```

```env
GROQ_API_KEY=tu_api_key_aqui
PORT=3000
```

### 4. Iniciar el servidor

```bash
npm start
```

La API corre en `http://localhost:3000`

---

## 🤖 Flujo de Automatización e IA

El sistema cuenta con un flujo de trabajo diseñado para garantizar la integridad y calidad de la información:

1. **Ingesta:** Lectura de datos externos desde archivos Excel
2. **Detección de duplicados:** Algoritmo de similitud basado en Bigramas de Jaccard
3. **Enriquecimiento con IA:** Generación automática de descripciones con Gemini
4. **Auditoría:** Registro detallado de cada operación en logs persistentes

Para ejecutar la automatización:

```bash
node scripts/generarExcelEjemplo.js   # genera el Excel de prueba
npm run automate                       # carga los datos
```

![Diagrama de Flujo del Sistema](./docs/image.png)

---

## 📋 Endpoints Principales

### CRUD de Eventos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/eventos` | Lista todos los eventos activos |
| GET | `/eventos?categoria=bar` | Filtra por categoría |
| POST | `/eventos` | Crea un nuevo evento |
| PUT | `/eventos/:id` | Edita un evento existente |
| DELETE | `/eventos/:id` | Desactiva (soft delete) un registro |
| GET | `/eventos/logs/historial` | Historial de acciones |

### Servicios de IA

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ia/describir/:id` | Genera descripción para un evento |
| POST | `/ia/describir-todos` | Procesa todos los registros pendientes |

---

## 🔒 Protección Anti-Scraping

- **Rate Limiting:** Máximo 100 peticiones por IP cada 15 minutos
- **Validación de User-Agent:** Rechaza peticiones sin cabeceras válidas
- **Bloqueo de bots:** Identifica y bloquea herramientas como `scrapy`, `curl`, `python-requests`

---

## 🧠 Criterio Técnico

### ¿Cómo evitás duplicados?

Se implementaron dos capas. Primero una comparación exacta por nombre (case-insensitive). Si pasa esa verificación, se aplica un algoritmo de similitud basado en bigramas de Jaccard: se normalizan los nombres (minúsculas, sin tildes, sin caracteres especiales), se calculan los bigramas de cada nombre y si la similitud supera el 70% se considera duplicado. Esto permite detectar casos como `"Bar El Español"` vs `"El Español Bar"` (85% de similitud).

### ¿Cómo escalarías este sistema?

1. Reemplazar el JSON por MongoDB o PostgreSQL para soportar escrituras concurrentes
2. Agregar autenticación JWT para proteger las rutas de escritura
3. Implementar colas con Redis + Bull para procesar la IA en background
4. Usar `node-cron` para ejecutar la automatización periódicamente
5. Deploy en Railway o Render con CI/CD automático desde GitHub

### ¿Qué problemas puede tener este flujo?

- El JSON no soporta escrituras concurrentes — si dos procesos escriben a la vez puede haber pérdida de datos
- La API de Gemini tiene límites en el tier gratuito, interrumpiendo la generación masiva
- La detección difusa puede dar falsos positivos con nombres muy cortos o genéricos
- El Excel puede tener filas con formatos inconsistentes que el script no reconoce

### ¿Cómo mejorarías la calidad de los datos?

- Normalizar direcciones usando la API de Google Maps Geocoding
- Validar categorías contra un listado fijo para evitar variaciones libres
- Agregar un sistema de aprobación manual antes de publicar registros nuevos
- Usar IA para detectar y corregir nombres inconsistentes antes de guardarlos

---

## ✅ Bonus Implementados

- [x] **Dashboard:** Interfaz en HTML para visualización y gestión de datos
- [x] **Historial de cambios:** Logs de auditoría accesibles vía API
- [x] **Soft Delete:** Desactivación de registros sin pérdida de datos
- [x] **Detección difusa:** Manejo avanzado de inconsistencias en nombres
- [x] **Arquitectura limpia:** Configuración centralizada en `lib/core/constants.js`

---

## 📁 Estructura del Proyecto

```
tucuman-eventos/
├── index.js                        # Servidor principal
├── public/index.html               # Dashboard frontend
├── data/
│   ├── eventos.json                # Base de datos
│   └── logs.json                   # Historial de acciones
├── routes/
│   ├── eventos.js                  # CRUD completo
│   └── ia.js                       # Endpoints de IA
├── lib/core/
│   ├── constants.js                # Configuración centralizada
│   └── geminiClient.js             # Cliente Gemini (singleton)
├── middleware/antiScraping.js      # Rate limiting y protección
├── automation/cargarDesdeExcel.js  # Script de automatización
└── docs/image.png                  # Diagrama de flujo
```

---

*Desarrollado por Sofía Rossi — Tucumán, Argentina.*

