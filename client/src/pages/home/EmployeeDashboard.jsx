import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";

const EmployeeDashboard = ({ user }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Typography variant="h6">My Profile</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Employee ID:</strong> {user?.employeeId || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Position:</strong> {user?.position || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {user?.email || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CalendarTodayIcon sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Typography variant="h6">Employment Info</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Hire Date:</strong> {user?.hireDate ? new Date(user.hireDate).toLocaleDateString() : "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={user?.isActive ? "Active" : "Inactive"}
                  color={user?.isActive ? "success" : "error"}
                  size="small"
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                <Typography variant="h6">Bonus Information</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>2024 Bonus:</strong> ${user?.bonus2024 || 0}
              </Typography>
              <Typography variant="body1">
                <strong>2025 Bonus:</strong> ${user?.bonus2025 || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <InfoIcon sx={{ fontSize: 40, color: "warning.main", mr: 2 }} />
                <Typography variant="h6">Quick Info</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View your bonus information and personal details. Contact HR if you need to update any information.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Resources
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As an employee, you can:
              </Typography>
              <Box component="ul" sx={{ mt: 2 }}>
                <li>View your personal information and employment details</li>
                <li>Check your bonus status and history</li>
                <li>Access company resources and policies</li>
                <li>Contact HR for assistance</li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
