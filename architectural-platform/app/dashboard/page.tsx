'use client';

import React from 'react';
import { Typography } from '@mui/material';

const DashboardPage = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the admin dashboard. Here you can manage users, projects, articles, and other platform content.
      </Typography>
    </div>
  );
};

export default DashboardPage;