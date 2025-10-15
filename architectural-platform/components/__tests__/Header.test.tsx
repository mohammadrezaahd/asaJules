import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { SessionProvider } from 'next-auth/react';

describe('Header', () => {
  it('renders login and register buttons when logged out', () => {
    render(
      <SessionProvider session={null}>
        <Header />
      </SessionProvider>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders the avatar menu when logged in', () => {
    const mockSession = {
      user: {
        id: '1',
        username: 'testuser',
        role: 'USER',
        avatarUrl: 'https://via.placeholder.com/150',
        provider: 'credentials',
      },
      expires: '1',
    };
    render(
      <SessionProvider session={mockSession}>
        <Header />
      </SessionProvider>
    );
    expect(screen.getByLabelText('open user menu')).toBeInTheDocument();
  });
});