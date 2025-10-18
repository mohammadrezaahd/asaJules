"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import CategoryAutocomplete from "@/components/Categories/CategoryAutocomplete";
import TagsInput from "@/components/Common/TagsInput";
import { useRouter } from "next/navigation";
import { projectsApi, usersApi } from "@/components/api";
import { ModelViewer } from "@/components/Three";
import { User, MediaFile, ModelConfig } from "@/types";
import { CreateProjectDto } from "@/types/dto/project.dto";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<MediaFile | null>(null);
  const [gallery, setGallery] = useState<MediaFile[]>([]);
  const [model, setModel] = useState<MediaFile | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
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
        const fetchedUsers = await usersApi.getAll();

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

  const handleModelConfigChange = useCallback(
    (config: {
      ambientIntensity?: number;
      directionalIntensity?: number;
      lightColor?: string;
      scale?: number;
      rotation?: [number, number, number];
      position?: [number, number, number];
      backgroundColor?: string;
      materialMode?: "solid" | "wireframe";
      shadows?: boolean;
      cameraMode?: "perspective" | "orthographic";
    }) => {
      setModelConfig({
        position: config.position || [0, 0, 0],
        rotation: config.rotation || [0, 0, 0],
        scale: [config.scale || 1, config.scale || 1, config.scale || 1],
        lighting: {
          ambient: config.ambientIntensity || 0.5,
          directional: config.directionalIntensity || 1,
          color: config.lightColor || "#ffffff",
        },
        materialMode: config.materialMode || "solid",
        backgroundColor: config.backgroundColor || "#f0f0f0",
        shadows: config.shadows ?? true,
        cameraMode: config.cameraMode || "perspective",
      });
    },
    []
  );

  const retryFetchData = () => {
    setDataError(null);
    setDataLoading(true);
    const fetchData = async () => {
      try {
        const fetchedUsers = await usersApi.getAll();

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

    if (categories.length === 0) {
      setError("Please select at least one category");
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
      categories,
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
      tags,
      status,
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

      {users.length === 0 && !dataLoading && !dataError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No users available for contributors. User API may not be working
          properly.
        </Alert>
      )}

      {dataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading users...</Typography>
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

          <Box sx={{ mb: 2 }}>
            <CategoryAutocomplete
              value={categories}
              onChange={setCategories}
              multiple={true}
              label="Categories *"
              placeholder="Search and select categories..."
              error={categories.length === 0}
              helperText={
                categories.length === 0
                  ? "At least one category is required"
                  : `${categories.length} categories selected`
              }
            />
          </Box>

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

          <Box sx={{ mb: 2 }}>
            <TagsInput
              value={tags}
              onChange={setTags}
              label="Tags"
              placeholder="Enter tags and press Enter..."
              maxTags={10}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Draft" | "Published")
              }
              label="Status"
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
            </Select>
          </FormControl>

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
            {gallery.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {gallery.map((item) => (
                  <Typography key={item._id} variant="body2" sx={{ ml: 2 }}>
                    • {item.filename}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleOpenMediaManager("model")}
            >
              Select 3D Model (.glb)
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

              {/* New ExampleApp Component */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  New 3D Viewer (with Position/Rotation/Scale Controls):
                </Typography>
                <ModelViewer
                  modelUrl={model.filepath}
                  initialConfig={{
                    position: modelConfig?.position ?? [0, 0, 0],
                    rotation: modelConfig?.rotation ?? [0, 0, 0],
                    scale: Array.isArray(modelConfig?.scale)
                      ? modelConfig.scale[0] ?? 1
                      : 1,
                    ambientIntensity: modelConfig?.lighting?.ambient ?? 0.5,
                    directionalIntensity:
                      modelConfig?.lighting?.directional ?? 1,
                    lightColor: modelConfig?.lighting?.color ?? "#ffffff",
                    backgroundColor: modelConfig?.backgroundColor ?? "#f0f0f0",
                    materialMode: modelConfig?.materialMode ?? "solid",
                    shadows: modelConfig?.shadows ?? true,
                    cameraMode: modelConfig?.cameraMode ?? "perspective",
                  }}
                  onConfigChange={handleModelConfigChange}
                  isAdmin={true}
                />
              </Box>
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
            mediaType={
              mediaManagerTarget === "model"
                ? "models"
                : mediaManagerTarget === "thumbnail" ||
                  mediaManagerTarget === "gallery"
                ? "images"
                : "all"
            }
            showUpload
          />
        </>
      )}
    </Box>
  );
}
