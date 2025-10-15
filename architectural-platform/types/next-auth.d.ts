import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      avatarUrl?: string | null;
      provider?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    role: string;
    avatarUrl?: string | null;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
    avatarUrl?: string | null;
    provider?: string;
  }
}