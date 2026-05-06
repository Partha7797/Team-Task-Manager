import express from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

export const taskRouter = express.Router();

taskRouter.use(protect);

taskRouter.route('/').get(getTasks).post(createTask);
taskRouter.route('/:id').put(updateTask).delete(deleteTask);
