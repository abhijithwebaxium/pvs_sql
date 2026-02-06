import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../store/slices/userSlice";
import api from "../../utils/api";
import truckImage from "../../assets/pvs-truck.png";
import logo from "../../assets/logo_black.png";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState("local"); // 'local' or 'ldap'

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

    if (!formData.email || !formData.password) {
      setError("Please provide email and password");
      return;
    }

    setLoading(true);
    dispatch(loginStart());

    try {
      const response = await api.post("/v2/auth/login", {
        email: formData.email,
        password: formData.password,
        authMethod: authMethod,
      });

      const { data: responseData } = response;

      if (responseData.data?.user) {
        dispatch(
          loginSuccess({
            ...responseData.data.user,
            token: responseData.data.token,
          }),
        );
      }

      if (responseData.data?.user?.role === "approver") {
        navigate("/approvals");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred during login";
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Left Side - Image Section */}
      <Box
        sx={{
          flex: { xs: 0, md: 1.2, lg: 1.5 },
          display: { xs: "none", md: "block" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${truckImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
            transition: "transform 0.5s ease",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            p: 6,
            color: "white",
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, letterSpacing: -1 }}
          >
            PVS Chemicals
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, fontWeight: 300, maxWidth: "500px" }}
          >
            Chemistry for daily life.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 6, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: "450px",
            width: "100%",
            bgcolor: "transparent",
          }}
        >
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Box
              component="img"
              src={logo}
              alt="PVS Logo"
              sx={{ height: 60, mb: 3 }}
            />
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your credentials to access your dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Authentication Method Toggle */}
          <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Select Authentication Method
            </Typography>
            <ToggleButtonGroup
              value={authMethod}
              exclusive
              onChange={(e, newMethod) => {
                if (newMethod !== null) {
                  setAuthMethod(newMethod);
                  setError("");
                }
              }}
              aria-label="authentication method"
              sx={{ mb: 1 }}
            >
              <ToggleButton
                value="local"
                aria-label="local authentication"
                sx={{
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              >
                Local Account
              </ToggleButton>
              <ToggleButton
                value="ldap"
                aria-label="ldap authentication"
                sx={{
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              >
                LDAP / Active Directory
              </ToggleButton>
            </ToggleButtonGroup>
            {authMethod === "ldap" && (
              <Chip
                label="Using company Active Directory credentials"
                size="small"
                color="info"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 1 }}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "#FFFFFF",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                },
              }}
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </Box>

        </Paper>

        <Box sx={{ mt: "auto", pt: 4 }}>
          <Typography variant="caption" color="text.disabled">
            © {new Date().getFullYear()} PVS Logistics. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
