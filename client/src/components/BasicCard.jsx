import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function BasicCard({ title, children, sx }) {
  return (
    <Card sx={{ minWidth: 275, ...sx }}>
      <CardContent>
        {title && (
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
