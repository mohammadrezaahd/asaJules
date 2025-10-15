'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert, Chip } from '@mui/material';
import MediaManager from '@/components/MediaManager/MediaManager';
import { useParams, useRouter } from 'next/navigation';

export default function EditProjectPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [model, setModel] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('Draft');
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [mediaManagerTarget, setMediaManagerTarget] = useState<'thumbnail' | 'gallery' | 'model' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.id;
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      setTitle(data.title);
      setCategory(data.category._id);
      setDescription(data.description);
      setThumbnail(data.thumbnail);
      setGallery(data.gallery);
      setModel(data.model);
      setContributors(data.contributors.map((c: any) => c._id));
      setTags(data.tags);
      setStatus(data.status);
    };

    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories);
    };

    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users);
    };

    if (projectId) {
      fetchProject();
      fetchCategories();
      fetchUsers();
    }
  }, [projectId]);

  const handleOpenMediaManager = (target: 'thumbnail' | 'gallery' | 'model') => {
    setMediaManagerTarget(target);
    setMediaManagerOpen(true);
  };

  const handleSelectMedia = (selectedMedia: any[]) => {
    if (mediaManagerTarget === 'thumbnail') {
      setThumbnail(selectedMedia[0]);
    } else if (mediaManagerTarget === 'gallery') {
      setGallery(selectedMedia);
    } else if (mediaManagerTarget === 'model') {
      setModel(selectedMedia[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const projectData = {
      title,
      category,
      description,
      thumbnail: thumbnail?._id,
      gallery: gallery.map((item) => item._id),
      model: model?._id,
      contributors,
      tags,
      status,
    };

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/dashboard/projects');
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    setLoading(false);

    if (res.ok) {
      router.push('/dashboard/projects');
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong');
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
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <Button onClick={handleAddTag} sx={{ ml: 1 }}>Add</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleOpenMediaManager('thumbnail')}>
          Select Thumbnail
        </Button>
        {thumbnail && <Typography sx={{ ml: 2, display: 'inline' }}>{thumbnail.name}</Typography>}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleOpenMediaManager('gallery')}>
          Select Gallery Images
        </Button>
        {gallery.map((item) => (
          <Typography key={item.id} sx={{ ml: 2, display: 'inline' }}>{item.name}</Typography>
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleOpenMediaManager('model')}>
          Select 3D Model
        </Button>
        {model && <Typography sx={{ ml: 2, display: 'inline' }}>{model.name}</Typography>}
      </Box>
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