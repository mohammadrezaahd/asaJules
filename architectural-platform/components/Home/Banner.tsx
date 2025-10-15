'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function Banner() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 12 }}>
      <Container maxWidth="md">
        <Typography component="h1" variant="h2" align="center" gutterBottom>
          Architectural Visualization Platform
        </Typography>
        <Typography variant="h5" align="center" paragraph>
          Explore, share, and collaborate on 3D architectural models and designs.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="secondary" component={Link} href="/projects">
            Explore Projects
          </Button>
        </Box>
      </Container>
    </Box>
  );
}