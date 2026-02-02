import { alpha } from "@mui/material/styles";

const createPalette = (brand, secondary, success, error, warning, info) => {
  return {
    brand,
    secondary,
    success: success || {
      50: "hsl(120, 80%, 98%)",
      100: "hsl(120, 75%, 94%)",
      200: "hsl(120, 75%, 87%)",
      300: "hsl(120, 61%, 77%)",
      400: "hsl(120, 44%, 53%)",
      500: "hsl(120, 59%, 30%)",
      600: "hsl(120, 70%, 25%)",
      700: "hsl(120, 75%, 16%)",
      800: "hsl(120, 84%, 10%)",
      900: "hsl(120, 87%, 6%)",
    },
    error: error || {
      50: "hsl(0, 100%, 97%)",
      100: "hsl(0, 92%, 90%)",
      200: "hsl(0, 94%, 80%)",
      300: "hsl(0, 90%, 65%)",
      400: "hsl(0, 90%, 40%)",
      500: "hsl(0, 90%, 30%)",
      600: "hsl(0, 91%, 25%)",
      700: "hsl(0, 94%, 18%)",
      800: "hsl(0, 95%, 12%)",
      900: "hsl(0, 93%, 6%)",
    },
    warning: warning || {
      50: "hsl(45, 100%, 97%)",
      100: "hsl(45, 92%, 90%)",
      200: "hsl(45, 94%, 80%)",
      300: "hsl(45, 90%, 65%)",
      400: "hsl(45, 90%, 40%)",
      500: "hsl(45, 90%, 35%)",
      600: "hsl(45, 91%, 25%)",
      700: "hsl(45, 94%, 20%)",
      800: "hsl(45, 95%, 16%)",
      900: "hsl(45, 93%, 12%)",
    },
    info: info || {
      // Default to brand if not specified/overridden
      ...brand,
    },
  };
};

const gray = {
  50: "hsl(220, 35%, 97%)",
  100: "hsl(220, 30%, 94%)",
  200: "hsl(220, 20%, 88%)",
  300: "hsl(220, 20%, 80%)",
  400: "hsl(220, 20%, 65%)",
  500: "hsl(220, 20%, 42%)",
  600: "hsl(220, 20%, 35%)",
  700: "hsl(220, 20%, 25%)",
  800: "hsl(220, 30%, 6%)",
  900: "hsl(220, 35%, 3%)",
};

const cosmic = createPalette(
  {
    // Deep Blue/Purple
    50: "hsl(225, 60%, 97%)",
    100: "hsl(225, 50%, 92%)",
    200: "hsl(225, 50%, 82%)",
    300: "hsl(225, 50%, 70%)",
    400: "hsl(225, 50%, 55%)",
    500: "hsl(225, 60%, 45%)", // Primary Main
    600: "hsl(225, 65%, 35%)",
    700: "hsl(225, 70%, 25%)",
    800: "hsl(225, 75%, 15%)",
    900: "hsl(225, 80%, 10%)",
  },
  {
    // Vibrant Pink/Magenta secondary
    500: "hsl(320, 70%, 50%)",
  }
);

const nature = createPalette(
  {
    // Earthy Green
    50: "hsl(140, 50%, 97%)",
    100: "hsl(140, 40%, 92%)",
    200: "hsl(140, 40%, 82%)",
    300: "hsl(140, 40%, 70%)",
    400: "hsl(140, 40%, 55%)",
    500: "hsl(140, 50%, 35%)", // Primary Main
    600: "hsl(140, 55%, 30%)",
    700: "hsl(140, 60%, 25%)",
    800: "hsl(140, 65%, 15%)",
    900: "hsl(140, 70%, 10%)",
  },
  {
    // Warm Brown secondary
    500: "hsl(30, 40%, 50%)",
  }
);

const sunset = createPalette(
  {
    // Warm Orange/Coral
    50: "hsl(20, 70%, 97%)",
    100: "hsl(20, 60%, 92%)",
    200: "hsl(20, 60%, 82%)",
    300: "hsl(20, 60%, 70%)",
    400: "hsl(20, 60%, 55%)",
    500: "hsl(20, 70%, 50%)", // Primary Main
    600: "hsl(20, 75%, 40%)",
    700: "hsl(20, 80%, 30%)",
    800: "hsl(20, 85%, 20%)",
    900: "hsl(20, 90%, 15%)",
  },
  {
    // Deep Purple secondary
    500: "hsl(270, 50%, 45%)",
  }
);

const ocean = createPalette(
  {
    // Cyan/Teal
    50: "hsl(190, 60%, 97%)",
    100: "hsl(190, 50%, 92%)",
    200: "hsl(190, 50%, 82%)",
    300: "hsl(190, 50%, 70%)",
    400: "hsl(190, 50%, 55%)",
    500: "hsl(190, 70%, 40%)", // Primary Main
    600: "hsl(190, 75%, 30%)",
    700: "hsl(190, 80%, 25%)",
    800: "hsl(190, 85%, 15%)",
    900: "hsl(190, 90%, 10%)",
  },
  {
    // Bright Blue secondary
    500: "hsl(210, 80%, 55%)",
  }
);

const amethyst = createPalette(
  {
    // Purple/Violet
    50: "hsl(265, 60%, 97%)",
    100: "hsl(265, 50%, 92%)",
    200: "hsl(265, 50%, 82%)",
    300: "hsl(265, 50%, 70%)",
    400: "hsl(265, 50%, 55%)",
    500: "hsl(265, 60%, 50%)", // Primary Main
    600: "hsl(265, 65%, 40%)",
    700: "hsl(265, 70%, 30%)",
    800: "hsl(265, 75%, 20%)",
    900: "hsl(265, 80%, 10%)",
  },
  {
    // Teal secondary
    500: "hsl(170, 70%, 45%)",
  }
);

const generateThemeSchemes = (name, palette, isTinted = true) => {
  return {
    light: {
      palette: {
        primary: {
          ...palette.brand,
          light: palette.brand[200],
          main: palette.brand[500],
          dark: palette.brand[700],
          contrastText: "#ffffff",
        },
        info: {
          ...palette.brand,
          light: palette.brand[100],
          main: palette.brand[300],
          dark: palette.brand[600],
          contrastText: gray[50],
        },
        warning: {
          // Using default warning from createPalette if not overridden
          ...palette.warning,
          light: palette.warning[300],
          main: palette.warning[500],
          dark: palette.warning[700],
        },
        error: {
          // Using default error
          ...palette.error,
          light: palette.error[300],
          main: palette.error[500],
          dark: palette.error[700],
        },
        success: {
          // Using default success
          ...palette.success,
          light: palette.success[300],
          main: palette.success[500],
          dark: palette.success[700],
        },
        grey: gray,
        divider: isTinted
          ? alpha(palette.brand[200], 0.2)
          : alpha(gray[300], 0.4),
        background: {
          default: isTinted ? palette.brand[50] : "hsl(0, 0%, 99%)",
          paper: "#ffffff",
        },
        text: {
          primary: gray[800],
          secondary: gray[600],
        },
        action: {
          hover: alpha(isTinted ? palette.brand[200] : gray[200], 0.2),
          selected: alpha(isTinted ? palette.brand[200] : gray[200], 0.3),
        },
        baseShadow:
          "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
      },
    },
    dark: {
      palette: {
        primary: {
          ...palette.brand,
          light: palette.brand[300],
          main: palette.brand[400],
          dark: palette.brand[700],
          contrastText: palette.brand[50], // Better contrast on dark
        },
        info: {
          ...palette.brand,
          light: palette.brand[500],
          main: palette.brand[700],
          dark: palette.brand[900],
          contrastText: palette.brand[300],
        },
        warning: {
          ...palette.warning,
          light: palette.warning[400],
          main: palette.warning[500],
          dark: palette.warning[700],
        },
        error: {
          ...palette.error,
          light: palette.error[400],
          main: palette.error[500],
          dark: palette.error[700],
        },
        success: {
          ...palette.success,
          light: palette.success[400],
          main: palette.success[500],
          dark: palette.success[700],
        },
        grey: gray,
        divider: isTinted
          ? alpha(palette.brand[200], 0.2)
          : alpha(gray[700], 0.6),
        background: {
          default: isTinted ? palette.brand[900] : gray[900],
          paper: isTinted ? palette.brand[800] : "hsl(220, 30%, 7%)",
        },
        text: {
          primary: "hsl(0, 0%, 100%)",
          secondary: gray[400],
        },
        action: {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        },
        baseShadow:
          "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
      },
    },
  };
};

export const undefinedTheme = generateThemeSchemes("standard", cosmic, false); // Fallback

export const availableThemes = {
  standard: {
    name: "Standard",
    schemes: generateThemeSchemes("standard", cosmic, false),
    primaryColor: cosmic.brand[500],
  },
  cosmic: {
    name: "Cosmic",
    schemes: generateThemeSchemes("cosmic", cosmic),
    primaryColor: cosmic.brand[500],
  },
  nature: {
    name: "Nature",
    schemes: generateThemeSchemes("nature", nature),
    primaryColor: nature.brand[500],
  },
  sunset: {
    name: "Sunset",
    schemes: generateThemeSchemes("sunset", sunset),
    primaryColor: sunset.brand[500],
  },
  ocean: {
    name: "Ocean",
    schemes: generateThemeSchemes("ocean", ocean),
    primaryColor: ocean.brand[500],
  },
  amethyst: {
    name: "Amethyst",
    schemes: generateThemeSchemes("amethyst", amethyst),
    primaryColor: amethyst.brand[500],
  },
};
