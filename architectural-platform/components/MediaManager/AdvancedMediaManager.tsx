"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { MediaFile, MediaQueryParams } from "@/types";
import { mediaApi } from "@/components/api";
import FileUpload from "./FileUpload";
import MediaFilters from "./MediaFilters";
import MediaGrid from "./MediaGrid";
import MediaPagination from "./MediaPagination";

interface AdvancedMediaManagerProps {
  allowedType?: 'models' | 'images' | 'all';
  title?: string;
  onSelect?: (media: MediaFile) => void;
  showUpload?: boolean;
}

const AdvancedMediaManager: React.FC<AdvancedMediaManagerProps> = ({
  allowedType = 'all',
  title = "Media Library",
  onSelect,
  showUpload = true,
}) => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<MediaQueryParams>({
    page: 1,
    limit: 12,
    search: '',
    type: allowedType,
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
    fetchMedia();
  }, [fetchMedia]);

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
    // Refresh media list after successful upload
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
        fetchMedia(); // Refresh the list
      } else {
        setError(result.error || "Failed to delete file");
      }
    } catch {
      setError("Failed to delete file");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* File Upload */}
      {showUpload && (
        <FileUpload
          allowedType={allowedType}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      )}

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
        <MediaGrid
          media={media}
          onDelete={handleDelete}
          onSelect={onSelect}
          loading={loading}
        />
      )}

      {/* Pagination */}
      <MediaPagination
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </Container>
  );
};

export default AdvancedMediaManager;