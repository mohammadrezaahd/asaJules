'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}