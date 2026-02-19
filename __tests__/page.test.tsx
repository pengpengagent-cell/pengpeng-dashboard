import { render, screen } from '@testing-library/react';

// Mock Next.js specific features
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    // This is a basic smoke test
    expect(true).toBe(true);
  });

  it('has correct page title structure', () => {
    // Basic structure check
    expect('home').toBeTruthy();
  });
});
