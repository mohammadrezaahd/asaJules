'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, Menu, MenuItem, IconButton, Typography, Divider, Chip } from '@mui/material';
import Link from 'next/link';

export default function AvatarMenu() {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!session?.user) return null;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-label="open user menu"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32 }} src={session.user.avatarUrl || undefined} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {session.user.username}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem component={Link} href="/dashboard">
          Dashboard
        </MenuItem>
        <MenuItem component={Link} href="/profile">
          Profile
        </MenuItem>
        <MenuItem component={Link} href="/bookmarks">
          Bookmarks
        </MenuItem>
        <MenuItem component={Link} href="/settings">
          Settings
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <Chip label={session.user.role} size="small" />
        </MenuItem>
        <MenuItem onClick={() => signOut()}>
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}