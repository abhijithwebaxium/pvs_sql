import { getEmployee } from '../../models/sql/Employee.js';
import { generateToken } from '../../utils/jwt.js';
import AppError from '../../utils/appError.js';
import bcrypt from 'bcryptjs';
import { authenticateLDAP } from '../../utils/ldapAuth.js';

// @desc    Login user (Local or LDAP)
// @route   POST /api/v2/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, authMethod = 'local' } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const Employee = getEmployee();

    if (authMethod === 'ldap') {
      // LDAP Authentication
      try {
        // Step 1: Authenticate with LDAP server
        const ldapResult = await authenticateLDAP(email, password);

        if (!ldapResult.success) {
          return next(new AppError('Invalid Active Directory credentials. Please check your email and password.', 401));
        }

        // Step 2: Check if employee exists in database
        const employee = await Employee.findOne({ where: { email } });

        if (!employee) {
          return next(
            new AppError(
              'Your Active Directory account is valid, but you are not registered in the employee portal. Please contact HR to add your account.',
              403
            )
          );
        }

        // Step 3: Generate token and log them in
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

        return res.status(200).json({
          success: true,
          data: {
            user: {
              id: employee.id,
              employeeId: employee.employeeId,
              email: employee.email,
              fullName: employee.fullName,
              position: employee.position,
              jobTitle: employee.jobTitle,
              role: employee.role,
              isApprover: employee.isApprover,
              approverLevel: employee.approverLevel,
              isActive: employee.isActive,
              hireDate: employee.hireDate,
              lastHireDate: employee.lastHireDate,
              bonus2024: employee.bonus2024,
              bonus2025: employee.bonus2025,
            },
            token,
            authMethod: 'ldap',
          },
        });
      } catch (ldapError) {
        console.error('LDAP Auth Error:', ldapError);
        // Check for specific LDAP errors
        let errorMessage = 'Unable to authenticate with Active Directory. Please try again or contact IT support.';

        if (ldapError.message?.includes('timeout') || ldapError.message?.includes('Connection timeout')) {
          errorMessage = 'Active Directory login is currently unavailable. Please try using Local Account login or contact IT support.';
        } else if (ldapError.message?.includes('ECONNREFUSED') || ldapError.message?.includes('ENOTFOUND')) {
          errorMessage = 'Active Directory server is not reachable. Please try using Local Account login or contact IT support.';
        } else if (ldapError.message?.includes('Invalid LDAP credentials') || ldapError.message?.includes('Invalid credentials')) {
          errorMessage = 'Invalid Active Directory credentials. Please check your email and password.';
        } else if (ldapError.message?.includes('User not found')) {
          errorMessage = 'User not found in Active Directory. Please check your email address.';
        }

        return next(new AppError(errorMessage, 401));
      }
    } else {
      // Local Authentication
      // Find employee by email
      const employee = await Employee.findOne({ where: { email } });

      if (!employee) {
        return next(new AppError('Invalid email or password', 401));
      }

      // Check password
      const isPasswordCorrect = await bcrypt.compare(password, employee.password);
      if (!isPasswordCorrect) {
        return next(new AppError('Invalid email or password', 401));
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
            fullName: employee.fullName,
            position: employee.position,
            jobTitle: employee.jobTitle,
            role: employee.role,
            isApprover: employee.isApprover,
            approverLevel: employee.approverLevel,
            isActive: employee.isActive,
            hireDate: employee.hireDate,
            lastHireDate: employee.lastHireDate,
            bonus2024: employee.bonus2024,
            bonus2025: employee.bonus2025,
          },
          token,
          authMethod: 'local',
        },
      });
    }
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
