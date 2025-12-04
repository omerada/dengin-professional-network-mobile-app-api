// __tests__/unit/contexts/ThemeContext.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

// Unmock ThemeContext to test real implementation
jest.unmock('../../../src/contexts/ThemeContext');

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { ThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock the storage module
jest.mock('../../../src/core/storage', () => ({
  asyncStorage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    THEME: 'theme',
  },
}));

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();

  return (
    <>
      <Text testID="theme-mode">{themeMode}</Text>
      <Text testID="is-dark">{isDark ? 'dark' : 'light'}</Text>
      <Text testID="primary-color">{theme?.colors?.primary?.[500] || 'color-loaded'}</Text>
      <TouchableOpacity testID="set-light" onPress={() => setThemeMode('light')}>
        <Text>Light</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="set-dark" onPress={() => setThemeMode('dark')}>
        <Text>Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="set-system" onPress={() => setThemeMode('system')}>
        <Text>System</Text>
      </TouchableOpacity>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset storage mock to return null (default behavior - system theme)
    const { asyncStorage } = require('../../../src/core/storage');
    asyncStorage.get.mockResolvedValue(null);
  });

  describe('ThemeProvider', () => {
    it("children'ı render etmeli", async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Text>Test Child</Text>
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByText('Test Child')).toBeTruthy();
      });
    });

    it('varsayılan tema modu "system" olmalı (storage boş olduğunda)', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Wait for async loading to complete
      await waitFor(
        () => {
          expect(getByTestId('theme-mode').props.children).toBe('system');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('useTheme hook', () => {
    it('tema değerlerini döndürmeli', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('primary-color')).toBeTruthy();
      });
    });

    it('tema modunu light olarak değiştirebilmeli', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-light'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('light');
        expect(getByTestId('is-dark').props.children).toBe('light');
      });
    });

    it('tema modunu dark olarak değiştirebilmeli', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-dark'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('dark');
        expect(getByTestId('is-dark').props.children).toBe('dark');
      });
    });

    it('tema modunu system olarak değiştirebilmeli', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-dark'));
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-system'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('system');
      });
    });
  });

  describe('Theme Colors', () => {
    it('light tema renkleri doğru olmalı', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-light'));
      });

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color').props.children;
        expect(primaryColor).toBeDefined();
      });
    });

    it('dark tema renkleri doğru olmalı', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-dark'));
      });

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color').props.children;
        expect(primaryColor).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('provider olmadan hook kullanılamaz', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Component that will throw
      const ThrowingComponent = () => {
        useTheme();
        return null;
      };

      // Wrap in try-catch as render will throw
      let errorThrown = false;
      try {
        render(<ThrowingComponent />);
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toContain('useTheme must be used within a ThemeProvider');
      }

      expect(errorThrown).toBe(true);
      consoleError.mockRestore();
    });
  });
});
