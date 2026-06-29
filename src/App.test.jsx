import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// We mock all the heavy page components to speed up the router tests
// and isolate routing logic from component rendering logic.
vi.mock('./pages/Home', () => ({ default: () => <div>Home Component</div> }));
vi.mock('./pages/Account', () => ({ default: () => <div>Account Component</div> }));
vi.mock('./pages/ArivaWebsite', () => ({ default: () => <div>Website Component</div> }));
vi.mock('./pages/BookingPage', () => ({ default: () => <div>Booking Component</div> }));
vi.mock('./pages/Dashboard', () => ({ 
  default: () => (
    <div>
      Dashboard Component
      <div data-testid="outlet">Mocked Outlet</div>
    </div>
  ) 
}));

describe('App Routing', () => {
  it('should render Home at root path', async () => {
    // Note: App internally defines a BrowserRouter, which clashes with MemoryRouter.
    // For proper unit testing, App usually takes a router as a prop or we test the Routes directly.
    // Since App has <Router>, we will just render App directly, which will render the root route.
    render(<App />);
    
    // We expect the mocked Home component (or in real life, the redirect text)
    expect(await screen.findByText('Home Component')).toBeInTheDocument();
  });
});
