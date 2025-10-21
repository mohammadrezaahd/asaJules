import { Role } from '../role';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string; // Optional for OAuth
  avatarUrl?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  role?: Role;
}