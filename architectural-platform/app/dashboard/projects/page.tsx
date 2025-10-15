'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/projects');
      setProjects(res.data.projects);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteClick = (project: any) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await axiosInstance.delete(`/projects/${projectToDelete._id}`);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        fetchProjects();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        {projects.map((project) => (
          <ListItem
            key={project._id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" component={Link} href={`/dashboard/projects/edit/${project._id}`}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(project)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={project.title} secondary={project.category?.name} />
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
            Are you sure you want to delete the project "{projectToDelete?.title}"? This action cannot be undone.
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