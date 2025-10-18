'use client';

import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  total,
  onPageChange, 
  loading = false 
}: PaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (totalPages <= 1) return null;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderTop: 1, 
        borderColor: 'divider',
        borderRadius: 0,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          Showing page <strong>{currentPage}</strong> of{' '}
          <strong>{totalPages}</strong> ({total} total categories)
        </Typography>
        
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handleChange}
          disabled={loading}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          showFirstButton={!isMobile}
          showLastButton={!isMobile}
        />
      </Box>
    </Paper>
  );
}