const { Router } = require('express');
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
} = require('../controllers/team.controller');

const router = Router();

router.route('/')
  .get(getAllTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeamById)
  .put(updateTeam)
  .delete(deleteTeam);

// Endpoint avanzado con Aggregation Pipeline
router.get('/:id/stats', getTeamStats);

module.exports = router;
