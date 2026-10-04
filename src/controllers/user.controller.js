const { User, Team, Task } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/users - Listar todos los usuarios
const getAllUsers = async (req, res, next) => {
  try {
    const { role, team } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (team) filter.team = team;

    const users = await User.find(filter)
      .populate('team', 'name description')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id - Obtener un usuario por ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('team', 'name description');
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users - Crear usuario
const createUser = async (req, res, next) => {
  try {
    const { name, email, role, team } = req.body;

    // Si viene team, verificar que exista
    if (team) {
      const existingTeam = await Team.findById(team);
      if (!existingTeam) {
        return next(new AppError('El equipo especificado no existe', 404));
      }
    }

    const user = await User.create({ name, email, role, team });

    // Si tiene equipo asignado, agregar al array de members del equipo
    if (team) {
      await Team.findByIdAndUpdate(team, { $addToSet: { members: user._id } });
    }

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id - Actualizar usuario
const updateUser = async (req, res, next) => {
  try {
    const { team } = req.body;
    if (team) {
      const existingTeam = await Team.findById(team);
      if (!existingTeam) {
        return next(new AppError('El equipo especificado no existe', 404));
      }
    }

    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('team', 'name description');

    // Sincronizar membresía de equipo si cambió
    if (team && String(currentUser.team) !== String(team)) {
      if (currentUser.team) {
        await Team.findByIdAndUpdate(currentUser.team, { $pull: { members: currentUser._id } });
      }
      await Team.findByIdAndUpdate(team, { $addToSet: { members: currentUser._id } });
    }

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id - Eliminar usuario
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    // Limpiar referencias en equipos y tareas
    if (user.team) {
      await Team.findByIdAndUpdate(user.team, {
        $pull: { members: user._id },
        ...(user.role === 'admin' ? { $unset: { leader: 1 } } : {}),
      });
    }
    await Task.updateMany({ assignee: user._id }, { $set: { assignee: null } });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
