"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { Category } from "@/types";
import { categoriesApi } from "@/components/api/categories.api";
import CategoriesList from "./CategoriesList";
import CategoryModal from "./CategoryModal";
import Pagination from "./Pagination";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async (page = 1, limit = 10, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesApi.getAll({ page, limit, search });
      
      if (response.isSuccess && response.data) {
        setCategories(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total || 0
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
  }, [searchTerm]);

  const createCategory = async (categoryData: { name: string; description?: string; parent?: string }) => {
    try {
      const response = await categoriesApi.create(categoryData);
      if (response.isSuccess) {
        await fetchCategories(pagination.currentPage);
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
        await fetchCategories(pagination.currentPage);
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
        await fetchCategories(pagination.currentPage);
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

  const handlePageChange = (page: number) => {
    fetchCategories(page, 10, searchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    fetchCategories(1, 10, searchTerm);
  }, [fetchCategories, searchTerm]);

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

      {/* Search */}
      {showSearch && (
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
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
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        category={selectedCategory}
        mode={modalMode}
        availableParents={categories}
      />
    </Container>
  );
};

export default CategoriesManager;