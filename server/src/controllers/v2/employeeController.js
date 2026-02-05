import { getEmployee as getEmployeeModel } from "../../models/sql/Employee.js";
import AppError from "../../utils/appError.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// Helper function to determine the next required approval level
const getNextApprovalLevel = (employee) => {
  // Only process if submitted for approval
  if (!employee.approvalStatus?.submittedForApproval) {
    return null;
  }

  // Check levels in order
  for (let level = 1; level <= 5; level++) {
    const levelKey = `level${level}`;
    const approverIdField = `${levelKey}ApproverId`;

    // If this level has an approver
    if (employee[approverIdField]) {
      const status = employee.approvalStatus?.[levelKey]?.status;

      // If pending, this is the next level
      if (status === "pending") {
        return { level, approverId: employee[approverIdField] };
      }

      // If status exists and is not approved, approval is blocked at this level
      if (status && status !== "approved") {
        return null;
      }
    }
  }
  return null; // All levels approved or no more levels
};

// @desc    Get all employees
// @route   GET /api/v2/employees
// @access  Private
export const getEmployees = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const { isActive, branch, role } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (branch) {
      where.branch = branch;
    }
    if (role) {
      where.role = role;
    }

    const employees = await Employee.findAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["employeeId", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/v2/employees/:id
// @access  Private
export const getEmployee = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const employee = await Employee.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "supervisor",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
      ],
    });

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/v2/employees
// @access  Private (Admin/HR only)
export const createEmployee = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    // Hash password before saving
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Flatten address object if it exists
    if (req.body.address) {
      req.body.addressStreet = req.body.address.street;
      req.body.addressCity = req.body.address.city;
      req.body.addressState = req.body.address.state;
      req.body.addressZipCode = req.body.address.zipCode;
      req.body.addressCountry = req.body.address.country || "USA";
      delete req.body.address;
    }

    const employee = await Employee.create(req.body);

    // Remove password from response
    const employeeData = employee.toJSON();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeData,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = Object.keys(error.fields)[0];
      return next(new AppError(`${field} already exists`, 400));
    }
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/v2/employees/:id
// @access  Private (Admin/HR only)
export const updateEmployee = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    // Flatten address object if it exists
    if (req.body.address) {
      req.body.addressStreet = req.body.address.street;
      req.body.addressCity = req.body.address.city;
      req.body.addressState = req.body.address.state;
      req.body.addressZipCode = req.body.address.zipCode;
      req.body.addressCountry = req.body.address.country || "USA";
      delete req.body.address;
    }

    const [updated] = await Employee.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return next(new AppError("Employee not found", 404));
    }

    const employee = await Employee.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/v2/employees/:id
// @access  Private (Admin only)
export const deleteEmployee = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const deleted = await Employee.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return next(new AppError("Employee not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle employee active status
// @route   PATCH /api/v2/employees/:id/toggle-status
// @access  Private (Admin/HR only)
export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    const employeeData = employee.toJSON();
    delete employeeData.password;

    res.status(200).json({
      success: true,
      message: `Employee ${employee.isActive ? "activated" : "deactivated"} successfully`,
      data: employeeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees for approver (by approval level)
// @route   GET /api/v2/employees/approvals/my-approvals
// @access  Private (Approver only) OR Public with approverId
export const getMyApprovals = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const approverId = req.user?.userId || req.user?.id || req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Find all active employees where this user is an approver at any level
    const allEmployees = await Employee.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { level1ApproverId: approverId },
          { level2ApproverId: approverId },
          { level3ApproverId: approverId },
          { level4ApproverId: approverId },
          { level5ApproverId: approverId },
        ],
        id: { [Op.ne]: approverId },
      },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
      ],
      order: [["employeeId", "ASC"]],
    });

    // FILTER: Only show employees who have submitted bonuses for approval
    const submittedEmployees = allEmployees.filter(emp => emp.approvalStatus?.submittedForApproval === true);

    // Simple grouping by level - no complex filtering
    const groupedData = {
      level1: submittedEmployees.filter(emp => emp.level1ApproverId?.toString() === approverId.toString()),
      level2: submittedEmployees.filter(emp => emp.level2ApproverId?.toString() === approverId.toString()),
      level3: submittedEmployees.filter(emp => emp.level3ApproverId?.toString() === approverId.toString()),
      level4: submittedEmployees.filter(emp => emp.level4ApproverId?.toString() === approverId.toString()),
      level5: submittedEmployees.filter(emp => emp.level5ApproverId?.toString() === approverId.toString()),
    };

    res.status(200).json({
      success: true,
      data: groupedData,
      counts: {
        level1: groupedData.level1.length,
        level2: groupedData.level2.length,
        level3: groupedData.level3.length,
        level4: groupedData.level4.length,
        level5: groupedData.level5.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees under a supervisor
// @route   GET /api/v2/employees/supervisor/my-team
// @access  Private (Supervisor only) OR Public with supervisorId
export const getMySupervisedEmployees = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const supervisorId =
      req.user?.userId || req.user?.id || req.query.supervisorId;

    if (
      !supervisorId ||
      supervisorId === "undefined" ||
      supervisorId === "null"
    ) {
      return next(new AppError("Supervisor ID is required", 400));
    }

    const employees = await Employee.findAll({
      where: {
        supervisorId: supervisorId,
        isActive: true,
        id: { [Op.ne]: supervisorId },
      },
      attributes: { exclude: ["password"] },
      order: [["employeeId", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee bonus
// @route   PUT /api/v2/employees/:id/bonus
// @access  Private (Supervisor only)
export const updateEmployeeBonus = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const { id } = req.params;
    const { bonus2025 } = req.body || {};
    const supervisorId =
      req.user?.userId ||
      req.user?.id ||
      req.body?.supervisorId ||
      req.query?.supervisorId;

    if (
      !supervisorId ||
      supervisorId === "undefined" ||
      supervisorId === "null"
    ) {
      return next(new AppError("Supervisor ID is required", 400));
    }

    if (bonus2025 === undefined || bonus2025 === null) {
      return next(new AppError("Bonus amount is required", 400));
    }

    if (bonus2025 < 0) {
      return next(new AppError("Bonus amount cannot be negative", 400));
    }

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    if (
      !employee.supervisorId ||
      employee.supervisorId.toString() !== supervisorId.toString()
    ) {
      return next(
        new AppError(
          "You are not authorized to set bonus for this employee",
          403,
        ),
      );
    }

    // Check if already submitted
    const approvalStatus = employee.approvalStatus || {};
    if (approvalStatus.submittedForApproval) {
      return next(
        new AppError(
          "Bonus has already been submitted for approval and cannot be edited",
          403,
        ),
      );
    }

    // Update bonus and approval metadata
    employee.bonus2025 = parseFloat(bonus2025);
    employee.approvalStatus = {
      ...approvalStatus,
      enteredBy: supervisorId,
      enteredAt: new Date(),
    };
    await employee.save();

    const updatedEmployee = await Employee.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Bonus updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create employees from Excel upload
// @route   POST /api/v2/employees/bulk
// @access  Private (Admin/HR only)
export const bulkCreateEmployees = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const { employees } = req.body || {};

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return next(new AppError("Please provide an array of employees", 400));
    }

    // Validate required fields for each employee
    const invalidEmployees = [];
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      if (!emp.employeeId || !emp.fullName) {
        invalidEmployees.push({
          index: i + 1,
          employeeId: emp.employeeId || "N/A",
          employeeName: emp.fullName || "N/A",
          reason: "Missing required fields (Employee Number, Full Name)",
        });
      }
    }

    if (invalidEmployees.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some employees have validation errors",
        errors: invalidEmployees,
      });
    }

    const createdEmployees = [];
    const skippedDuplicates = [];

    // Process each employee
    for (const emp of employees) {
      try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          emp.password || "abc123xyz",
          salt,
        );

        // Extract reporting fields
        const {
          reporting1st,
          reporting2nd,
          reporting3rd,
          reporting4th,
          reporting5th,
          address,
          ...employeeData
        } = emp;

        // Flatten address object if it exists
        const addressFields = {};
        if (address) {
          addressFields.addressStreet = address.street;
          addressFields.addressCity = address.city;
          addressFields.addressState = address.state;
          addressFields.addressZipCode = address.zipCode;
          addressFields.addressCountry = address.country || "USA";
        }

        // Store reporting names
        const reportingFields = {};
        if (reporting1st) reportingFields.level1ApproverName = reporting1st;
        if (reporting2nd) reportingFields.level2ApproverName = reporting2nd;
        if (reporting3rd) reportingFields.level3ApproverName = reporting3rd;
        if (reporting4th) reportingFields.level4ApproverName = reporting4th;
        if (reporting5th) reportingFields.level5ApproverName = reporting5th;

        // Create employee
        const created = await Employee.create({
          ...employeeData,
          ...addressFields,
          ...reportingFields,
          password: hashedPassword,
        });

        createdEmployees.push(created);
      } catch (error) {
        // Track which employees failed and why
        let reason = error.message || "Validation error";

        if (error.name === "SequelizeUniqueConstraintError") {
          // Check which field caused the duplicate error
          const fields = error.fields || {};
          if (fields.employeeId || error.message?.includes("employeeId")) {
            reason = "Duplicate Employee ID (already exists in database)";
          } else {
            reason = `Duplicate entry: ${Object.keys(fields).join(", ")}`;
          }
        }

        skippedDuplicates.push({
          employeeId: emp.employeeId,
          employeeName: emp.fullName || "N/A",
          email: emp.email || "N/A",
          reason: reason,
        });
      }
    }

    // Second pass: Sync approver IDs from names
    let reportingMapped = 0;
    const allEmployees = await Employee.findAll();

    // Create lookup maps
    const employeeIdMap = new Map();
    const nameMap = new Map();

    for (const emp of allEmployees) {
      employeeIdMap.set(emp.employeeId, emp);
      const fullName = emp.fullName.toLowerCase();
      nameMap.set(fullName, emp);
      // Also try "LastName, FirstName" and "FirstName LastName" variants
      const nameParts = emp.fullName.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts.slice(0, -1).join(' ');
        const lastName = nameParts[nameParts.length - 1];
        const lastFirst = `${lastName}, ${firstName}`.toLowerCase();
        nameMap.set(lastFirst, emp);
      }
    }

    // Helper function to find approver
    const findApprover = (nameOrId) => {
      if (!nameOrId || nameOrId === "-") return null;

      // Try employee ID first
      let approver = employeeIdMap.get(nameOrId);
      if (approver) return approver;

      // Try name matching
      const searchKey = nameOrId.toLowerCase().trim();
      approver = nameMap.get(searchKey);
      if (approver) return approver;

      // Try "LastName, FirstName" format
      const nameParts = nameOrId.split(",").map((s) => s.trim());
      if (nameParts.length === 2) {
        const [lastName, firstName] = nameParts;
        const key = `${lastName}, ${firstName}`.toLowerCase();
        approver = nameMap.get(key);
        if (approver) return approver;

        const reverseKey = `${firstName} ${lastName}`.toLowerCase();
        approver = nameMap.get(reverseKey);
        if (approver) return approver;
      }

      return null;
    };

    // Update approver IDs
    for (const employee of createdEmployees) {
      const updates = {};

      if (employee.level1ApproverName) {
        const approver = findApprover(employee.level1ApproverName);
        if (approver) updates.level1ApproverId = approver.id;
      }
      if (employee.level2ApproverName) {
        const approver = findApprover(employee.level2ApproverName);
        if (approver) updates.level2ApproverId = approver.id;
      }
      if (employee.level3ApproverName) {
        const approver = findApprover(employee.level3ApproverName);
        if (approver) updates.level3ApproverId = approver.id;
      }
      if (employee.level4ApproverName) {
        const approver = findApprover(employee.level4ApproverName);
        if (approver) updates.level4ApproverId = approver.id;
      }
      if (employee.level5ApproverName) {
        const approver = findApprover(employee.level5ApproverName);
        if (approver) updates.level5ApproverId = approver.id;
      }
      if (employee.supervisorName) {
        const supervisor = findApprover(employee.supervisorName);
        if (supervisor) updates.supervisorId = supervisor.id;
      }

      if (Object.keys(updates).length > 0) {
        await employee.update(updates);
        reportingMapped++;
      }
    }

    // Set approver role for employees who are approvers
    const approverIds = new Set();
    const employeesWithApprovers = await Employee.findAll({
      where: {
        [Op.or]: [
          { level1ApproverId: { [Op.ne]: null } },
          { level2ApproverId: { [Op.ne]: null } },
          { level3ApproverId: { [Op.ne]: null } },
          { level4ApproverId: { [Op.ne]: null } },
          { level5ApproverId: { [Op.ne]: null } },
        ],
      },
    });

    for (const emp of employeesWithApprovers) {
      if (emp.level1ApproverId) approverIds.add(emp.level1ApproverId);
      if (emp.level2ApproverId) approverIds.add(emp.level2ApproverId);
      if (emp.level3ApproverId) approverIds.add(emp.level3ApproverId);
      if (emp.level4ApproverId) approverIds.add(emp.level4ApproverId);
      if (emp.level5ApproverId) approverIds.add(emp.level5ApproverId);
    }

    let approverRoleCount = 0;
    if (approverIds.size > 0) {
      const [updateCount] = await Employee.update(
        { role: "approver", isApprover: true },
        { where: { id: { [Op.in]: Array.from(approverIds) } } },
      );
      approverRoleCount = updateCount;
    }

    // If there were skipped duplicates, return 207 instead of 201
    const statusCode = skippedDuplicates.length > 0 ? 207 : 201;
    const message =
      skippedDuplicates.length > 0
        ? `Partially successful: ${createdEmployees.length} employees created, ${skippedDuplicates.length} skipped (already exist). Synced ${reportingMapped} approver relationships. Set ${approverRoleCount} employees as approvers.`
        : `Successfully created ${createdEmployees.length} employees. Synced ${reportingMapped} approver relationships. Set ${approverRoleCount} employees as approvers.`;

    res.status(statusCode).json({
      success: true,
      message,
      count: createdEmployees.length,
      reportingMapped,
      approverRolesSet: approverRoleCount,
      duplicates: skippedDuplicates.length > 0 ? skippedDuplicates : undefined,
      data: createdEmployees.map((emp) => {
        const empData = emp.toJSON();
        delete empData.password;
        return empData;
      }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download employee template
// @route   GET /api/v2/employees/template/download
// @access  Private (Admin/HR only)
export const downloadTemplate = async (req, res, next) => {
  try {
    const XLSX = await import("xlsx");

    // Define template headers
    const headers = [
      "Employee Number",
      "Employee Name",
      "Work Email",
      "SSN",
      "Company",
      "Company Code",
      "Supervisor Name",
      "Location",
      "1st Reporting",
      "2nd Reporting",
      "3rd Reporting",
      "4th Reporting",
      "5th Reporting",
      "State/Province",
      "Last Hire Date",
      "Employee Type",
      "Job Title",
      "Salary or Hourly",
      "Annual Salary",
      "Hourly Pay Rate",
      "2024 Bonus",
      "2025 Bonus",
      "Role",
    ];

    // Sample data row
    const sampleData = [
      "EMP001",
      "Doe, John",
      "john.doe@company.com",
      "123-45-6789",
      "Company Name",
      "COMP01",
      "Smith, Jane",
      "New York",
      "Manager, Bob",
      "Director, Alice",
      "",
      "",
      "",
      "NY",
      "2020-01-15",
      "Full-Time",
      "Software Engineer",
      "Salary",
      "80000",
      "",
      "5000",
      "",
      "employee",
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Employee Template");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_template.xlsx",
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Sync approver names to IDs for all employees
// @route   POST /api/v2/employees/sync-approvers
// @access  Private (Admin only)
export const syncApproverIds = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();

    // Get all employees at once
    const allEmployees = await Employee.findAll();

    // Create lookup maps for fast searching
    const employeeIdMap = new Map();
    const nameMap = new Map();

    // Build lookup maps
    for (const emp of allEmployees) {
      employeeIdMap.set(emp.employeeId, emp);
      const fullName = emp.fullName.toLowerCase();
      nameMap.set(fullName, emp);
      // Also try "LastName, FirstName" and "FirstName LastName" variants
      const nameParts = emp.fullName.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts.slice(0, -1).join(' ');
        const lastName = nameParts[nameParts.length - 1];
        const lastFirst = `${lastName}, ${firstName}`.toLowerCase();
        nameMap.set(lastFirst, emp);
      }
    }

    // Helper function to find approver using maps
    const findApproverByName = (nameOrId) => {
      if (!nameOrId || nameOrId === "-") return null;

      let approver = employeeIdMap.get(nameOrId);
      if (approver) return approver;

      const searchKey = nameOrId.toLowerCase().trim();
      approver = nameMap.get(searchKey);
      if (approver) return approver;

      const nameParts = nameOrId.split(",").map((s) => s.trim());
      if (nameParts.length === 2) {
        const [lastName, firstName] = nameParts;
        const key = `${lastName}, ${firstName}`.toLowerCase();
        approver = nameMap.get(key);
        if (approver) return approver;

        const reverseKey = `${firstName} ${lastName}`.toLowerCase();
        approver = nameMap.get(reverseKey);
        if (approver) return approver;
      }

      const parts = nameOrId.split(" ").map((s) => s.trim());
      if (parts.length >= 2) {
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        const key = `${firstName} ${lastName}`.toLowerCase();
        approver = nameMap.get(key);
        if (approver) return approver;

        const reverseKey = `${lastName}, ${firstName}`.toLowerCase();
        approver = nameMap.get(reverseKey);
        if (approver) return approver;
      }

      return null;
    };

    let updatedCount = 0;
    const errors = [];

    // Process each employee
    for (const employee of allEmployees) {
      const updates = {};
      let hasUpdates = false;

      const levels = [
        { nameField: "supervisorName", idField: "supervisorId" },
        { nameField: "level1ApproverName", idField: "level1ApproverId" },
        { nameField: "level2ApproverName", idField: "level2ApproverId" },
        { nameField: "level3ApproverName", idField: "level3ApproverId" },
        { nameField: "level4ApproverName", idField: "level4ApproverId" },
        { nameField: "level5ApproverName", idField: "level5ApproverId" },
      ];

      for (const level of levels) {
        const approverName = employee[level.nameField];

        if (approverName) {
          const approver = findApproverByName(approverName);

          if (approver) {
            const currentId = employee[level.idField]?.toString();
            const newId = approver.id.toString();

            if (!currentId || currentId !== newId) {
              updates[level.idField] = approver.id;
              hasUpdates = true;
            }
          } else {
            errors.push({
              employeeId: employee.employeeId,
              employeeName: employee.fullName,
              level: level.nameField
                .replace("ApproverName", "")
                .replace("Name", ""),
              approverName: approverName,
              reason: "Person not found in database",
            });
          }
        }
      }

      if (hasUpdates) {
        await employee.update(updates);
        updatedCount++;
      }
    }

    if (res) {
      return res.status(200).json({
        success: true,
        message: "Successfully synced supervisor and approver IDs",
        updated: updatedCount,
        total: allEmployees.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    return { updated: updatedCount, total: allEmployees.length, errors };
  } catch (error) {
    if (res) {
      return next(error);
    }
    throw error;
  }
};

// @desc    Clear and re-sync all approver IDs
// @route   POST /api/v2/employees/approvals/reset-and-sync
// @access  Private (Admin only)
export const resetAndSyncApprovers = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();

    // Clear all approver ID fields and supervisor
    const [clearCount] = await Employee.update(
      {
        supervisorId: null,
        level1ApproverId: null,
        level2ApproverId: null,
        level3ApproverId: null,
        level4ApproverId: null,
        level5ApproverId: null,
      },
      { where: {} },
    );

    // Re-sync using the approver names
    const syncResult = await syncApproverIds();

    res.status(200).json({
      success: true,
      message:
        "Successfully cleared and re-synced all supervisor and approver assignments",
      cleared: clearCount,
      synced: syncResult.updated,
      total: syncResult.total,
      errors: syncResult.errors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set approver role for all employees who are approvers
// @route   POST /api/v2/employees/set-approver-roles
// @access  Private (Admin only)
export const setApproverRoles = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();

    // Find all employees who are assigned as approvers
    const employeesWithApprovers = await Employee.findAll({
      where: {
        [Op.or]: [
          { level1ApproverId: { [Op.ne]: null } },
          { level2ApproverId: { [Op.ne]: null } },
          { level3ApproverId: { [Op.ne]: null } },
          { level4ApproverId: { [Op.ne]: null } },
          { level5ApproverId: { [Op.ne]: null } },
        ],
      },
    });

    // Collect all unique approver IDs
    const approverIds = new Set();
    for (const emp of employeesWithApprovers) {
      if (emp.level1ApproverId) approverIds.add(emp.level1ApproverId);
      if (emp.level2ApproverId) approverIds.add(emp.level2ApproverId);
      if (emp.level3ApproverId) approverIds.add(emp.level3ApproverId);
      if (emp.level4ApproverId) approverIds.add(emp.level4ApproverId);
      if (emp.level5ApproverId) approverIds.add(emp.level5ApproverId);
    }

    // Update role to "approver" for all employees who are approvers
    let approverRoleCount = 0;
    if (approverIds.size > 0) {
      const [updateCount] = await Employee.update(
        { role: "approver", isApprover: true },
        { where: { id: { [Op.in]: Array.from(approverIds) } } },
      );
      approverRoleCount = updateCount;
    }

    res.status(200).json({
      success: true,
      message: `Successfully set approver role for ${approverRoleCount} employees`,
      totalApprovers: approverIds.size,
      updated: approverRoleCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Debug endpoint to check approver assignments
// @route   GET /api/v2/employees/approvals/debug/:employeeId
// @access  Private (Admin only)
export const debugApproverAssignments = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const { employeeId } = req.params;

    // Find the approver
    const approver = await Employee.findOne({
      where: { employeeId },
      attributes: ["id", "employeeId", "fullName"],
    });

    if (!approver) {
      return res.status(404).json({
        success: false,
        message: "Approver not found",
      });
    }

    const approverId = approver.id;

    // Use the EXACT same queries as getMyApprovals
    const level1Count = await Employee.count({
      where: {
        level1ApproverId: approverId,
        isActive: true,
        id: { [Op.ne]: approverId },
      },
    });

    const level2Count = await Employee.count({
      where: {
        level2ApproverId: approverId,
        level1ApproverId: { [Op.ne]: approverId },
        isActive: true,
        id: { [Op.ne]: approverId },
      },
    });

    const level3Count = await Employee.count({
      where: {
        level3ApproverId: approverId,
        level1ApproverId: { [Op.ne]: approverId },
        level2ApproverId: { [Op.ne]: approverId },
        isActive: true,
        id: { [Op.ne]: approverId },
      },
    });

    const level4Count = await Employee.count({
      where: {
        level4ApproverId: approverId,
        level1ApproverId: { [Op.ne]: approverId },
        level2ApproverId: { [Op.ne]: approverId },
        level3ApproverId: { [Op.ne]: approverId },
        isActive: true,
        id: { [Op.ne]: approverId },
      },
    });

    const level5Count = await Employee.count({
      where: {
        level5ApproverId: approverId,
        level1ApproverId: { [Op.ne]: approverId },
        level2ApproverId: { [Op.ne]: approverId },
        level3ApproverId: { [Op.ne]: approverId },
        level4ApproverId: { [Op.ne]: approverId },
        isActive: true,
        id: { [Op.ne]: approverId },
      },
    });

    // Get sample employees from Level 1
    const sampleLevel1 = await Employee.findAll({
      where: {
        level1ApproverId: approverId,
        isActive: true,
        id: { [Op.ne]: approverId },
      },
      attributes: [
        "employeeId",
        "fullName",
        "level1ApproverName",
        "level2ApproverName",
        "level3ApproverName",
        "level4ApproverName",
        "level5ApproverName",
      ],
      include: [
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["employeeId", "fullName"],
        },
      ],
      limit: 10,
    });

    // Get sample from Level 2
    const sampleLevel2 = await Employee.findAll({
      where: {
        level2ApproverId: approverId,
        level1ApproverId: { [Op.ne]: approverId },
        isActive: true,
        id: { [Op.ne]: approverId },
      },
      attributes: [
        "employeeId",
        "fullName",
        "level1ApproverName",
        "level2ApproverName",
        "level3ApproverName",
        "level4ApproverName",
        "level5ApproverName",
      ],
      include: [
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["employeeId", "fullName"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["employeeId", "fullName"],
        },
      ],
      limit: 10,
    });

    res.status(200).json({
      success: true,
      approver: {
        employeeId: approver.employeeId,
        name: approver.fullName,
        id: approver.id,
      },
      counts: {
        level1: level1Count,
        level2: level2Count,
        level3: level3Count,
        level4: level4Count,
        level5: level5Count,
      },
      sampleLevel1Employees: sampleLevel1,
      sampleLevel2Employees: sampleLevel2,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Submit all bonuses for approval (supervisor action)
// @route   POST /api/v2/employees/supervisor/submit-for-approval
// @access  Private (Supervisor only)
export const submitBonusesForApproval = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const supervisorId =
      req.user?.userId ||
      req.user?.id ||
      req.body?.supervisorId ||
      req.query?.supervisorId;

    if (
      !supervisorId ||
      supervisorId === "undefined" ||
      supervisorId === "null"
    ) {
      return next(new AppError("Supervisor ID is required", 400));
    }

    // Find all employees under this supervisor
    const employees = await Employee.findAll({
      where: {
        supervisorId: supervisorId,
        isActive: true,
        id: { [Op.ne]: supervisorId },
      },
    });

    if (!employees || employees.length === 0) {
      return next(
        new AppError("No employees found under your supervision", 404),
      );
    }

    // Filter employees with bonuses entered but not yet submitted
    const employeesToSubmit = employees.filter((emp) => {
      const status = emp.approvalStatus || {};
      // Filter out those already submitted or with no bonus
      return !status.submittedForApproval && emp.bonus2025 > 0;
    });

    if (employeesToSubmit.length === 0) {
      return next(
        new AppError(
          "No bonuses available to submit. Please ensure bonuses are entered and not already submitted.",
          400,
        ),
      );
    }

    // Update each employee
    for (const employee of employeesToSubmit) {
      // Get existing approval status safely
      const existingStatus = employee.approvalStatus || {};

      // Build status object preserving enteredBy/enteredAt if they exist
      const status = {
        submittedForApproval: true,
        submittedAt: new Date(),
        enteredBy: existingStatus.enteredBy || supervisorId,
        enteredAt: existingStatus.enteredAt || new Date(),
      };

      // Reset levels to pending if they have an approver
      if (employee.level1ApproverId)
        status.level1 = { status: "pending", approvedBy: null, approvedAt: null, comments: null };
      if (employee.level2ApproverId)
        status.level2 = { status: "pending", approvedBy: null, approvedAt: null, comments: null };
      if (employee.level3ApproverId)
        status.level3 = { status: "pending", approvedBy: null, approvedAt: null, comments: null };
      if (employee.level4ApproverId)
        status.level4 = { status: "pending", approvedBy: null, approvedAt: null, comments: null };
      if (employee.level5ApproverId)
        status.level5 = { status: "pending", approvedBy: null, approvedAt: null, comments: null };

      // Use update instead of save to avoid circular references
      await Employee.update(
        { approvalStatus: status },
        { where: { id: employee.id } }
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Great work! You have assigned bonuses for all the employees designated to you. They are sent to the next level for review.",
      count: employeesToSubmit.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees pending bonus approval for approver
// @route   GET /api/v2/employees/bonus-approvals/my-approvals
// @access  Private (Approver only)
export const getMyBonusApprovals = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const approverId =
      req.user?.userId || req.user?.id || req.query?.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Find ALL active employees assigned to this approver - just return them all
    const allEmployees = await Employee.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { level1ApproverId: approverId },
          { level2ApproverId: approverId },
          { level3ApproverId: approverId },
          { level4ApproverId: approverId },
          { level5ApproverId: approverId },
        ],
      },
      attributes: { exclude: ["password"] },
      order: [["employeeId", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: allEmployees.length,
      data: allEmployees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process bonus approval/rejection
// @route   POST /api/v2/employees/:employeeId/bonus-approval
// @access  Private (Approver only)
export const processBonusApproval = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const { employeeId } = req.params;
    const { action, comments, approverId: bodyApproverId } = req.body || {};
    const approverId =
      req.user?.userId ||
      req.user?.id ||
      bodyApproverId ||
      req.query?.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return next(new AppError("Action must be either approve or reject", 400));
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    const isBonusEntered = !!(
      employee.approvalStatus?.enteredBy ||
      (employee.bonus2025 && employee.bonus2025 > 0)
    );
    if (!isBonusEntered) {
      return next(
        new AppError("No bonus has been entered for this employee", 400),
      );
    }

    if (!employee.approvalStatus?.submittedForApproval) {
      return next(
        new AppError("Bonus has not been submitted for approval yet", 400),
      );
    }

    // Determine which level this approver should approve
    let approverLevel = null;
    for (let level = 1; level <= 5; level++) {
      const levelKey = `level${level}`;
      const approverIdField = `${levelKey}ApproverId`;

      if (employee[approverIdField]?.toString() === approverId.toString()) {
        const status = employee.approvalStatus?.[levelKey]?.status;
        if (status === "pending") {
          // Check if previous levels are approved
          let canApprove = true;
          for (let prevLevel = 1; prevLevel < level; prevLevel++) {
            const prevLevelKey = `level${prevLevel}`;
            const prevStatus = employee.approvalStatus?.[prevLevelKey]?.status;
            if (prevStatus && prevStatus !== "approved") {
              canApprove = false;
              break;
            }
          }

          if (canApprove) {
            approverLevel = level;
            break;
          } else {
            return next(
              new AppError(
                `Previous approval levels must be completed first`,
                400,
              ),
            );
          }
        }
      }
    }

    if (!approverLevel) {
      return next(
        new AppError(
          "You are not authorized to approve bonus for this employee at this time",
          403,
        ),
      );
    }

    // Update bonus approval status - convert to plain object to avoid circular references
    const existingStatus = employee.approvalStatus
      ? JSON.parse(JSON.stringify(employee.approvalStatus))
      : {};

    const levelKey = `level${approverLevel}`;
    existingStatus[levelKey] = {
      ...(existingStatus[levelKey] || {}),
      status: action === "approve" ? "approved" : "rejected",
      approvedBy: approverId,
      approvedAt: new Date(),
      comments: comments || existingStatus[levelKey]?.comments,
    };

    // Use update instead of save to avoid circular references
    await Employee.update(
      { approvalStatus: existingStatus },
      { where: { id: employeeId } }
    );

    const updatedEmployee = await Employee.findByPk(employeeId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "supervisor",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level1Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level2Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level3Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level4Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
        {
          model: Employee,
          as: "level5Approver",
          attributes: ["id", "fullName", "employeeId"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Bonus ${action === "approve" ? "approved" : "rejected"} successfully at level ${approverLevel}`,
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk approve all eligible employees for an approver
// @route   POST /api/v2/employees/approvals/bulk-approve
// @access  Private (Approver only)
export const bulkApproveAll = async (req, res, next) => {
  try {
    const Employee = getEmployeeModel();
    const approverId =
      req.user?.userId ||
      req.user?.id ||
      req.body?.approverId ||
      req.query?.approverId;
    const { comments } = req.body || {};

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Get all employees where this user is an approver at any level
    const allEmployees = await Employee.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { level1ApproverId: approverId },
          { level2ApproverId: approverId },
          { level3ApproverId: approverId },
          { level4ApproverId: approverId },
          { level5ApproverId: approverId },
        ],
      },
    });

    // Filter to those where this user is the NEXT pending approver
    const eligibleEmployees = allEmployees.filter((emp) => {
      const nextLevel = getNextApprovalLevel(emp);
      return (
        nextLevel && nextLevel.approverId.toString() === approverId.toString()
      );
    });

    if (eligibleEmployees.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employees found awaiting your approval",
        count: 0,
      });
    }

    let approvedCount = 0;
    for (const employee of eligibleEmployees) {
      const nextLevel = getNextApprovalLevel(employee);
      if (nextLevel) {
        // Convert to plain object to avoid circular references
        const existingStatus = employee.approvalStatus
          ? JSON.parse(JSON.stringify(employee.approvalStatus))
          : {};

        const levelKey = `level${nextLevel.level}`;
        existingStatus[levelKey] = {
          ...(existingStatus[levelKey] || {}),
          status: "approved",
          approvedBy: approverId,
          approvedAt: new Date(),
          comments: comments || existingStatus[levelKey]?.comments,
        };

        // Use update instead of save to avoid circular references
        await Employee.update(
          { approvalStatus: existingStatus },
          { where: { id: employee.id } }
        );
        approvedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully approved bonuses for ${approvedCount} employees`,
      approvedCount: approvedCount,
    });
  } catch (error) {
    next(error);
  }
};
