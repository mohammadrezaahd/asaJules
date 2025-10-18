"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Typography,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { mediaApi, MEDIA_FILTER_TYPES } from "@/components/api/media.api";

interface FileUploadProps {
  allowedType?: "models" | "images" | "all";
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  allowedType = "all",
  onUploadSuccess,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentAllowedType, setCurrentAllowedType] = useState<
    "models" | "images" | "all"
  >(allowedType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!mediaApi.isFileTypeAllowed(file, currentAllowedType)) {
        const filterType = MEDIA_FILTER_TYPES.find(
          (ft) => ft.value === currentAllowedType
        );
        const errorMsg = `Only ${filterType?.label.toLowerCase()} are allowed. Supported formats: ${filterType?.extensions.join(
          ", "
        )}`;
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    try {
      const result = await mediaApi.upload(selectedFile, currentAllowedType);

      if (result.isSuccess) {
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errorMsg = result.error || "Upload failed";
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
      }
    } catch {
      const errorMsg = "Upload failed";
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleAllowedTypeChange = (event: SelectChangeEvent<string>) => {
    const newType = event.target.value as "models" | "images" | "all";
    setCurrentAllowedType(newType);
    setSelectedFile(null);
    setError("");

    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const getAcceptAttribute = () => {
    return mediaApi.getAcceptAttribute(currentAllowedType);
  };

  const getSelectedFilterType = () => {
    return MEDIA_FILTER_TYPES.find((ft) => ft.value === currentAllowedType);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Files
      </Typography>

      <Box
        sx={{ display: "flex", gap: 2, alignItems: "start", flexWrap: "wrap" }}
      >
        {/* File Type Selector */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Allowed Type</InputLabel>
          <Select
            value={currentAllowedType}
            onChange={handleAllowedTypeChange}
            label="Allowed Type"
          >
            {MEDIA_FILTER_TYPES.map((filterType) => (
              <MenuItem key={filterType.value} value={filterType.value}>
                {filterType.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* File Input */}
        <TextField
          type="file"
          onChange={handleFileChange}
          sx={{ minWidth: 250 }}
          size="small"
          disabled={uploading}
          helperText={
            currentAllowedType !== "all" && getSelectedFilterType()
              ? `Supported: ${getSelectedFilterType()?.extensions.join(", ")}`
              : ""
          }
          inputProps={{
            accept: getAcceptAttribute(),
          }}
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </Box>

      {/* Progress Bar */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selected File Info */}
      {selectedFile && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedFile.name} (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;
