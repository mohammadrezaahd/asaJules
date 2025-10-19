import { UserSummary } from './user.interfaces';

export interface Article {
  _id: string;
  title: string;
  content: string;
  published: boolean;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
  author?: string;
}