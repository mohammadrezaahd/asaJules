'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert, Chip } from '@mui/material';
import MediaManager from '@/components/MediaManager/MediaManager';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, categoriesApi, usersApi } from '@/components/api';
import ModelViewer from '@/components/Three/ModelViewer';
import { Category, User, MediaFile, ModelConfig, Project } from '@/types';
import { UpdateProjectDto } from '@/types/dto/project.dto';

export default function EditProjectPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<MediaFile | null>(null);
  const [gallery, setGallery] = useState<MediaFile[]>([]);
  const [model, setModel] = useState<MediaFile | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [mediaManagerTarget, setMediaManagerTarget] = useState<'thumbnail' | 'gallery' | 'model' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProject, fetchedCategories, fetchedUsers] = await Promise.all([
          projectsApi.getById(projectId),
          categoriesApi.getAll(),
          usersApi.getAll(),
        ]);
        setTitle(fetchedProject.title);
        setCategory(fetchedProject.category);
        setDescription(fetchedProject.description);
        setModelConfig(fetchedProject.modelConfig || null);
        setContributors(fetchedProject.contributors.map((c) => c._id));
        setCategories(fetchedCategories);
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to fetch project data');
        console.error(err);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleOpenMediaManager = (target: 'thumbnail' | 'gallery' | 'model') => {
    setMediaManagerTarget(target);
    setMediaManagerOpen(true);
  };

  const handleSelectMedia = (selectedMedia: MediaFile[]) => {
    if (mediaManagerTarget === 'thumbnail') {
      setThumbnail(selectedMedia[0]);
    } else if (mediaManagerTarget === 'gallery') {
      setGallery(selectedMedia);
    } else if (mediaManagerTarget === 'model') {
      setModel(selectedMedia[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const projectData: UpdateProjectDto = {
      title,
      category,
      description,
      thumbnailUrl: thumbnail?.filepath,
      gallery: gallery.map((item) => item.filepath),
      modelUrl: model?.filepath,
      modelConfig: modelConfig!,
      contributors,
    };

    try {
      await projectsApi.update(projectId, projectData);
      router.push('/dashboard/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await projectsApi.delete(projectId);
      router.push('/dashboard/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Edit Project
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
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
        >
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
          ))}
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
        <InputLabel>Contributors</InputLabel>
        <Select
          multiple
          value={contributors}
          onChange={(e) => setContributors(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={users.find((user) => user._id === value)?.username} />
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
        <Button variant="outlined" onClick={() => handleOpenMediaManager('thumbnail')}>
          Select Thumbnail
        </Button>
        {thumbnail && <Typography sx={{ ml: 2, display: 'inline' }}>{thumbnail.filename}</Typography>}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleOpenMediaManager('gallery')}>
          Select Gallery Images
        </Button>
        {gallery.map((item) => (
          <Typography key={item._id} sx={{ ml: 2, display: 'inline' }}>{item.filename}</Typography>
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleOpenMediaManager('model')}>
          Select 3D Model
        </Button>
        {model && <Typography sx={{ ml: 2, display: 'inline' }}>{model.filename}</Typography>}
      </Box>
      {model && (
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>3D Model Preview</Typography>
          <ModelViewer
            modelUrl={model.filepath}
            initialConfig={modelConfig}
            onSave={setModelConfig}
            isAdmin
          />
        </Box>
      )}
      <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mr: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
      </Button>
      <Button variant="contained" color="error" disabled={loading} onClick={handleDelete}>
        {loading ? <CircularProgress size={24} /> : 'Delete Project'}
      </Button>
      <MediaManager
        open={mediaManagerOpen}
        onClose={() => setMediaManagerOpen(false)}
        onSelect={handleSelectMedia}
        multiple={mediaManagerTarget === 'gallery'}
      />
    </Box>
  );
}