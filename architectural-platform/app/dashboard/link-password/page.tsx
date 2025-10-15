'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { authApi } from '@/components/api';

export default function LinkPasswordPage() {
  const { data: session } = useSession();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await authApi.linkPassword(password);
      setSuccess('Password set successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h4">Set a Password</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Set Password
      </Button>
    </Box>
  );
}