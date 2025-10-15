'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            <span style={{ color: 'white', textDecoration: 'none' }}>3DArch</span>
          </Link>
        </Typography>
        <Button color="inherit" component={Link} href="/projects">
          Projects
        </Button>
        <Button color="inherit" component={Link} href="/articles">
          Articles
        </Button>
        <Button color="inherit" component={Link} href="/login">
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;