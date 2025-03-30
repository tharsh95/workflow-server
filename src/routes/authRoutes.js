import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);

// Protected route example
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

export default router;

