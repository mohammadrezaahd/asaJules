"use client";

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Crop as CropIcon, Cancel, CheckCircle } from '@mui/icons-material';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  userInitials?: string;
  onAvatarChange: (avatarUrl: string) => void;
  disabled?: boolean;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  userInitials = "?",
  onAvatarChange,
  disabled = false,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to center and make a square crop
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setError('');
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        1,
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      setIsUploading(true);
      setError('');

      const croppedImageBlob = await getCroppedImg();
      
      if (!croppedImageBlob) {
        throw new Error('Failed to crop image');
      }

      // Create FormData for upload
      const formData = new FormData();
      const fileName = `avatar-${Date.now()}.jpg`;
      formData.append('file', croppedImageBlob, fileName);

      // Upload to avatar endpoint
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.url) {
        setPreviewUrl(result.url);
        onAvatarChange(result.url);
        setIsDialogOpen(false);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('No URL returned from upload');
      }

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError('');
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Avatar Display */}
      <Avatar
        src={previewUrl || currentAvatarUrl}
        sx={{ width: 150, height: 150, mb: 2 }}
      >
        {userInitials}
      </Avatar>

      {/* Upload Button */}
      <Button
        variant="outlined"
        startIcon={<PhotoCamera />}
        onClick={handleUploadClick}
        disabled={disabled}
        sx={{ mb: 1 }}
      >
        Change Avatar
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        style={{ display: 'none' }}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* Crop Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CropIcon />
            Crop Your Avatar
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag to reposition and resize the crop area. The selected area will be your new avatar.
          </Typography>
          
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              minWidth={50}
              minHeight={50}
              circularCrop
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ maxHeight: '400px', maxWidth: '100%' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={handleCancel}
            startIcon={<Cancel />}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            variant="contained"
            startIcon={isUploading ? <CircularProgress size={16} /> : <CheckCircle />}
            disabled={!completedCrop || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvatarUploader;