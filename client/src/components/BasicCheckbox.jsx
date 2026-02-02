import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function BasicCheckbox({ label, checked, onChange, ...props }) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          {...props}
        />
      }
      label={label}
    />
  );
}
