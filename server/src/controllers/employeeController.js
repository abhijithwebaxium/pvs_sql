import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcryptjs";

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res, next) => {
  try {
    const { isActive, branch, role } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    if (branch) {
      filter.branch = branch;
    }
    if (role) {
      filter.role = role;
    }

    const employees = await Employee.find(filter)
      .select("-password")
      .sort({ employeeId: 1 });

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
// @route   GET /api/employees/:id
// @access  Private
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select("-password")
      .populate("supervisor", "firstName lastName employeeId")
      .populate("level1Approver", "firstName lastName employeeId")
      .populate("level2Approver", "firstName lastName employeeId")
      .populate("level3Approver", "firstName lastName employeeId")
      .populate("level4Approver", "firstName lastName employeeId")
      .populate("level5Approver", "firstName lastName employeeId");

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
// @route   POST /api/employees
// @access  Private (Admin/HR only)
export const createEmployee = async (req, res, next) => {
  try {
    // Hash password before saving
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const employee = await Employee.create(req.body);

    // Remove password from response
    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeData,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new AppError(`${field} already exists`, 400));
    }
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR only)
export const updateEmployee = async (req, res, next) => {
  try {
    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .select("-password")

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

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
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
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
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (Admin/HR only)
export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(200).json({
      success: true,
      message: `Employee ${
        employee.isActive ? "activated" : "deactivated"
      } successfully`,
      data: employeeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees by branch
// @route   GET /api/employees/branch/:branchId
// @access  Private
export const getEmployeesByBranch = async (req, res, next) => {
  try {
    const employees = await Employee.find({ branch: req.params.branchId })
      .select("-password")
      .sort({ employeeId: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync approver names to IDs for all employees
// @route   POST /api/employees/sync-approvers
// @access  Private (Admin/HR only)
export const syncApproverIds = async (req, res, next) => {
  try {
    // Get all employees at once
    const allEmployees = await Employee.find({}).lean();

    // Create lookup maps for fast searching
    const employeeIdMap = new Map();
    const nameMap = new Map();

    // Build lookup maps
    for (const emp of allEmployees) {
      // Map by employeeId
      employeeIdMap.set(emp.employeeId, emp);

      // Map by "LastName, FirstName" format
      const fullName = `${emp.lastName}, ${emp.firstName}`.toLowerCase();
      nameMap.set(fullName, emp);

      // Map by "FirstName LastName" format
      const reverseName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      nameMap.set(reverseName, emp);

      // DO NOT map by first name only - this causes false matches!
      // Removed: nameMap.set(emp.firstName.toLowerCase(), emp);
    }

    // Helper function to find approver using maps
    const findApproverByName = (nameOrId) => {
      if (!nameOrId || nameOrId === "-") return null;

      // Try employee ID first
      let approver = employeeIdMap.get(nameOrId);
      if (approver) return approver;

      // Try name matching with various formats
      const searchKey = nameOrId.toLowerCase().trim();

      // Direct match
      approver = nameMap.get(searchKey);
      if (approver) return approver;

      // Try "LastName, FirstName" format
      const nameParts = nameOrId.split(",").map((s) => s.trim());
      if (nameParts.length === 2) {
        const [lastName, firstName] = nameParts;
        const key = `${lastName}, ${firstName}`.toLowerCase();
        approver = nameMap.get(key);
        if (approver) return approver;

        // Try reverse
        const reverseKey = `${firstName} ${lastName}`.toLowerCase();
        approver = nameMap.get(reverseKey);
        if (approver) return approver;
      }

      // Try "FirstName LastName" format
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
    const bulkUpdates = [];

    // Process each employee
    for (const employee of allEmployees) {
      const updates = {};
      let hasUpdates = false;

      // Process each level (including supervisor)
      const levels = [
        { nameField: "supervisorName", idField: "supervisor" },
        { nameField: "level1ApproverName", idField: "level1Approver" },
        { nameField: "level2ApproverName", idField: "level2Approver" },
        { nameField: "level3ApproverName", idField: "level3Approver" },
        { nameField: "level4ApproverName", idField: "level4Approver" },
        { nameField: "level5ApproverName", idField: "level5Approver" },
      ];

      for (const level of levels) {
        const approverName = employee[level.nameField];

        if (approverName) {
          // Try to find the approver
          const approver = findApproverByName(approverName);

          if (approver) {
            // Only update if different from current value
            const currentId = employee[level.idField]?.toString();
            const newId = approver._id.toString();

            if (!currentId || currentId !== newId) {
              updates[level.idField] = approver._id;
              hasUpdates = true;
            }
          } else {
            // Log when person not found
            errors.push({
              employeeId: employee.employeeId,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              level: level.nameField
                .replace("ApproverName", "")
                .replace("Name", ""),
              approverName: approverName,
              reason: "Person not found in database",
            });
          }
        }
      }

      // Prepare bulk update
      if (hasUpdates) {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: employee._id },
            update: { $set: updates },
          },
        });
        updatedCount++;
      }
    }

    // Execute all updates in one bulk operation
    if (bulkUpdates.length > 0) {
      await Employee.bulkWrite(bulkUpdates);
    }

    // If called via API, send response
    if (res) {
      return res.status(200).json({
        success: true,
        message: `Successfully synced supervisor and approver IDs`,
        updated: updatedCount,
        total: allEmployees.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // If called internally, return result
    return { updated: updatedCount, total: allEmployees.length, errors };
  } catch (error) {
    if (res) {
      return next(error);
    }
    throw error;
  }
};

// @desc    Bulk create employees from Excel upload
// @route   POST /api/employees/bulk
// @access  Private (Admin/HR only)
export const bulkCreateEmployees = async (req, res, next) => {
  let employeesForDB = [];
  let reportingData = [];

  try {
    const { employees } = req.body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return next(new AppError("Please provide an array of employees", 400));
    }

    // Validate required fields for each employee
    const invalidEmployees = [];
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      if (!emp.employeeId || !emp.firstName) {
        invalidEmployees.push({
          index: i + 1,
          employeeId: emp.employeeId || "N/A",
          employeeName:
            `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "N/A",
          reason: "Missing required fields (Employee Number, First Name)",
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

    // Separate employee data from reporting data

    try {
      for (const emp of employees) {
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
          ...employeeData
        } = emp;

        // Store reporting separately
        reportingData.push({
          employeeId: emp.employeeId,
          reporting1st,
          reporting2nd,
          reporting3rd,
          reporting4th,
          reporting5th,
        });

        // Prepare employee for DB (without reporting fields)
        employeesForDB.push({
          ...employeeData,
          password: hashedPassword,
        });
      }
    } catch (hashError) {
      return next(new AppError("Failed to process employee data", 500));
    }

    // Insert all employees one by one to catch individual errors

    const createdEmployees = [];
    const skippedDuplicates = [];

    for (const empData of employeesForDB) {
      try {
        const created = await Employee.create(empData);
        createdEmployees.push(created);
      } catch (error) {
        // Track which employees failed and why
        const reason =
          error.code === 11000
            ? "Duplicate entry (already exists in database)"
            : error.message || "Validation error";

        skippedDuplicates.push({
          employeeId: empData.employeeId,
          employeeName: `${empData.firstName} ${empData.lastName}`.trim(),
          email: empData.email || "N/A",
          reason: reason,
        });
      }
    }

    // Helper function to find approver by name or ID
    const findApprover = async (reportingValue) => {
      if (!reportingValue) return null;

      // First, try to find by employee ID (if it looks like an ID)
      let approver = await Employee.findOne({ employeeId: reportingValue });
      if (approver) return approver;

      // If not found and looks like a name, try matching by full name
      // Expected format: "LastName, FirstName" or "FirstName LastName"
      const nameParts = reportingValue.split(",").map((s) => s.trim());

      if (nameParts.length === 2) {
        // Format: "LastName, FirstName"
        const [lastName, firstName] = nameParts;
        approver = await Employee.findOne({
          firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
          lastName: { $regex: new RegExp(`^${lastName}`, "i") },
        });
      } else {
        // Format: "FirstName LastName"
        const parts = reportingValue.split(" ");
        if (parts.length >= 2) {
          const firstName = parts[0];
          const lastName = parts[parts.length - 1];
          approver = await Employee.findOne({
            firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
            lastName: { $regex: new RegExp(`^${lastName}`, "i") },
          });
        }
        // DO NOT match by first name only - this causes false matches!
        // Removed the first-name-only fallback
      }

      return approver;
    };

    // Second pass: Store approver names first (we'll sync IDs later)
    const reportingUpdates = [];

    for (const reportingInfo of reportingData) {
      const createdEmp = createdEmployees.find(
        (ce) => ce.employeeId === reportingInfo.employeeId,
      );

      if (createdEmp) {
        const updateData = {};

        // Store approver names from Excel
        if (reportingInfo.reporting1st) {
          updateData.level1ApproverName = reportingInfo.reporting1st;
        }
        if (reportingInfo.reporting2nd) {
          updateData.level2ApproverName = reportingInfo.reporting2nd;
        }
        if (reportingInfo.reporting3rd) {
          updateData.level3ApproverName = reportingInfo.reporting3rd;
        }
        if (reportingInfo.reporting4th) {
          updateData.level4ApproverName = reportingInfo.reporting4th;
        }
        if (reportingInfo.reporting5th) {
          updateData.level5ApproverName = reportingInfo.reporting5th;
        }

        if (Object.keys(updateData).length > 0) {
          reportingUpdates.push(
            Employee.findByIdAndUpdate(createdEmp._id, updateData),
          );
        }
      }
    }

    // Execute all approver name updates
    if (reportingUpdates.length > 0) {
      await Promise.all(reportingUpdates);
    }

    // Third pass: Sync approver names to IDs
    const syncResult = await syncApproverIds();

    // Fourth pass: Set role to "approver" for employees who are approvers
    const allEmployeesAfterSync = await Employee.find({}).select(
      "_id employeeId role",
    );

    // Find all unique approver IDs
    const approverIds = new Set();
    const employeesWithApprovers = await Employee.find({
      $or: [
        { level1Approver: { $exists: true, $ne: null } },
        { level2Approver: { $exists: true, $ne: null } },
        { level3Approver: { $exists: true, $ne: null } },
        { level4Approver: { $exists: true, $ne: null } },
        { level5Approver: { $exists: true, $ne: null } },
      ],
    }).select(
      "level1Approver level2Approver level3Approver level4Approver level5Approver",
    );

    // Collect all unique approver IDs
    for (const emp of employeesWithApprovers) {
      if (emp.level1Approver) approverIds.add(emp.level1Approver.toString());
      if (emp.level2Approver) approverIds.add(emp.level2Approver.toString());
      if (emp.level3Approver) approverIds.add(emp.level3Approver.toString());
      if (emp.level4Approver) approverIds.add(emp.level4Approver.toString());
      if (emp.level5Approver) approverIds.add(emp.level5Approver.toString());
    }

    // Update role to "approver" for all employees who are approvers
    let approverRoleCount = 0;
    if (approverIds.size > 0) {
      const updateResult = await Employee.updateMany(
        { _id: { $in: Array.from(approverIds) } },
        { $set: { role: "approver", isApprover: true } },
      );
      approverRoleCount = updateResult.modifiedCount;
    }

    // If there were skipped duplicates, return 207 instead of 201
    const statusCode = skippedDuplicates.length > 0 ? 207 : 201;
    const message =
      skippedDuplicates.length > 0
        ? `Partially successful: ${createdEmployees.length} employees created, ${skippedDuplicates.length} skipped (already exist). Synced ${syncResult.updated} approver relationships. Set ${approverRoleCount} employees as approvers.`
        : `Successfully created ${createdEmployees.length} employees. Synced ${syncResult.updated} approver relationships. Set ${approverRoleCount} employees as approvers.`;

    res.status(statusCode).json({
      success: true,
      message,
      count: createdEmployees.length,
      reportingMapped: reportingUpdates.length,
      approversSynced: syncResult.updated,
      approverRolesSet: approverRoleCount,
      syncErrors: syncResult.errors.length > 0 ? syncResult.errors : undefined,
      skippedDuplicates:
        skippedDuplicates.length > 0 ? skippedDuplicates : undefined,
      data: createdEmployees.map((emp) => {
        const empData = emp.toObject();
        delete empData.password;
        return empData;
      }),
    });
  } catch (error) {
    // Handle bulk write errors (including duplicates)
    if (error.writeErrors || error.result) {
      const successCount = error.result?.nInserted || 0;
      const errorCount = error.writeErrors?.length || 0;

      const duplicates =
        error.writeErrors?.map((err) => {
          const employeeId =
            err.err?.op?.employeeId || err.op?.employeeId || "Unknown";
          const email = err.err?.op?.email || err.op?.email || "N/A";
          const firstName = err.err?.op?.firstName || err.op?.firstName || "";
          const lastName = err.err?.op?.lastName || err.op?.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown";

          return {
            employeeId,
            employeeName: fullName,
            email,
            reason:
              err.err?.code === 11000 || err.code === 11000
                ? "Duplicate entry (already exists in database)"
                : err.err?.errmsg ||
                  err.errmsg ||
                  JSON.stringify(err.err || "Unknown error"),
          };
        }) || [];

      // Get successfully inserted documents
      const insertedDocs = error.insertedDocs || [];
      const insertedData = insertedDocs.map((doc) => {
        const empData = doc.toObject ? doc.toObject() : doc;
        delete empData.password;
        return empData;
      });

      return res.status(207).json({
        success: true,
        message: `Partially successful: ${successCount} employees created, ${errorCount} failed`,
        count: successCount,
        successCount,
        duplicates,
        data: insertedData,
      });
    }

    // Handle other errors
    next(error);
  }
};

// @desc    Clear and re-sync all approver IDs (fixes incorrect assignments)
// @route   POST /api/employees/approvals/reset-and-sync
// @access  Private (Admin/HR only)
export const resetAndSyncApprovers = async (req, res, next) => {
  try {
    // Step 1: Clear all approver ID fields and supervisor (keep the names)
    const clearResult = await Employee.updateMany(
      {},
      {
        $set: {
          supervisor: null,
          level1Approver: null,
          level2Approver: null,
          level3Approver: null,
          level4Approver: null,
          level5Approver: null,
        },
      },
    );

    // Step 2: Re-sync using the approver names
    const syncResult = await syncApproverIds();

    res.status(200).json({
      success: true,
      message:
        "Successfully cleared and re-synced all supervisor and approver assignments",
      cleared: clearResult.modifiedCount,
      synced: syncResult.updated,
      total: syncResult.total,
      errors: syncResult.errors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set approver role for all employees who are approvers
// @route   POST /api/employees/set-approver-roles
// @access  Private (Admin only)
export const setApproverRoles = async (req, res, next) => {
  try {
    // Find all employees who are assigned as approvers
    const employeesWithApprovers = await Employee.find({
      $or: [
        { level1Approver: { $exists: true, $ne: null } },
        { level2Approver: { $exists: true, $ne: null } },
        { level3Approver: { $exists: true, $ne: null } },
        { level4Approver: { $exists: true, $ne: null } },
        { level5Approver: { $exists: true, $ne: null } },
      ],
    }).select(
      "level1Approver level2Approver level3Approver level4Approver level5Approver employeeId",
    );

    // Collect all unique approver IDs
    const approverIds = new Set();
    for (const emp of employeesWithApprovers) {
      if (emp.level1Approver) approverIds.add(emp.level1Approver.toString());
      if (emp.level2Approver) approverIds.add(emp.level2Approver.toString());
      if (emp.level3Approver) approverIds.add(emp.level3Approver.toString());
      if (emp.level4Approver) approverIds.add(emp.level4Approver.toString());
      if (emp.level5Approver) approverIds.add(emp.level5Approver.toString());
    }

    // Update role to "approver" for all employees who are approvers
    let approverRoleCount = 0;
    if (approverIds.size > 0) {
      const updateResult = await Employee.updateMany(
        { _id: { $in: Array.from(approverIds) } },
        { $set: { role: "approver", isApprover: true } },
      );
      approverRoleCount = updateResult.modifiedCount;
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
// @route   GET /api/employees/approvals/debug/:employeeId
// @access  Private (Admin/HR only)
export const debugApproverAssignments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Find the approver
    const approver = await Employee.findOne({ employeeId }).select(
      "_id employeeId firstName lastName",
    );

    if (!approver) {
      return res.status(404).json({
        success: false,
        message: "Approver not found",
      });
    }

    const approverId = approver._id;

    // Use the EXACT same queries as getMyApprovals
    const level1Count = await Employee.countDocuments({
      level1Approver: approverId,
      isActive: true,
      _id: { $ne: approverId },
    });

    const level2Count = await Employee.countDocuments({
      level2Approver: approverId,
      level1Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    });

    const level3Count = await Employee.countDocuments({
      level3Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    });

    const level4Count = await Employee.countDocuments({
      level4Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      level3Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    });

    const level5Count = await Employee.countDocuments({
      level5Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      level3Approver: { $ne: approverId },
      level4Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    });

    // Get sample employees from Level 1 with ALL approver fields
    const sampleLevel1 = await Employee.find({
      level1Approver: approverId,
      isActive: true,
      _id: { $ne: approverId },
    })
      .select(
        "employeeId firstName lastName level1ApproverName level2ApproverName level3ApproverName level4ApproverName level5ApproverName level1Approver level2Approver level3Approver level4Approver level5Approver",
      )
      .populate("level1Approver", "employeeId firstName lastName")
      .populate("level2Approver", "employeeId firstName lastName")
      .populate("level3Approver", "employeeId firstName lastName")
      .populate("level4Approver", "employeeId firstName lastName")
      .populate("level5Approver", "employeeId firstName lastName")
      .limit(10);

    // Get sample from Level 2
    const sampleLevel2 = await Employee.find({
      level2Approver: approverId,
      level1Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    })
      .select(
        "employeeId firstName lastName level1ApproverName level2ApproverName level3ApproverName level4ApproverName level5ApproverName level1Approver level2Approver level3Approver level4Approver level5Approver",
      )
      .populate("level1Approver", "employeeId firstName lastName")
      .populate("level2Approver", "employeeId firstName lastName")
      .populate("level3Approver", "employeeId firstName lastName")
      .populate("level4Approver", "employeeId firstName lastName")
      .populate("level5Approver", "employeeId firstName lastName")
      .limit(10);

    res.status(200).json({
      success: true,
      approver: {
        employeeId: approver.employeeId,
        name: `${approver.firstName} ${approver.lastName}`,
        _id: approver._id,
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

// @desc    Get employees for approver (by approval level)
// @route   GET /api/employees/approvals/my-approvals
// @access  Private (Approver only) OR Public with approverId
export const getMyApprovals = async (req, res, next) => {
  try {
    const approverId =
      req.user?.userId || req.user?._id || req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }
    // Helper to get common populates
    const commonPopulates = [
      {
        path: "approvalStatus.enteredBy",
        select: "firstName lastName employeeId",
      },
      { path: "level1Approver", select: "firstName lastName employeeId" },
      { path: "level2Approver", select: "firstName lastName employeeId" },
      { path: "level3Approver", select: "firstName lastName employeeId" },
      { path: "level4Approver", select: "firstName lastName employeeId" },
      { path: "level5Approver", select: "firstName lastName employeeId" },
      {
        path: "approvalStatus.level1.approvedBy",
        select: "firstName lastName employeeId",
      },
      {
        path: "approvalStatus.level2.approvedBy",
        select: "firstName lastName employeeId",
      },
      {
        path: "approvalStatus.level3.approvedBy",
        select: "firstName lastName employeeId",
      },
      {
        path: "approvalStatus.level4.approvedBy",
        select: "firstName lastName employeeId",
      },
      {
        path: "approvalStatus.level5.approvedBy",
        select: "firstName lastName employeeId",
      },
    ];

    // Level 1: Employees where this user is Level 1 approver
    const level1Employees = await Employee.find({
      level1Approver: approverId,
      isActive: true,
      _id: { $ne: approverId },
    })
      .select("-password")
      .populate(commonPopulates)
      .sort({ employeeId: 1 });

    // Level 2: Employees where this user is Level 2 approver
    const level2Employees = await Employee.find({
      level2Approver: approverId,
      level1Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    })
      .select("-password")
      .populate(commonPopulates)
      .sort({ employeeId: 1 });

    // Level 3: Employees where this user is Level 3 approver
    const level3Employees = await Employee.find({
      level3Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    })
      .select("-password")
      .populate(commonPopulates)
      .sort({ employeeId: 1 });

    // Level 4: Employees where this user is Level 4 approver
    const level4Employees = await Employee.find({
      level4Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      level3Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    })
      .select("-password")
      .populate(commonPopulates)
      .sort({ employeeId: 1 });

    // Level 5: Employees where this user is Level 5 approver
    const level5Employees = await Employee.find({
      level5Approver: approverId,
      level1Approver: { $ne: approverId },
      level2Approver: { $ne: approverId },
      level3Approver: { $ne: approverId },
      level4Approver: { $ne: approverId },
      isActive: true,
      _id: { $ne: approverId },
    })
      .select("-password")
      .populate(commonPopulates)
      .sort({ employeeId: 1 });

    res.status(200).json({
      success: true,
      data: {
        level1: level1Employees,
        level2: level2Employees,
        level3: level3Employees,
        level4: level4Employees,
        level5: level5Employees,
      },
      counts: {
        level1: level1Employees.length,
        level2: level2Employees.length,
        level3: level3Employees.length,
        level4: level4Employees.length,
        level5: level5Employees.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees under a supervisor
// @route   GET /api/employees/supervisor/my-team
// @access  Private (Supervisor only) OR Public with supervisorId
export const getMySupervisedEmployees = async (req, res, next) => {
  try {
    const supervisorId =
      req.user?.userId || req.user?._id || req.query.supervisorId;

    if (
      !supervisorId ||
      supervisorId === "undefined" ||
      supervisorId === "null"
    ) {
      return next(new AppError("Supervisor ID is required", 400));
    }

    const employees = await Employee.find({
      supervisor: supervisorId,
      isActive: true,
      _id: { $ne: supervisorId },
    })
      .select("-password")
      .populate("level1Approver", "firstName lastName employeeId")
      .populate("level2Approver", "firstName lastName employeeId")
      .populate("level3Approver", "firstName lastName employeeId")
      .populate("level4Approver", "firstName lastName employeeId")
      .populate("level5Approver", "firstName lastName employeeId")
      .populate("approvalStatus.enteredBy", "firstName lastName employeeId")
      .populate(
        "approvalStatus.level1.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level2.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level3.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level4.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level5.approvedBy",
        "firstName lastName employeeId",
      )
      .sort({ employeeId: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update bonus for an employee (supervisor action)
// @route   PUT /api/employees/:id/bonus
// @access  Private (Supervisor only)
export const updateEmployeeBonus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bonus2025 } = req.body;
    const supervisorId =
      req.user?.userId ||
      req.user?._id ||
      req.body.supervisorId ||
      req.query.supervisorId;

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

    // Find the employee
    const employee = await Employee.findById(id);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    // Verify that the logged-in user is the supervisor
    if (
      !employee.supervisor ||
      employee.supervisor.toString() !== supervisorId.toString()
    ) {
      return next(
        new AppError(
          "You are not authorized to set bonus for this employee",
          403,
        ),
      );
    }

    // Check if already submitted for approval - if so, don't allow editing
    if (employee.approvalStatus?.submittedForApproval) {
      return next(
        new AppError(
          "Bonus has already been submitted for approval and cannot be edited",
          403,
        ),
      );
    }

    // Build update query - only update bonus amount and metadata, NOT approval status
    const updateQuery = {
      $set: {
        bonus2025: parseFloat(bonus2025),
        "approvalStatus.enteredBy": supervisorId,
        "approvalStatus.enteredAt": new Date(),
      },
    };

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("level1Approver", "firstName lastName employeeId")
      .populate("level2Approver", "firstName lastName employeeId")
      .populate("level3Approver", "firstName lastName employeeId")
      .populate("level4Approver", "firstName lastName employeeId")
      .populate("level5Approver", "firstName lastName employeeId")
      .populate("approvalStatus.enteredBy", "firstName lastName employeeId")
      .populate(
        "approvalStatus.level1.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level2.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level3.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level4.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level5.approvedBy",
        "firstName lastName employeeId",
      );

    res.status(200).json({
      success: true,
      message: "Bonus updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit all bonuses for approval (supervisor action)
// @route   POST /api/employees/supervisor/submit-for-approval
// @access  Private (Supervisor only)
export const submitBonusesForApproval = async (req, res, next) => {
  try {
    const supervisorId =
      req.user?.userId ||
      req.user?._id ||
      req.body.supervisorId ||
      req.query.supervisorId;

    if (
      !supervisorId ||
      supervisorId === "undefined" ||
      supervisorId === "null"
    ) {
      return next(new AppError("Supervisor ID is required", 400));
    }

    // Find all employees under this supervisor
    const employees = await Employee.find({
      supervisor: supervisorId,
      isActive: true,
      _id: { $ne: supervisorId },
    });

    if (!employees || employees.length === 0) {
      return next(
        new AppError("No employees found under your supervision", 404),
      );
    }

    // Filter employees with bonuses entered but not yet submitted
    const employeesWithBonuses = employees.filter(
      (emp) =>
        emp.approvalStatus?.enteredBy &&
        !emp.approvalStatus?.submittedForApproval &&
        emp.bonus2025 &&
        emp.bonus2025 > 0,
    );

    if (employeesWithBonuses.length === 0) {
      return next(
        new AppError("No bonuses to submit. Please enter bonuses first.", 400),
      );
    }

    // Update all employees to submitted status and set approval levels to pending
    const bulkUpdates = employeesWithBonuses.map((employee) => {
      const updateQuery = {
        $set: {
          "approvalStatus.submittedForApproval": true,
          "approvalStatus.submittedAt": new Date(),
        },
      };

      // Set status to pending for all levels that have approvers
      if (employee.level1Approver) {
        updateQuery.$set["approvalStatus.level1.status"] = "pending";
      }
      if (employee.level2Approver) {
        updateQuery.$set["approvalStatus.level2.status"] = "pending";
      }
      if (employee.level3Approver) {
        updateQuery.$set["approvalStatus.level3.status"] = "pending";
      }
      if (employee.level4Approver) {
        updateQuery.$set["approvalStatus.level4.status"] = "pending";
      }
      if (employee.level5Approver) {
        updateQuery.$set["approvalStatus.level5.status"] = "pending";
      }

      return {
        updateOne: {
          filter: { _id: employee._id },
          update: updateQuery,
        },
      };
    });

    // Execute bulk update
    const result = await Employee.bulkWrite(bulkUpdates);

    res.status(200).json({
      success: true,
      message:
        "Great work.! You have assigned bonuses for all the employees designated to you. They are sent to the next level for review. We'll Email you if something changes. Feel free to logout.",
      count: employeesWithBonuses.length,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees pending bonus approval for approver
// @route   GET /api/employees/bonus-approvals/my-approvals
// @access  Private (Approver only) OR Public with approverId
export const getMyBonusApprovals = async (req, res, next) => {
  try {
    const approverId =
      req.user?.userId || req.user?._id || req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Helper function to determine the next required approval level
    const getNextApprovalLevel = (employee) => {
      // Check levels in order
      for (let level = 1; level <= 5; level++) {
        const levelKey = `level${level}`;
        const approverField = `${levelKey}Approver`;

        // If this level has an approver
        if (employee[approverField]) {
          const status = employee.approvalStatus?.[levelKey]?.status;

          // If pending, this is the next level
          if (status === "pending") {
            return { level, approverId: employee[approverField] };
          }

          // If status exists and is not approved, approval is blocked at this level
          // undefined/null status means no approver exists for this level, so it's skipped
          if (status && status !== "approved") {
            return null;
          }
        }
      }
      return null; // All levels approved or no more levels
    };

    // Show ALL active employees assigned to this approver, regardless of bonus status
    const allEmployees = await Employee.find({
      isActive: true,
      $or: [
        { level1Approver: approverId },
        { level2Approver: approverId },
        { level3Approver: approverId },
        { level4Approver: approverId },
        { level5Approver: approverId },
      ],
    })
      .select("-password")
      .populate("supervisor", "firstName lastName employeeId")
      .populate("level1Approver", "firstName lastName employeeId")
      .populate("level2Approver", "firstName lastName employeeId")
      .populate("level3Approver", "firstName lastName employeeId")
      .populate("level4Approver", "firstName lastName employeeId")
      .populate("level5Approver", "firstName lastName employeeId")
      .populate("approvalStatus.enteredBy", "firstName lastName employeeId")
      .populate(
        "approvalStatus.level1.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level2.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level3.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level4.approvedBy",
        "firstName lastName employeeId",
      )
      .populate(
        "approvalStatus.level5.approvedBy",
        "firstName lastName employeeId",
      )
      .sort({ employeeId: 1 });

    // Filter to employees where this approver is the NEXT approver
    const myApprovals = allEmployees.filter((emp) => {
      const nextLevel = getNextApprovalLevel(emp);
      return (
        nextLevel && nextLevel.approverId.toString() === approverId.toString()
      );
    });

    res.status(200).json({
      success: true,
      count: myApprovals.length,
      data: myApprovals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process bonus approval/rejection
// @route   POST /api/employees/:employeeId/bonus-approval
// @access  Private (Approver only) OR Public with approverId
export const processBonusApproval = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { action, comments, approverId: bodyApproverId } = req.body;
    const approverId =
      req.user?.userId ||
      req.user?._id ||
      bodyApproverId ||
      req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Validate input
    if (!action) {
      return next(new AppError("Action is required", 400));
    }

    if (!["approve", "reject"].includes(action)) {
      return next(new AppError("Action must be either approve or reject", 400));
    }

    // Find the employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    // Check if bonus has been entered
    // Using a more resilient check that considers both metadata and the actual amount
    const isBonusEntered = !!(
      employee.approvalStatus?.enteredBy ||
      (employee.bonus2025 && employee.bonus2025 > 0)
    );

    if (!isBonusEntered) {
      return next(
        new AppError("No bonus has been entered for this employee", 400),
      );
    }

    // Determine which level this approver should approve
    let approverLevel = null;

    for (let level = 1; level <= 5; level++) {
      const levelKey = `level${level}`;
      const approverField = `${levelKey}Approver`;

      if (employee[approverField]?.toString() === approverId.toString()) {
        const status = employee.approvalStatus?.[levelKey]?.status;

        if (status === "pending") {
          // Check if previous levels are approved or not_required
          let canApprove = true;

          for (let prevLevel = 1; prevLevel < level; prevLevel++) {
            const prevLevelKey = `level${prevLevel}`;
            const prevStatus = employee.approvalStatus?.[prevLevelKey]?.status;

            // Previous level must be approved, or have no status (no approver assigned)
            // If status exists and is not approved, block the approval
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

    // Update bonus approval status
    const levelKey = `level${approverLevel}`;
    const approvalUpdate = {
      [`approvalStatus.${levelKey}.status`]:
        action === "approve" ? "approved" : "rejected",
      [`approvalStatus.${levelKey}.approvedBy`]: approverId,
      [`approvalStatus.${levelKey}.approvedAt`]: new Date(),
    };

    if (comments) {
      approvalUpdate[`approvalStatus.${levelKey}.comments`] = comments;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: approvalUpdate },
      { new: true, runValidators: true },
    )
      .select("-password")
      .populate("supervisor", "firstName lastName employeeId")
      .populate("level1Approver", "firstName lastName employeeId")
      .populate("level2Approver", "firstName lastName employeeId")
      .populate("level3Approver", "firstName lastName employeeId")
      .populate("level4Approver", "firstName lastName employeeId")
      .populate("level5Approver", "firstName lastName employeeId")
      .populate("approvalStatus.enteredBy", "firstName lastName employeeId")
      .populate(
        `approvalStatus.${levelKey}.approvedBy`,
        "firstName lastName employeeId",
      );

    res.status(200).json({
      success: true,
      message: `Bonus ${
        action === "approve" ? "approved" : "rejected"
      } successfully at level ${approverLevel}`,
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process approval/rejection for an employee
// @route   POST /api/employees/approvals/:employeeId
// @access  Private (Approver only) OR Public with approverId
export const processApproval = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { level, action, comments, approverId: bodyApproverId } = req.body;
    const approverId =
      req.user?.userId ||
      req.user?._id ||
      bodyApproverId ||
      req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Validate input
    if (!level || !action) {
      return next(new AppError("Level and action are required", 400));
    }

    if (![1, 2, 3, 4, 5].includes(level)) {
      return next(new AppError("Level must be between 1 and 5", 400));
    }

    if (!["approve", "reject"].includes(action)) {
      return next(new AppError("Action must be either approve or reject", 400));
    }

    // Find the employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return next(new AppError("Employee not found", 404));
    }

    // REQUIREMENT: Approvals require bonus to be entered
    const isBonusEntered = !!(
      employee.approvalStatus?.enteredBy ||
      (employee.bonus2025 && employee.bonus2025 > 0)
    );

    if (!isBonusEntered) {
      return next(
        new AppError(
          "No bonus has been entered for this employee. Cannot approve.",
          400,
        ),
      );
    }

    // Verify that the logged-in user is the approver for this level
    const levelKey = `level${level}`;
    const approverField = `${levelKey}Approver`;

    if (
      !employee[approverField] ||
      employee[approverField].toString() !== approverId.toString()
    ) {
      return next(
        new AppError(
          `You are not authorized to approve/reject at level ${level} for this employee`,
          403,
        ),
      );
    }

    // Check if previous levels are approved or not_required (for level 2+)
    if (level > 1) {
      for (let i = 1; i < level; i++) {
        const prevLevelKey = `level${i}`;
        const prevApproverField = `${prevLevelKey}Approver`;
        const prevStatus = employee.approvalStatus?.[prevLevelKey]?.status;

        // If previous level has an approver assigned, it must be approved
        if (employee[prevApproverField]) {
          if (prevStatus !== "approved") {
            return next(
              new AppError(
                `Level ${i} must be approved before level ${level} can be processed`,
                400,
              ),
            );
          }
        }
        // If no approver at previous level, it's automatically considered complete (not_required)
      }
    }

    // Check if already processed
    const currentStatus = employee.approvalStatus?.[levelKey]?.status;
    if (currentStatus === "approved" || currentStatus === "rejected") {
      return next(
        new AppError(
          `This employee has already been ${currentStatus} at level ${level}`,
          400,
        ),
      );
    }

    // Update approval status
    const approvalUpdate = {
      [`approvalStatus.${levelKey}.status`]:
        action === "approve" ? "approved" : "rejected",
      [`approvalStatus.${levelKey}.approvedBy`]: approverId,
      [`approvalStatus.${levelKey}.approvedAt`]: new Date(),
    };

    if (comments) {
      approvalUpdate[`approvalStatus.${levelKey}.comments`] = comments;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: approvalUpdate },
      { new: true, runValidators: true },
    )
      .select("-password")
      .populate(`${levelKey}Approver`, "firstName lastName employeeId");

    res.status(200).json({
      success: true,
      message: `Employee ${
        action === "approve" ? "approved" : "rejected"
      } successfully at level ${level}`,
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk approve all pending approvals for an approver
// @route   POST /api/employees/approvals/bulk-approve
// @access  Private (Approver only) OR Public with approverId
export const bulkApproveAll = async (req, res, next) => {
  try {
    const { comments, approverId: bodyApproverId } = req.body;
    const approverId =
      req.user?.userId ||
      req.user?._id ||
      bodyApproverId ||
      req.query.approverId;

    if (!approverId || approverId === "undefined" || approverId === "null") {
      return next(new AppError("Approver ID is required", 400));
    }

    // Helper to get common populates
    const commonPopulates = [
      {
        path: "approvalStatus.enteredBy",
        select: "firstName lastName employeeId",
      },
      { path: "level1Approver", select: "firstName lastName employeeId" },
      { path: "level2Approver", select: "firstName lastName employeeId" },
      { path: "level3Approver", select: "firstName lastName employeeId" },
      { path: "level4Approver", select: "firstName lastName employeeId" },
      { path: "level5Approver", select: "firstName lastName employeeId" },
    ];

    // Get all employees where the approver has pending approvals
    // IMPORTANT: Must filter by submittedForApproval to match getMyApprovals logic
    const allEmployees = await Employee.find({
      isActive: true,
      _id: { $ne: approverId },
      "approvalStatus.submittedForApproval": true,
      $or: [
        { level1Approver: approverId },
        { level2Approver: approverId },
        { level3Approver: approverId },
        { level4Approver: approverId },
        { level5Approver: approverId },
      ],
    })
      .select("-password")
      .populate(commonPopulates);

    // Filter to get only the ones where:
    // 1. Bonus is entered
    // 2. This approver can approve (at their level)
    // 3. Previous levels are approved
    // 4. Current level is pending
    const approvableEmployees = [];
    const skippedEmployees = [];

    for (const employee of allEmployees) {
      // Check if bonus is entered
      const isBonusEntered = !!(
        employee.approvalStatus?.enteredBy ||
        (employee.bonus2025 && employee.bonus2025 > 0)
      );

      if (!isBonusEntered) {
        skippedEmployees.push({
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          reason: "Bonus not entered",
        });
        continue;
      }

      // Find which level this approver should approve
      let approverLevel = null;
      let skipReason = null;

      for (let level = 1; level <= 5; level++) {
        const levelKey = `level${level}`;
        const approverField = `${levelKey}Approver`;

        // Get the approver ID - handle both populated (object) and non-populated (ObjectId) fields
        const approverIdToCompare = employee[approverField]?._id
          ? employee[approverField]._id.toString()
          : employee[approverField]?.toString();

        if (
          employee[approverField] &&
          approverIdToCompare === approverId.toString()
        ) {
          const status = employee.approvalStatus?.[levelKey]?.status;

          // Check if this level is pending
          if (status === "pending") {
            // Check if previous levels are approved
            let canApprove = true;
            for (let prevLevel = 1; prevLevel < level; prevLevel++) {
              const prevLevelKey = `level${prevLevel}`;
              const prevApproverField = `${prevLevelKey}Approver`;
              const prevStatus =
                employee.approvalStatus?.[prevLevelKey]?.status;

              if (employee[prevApproverField]) {
                if (prevStatus !== "approved") {
                  canApprove = false;
                  skipReason = `Previous level ${prevLevel} not approved (status: ${prevStatus})`;
                  break;
                }
              }
            }

            if (canApprove) {
              approverLevel = level;
              break;
            } else {
              skippedEmployees.push({
                employeeId: employee.employeeId,
                name: `${employee.firstName} ${employee.lastName}`,
                reason: skipReason || "Previous level not approved",
              });
              break;
            }
          } else if (status === "approved" || status === "rejected") {
            skippedEmployees.push({
              employeeId: employee.employeeId,
              name: `${employee.firstName} ${employee.lastName}`,
              reason: `Already ${status}`,
            });
            break;
          }
        }
      }

      if (approverLevel) {
        approvableEmployees.push({ employee, level: approverLevel });
      }
    }

    if (approvableEmployees.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employees available for bulk approval",
        approvedCount: 0,
        skippedCount: skippedEmployees.length,
        skippedEmployees: skippedEmployees,
      });
    }

    // Perform bulk approval
    const bulkUpdates = [];
    const currentDate = new Date();

    for (const { employee, level } of approvableEmployees) {
      const levelKey = `level${level}`;
      const approvalUpdate = {
        [`approvalStatus.${levelKey}.status`]: "approved",
        [`approvalStatus.${levelKey}.approvedBy`]: approverId,
        [`approvalStatus.${levelKey}.approvedAt`]: currentDate,
      };

      if (comments) {
        approvalUpdate[`approvalStatus.${levelKey}.comments`] = comments;
      }

      bulkUpdates.push({
        updateOne: {
          filter: { _id: employee._id },
          update: { $set: approvalUpdate },
        },
      });
    }

    // Execute bulk update
    const result = await Employee.bulkWrite(bulkUpdates);

    res.status(200).json({
      success: true,
      message: `Successfully approved ${approvableEmployees.length} employee(s)`,
      approvedCount: approvableEmployees.length,
      skippedCount: skippedEmployees.length,
      skippedEmployees:
        skippedEmployees.length > 0 ? skippedEmployees : undefined,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if all approvals are completed for all employees with bonuses
// @route   GET /api/employees/ukg/approvals-status
// @access  Private (HR/Admin only)
export const checkAllApprovalsCompleted = async (req, res, next) => {
  try {
    // Find all employees who have bonuses entered
    const employeesWithBonuses = await Employee.find({
      isActive: true,
      $or: [
        { bonus2024: { $ne: null, $exists: true } },
        { bonus2025: { $ne: null, $exists: true } }
      ]
    }).select("employeeId firstName lastName bonus2024 bonus2025 level1Approver level2Approver level3Approver level4Approver level5Approver approvalStatus");

    if (employeesWithBonuses.length === 0) {
      return res.status(200).json({
        success: true,
        allApprovalsCompleted: false,
        message: "No employees with bonuses found",
        totalEmployeesWithBonuses: 0,
        pendingApprovals: 0
      });
    }

    // Check each employee's approval status
    const pendingEmployees = [];

    for (const employee of employeesWithBonuses) {
      let allLevelsApproved = true;

      // Check each approval level (1-5)
      for (let level = 1; level <= 5; level++) {
        const levelKey = `level${level}`;
        const approverField = `${levelKey}Approver`;

        // If this level has an approver assigned
        if (employee[approverField]) {
          const status = employee.approvalStatus?.[levelKey]?.status;

          // If not approved, mark as pending
          if (status !== "approved") {
            allLevelsApproved = false;
            pendingEmployees.push({
              employeeId: employee.employeeId,
              name: `${employee.firstName} ${employee.lastName}`,
              pendingLevel: level,
              currentStatus: status || "not started"
            });
            break; // No need to check further levels
          }
        }
      }
    }

    const allCompleted = pendingEmployees.length === 0;

    res.status(200).json({
      success: true,
      allApprovalsCompleted: allCompleted,
      totalEmployeesWithBonuses: employeesWithBonuses.length,
      pendingApprovals: pendingEmployees.length,
      pendingEmployees: allCompleted ? [] : pendingEmployees,
      message: allCompleted
        ? "All approvals completed! Ready for UKG export."
        : `${pendingEmployees.length} employee(s) still have pending approvals`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export employees to UKG Excel format
// @route   GET /api/employees/ukg/export
// @access  Private (HR/Admin only)
export const exportToUKG = async (req, res, next) => {
  try {
    const XLSX = await import("xlsx");
    const path = await import("path");
    const fs = await import("fs");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Path to UKG template
    const templatePath = path.join(__dirname, "../../UKG excel template.xlsx");

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return next(new AppError("UKG template file not found", 404));
    }

    // Read the template
    const templateWorkbook = XLSX.readFile(templatePath);
    const templateSheetName = templateWorkbook.SheetNames[0];

    // Get all active employees with their data (decrypted automatically by getters)
    const employees = await Employee.find({ isActive: true })
      .select("-password")
      .sort({ employeeId: 1 })
      .lean({ getters: true }); // Use lean with getters to get decrypted data

    if (employees.length === 0) {
      return next(new AppError("No employees found to export", 404));
    }

    // Transform employee data to match UKG template format
    const ukgData = employees.map((emp) => {
      return {
        "Employee Number": emp.employeeId || "",
        "Employee Name": emp.fullName || `${emp.firstName} ${emp.lastName}`,
        "SSN": emp.ssn || "",
        "Company": emp.company || "",
        "Company Code": emp.companyCode || "",
        "Supervisor Name": emp.supervisorName || "",
        "Location": emp.location || "",
        "1st Reporting": emp.level1ApproverName || "",
        "2nd Reporting": emp.level2ApproverName || "",
        "3rd Reporting": emp.level3ApproverName || "",
        "4th Reporting": emp.level4ApproverName || "",
        "5th Reporting": emp.level5ApproverName || "",
        "State/Province": emp.address?.state || "",
        "Work Email": emp.email || "",
        "Last Hire Date": emp.lastHireDate ? new Date(emp.lastHireDate) : "",
        "Employee Type": emp.employeeType || "",
        "Job Title": emp.jobTitle || "",
        "Salary or Hourly": emp.salaryType || "",
        "Annual Salary": emp.annualSalary || 0,
        "Hourly Pay Rate": emp.hourlyPayRate || 0,
        "2024 Bonus": emp.bonus2024 || 0,
        "2025 Bonus": emp.bonus2025 || 0,
        "Role": emp.role || "employee"
      };
    });

    // Create new worksheet from data
    const newWorksheet = XLSX.utils.json_to_sheet(ukgData);

    // Replace the template sheet with new data
    templateWorkbook.Sheets[templateSheetName] = newWorksheet;

    // Write to buffer
    const buffer = XLSX.write(templateWorkbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    // Set headers for file download
    const filename = `UKG_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    // Send the file
    res.send(buffer);
  } catch (error) {
    console.error("UKG Export Error:", error);
    next(error);
  }
};
