import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  getMyApprovals,
  getMySupervisedEmployees,
  updateEmployeeBonus,
  bulkCreateEmployees,
  downloadTemplate,
  submitBonusesForApproval,
  getMyBonusApprovals,
  processBonusApproval,
  bulkApproveAll,
} from "../../controllers/v2/employeeController.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// Public routes for testing (or add protect middleware as needed)
router.get("/approvals/my-approvals", getMyApprovals);
router.get("/supervisor/my-team", getMySupervisedEmployees);
router.post("/supervisor/submit-for-approval", submitBonusesForApproval);

// Bonus approval routes
router.get("/bonus-approvals/my-approvals", getMyBonusApprovals);
router.post("/:employeeId/bonus-approval", processBonusApproval);
router.post("/approvals/bulk-approve", bulkApproveAll);

// Template download route (before protect middleware to allow download)
router.get("/template/download", downloadTemplate);

// Protected routes
router.use(protect);

router.route("/").get(getEmployees).post(createEmployee);

// Bulk upload route
router.post("/bulk", bulkCreateEmployees);

router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

router.patch("/:id/toggle-status", toggleEmployeeStatus);
router.put("/:id/bonus", updateEmployeeBonus);

export default router;
