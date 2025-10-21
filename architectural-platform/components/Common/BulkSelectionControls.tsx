"use client";

import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  SelectAll as SelectAllIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface BulkSelectionControlsProps<T> {
  // Selection state
  items: T[];
  selectedItems: T[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  
  // Bulk actions
  onBulkDelete?: (selectedItems: T[]) => Promise<void>;
  
  // UI state
  showBulkActions: boolean;
  onToggleBulkActions: () => void;
  
  // Configuration
  itemName?: string; // e.g., "users", "projects", "articles"
  getItemId: (item: T) => string;
  getItemDisplayName?: (item: T) => string;
  
  // Loading states
  isDeleting?: boolean;
}

const BulkSelectionControls = <T,>({
  items,
  selectedItems,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  showBulkActions,
  onToggleBulkActions,
  itemName = "items",
  getItemId,
  getItemDisplayName,
  isDeleting = false,
}: BulkSelectionControlsProps<T>) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedItems.length === 0) return;
    
    setShowDeleteConfirm(false);
    try {
      await onBulkDelete(selectedItems);
      onClearSelection();
    } catch (error) {
      console.error(`Failed to delete ${itemName}:`, error);
    }
  };

  const allSelected = selectedItems.length === items.length && items.length > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  return (
    <>
      {/* Toggle Button and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={showBulkActions ? "Cancel selection" : `Select multiple ${itemName}`}>
            <Button
              variant={showBulkActions ? "contained" : "outlined"}
              color={showBulkActions ? "secondary" : "primary"}
              startIcon={showBulkActions ? <CloseIcon /> : <SelectAllIcon />}
              onClick={onToggleBulkActions}
              size="small"
            >
              {showBulkActions ? "Cancel" : "Select"}
            </Button>
          </Tooltip>
          
          {showBulkActions && selectedItems.length > 0 && onBulkDelete && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              size="small"
            >
              {isDeleting ? "Deleting..." : `Delete (${selectedItems.length})`}
            </Button>
          )}
        </Box>

        {showBulkActions && (
          <Typography variant="body2" color="text.secondary">
            Click on {itemName} to select them for bulk actions
          </Typography>
        )}
      </Box>

      {/* Bulk Selection Toolbar */}
      {showBulkActions && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onSelectAll}
                />
              }
              label={`Select All (${selectedItems.length} of ${items.length} selected)`}
            />
            
            {selectedItems.length > 0 && (
              <Button
                variant="text"
                color="primary"
                onClick={onClearSelection}
                size="small"
              >
                Clear Selection
              </Button>
            )}
          </Box>

          {selectedItems.length > 0 && getItemDisplayName && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Selected {itemName}:
              </Typography>
              <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedItems.slice(0, 5).map((item) => (
                  <Typography
                    key={getItemId(item)}
                    variant="caption"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    {getItemDisplayName(item)}
                  </Typography>
                ))}
                {selectedItems.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    +{selectedItems.length - 5} more
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete {selectedItems.length} {itemName}?
          </Typography>
          
          {getItemDisplayName && selectedItems.length <= 10 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Items to be deleted:
              </Typography>
              {selectedItems.map((item) => (
                <Typography key={getItemId(item)} variant="body2" color="text.secondary">
                  • {getItemDisplayName(item)}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : `Delete ${selectedItems.length} ${itemName}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkSelectionControls;