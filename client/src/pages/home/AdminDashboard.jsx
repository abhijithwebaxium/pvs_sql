import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const AdminDashboard = ({ user }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Typography variant="h6">Employees</Typography>
              </Box>
              <Typography variant="h4">--</Typography>
              <Typography variant="body2" color="text.secondary">
                Total employees in system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Typography variant="h6">Branches</Typography>
              </Box>
              <Typography variant="h4">--</Typography>
              <Typography variant="body2" color="text.secondary">
                Total branches
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: "warning.main", mr: 2 }} />
                <Typography variant="h6">Pending Approvals</Typography>
              </Box>
              <Typography variant="h4">--</Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                <Typography variant="h6">Total Bonuses</Typography>
              </Box>
              <Typography variant="h4">--</Typography>
              <Typography variant="body2" color="text.secondary">
                Bonuses allocated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As an administrator, you have full access to all system features including:
              </Typography>
              <Box component="ul" sx={{ mt: 2 }}>
                <li>Manage employees and branches</li>
                <li>Configure approval workflows</li>
                <li>Process and review all approvals</li>
                <li>Manage bonuses and compensation</li>
                <li>System configuration and settings</li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
