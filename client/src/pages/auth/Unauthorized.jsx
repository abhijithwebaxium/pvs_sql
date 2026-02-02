import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please contact your administrator if you believe you should have
          access to this resource.
        </Typography>
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized;
