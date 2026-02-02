import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/userSlice";

const PublicRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If user is authenticated, redirect to home page
  // Otherwise, show the public route (login/signup)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
