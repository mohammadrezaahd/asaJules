"use client";

import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Category } from "@/types";
import { categoriesApi } from "@/components/api";

interface CategoryAutocompleteProps {
  value: string[];
  onChange: (categoryIds: string[]) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  value = [],
  onChange,
  multiple = true,
  label = "Categories",
  placeholder = "Search and select categories...",
  disabled = false,
  error = false,
  helperText,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoriesApi.getAll({
          search: searchTerm,
          limit: 100, // Get more categories for better search
          flat: true, // We want flat list with levels for proper sorting
        });

        if (response.isSuccess && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [searchTerm]);

  // Create hierarchical display name with proper formatting
  const getCategoryDisplayName = (category: Category) => {
    const levelIndent = "    ".repeat(category.level || 0); // 4 spaces per level
    const prefix = category.level && category.level > 0 ? "└── " : "";
    return `${levelIndent}${prefix}${category.name}`;
  };

  // Sort categories to show hierarchy properly
  const sortedCategories = [...categories].sort((a, b) => {
    // First sort by level
    if ((a.level || 0) !== (b.level || 0)) {
      return (a.level || 0) - (b.level || 0);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Get selected categories objects
  const selectedCategories = categories.filter((cat) =>
    value.includes(cat._id)
  );

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: Category | Category[] | null
  ) => {
    if (multiple) {
      const selectedIds = (newValue as Category[])?.map((cat) => cat._id) || [];
      onChange(selectedIds);
    } else {
      const selectedId = (newValue as Category)?._id || "";
      onChange(selectedId ? [selectedId] : []);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      value={multiple ? selectedCategories : selectedCategories[0] || null}
      onChange={handleChange}
      onInputChange={(_event, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      options={sortedCategories}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box component="li" key={key} {...otherProps}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                color: option.level === 0 ? "primary.main" : "text.secondary",
                fontWeight: option.level === 0 ? "bold" : "normal",
                fontSize: option.level === 0 ? "0.9rem" : "0.8rem",
              }}
            >
              {getCategoryDisplayName(option)}
            </Typography>
          </Box>
        );
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option.name}
            size="small"
            {...getTagProps({ index })}
            key={option._id}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      filterOptions={(options, { inputValue }) => {
        // Custom filter that searches in name and considers hierarchy
        return options.filter((option) =>
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        );
      }}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      groupBy={(option) => {
        // Group by parent category for better organization
        if (option.level === 0) return "Main Categories";
        if (option.level === 1) return "Subcategories";
        return "Sub-subcategories";
      }}
    />
  );
};

export default CategoryAutocomplete;
