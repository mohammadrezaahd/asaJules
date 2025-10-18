"use client";

import React, { useState, KeyboardEvent } from "react";
import {
  TextField,
  Chip,
  Box,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  maxTags?: number;
}

const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  label = "Tags",
  placeholder = "Enter tags and press Enter",
  disabled = false,
  error = false,
  helperText,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !value.includes(trimmedValue) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        error={error}
        helperText={helperText || `${value.length}/${maxTags} tags. Press Enter or comma to add.`}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={addTag}
                disabled={!inputValue.trim() || value.length >= maxTags}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {value.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {value.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => removeTag(tag)}
              size="small"
              color="primary"
              variant="outlined"
              disabled={disabled}
            />
          ))}
        </Box>
      )}
      
      {value.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          No tags added yet
        </Typography>
      )}
    </Box>
  );
};

export default TagsInput;