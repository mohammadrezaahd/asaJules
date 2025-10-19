"use client";

import React from "react";
import {
  Box,
  Pagination,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { PaginationInfo } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsInfo?: boolean;
  itemLabel?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [6, 12, 24, 48],
  showItemsInfo = true,
  itemLabel = "items",
}) => {
  const { totalItems = 0, totalPages = 1 } = pagination;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newItemsPerPage = event.target.value as number;
    onItemsPerPageChange(newItemsPerPage);
  };

  if (totalPages <= 1 && !showItemsInfo) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {showItemsInfo && totalItems > 0 && (
        <Typography variant="body2" color="text.secondary">
          Showing {startItem}-{endItem} of {totalItems} {itemLabel}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Per Page"
          >
            {itemsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        )}
      </Box>
    </Box>
  );
};

export default PaginationControls;
