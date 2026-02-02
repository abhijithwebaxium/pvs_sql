import { Router } from 'express';
import { signup, login, logout, getMe } from '../../controllers/v2/authController.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
