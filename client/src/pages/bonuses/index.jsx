import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import api from "../../utils/api";

const Bonuses = () => {
  const user = useSelector(selectUser);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bonusDialog, setBonusDialog] = useState({
    open: false,
    employee: null,
  });
  const [bonusAmount, setBonusAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [proceedingForApproval, setProceedingForApproval] = useState(false);

  const fetchMyTeam = async () => {
    setLoading(true);
    setError("");

    try {
      const userId = user?.id || user?._id;
      const response = await api.get(
        `/v2/employees/supervisor/my-team?supervisorId=${userId}`,
      );

      setEmployees(response.data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while fetching employees";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchMyTeam();
    }
  }, [user]);

  const handleOpenBonusDialog = (employee) => {
    setBonusDialog({
      open: true,
      employee,
    });
    setBonusAmount(employee.bonus2025 || "");
  };

  const handleCloseBonusDialog = () => {
    setBonusDialog({
      open: false,
      employee: null,
    });
    setBonusAmount("");
  };

  const handleSubmitBonus = async () => {
    if (!bonusAmount || parseFloat(bonusAmount) < 0) {
      setError("Please enter a valid bonus amount");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const userId = user?.id || user?._id;

      await api.put(
        `/v2/employees/${bonusDialog.employee.id}/bonus?supervisorId=${userId}`,
        {
          bonus2025: parseFloat(bonusAmount),
        },
      );

      // Refresh the employee list
      await fetchMyTeam();
      handleCloseBonusDialog();
      setSuccess("Bonus saved successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while updating bonus";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedForApproval = async () => {
    setProceedingForApproval(true);
    setError("");
    setSuccess("");

    try {
      const userId = user?.id || user?._id;

      const response = await api.post(
        `/v2/employees/supervisor/submit-for-approval?supervisorId=${userId}`,
      );

      setSuccess(response.data.message);
      await fetchMyTeam();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while submitting bonuses for approval";
      setError(errorMessage);
    } finally {
      setProceedingForApproval(false);
    }
  };

  const getApprovalStatus = (employee) => {
    if (!employee)
      return { status: "not_entered", label: "Not Entered", color: "default" };

    // A bonus is considered entered if ANY of these are true:
    // 1. enteredBy metadata is present
    // 2. A bonus amount for 2025 is actually set (non-zero)
    // 3. Any approval level is no longer 'not_required'
    const hasMetadata = !!employee.approvalStatus?.enteredBy;
    const hasBonusValue =
      employee.bonus2025 && parseFloat(employee.bonus2025) > 0;

    // Check if any level is active (pending, approved, or rejected)
    const levels = ["level1", "level2", "level3", "level4", "level5"];
    const hasActiveProcess = levels.some((lvl) => {
      const status = employee.approvalStatus?.[lvl]?.status;
      return status && !["pending", "unknown"].includes(status);
    });

    if (!hasMetadata && !hasBonusValue && !hasActiveProcess) {
      return { status: "not_entered", label: "Not Entered", color: "default" };
    }

    // Check all approval levels and track progress
    let approvedCount = 0;
    let totalRequired = 0;
    let currentStage = null;
    let anyRejected = false;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const approverField = `${level}Approver`;
      const status = employee.approvalStatus?.[level]?.status;

      // Check if this level has an approver
      if (employee[approverField]) {
        totalRequired++;

        if (status === "rejected") {
          anyRejected = true;
          break;
        }

        if (status === "approved") {
          approvedCount++;
        } else if (status === "pending") {
          if (!currentStage) {
            currentStage = i + 1;
          }
        }
      }
    }

    if (anyRejected) {
      return { status: "rejected", label: "Rejected", color: "error" };
    }

    if (approvedCount === totalRequired && totalRequired > 0) {
      return { status: "approved", label: "Fully Approved", color: "success" };
    }

    if (currentStage) {
      return {
        status: "pending",
        label: `Level ${currentStage} - ${approvedCount}/${totalRequired} Approved`,
        color: "warning",
      };
    }

    return { status: "unknown", label: "Unknown", color: "default" };
  };

  const getNextApprover = (employee) => {
    if (!employee || !employee.approvalStatus?.enteredBy) {
      return "N/A";
    }

    const levels = [
      { key: "level1", approver: employee.level1Approver },
      { key: "level2", approver: employee.level2Approver },
      { key: "level3", approver: employee.level3Approver },
      { key: "level4", approver: employee.level4Approver },
      { key: "level5", approver: employee.level5Approver },
    ];

    for (const level of levels) {
      const status = employee.approvalStatus?.[level.key]?.status;

      // Check if this level has an approver assigned
      if (level.approver) {
        // If status is pending at this level, this is the next approver
        if (status === "pending") {
          return `${level.approver.fullName} (${level.approver.employeeId})`;
        }

        // If rejected, show that
        if (status === "rejected") {
          return "Rejected";
        }

        // If not approved yet and not pending, there's an issue
        if (status !== "approved") {
          return "Pending";
        }
      }
    }

    return "All Approved";
  };

  const columns = [
    {
      field: "slNo",
      headerName: "Sl No",
      width: 80,
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => {
        const index = employees.findIndex((emp) => emp.id === params.row.id);
        return index + 1;
      },
    },
    {
      field: "fullName",
      headerName: "Name",
      width: 200,
      minWidth: 150,
      flex: 1.2,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      width: 180,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.row.jobTitle || "N/A",
    },
    {
      field: "salaryType",
      headerName: "Salary Type",
      width: 130,
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => params.row.salaryType || "N/A",
    },
    {
      field: "annualSalary",
      headerName: "Annual Salary",
      width: 150,
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => {
        const salary = params.row.annualSalary || 0;
        return salary > 0 ? `$${salary.toLocaleString()}` : "N/A";
      },
    },
    {
      field: "hourlyPayRate",
      headerName: "Hourly Rate",
      width: 130,
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const rate = params.row.hourlyPayRate || 0;
        return rate > 0 ? `$${rate.toFixed(2)}` : "N/A";
      },
    },
    {
      field: "bonus2024",
      headerName: "Bonus 2024",
      width: 130,
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const bonus = params.row.bonus2024 || 0;
        return `$${bonus.toLocaleString()}`;
      },
    },
    {
      field: "bonus2025",
      headerName: "Bonus 2025",
      width: 130,
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const bonus = params.row.bonus2025 || 0;
        return `$${bonus.toLocaleString()}`;
      },
    },
    // {
    //   field: "approvalStatus",
    //   headerName: "Approval Status",
    //   width: 150,
    //   flex: 0.8,
    //   renderCell: (params) => {
    //     const approvalInfo = getApprovalStatus(params.row);
    //     return (
    //       <Chip
    //         label={approvalInfo.label}
    //         color={approvalInfo.color}
    //         size="small"
    //         icon={
    //           approvalInfo.status === "approved" ? (
    //             <CheckCircleIcon />
    //           ) : approvalInfo.status === "pending" ? (
    //             <PendingIcon />
    //           ) : approvalInfo.status === "rejected" ? (
    //             <CancelIcon />
    //           ) : null
    //         }
    //       />
    //     );
    //   },
    // },
    // {
    //   field: "nextApprover",
    //   headerName: "Next Approver",
    //   width: 200,
    //   flex: 1.2,
    //   renderCell: (params) => getNextApprover(params.row),
    // },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      minWidth: 120,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => {
        const isSubmitted = params.row.approvalStatus?.submittedForApproval;

        // If already submitted for approval, disable editing
        if (isSubmitted) {
          return (
            <Tooltip title="Bonus has been submitted for approval and is locked">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{ fontSize: "0.75rem", py: 0.5, minWidth: "auto" }}
                >
                  Locked
                </Button>
              </span>
            </Tooltip>
          );
        }

        // If bonus is not entered yet, show "Add Bonus" button
        const hasBonusValue =
          params.row.bonus2025 && parseFloat(params.row.bonus2025) > 0;
        if (!hasBonusValue) {
          return (
            <Button
              variant="contained"
              size="small"
              onClick={() => handleOpenBonusDialog(params.row)}
              sx={{ fontSize: "0.75rem", py: 0.5, minWidth: "auto" }}
            >
              Add Bonus
            </Button>
          );
        }

        // If bonus is entered but not submitted, show "Edit Bonus" button
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenBonusDialog(params.row)}
            sx={{ fontSize: "0.75rem", py: 0.5, minWidth: "auto" }}
          >
            Edit Bonus
          </Button>
        );
      },
    },
  ];

  // Check if any employee has bonuses submitted for approval
  const hasSubmittedBonuses = employees.some(
    (emp) => emp.approvalStatus?.submittedForApproval,
  );

  // Get employees who have NOT yet submitted for approval
  const unsubmittedEmployees = employees.filter(
    (emp) => !emp.approvalStatus?.submittedForApproval,
  );

  // Check if ALL unsubmitted employees have bonuses entered
  // (We need at least one unsubmitted employee, and they all must have bonuses)
  const allUnsubmittedHaveBonuses =
    unsubmittedEmployees.length > 0 &&
    unsubmittedEmployees.every(
      (emp) => emp.bonus2025 && parseFloat(emp.bonus2025) > 0,
    );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography component="h2" variant="h6">
          Assign Employee Bonuses
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: "column",
          }}
        >
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: "medium" }}
            >
              TOTAL BONUS (2025)
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              $
              {employees
                .reduce((sum, emp) => sum + (parseFloat(emp.bonus2025) || 0), 0)
                .toLocaleString()}
            </Typography>
          </Box>

          {unsubmittedEmployees.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleProceedForApproval}
              disabled={proceedingForApproval || !allUnsubmittedHaveBonuses}
              sx={{
                color: "#FFFFFF",
                fontWeight: "bold",
                px: 3,
                py: 1,
                "&.Mui-disabled": {
                  color: "#FFFFFF",
                  opacity: 0.7,
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {proceedingForApproval ? "Submitting..." : "Proceed for Approval"}
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {unsubmittedEmployees.length === 0
          ? "All bonuses have been submitted for approval and are now locked. You cannot edit them until the approval process is complete."
          : allUnsubmittedHaveBonuses
            ? "All pending employees have bonuses assigned. Click 'Proceed for Approval' to submit them for the approval process."
            : "As a supervisor, you can enter and update bonus amounts for employees under your supervision. You must assign bonuses to ALL employees before you can proceed for approval."}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2, overflow: "auto" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress />
          </Box>
        ) : employees.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              p: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No employees found under your supervision
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={employees}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100, 150, 200]}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              minWidth: 1200,
              "& .MuiDataGrid-cell:hover": {
                cursor: "pointer",
              },
            }}
            autoHeight
          />
        )}
      </Paper>

      {/* Bonus Edit Dialog */}
      <Dialog
        open={bonusDialog.open}
        onClose={handleCloseBonusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {getApprovalStatus(bonusDialog.employee).status !== "not_entered"
            ? "Edit"
            : "Add"}{" "}
          Bonus for {bonusDialog.employee?.fullName}
        </DialogTitle>
        <DialogContent>
          {bonusDialog.employee && (
            <>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Employee ID:</strong>{" "}
                  {bonusDialog.employee.employeeId}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Job Title:</strong>{" "}
                  {bonusDialog.employee.jobTitle || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>2024 Bonus:</strong> $
                  {(bonusDialog.employee.bonus2024 || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>2025 Bonus:</strong> $
                  {(bonusDialog.employee.bonus2025 || 0).toLocaleString()}
                </Typography>
              </Box>

              <TextField
                autoFocus
                margin="dense"
                label="Bonus Amount for 2025"
                fullWidth
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                placeholder="Enter bonus amount"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                helperText="Enter the bonus amount for 2025. Click 'Proceed for Approval' to submit all bonuses."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBonusDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitBonus}
            variant="contained"
            color="primary"
            disabled={submitting || !bonusAmount}
            sx={{
              color: "#FFFFFF",
              "&.Mui-disabled": {
                color: "#FFFFFF",
                opacity: 0.7,
                backgroundColor: "rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            {submitting ? "Saving..." : "Save Bonus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bonuses;
