import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const projectPopulate = [
  { path: 'members', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' }
];

const normalizeIds = (ids = []) => {
  const safeIds = Array.isArray(ids) ? ids : [ids];
  return [...new Set(safeIds.filter(Boolean).map(String))];
};

const ensureUsersExist = async (ids) => {
  if (!ids.length) {
    return;
  }

  const invalidId = ids.find((id) => !mongoose.Types.ObjectId.isValid(id));

  if (invalidId) {
    throw new ApiError(`Invalid user id: ${invalidId}`, 400);
  }

  const existingCount = await User.countDocuments({ _id: { $in: ids } });

  if (existingCount !== ids.length) {
    throw new ApiError('One or more selected members do not exist', 400);
  }
};

const populateProject = (query) => query.populate(projectPopulate);

export const getProjects = asyncHandler(async (req, res) => {
  const { search = '', status } = req.query;
  const filter = req.user.role === 'admin' ? {} : { members: req.user._id };

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }));
  res.json({ success: true, projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const { title, description = '', deadline, status = 'Planning', members = [] } = req.body;
  const memberIds = normalizeIds([...members, req.user._id]);

  await ensureUsersExist(memberIds);

  const project = await Project.create({
    title,
    description,
    deadline,
    status,
    members: memberIds,
    createdBy: req.user._id
  });

  const populatedProject = await populateProject(Project.findById(project._id));
  res.status(201).json({ success: true, project: populatedProject });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Project not found', 404);
  }

  const allowedFields = ['title', 'description', 'deadline', 'status'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  if (req.body.members !== undefined) {
    const memberIds = normalizeIds([...req.body.members, project.createdBy]);
    await ensureUsersExist(memberIds);
    project.members = memberIds;
  }

  await project.save();

  const populatedProject = await populateProject(Project.findById(project._id));
  res.json({ success: true, project: populatedProject });
});

export const updateProjectMembers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Project not found', 404);
  }

  const memberIds = normalizeIds([...(req.body.members || []), project.createdBy]);
  await ensureUsersExist(memberIds);

  project.members = memberIds;
  await project.save();

  const populatedProject = await populateProject(Project.findById(project._id));
  res.json({ success: true, project: populatedProject });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Project not found', 404);
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.json({ success: true, message: 'Project and related tasks deleted' });
});
