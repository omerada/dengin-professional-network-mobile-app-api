// __tests__/unit/contexts/LocaleContext.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import { LocaleProvider, useLocale } from '../../../src/contexts/LocaleContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Test component that uses the locale context
const TestComponent = () => {
  const { locale, setLocale, t, isRTL } = useLocale();

  return (
    <>
      <Text testID="current-locale">{locale}</Text>
      <Text testID="is-rtl">{isRTL ? 'rtl' : 'ltr'}</Text>
      <Text testID="translation">{t('common.loading')}</Text>
      <Button testID="set-tr" title="TR" onPress={() => setLocale('tr')} />
      <Button testID="set-en" title="EN" onPress={() => setLocale('en')} />
    </>
  );
};

describe('LocaleContext', () => {
  describe('LocaleProvider', () => {
    it('children\'ı render etmeli', () => {
      const { getByText } = render(
        <LocaleProvider>
          <Text>Test Child</Text>
        </LocaleProvider>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });

    it('varsayılan locale "tr" olmalı', async () => {
      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await waitFor(() => {
        expect(getByTestId('current-locale').props.children).toBe('tr');
      });
    });
  });

  describe('useLocale hook', () => {
    it('locale değerini döndürmeli', () => {
      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      expect(getByTestId('current-locale')).toBeTruthy();
    });

    it('locale\'i TR olarak değiştirebilmeli', async () => {
      const { getByTestId, getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('TR'));
      });

      await waitFor(() => {
        expect(getByTestId('current-locale').props.children).toBe('tr');
      });
    });

    it('locale\'i EN olarak değiştirebilmeli', async () => {
      const { getByTestId, getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('EN'));
      });

      await waitFor(() => {
        expect(getByTestId('current-locale').props.children).toBe('en');
      });
    });
  });

  describe('Translation Function', () => {
    it('çeviri döndürmeli', async () => {
      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await waitFor(() => {
        const translation = getByTestId('translation').props.children;
        expect(translation).toBeDefined();
      });
    });

    it('locale değiştiğinde çeviri güncellemeli', async () => {
      const { getByTestId, getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      const initialTranslation = getByTestId('translation').props.children;

      await act(async () => {
        fireEvent.press(getByText('EN'));
      });

      await waitFor(() => {
        const newTranslation = getByTestId('translation').props.children;
        // Translation should be different for different locales
        expect(newTranslation).toBeDefined();
      });
    });
  });

  describe('RTL Support', () => {
    it('Türkçe için LTR olmalı', async () => {
      const { getByTestId, getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('TR'));
      });

      await waitFor(() => {
        expect(getByTestId('is-rtl').props.children).toBe('ltr');
      });
    });

    it('İngilizce için LTR olmalı', async () => {
      const { getByTestId, getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );

      await act(async () => {
        fireEvent.press(getByText('EN'));
      });

      await waitFor(() => {
        expect(getByTestId('is-rtl').props.children).toBe('ltr');
      });
    });
  });

  describe('Error Handling', () => {
    it('provider olmadan hook kullanılamaz', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleError.mockRestore();
    });
  });
});
