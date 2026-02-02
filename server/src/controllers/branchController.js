import Branch from "../models/Branch.js";
import AppError from "../utils/appError.js";

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
export const getBranches = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const branches = await Branch.find(filter)
      .populate("manager", "firstName lastName employeeId")
      .sort({ branchCode: 1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private
export const getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate(
      "manager",
      "firstName lastName employeeId email phone",
    );

    if (!branch) {
      return next(new AppError("Branch not found", 404));
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (Admin/HR only)
export const createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("Branch code already exists", 400));
    }
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (Admin/HR only)
export const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("manager", "firstName lastName employeeId");

    if (!branch) {
      return next(new AppError("Branch not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (Admin only)
export const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);

    if (!branch) {
      return next(new AppError("Branch not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle branch active status
// @route   PATCH /api/branches/:id/toggle-status
// @access  Private (Admin/HR only)
export const toggleBranchStatus = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return next(new AppError("Branch not found", 404));
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    res.status(200).json({
      success: true,
      message: `Branch ${branch.isActive ? "activated" : "deactivated"} successfully`,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};
