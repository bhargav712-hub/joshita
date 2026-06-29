import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from './Home';

describe('Home Component', () => {
  it('should immediately redirect to /ariva-website', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ariva-website" element={<div>ARIVA Website Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Because it navigates immediately in useEffect, we should see the destination page content
    expect(screen.getByText('ARIVA Website Page')).toBeInTheDocument();
  });

  it('should render fallback link if routing fails', () => {
    // We can isolate the render without routing context to see the fallback text
    // although MemoryRouter usually resolves instantly.
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading ARIVA…/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /click here/i });
    expect(link).toHaveAttribute('href', '/ariva-website');
  });
});
