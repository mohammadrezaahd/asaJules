'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AvatarMenu from './AvatarMenu';

const Header = () => {
  const { data: session } = useSession();

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
        {session?.user ? (
          <AvatarMenu />
        ) : (
          <>
            <Button color="inherit" component={Link} href="/auth/login">
              Login
            </Button>
            <Button color="inherit" component={Link} href="/auth/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;