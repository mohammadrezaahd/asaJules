'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, Divider, Alert, Typography, Link, CircularProgress } from '@mui/material';

export default function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        emailOrUsername,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="emailOrUsername"
        label="Email or Username"
        name="emailOrUsername"
        autoComplete="username"
        autoFocus
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        helperText="You can use your email address or username to sign in"
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
      </Button>
      <Divider sx={{ my: 2 }}>OR</Divider>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        Sign in with Google
      </Button>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" sx={{ textDecoration: 'none' }}>
            Sign up here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}