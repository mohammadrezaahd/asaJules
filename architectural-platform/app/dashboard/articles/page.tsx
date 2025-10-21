"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Checkbox,
  ListItemIcon,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { articlesApi } from "@/components/api";
import { Article, ArticleQueryParams, PaginationInfo } from "@/types";
import PaginationControls from "@/components/Common/PaginationControls";
import BulkSelectionControls from "@/components/Common/BulkSelectionControls";
import useBulkSelection from "@/components/Common/useBulkSelection";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<ArticleQueryParams>({
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  const bulkSelection = useBulkSelection({
    items: articles,
    getItemId: (article) => article._id,
  });

  const fetchArticles = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await articlesApi.getAll(filters);
      if (result.isSuccess && result.data) {
        setArticles(result.data);
        setPagination({
          totalItems: result.pagination?.totalItems || 0,
          totalPages: result.pagination?.totalPages || 1,
          currentPage: result.pagination?.currentPage || 1,
          itemsPerPage: result.pagination?.itemsPerPage || 12,
        });
      } else {
        setError(result.error || "Failed to fetch articles");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch articles";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (articleToDelete) {
      try {
        setIsDeleting(true);
        await articlesApi.delete(articleToDelete._id);
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
        fetchArticles();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete article";
        setError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkDelete = async (selectedArticles: Article[]) => {
    const ids = selectedArticles.map((article) => article._id);

    try {
      setIsDeleting(true);
      const result = await articlesApi.deleteMultiple(ids);

      if (result.isSuccess && result.data) {
        const { summary, failedDeletions } = result.data;

        if (failedDeletions.length > 0) {
          const errorDetails = failedDeletions
            .map(
              (f: { title: string; error: string }) => `${f.title}: ${f.error}`
            )
            .join("\n");
          setError(
            `Deleted ${summary.deleted} articles, but ${summary.failed} failed:\n${errorDetails}`
          );
        }

        fetchArticles();
      } else {
        setError(result.error || "Failed to delete articles");
      }
    } catch (error) {
      console.error("Failed to delete articles:", error);
      setError("Failed to delete articles");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: ArticleQueryParams) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters((prev: ArticleQueryParams) => ({ ...prev, limit: itemsPerPage, page: 1 }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Articles</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/articles/new"
        >
          Add New Article
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Bulk Selection Controls */}
      <BulkSelectionControls
        items={articles}
        selectedItems={bulkSelection.selectedItems}
        onSelectAll={bulkSelection.selectAll}
        onClearSelection={bulkSelection.clearSelection}
        onBulkDelete={handleBulkDelete}
        showBulkActions={bulkSelection.showBulkActions}
        onToggleBulkActions={bulkSelection.toggleBulkActions}
        itemName="articles"
        getItemId={(article) => article._id}
        getItemDisplayName={(article) => article.title}
        isDeleting={isDeleting}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {articles?.map((article) => (
            <ListItem
              key={article._id}
              onClick={
                bulkSelection.showBulkActions
                  ? () => bulkSelection.selectItem(article)
                  : undefined
              }
              sx={{
                cursor: bulkSelection.showBulkActions ? "pointer" : "default",
                borderRadius: 1,
                mb: 1,
                backgroundColor: bulkSelection.isItemSelected(article)
                  ? "action.selected"
                  : "transparent",
              }}
              secondaryAction={
                !bulkSelection.showBulkActions ? (
                  <>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      component={Link}
                      href={`/dashboard/articles/edit/${article._id}`}
                      disabled={isDeleting}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(article)}
                      disabled={isDeleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : undefined
              }
            >
              {bulkSelection.showBulkActions && (
                <ListItemIcon>
                  <Checkbox
                    checked={bulkSelection.isItemSelected(article)}
                    onChange={() => bulkSelection.selectItem(article)}
                  />
                </ListItemIcon>
              )}
              <ListItemText
                primary={article.title}
                secondary={`Published: ${article.published ? "Yes" : "No"}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 12}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="articles"
        showItemsInfo={true}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Article</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the article &quot;
            {articleToDelete?.title}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}