'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Category } from '../../types/interfaces/category.interfaces';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; parent?: string }) => Promise<{ success: boolean; error?: string }>;
  category?: Category | null;
  mode: 'create' | 'edit';
  availableParents?: Category[];
}

export default function CategoryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category, 
  mode,
  availableParents = []
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || '',
        description: category?.description || '',
        parent: category?.parent || ''
      });
      setError(null);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        onClose();
        setFormData({ name: '', description: '', parent: '' });
      } else {
        setError(result.error || 'Failed to save category');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name!]: value
    }));
    // Clear error when user makes selection
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {mode === 'create' ? 'Add New Category' : 'Edit Category'}
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              fullWidth
              autoFocus
              error={!!error && !formData.name.trim()}
              helperText={!!error && !formData.name.trim() ? 'Category name is required' : ''}
            />

            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="parent"
                value={formData.parent}
                onChange={handleSelectChange}
                disabled={isSubmitting}
                label="Parent Category"
              >
                <MenuItem value="">
                  <em>No Parent (Root Category)</em>
                </MenuItem>
                {availableParents
                  .filter(parent => parent._id !== category?._id)
                  .filter(parent => (parent.level || 0) < 2)
                  .map(parent => (
                    <MenuItem key={parent._id} value={parent._id}>
                      {'  '.repeat(parent.level || 0) + parent.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={3}
              fullWidth
              placeholder="Enter category description (optional)"
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          >
            {isSubmitting 
              ? 'Saving...' 
              : mode === 'create' 
                ? 'Create Category' 
                : 'Update Category'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}