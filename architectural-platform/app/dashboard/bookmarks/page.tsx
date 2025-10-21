"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { usersApi } from "@/components/api";
import { Project } from "@/types";
import Link from "next/link";

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (session?.user?.id) {
        try {
          const response = await usersApi.getBookmarks(session.user.id);
          if (response.isSuccess && response.data) {
            setBookmarks(response.data);
          } else {
            setError(response.error || "Failed to fetch bookmarks");
          }
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch bookmarks";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookmarks();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        My Bookmarks
      </Typography>
      {bookmarks.length > 0 ? (
        <List>
          {bookmarks.map((project) => (
            <ListItem key={project._id} disablePadding>
              <ListItemButton component={Link} href={`/projects/${project._id}`}>
                <ListItemText
                  primary={project.title}
                  secondary={project.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>You have no bookmarked projects.</Typography>
      )}
    </Box>
  );
}
