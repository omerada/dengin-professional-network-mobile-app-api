// __tests__/unit/theme/typography.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { typography, fontSize, fontWeight, lineHeight } from '../../../src/theme/typography';

// Create aliases to match expected test interface
const fontSizes = {
  xs: fontSize.xs,
  sm: fontSize.sm,
  md: fontSize.md,
  lg: fontSize.lg,
  xl: fontSize.xl,
  xxl: fontSize['2xl'],
};

const fontWeights = {
  regular: fontWeight.regular,
  medium: fontWeight.medium,
  semibold: fontWeight.semibold,
  bold: fontWeight.bold,
};

const lineHeights = {
  tight: lineHeight.tight,
  normal: lineHeight.normal,
  relaxed: lineHeight.relaxed,
};

describe('Typography', () => {
  describe('Font Sizes', () => {
    it('tüm gerekli boyutları içermeli', () => {
      expect(fontSizes.xs).toBeDefined();
      expect(fontSizes.sm).toBeDefined();
      expect(fontSizes.md).toBeDefined();
      expect(fontSizes.lg).toBeDefined();
      expect(fontSizes.xl).toBeDefined();
      expect(fontSizes.xxl).toBeDefined();
    });

    it('boyutlar artan sırada olmalı', () => {
      expect(fontSizes.xs).toBeLessThan(fontSizes.sm);
      expect(fontSizes.sm).toBeLessThan(fontSizes.md);
      expect(fontSizes.md).toBeLessThan(fontSizes.lg);
      expect(fontSizes.lg).toBeLessThan(fontSizes.xl);
      expect(fontSizes.xl).toBeLessThan(fontSizes.xxl);
    });

    it('boyutlar pozitif sayı olmalı', () => {
      Object.values(fontSizes).forEach(size => {
        expect(size).toBeGreaterThan(0);
        expect(typeof size).toBe('number');
      });
    });
  });

  describe('Font Weights', () => {
    it('tüm gerekli ağırlıkları içermeli', () => {
      expect(fontWeights.regular).toBeDefined();
      expect(fontWeights.medium).toBeDefined();
      expect(fontWeights.semibold).toBeDefined();
      expect(fontWeights.bold).toBeDefined();
    });

    it('ağırlıklar geçerli değerlerde olmalı', () => {
      const validWeights = [
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
        'normal',
        'bold',
      ];

      Object.values(fontWeights).forEach(weight => {
        expect(validWeights).toContain(weight);
      });
    });
  });

  describe('Line Heights', () => {
    it('tüm gerekli satır yüksekliklerini içermeli', () => {
      expect(lineHeights.tight).toBeDefined();
      expect(lineHeights.normal).toBeDefined();
      expect(lineHeights.relaxed).toBeDefined();
    });

    it('satır yükseklikleri pozitif olmalı', () => {
      Object.values(lineHeights).forEach(height => {
        expect(height).toBeGreaterThan(0);
      });
    });

    it('satır yükseklikleri artan sırada olmalı', () => {
      expect(lineHeights.tight).toBeLessThan(lineHeights.normal);
      expect(lineHeights.normal).toBeLessThan(lineHeights.relaxed);
    });
  });

  describe('Typography Presets', () => {
    it('heading presetleri tanımlı olmalı', () => {
      expect(typography.h1).toBeDefined();
      expect(typography.h2).toBeDefined();
      expect(typography.h3).toBeDefined();
    });

    it('body presetleri tanımlı olmalı', () => {
      expect(typography.body).toBeDefined();
      expect(typography.bodySmall).toBeDefined();
    });

    it('caption preset tanımlı olmalı', () => {
      expect(typography.caption).toBeDefined();
    });

    it('presetler gerekli özellikleri içermeli', () => {
      const requiredProps = ['fontSize', 'fontWeight', 'lineHeight'];

      Object.values(typography).forEach(preset => {
        requiredProps.forEach(prop => {
          expect(preset).toHaveProperty(prop);
        });
      });
    });

    it('heading boyutları azalan sırada olmalı', () => {
      expect(typography.h1.fontSize).toBeGreaterThan(typography.h2.fontSize);
      expect(typography.h2.fontSize).toBeGreaterThan(typography.h3.fontSize);
    });
  });
});
