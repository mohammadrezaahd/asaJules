import { UserSummary } from './user.interfaces';

export interface Article {
  _id: string;
  title: string;
  content: string;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}