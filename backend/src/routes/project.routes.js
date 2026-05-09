const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { projectRules, validate } = require('../middleware/validate');

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');

router.post('/', auth, projectRules, validate, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);
router.post('/:id/members', auth, addMember);
router.delete('/:id/members/:userId', auth, removeMember);

module.exports = router;