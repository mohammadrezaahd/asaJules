"use client";

import React from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import ImageIcon from "@mui/icons-material/Image";
import { MediaFile } from "@/types";

interface MediaGridProps {
  media: MediaFile[];
  onDelete?: (id: string) => void;
  onSelect?: (media: MediaFile) => void;
  loading?: boolean;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  onDelete,
  onSelect,
  loading = false,
}) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (media.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No files found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload some files to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {media.map((item) => {
        const fileType = getFileType(item.mimetype, item.filename);
        const isImage = fileType === 'image';
        
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: onSelect ? 'pointer' : 'default',
                '&:hover': onSelect ? {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                } : {}
              }}
              onClick={() => onSelect && onSelect(item)}
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
                
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item._id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default MediaGrid;