import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export default function CardAlert() {
  return (
    <Card variant="outlined" sx={{ m: 1.5, p: 1.5 }}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Need Help?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Contact support or check our documentation for assistance.
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="text" size="small" fullWidth>
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
