const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la tarea es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: '{VALUE} no es un estado válido (debe ser todo, in-progress o done)',
      },
      default: 'todo',
    },
    priority: {
      type: Number,
      min: [1, 'La prioridad mínima es 1'],
      max: [5, 'La prioridad máxima es 5'],
      default: 1,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'La tarea debe pertenecer a un equipo'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);