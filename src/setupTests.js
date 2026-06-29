import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase globally so tests don't hit the real database
vi.mock('./supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
      from: vi.fn((table) => {
        const mockData = {
          'packages': [
            { id: 1, name: 'Intimate Package', price_per_person: 1000, description: 'Intimate', package_category_limits: [] },
            { id: 2, name: 'Signature Package', price_per_person: 2000, description: 'Signature', package_category_limits: [] },
            { id: 3, name: 'Curated Package', price_per_person: 3000, description: 'Curated', package_category_limits: [] }
          ],
          'menu_categories': [],
          'menu_items': [],
          'menu_item_variants': []
        };
        
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockData[table] || [],
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockData[table] || [],
                error: null,
              }),
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              })
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            })
          })
        };
      }),
    },
  };
});

// Mock window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
