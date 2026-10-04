const { Router } = require('express');
const {
  getAllTasks,
  getTasksSummary,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

const router = Router();

// Endpoint de consulta avanzada / Aggregation Pipeline (antes de /:id para evitar conflicto de ruta)
router.get('/stats/summary', getTasksSummary);

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
