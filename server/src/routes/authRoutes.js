import express from 'express';
import { getProfile, login, signup, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/profile', protect, getProfile);
authRouter.put('/profile', protect, updateProfile);
