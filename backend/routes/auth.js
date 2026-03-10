const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerDriver, loginDriver, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/driver/register', registerDriver);
router.post('/driver/login', loginDriver);
router.get('/me', protect, getMe);

module.exports = router;
