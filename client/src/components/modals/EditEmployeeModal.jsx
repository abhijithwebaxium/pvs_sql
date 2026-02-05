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
  MenuItem,
  Autocomplete,
} from "@mui/material";
import api from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEmployeeModal = ({ open, onClose, onEmployeeUpdated, employee }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    role: "employee",
    ssn: "",
    company: "",
    companyCode: "",
    location: "",
    jobTitle: "",
    employeeType: "",
    salaryType: "",
    annualSalary: "",
    hourlyPayRate: "",
    bonus2024: "",
    lastHireDate: "",
    state: "",
    isActive: true,
    level1Approver: "",
    level1ApproverName: "",
    level2Approver: "",
    level2ApproverName: "",
    level3Approver: "",
    level3ApproverName: "",
    level4Approver: "",
    level4ApproverName: "",
    level5Approver: "",
    level5ApproverName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch employees for approver dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/v2/employees");
        setEmployees(response.data.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Populate form when employee prop changes
  useEffect(() => {
    if (employee && open) {
      setFormData({
        employeeId: employee.employeeId || "",
        fullName: employee.fullName || "",
        email: employee.email || "",
        role: employee.role || "employee",
        ssn: employee.ssn || "",
        company: employee.company || "",
        companyCode: employee.companyCode || "",
        location: employee.location || "",
        jobTitle: employee.jobTitle || "",
        employeeType: employee.employeeType || "",
        salaryType: employee.salaryType || "",
        annualSalary: employee.annualSalary !== undefined && employee.annualSalary !== null ? employee.annualSalary : "",
        hourlyPayRate: employee.hourlyPayRate !== undefined && employee.hourlyPayRate !== null ? employee.hourlyPayRate : "",
        bonus2024: employee.bonus2024 !== undefined && employee.bonus2024 !== null ? employee.bonus2024 : "",
        lastHireDate: employee.lastHireDate || "",
        state: employee.address?.state || "",
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        level1Approver: employee.level1ApproverId || "",
        level1ApproverName: employee.level1ApproverName || "",
        level2Approver: employee.level2ApproverId || "",
        level2ApproverName: employee.level2ApproverName || "",
        level3Approver: employee.level3ApproverId || "",
        level3ApproverName: employee.level3ApproverName || "",
        level4Approver: employee.level4ApproverId || "",
        level4ApproverName: employee.level4ApproverName || "",
        level5Approver: employee.level5ApproverId || "",
        level5ApproverName: employee.level5ApproverName || "",
      });
      setError("");
    }
  }, [employee, open]);

  const handleChange = (e) => {
    const value =
      e.target.name === "isActive" ? e.target.value === "true" : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.employeeId ||
      !formData.fullName ||
      !formData.email
    ) {
      setError("Employee ID, Full Name, and Email are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        ssn: formData.ssn || null,
        company: formData.company || null,
        companyCode: formData.companyCode || null,
        location: formData.location || null,
        jobTitle: formData.jobTitle || null,
        employeeType: formData.employeeType || null,
        salaryType: formData.salaryType || null,
        annualSalary: formData.annualSalary ? parseFloat(formData.annualSalary) : 0,
        hourlyPayRate: formData.hourlyPayRate ? parseFloat(formData.hourlyPayRate) : 0,
        bonus2024: formData.bonus2024 ? parseFloat(formData.bonus2024) : 0,
        lastHireDate: formData.lastHireDate || null,
        isActive: formData.isActive,
        level1ApproverId: formData.level1Approver || null,
        level1ApproverName: formData.level1ApproverName || null,
        level2ApproverId: formData.level2Approver || null,
        level2ApproverName: formData.level2ApproverName || null,
        level3ApproverId: formData.level3Approver || null,
        level3ApproverName: formData.level3ApproverName || null,
        level4ApproverId: formData.level4Approver || null,
        level4ApproverName: formData.level4ApproverName || null,
        level5ApproverId: formData.level5Approver || null,
        level5ApproverName: formData.level5ApproverName || null,
        address: {
          state: formData.state || "",
        },
      };

      await api.put(`/v2/employees/${employee.id}`, payload);

      // Reset form
      setFormData({
        employeeId: "",
        fullName: "",
        email: "",
        role: "employee",
        ssn: "",
        company: "",
        companyCode: "",
        location: "",
        jobTitle: "",
        employeeType: "",
        salaryType: "",
        annualSalary: "",
        hourlyPayRate: "",
        bonus2024: "",
        lastHireDate: "",
        state: "",
        isActive: true,
        level1Approver: "",
        level1ApproverName: "",
        level2Approver: "",
        level2ApproverName: "",
        level3Approver: "",
        level3ApproverName: "",
        level4Approver: "",
        level4ApproverName: "",
        level5Approver: "",
        level5ApproverName: "",
      });

      onEmployeeUpdated();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while updating employee",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        employeeId: "",
        fullName: "",
        email: "",
        role: "employee",
        ssn: "",
        company: "",
        companyCode: "",
        location: "",
        jobTitle: "",
        employeeType: "",
        salaryType: "",
        annualSalary: "",
        hourlyPayRate: "",
        bonus2024: "",
        lastHireDate: "",
        state: "",
        isActive: true,
        level1Approver: "",
        level1ApproverName: "",
        level2Approver: "",
        level2ApproverName: "",
        level3Approver: "",
        level3ApproverName: "",
        level4Approver: "",
        level4ApproverName: "",
        level5Approver: "",
        level5ApproverName: "",
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
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                name="employeeId"
                label="Employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4} width={'250px'}>
              <TextField
                fullWidth
                select
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="approver">Approver</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>


            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="ssn"
                label="SSN"
                value={formData.ssn}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="company"
                label="Company"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="companyCode"
                label="Company Code"
                value={formData.companyCode}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="jobTitle"
                label="Job Title"
                value={formData.jobTitle}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="employeeType"
                label="Employee Type"
                value={formData.employeeType}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <TextField
                fullWidth
                select
                name="salaryType"
                label="Salary Type"
                value={formData.salaryType}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Salary">Salary</MenuItem>
                <MenuItem value="Hourly">Hourly</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="annualSalary"
                label="Annual Salary"
                type="number"
                value={formData.annualSalary}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="hourlyPayRate"
                label="Hourly Pay Rate"
                type="number"
                value={formData.hourlyPayRate}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="bonus2024"
                label="2024 Bonus"
                type="number"
                value={formData.bonus2024}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <TextField
                fullWidth
                name="lastHireDate"
                label="Last Hire Date"
                type="date"
                value={formData.lastHireDate}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="state"
                label="State/Province"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employees.find(app => app.id === formData.level1Approver) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    level1Approver: newValue?.id || "",
                    level1ApproverName: newValue ? newValue.fullName : "",
                  }));
                }}
                disabled={loading}
                fullWidth
                sx={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level 1 Approver"
                    placeholder="Search level 1 approver..."
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                ListboxProps={{
                  style: { maxHeight: 200 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employees.find(app => app.id === formData.level2Approver) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    level2Approver: newValue?.id || "",
                    level2ApproverName: newValue ? newValue.fullName : "",
                  }));
                }}
                disabled={loading}
                fullWidth
                sx={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level 2 Approver"
                    placeholder="Search level 2 approver..."
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                ListboxProps={{
                  style: { maxHeight: 200 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employees.find(app => app.id === formData.level3Approver) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    level3Approver: newValue?.id || "",
                    level3ApproverName: newValue ? newValue.fullName : "",
                  }));
                }}
                disabled={loading}
                fullWidth
                sx={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level 3 Approver"
                    placeholder="Search level 3 approver..."
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                ListboxProps={{
                  style: { maxHeight: 200 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employees.find(app => app.id === formData.level4Approver) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    level4Approver: newValue?.id || "",
                    level4ApproverName: newValue ? newValue.fullName : "",
                  }));
                }}
                disabled={loading}
                fullWidth
                sx={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level 4 Approver"
                    placeholder="Search level 4 approver..."
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                ListboxProps={{
                  style: { maxHeight: 200 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employees.find(app => app.id === formData.level5Approver) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    level5Approver: newValue?.id || "",
                    level5ApproverName: newValue ? newValue.fullName : "",
                  }));
                }}
                disabled={loading}
                fullWidth
                sx={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Level 5 Approver"
                    placeholder="Search level 5 approver..."
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                ListboxProps={{
                  style: { maxHeight: 200 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} width={'250px'}>
              <TextField
                fullWidth
                select
                name="isActive"
                label="Status"
                value={formData.isActive.toString()}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeModal;
