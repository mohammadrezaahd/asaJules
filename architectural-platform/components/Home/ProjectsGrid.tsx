'use client';

import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Pagination, Box } from '@mui/material';
import Link from 'next/link';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch(`/api/projects?page=${page}`);
      const data = await res.json();
      setProjects(data.projects);
      setTotalPages(data.totalPages);
    };
    fetchProjects();
  }, [page]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Featured Projects
      </Typography>
      <Grid container spacing={4}>
        {projects.map((project: any) => (
          <Grid item key={project._id} xs={12} sm={6} md={4}>
            <Link href={`/projects/${project._id}`} passHref style={{ textDecoration: 'none' }}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={project.thumbnail?.path || 'https://via.placeholder.com/300'}
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
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPages} page={page} onChange={handleChange} color="primary" />
      </Box>
    </Box>
  );
}