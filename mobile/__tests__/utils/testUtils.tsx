// __tests__/utils/testUtils.tsx
// Test utilities for React Native Testing Library

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import { LocaleProvider } from '../../src/contexts/LocaleContext';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
}

// Wrapper component with all providers
const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <NavigationContainer>{children}</NavigationContainer>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Custom render function that wraps component with all providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Additional test utilities

/**
 * Wait for a specified amount of time
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock user object
 */
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  verificationStatus: 'VERIFIED' as const,
  role: 'USER' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'test-request-id',
  },
});

/**
 * Create a mock paginated response
 */
export const createMockPaginatedResponse = <T>(
  items: T[],
  page = 0,
  totalPages = 1,
  totalElements = items.length
) => ({
  success: true,
  data: {
    content: items,
    page,
    size: 20,
    totalElements,
    totalPages,
    hasNext: page < totalPages - 1,
    hasPrevious: page > 0,
  },
});

/**
 * Create a mock error response
 */
export const createMockErrorResponse = (
  code: string,
  message: string,
  status = 400
) => ({
  success: false,
  error: {
    code,
    message,
    status,
    timestamp: new Date().toISOString(),
  },
});

/**
 * Flush all pending promises
 */
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Mock console methods
 */
export const mockConsole = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });
};

/**
 * Create a deferred promise for testing async behavior
 */
export const createDeferredPromise = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};
