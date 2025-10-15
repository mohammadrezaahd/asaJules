"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, TextField, Box, Divider, Alert } from "@mui/material";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("Attempting to sign in with:", { email });

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    console.log("SignIn result:", result);

    if (result?.error) {
      console.error("SignIn error:", result.error);
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError(result.error);
      }
    } else if (result?.ok) {
      console.log("SignIn successful, redirecting...");
      router.push("/dashboard");
    } else {
      setError("An unexpected error occurred");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
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
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Sign In
      </Button>
      <Divider sx={{ my: 2 }}>OR</Divider>
      <Button fullWidth variant="outlined" onClick={handleGoogleSignIn}>
        Sign in with Google
      </Button>
    </Box>
  );
}
