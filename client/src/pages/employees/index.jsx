import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
  Grid,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddEmployeeModal from "../../components/modals/AddEmployeeModal";
import UploadEmployeesModal from "../../components/modals/UploadEmployeesModal";
import EditEmployeeModal from "../../components/modals/EditEmployeeModal";
// import api from '../../utils/api';
import api from "../../utils/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/v2/employees");
      const { data } = response;

      setEmployees(data.data);
      setFilteredEmployees(data.data);
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

    // Company filter
    if (selectedCompany) {
      filtered = filtered.filter((emp) => emp.company === selectedCompany);
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, selectedRole, selectedStatus, selectedCompany, employees]);

  const handleAddEmployee = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEmployeeAdded = () => {
    setOpenModal(false);
    fetchEmployees(); // Refresh the list
  };

  const handleUploadClick = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
  };

  const handleEmployeesUploaded = () => {
    setOpenUploadModal(false);
    fetchEmployees(); // Refresh the list
  };

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
    fetchEmployees(); // Refresh the list
  };

  // Extract unique companies from all employees
  const uniqueCompanies = [
    ...new Set(employees.map((emp) => emp.company).filter((name) => name)),
  ].sort();

  const columns = [
    {
      field: "slNo",
      headerName: "Sl No",
      width: 80,
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => {
        const index = filteredEmployees.findIndex(
          (emp) => emp.id === params.row.id,
        );
        return index + 1;
      },
    },
    {
      field: "fullName",
      headerName: "Name",
      width: 200,
      minWidth: 150,
      flex: 1,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      width: 180,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "supervisorName",
      headerName: "Supervisor",
      width: 180,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.value || "Not Assigned",
    },
    {
      field: "salaryType",
      headerName: "Salary Type",
      width: 130,
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "annualSalary",
      headerName: "Annual Salary",
      width: 150,
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => {
        const salary = params.value || 0;
        return salary > 0 ? `$${salary.toLocaleString()}` : "N/A";
      },
    },
    // {
    //   field: "role",
    //   headerName: "Role",
    //   width: 120,
    //   minWidth: 100,
    //   flex: 0.6,
    //   renderCell: (params) => (
    //     <Box
    //       sx={{
    //         px: 1.5,
    //         py: 0.5,
    //         borderRadius: 1,
    //         color: "primary.dark",
    //         fontWeight: "medium",
    //         textTransform: "capitalize",
    //       }}
    //     >
    //       {params.value}
    //     </Box>
    //   ),
    // },
    // {
    //   field: "isActive",
    //   headerName: "Status",
    //   width: 120,
    //   minWidth: 100,
    //   flex: 0.5,
    //   renderCell: (params) => (
    //     <Box
    //       sx={{
    //         px: 2,
    //         py: 0.5,
    //         borderRadius: 1,
    //         color: params.value ? "success.dark" : "error.dark",
    //         fontWeight: "medium",
    //       }}
    //     >
    //       {params.value ? "Active" : "Inactive"}
    //     </Box>
    //   ),
    // },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      minWidth: 100,
      flex: 0.5,
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

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Employees
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Box sx={{ p: 2 }}>
          {/* Search, Filters, and Action Buttons - All in one row */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              mb: 2,
            }}
          >
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

            {/* Action Buttons - Push to the right */}
            <Box sx={{ marginLeft: "auto", display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
              >
                Add Employee
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClick}
              >
                Upload Excel
              </Button>
            </Box>
          </Box>
        </Box>

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
        ) : (
          <DataGrid
            rows={filteredEmployees}
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
              "& .MuiDataGrid-cell:hover": {
                cursor: "pointer",
              },
            }}
            autoHeight
          />
        )}
      </Paper>

      <AddEmployeeModal
        open={openModal}
        onClose={handleCloseModal}
        onEmployeeAdded={handleEmployeeAdded}
      />

      <UploadEmployeesModal
        open={openUploadModal}
        onClose={handleCloseUploadModal}
        onEmployeesUploaded={handleEmployeesUploaded}
      />

      <EditEmployeeModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        onEmployeeUpdated={handleEmployeeUpdated}
        employee={selectedEmployee}
      />
    </Box>
  );
};

export default Employees;
