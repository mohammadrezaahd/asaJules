"use client";

import { useState, useCallback } from "react";

interface UseBulkSelectionProps<T> {
  items: T[];
  getItemId: (item: T) => string;
}

export const useBulkSelection = <T,>({ 
  items, 
  getItemId 
}: UseBulkSelectionProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const toggleBulkActions = useCallback(() => {
    setShowBulkActions(prev => !prev);
    if (showBulkActions) {
      setSelectedItems([]);
    }
  }, [showBulkActions]);

  const selectItem = useCallback((item: T) => {
    const itemId = getItemId(item);
    const isSelected = selectedItems.some(selectedItem => getItemId(selectedItem) === itemId);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selectedItem => getItemId(selectedItem) !== itemId));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  }, [selectedItems, getItemId]);

  const selectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  }, [selectedItems.length, items]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isItemSelected = useCallback((item: T) => {
    const itemId = getItemId(item);
    return selectedItems.some(selectedItem => getItemId(selectedItem) === itemId);
  }, [selectedItems, getItemId]);

  return {
    selectedItems,
    showBulkActions,
    toggleBulkActions,
    selectItem,
    selectAll,
    clearSelection,
    isItemSelected,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
    isAllSelected: selectedItems.length === items.length && items.length > 0,
    isSomeSelected: selectedItems.length > 0 && selectedItems.length < items.length,
  };
};

export default useBulkSelection;