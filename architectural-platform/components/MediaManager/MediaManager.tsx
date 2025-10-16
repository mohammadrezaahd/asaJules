"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import ImageIcon from "@mui/icons-material/Image";
import FileUpload from "./FileUpload";
import MediaFilters from "./MediaFilters";
import MediaPagination from "./MediaPagination";
import { MediaFile, MediaQueryParams } from "@/types";
import { mediaApi } from "@/components/api";

interface MediaManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedMedia: MediaFile[]) => void;
  multiple?: boolean;
  mediaType?: 'images' | 'models' | 'all';
  title?: string;
}

export default function MediaManager({
  open,
  onClose,
  onSelect,
  multiple = false,
  mediaType = 'all',
  title = "Select Media",
}: MediaManagerProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<MediaQueryParams>({
    page: 1,
    limit: 12,
    search: '',
    type: mediaType,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  const fetchMedia = React.useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await mediaApi.getAll(filters);
      
      if (result.isSuccess && result.data) {
        setMedia(result.data);
        setPagination({
          totalItems: result.pagination.totalItems || 0,
          totalPages: result.pagination.totalPages || 1,
          currentPage: result.pagination.currentPage || 1,
          itemsPerPage: result.pagination.itemsPerPage || 12,
        });
      } else {
        setError(result.error || "Failed to fetch media");
        setMedia([]);
      }
    } catch {
      setError("Failed to fetch media");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (open) {
      setFilters(prev => ({ ...prev, type: mediaType }));
    }
  }, [open, mediaType]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleSelect = (media: MediaFile) => {
    if (multiple) {
      setSelectedMedia((prev) => {
        const exists = prev.find((item) => item._id === media._id);
        if (exists) {
          return prev.filter((item) => item._id !== media._id);
        } else {
          return [...prev, media];
        }
      });
    } else {
      setSelectedMedia([media]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedMedia);
    setSelectedMedia([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedMedia([]);
    onClose();
  };

  const handleFiltersChange = (newFilters: MediaQueryParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters(prev => ({ ...prev, limit: itemsPerPage, page: 1 }));
  };

  const handleUploadSuccess = () => {
    fetchMedia();
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const result = await mediaApi.delete(id);
      if (result.isSuccess) {
        fetchMedia();
        // Remove from selected if it was selected
        setSelectedMedia(prev => prev.filter(item => item._id !== id));
      } else {
        setError(result.error || "Failed to delete file");
      }
    } catch {
      setError("Failed to delete file");
    }
  };

  const getDialogTitle = () => {
    switch (mediaType) {
      case 'images':
        return multiple ? 'Select Images' : 'Select Image';
      case 'models':
        return 'Select 3D Model (.glb files only)';
      default:
        return title;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (mimetype: string, filename: string): 'image' | 'model' | 'other' => {
    if (mimetype.startsWith('image/')) return 'image';
    if (filename.toLowerCase().endsWith('.glb') || mimetype === 'model/gltf-binary') return 'model';
    return 'other';
  };

  const getFileIcon = (type: 'image' | 'model' | 'other') => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'model':
        return <ThreeDRotationIcon />;
      default:
        return <ImageIcon />;
    }
  };

  const handleDownload = (media: MediaFile) => {
    const link = document.createElement('a');
    link.href = media.filepath;
    link.download = media.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg">
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <Box sx={{ minHeight: '60vh' }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* File Upload */}
          <FileUpload
            allowedType={mediaType}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />

          {/* Filters */}
          <MediaFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalItems={pagination.totalItems}
          />

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Media Grid */}
          {!loading && (
            <>
              {media.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No files found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload some files to get started
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {media.map((item) => {
                    const fileType = getFileType(item.mimetype, item.filename);
                    const isImage = fileType === 'image';
                    const isSelected = selectedMedia.some(selected => selected._id === item._id);
                    
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            cursor: 'pointer',
                            border: isSelected ? 2 : 1,
                            borderColor: isSelected ? 'primary.main' : 'grey.300',
                            bgcolor: isSelected ? 'primary.50' : 'background.paper',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                          onClick={() => handleSelect(item)}
                        >
                          {/* Media Preview */}
                          <Box sx={{ position: 'relative', paddingTop: '66.67%', bgcolor: 'grey.100' }}>
                            {isImage ? (
                              <CardMedia
                                component="img"
                                image={item.filepath}
                                alt={item.filename}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'grey.50'
                                }}
                              >
                                {getFileIcon(fileType)}
                              </Box>
                            )}

                            {/* Selection Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'background.paper' }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(item);
                              }}
                            />

                            {/* File Type Badge */}
                            <Chip
                              label={fileType === 'model' ? 'GLB' : fileType.toUpperCase()}
                              size="small"
                              color={fileType === 'model' ? 'secondary' : 'primary'}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>

                          {/* Content */}
                          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            <Tooltip title={item.filename}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 'medium',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.filename}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatFileSize(item.size)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>

                          {/* Actions */}
                          <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                            <Box>
                              <Tooltip title="Download">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(item);
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item._id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}

          {/* Pagination */}
          <MediaPagination
            pagination={pagination}
            currentPage={filters.page || 1}
            itemsPerPage={filters.limit || 12}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={selectedMedia.length === 0}
        >
          Select ({selectedMedia.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}