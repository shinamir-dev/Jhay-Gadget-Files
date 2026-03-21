const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController.js');
const loginController = require('../controllers/loginController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/register', authController.register);
router.post('/login', loginController.login);
router.get('/me', authController.getMe);

router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({
        message: 'Welcome Admin',
        user: req.user
    });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
