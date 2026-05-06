import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

const authResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    token: generateToken(user._id),
    user
  });
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError('Name, email, and password are required', 400);
  }

  const userCount = await User.countDocuments();
  const requestedRole = role === 'admin' ? 'admin' : 'member';
  const canChooseAdmin = userCount === 0 || process.env.ALLOW_ADMIN_SIGNUP === 'true';
  const resolvedRole = canChooseAdmin ? requestedRole : 'member';

  const user = await User.create({
    name,
    email,
    password,
    role: resolvedRole
  });

  authResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const isValidPassword = user ? await user.comparePassword(password) : false;

  if (!user || !isValidPassword) {
    throw new ApiError('Invalid email or password', 401);
  }

  authResponse(res, user);
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;

  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  if (bio !== undefined) req.user.bio = bio;
  if (password) req.user.password = password;

  await req.user.save();

  res.json({
    success: true,
    user: req.user
  });
});
