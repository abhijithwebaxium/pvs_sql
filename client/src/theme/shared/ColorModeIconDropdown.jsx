import * as React from 'react';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { useColorScheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { selectColorScheme, setColorScheme } from '../../store/slices/themeSlice';

export default function ColorModeIconDropdown() {
  const { mode, systemMode, setMode } = useColorScheme();
  const dispatch = useDispatch();
  const currentColorScheme = useSelector(selectColorScheme);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMode = (targetMode) => () => {
    setMode(targetMode);
  };

  const handleColorScheme = (scheme) => () => {
    dispatch(setColorScheme(scheme));
  };

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          verticalAlign: 'bottom',
          display: 'inline-flex',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }

  const resolvedMode = systemMode || mode;
  const icon = {
    light: <LightModeIcon />,
    dark: <DarkModeIcon />,
  }[resolvedMode];

  return (
    <React.Fragment>
      <IconButton
        data-screenshot="toggle-mode"
        onClick={handleClick}
        disableRipple
        size="small"
        aria-controls={open ? 'color-scheme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            variant: 'outlined',
            elevation: 0,
            sx: {
              my: '4px',
              minWidth: 180,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Theme Mode
          </Typography>
        </Box>
        <MenuItem selected={mode === 'system'} onClick={handleMode('system')}>
          <ListItemText>System</ListItemText>
          {mode === 'system' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem selected={mode === 'light'} onClick={handleMode('light')}>
          <ListItemText>Light</ListItemText>
          {mode === 'light' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={handleMode('dark')}>
          <ListItemText>Dark</ListItemText>
          {mode === 'dark' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Color Scheme
          </Typography>
        </Box>
        <MenuItem
          selected={currentColorScheme === 'default'}
          onClick={handleColorScheme('default')}
        >
          <ListItemIcon>
            <PaletteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Default Blue</ListItemText>
          {currentColorScheme === 'default' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem
          selected={currentColorScheme === 'neutral'}
          onClick={handleColorScheme('neutral')}
        >
          <ListItemIcon>
            <PaletteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Neutral Colorful</ListItemText>
          {currentColorScheme === 'neutral' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}