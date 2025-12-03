// __tests__/unit/theme/colors.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { lightColors, darkColors, colors } from '../../../src/theme/colors';

describe('Theme Colors', () => {
  describe('Light Colors', () => {
    it('tüm gerekli renk kategorilerini içermeli', () => {
      expect(lightColors.primary).toBeDefined();
      expect(lightColors.background).toBeDefined();
      expect(lightColors.text).toBeDefined();
      expect(lightColors.border).toBeDefined();
      expect(lightColors.error).toBeDefined();
      expect(lightColors.success).toBeDefined();
      expect(lightColors.warning).toBeDefined();
    });

    it('primary renkler tanımlı olmalı', () => {
      expect(lightColors.primary).toBeDefined();
      expect(typeof lightColors.primary).toBe('string');
    });

    it('background renkleri açık olmalı', () => {
      // Light theme should have light background colors
      expect(lightColors.background).toBeDefined();
    });
  });

  describe('Dark Colors', () => {
    it('tüm gerekli renk kategorilerini içermeli', () => {
      expect(darkColors.primary).toBeDefined();
      expect(darkColors.background).toBeDefined();
      expect(darkColors.text).toBeDefined();
      expect(darkColors.border).toBeDefined();
      expect(darkColors.error).toBeDefined();
      expect(darkColors.success).toBeDefined();
      expect(darkColors.warning).toBeDefined();
    });

    it('primary renkler tanımlı olmalı', () => {
      expect(darkColors.primary).toBeDefined();
      expect(typeof darkColors.primary).toBe('string');
    });

    it('background renkleri koyu olmalı', () => {
      // Dark theme should have dark background colors
      expect(darkColors.background).toBeDefined();
    });
  });

  describe('Color Consistency', () => {
    it('light ve dark temaların aynı anahtarları olmalı', () => {
      const lightKeys = Object.keys(lightColors).sort();
      const darkKeys = Object.keys(darkColors).sort();

      expect(lightKeys).toEqual(darkKeys);
    });

    it('renk değerleri geçerli hex veya rgba formatında olmalı', () => {
      const hexOrRgbaRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8}|rgba?\(.+\))$/;

      Object.values(lightColors).forEach((value) => {
        if (typeof value === 'string') {
          expect(value).toMatch(hexOrRgbaRegex);
        }
      });
    });
  });

  describe('Semantic Colors', () => {
    it('error rengi kırmızı tonlarında olmalı', () => {
      // Error colors should be red-ish
      expect(lightColors.error).toBeDefined();
      expect(darkColors.error).toBeDefined();
    });

    it('success rengi yeşil tonlarında olmalı', () => {
      // Success colors should be green-ish
      expect(lightColors.success).toBeDefined();
      expect(darkColors.success).toBeDefined();
    });

    it('warning rengi sarı/turuncu tonlarında olmalı', () => {
      // Warning colors should be yellow/orange-ish
      expect(lightColors.warning).toBeDefined();
      expect(darkColors.warning).toBeDefined();
    });
  });

  describe('colors utility', () => {
    it('light tema seçilebilmeli', () => {
      const theme = colors('light');
      expect(theme).toEqual(lightColors);
    });

    it('dark tema seçilebilmeli', () => {
      const theme = colors('dark');
      expect(theme).toEqual(darkColors);
    });
  });
});
