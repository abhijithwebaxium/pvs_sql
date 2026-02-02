import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  colorScheme: 'default', // 'default' or 'neutral'
  mode: 'light', // 'light', 'dark', or 'system'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
      localStorage.setItem('colorScheme', action.payload);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    loadThemeFromStorage: (state) => {
      const storedColorScheme = localStorage.getItem('colorScheme');
      const storedMode = localStorage.getItem('themeMode');

      if (storedColorScheme) {
        state.colorScheme = storedColorScheme;
      }
      if (storedMode) {
        state.mode = storedMode;
      }
    },
  },
});

export const { setColorScheme, setMode, loadThemeFromStorage } = themeSlice.actions;

export default themeSlice.reducer;

// Selectors
export const selectColorScheme = (state) => state.theme.colorScheme;
export const selectThemeMode = (state) => state.theme.mode;
