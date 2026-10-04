require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Conectar a MongoDB Atlas o local una sola vez al inicio
    await connectDB();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 TaskFlow API corriendo en http://localhost:${PORT}`);
      console.log(`📚 Endpoints base:`);
      console.log(`   - Usuarios: http://localhost:${PORT}/api/users`);
      console.log(`   - Equipos:  http://localhost:${PORT}/api/teams`);
      console.log(`   - Tareas:   http://localhost:${PORT}/api/tasks`);
      console.log(`🩺 Health:    http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Error fatal al iniciar el servidor:', err.message);
    process.exit(1);
  }
};

start();
