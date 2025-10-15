'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, CardMedia, Pagination, TextField, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
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
        setCategories(fetchedCategories);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const { projects, totalPages } = await projectsApi.getAll({ page, category, search: searchTerm });
        setProjects(projects);
        setTotalPages(totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch projects');
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
        <Grid container spacing={4}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <Grid item key={project._id} xs={12} sm={6} md={4}>
                <Link href={`/projects/${project._id}`} passHref style={{ textDecoration: 'none' }}>
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
              </Grid>
            ))
          ) : (
            <Typography>No projects found.</Typography>
          )}
        </Grid>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
    </Container>
  );
}