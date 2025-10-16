"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import MediaManager from "@/components/MediaManager/MediaManager";
import { useRouter } from "next/navigation";
import { projectsApi, categoriesApi, usersApi } from "@/components/api";
import ModelViewer from "@/components/Three/ModelViewer";
import { Category, User, MediaFile, ModelConfig } from "@/types";
import { CreateProjectDto } from "@/types/dto/project.dto";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<MediaFile | null>(null);
  const [gallery, setGallery] = useState<MediaFile[]>([]);
  const [model, setModel] = useState<MediaFile | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [mediaManagerTarget, setMediaManagerTarget] = useState<
    "thumbnail" | "gallery" | "model" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [fetchedCategories, fetchedUsers] = await Promise.all([
          categoriesApi.getAll(),
          usersApi.getAll(),
        ]);

        if (fetchedCategories.isSuccess && fetchedCategories.data) {
          setCategories(fetchedCategories.data);
        }

        if (fetchedUsers.isSuccess && fetchedUsers.data) {
          setUsers(fetchedUsers.data);
        }
      } catch (err: unknown) {
        console.error("General fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setDataError(errorMessage);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const retryFetchData = () => {
    setDataError(null);
    setDataLoading(true);
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedUsers] = await Promise.all([
          categoriesApi.getAll(),
          usersApi.getAll(),
        ]);

        if (fetchedCategories.isSuccess && fetchedCategories.data) {
          setCategories(fetchedCategories.data);
        }

        if (fetchedUsers.isSuccess && fetchedUsers.data) {
          setUsers(fetchedUsers.data);
        }
      } catch (err: unknown) {
        console.error("General fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setDataError(errorMessage);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  };

  const handleOpenMediaManager = (
    target: "thumbnail" | "gallery" | "model"
  ) => {
    setMediaManagerTarget(target);
    setMediaManagerOpen(true);
  };

  const handleSelectMedia = (selectedMedia: MediaFile[]) => {
    if (mediaManagerTarget === "thumbnail") {
      setThumbnail(selectedMedia[0]);
    } else if (mediaManagerTarget === "gallery") {
      setGallery(selectedMedia);
    } else if (mediaManagerTarget === "model") {
      setModel(selectedMedia[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Project title is required");
      setLoading(false);
      return;
    }

    if (!category && categories.length > 0) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Project description is required");
      setLoading(false);
      return;
    }

    const projectData: CreateProjectDto = {
      title,
      category: category || "",
      description,
      thumbnail: thumbnail?.filepath || "",
      gallery: gallery.map((item) => item.filepath),
      modelUrl: model?.filepath || "",
      modelConfig: modelConfig || {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lighting: {
          ambient: 0.5,
          directional: 0.5,
          color: "#ffffff",
        },
      },
      contributors,
    };

    try {
      const result = await projectsApi.create(projectData);
      if (result.isSuccess) {
        setSuccess("Project created successfully!");
        setTimeout(() => {
          router.push("/dashboard/projects");
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Add New Project
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {dataError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={retryFetchData}>
              Retry
            </Button>
          }
        >
          {dataError}
        </Alert>
      )}

      {categories.length === 0 && !dataLoading && !dataError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No categories available. Some API endpoints may not be working
          properly.
        </Alert>
      )}

      {users.length === 0 && !dataLoading && !dataError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No users available for contributors. User API may not be working
          properly.
        </Alert>
      )}

      {dataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            Loading categories and users...
          </Typography>
        </Box>
      ) : (
        <>
          <TextField
            label="Project Title"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            error={!title.trim() && title.length > 0}
            helperText={
              !title.trim() && title.length > 0 ? "Title is required" : ""
            }
          />
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Category *</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categories.length === 0}
              error={!category && categories.length > 0}
            >
              {categories.length === 0 ? (
                <MenuItem value="" disabled>
                  No categories available
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
            error={!description.trim() && description.length > 0}
            helperText={
              !description.trim() && description.length > 0
                ? "Description is required"
                : ""
            }
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Contributors</InputLabel>
            <Select
              multiple
              value={contributors}
              onChange={(e) => setContributors(e.target.value as string[])}
              disabled={users.length === 0}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={
                        users.find((user) => user._id === value)?.username ||
                        "Unknown User"
                      }
                    />
                  ))}
                </Box>
              )}
            >
              {users.length === 0 ? (
                <MenuItem value="" disabled>
                  No users available
                </MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleOpenMediaManager("thumbnail")}
            >
              Select Thumbnail
            </Button>
            {thumbnail && (
              <Typography sx={{ ml: 2, display: "inline" }}>
                {thumbnail.filename}
              </Typography>
            )}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleOpenMediaManager("gallery")}
            >
              Select Gallery Images
            </Button>
            {gallery.map((item) => (
              <Typography key={item._id} sx={{ ml: 2, display: "inline" }}>
                {item.filename}
              </Typography>
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleOpenMediaManager("model")}
            >
              Select 3D Model
            </Button>
            {model && (
              <Typography sx={{ ml: 2, display: "inline" }}>
                {model.filename}
              </Typography>
            )}
          </Box>
          {model && (
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                3D Model Preview
              </Typography>
              <ModelViewer
                modelUrl={model.filepath}
                initialConfig={modelConfig}
                onSave={setModelConfig}
                isAdmin
              />
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || success !== null}
            size="large"
            sx={{ mt: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : success ? (
              "Redirecting..."
            ) : (
              "Create Project"
            )}
          </Button>
          <MediaManager
            open={mediaManagerOpen}
            onClose={() => setMediaManagerOpen(false)}
            onSelect={handleSelectMedia}
            multiple={mediaManagerTarget === "gallery"}
          />
        </>
      )}
    </Box>
  );
}
