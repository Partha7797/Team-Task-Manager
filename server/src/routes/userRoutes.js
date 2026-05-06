import express from 'express';
import { getUsers, updateUserRole } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

export const userRouter = express.Router();

userRouter.use(protect);

userRouter.get('/', getUsers);
userRouter.patch('/:id/role', adminOnly, updateUserRole);
