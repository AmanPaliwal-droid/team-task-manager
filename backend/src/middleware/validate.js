const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 80 }).withMessage('Name too long'),
];

const taskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }).withMessage('Title too long'),
  body('status').optional().isIn(['todo', 'inprogress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

module.exports = { validate, registerRules, loginRules, projectRules, taskRules };
