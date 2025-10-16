'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Card, CardContent, Typography, CardMedia, Pagination, TextField, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { projectsApi, categoriesApi } from '@/components/api';
import { Project, Category } from '@/types';

export default function ProjectsArchivePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesApi.getAll();
        if (fetchedCategories.isSuccess && fetchedCategories.data){
          const data = fetchedCategories.data;
          setCategories(data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMessage);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await projectsApi.getAll({ page, category, search: searchTerm });
        if (response.isSuccess && response.data) {
          setProjects(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [page, category, searchTerm]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 4 }}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`} passHref style={{ textDecoration: 'none' }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={project.thumbnailUrl || 'https://via.placeholder.com/300'}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
    </Container>
  );
}