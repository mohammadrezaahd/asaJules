import User from "@/models/User";

/**
 * Generate a unique username based on email
 */
export async function generateUniqueUsername(email: string): Promise<string> {
  const baseUsername = email.split('@')[0].toLowerCase();
  let username = baseUsername;
  let counter = 1;
  
  // Remove any non-alphanumeric characters except underscores and dashes
  username = username.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Ensure username is at least 3 characters
  if (username.length < 3) {
    username = `user_${username}`;
  }
  
  // Check if username exists and add numbers if needed
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
}

/**
 * Check if email or username already exists
 */
export async function checkUserExists(email: string, username: string, excludeUserId?: string) {
  const query: Record<string, unknown> = {
    $or: [{ email }, { username }]
  };
  
  // Exclude current user when updating profile
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  
  const existingUser = await User.findOne(query);
  
  if (existingUser) {
    if (existingUser.email === email) {
      return { exists: true, field: 'email', message: 'Email is already taken' };
    }
    if (existingUser.username === username) {
      return { exists: true, field: 'username', message: 'Username is already taken' };
    }
  }
  
  return { exists: false };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters long' };
  }
  
  // Only allow alphanumeric characters, underscores, and dashes
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and dashes' };
  }
  
  return { valid: true };
}