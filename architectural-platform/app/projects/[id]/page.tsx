"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "next/navigation";
import Image from "next/image";
import ModelViewer from "@/components/Three/ModelViewer";
import { projectsApi } from "@/components/api";
import { Project } from "@/types";
import ExampleApp from "@/components/Three/Example/App";

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProject = await projectsApi.getById(projectId);
        if (fetchedProject.isSuccess && fetchedProject.data) {
          setProject(fetchedProject.data);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch project";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 8, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning">Project not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {project.title}
      </Typography>
      {project.thumbnail && (
        <Box
          sx={{ position: "relative", width: "100%", height: "400px", mb: 4 }}
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}
      <Typography variant="body1" paragraph>
        {project.description}
      </Typography>
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4 }}>
        Gallery
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
        }}
      >
        {project.gallery &&
          project.gallery.map((imageUrl: string, index: number) => (
            <Card key={index}>
              <CardMedia
                component="img"
                height="200"
                image={imageUrl}
                alt={`Gallery image ${index + 1}`}
              />
            </Card>
          ))}
      </Box>
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4 }}>
        Contributors
      </Typography>
      {project.contributors && project.contributors.length > 0 ? (
        <ul>
          {project.contributors.map((contributor) => (
            <li key={contributor._id}>
              <Typography>{contributor.username}</Typography>
            </li>
          ))}
        </ul>
      ) : (
        <Typography>No contributors listed.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={() => setShowModelViewer(true)}
      >
        Open 3D Model
      </Button>
      {showModelViewer && project.modelUrl && (
        <Box sx={{ mt: 4 }}>
          {/* <ModelViewer
            modelUrl={project.modelUrl}
            initialConfig={{
              ambientIntensity: project.modelConfig?.lighting?.ambient ?? 0.5,
              directionalIntensity: project.modelConfig?.lighting?.directional ?? 1,
              lightColor: project.modelConfig?.lighting?.color ?? '#ffffff',
              scale: Array.isArray(project.modelConfig?.scale) ? project.modelConfig.scale[0] ?? 1 : (typeof project.modelConfig?.scale === 'number' ? project.modelConfig.scale : 1),
              rotation: project.modelConfig?.rotation ?? [0, 0, 0],
              position: project.modelConfig?.position ?? [0, 0, 0],
              backgroundColor: project.modelConfig?.backgroundColor ?? '#f0f0f0',
              materialMode: project.modelConfig?.materialMode ?? 'solid',
              shadows: project.modelConfig?.shadows ?? true,
              cameraMode: project.modelConfig?.cameraMode ?? 'perspective'
            }}
            onSave={() => {}} // Empty function for view-only mode
            isAdmin={false} // Always false for public view
            showToolbar={true} // Show minimal toolbar
          /> */}
          <ExampleApp />
        </Box>
      )}
    </Container>
  );
}
