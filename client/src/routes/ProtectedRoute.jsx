import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/userSlice";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // No role-based access control - all authenticated users can access all routes
  return <Outlet />;
};

export default ProtectedRoute;
