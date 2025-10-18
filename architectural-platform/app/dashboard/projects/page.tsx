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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { projectsApi } from "@/components/api";
import { Project, ProjectQueryParams, PaginationInfo } from "@/types";
import { ProjectFilters } from "@/components/Projects";
import PaginationControls from "@/components/Common/PaginationControls";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectQueryParams>({
    page: 1,
    limit: 12,
    status: undefined, // Show all projects in dashboard
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  const fetchProjects = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.getAll(filters);
      if (result.isSuccess && result.data) {
        setProjects(result.data);
        setPagination({
          totalItems: result.pagination?.totalItems || 0,
          totalPages: result.pagination?.totalPages || 1,
          currentPage: result.pagination?.currentPage || 1,
          itemsPerPage: result.pagination?.itemsPerPage || 12,
        });
      } else {
        setError(result.error || "Failed to fetch projects");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete project";
        setError(errorMessage);
      }
    }
  };

  const handleFiltersChange = (newFilters: ProjectQueryParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: itemsPerPage, page: 1 }));
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <ProjectFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalItems={pagination.totalItems}
        showStatusFilter={true}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
              <ListItemText
                primary={project.title}
                secondary={`Status: ${project.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="projects"
        showItemsInfo={true}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project &quot;
            {projectToDelete?.title}&quot;? This action cannot be undone.
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
