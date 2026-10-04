const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del equipo es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del equipo debe tener al menos 3 caracteres'],
      maxlength: [50, 'El nombre del equipo no puede exceder 50 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
      default: '',
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
