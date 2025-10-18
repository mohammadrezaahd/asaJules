'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Card, CardContent, Typography, CardMedia, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { projectsApi } from '@/components/api';
import { Project, ProjectQueryParams, PaginationInfo } from '@/types';
import { ProjectFilters } from '@/components/Projects';
import PaginationControls from '@/components/Common/PaginationControls';

export default function ProjectsArchivePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectQueryParams>({
    page: 1,
    limit: 12,
    status: 'Published', // Only show published projects in public archive
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
      </Typography>
      
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
        showStatusFilter={false} // Don't show status filter in public archive
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 4 }}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`} passHref style={{ textDecoration: 'none' }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={project.thumbnail || 'https://via.placeholder.com/300'}
                    alt={project.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Typography>No projects found.</Typography>
          )}
        </Box>
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="projects"
      />
    </Container>
  );
}