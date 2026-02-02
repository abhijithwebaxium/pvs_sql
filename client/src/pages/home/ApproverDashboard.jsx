import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import api from "../../utils/api";

const ApproverDashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
  });

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchApprovalStats();
    }
  }, [user]);

  const fetchApprovalStats = async () => {
    setLoading(true);
    try {
      const userId = user?.id || user?._id;
      const response = await api.get(
        `/api/v2/employees/approvals/my-approvals?approverId=${userId}`,
      );

      const { data } = response;

      if (response.status === 200 || response.status === 201) {
        // Total pending = sum of all level counts (these are employees awaiting approval)
        const totalPending = Object.values(data.counts || {}).reduce(
          (sum, count) => sum + count,
          0,
        );

        // Total approved = count employees where current user has approved at their level
        let totalApproved = 0;

        Object.entries(data.data).forEach(([levelKey, levelData]) => {
          const level = parseInt(levelKey.replace("level", ""));
          levelData.forEach((employee) => {
            const status = employee.approvalStatus?.[`level${level}`]?.status;
            if (status === "approved") {
              totalApproved++;
            }
          });
        });

        setStats({ totalPending, totalApproved });
      }
    } catch (err) {
      console.error("Failed to fetch approval stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)",
              color: "white",
              boxShadow: "0 8px 24px rgba(255, 152, 0, 0.3)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 32px rgba(255, 152, 0, 0.4)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PendingActionsIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    Pending Approvals
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  {loading ? (
                    <CircularProgress size={40} sx={{ color: "white" }} />
                  ) : (
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "3rem", md: "3.5rem" },
                        lineHeight: 1,
                        textShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {stats.totalPending}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      opacity: 0.95,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    Awaiting your review
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
              color: "white",
              boxShadow: "0 8px 24px rgba(76, 175, 80, 0.3)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 32px rgba(76, 175, 80, 0.4)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    Approved
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  {loading ? (
                    <CircularProgress size={40} sx={{ color: "white" }} />
                  ) : (
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "3rem", md: "3.5rem" },
                        lineHeight: 1,
                        textShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {stats.totalApproved}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      opacity: 0.95,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    Total approved by you
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApproverDashboard;
