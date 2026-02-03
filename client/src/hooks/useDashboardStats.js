import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";
import api from "../utils/api";

const useDashboardStats = () => {
  const [stats, setStats] = useState({
    staffCount: 0,
    branchCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user from Redux to access token
  const user = useSelector(selectUser);
  // Fallback to localStorage if Redux state is not yet populated (though it should be)
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employees and branches in parallel
        const [employeesResponse, branchesResponse] = await Promise.all([
          api.get("/v2/employees"),
          api.get("/v2/branches"),
        ]);

        setStats({
          staffCount: employeesResponse.data.count || 0,
          branchCount: branchesResponse.data.count || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard statistics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { ...stats, loading, error };
};

export default useDashboardStats;
