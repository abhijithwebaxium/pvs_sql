import { styled } from "@mui/material/styles";
import { useColorScheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { selectUser } from "../store/slices/userSlice";
import logo from "../assets/logo.png";
import logoBlack from "../assets/logo_black.png";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const { mode, systemMode } = useColorScheme();
  const user = useSelector(selectUser);

  // Determine the actual mode being used (system preference or user selection)
  const resolvedMode = (mode === 'system' ? systemMode : mode) || 'light';

  // Determine which logo to use based on resolved theme mode
  // Use logo.png (white/light logo) for dark mode
  // Use logoBlack.png (dark logo) for light mode
  const currentLogo = resolvedMode === 'dark' ? logo : logoBlack;

  // Get user initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  // Backward compatibility for user display
  const displayName = user?.fullName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.firstName
    || user?.name
    || "User";
  const displayEmail = user?.email || "user@email.com";

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <img
          src={currentLogo}
          alt="Logo"
          style={{
            maxWidth: "80%",
            height: "auto",
            maxHeight: "60px",
            objectFit: "contain",
          }}
        />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
        {/* <CardAlert /> */}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={displayName}
          sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
        >
          {getInitials(user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim())}
        </Avatar>
        <Box sx={{ mr: "auto", minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              lineHeight: "16px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {displayEmail}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
