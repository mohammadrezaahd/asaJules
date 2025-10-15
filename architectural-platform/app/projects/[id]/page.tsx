'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardMedia, CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import ModelViewer from '@/components/Three/ModelViewer';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/lib/axios';

export default function ProjectDetailPage() {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const params = useParams();
  const projectId = params.id;
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/projects/${projectId}`);
        setProject(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (!project) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {project.title}
      </Typography>
      <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
        {project.category?.name}
      </Typography>
      <img src={project.thumbnail?.path} alt={project.title} style={{ width: '100%', height: 'auto', marginBottom: '2rem' }} />
      <Typography variant="body1" paragraph>
        {project.description}
      </Typography>
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4 }}>
        Gallery
      </Typography>
      <Grid container spacing={2}>
        {project.gallery.map((image: any) => (
          <Grid item key={image._id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={image.path}
                alt="Gallery image"
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4 }}>
        Contributors
      </Typography>
      <ul>
        {project.contributors.map((contributor: any) => (
          <li key={contributor._id}>
            <Typography>{contributor.username}</Typography>
          </li>
        ))}
      </ul>
      <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => setShowModelViewer(true)}>
        Open 3D Model
      </Button>
      {showModelViewer && project.model?.path && (
        <Box sx={{ mt: 4 }}>
          <ModelViewer
            modelUrl={project.model.path}
            initialConfig={project.modelConfig}
            isAdmin={session?.user?.role === 'ADMIN'}
          />
        </Box>
      )}
    </Container>
  );
}