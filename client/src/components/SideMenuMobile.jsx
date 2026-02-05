import Avatar from "@mui/material/Avatar";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useColorScheme } from "@mui/material/styles";
import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import { selectUser } from "../store/slices/userSlice";
import logo from "../assets/logo.png";
import logoBlack from "../assets/logo_black.png";
import api from "../utils/api";

function SideMenuMobile({ open, toggleDrawer }) {
  const navigate = useNavigate();
  const { mode, systemMode } = useColorScheme();
  const user = useSelector(selectUser);

  // Determine the actual mode being used (system preference or user selection)
  const resolvedMode = (mode === "system" ? systemMode : mode) || "light";

  // Determine which logo to use based on resolved theme mode
  // Use logo.png (white/light logo) for dark mode
  // Use logoBlack.png (dark logo) for light mode
  const currentLogo = resolvedMode === "dark" ? logo : logoBlack;

  // Get user initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  const displayName = user?.fullName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.firstName
    || user?.name
    || "User";

  const handleLogout = async () => {
    try {
      await api.post("/v2/auth/logout");

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout and redirect even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          sx={{ p: 2, pb: 0, gap: 1, alignItems: "center" }}
        >
          <img
            src={currentLogo}
            alt="Logo"
            style={{
              maxHeight: "40px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Stack>
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={displayName}
              sx={{ width: 24, height: 24, bgcolor: "primary.main" }}
            >
              {getInitials(user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim())}
            </Avatar>
            <Typography component="p" variant="h6">
              {displayName}
            </Typography>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
