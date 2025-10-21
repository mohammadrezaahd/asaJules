"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
  Container,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { usersApi } from "@/components/api/users.api";
import { User } from "@/types";
import { UpdateUserDto } from "@/types/dto/user.dto";
import AvatarUploader from "@/components/AvatarUploader";
import { AxiosError } from "axios";

const Profile = () => {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "", 
    email: "",
    avatarUrl: "",
  });

import { Role } from "@/types/role";

  // Check if current user can edit this profile
  const canEdit = session?.user?.id === id || session?.user?.role === Role.ADMIN;

  useEffect(() => {
    if (status === "loading" || !id) return;
    
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await usersApi.getById(id as string);
        
        if (response.isSuccess && response.data) {
          setUser(response.data);
          setFormData({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            username: response.data.username || "",
            email: response.data.email || "",
            avatarUrl: response.data.avatarUrl || "",
          });
        } else {
          setError("Failed to load user profile");
        }
      } catch (err) {
        setError("Error loading user profile");
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, status]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      setFieldErrors({});

      const updateData: UpdateUserDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
      };

      const response = await usersApi.update(id as string, updateData);
      
      if (response.isSuccess && response.data) {
        setUser(response.data);
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Handle API response errors
        const errorData = (response as unknown as { errorData?: { field?: string; message?: string } }).errorData;
        if (errorData?.field && typeof errorData.field === 'string') {
          setFieldErrors({ 
            [errorData.field]: errorData.message || response.error || "Field validation failed"
          });
        } else {
          setError(response.error || "Failed to update profile");
        }
      }
    } catch (err) {
      // Handle field-specific errors from Axios error response
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data;
        if (errorData.field && typeof errorData.field === 'string') {
          setFieldErrors({ 
            [errorData.field]: errorData.error || errorData.message || "Field validation failed"
          });
        } else {
          setError(errorData.error || errorData.message || "Error updating profile");
        }
      } else {
        setError("Error updating profile");
      }
      console.error("Error updating user:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  if (status === "loading" || isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          User not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {canEdit && session?.user?.id === id ? "My Profile" : `${user.firstName} ${user.lastName}`}
          </Typography>
          
          {canEdit && !isEditing && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
          
          {isEditing && (
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={20} /> : "Save"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Profile Content */}
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
          {/* Avatar Section */}
          <Box flex={{ md: 1 }} display="flex" flexDirection="column" alignItems="center">
            {isEditing ? (
              <AvatarUploader
                currentAvatarUrl={user.avatarUrl}
                userInitials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                onAvatarChange={(url) => handleInputChange("avatarUrl", url)}
                disabled={isSaving}
              />
            ) : (
              <Avatar
                src={user.avatarUrl}
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
            )}
            
            {!isEditing && (
              <Box textAlign="center" mt={2}>
                <Chip
                  label={user.role}
                  color={user.role === Role.ADMIN ? "secondary" : "primary"}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Profile Information */}
          <Box flex={{ md: 2 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={isEditing ? formData.firstName : user.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
                
                <TextField
                  fullWidth
                  label="Last Name"
                  value={isEditing ? formData.lastName : user.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Username"
                value={isEditing ? formData.username : user.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={isEditing && !!fieldErrors.username}
                helperText={isEditing && (fieldErrors.username || "Choose a unique username (3-30 characters, letters, numbers, _ and - only)")}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={isEditing ? formData.email : user.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                error={isEditing && !!fieldErrors.email}
                helperText={isEditing && fieldErrors.email}
              />
            </Box>
          </Box>
        </Box>

        {/* Access Information */}
        {!canEdit && (
          <Alert severity="info" sx={{ mt: 3 }}>
            You are viewing {user.firstName} {user.lastName}&apos;s profile in read-only mode.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
