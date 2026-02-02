import * as React from 'react';
import Divider from '@mui/material/Divider';

export default function BasicDivider({ sx, ...props }) {
  return <Divider sx={sx} {...props} />;
}
