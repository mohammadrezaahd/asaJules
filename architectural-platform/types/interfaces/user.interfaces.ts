import { Project } from './project.interfaces';
import { Article } from './articles.interfaces';

import { Role } from '../role';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: Role;
  bookmarks: {
    projects: string[];
    articles: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  _id: string;
  username: string;
  avatar: string;
}