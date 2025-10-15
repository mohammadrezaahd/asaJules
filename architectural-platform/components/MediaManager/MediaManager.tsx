'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Grid, Card, CardMedia, CardActions, Checkbox, CircularProgress, Alert } from '@mui/material';

interface MediaManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedMedia: any[]) => void;
  multiple?: boolean;
}

import axiosInstance from '@/lib/axios';

export default function MediaManager({ open, onClose, onSelect, multiple = false }: MediaManagerProps) {
  const [tab, setTab] = useState(0);
  const [media, setMedia] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/media');
      setMedia(res.data.media);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tab === 0) {
      fetchMedia();
    }
  }, [open, tab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleSelect = (item: any) => {
    if (multiple) {
      setSelected((prev) =>
        prev.find((i) => i._id === item._id)
          ? prev.filter((i) => i._id !== item._id)
          : [...prev, item]
      );
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axiosInstance.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setTab(0); // Switch back to library view
      fetchMedia(); // Refresh media library
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Media Manager</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Library" />
          <Tab label="Upload" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ pt: 2 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={2}>
                {media.map((item) => (
                  <Grid item key={item._id} xs={6} sm={4} md={3}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.path}
                        alt={item.name}
                      />
                      <CardActions>
                        <Checkbox
                          checked={selected.some((i) => i._id === item._id)}
                          onChange={() => handleSelect(item)}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ pt: 2 }}>
            <input type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} variant="contained" disabled={!file || uploading}>
              {uploading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}