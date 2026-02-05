import { Router } from 'express';
import authRoutes from './authRoutes.js';
import branchRoutes from './branchRoutes.js';
import employeeRoutes from './employeeRoutes.js';

const router = Router();

// V2 API Routes (SQL Server)
router.use('/v2/auth', authRoutes);
router.use('/v2/branches', branchRoutes);
router.use('/v2/employees', employeeRoutes);

export default router;
