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
import axiosInstance from "@/lib/axios";
import ModelViewer from "@/components/Three/ModelViewer";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [model, setModel] = useState<any>(null);
  const [modelConfig, setModelConfig] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("Draft");
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [mediaManagerTarget, setMediaManagerTarget] = useState<
    "thumbnail" | "gallery" | "model" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          axiosInstance.get("/categories").catch((err) => {
            console.error("Categories API error:", err);
            return { data: { categories: [] } };
          }),
          axiosInstance.get("/users").catch((err) => {
            console.error("Users API error:", err);
            return { data: { users: [] } };
          }),
        ]);
        setCategories(categoriesRes.data.categories || []);
        setUsers(usersRes.data.users || []);
      } catch (err: any) {
        console.error("General fetch error:", err);
        const errorMessage = `Failed to fetch data: ${
          err.response?.status === 404
            ? "API endpoints not found"
            : err.message || "Unknown error"
        }`;
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
        const [categoriesRes, usersRes] = await Promise.all([
          axiosInstance.get("/categories").catch((err) => {
            console.error("Categories API error:", err);
            return { data: { categories: [] } };
          }),
          axiosInstance.get("/users").catch((err) => {
            console.error("Users API error:", err);
            return { data: { users: [] } };
          }),
        ]);
        setCategories(categoriesRes.data.categories || []);
        setUsers(usersRes.data.users || []);
      } catch (err: any) {
        console.error("General fetch error:", err);
        const errorMessage = `Failed to fetch data: ${
          err.response?.status === 404
            ? "API endpoints not found"
            : err.message || "Unknown error"
        }`;
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

  const handleSelectMedia = (selectedMedia: any[]) => {
    if (mediaManagerTarget === "thumbnail") {
      setThumbnail(selectedMedia[0]);
    } else if (mediaManagerTarget === "gallery") {
      setGallery(selectedMedia);
    } else if (mediaManagerTarget === "model") {
      setModel(selectedMedia[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
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

    const projectData = {
      title,
      category: category || null, // Allow null if no categories available
      description,
      thumbnail: thumbnail?._id,
      gallery: gallery.map((item) => item._id),
      model: model?._id,
      modelConfig,
      contributors,
      tags,
      status,
    };

    try {
      await axiosInstance.post("/projects", projectData);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Add New Project
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categories.length === 0}
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
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              label="Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            <Button onClick={handleAddTag} sx={{ ml: 1 }}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleOpenMediaManager("thumbnail")}
            >
              Select Thumbnail
            </Button>
            {thumbnail && (
              <Typography sx={{ ml: 2, display: "inline" }}>
                {thumbnail.name}
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
              <Typography key={item.id} sx={{ ml: 2, display: "inline" }}>
                {item.name}
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
                {model.name}
              </Typography>
            )}
          </Box>
          {model && (
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                3D Model Preview
              </Typography>
              <ModelViewer
                modelUrl={model.path}
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create Project"}
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
