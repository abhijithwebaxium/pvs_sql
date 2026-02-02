import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/loginSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['user.timestamp'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
