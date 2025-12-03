// __tests__/unit/contexts/ThemeContext.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import { ThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, themeMode, setThemeMode, isDark, colors } = useTheme();

  return (
    <>
      <Text testID="theme-mode">{themeMode}</Text>
      <Text testID="is-dark">{isDark ? 'dark' : 'light'}</Text>
      <Text testID="primary-color">{colors.primary}</Text>
      <Button testID="set-light" title="Light" onPress={() => setThemeMode('light')} />
      <Button testID="set-dark" title="Dark" onPress={() => setThemeMode('dark')} />
      <Button testID="set-system" title="System" onPress={() => setThemeMode('system')} />
    </>
  );
};

describe('ThemeContext', () => {
  describe('ThemeProvider', () => {
    it('children\'ı render etmeli', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Text>Test Child</Text>
        </ThemeProvider>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });

    it('varsayılan tema modu "system" olmalı', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('system');
      });
    });
  });

  describe('useTheme hook', () => {
    it('tema değerlerini döndürmeli', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId('primary-color')).toBeTruthy();
    });

    it('tema modunu light olarak değiştirebilmeli', async () => {
      const { getByTestId, getByText } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('Light'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('light');
        expect(getByTestId('is-dark').props.children).toBe('light');
      });
    });

    it('tema modunu dark olarak değiştirebilmeli', async () => {
      const { getByTestId, getByText } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('Dark'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('dark');
        expect(getByTestId('is-dark').props.children).toBe('dark');
      });
    });

    it('tema modunu system olarak değiştirebilmeli', async () => {
      const { getByTestId, getByText } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('Dark'));
      });

      await act(async () => {
        fireEvent.press(getByText('System'));
      });

      await waitFor(() => {
        expect(getByTestId('theme-mode').props.children).toBe('system');
      });
    });
  });

  describe('Theme Colors', () => {
    it('light tema renkleri doğru olmalı', async () => {
      const { getByTestId, getByText } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('Light'));
      });

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color').props.children;
        expect(primaryColor).toBeDefined();
      });
    });

    it('dark tema renkleri doğru olmalı', async () => {
      const { getByTestId, getByText } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('Dark'));
      });

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color').props.children;
        expect(primaryColor).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('provider olmadan hook kullanılamaz', () => {
      // This should throw an error
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleError.mockRestore();
    });
  });
});
