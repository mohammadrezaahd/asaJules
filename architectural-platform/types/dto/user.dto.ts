export interface CreateUserDto {
  name: string;
  surname: string;
  username: string;
  email: string;
  password?: string; // Optional for OAuth
  avatar?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  role?: 'ADMIN' | 'USER' | 'STUDENT' | 'COLLEAGUE';
}