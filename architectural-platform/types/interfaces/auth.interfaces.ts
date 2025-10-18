import { User } from './user.interfaces';

export interface AuthResponse {
  token: string;
  user: User;
}