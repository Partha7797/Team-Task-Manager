import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/', protect, getDashboard);
