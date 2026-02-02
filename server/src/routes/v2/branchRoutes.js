import { Router } from 'express';
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchStatus,
} from '../../controllers/v2/branchController.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/').get(getBranches).post(createBranch);

router
  .route('/:id')
  .get(getBranch)
  .put(updateBranch)
  .delete(deleteBranch);

router.patch('/:id/toggle-status', toggleBranchStatus);

export default router;
