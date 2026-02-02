import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { useEffect } from "react";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Unauthorized from "./pages/auth/Unauthorized";
import RootLayout from "./layout/RootLayout";
import Home from "./pages/home";
import Branches from "./pages/branches";
import Employees from "./pages/employees";
import Approvals from "./pages/approvals";
import Bonuses from "./pages/bonuses";
import store from "./store";
import { loadUserFromStorage } from "./store/slices/userSlice";

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
  }, []);

  return children;
}

function App(props) {
  return (
    <Provider store={store}>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <AppInitializer>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
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
