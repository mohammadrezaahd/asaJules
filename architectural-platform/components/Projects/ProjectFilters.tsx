"use client";

import React, { useState, useEffect } from "react";
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
import { ProjectQueryParams, Category } from "@/types";
import { categoriesApi } from "@/components/api";

interface ProjectFiltersProps {
  filters: ProjectQueryParams;
  onFiltersChange: (filters: ProjectQueryParams) => void;
  totalItems?: number;
  showStatusFilter?: boolean;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  totalItems = 0,
  showStatusFilter = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoriesApi.getAll();
        if (result.isSuccess && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: event.target.value,
      page: 1, // Reset to first page when searching
    });
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      category: event.target.value || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

import { Status } from "@/types/status";

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      status: event.target.value as Status | undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status;

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
        placeholder="Search projects..."
        value={filters.search || ''}
        onChange={handleSearchChange}
        sx={{ minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Category Filter */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category || ''}
          onChange={handleCategoryChange}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status Filter (only show for admin/dashboard) */}
      {showStatusFilter && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value={Status.PUBLISHED}>Published</MenuItem>
            <MenuItem value={Status.DRAFT}>Draft</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Results Count */}
      {totalItems > 0 && (
        <Chip
          label={`${totalItems} project${totalItems !== 1 ? 's' : ''} found`}
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

export default ProjectFilters;