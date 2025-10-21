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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { mediaApi, MEDIA_FILTER_TYPES } from "@/components/api/media.api";

interface FileProgress {
  file: File;
  percent: number;
  status: 'waiting' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface FileUploadProps {
  allowedType?: "models" | "images" | "all";
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  allowedType = "all",
  onUploadSuccess,
  onUploadError,
  multiple = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentAllowedType, setCurrentAllowedType] = useState<
    "models" | "images" | "all"
  >(allowedType);
  const [filesProgress, setFilesProgress] = useState<FileProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const invalidFiles: string[] = [];

      // Validate all selected files
      files.forEach(file => {
        if (!mediaApi.isFileTypeAllowed(file, currentAllowedType)) {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        const filterType = MEDIA_FILTER_TYPES.find(
          (ft) => ft.value === currentAllowedType
        );
        const errorMsg = `Invalid file types: ${invalidFiles.join(', ')}. Only ${filterType?.label.toLowerCase()} are allowed. Supported formats: ${filterType?.extensions.join(", ")}`;
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
        return;
      }

      setSelectedFiles(files);
      
      // Initialize progress for each file
      setFilesProgress(files.map(file => ({
        file,
        percent: 0,
        status: 'waiting' as const
      })));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError("");
    setOverallProgress(0);

    try {
      const result = await mediaApi.uploadMultiple(
        selectedFiles, 
        currentAllowedType,
        (progress) => {
          // Update individual file progress
          setFilesProgress(prev => 
            prev.map(fp => 
              fp.file.name === progress.file 
                ? { ...fp, percent: progress.percent, status: progress.status }
                : fp
            )
          );

          // Calculate overall progress
          setFilesProgress(current => {
            const updated = current.map(fp => 
              fp.file.name === progress.file 
                ? { ...fp, percent: progress.percent, status: progress.status }
                : fp
            );
            
            const totalProgress = updated.reduce((sum, fp) => sum + fp.percent, 0);
            const avgProgress = totalProgress / updated.length;
            setOverallProgress(Math.round(avgProgress));
            
            return updated;
          });
        }
      );

      if (result.isSuccess && result.data) {
        const { summary, failedFiles } = result.data;
        
        // Mark failed files in progress
        if (failedFiles.length > 0) {
          setFilesProgress(prev => 
            prev.map(fp => {
              const failed = failedFiles.find(f => f.filename === fp.file.name);
              return failed 
                ? { ...fp, status: 'failed' as const, error: failed.error }
                : fp;
            })
          );
        }

        // Show summary message
        let message = `Successfully uploaded ${summary.uploaded} of ${summary.total} files`;
        if (summary.failed > 0) {
          const failedNames = failedFiles.map(f => f.filename).join(', ');
          message += `\nFailed files: ${failedNames}`;
        }

        if (summary.uploaded > 0) {
          // Reset form after successful uploads
          setTimeout(() => {
            setSelectedFiles([]);
            setFilesProgress([]);
            setOverallProgress(0);
            
            // Reset file input
            const fileInput = document.querySelector(
              'input[type="file"]'
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";

            if (onUploadSuccess) onUploadSuccess();
          }, 2000); // Show success state for 2 seconds
        }

        if (summary.failed > 0) {
          setError(message);
          if (onUploadError) onUploadError(message);
        }

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
    setSelectedFiles([]);
    setFilesProgress([]);
    setOverallProgress(0);
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
            multiple: multiple,
          }}
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </Box>

      {/* Overall Progress Bar */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress: {overallProgress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={overallProgress} />
        </Box>
      )}

      {/* Individual File Progress */}
      {filesProgress.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Files Progress:
          </Typography>
          <List dense>
            {filesProgress.map((fileProgress, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  {fileProgress.status === 'completed' && (
                    <CheckCircleIcon color="success" />
                  )}
                  {fileProgress.status === 'failed' && (
                    <ErrorIcon color="error" />
                  )}
                  {fileProgress.status === 'uploading' && (
                    <UploadIcon color="primary" />
                  )}
                  {fileProgress.status === 'waiting' && (
                    <UploadIcon color="disabled" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {fileProgress.file.name}
                      </Typography>
                      <Chip
                        label={fileProgress.status}
                        size="small"
                        color={
                          fileProgress.status === 'completed'
                            ? 'success'
                            : fileProgress.status === 'failed'
                            ? 'error'
                            : fileProgress.status === 'uploading'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">
                          {(fileProgress.file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Typography variant="caption">
                          {fileProgress.percent}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={fileProgress.percent}
                        color={
                          fileProgress.status === 'completed'
                            ? 'success'
                            : fileProgress.status === 'failed'
                            ? 'error'
                            : 'primary'
                        }
                      />
                      {fileProgress.error && (
                        <Typography variant="caption" color="error">
                          {fileProgress.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selected Files Summary */}
      {selectedFiles.length > 0 && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} 
            ({(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB total)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;
