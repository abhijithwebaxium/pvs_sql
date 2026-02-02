import jwt from "jsonwebtoken";
import { getEmployee } from "../models/sql/Employee.js";
import AppError from "../utils/appError.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }


    if (!token) {
      req.user = { isAuthenticated: false };
      return next(); // Continue without blocking
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.userId;

    // Check if user still exists
    const Employee = getEmployee();
    const user = await Employee.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user || !user.isActive) {
      req.user = { isAuthenticated: false };
      return next();
    }

    // Add user data to request
    req.user = {
      userId: userId,
      employeeId: user.employeeId,
      role: user.role,
      isAuthenticated: true,
    };

    next();
  } catch (err) {
    // Handle JWT specific errors (expired, invalid, malformed)
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      req.user = { isAuthenticated: false };
      return next();
    }
    return next(err);
  }
};

export const authenticate = (req, res, next) => {
  try {
    if (req?.user?.isAuthenticated) {
      return next();
    }

    throw new AppError("Authentication required", 401);
  } catch (err) {
    next(err);
  }
};

// Role-based authorization - REMOVED
// All authenticated users can access all routes
export const authorize = (requiredRoles) => {
  return (req, res, next) => {
    try {
      console.log(req.user);

      if (!req?.user?.isAuthenticated) {
        throw new AppError("Authentication required", 401);
      }

      if (requiredRoles.includes(req.user.role)) {
        return next();
      }

      throw new AppError("Forbidden: Insufficient permissions", 403);
    } catch (err) {
      next(err);
    }
  };
};

// Access level authorization - REMOVED
export const authorizeLevel = (minLevel) => {
  return (req, res, next) => {
    // No level checking - just pass through
    next();
  };
};
