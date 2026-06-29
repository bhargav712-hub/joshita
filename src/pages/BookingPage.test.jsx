import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingPage from './BookingPage';
import { MemoryRouter } from 'react-router-dom';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  CheckCircle2: () => <div data-testid="icon-check">CheckIcon</div>,
  ArrowRight: () => <div data-testid="icon-arrow-right">ArrowIcon</div>,
  Utensils: () => <div data-testid="icon-utensils">UtensilsIcon</div>,
  Coffee: () => <div data-testid="icon-coffee">CoffeeIcon</div>,
  Wine: () => <div data-testid="icon-wine">WineIcon</div>,
  IceCream: () => <div data-testid="icon-ice-cream">IceCreamIcon</div>,
  GlassWater: () => <div data-testid="icon-glass">GlassIcon</div>,
}));

describe('BookingPage Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderBookingPage = () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>
    );
  };

  it('renders Step 1 (Package Selection) initially', async () => {
    renderBookingPage();
    
    // Check if the title is present (use findByText to wait for loading to finish)
    expect(await screen.findByText(/Choose your experience/i)).toBeInTheDocument();
    
    // Check if the packages are rendered
    expect(screen.getByText('Intimate Package')).toBeInTheDocument();
    expect(screen.getByText('Signature Package')).toBeInTheDocument();
  });

  it('navigates to Step 2 when a package is selected', async () => {
    renderBookingPage();
    
    // Wait for data to load and click a package
    const selectBtn = await screen.findByRole('button', { name: /Select Intimate/i });
    fireEvent.click(selectBtn);
    
    // Verify we moved to Step 2 by checking for the Step 2 title
    expect(await screen.findByText(/Curate your menu/i)).toBeInTheDocument();
    
    // The "Continue" button on Step 2 should be present (though it might be disabled if no menu items selected)
    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeInTheDocument();
  });
});
