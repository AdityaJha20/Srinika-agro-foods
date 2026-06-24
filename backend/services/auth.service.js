const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const register = async (userData) => {
  const { name, email, password, role } = userData;

  if (!name || !email || !password) {
    throw new AppError('Please provide name, email, and password', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Exclude password from response object
  user.password = undefined;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Exclude password from response object
  user.password = undefined;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  register,
  login
};
