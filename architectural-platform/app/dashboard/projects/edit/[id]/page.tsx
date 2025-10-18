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
import { useParams, useRouter } from "next/navigation";
import { projectsApi, usersApi } from "@/components/api";
import { ModelViewer } from "@/components/Three";
import { User, MediaFile, ModelConfig } from "@/types";
import { UpdateProjectDto } from "@/types/dto/project.dto";

export default function EditProjectPage() {
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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

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

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [fetchedProject, fetchedUsers] = await Promise.all([
          projectsApi.getById(projectId),
          usersApi.getAll(),
        ]);

        if (fetchedProject.isSuccess && fetchedProject.data) {
          const project = fetchedProject.data;
          setTitle(project.title);

          // Handle categories - they might be populated objects or just IDs
          const categoryIds =
            project.categories?.map((cat: string | { _id: string }) =>
              typeof cat === "string" ? cat : cat._id
            ) || [];
          setCategories(categoryIds);

          setDescription(project.description);
          setModelConfig(project.modelConfig || null);
          setContributors(project.contributors.map((c) => c._id));
          setTags(project.tags || []);
          setStatus(project.status || "Draft");

          // Set media files (create minimal MediaFile objects for display)
          if (project.thumbnail) {
            setThumbnail({
              _id: "thumbnail-" + project._id,
              filename: project.thumbnail.split("/").pop() || "thumbnail",
              filepath: project.thumbnail,
              mimetype: "image/jpeg",
              size: 0,
              uploadedBy: {
                _id: "",
                username: "",
                email: "",
                role: "USER" as const,
                name: "",
                surname: "",
                avatar: "",
                bookmarks: { projects: [], articles: [] },
                createdAt: "",
                updatedAt: "",
              },
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
            } as MediaFile);
          }

          if (project.gallery && project.gallery.length > 0) {
            const galleryFiles = project.gallery.map(
              (path, index) =>
                ({
                  _id: "gallery-" + project._id + "-" + index,
                  filename: path.split("/").pop() || "gallery-image",
                  filepath: path,
                  mimetype: "image/jpeg",
                  size: 0,
                  uploadedBy: {
                    _id: "",
                    username: "",
                    email: "",
                    role: "USER" as const,
                    name: "",
                    surname: "",
                    avatar: "",
                    bookmarks: { projects: [], articles: [] },
                    createdAt: "",
                    updatedAt: "",
                  },
                  createdAt: project.createdAt,
                  updatedAt: project.updatedAt,
                } as MediaFile)
            );
            setGallery(galleryFiles);
          }

          if (project.modelUrl) {
            setModel({
              _id: "model-" + project._id,
              filename: project.modelUrl.split("/").pop() || "model",
              filepath: project.modelUrl,
              mimetype: "model/gltf-binary",
              size: 0,
              uploadedBy: {
                _id: "",
                username: "",
                email: "",
                role: "USER" as const,
                name: "",
                surname: "",
                avatar: "",
                bookmarks: { projects: [], articles: [] },
                createdAt: "",
                updatedAt: "",
              },
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
            } as MediaFile);
          }
        }

        if (fetchedUsers.isSuccess && fetchedUsers.data) {
          setUsers(fetchedUsers.data);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch project data";
        setError(errorMessage);
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

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

    const projectData: UpdateProjectDto = {
      title,
      categories,
      description,
      thumbnail: thumbnail?.filepath,
      gallery: gallery.map((item) => item.filepath),
      modelUrl: model?.filepath,
      modelConfig: modelConfig!,
      contributors,
      tags,
      status,
    };

    try {
      await projectsApi.update(projectId, projectData);
      router.push("/dashboard/projects");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await projectsApi.delete(projectId);
      router.push("/dashboard/projects");
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
        Edit Project
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {fetchLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
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

          {/* Categories Autocomplete */}
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

          {/* Tags Input */}
          <Box sx={{ mb: 2 }}>
            <TagsInput
              value={tags}
              onChange={setTags}
              label="Tags"
              placeholder="Enter tags and press Enter..."
              maxTags={10}
            />
          </Box>

          {/* Status Selection */}
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
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={users.find((user) => user._id === value)?.username}
                    />
                  ))}
                </Box>
              )}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.username}
                </MenuItem>
              ))}
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
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? <CircularProgress size={24} /> : "Delete Project"}
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
