"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Category, CategoryQueryParams, PaginationInfo } from "@/types";
import { categoriesApi } from "@/components/api/categories.api";
import CategoriesList from "./CategoriesList";
import CategoryModal from "./CategoryModal";
import CategoryFilters from "./CategoryFilters";
import PaginationControls from "../Common/PaginationControls";

interface CategoriesManagerProps {
  title?: string;
  onSelect?: (category: Category) => void;
  showSearch?: boolean;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  title = "Categories Management",
  showSearch = true,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryQueryParams>({
    page: 1,
    limit: 12,
    search: '',
    flat: true,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesApi.getAll(filters);
      
      if (response.isSuccess && response.data) {
        setCategories(response.data);
        setPagination({
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 1,
          currentPage: response.pagination?.currentPage || 1,
          itemsPerPage: response.pagination?.itemsPerPage || 12,
        });
      } else {
        setError(response.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCategory = async (categoryData: { name: string; description?: string; parent?: string }) => {
    try {
      const response = await categoriesApi.create(categoryData);
      if (response.isSuccess) {
        await fetchCategories();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create category' };
      }
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, error: 'Failed to create category' };
    }
  };

  const updateCategory = async (id: string, categoryData: { name?: string; description?: string; parent?: string }) => {
    try {
      const response = await categoriesApi.update(id, categoryData);
      if (response.isSuccess) {
        await fetchCategories();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update category' };
      }
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: 'Failed to update category' };
    }
  };

  const deleteCategory = async (id: string, force = false) => {
    try {
      const response = await categoriesApi.delete(id, force);
      
      if (response.isSuccess) {
        await fetchCategories();
        return { 
          success: true, 
          hasChildren: false,
          childrenCount: response.data?.childrenCount,
          childrenNames: response.data?.childrenNames,
          categoryName: response.data?.categoryName
        };
      } else {
        // Check if it's a children conflict (409 status)
        if (response.data?.hasChildren) {
          return { 
            success: false, 
            error: response.error || 'Category has subcategories',
            hasChildren: response.data.hasChildren,
            childrenCount: response.data.childrenCount,
            childrenNames: response.data.childrenNames,
            categoryName: response.data.categoryName
          };
        }
        
        return { 
          success: false, 
          error: response.error || 'Failed to delete category'
        };
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: 'Failed to delete category' };
    }
  };

  // Modal handlers
  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: { name: string; description?: string; parent?: string }) => {
    if (modalMode === 'create') {
      return await createCategory(formData);
    } else if (selectedCategory) {
      return await updateCategory(selectedCategory._id, formData);
    }
    return { success: false, error: 'Invalid operation' };
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFiltersChange = (newFilters: CategoryQueryParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: itemsPerPage, page: 1 }));
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          disabled={loading}
        >
          Add Category
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      {showSearch && (
        <CategoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalItems={pagination.totalItems}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Categories List */}
      {!loading && (
        <CategoriesList
          categories={categories}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={deleteCategory}
        />
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="categories"
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        category={selectedCategory}
        mode={modalMode}
        availableParents={categories}
      />
    </Container>
  );
};

export default CategoriesManager;