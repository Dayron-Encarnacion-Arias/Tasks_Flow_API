const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'TaskFlowDB', // Nombre específico de la base de datos
      maxPoolSize: 10,      // Configuración del pool de conexiones
    });
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;