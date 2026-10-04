const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const requestTimer = require('./middlewares/requestTimer');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/team.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

// Asegurar existencia del directorio logs
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Middlewares globales de seguridad y utilidades
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(requestTimer);
app.use(express.json());

// Endpoint de bienvenida y health check
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a TaskFlow API (MongoDB + Mongoose)',
    endpoints: {
      users: '/api/users',
      teams: '/api/teams',
      tasks: '/api/tasks',
      health: '/health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Rutas principales de la API
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

// Manejadores de ruta no encontrada y errores centralizados
app.use(notFound);
app.use(errorHandler);

module.exports = app;
