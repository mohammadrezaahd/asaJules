'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, Alert } from '@mui/material';
import { authApi } from '@/components/api';
import { CreateUserDto } from '@/types/dto/user.dto';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userData: CreateUserDto = {
      name,
      surname,
      username,
      email,
      password,
    };

    try {
      await authApi.register(userData);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Name"
        name="name"
        autoComplete="given-name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="surname"
        label="Surname"
        name="surname"
        autoComplete="family-name"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
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
        Sign Up
      </Button>
    </Box>
  );
}