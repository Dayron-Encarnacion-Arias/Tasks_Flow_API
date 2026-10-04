const mongoose = require('mongoose');
const { Team, User, Task } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/teams - Listar todos los equipos
const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/teams/:id - Obtener un equipo por ID
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      return next(new AppError('Equipo no encontrado', 404));
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/teams - Crear equipo
const createTeam = async (req, res, next) => {
  try {
    const { name, description, leader, members } = req.body;

    if (leader) {
      const leaderUser = await User.findById(leader);
      if (!leaderUser) {
        return next(new AppError('El usuario asignado como líder no existe', 404));
      }
    }

    const team = await Team.create({ name, description, leader, members });

    // Si hay miembros asignados, actualizarles el campo team en User
    if (members && members.length > 0) {
      await User.updateMany({ _id: { $in: members } }, { $set: { team: team._id } });
    }
    if (leader) {
      await User.findByIdAndUpdate(leader, { $set: { team: team._id } });
    }

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/teams/:id - Actualizar equipo
const updateTeam = async (req, res, next) => {
  try {
    const { leader } = req.body;
    if (leader) {
      const leaderUser = await User.findById(leader);
      if (!leaderUser) {
        return next(new AppError('El usuario asignado como líder no existe', 404));
      }
    }

    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('leader', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      return next(new AppError('Equipo no encontrado', 404));
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/teams/:id - Eliminar equipo
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return next(new AppError('Equipo no encontrado', 404));
    }

    // Desvincular usuarios que pertenecían al equipo
    await User.updateMany({ team: team._id }, { $set: { team: null } });

    // Eliminar o desvincular tareas del equipo
    await Task.deleteMany({ team: team._id });

    res.json({
      success: true,
      message: 'Equipo y sus tareas asociadas eliminados exitosamente',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/teams/:id/stats - Estadísticas del equipo con Aggregation Pipeline
const getTeamStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return next(new AppError('Equipo no encontrado', 404));
    }

    const stats = await Task.aggregate([
      {
        $match: { team: new mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: '$status',
          totalTasks: { $sum: 1 },
          avgPriority: { $avg: '$priority' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          totalTasks: 1,
          avgPriority: { $round: ['$avgPriority', 1] },
        },
      },
    ]);

    const totalTasks = stats.reduce((acc, curr) => acc + curr.totalTasks, 0);

    res.json({
      success: true,
      team: {
        id: team._id,
        name: team.name,
      },
      totalTasks,
      byStatus: stats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
};
