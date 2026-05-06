import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const todayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDashboard = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const projectFilter = isAdmin ? {} : { members: req.user._id };
  const projects = await Project.find(projectFilter).select('_id title status deadline members');
  const projectIds = projects.map((project) => project._id);
  const taskFilter = isAdmin ? {} : { assignedTo: req.user._id };
  const accessibleTaskFilter = isAdmin ? {} : { projectId: { $in: projectIds } };

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    myTasks,
    totalProjects,
    completedProjects,
    statusCounts,
    priorityCounts,
    upcomingTasks
  ] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: 'Completed' }),
    Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' } }),
    Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' }, deadline: { $lt: todayStart() } }),
    Task.countDocuments({ assignedTo: req.user._id }),
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: 'Completed' }),
    Task.aggregate([
      { $match: accessibleTaskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: accessibleTaskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.find({ ...taskFilter, status: { $ne: 'Completed' } })
      .sort({ deadline: 1 })
      .limit(5)
      .populate([
        { path: 'projectId', select: 'title' },
        { path: 'assignedTo', select: 'name email' }
      ])
  ]);

  const projectStats = {
    total: totalProjects,
    completed: completedProjects,
    active: projects.filter((project) => project.status === 'Active').length,
    planning: projects.filter((project) => project.status === 'Planning').length
  };

  res.json({
    success: true,
    stats: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      myTasks,
      projectStats,
      statusCounts,
      priorityCounts,
      upcomingTasks
    }
  });
});
