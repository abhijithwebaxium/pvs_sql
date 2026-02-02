import { alpha } from '@mui/material/styles';

// Neutral colorful palette - balanced and modern
export const neutralBrand = {
  50: 'hsl(240, 20%, 98%)',
  100: 'hsl(240, 15%, 95%)',
  200: 'hsl(240, 12%, 88%)',
  300: 'hsl(240, 10%, 75%)',
  400: 'hsl(240, 8%, 58%)',
  500: 'hsl(240, 7%, 45%)',
  600: 'hsl(240, 8%, 38%)',
  700: 'hsl(240, 10%, 28%)',
  800: 'hsl(240, 15%, 18%)',
  900: 'hsl(240, 20%, 10%)',
};

export const teal = {
  50: 'hsl(180, 65%, 97%)',
  100: 'hsl(180, 60%, 92%)',
  200: 'hsl(180, 58%, 83%)',
  300: 'hsl(180, 56%, 70%)',
  400: 'hsl(180, 54%, 55%)',
  500: 'hsl(180, 60%, 42%)',
  600: 'hsl(180, 65%, 35%)',
  700: 'hsl(180, 70%, 28%)',
  800: 'hsl(180, 75%, 20%)',
  900: 'hsl(180, 80%, 14%)',
};

export const purple = {
  50: 'hsl(270, 70%, 97%)',
  100: 'hsl(270, 65%, 93%)',
  200: 'hsl(270, 60%, 85%)',
  300: 'hsl(270, 55%, 73%)',
  400: 'hsl(270, 50%, 58%)',
  500: 'hsl(270, 55%, 48%)',
  600: 'hsl(270, 60%, 40%)',
  700: 'hsl(270, 65%, 32%)',
  800: 'hsl(270, 70%, 24%)',
  900: 'hsl(270, 75%, 16%)',
};

export const coral = {
  50: 'hsl(15, 90%, 97%)',
  100: 'hsl(15, 85%, 92%)',
  200: 'hsl(15, 80%, 83%)',
  300: 'hsl(15, 75%, 70%)',
  400: 'hsl(15, 70%, 58%)',
  500: 'hsl(15, 75%, 48%)',
  600: 'hsl(15, 80%, 40%)',
  700: 'hsl(15, 85%, 32%)',
  800: 'hsl(15, 90%, 24%)',
  900: 'hsl(15, 95%, 16%)',
};

export const amber = {
  50: 'hsl(40, 95%, 97%)',
  100: 'hsl(40, 92%, 90%)',
  200: 'hsl(40, 90%, 80%)',
  300: 'hsl(40, 88%, 65%)',
  400: 'hsl(40, 86%, 52%)',
  500: 'hsl(40, 88%, 45%)',
  600: 'hsl(40, 90%, 38%)',
  700: 'hsl(40, 92%, 30%)',
  800: 'hsl(40, 94%, 22%)',
  900: 'hsl(40, 96%, 15%)',
};

export const emerald = {
  50: 'hsl(150, 70%, 97%)',
  100: 'hsl(150, 65%, 92%)',
  200: 'hsl(150, 60%, 83%)',
  300: 'hsl(150, 55%, 68%)',
  400: 'hsl(150, 50%, 50%)',
  500: 'hsl(150, 60%, 40%)',
  600: 'hsl(150, 65%, 32%)',
  700: 'hsl(150, 70%, 25%)',
  800: 'hsl(150, 75%, 18%)',
  900: 'hsl(150, 80%, 12%)',
};

export const neutralGray = {
  50: 'hsl(220, 15%, 98%)',
  100: 'hsl(220, 12%, 95%)',
  200: 'hsl(220, 10%, 90%)',
  300: 'hsl(220, 8%, 78%)',
  400: 'hsl(220, 6%, 62%)',
  500: 'hsl(220, 5%, 48%)',
  600: 'hsl(220, 6%, 38%)',
  700: 'hsl(220, 8%, 28%)',
  800: 'hsl(220, 12%, 18%)',
  900: 'hsl(220, 15%, 10%)',
};

export const neutralColorSchemes = {
  light: {
    palette: {
      primary: {
        light: teal[300],
        main: teal[500],
        dark: teal[700],
        contrastText: '#ffffff',
      },
      secondary: {
        light: purple[300],
        main: purple[500],
        dark: purple[700],
        contrastText: '#ffffff',
      },
      info: {
        light: neutralBrand[200],
        main: neutralBrand[400],
        dark: neutralBrand[700],
        contrastText: '#ffffff',
      },
      warning: {
        light: amber[300],
        main: amber[500],
        dark: amber[700],
        contrastText: neutralGray[900],
      },
      error: {
        light: coral[300],
        main: coral[500],
        dark: coral[700],
        contrastText: '#ffffff',
      },
      success: {
        light: emerald[300],
        main: emerald[500],
        dark: emerald[700],
        contrastText: '#ffffff',
      },
      grey: {
        ...neutralGray,
      },
      divider: alpha(neutralGray[300], 0.5),
      background: {
        default: 'hsl(220, 15%, 99%)',
        paper: 'hsl(220, 12%, 97%)',
      },
      text: {
        primary: neutralGray[900],
        secondary: neutralGray[600],
        disabled: neutralGray[400],
      },
      action: {
        hover: alpha(teal[200], 0.15),
        selected: alpha(teal[300], 0.2),
        disabled: alpha(neutralGray[400], 0.3),
        disabledBackground: alpha(neutralGray[200], 0.12),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.05) 0px 8px 16px -5px',
    },
  },
  dark: {
    palette: {
      primary: {
        light: teal[400],
        main: teal[500],
        dark: teal[600],
        contrastText: '#ffffff',
      },
      secondary: {
        light: purple[400],
        main: purple[500],
        dark: purple[600],
        contrastText: '#ffffff',
      },
      info: {
        light: neutralBrand[400],
        main: neutralBrand[500],
        dark: neutralBrand[600],
        contrastText: '#ffffff',
      },
      warning: {
        light: amber[400],
        main: amber[500],
        dark: amber[600],
        contrastText: neutralGray[900],
      },
      error: {
        light: coral[400],
        main: coral[500],
        dark: coral[600],
        contrastText: '#ffffff',
      },
      success: {
        light: emerald[400],
        main: emerald[500],
        dark: emerald[600],
        contrastText: '#ffffff',
      },
      grey: {
        ...neutralGray,
      },
      divider: alpha(neutralGray[700], 0.6),
      background: {
        default: neutralGray[900],
        paper: 'hsl(220, 15%, 12%)',
      },
      text: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: neutralGray[400],
        disabled: neutralGray[600],
      },
      action: {
        hover: alpha(teal[600], 0.2),
        selected: alpha(teal[500], 0.25),
        disabled: alpha(neutralGray[600], 0.3),
        disabledBackground: alpha(neutralGray[700], 0.12),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
};
