"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { User } from "@/types";
import { usersApi } from "@/components/api";
import BulkSelectionControls from "@/components/Common/BulkSelectionControls";
import useBulkSelection from "@/components/Common/useBulkSelection";
import PaginationControls from "@/components/Common/PaginationControls";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const bulkSelection = useBulkSelection({
    items: users,
    getItemId: (user) => user._id,
  });

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError("");
      const result = await usersApi.getAll({ page, limit });
      
      if (result.isSuccess && result.data) {
        setUsers(result.data);
        setPagination({
          totalItems: result.pagination.totalItems || 0,
          totalPages: result.pagination.totalPages || 1,
          currentPage: result.pagination.currentPage || 1,
          itemsPerPage: result.pagination.itemsPerPage || 10,
        });
      } else {
        setError(result.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSingleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setIsDeleting(true);
      const result = await usersApi.delete(id);
      
      if (result.isSuccess) {
        await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
      } else {
        setError(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async (selectedUsers: User[]) => {
    const ids = selectedUsers.map(user => user._id);
    
    try {
      setIsDeleting(true);
      const result = await usersApi.deleteMultiple(ids);
      
      if (result.isSuccess && result.data) {
        const { summary, failedDeletions } = result.data;
        
        if (failedDeletions.length > 0) {
          const errorDetails = failedDeletions.map((f: { username: string; error: string }) => `${f.username}: ${f.error}`).join('\n');
          setError(`Deleted ${summary.deleted} users, but ${summary.failed} failed:\n${errorDetails}`);
        }
        
        await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
      } else {
        setError(result.error || "Failed to delete users");
      }
    } catch (error) {
      console.error("Failed to delete users:", error);
      setError("Failed to delete users");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.itemsPerPage);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    fetchUsers(1, itemsPerPage);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Bulk Selection Controls */}
      <BulkSelectionControls
        items={users}
        selectedItems={bulkSelection.selectedItems}
        onSelectAll={bulkSelection.selectAll}
        onClearSelection={bulkSelection.clearSelection}
        onBulkDelete={handleBulkDelete}
        showBulkActions={bulkSelection.showBulkActions}
        onToggleBulkActions={bulkSelection.toggleBulkActions}
        itemName="users"
        getItemId={(user) => user._id}
        getItemDisplayName={(user) => user.username || user.email}
        isDeleting={isDeleting}
      />

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Users Table */}
      {!loading && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {bulkSelection.showBulkActions && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={bulkSelection.isAllSelected}
                        indeterminate={bulkSelection.isSomeSelected}
                        onChange={bulkSelection.selectAll}
                      />
                    </TableCell>
                  )}
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  {!bulkSelection.showBulkActions && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user._id}
                    hover={bulkSelection.showBulkActions}
                    selected={bulkSelection.isItemSelected(user)}
                    onClick={bulkSelection.showBulkActions ? () => bulkSelection.selectItem(user) : undefined}
                    sx={{ cursor: bulkSelection.showBulkActions ? 'pointer' : 'default' }}
                  >
                    {bulkSelection.showBulkActions && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={bulkSelection.isItemSelected(user)}
                          onChange={() => bulkSelection.selectItem(user)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      {user.name} {user.surname}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    {!bulkSelection.showBulkActions && (
                      <TableCell>
                        <Tooltip title="Delete user">
                          <IconButton
                            onClick={() => handleSingleDelete(user._id)}
                            color="error"
                            disabled={isDeleting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <PaginationControls
            pagination={pagination}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemLabel="users"
          />
        </>
      )}
    </div>
  );
};

export default UsersPage;
