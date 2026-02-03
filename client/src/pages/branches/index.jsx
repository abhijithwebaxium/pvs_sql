import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import AddBranchModal from "../../components/modals/AddBranchModal";
// import api from '../../utils/api';
import api from "../../utils/api";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/v2/branches");
      const { data } = response;

      setBranches(data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while fetching branches";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleBranchAdded = () => {
    setOpenModal(false);
    fetchBranches(); // Refresh the list
  };

  const columns = [
    {
      field: "sl",
      headerName: "SL",
      width: 70,
      flex: 0.3,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    {
      field: "branchCode",
      headerName: "Branch Code",
      width: 150,
      flex: 0.5,
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      width: 200,
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      width: 180,
      flex: 1,
    },
    {
      field: "manager",
      headerName: "Manager",
      width: 180,
      flex: 1,
      renderCell: (params) => {
        const manager = params.row.manager;
        return manager
          ? `${manager.firstName} ${manager.lastName} (${manager.employeeId})`
          : "Not Assigned";
      },
    },
    {
      field: "employeeCount",
      headerName: "Employee Count",
      width: 150,
      flex: 0.5,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    // {
    //   field: "contactInfo.phone",
    //   headerName: "Phone",
    //   width: 150,
    //   flex: 0.8,
    //   renderCell: (params) => params.row.contactInfo?.phone || "N/A",
    // },
    // {
    //   field: "contactInfo.email",
    //   headerName: "Email",
    //   width: 200,
    //   flex: 1,
    //   renderCell: (params) => params.row.contactInfo?.email || "N/A",
    // },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      flex: 0.5,
      renderCell: (params) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: params.value ? "success.dark" : "error.dark",
            fontWeight: "medium",
          }}
        >
          {params.value ? "Active" : "Inactive"}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Branches
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBranch}
        >
          Add Branch
        </Button>
      </Box>

      <Paper sx={{ width: "100%", mb: 2 }}>
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
            rows={branches}
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

      <AddBranchModal
        open={openModal}
        onClose={handleCloseModal}
        onBranchAdded={handleBranchAdded}
      />
    </Box>
  );
};

export default Branches;
