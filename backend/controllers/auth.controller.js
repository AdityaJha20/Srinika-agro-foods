const authService = require('../services/auth.service');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const result = await authService.register({ name, email, password, role });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});

module.exports = {
  register,
  login
};
