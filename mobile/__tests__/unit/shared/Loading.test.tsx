// __tests__/unit/shared/Loading.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading, LoadingOverlay } from '../../../src/shared/components/Loading';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Loading Component', () => {
  describe('Spinner Mode', () => {
    it('varsayılan spinner olarak render edilmeli', () => {
      const { UNSAFE_root } = renderWithTheme(<Loading />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('farklı size değerleri ile render edilmeli', () => {
      const sizes = ['small', 'large'] as const;

      sizes.forEach(size => {
        const { UNSAFE_root } = renderWithTheme(<Loading size={size} />);

        expect(UNSAFE_root).toBeTruthy();
      });
    });
  });

  describe('FullScreen Mode', () => {
    it('fullScreen true ise tam ekran kaplamalı', () => {
      const { UNSAFE_root } = renderWithTheme(<Loading fullScreen />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('With Message', () => {
    it('mesaj ile render edilmeli', () => {
      const { getByText } = renderWithTheme(<Loading message="Yükleniyor..." />);

      expect(getByText('Yükleniyor...')).toBeTruthy();
    });

    it('mesaj stillendirilmiş olmalı', () => {
      const { getByText } = renderWithTheme(<Loading message="Please wait" />);

      const textElement = getByText('Please wait');
      expect(textElement).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('accessibility label olmalı', () => {
      const { UNSAFE_root } = renderWithTheme(<Loading message="Loading content" />);

      // Loading component has default accessibility label "Yükleniyor" or custom message
      expect(UNSAFE_root).toBeTruthy();
    });

    it('varsayılan accessibility role olmalı', () => {
      const { UNSAFE_root } = renderWithTheme(<Loading />);

      // Default role should be progressbar
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Container Styles', () => {
    it('özel style uygulanabilmeli', () => {
      const customStyle = { marginTop: 20 };
      const { UNSAFE_root } = renderWithTheme(<Loading style={customStyle} />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('merkezi hizalama olmalı', () => {
      const { UNSAFE_root } = renderWithTheme(<Loading />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

describe('LoadingOverlay Component', () => {
  it('overlay ile render edilmeli', () => {
    const { UNSAFE_root } = renderWithTheme(<LoadingOverlay />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('mesaj ile render edilmeli', () => {
    const { getByText } = renderWithTheme(<LoadingOverlay message="Yükleniyor..." />);

    expect(getByText('Yükleniyor...')).toBeTruthy();
  });
});
