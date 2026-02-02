import React, { useState } from "react";
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
} from "@mui/material";
import api from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddBranchModal = ({ open, onClose, onBranchAdded }) => {
  const [formData, setFormData] = useState({
    branchCode: "",
    branchName: "",
    location: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.branchCode || !formData.branchName || !formData.location) {
      setError("Branch Code, Branch Name, and Location are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        branchCode: formData.branchCode,
        branchName: formData.branchName,
        location: formData.location,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
        },
      };

      await api.post("/api/v2/branches", payload);

      // Reset form
      setFormData({
        branchCode: "",
        branchName: "",
        location: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        email: "",
      });

      onBranchAdded();
    } catch (err) {
      setError(err.message || "An error occurred while creating branch");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        branchCode: "",
        branchName: "",
        location: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        email: "",
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
      <DialogTitle>Add New Branch</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="branchCode"
                label="Branch Code"
                value={formData.branchCode}
                onChange={handleChange}
                disabled={loading}
                inputProps={{ style: { textTransform: "uppercase" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="branchName"
                label="Branch Name"
                value={formData.branchName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="street"
                label="Street Address"
                value={formData.street}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="zipCode"
                label="Zip Code"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
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
          {loading ? "Adding..." : "Add Branch"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBranchModal;
