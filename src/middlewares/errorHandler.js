const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Error interno del servidor';

  // 400 - CastError de Mongoose (ID de ObjectId con formato inválido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Formato de ID no válido (${err.value})`;
  }

  // 400 - Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // 409 - Error de duplicidad en MongoDB (ej. email o nombre de equipo repetido)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyValue || {}).join(', ');
    message = `Registro duplicado: ya existe un valor para el campo [${duplicatedFields}]`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;