import * as React from "react";
import PropTypes from "prop-types";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

import { inputsCustomizations } from "./customizations/inputs";
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import {
  colorSchemes,
  typography,
  shadows,
  shape,
  neutralColorSchemes,
} from "./themePrimitives";
import { selectColorScheme } from "../../store/slices/themeSlice";

function AppTheme({ children, disableCustomTheme, themeComponents }) {
  const selectedColorScheme = useSelector(selectColorScheme);

  const theme = React.useMemo(() => {
    if (disableCustomTheme) {
      return {};
    }

    // Select the appropriate color scheme based on user preference
    const activeColorSchemes =
      selectedColorScheme === "neutral" ? neutralColorSchemes : colorSchemes;

    return createTheme({
      defaultColorScheme: "light",
      // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
        cssVarPrefix: "template",
      },
      colorSchemes: activeColorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
      typography,
      shadows,
      shape,
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
      },
    });
  }, [disableCustomTheme, themeComponents, selectedColorScheme]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

AppTheme.propTypes = {
  children: PropTypes.node,
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme: PropTypes.bool,
  themeComponents: PropTypes.object,
};

export default AppTheme;
