import { Router } from 'express';
import authRoutes from './authRoutes.js';
import branchRoutes from './branchRoutes.js';
import employeeRoutes from './employeeRoutes.js';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/branches', branchRoutes);
router.use('/api/employees', employeeRoutes);

export default router;