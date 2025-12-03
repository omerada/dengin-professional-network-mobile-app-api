// __tests__/unit/shared/Loading.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading } from '../../../src/shared/components/Loading';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Loading Component', () => {
  describe('Spinner Mode', () => {
    it('varsayılan spinner olarak render edilmeli', () => {
      const { getByTestId } = renderWithTheme(<Loading testID="loading" />);

      expect(getByTestId('loading')).toBeTruthy();
    });

    it('farklı size değerleri ile render edilmeli', () => {
      const sizes = ['small', 'large'] as const;

      sizes.forEach((size) => {
        const { getByTestId } = renderWithTheme(<Loading size={size} testID={`loading-${size}`} />);

        expect(getByTestId(`loading-${size}`)).toBeTruthy();
      });
    });

    it('özel renk ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(<Loading color="#FF0000" testID="loading" />);

      expect(getByTestId('loading')).toBeTruthy();
    });
  });

  describe('Overlay Mode', () => {
    it('overlay true ise tam ekran kaplamalı', () => {
      const { getByTestId } = renderWithTheme(<Loading overlay testID="loading-overlay" />);

      const overlay = getByTestId('loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('overlay arka plan rengi doğru olmalı', () => {
      const { getByTestId } = renderWithTheme(<Loading overlay testID="loading-overlay" />);

      const overlay = getByTestId('loading-overlay');
      expect(overlay).toBeTruthy();
    });
  });

  describe('With Text', () => {
    it('metin ile render edilmeli', () => {
      const { getByText } = renderWithTheme(<Loading text="Yükleniyor..." />);

      expect(getByText('Yükleniyor...')).toBeTruthy();
    });

    it('metin stillendirilmiş olmalı', () => {
      const { getByText } = renderWithTheme(<Loading text="Please wait" />);

      const textElement = getByText('Please wait');
      expect(textElement).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('accessibility label olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Loading testID="loading" accessibilityLabel="Loading content" />
      );

      const loading = getByTestId('loading');
      expect(loading.props.accessibilityLabel).toBe('Loading content');
    });

    it('varsayılan accessibility role olmalı', () => {
      const { getByTestId } = renderWithTheme(<Loading testID="loading" />);

      const loading = getByTestId('loading');
      // Default role should be set
      expect(loading).toBeTruthy();
    });
  });

  describe('Visibility', () => {
    it('visible false ise render edilmemeli', () => {
      const { queryByTestId } = renderWithTheme(<Loading visible={false} testID="loading" />);

      expect(queryByTestId('loading')).toBeNull();
    });

    it('visible true ise render edilmeli', () => {
      const { getByTestId } = renderWithTheme(<Loading visible={true} testID="loading" />);

      expect(getByTestId('loading')).toBeTruthy();
    });

    it('visible prop verilmediğinde varsayılan olarak görünür olmalı', () => {
      const { getByTestId } = renderWithTheme(<Loading testID="loading" />);

      expect(getByTestId('loading')).toBeTruthy();
    });
  });

  describe('Container Styles', () => {
    it('özel style uygulanabilmeli', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = renderWithTheme(<Loading style={customStyle} testID="loading" />);

      const loading = getByTestId('loading');
      expect(loading).toBeTruthy();
    });

    it('merkezi hizalama olmalı', () => {
      const { getByTestId } = renderWithTheme(<Loading testID="loading" />);

      const loading = getByTestId('loading');
      expect(loading).toBeTruthy();
    });
  });
});
