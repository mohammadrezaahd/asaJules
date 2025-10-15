'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { IProject } from '@/models/Project';
import Link from 'next/link';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
        Projects
      </Typography>
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <Link href={`/projects/${project._id}`} passHref style={{ textDecoration: 'none' }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={project.thumbnail}
                  alt={project.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {project.name}
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
    </Container>
  );
};

export default ProjectsPage;