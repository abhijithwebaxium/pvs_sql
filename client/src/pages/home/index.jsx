import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import HRDashboard from "./HRDashboard";
import ApproverDashboard from "./ApproverDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import Approvals from "../approvals";

const Home = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  // Redirect approver to approvals page instead of showing dashboard
  useEffect(() => {
    if (user?.role === "approver") {
      navigate("/approvals", { replace: true });
    }
  }, [user, navigate]);

  // Render dashboard based on user role
  const renderDashboard = () => {
    if (!user) {
      return (
        <Card>
          <CardContent>
            <Typography>Loading...</Typography>
          </CardContent>
        </Card>
      );
    }

    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} />;
      case "hr":
        return <HRDashboard user={user} />;
      case "approver":
        return <Approvals />;
      case "employee":
        return <EmployeeDashboard user={user} />;
      default:
        return (
          <Card>
            <CardContent>
              <Typography>Welcome to the system!</Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName || "User"}!
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 3 }}
      >
        Role: {user?.role?.toUpperCase() || "N/A"}
      </Typography>
      {renderDashboard()}
    </Box>
  );
};

export default Home;
