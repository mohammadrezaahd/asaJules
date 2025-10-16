"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";

import { MediaFile } from "@/types";
import { mediaApi } from "@/components/api";

interface MediaManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedMedia: MediaFile[]) => void;
  multiple?: boolean;
}

export default function MediaManager({
  open,
  onClose,
  onSelect,
  multiple = false,
}: MediaManagerProps) {
  const [tab, setTab] = useState(0);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaApi.getAll();
      if (response.isSuccess && response.data) {
        setMedia(response.data);
      } else {
        setError(response.error || "Failed to fetch media");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch media");
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

  const handleSelect = (item: MediaFile) => {
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

    try {
      const response = await mediaApi.upload(file);
      if (response.isSuccess) {
        setFile(null);
        setTab(0); // Switch back to library view
        fetchMedia(); // Refresh media library
      } else {
        setError(response.error || "Failed to upload file");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
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
                  <Grid key={item._id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.filepath}
                        alt={item.filename}
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
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!file || uploading}
            >
              {uploading ? <CircularProgress size={24} /> : "Upload"}
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
