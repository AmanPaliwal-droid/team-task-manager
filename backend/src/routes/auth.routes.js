const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validate');

const {
  signup,
  login,
  me,
  searchByEmail,
} = require('../controllers/auth.controller');

router.post('/signup', registerRules, validate, signup);

router.post('/login', loginRules, validate, login);

router.get('/me', auth, me);

router.get('/search', auth, searchByEmail);

module.exports = router;