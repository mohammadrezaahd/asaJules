"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Box, Alert, CircularProgress, Typography, Link } from "@mui/material";
import { AxiosError } from "axios";
import { authApi } from "@/components/api";
import { CreateUserDto } from "@/types/dto/user.dto";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    setSuccess(null);

    const userData: CreateUserDto = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    try {
      // Register user
      const registerResponse = await authApi.register(userData);
      
      // Check if registration was successful
      if (!registerResponse.isSuccess) {
        // Handle API response errors
        const errorData = (registerResponse as unknown as { errorData?: { field?: string; message?: string } }).errorData;
        if (errorData?.field && typeof errorData.field === 'string') {
          setFieldErrors({ 
            [errorData.field]: errorData.message || registerResponse.error || "Field validation failed" 
          });
        } else {
          setError(registerResponse.error || "Registration failed");
        }
        return;
      }
      
      // Show success message
      setSuccess("Registration successful! Signing you in...");
      
      // Wait a moment for user to see the success message
      setTimeout(async () => {
        try {
          // Auto-login after successful registration
          const signInResult = await signIn('credentials', {
            redirect: false,
            emailOrUsername: email, // Use email for auto-login
            password: password,
          });

          if (signInResult?.error) {
            setSuccess(null); // Clear success message
            setError("Registration successful, but auto-login failed. Please login manually.");
          } else {
            // Update success message before redirect
            setSuccess("Registration successful! Redirecting to dashboard...");
            // Successful auto-login, redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          }
        } catch {
          setSuccess(null);
          setError("Registration successful, but auto-login failed. Please login manually.");
        }
      }, 1000);
      
    } catch (err: unknown) {
      // Clear success message when error occurs
      setSuccess(null);
      
      if (err instanceof AxiosError) {
        const errorData = err.response?.data;
        
        // Handle field-specific errors
        if (errorData?.field) {
          setFieldErrors({ [errorData.field]: errorData.message });
        } else {
          setError(errorData?.message || "An error occurred");
        }
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
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
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="firstname"
        label="First name"
        name="firstname"
        autoComplete="given-name"
        autoFocus
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="lastname"
        label="Last name"
        name="lastname"
        autoComplete="family-name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={isLoading}
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
        disabled={isLoading}
        error={!!fieldErrors.username}
        helperText={fieldErrors.username || "Choose a unique username (3-30 characters, letters, numbers, _ and - only)"}
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
        disabled={isLoading}
        error={!!fieldErrors.email}
        helperText={fieldErrors.email || ""}
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
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={20} color="inherit" /> : "Sign Up"}
      </Button>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link href="/auth/login" sx={{ textDecoration: 'none' }}>
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
