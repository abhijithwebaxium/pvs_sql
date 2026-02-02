import { getBranch as getBranchModel } from '../../models/sql/Branch.js';
import { getEmployee as getEmployeeModel } from '../../models/sql/Employee.js';
import AppError from '../../utils/appError.js';

// @desc    Get all branches
// @route   GET /api/v2/branches
// @access  Private
export const getBranches = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    const Employee = getEmployeeModel();
    const { isActive } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const branches = await Branch.findAll({
      where,
      include: [
        { model: Employee, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'employeeId'] },
      ],
      order: [['branchCode', 'ASC']],
    });

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
// @route   GET /api/v2/branches/:id
// @access  Private
export const getBranch = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    const Employee = getEmployeeModel();
    const branch = await Branch.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'employeeId', 'email', 'phone']
        },
      ],
    });

    if (!branch) {
      return next(new AppError('Branch not found', 404));
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
// @route   POST /api/v2/branches
// @access  Private (Admin/HR only)
export const createBranch = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    // Flatten address object if it exists
    if (req.body.address) {
      req.body.addressStreet = req.body.address.street;
      req.body.addressCity = req.body.address.city;
      req.body.addressState = req.body.address.state;
      req.body.addressZipCode = req.body.address.zipCode;
      req.body.addressCountry = req.body.address.country || 'USA';
      delete req.body.address;
    }

    // Flatten contactInfo if it exists
    if (req.body.contactInfo) {
      req.body.contactPhone = req.body.contactInfo.phone;
      req.body.contactEmail = req.body.contactInfo.email;
      delete req.body.contactInfo;
    }

    const branch = await Branch.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('Branch code already exists', 400));
    }
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/v2/branches/:id
// @access  Private (Admin/HR only)
export const updateBranch = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    const Employee = getEmployeeModel();
    // Flatten address object if it exists
    if (req.body.address) {
      req.body.addressStreet = req.body.address.street;
      req.body.addressCity = req.body.address.city;
      req.body.addressState = req.body.address.state;
      req.body.addressZipCode = req.body.address.zipCode;
      req.body.addressCountry = req.body.address.country || 'USA';
      delete req.body.address;
    }

    // Flatten contactInfo if it exists
    if (req.body.contactInfo) {
      req.body.contactPhone = req.body.contactInfo.phone;
      req.body.contactEmail = req.body.contactInfo.email;
      delete req.body.contactInfo;
    }

    const [updated] = await Branch.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return next(new AppError('Branch not found', 404));
    }

    const branch = await Branch.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'employeeId'] },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete branch
// @route   DELETE /api/v2/branches/:id
// @access  Private (Admin only)
export const deleteBranch = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    const deleted = await Branch.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return next(new AppError('Branch not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Branch deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle branch active status
// @route   PATCH /api/v2/branches/:id/toggle-status
// @access  Private (Admin/HR only)
export const toggleBranchStatus = async (req, res, next) => {
  try {
    const Branch = getBranchModel();
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return next(new AppError('Branch not found', 404));
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    res.status(200).json({
      success: true,
      message: `Branch ${branch.isActive ? 'activated' : 'deactivated'} successfully`,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};
