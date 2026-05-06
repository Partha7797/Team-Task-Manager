import express from 'express';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  updateProjectMembers
} from '../controllers/projectController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

export const projectRouter = express.Router();

projectRouter.use(protect);

projectRouter.route('/').get(getProjects).post(adminOnly, createProject);
projectRouter.patch('/:id/members', adminOnly, updateProjectMembers);
projectRouter.route('/:id').put(adminOnly, updateProject).delete(adminOnly, deleteProject);
