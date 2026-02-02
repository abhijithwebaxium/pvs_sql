import express from "express";
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchStatus,
} from "../controllers/branchController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect); // All routes are protected

// Only HR and Admin can view branches
router
  .route("/")
  .get(authorize(["hr", "admin", "approver", "employee"]), getBranches)
  .post(authorize(["hr", "admin"]), createBranch);

router
  .route("/:id")
  .get(authorize(["hr", "admin"]), getBranch)
  .put(authorize(["hr", "admin"]), updateBranch)
  .delete(authorize(["admin"]), deleteBranch);

router.patch(
  "/:id/toggle-status",
  authorize(["hr", "admin"]),
  toggleBranchStatus,
);

export default router;
