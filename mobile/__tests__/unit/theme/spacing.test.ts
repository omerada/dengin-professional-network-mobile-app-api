// __tests__/unit/theme/spacing.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { spacing } from '../../../src/theme/spacing';

describe('Spacing', () => {
  describe('Spacing Scale', () => {
    it('tüm gerekli boyutları içermeli', () => {
      expect(spacing.none).toBeDefined();
      expect(spacing.xs).toBeDefined();
      expect(spacing.sm).toBeDefined();
      expect(spacing.md).toBeDefined();
      expect(spacing.lg).toBeDefined();
      expect(spacing.xl).toBeDefined();
      expect(spacing['2xl']).toBeDefined();
    });

    it('none 0 olmalı', () => {
      expect(spacing.none).toBe(0);
    });

    it('boyutlar artan sırada olmalı', () => {
      expect(spacing.xs).toBeLessThan(spacing.sm);
      expect(spacing.sm).toBeLessThan(spacing.md);
      expect(spacing.md).toBeLessThan(spacing.lg);
      expect(spacing.lg).toBeLessThan(spacing.xl);
      expect(spacing.xl).toBeLessThan(spacing['2xl']);
    });

    it('boyutlar pozitif sayı olmalı (none hariç)', () => {
      Object.entries(spacing).forEach(([key, value]) => {
        if (key !== 'none') {
          expect(value).toBeGreaterThan(0);
        }
        expect(typeof value).toBe('number');
      });
    });

    it('4px grid sistemine uygun olmalı (2xs hariç)', () => {
      // Values should be multiples of 4, except 2xs which is 2
      Object.entries(spacing).forEach(([key, value]) => {
        if (key !== '2xs') {
          expect(value % 4).toBe(0);
        }
      });
    });
  });

  describe('Extended Spacing Scale', () => {
    it('büyük spacing değerleri tanımlı olmalı', () => {
      expect(spacing['3xl']).toBeDefined();
      expect(spacing['4xl']).toBeDefined();
      expect(spacing['5xl']).toBeDefined();
      expect(spacing['6xl']).toBeDefined();
    });

    it('2xs değeri 2 olmalı', () => {
      expect(spacing['2xs']).toBe(2);
    });

    it('büyük değerler artan sırada olmalı', () => {
      expect(spacing['2xl']).toBeLessThan(spacing['3xl']);
      expect(spacing['3xl']).toBeLessThan(spacing['4xl']);
      expect(spacing['4xl']).toBeLessThan(spacing['5xl']);
    });
  });
});
