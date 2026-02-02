import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function BasicInput({ label, value, onChange, type = 'text', ...props }) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      variant="outlined"
      fullWidth
      {...props}
    />
  );
}
