const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const { taskRules, validate } = require('../middleware/validate');

const {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

router.get('/my', auth, getMyTasks);
router.get('/', auth, getTasks);
router.post('/', auth, taskRules, validate, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;