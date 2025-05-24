import express from 'express';
import { protect } from '../middleware/auth';
import { getProfile, login, register } from '../controller/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router;