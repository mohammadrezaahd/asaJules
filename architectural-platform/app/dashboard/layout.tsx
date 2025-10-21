"use client";

import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Group,
  Inbox as InboxIcon,
  Mail as MailIcon,
  Menu as MenuIcon,
  Person2,
  PhotoLibrary as PhotoLibraryIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useSession } from "next-auth/react";

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  const dashboardLinks = [
    { text: "Profile", href: `/dashboard/profile/${session?.user?.id || ''}`, icon: <Person2 /> },
    { text: "Users", href: "/dashboard/users", icon: <Group /> },
    { text: "Projects", href: "/dashboard/projects", icon: <MailIcon /> },
    { text: "Articles", href: "/dashboard/articles", icon: <InboxIcon /> },
    { text: "Categories", href: "/dashboard/categories", icon: <MailIcon /> },
    { text: "Media", href: "/dashboard/media", icon: <PhotoLibraryIcon /> },
  ];

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: currentDrawerWidth,
            boxSizing: "border-box",
            transition: "width 0.3s ease-in-out",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar>
          <IconButton
            onClick={handleToggle}
            sx={{
              marginLeft: "auto",
              marginRight: isCollapsed ? "auto" : 0,
              padding: 0,
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Box sx={{ overflow: "auto" }}>
          <List>
            {dashboardLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <Tooltip title={isCollapsed ? link.text : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    href={link.href}
                    sx={{
                      minHeight: 48,
                      justifyContent: isCollapsed ? "center" : "initial",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 3,
                        justifyContent: "center",
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={link.text} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s ease-in-out",
          marginLeft: 0,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
