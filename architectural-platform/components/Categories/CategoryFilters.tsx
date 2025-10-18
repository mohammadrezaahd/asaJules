"use client";

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CategoryQueryParams } from "@/types";

interface CategoryFiltersProps {
  filters: CategoryQueryParams;
  onFiltersChange: (filters: CategoryQueryParams) => void;
  totalItems?: number;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
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

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      flat: filters.flat,
    });
  };

  const hasActiveFilters = filters.search;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        alignItems: 'center',
      }}
    >
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search categories..."
        value={filters.search || ''}
        onChange={handleSearchChange}
        sx={{ minWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Results Count */}
      {totalItems > 0 && (
        <Chip
          label={`${totalItems} categor${totalItems !== 1 ? 'ies' : 'y'} found`}
          color="primary"
          variant="outlined"
          size="small"
        />
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Chip
          label="Clear filters"
          onDelete={clearFilters}
          size="small"
          variant="outlined"
          color="secondary"
        />
      )}
    </Box>
  );
};

export default CategoryFilters;