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
  IconButton,
} from "@mui/material";
import { Bookmark, BookmarkBorder } from "@mui/icons-material";
import { useParams } from "next/navigation";
import Image from "next/image";
import { projectsApi, usersApi } from "@/components/api";
import { Project } from "@/types";
import { ModelViewer } from "@/components/Three";
import { useSession } from "next-auth/react";

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    if (session?.user?.id) {
      usersApi.getBookmarks(session.user.id).then((response) => {
        if (response.isSuccess && response.data) {
          setIsBookmarked(response.data.some((p: Project) => p._id === projectId));
        }
      });
    }
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

  const handleBookmark = async () => {
    if (session?.user?.id) {
      if (isBookmarked) {
        await usersApi.removeBookmark(session.user.id, projectId);
      } else {
        await usersApi.addBookmark(session.user.id, projectId);
      }
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {project.title}
        </Typography>
        {session?.user && (
          <IconButton onClick={handleBookmark}>
            {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        )}
      </Box>
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
          <ModelViewer
            modelUrl={project.modelUrl}
            initialConfig={{
              position: project.modelConfig?.position ?? [0, 0, 0],
              rotation: project.modelConfig?.rotation ?? [0, 0, 0],
              scale: Array.isArray(project.modelConfig?.scale)
                ? project.modelConfig.scale[0] ?? 1
                : 1,
              ambientIntensity: project.modelConfig?.lighting?.ambient ?? 0.5,
              directionalIntensity:
                project.modelConfig?.lighting?.directional ?? 1,
              lightColor: project.modelConfig?.lighting?.color ?? "#ffffff",
              backgroundColor:
                project.modelConfig?.backgroundColor ?? "#f0f0f0",
              materialMode: project.modelConfig?.materialMode ?? "solid",
              shadows: project.modelConfig?.shadows ?? true,
              cameraMode: project.modelConfig?.cameraMode ?? "perspective",
            }}
            isAdmin={false} // Always false for public view
          />
        </Box>
      )}
    </Container>
  );
}
