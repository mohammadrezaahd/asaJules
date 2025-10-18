"use client";

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MediaQueryParams } from "@/types";
import { MEDIA_FILTER_TYPES } from "@/components/api/media.api";

interface MediaFiltersProps {
  filters: MediaQueryParams;
  onFiltersChange: (filters: MediaQueryParams) => void;
  totalItems?: number;
}

const MediaFilters: React.FC<MediaFiltersProps> = ({
  filters,
  onFiltersChange,
  totalItems = 0,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: event.target.value,
      page: 1, // Reset to first page when searching
    });
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      type: event.target.value as "models" | "images" | "all",
      page: 1, // Reset to first page when filtering
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        {/* Search */}
        <TextField
          placeholder="Search files..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Type Filter */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>File Type</InputLabel>
          <Select
            value={filters.type || "all"}
            onChange={handleTypeChange}
            label="File Type"
          >
            {MEDIA_FILTER_TYPES.map((filterType) => (
              <MenuItem key={filterType.value} value={filterType.value}>
                {filterType.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Results count */}
        <Chip label={`${totalItems} items`} variant="outlined" size="small" />
      </Box>

      {/* Active filters */}
      {(filters.search || (filters.type && filters.type !== "all")) && (
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              onDelete={() =>
                onFiltersChange({ ...filters, search: "", page: 1 })
              }
              size="small"
              variant="outlined"
            />
          )}
          {filters.type && filters.type !== "all" && (
            <Chip
              label={`Type: ${
                MEDIA_FILTER_TYPES.find((ft) => ft.value === filters.type)
                  ?.label
              }`}
              onDelete={() =>
                onFiltersChange({ ...filters, type: "all", page: 1 })
              }
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default MediaFilters;
