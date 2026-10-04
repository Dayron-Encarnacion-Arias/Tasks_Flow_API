# TaskFlow API - Proyecto Integrador Final

API RESTful completa construida con **Node.js**, **Express** y **MongoDB (Mongoose)** para la gestión de usuarios, equipos y tareas. Diseñada para integrarse de forma fluida con el frontend de TaskFlow en React.

---

## 🚀 Requisitos previos

- **Node.js** (v18 o superior recomendado)
- **MongoDB** (Instancia local o cluster en [MongoDB Atlas](https://www.mongodb.com/atlas))
- *(Opcional)* **Docker** si deseas levantar MongoDB localmente mediante contenedores.

---

## 🛠️ Instalación y Ejecución

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd Tasks_Flow_API
npm install
```

### 2. Configurar las variables de entorno
Copia el archivo de plantilla `.env.example` a un nuevo archivo `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de conexión reales:

```env
PORT=3000
# Para MongoDB Atlas:
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# O para MongoDB Local / Docker:
# MONGO_URI=mongodb://localhost:27017/TaskFlowDB
```

> **Nota de seguridad:** El archivo `.env` se encuentra ignorado en `.gitignore` para no exponer credenciales sensibles.

### 3. (Opcional) Iniciar MongoDB local con Docker
Si prefieres no usar Atlas y tienes Docker instalado:
```bash
docker compose up -d
```

### 4. Iniciar la API
- **Modo desarrollo (con nodemon y recarga automática):**
  ```bash
  npm run dev
  ```
- **Modo producción:**
  ```bash
  npm start
  ```

### 5. Ejecutar tests automatizados
```bash
npm test
```

---

## 🗄️ Modelos de Datos (Mongoose)

### 1. `User` (`src/models/User.js`)
- `name` (String, requerido, trim, min: 2, max: 50).
- `email` (String, requerido, único, trim, validación regex).
- `role` (String, enum: `['admin', 'member']`, default: `'member'`).
- `team` (ObjectId ref: `Team`, default: `null`).

### 2. `Team` (`src/models/Team.js`)
- `name` (String, requerido, único, trim, min: 3, max: 50).
- `description` (String, trim, max: 200).
- `leader` (ObjectId ref: `User`, default: `null`).
- `members` (Array de ObjectIds ref: `User`).

### 3. `Task` (`src/models/Task.js`)
- `title` (String, requerido, trim, min: 3, max: 100).
- `description` (String, trim).
- `status` (String, enum: `['todo', 'in-progress', 'done']`, default: `'todo'`).
- `priority` (Number, min: 1, max: 5, default: 1).
- `dueDate` (Date).
- `team` (ObjectId ref: `Team`, requerido).
- `assignee` (ObjectId ref: `User`, default: `null`).

---

## 📖 Documentación de la API

Base URL: `http://localhost:3000/api`

### 1. Equipos (`/api/teams`)
| Método | Endpoint | Descripción | Body de ejemplo |
|---|---|---|---|
| `POST` | `/api/teams` | Crear un nuevo equipo | `{"name": "Frontend Team", "description": "React Core"}` |
| `GET` | `/api/teams` | Listar todos los equipos | N/A |
| `GET` | `/api/teams/:id` | Obtener equipo por ID | N/A |
| `PUT` | `/api/teams/:id` | Actualizar datos del equipo | `{"description": "Nuevo texto"}` |
| `DELETE` | `/api/teams/:id` | Eliminar equipo y sus tareas | N/A |
| `GET` | `/api/teams/:id/stats` | **Aggregation Pipeline:** Tareas por estado | N/A |

### 2. Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Body de ejemplo |
|---|---|---|---|
| `POST` | `/api/users` | Registrar un nuevo usuario | `{"name": "Ana", "email": "ana@test.com", "role": "member", "team": "<teamId>"}` |
| `GET` | `/api/users` | Listar usuarios (soporta `?role=` y `?team=`) | N/A |
| `GET` | `/api/users/:id` | Obtener usuario por ID | N/A |
| `PUT` | `/api/users/:id` | Actualizar usuario | `{"name": "Ana María"}` |
| `DELETE` | `/api/users/:id` | Eliminar usuario | N/A |

### 3. Tareas (`/api/tasks`)
| Método | Endpoint | Descripción | Parámetros / Body |
|---|---|---|---|
| `POST` | `/api/tasks` | Crear una nueva tarea | `{"title": "Diseñar Login", "priority": 4, "team": "<teamId>", "status": "todo"}` |
| `GET` | `/api/tasks` | **Consulta Avanzada:** Filtros, orden y paginación | Query params: `?status=todo&priority=4&sort=-priority&page=1&limit=10&search=Login` |
| `GET` | `/api/tasks/stats/summary` | **Aggregation Pipeline:** Resumen general de tareas | N/A |
| `GET` | `/api/tasks/:id` | Obtener tarea por ID | N/A |
| `PUT` | `/api/tasks/:id` | Actualizar tarea (ej. marcar `status: "done"`) | `{"status": "done"}` |
| `DELETE` | `/api/tasks/:id` | Eliminar una tarea | N/A |

### 4. Health Check
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Verifica estado operativo del servicio y tiempo activo (`uptime`). |

---

## ⚡ Consultas Avanzadas Implementadas

1. **Filtros, Orden y Paginación en `GET /api/tasks`:**
   - **Filtros:** Por `status`, `priority`, `team`, `assignee` y búsqueda por texto `search`.
   - **Ordenamiento:** Parámetro `sort` (por ejemplo `-priority` para descendente, o `createdAt`).
   - **Paginación:** Parámetros `page` y `limit`. Retorna metadata de paginación (`totalTasks`, `totalPages`, `currentPage`, `hasNextPage`, `hasPrevPage`).
   - Ejemplo: `GET /api/tasks?status=todo&sort=-priority&page=1&limit=10`

2. **Aggregation Pipeline:**
   - `GET /api/teams/:id/stats`: Agrupa con `$match`, `$group` y `$project` para calcular el total de tareas por estado y el promedio de prioridad del equipo.
   - `GET /api/tasks/stats/summary`: Muestra el consolidado global de tareas agrupadas por estado.

---

## 🛡️ Manejo Centralizado de Errores

El middleware de errores (`src/middlewares/errorHandler.js`) intercepta todos los fallos y responde con una estructura homogénea:

```json
{
  "success": false,
  "error": "Descripción legible del error"
}
```

- **400 Bad Request:** Formato de ObjectId no válido (`CastError` de Mongoose) o validaciones de esquema fallidas (`ValidationError`).
- **404 Not Found:** Recursos no encontrados o endpoints inexistentes.
- **409 Conflict:** Violaciones de unicidad en MongoDB (`code: 11000`), como correo electrónico o nombre de equipo ya registrado.
- **500 Internal Server Error:** Errores no controlados en el servidor.

---

## 🧪 Pruebas y Colecciones

Puedes probar todos los endpoints importando la colección de Postman incluida en la raíz del repositorio:
- **Colección de Postman:** Importa el archivo [`TaskFlow.postman_collection.json`](./TaskFlow.postman_collection.json). Contiene carpetas para Equipos, Usuarios (5 por equipo), Tareas, Consultas avanzadas y Casos de error (400, 404, 409).

---

## 📁 Arquitectura del Proyecto

```
src/
├── config/
│   └── db.js                 # Conexión única a MongoDB con dbName y pool de conexiones
├── controllers/
│   ├── team.controller.js     # Controladores CRUD y Aggregation Pipeline para Teams
│   ├── user.controller.js     # Controladores CRUD para Users
│   └── task.controller.js     # Controladores CRUD, consultas avanzadas y Aggregation
├── middlewares/
│   ├── errorHandler.js       # Manejador centralizado de errores (400, 404, 409, 500)
│   ├── notFound.js           # Manejador para rutas 404
│   └── requestTimer.js       # Middleware de registro y medición de tiempo por petición
├── models/
│   ├── index.js              # Exportación centralizada de modelos
│   ├── Team.js               # Modelo Team con validaciones y relaciones
│   ├── User.js               # Modelo User con validaciones y relaciones
│   └── Task.js               # Modelo Task con validaciones y relaciones
├── routes/
│   ├── team.routes.js         # Rutas de /api/teams
│   ├── user.routes.js         # Rutas de /api/users
│   └── task.routes.js         # Rutas de /api/tasks
├── utils/
│   └── AppError.js           # Clase de error operacional personalizada
├── app.js                    # Configuración de Express, CORS, Helmet, Morgan y montaje de rutas
└── server.js                 # Arranque del servidor y conexión a base de datos
tests/
└── api.validation.test.js    # Suite de pruebas automatizadas con Jest + Supertest
.env.example                  # Plantilla de variables de entorno (sin credenciales)
docker-compose.yml            # Configuración para levantar MongoDB localmente
TaskFlow.postman_collection.json # Colección de Postman completa
README.md                     # Documentación oficial del proyecto
```

---

## 🎥 Guía para el Video Explicativo (5 min)

Para tu video de entrega, sigue esta pauta sugerida:

1. **Introducción y Estructura (1 min):**
   - Muestra la arquitectura en capas (`routes/`, `controllers/`, `models/`, `config/`).
   - Explica el flujo de una petición: `Ruta -> Middleware -> Controlador -> Modelo (Mongoose) -> MongoDB Atlas`.
2. **Flujo Principal en Postman / Thunder Client (2.5 min):**
   - Crear un **Equipo** (`POST /api/teams`).
   - Crear un **Usuario** vinculado a ese equipo (`POST /api/users`).
   - Crear **Tareas** asignadas a ese equipo y usuario (`POST /api/tasks`).
   - Listar las tareas (`GET /api/tasks`).
   - Actualizar una tarea para marcarla como terminada (`PUT /api/tasks/:id` con `status: "done"`).
   - Eliminar una tarea (`DELETE /api/tasks/:id`).
3. **Manejo de Errores (45 seg):**
   - Provocar un `400` pasando un ID con formato inválido o enviando campos requeridos vacíos.
   - Provocar un `409` intentando crear un usuario con un email duplicado.
4. **Consulta Avanzada (45 seg):**
   - Ejecutar la consulta con filtros, orden y paginación: `GET /api/tasks?status=todo&sort=-priority&page=1&limit=10`.
   - Mostrar el endpoint con Aggregation Pipeline: `GET /api/teams/:id/stats`.
5. **Verificación en Base de Datos (30 seg):**
   - Abrir **MongoDB Atlas** (o MongoDB Compass) y mostrar cómo quedaron guardados los documentos en las colecciones `users`, `teams` y `tasks`.
