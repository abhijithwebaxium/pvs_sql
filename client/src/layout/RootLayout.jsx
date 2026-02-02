import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import AppNavbar from "../components/AppNavbar";
import Header from "../components/Header";
import { Stack } from "@mui/material";

const RootLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu />
      <AppNavbar />
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          scrollBehavior: "smooth",
          height: "100vh",
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: "auto",
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
            mb: "52px",
          }}
        >
          <Header />
          <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "2500px" } }}>
            <Outlet />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default RootLayout;
