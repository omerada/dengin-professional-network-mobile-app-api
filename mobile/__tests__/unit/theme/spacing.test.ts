// __tests__/unit/theme/spacing.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { spacing, grid } from '../../../src/theme/spacing';

describe('Spacing', () => {
  describe('Spacing Scale', () => {
    it('tüm gerekli boyutları içermeli', () => {
      expect(spacing.none).toBeDefined();
      expect(spacing.xs).toBeDefined();
      expect(spacing.sm).toBeDefined();
      expect(spacing.md).toBeDefined();
      expect(spacing.lg).toBeDefined();
      expect(spacing.xl).toBeDefined();
      expect(spacing.xxl).toBeDefined();
    });

    it('none 0 olmalı', () => {
      expect(spacing.none).toBe(0);
    });

    it('boyutlar artan sırada olmalı', () => {
      expect(spacing.xs).toBeLessThan(spacing.sm);
      expect(spacing.sm).toBeLessThan(spacing.md);
      expect(spacing.md).toBeLessThan(spacing.lg);
      expect(spacing.lg).toBeLessThan(spacing.xl);
      expect(spacing.xl).toBeLessThan(spacing.xxl);
    });

    it('boyutlar pozitif sayı olmalı (none hariç)', () => {
      Object.entries(spacing).forEach(([key, value]) => {
        if (key !== 'none') {
          expect(value).toBeGreaterThan(0);
        }
        expect(typeof value).toBe('number');
      });
    });

    it('4/8px grid sistemine uygun olmalı', () => {
      // Values should be multiples of 4
      Object.values(spacing).forEach((value) => {
        expect(value % 4).toBe(0);
      });
    });
  });

  describe('Grid System', () => {
    it('base unit tanımlı olmalı', () => {
      expect(grid.base).toBeDefined();
      expect(grid.base).toBe(4);
    });

    it('container padding tanımlı olmalı', () => {
      expect(grid.containerPadding).toBeDefined();
      expect(grid.containerPadding).toBeGreaterThan(0);
    });

    it('gutter tanımlı olmalı', () => {
      expect(grid.gutter).toBeDefined();
      expect(grid.gutter).toBeGreaterThan(0);
    });

    it('değerler base unit çarpanı olmalı', () => {
      expect(grid.containerPadding % grid.base).toBe(0);
      expect(grid.gutter % grid.base).toBe(0);
    });
  });

  describe('Responsive Spacing', () => {
    it('screen padding tanımlı olmalı', () => {
      expect(spacing.screenPadding).toBeDefined();
      expect(spacing.screenPadding).toBeGreaterThan(0);
    });

    it('section spacing tanımlı olmalı', () => {
      expect(spacing.section).toBeDefined();
      expect(spacing.section).toBeGreaterThan(0);
    });
  });
});
