import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { useEffect } from "react";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignIn from "./pages/auth/SignIn";
import Unauthorized from "./pages/auth/Unauthorized";
import RootLayout from "./layout/RootLayout";
import Home from "./pages/home";
import Branches from "./pages/branches";
import Employees from "./pages/employees";
import Approvals from "./pages/approvals";
import Bonuses from "./pages/bonuses";
import store from "./store";
import {
  loadUserFromStorage,
  loginSuccess,
  logout,
} from "./store/slices/userSlice";
import api from "./utils/api";

import {
  chartsCustomizations,
  dataGridCustomizations,
} from "./theme/customizations";
import AppTheme from "./theme/shared/AppTheme";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
};

// Component to initialize Redux on mount
function AppInitializer({ children }) {
  useEffect(() => {
    // Load user from localStorage on app start
    store.dispatch(loadUserFromStorage());

    // Fetch fresh user data from backend if token exists
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/v2/auth/me")
        .then((response) => {
          if (response.data.success && response.data.data) {
            // Update user data with fresh data from backend
            store.dispatch(
              loginSuccess({
                ...response.data.data,
                token: token,
              }),
            );
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          // If token is invalid, logout
          if (error.response?.status === 401) {
            store.dispatch(logout());
          }
        });
    }
  }, []);

  return children;
}

function App(props) {
  return (
    <Provider store={store}>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <AppInitializer>
          <BrowserRouter basename="/PerformanceRewardsPortal">
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<SignIn />} />
              </Route>

              {/* Unauthorized route - accessible to authenticated users */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<RootLayout />}>
                  <Route index element={<Home />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/bonuses" element={<Bonuses />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AppInitializer>
      </AppTheme>
    </Provider>
  );
}

export default App;
