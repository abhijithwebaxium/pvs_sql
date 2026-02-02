import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;

      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    loadUserFromStorage: (state) => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          state.user = JSON.parse(storedUser);
          state.isAuthenticated = true;
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  loadUserFromStorage,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
