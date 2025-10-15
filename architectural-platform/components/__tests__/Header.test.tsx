import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders a heading', () => {
    render(<Header />);

    const heading = screen.getByRole('link', {
      name: /3darch/i,
    });

    expect(heading).toBeInTheDocument();
  });
});