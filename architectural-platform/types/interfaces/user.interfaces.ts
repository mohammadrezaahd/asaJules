import { Project } from './project.interfaces';
import { Article } from './articles.interfaces';

export interface User {
  _id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  avatar: string;
  role: 'ADMIN' | 'USER' | 'STUDENT' | 'COLLEAGUE';
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