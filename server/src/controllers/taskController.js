import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const taskPopulate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' },
  { path: 'projectId', select: 'title status deadline members' }
];

const isSameId = (a, b) => String(a) === String(b);

const isProjectMember = (project, userId) => project.members.some((memberId) => isSameId(memberId, userId));

const ensureProjectExists = async (projectId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError('Invalid project id', 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError('Project not found', 404);
  }

  return project;
};

const populateTask = (query) => query.populate(taskPopulate);

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId, assignedTo, status, priority, search = '', page = 1, limit = 100 } = req.query;
  const filter = {};

  if (req.user.role !== 'admin') {
    const projects = await Project.find({ members: req.user._id }).select('_id');
    const projectIds = projects.map((project) => project._id);
    filter.$or = [{ assignedTo: req.user._id }, { projectId: { $in: projectIds } }];
  }

  if (projectId) filter.projectId = projectId;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
    ];
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);

  const [tasks, total] = await Promise.all([
    populateTask(
      Task.find(filter)
        .sort({ deadline: 1, createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
    ),
    Task.countDocuments(filter)
  ]);

  res.json({
    success: true,
    tasks,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      limit: pageSize
    }
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    assignedTo,
    projectId,
    status = 'Todo',
    priority = 'Medium',
    deadline
  } = req.body;

  const project = await ensureProjectExists(projectId);
  const resolvedAssignee = assignedTo || req.user._id;

  if (req.user.role !== 'admin') {
    if (!isProjectMember(project, req.user._id)) {
      throw new ApiError('You can only create tasks in projects you belong to', 403);
    }

    if (!isSameId(resolvedAssignee, req.user._id)) {
      throw new ApiError('Members can only assign tasks to themselves', 403);
    }
  }

  if (!isProjectMember(project, resolvedAssignee)) {
    throw new ApiError('Assigned user must be a member of the project', 400);
  }

  const task = await Task.create({
    title,
    description,
    assignedTo: resolvedAssignee,
    projectId,
    status,
    priority,
    deadline,
    createdBy: req.user._id
  });

  const populatedTask = await populateTask(Task.findById(task._id));
  res.status(201).json({ success: true, task: populatedTask });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  if (req.user.role !== 'admin') {
    const canUpdateStatus = isSameId(task.assignedTo, req.user._id) || isSameId(task.createdBy, req.user._id);
    const requestedFields = Object.keys(req.body);
    const statusOnly = requestedFields.length > 0 && requestedFields.every((field) => field === 'status');

    if (!canUpdateStatus || !statusOnly) {
      throw new ApiError('Members can only update the status of tasks assigned to or created by them', 403);
    }

    task.status = req.body.status;
    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));
    return res.json({ success: true, task: populatedTask });
  }

  const nextProjectId = req.body.projectId || task.projectId;
  const nextAssignedTo = req.body.assignedTo || task.assignedTo;

  if (req.body.projectId || req.body.assignedTo) {
    const project = await ensureProjectExists(nextProjectId);

    if (!isProjectMember(project, nextAssignedTo)) {
      throw new ApiError('Assigned user must be a member of the project', 400);
    }
  }

  const allowedFields = ['title', 'description', 'assignedTo', 'projectId', 'status', 'priority', 'deadline'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  await task.save();

  const populatedTask = await populateTask(Task.findById(task._id));
  return res.json({ success: true, task: populatedTask });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  const canDelete = req.user.role === 'admin' || isSameId(task.createdBy, req.user._id);

  if (!canDelete) {
    throw new ApiError('Members cannot delete tasks created by others', 403);
  }

  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});
