import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Button,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import useDashboardStats from "../../hooks/useDashboardStats";
import api from "../../utils/api";
import EditEmployeeBonusModal from "../../components/modals/EditEmployeeBonusModal";

const HRDashboard = ({ user }) => {
  const {
    staffCount,
    loading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  // UKG Export states
  const [ukgExportEnabled, setUkgExportEnabled] = useState(false);
  const [ukgExportLoading, setUkgExportLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const checkUKGExportStatus = async () => {
    try {
      const response = await api.get("/v2/employees/ukg/approvals-status");
      const { data } = response;
      setUkgExportEnabled(data.allApprovalsCompleted);
    } catch (err) {
      console.error("Error checking UKG export status:", err);
      setUkgExportEnabled(false);
    }
  };

  const handleUKGExportClick = () => {
    if (!ukgExportEnabled) {
      setSnackbarMessage(
        "This export only works after adding bonuses and approving all levels (Level 1-5) for all employees with bonuses."
      );
      setSnackbarOpen(true);
      return;
    }
    handleUKGExport();
  };

  const handleUKGExport = async () => {
    setUkgExportLoading(true);
    try {
      const response = await api.get("/v2/employees/ukg/export", {
        responseType: "blob",
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `UKG_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage("UKG export downloaded successfully!");
      setSnackbarOpen(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while exporting to UKG"
      );
    } finally {
      setUkgExportLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/v2/employees");
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);

        // Check UKG export status
        checkUKGExportStatus();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred while fetching employees",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.employeeId?.toLowerCase().includes(query) ||
          emp.fullName?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query),
      );
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter((emp) => emp.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "") {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((emp) => emp.isActive === isActive);
    }

    // Supervisor filter
    if (selectedSupervisor) {
      filtered = filtered.filter(
        (emp) => emp.supervisorName === selectedSupervisor,
      );
    }

    // Company filter
    if (selectedCompany) {
      filtered = filtered.filter((emp) => emp.company === selectedCompany);
    }

    setFilteredEmployees(filtered);
  }, [
    searchQuery,
    selectedRole,
    selectedStatus,
    selectedSupervisor,
    selectedCompany,
    employees,
  ]);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeUpdated = () => {
    setOpenEditModal(false);
    setSelectedEmployee(null);
    // Refresh the employee list
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/v2/employees");
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred while fetching employees",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  };

  // Extract unique supervisors from all employees
  const uniqueSupervisors = [
    ...new Set(
      employees.map((emp) => emp.supervisorName).filter((name) => name),
    ),
  ].sort();

  // Extract unique companies from all employees
  const uniqueCompanies = [
    ...new Set(employees.map((emp) => emp.company).filter((name) => name)),
  ].sort();

  // Calculate allocated bonus aggregate by selected supervisor
  const allocatedBonusAggregate = selectedSupervisor
    ? employees
        .filter((emp) => emp.supervisorName === selectedSupervisor)
        .reduce((sum, emp) => sum + (parseFloat(emp.bonus2025) || 0), 0)
    : 0;

  // Calculate supervisor bonus statistics
  const supervisorStats = uniqueSupervisors.map((supervisorName) => {
    const supervisorEmployees = employees.filter(
      (emp) => emp.supervisorName === supervisorName,
    );
    const totalEmployees = supervisorEmployees.length;
    const employeesWithBonus = supervisorEmployees.filter(
      (emp) => parseFloat(emp.bonus2025) > 0,
    ).length;
    const percentage =
      totalEmployees > 0
        ? ((employeesWithBonus / totalEmployees) * 100).toFixed(1)
        : 0;

    return {
      id: supervisorName,
      supervisorName,
      totalEmployees,
      employeesWithBonus,
      percentage: parseFloat(percentage),
    };
  });

  // Calculate donut chart data - Bonus allocation status
  const totalActiveEmployees = employees.filter((emp) => emp.isActive).length;
  const employeesWithBonus2025 = employees.filter(
    (emp) => emp.isActive && parseFloat(emp.bonus2025) > 0,
  ).length;
  const employeesWithoutBonus = totalActiveEmployees - employeesWithBonus2025;

  const bonusChartData = [
    {
      id: 0,
      value: employeesWithBonus2025,
      color: "#4caf50",
    },
    {
      id: 1,
      value: employeesWithoutBonus,
      color: "#ff9800",
    },
  ];

  // Calculate approval completion stats
  const totalEmployees = filteredEmployees.length;
  const fullyApprovedCount = filteredEmployees.filter((emp) => {
    // Check if all 5 levels are approved
    for (let i = 1; i <= 5; i++) {
      const approver = emp[`level${i}Approver`];
      if (approver) {
        const status = emp.approvalStatus?.[`level${i}`]?.status;
        if (status !== "approved") {
          return false;
        }
      }
    }
    // Employee must have at least one approver assigned
    return (
      emp.level1Approver ||
      emp.level2Approver ||
      emp.level3Approver ||
      emp.level4Approver ||
      emp.level5Approver
    );
  }).length;

  // Calculate total bonus aggregates for all employees
  const totalBonus2024 = employees.reduce(
    (sum, emp) => sum + (parseFloat(emp.bonus2024) || 0),
    0,
  );
  const totalBonus2025 = employees.reduce(
    (sum, emp) => sum + (parseFloat(emp.bonus2025) || 0),
    0,
  );

  // Supervisor table columns
  const supervisorColumns = [
    {
      field: "slNo",
      headerName: "SL. No",
      width: 80,
      renderCell: (params) => {
        const rows = params.api.getAllRowIds();
        return rows.indexOf(params.id) + 1;
      },
    },
    {
      field: "supervisorName",
      headerName: "Supervisor Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "totalEmployees",
      headerName: "Total Employees",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "employeesWithBonus",
      headerName: "Employees with Bonus",
      width: 180,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "percentage",
      headerName: "Bonus Allocation %",
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
          }}
        >
          <Box sx={{ width: "100%", position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{
                height: 24,
                borderRadius: 2,
                backgroundColor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  backgroundColor:
                    params.value >= 50 ? "success.main" : "warning.main",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: 700,
                color: params.value > 30 ? "white" : "text.primary",
                zIndex: 1,
              }}
            >
              {params.value}%
            </Typography>
          </Box>
        </Box>
      ),
    },
  ];

  const columns = [
    {
      field: "slNo",
      headerName: "SL. No",
      width: 70,
      renderCell: (params) => {
        const rows = params.api.getAllRowIds();
        return rows.indexOf(params.id) + 1;
      },
    },
    {
      field: "fullName",
      headerName: "Name",
      width: 220,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      width: 180,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "supervisorName",
      headerName: "Supervisor",
      width: 180,
      renderCell: (params) => params.value || "Not Assigned",
    },
    {
      field: "salaryType",
      headerName: "Salary Type",
      width: 130,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "annualSalary",
      headerName: "Annual Salary",
      width: 150,
      renderCell: (params) => `$${(params.value || 0).toLocaleString()}`,
    },
    {
      field: "bonus2024",
      headerName: "2024 Bonus",
      width: 130,
      renderCell: (params) => `$${(params.value || 0).toLocaleString()}`,
    },
    {
      field: "bonus2025",
      headerName: "2025 Bonus",
      width: 130,
      renderCell: (params) => `$${(params.value || 0).toLocaleString()}`,
    },
    {
      field: "level1ApproverName",
      headerName: "Approver 1",
      width: 160,
      renderCell: (params) => {
        const approverName = params.value || "Not Assigned";
        const status = params.row.approvalStatus?.level1?.status;
        const color =
          status === "approved"
            ? "success.main"
            : status === "rejected"
              ? "error.main"
              : "text.primary";
        return <Typography sx={{ color, mt: 1 }}>{approverName}</Typography>;
      },
    },
    {
      field: "level2ApproverName",
      headerName: "Approver 2",
      width: 160,
      renderCell: (params) => {
        const approverName = params.value || "Not Assigned";
        const status = params.row.approvalStatus?.level2?.status;
        const color =
          status === "approved"
            ? "success.main"
            : status === "rejected"
              ? "error.main"
              : "text.primary";
        return <Typography sx={{ color, mt: 1 }}>{approverName}</Typography>;
      },
    },
    {
      field: "level3ApproverName",
      headerName: "Approver 3",
      width: 160,
      renderCell: (params) => {
        const approverName = params.value || "Not Assigned";
        const status = params.row.approvalStatus?.level3?.status;
        const color =
          status === "approved"
            ? "success.main"
            : status === "rejected"
              ? "error.main"
              : "text.primary";
        return <Typography sx={{ color, mt: 1 }}>{approverName}</Typography>;
      },
    },
    {
      field: "level4ApproverName",
      headerName: "Approver 4",
      width: 160,
      renderCell: (params) => {
        const approverName = params.value || "Not Assigned";
        const status = params.row.approvalStatus?.level4?.status;
        const color =
          status === "approved"
            ? "success.main"
            : status === "rejected"
              ? "error.main"
              : "text.primary";
        return <Typography sx={{ color, mt: 1 }}>{approverName}</Typography>;
      },
    },
    {
      field: "level5ApproverName",
      headerName: "Approver 5",
      width: 160,
      renderCell: (params) => {
        const approverName = params.value || "Not Assigned";
        const status = params.row.approvalStatus?.level5?.status;
        const color =
          status === "approved"
            ? "success.main"
            : status === "rejected"
              ? "error.main"
              : "text.primary";
        return <Typography sx={{ color, mt: 1 }}>{approverName}</Typography>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          startIcon={<EditIcon />}
          color="primary"
          onClick={() => handleEditClick(params.row)}
          size="small"
        >
          Edit
        </Button>
      ),
    },
  ];

  if (statsError || error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {statsError || error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, hsl(210, 100%, 95%) 0%, hsl(210, 100%, 92%) 100%)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.light",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px 0 rgba(33, 150, 243, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    Total Employees
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {statsLoading ? (
                      <CircularProgress
                        size={30}
                        sx={{ color: "primary.main" }}
                      />
                    ) : (
                      staffCount
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    Active staff members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, hsl(210, 100%, 95%) 0%, hsl(210, 100%, 92%) 100%)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.light",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px 0 rgba(33, 150, 243, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    Approvals Completed
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={30}
                        sx={{ color: "primary.main" }}
                      />
                    ) : (
                      fullyApprovedCount
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    Out of {totalEmployees} employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, hsl(210, 100%, 95%) 0%, hsl(210, 100%, 92%) 100%)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.light",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px 0 rgba(33, 150, 243, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AttachMoneyIcon sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    2024 Bonus Total
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={30}
                        sx={{ color: "primary.main" }}
                      />
                    ) : (
                      `$${totalBonus2024.toLocaleString()}`
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    Total bonus for 2024
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, hsl(210, 100%, 95%) 0%, hsl(210, 100%, 92%) 100%)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.light",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px 0 rgba(33, 150, 243, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AttachMoneyIcon sx={{ fontSize: 28, color: "white" }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    2025 Bonus Total
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "primary.dark",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={30}
                        sx={{ color: "primary.main" }}
                      />
                    ) : (
                      `$${totalBonus2025.toLocaleString()}`
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    Total bonus for 2025
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* UKG Export Button - Outside Table */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<FileDownloadIcon />}
          onClick={handleUKGExportClick}
          disabled={ukgExportLoading}
          sx={{
            px: 3,
            py: 1.5,
            fontWeight: 600,
            boxShadow: 3,
            opacity: !ukgExportEnabled && !ukgExportLoading ? 0.6 : 1,
            backgroundColor: "success.main",
            "&:hover": {
              backgroundColor: "success.main",
              boxShadow: 6,
            },
          }}
        >
          {ukgExportLoading ? "Exporting..." : "Final Excel Export for UKG"}
        </Button>
      </Box>

      <Paper
        sx={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Table Header */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                Employees
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {fullyApprovedCount}/{totalEmployees} employee's approval has
                been completed
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, color: "primary.main", mt: 0.5 }}
              >
                Allocated Bonus Aggregate: $
                {allocatedBonusAggregate.toLocaleString()}
              </Typography>
            </Box>

            {/* Filters Container */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Company Filter */}
              <TextField
                select
                size="small"
                label="Company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Companies</MenuItem>
                {uniqueCompanies.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Supervisor Filter */}
              <TextField
                select
                size="small"
                label="Supervisor"
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Supervisors</MenuItem>
                {uniqueSupervisors.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Role Filter */}
              <TextField
                select
                size="small"
                label="Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="approver">Approver</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>

              {/* Status Filter */}
              <TextField
                select
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>

              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredEmployees}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            paginationMode="client"
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100, 150, 200]}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "background.paper",
                borderBottom: "2px solid",
                borderColor: "divider",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Supervisor Statistics and Chart Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column !important", xl: "row !important" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* Supervisor Bonus Statistics Table */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              Supervisor Bonus Statistics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Percentage of employees allocated bonus by supervisor
            </Typography>
          </Box>

          <Box sx={{ height: 750, width: "100%" }}>
            <DataGrid
              rows={supervisorStats}
              columns={supervisorColumns}
              getRowId={(row) => row.id}
              loading={loading}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 12, page: 0 },
                },
              }}
              pageSizeOptions={[5, 10, 15, 25, 50, 100, 150, 200]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "background.paper",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
              }}
            />
          </Box>
        </Paper>

        {/* Charts Column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column !important",
              md: "row !important",
              xl: "column !important",
            },
            gap: 3,
          }}
        >
          {/* Bonus Allocation Donut Chart */}
          <Paper
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                Bonus Allocation Overview
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Distribution of 2025 bonus allocation
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                position: "relative",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <PieChart
                  series={[
                    {
                      data: bonusChartData,
                      innerRadius: 80,
                      outerRadius: 120,
                      paddingAngle: 2,
                      cornerRadius: 5,
                      highlightScope: { faded: "global", highlighted: "item" },
                    },
                  ]}
                  width={380}
                  height={300}
                  slotProps={{
                    legend: {
                      hidden: true,
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {totalActiveEmployees > 0
                      ? (
                          (employeesWithBonus2025 / totalActiveEmployees) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Allocation
                  </Typography>
                </Box>
              </Box>

              {/* Custom Legend */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  mt: 2,
                  justifyContent: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 15,
                      height: 15,
                      borderRadius: "3px",
                      bgcolor: "#4caf50",
                    }}
                  />
                  <Typography variant="body2">
                    With Bonus ({employeesWithBonus2025})
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 15,
                      height: 15,
                      borderRadius: "3px",
                      bgcolor: "#ff9800",
                    }}
                  />
                  <Typography variant="body2">
                    Without Bonus ({employeesWithoutBonus})
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Bar Chart for 2024 and 2025 Bonus Aggregates */}
          <Paper
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                Bonus Comparison
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Total bonus aggregates for 2024 and 2025
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: ["2024 Bonus", "2025 Bonus"],
                  },
                ]}
                series={[
                  {
                    data: [totalBonus2024],
                    color: "#2196f3",
                  },
                  {
                    data: [null, totalBonus2025],
                    color: "#4caf50",
                  },
                ]}
                width={380}
                height={280}
                slotProps={{
                  legend: {
                    hidden: true,
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      <EditEmployeeBonusModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        onEmployeeUpdated={handleEmployeeUpdated}
        employee={selectedEmployee}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default HRDashboard;
