import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Slide,
  Grid,
  Autocomplete,
  Typography,
} from "@mui/material";
import api from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEmployeeBonusModal = ({ open, onClose, onEmployeeUpdated, employee }) => {
  const [formData, setFormData] = useState({
    bonus2025: "",
    level1Approver: "",
    level2Approver: "",
    level3Approver: "",
    level4Approver: "",
    level5Approver: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch all employees and populate form when modal opens
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/api/v2/employees");
        setEmployees(response.data.data || []);

        // Populate form after employees are loaded
        if (employee) {
          setFormData({
            bonus2025: employee.bonus2025 || "",
            level1Approver: employee.level1ApproverId || "",
            level2Approver: employee.level2ApproverId || "",
            level3Approver: employee.level3ApproverId || "",
            level4Approver: employee.level4ApproverId || "",
            level5Approver: employee.level5ApproverId || "",
          });
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if (open && employee) {
      fetchEmployees();
      setError("");
    }
  }, [open, employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const payload = {
        bonus2025: formData.bonus2025 ? parseFloat(formData.bonus2025) : undefined,
        level1Approver: formData.level1Approver || undefined,
        level2Approver: formData.level2Approver || undefined,
        level3Approver: formData.level3Approver || undefined,
        level4Approver: formData.level4Approver || undefined,
        level5Approver: formData.level5Approver || undefined,
      };

      await api.put(`/api/v2/employees/${employee._id}`, payload);

      // Reset form
      setFormData({
        bonus2025: "",
        level1Approver: "",
        level2Approver: "",
        level3Approver: "",
        level4Approver: "",
        level5Approver: "",
      });

      onEmployeeUpdated();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while updating employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        bonus2025: "",
        level1Approver: "",
        level2Approver: "",
        level3Approver: "",
        level4Approver: "",
        level5Approver: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slots={{
        transition: Transition,
      }}
      keepMounted
    >
      <DialogTitle>
        Edit Employee Bonus & Approvers
        {employee && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {employee.firstName} {employee.lastName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* 2025 Bonus */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="bonus2025"
                label="2025 Bonus"
                type="number"
                value={formData.bonus2025}
                onChange={(e) =>
                  setFormData({ ...formData, bonus2025: e.target.value })
                }
                disabled={loading}
              />
            </Grid>

            {/* Level 1 Approver */}
            <Grid item xs={12} sm={6} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName && option.lastName
                    ? `${option.firstName} ${option.lastName}`
                    : ""
                }
                value={
                  employees.find((emp) => emp.id === formData.level1Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level1Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level1Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 1 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 2 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName && option.lastName
                    ? `${option.firstName} ${option.lastName}`
                    : ""
                }
                value={
                  employees.find((emp) => emp.id === formData.level2Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level2Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level2Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 2 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 3 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName && option.lastName
                    ? `${option.firstName} ${option.lastName}`
                    : ""
                }
                value={
                  employees.find((emp) => emp.id === formData.level3Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level3Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level3Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 3 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 4 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName && option.lastName
                    ? `${option.firstName} ${option.lastName}`
                    : ""
                }
                value={
                  employees.find((emp) => emp.id === formData.level4Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level4Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level4Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 4 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 5 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName && option.lastName
                    ? `${option.firstName} ${option.lastName}`
                    : ""
                }
                value={
                  employees.find((emp) => emp.id === formData.level5Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level5Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level5Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 5 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeBonusModal;
