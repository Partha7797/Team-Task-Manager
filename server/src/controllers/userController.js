import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const publicUserFields = 'name email role bio createdAt';

export const getUsers = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  if (req.user.role === 'admin') {
    const users = await User.find(searchFilter).select(publicUserFields).sort({ name: 1 });
    return res.json({ success: true, users });
  }

  const projects = await Project.find({ members: req.user._id }).select('members');
  const teammateIds = [...new Set(projects.flatMap((project) => project.members.map(String)))];

  if (!teammateIds.includes(String(req.user._id))) {
    teammateIds.push(String(req.user._id));
  }

  const users = await User.find({ _id: { $in: teammateIds }, ...searchFilter })
    .select(publicUserFields)
    .sort({ name: 1 });

  return res.json({ success: true, users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'member'].includes(role)) {
    throw new ApiError('Role must be admin or member', 400);
  }

  if (String(req.user._id) === req.params.id && role !== req.user.role) {
    throw new ApiError('Admins cannot change their own role', 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(publicUserFields);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, user });
});
