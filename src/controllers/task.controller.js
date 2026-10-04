const { Task, Team, User } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/tasks - Listar tareas con Filtros, Ordenamiento y Paginación
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, team, assignee, search, sort, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Filtro por estado
    if (status) {
      filter.status = status;
    }

    // Filtro por prioridad
    if (priority) {
      filter.priority = Number(priority);
    }

    // Filtro por equipo
    if (team) {
      filter.team = team;
    }

    // Filtro por usuario asignado
    if (assignee) {
      filter.assignee = assignee;
    }

    // Búsqueda por texto en título
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Configuración de paginación
    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    // Configuración de ordenamiento (ej: ?sort=-priority o ?sort=createdAt)
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    // Ejecutar conteo total y consulta paginada en paralelo
    const [totalTasks, tasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.find(filter)
        .populate('team', 'name description')
        .populate('assignee', 'name email role')
        .sort(sortBy)
        .skip(skip)
        .limit(pageSize),
    ]);

    const totalPages = Math.ceil(totalTasks / pageSize);

    res.json({
      success: true,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: pageNumber,
        limit: pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/stats/summary - Resumen general de tareas con Aggregation Pipeline
const getTasksSummary = async (req, res, next) => {
  try {
    const summary = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPriority: { $avg: '$priority' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          avgPriority: { $round: ['$avgPriority', 1] },
        },
      },
    ]);

    const total = summary.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      success: true,
      total,
      byStatus: summary,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id - Obtener una tarea por ID
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('team', 'name description')
      .populate('assignee', 'name email role');

    if (!task) {
      return next(new AppError('Tarea no encontrada', 404));
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks - Crear tarea
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, team, assignee } = req.body;

    // Validar que el equipo exista
    if (!team) {
      return next(new AppError('El campo team es obligatorio', 400));
    }
    const existingTeam = await Team.findById(team);
    if (!existingTeam) {
      return next(new AppError('El equipo asignado no existe', 404));
    }

    // Validar usuario asignado si se envía
    if (assignee) {
      const existingUser = await User.findById(assignee);
      if (!existingUser) {
        return next(new AppError('El usuario asignado no existe', 404));
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      team,
      assignee,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('team', 'name description')
      .populate('assignee', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id - Actualizar tarea completa o campos específicos
const updateTask = async (req, res, next) => {
  try {
    const { team, assignee } = req.body;

    if (team) {
      const existingTeam = await Team.findById(team);
      if (!existingTeam) {
        return next(new AppError('El equipo asignado no existe', 404));
      }
    }

    if (assignee) {
      const existingUser = await User.findById(assignee);
      if (!existingUser) {
        return next(new AppError('El usuario asignado no existe', 404));
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('team', 'name description')
      .populate('assignee', 'name email role');

    if (!task) {
      return next(new AppError('Tarea no encontrada', 404));
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id - Eliminar tarea
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new AppError('Tarea no encontrada', 404));
    }

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTasksSummary,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
