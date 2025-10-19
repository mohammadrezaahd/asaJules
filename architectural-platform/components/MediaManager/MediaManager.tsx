"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { MediaFile, MediaQueryParams } from "@/types";
import { mediaApi } from "@/components/api";
import FileUpload from "./FileUpload";
import MediaFilters from "./MediaFilters";
import MediaGrid from "./MediaGrid";
import PaginationControls from "../Common/PaginationControls";

interface MediaManagerProps {
  // Modal mode props
  open?: boolean;
  onClose?: () => void;
  onSelect?: (selectedMedia: MediaFile[]) => void;
  multiple?: boolean;
  mediaType?: "images" | "models" | "all";
  title?: string;

  // Page mode props
  allowedType?: "models" | "images" | "all";
  showUpload?: boolean;
}

const MediaManager: React.FC<MediaManagerProps> = ({
  // Modal mode
  open,
  onClose,
  onSelect,
  multiple = false,
  mediaType = "all",
  title = "Media Library",

  // Page mode
  allowedType,
  showUpload = true,
}) => {
  // Determine if we're in modal mode or page mode
  const isModalMode = open !== undefined;
  const finalMediaType = isModalMode ? mediaType : allowedType || "all";

  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [filters, setFilters] = useState<MediaQueryParams>({
    page: 1,
    limit: 12,
    search: "",
    type: finalMediaType,
  });

  // Update filters when mediaType changes
  useEffect(() => {
    console.log("MediaType changed to:", finalMediaType);
    setFilters((prev) => ({
      ...prev,
      type: finalMediaType,
      page: 1, // Reset to first page when type changes
    }));
  }, [finalMediaType]);

  // Clear selected media when modal opens/closes or target changes
  useEffect(() => {
    console.log(
      "Clearing selected media, open:",
      open,
      "mediaType:",
      mediaType
    );
    setSelectedMedia([]);
  }, [open, mediaType]);

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
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: itemsPerPage, page: 1 }));
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
      } else {
        setError(result.error || "Failed to delete file");
      }
    } catch {
      setError("Failed to delete file");
    }
  };

  const handleMediaClick = (mediaFile: MediaFile) => {
    if (isModalMode && onSelect) {
      if (multiple) {
        const isSelected = selectedMedia.some(
          (item) => item._id === mediaFile._id
        );
        if (isSelected) {
          setSelectedMedia((prev) =>
            prev.filter((item) => item._id !== mediaFile._id)
          );
        } else {
          setSelectedMedia((prev) => [...prev, mediaFile]);
        }
      } else {
        onSelect([mediaFile]);
        onClose?.();
      }
    }
  };

  const handleSelectButtonClick = () => {
    if (isModalMode && onSelect) {
      onSelect(selectedMedia);
      onClose?.();
    }
  };

  const renderContent = () => (
    <>
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* File Upload */}
      {showUpload && (
        <FileUpload
          allowedType={finalMediaType === "all" ? undefined : finalMediaType}
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Media Grid */}
      {!loading && (
        <MediaGrid
          media={media}
          onDelete={isModalMode ? undefined : handleDelete}
          onSelect={isModalMode ? handleMediaClick : undefined}
          loading={loading}
          selectedMedia={isModalMode ? selectedMedia : undefined}
        />
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="media files"
      />
    </>
  );

  // Modal Mode
  if (isModalMode) {
    return (
      <Dialog open={open || false} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {title}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>{renderContent()}</DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
          <Box>
            {multiple && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      selectedMedia.length === media.length && media.length > 0
                    }
                    indeterminate={
                      selectedMedia.length > 0 &&
                      selectedMedia.length < media.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMedia([...media]);
                      } else {
                        setSelectedMedia([]);
                      }
                    }}
                  />
                }
                label={`Select All (${selectedMedia.length} selected)`}
              />
            )}
          </Box>

          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSelectButtonClick}
              disabled={selectedMedia.length === 0}
            >
              Select{" "}
              {multiple && selectedMedia.length > 0
                ? `(${selectedMedia.length})`
                : ""}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  }

  // Page Mode
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {renderContent()}
    </Container>
  );
};

export default MediaManager;
