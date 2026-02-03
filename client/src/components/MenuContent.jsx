import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import { selectUser } from "../store/slices/userSlice";
import api from "../utils/api";

// Define menu items - NO ROLE RESTRICTIONS
const menuItems = [
  { text: "Home", 
    icon: <HomeRoundedIcon />, 
    path: "/",
    roles: ["admin", "hr"],
  },
  // {
  //   text: "Branches",
  //   icon: <BusinessRoundedIcon />,
  //   path: "/branches",
  //   roles: ["admin", "hr"],
  // },
  {
    text: "Employees",
    icon: <PeopleRoundedIcon />,
    path: "/employees",
    roles: ["admin", "hr"],
  },
  {
    text: "Approvals",
    icon: <CheckCircleOutlineIcon />,
    path: "/approvals",
    roles: ["admin", "manager", "approver"],
  },
  {
    text: "Assign Bonuses",
    icon: <AttachMoneyIcon />,
    path: "/bonuses",
    roles: ["admin", "manager", "approver"],
    showBadge: true,
  },
];

const secondaryListItems = [
  // { text: "Settings", icon: <SettingsRoundedIcon /> },
  // { text: "About", icon: <InfoRoundedIcon /> },
  // { text: "Feedback", icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const [pendingBonusCount, setPendingBonusCount] = useState(0);

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  // Fetch pending bonus count for supervisors/approvers
  useEffect(() => {
    const fetchPendingBonusCount = async () => {
      try {
        const userId = user?.id || user?._id;
        if (!userId) return;

        // Only fetch for users who can assign bonuses
        if (!["admin", "manager", "approver"].includes(user.role)) return;

        const response = await api.get(
          `/v2/employees/supervisor/my-team?supervisorId=${userId}`
        );

        const employees = response.data.data;

        // Count employees without bonus assigned (enteredBy not set)
        const count = employees.filter(
          (emp) => !emp.approvalStatus?.enteredBy
        ).length;

        setPendingBonusCount(count);
      } catch (err) {
        console.error("Failed to fetch pending bonus count:", err);
      }
    };

    fetchPendingBonusCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingBonusCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const visibleMenuItems = menuItems?.filter((item) =>
    item.roles ? item.roles.includes(user.role) : true,
  );

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {visibleMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.showBadge ? (
                  <Badge
                    badgeContent={pendingBonusCount}
                    color="error"
                    max={99}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  item.showBadge
                    ? `${item.text} (${pendingBonusCount})`
                    : item.text
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
