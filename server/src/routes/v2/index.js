import { Router } from 'express';
import authRoutes from './authRoutes.js';
import branchRoutes from './branchRoutes.js';
import employeeRoutes from './employeeRoutes.js';

const router = Router();

// V2 API Routes (SQL Server)
router.use('/api/v2/auth', authRoutes);
router.use('/api/v2/branches', branchRoutes);
router.use('/api/v2/employees', employeeRoutes);

export default router;
