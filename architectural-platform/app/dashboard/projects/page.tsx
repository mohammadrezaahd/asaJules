"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { projectsApi } from "@/components/api";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { projects } = await projectsApi.getAll();
      setProjects(projects);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await projectsApi.delete(projectToDelete._id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        fetchProjects();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete project");
      }
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/projects/new"
        >
          Add New Project
        </Button>
      </Box>
      <List>
        {projects?.map((project) => (
          <ListItem
            key={project._id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  component={Link}
                  href={`/dashboard/projects/edit/${project._id}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(project)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={project.title} />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "
            {projectToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
