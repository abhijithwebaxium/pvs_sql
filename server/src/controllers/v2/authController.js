import { getEmployee } from '../../models/sql/Employee.js';
import { generateToken } from '../../utils/jwt.js';
import AppError from '../../utils/appError.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// @desc    Register new employee
// @route   POST /api/v2/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, employeeId, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !employeeId || !password) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const Employee = getEmployee();

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      where: {
        [Op.or]: [{ email }, { employeeId }],
      },
    });

    if (existingEmployee) {
      if (existingEmployee.email === email) {
        return next(new AppError('Email already registered', 400));
      }
      if (existingEmployee.employeeId === employeeId) {
        return next(new AppError('Employee ID already exists', 400));
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      employeeId,
      password: hashedPassword,
      position: 'New Employee',
      role: 'employee',
      hireDate: new Date(),
      salary: 0,
      isApprover: false,
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully. Please login.',
      data: {
        user: {
          id: employee.id,
          employeeId: employee.employeeId,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v2/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const Employee = getEmployee();

    // Find employee by email
    const employee = await Employee.findOne({ where: { email } });

    if (!employee) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, employee.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken({
      userId: employee.id,
      employeeId: employee.employeeId,
      email: employee.email,
      role: employee.role,
      isApprover: employee.isApprover,
      approverLevel: employee.approverLevel,
    });

    const isProd = process.env.NODE_ENV === 'production';

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProd ? '.pvs-xi.vercel.app' : undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: employee.id,
          employeeId: employee.employeeId,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          role: employee.role,
          isApprover: employee.isApprover,
          approverLevel: employee.approverLevel,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v2/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current user
// @route   GET /api/v2/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const Employee = getEmployee();
    const user = await Employee.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
