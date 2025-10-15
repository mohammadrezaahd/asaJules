"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Box,
  TextField,
} from "@mui/material";
import { MediaFile } from "@/types";
import { mediaApi } from "@/components/api";

const MediaLibraryPage = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchMedia = async () => {
    try {
      const fetchedMedia = await mediaApi.getAll();
      setMedia(fetchedMedia);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await mediaApi.upload(selectedFile);
      fetchMedia();
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Media Library
      </Typography>
      <Box mb={4}>
        <TextField type="file" onChange={handleFileChange} />
        <Button variant="contained" onClick={handleUpload} sx={{ ml: 2 }}>
          Upload
        </Button>
      </Box>
      <Grid container spacing={4}>
        {media?.map((item) => (
          <Grid item  xs={12} sm={6} md={3} key={item._id}>
            <Card>
              <CardMedia
                component="img"
                height="150"
                image={item.filepath}
                alt={item.filename}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MediaLibraryPage;
