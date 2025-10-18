// Central model registry to ensure all models are registered with Mongoose
// Import this file in any API route that uses populate() to avoid model registration errors

import User from '@/models/User';
import Category from '@/models/Category';
import Project from '@/models/Project';
import Article from '@/models/Article';
import Media from '@/models/Media';

// Export models for use (optional)
export {
  User,
  Category,
  Project,
  Article,
  Media
};

// This ensures all models are registered when this file is imported
const models = {
  User,
  Category,
  Project,
  Article,
  Media
};

export default models;