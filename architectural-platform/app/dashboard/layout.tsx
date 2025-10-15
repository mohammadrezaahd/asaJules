'use client';

import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Inbox as InboxIcon, Mail as MailIcon } from '@mui/icons-material';
import Link from 'next/link';

const drawerWidth = 240;

import { PhotoLibrary as PhotoLibraryIcon } from '@mui/icons-material';

const dashboardLinks = [
  { text: 'Users', href: '/dashboard/users', icon: <InboxIcon /> },
  { text: 'Projects', href: '/dashboard/projects', icon: <MailIcon /> },
  { text: 'Articles', href: '/dashboard/articles', icon: <InboxIcon /> },
  { text: 'Categories', href: '/dashboard/categories', icon: <MailIcon /> },
  { text: 'Media', href: '/dashboard/media', icon: <PhotoLibraryIcon /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {dashboardLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton component={Link} href={link.href}>
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}