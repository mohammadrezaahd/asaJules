'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { Category } from '@/types';

interface CategoriesListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string, force?: boolean) => Promise<{ success: boolean; error?: string; hasChildren?: boolean; childrenCount?: number; childrenNames?: string[]; categoryName?: string }>;
  
  // Bulk selection props
  showBulkActions?: boolean;
  onSelectItem?: (category: Category) => void;
  isItemSelected?: (category: Category) => boolean;
}

export default function CategoriesList({ 
  categories, 
  loading, 
  onEdit, 
  onDelete,
  showBulkActions = false,
  onSelectItem,
  isItemSelected,
}: CategoriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    setDeleteError(null);

    try {
      // First try to delete without force to check for children
      const result = await onDelete(id, false);
      
      if (!result.success && result.hasChildren && result.childrenCount && result.childrenNames) {
        // Show confirmation dialog for cascade delete
        const childrenList = result.childrenNames.slice(0, 5).join(', ') + 
                           (result.childrenNames.length > 5 ? ` and ${result.childrenNames.length - 5} more...` : '');
        
        const confirmMessage = `⚠️ CASCADE DELETE WARNING ⚠️\n\n"${name}" has ${result.childrenCount} subcategory(ies):\n\n${childrenList}\n\n🔥 ATTENTION: Deleting this category will permanently delete ALL its subcategories!\n\nThis action cannot be undone. Are you sure you want to continue?`;
        
        if (confirm(confirmMessage)) {
          // User confirmed, delete with force
          const forceResult = await onDelete(id, true);
          if (!forceResult.success) {
            setDeleteError(forceResult.error || 'Failed to delete category');
          }
        }
      } else if (result.success) {
        // Successfully deleted (no children)
        console.log('Category deleted successfully');
      } else {
        // Other error
        setDeleteError(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Box sx={{ 
          bgcolor: 'grey.50', 
          borderRadius: 2, 
          p: 4, 
          maxWidth: 400, 
          mx: 'auto'
        }}>
          <FolderIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first category to get started organizing your content
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      <Stack spacing={2}>
        {categories.map((category) => (
          <Card 
            key={category._id}
            variant="outlined" 
            onClick={
              showBulkActions && onSelectItem
                ? () => onSelectItem(category)
                : undefined
            }
            sx={{ 
              transition: 'all 0.2s',
              cursor: showBulkActions ? 'pointer' : 'default',
              backgroundColor: showBulkActions && isItemSelected?.(category) 
                ? 'action.selected' 
                : 'transparent',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-1px)'
              }
            }}
          >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Bulk selection checkbox */}
                  {showBulkActions && onSelectItem && isItemSelected && (
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      <Checkbox
                        checked={isItemSelected(category)}
                        onChange={() => onSelectItem(category)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      {/* Level indicator */}
                      {(category.level || 0) > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {'└─'.repeat(category.level || 0)}
                        </Typography>
                      )}
                      <Typography variant="h6" component="h3">
                        {category.name}
                      </Typography>
                      {/* Level badge */}
                      <Chip
                        label={`Level ${category.level || 0}`}
                        size="small"
                        color={
                          (category.level || 0) === 0 
                            ? 'primary'
                            : (category.level || 0) === 1
                            ? 'success'
                            : 'warning'
                        }
                        variant="outlined"
                      />
                    </Stack>
                    
                    {category.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                    )}
                    
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(category.updatedAt).toLocaleDateString()}
                      </Typography>
                      {category.children && category.children.length > 0 && (
                        <Chip
                          label={`${category.children.length} subcategories`}
                          size="small"
                          color="info"
                          variant="filled"
                        />
                      )}
                    </Stack>
                  </Box>
                  
                  {/* Show action buttons only when not in bulk mode */}
                  {!showBulkActions && (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit category">
                        <IconButton
                          onClick={() => onEdit(category)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete category">
                        <IconButton
                          onClick={() => handleDelete(category._id, category.name)}
                          disabled={deletingId === category._id}
                          color="error"
                          size="small"
                        >
                          {deletingId === category._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
        ))}
      </Stack>
    </Box>
  );
}