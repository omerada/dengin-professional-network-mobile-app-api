// __tests__/unit/theme/colors.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { lightTheme, darkTheme, colors } from '../../../src/theme/colors';

describe('Theme Colors', () => {
  describe('Light Theme', () => {
    it('tüm gerekli renk kategorilerini içermeli', () => {
      expect(lightTheme.primary).toBeDefined();
      expect(lightTheme.background).toBeDefined();
      expect(lightTheme.text).toBeDefined();
      expect(lightTheme.border).toBeDefined();
      expect(lightTheme.error).toBeDefined();
      expect(lightTheme.success).toBeDefined();
      expect(lightTheme.warning).toBeDefined();
    });

    it('primary renkler tanımlı olmalı', () => {
      expect(lightTheme.primary).toBeDefined();
      expect(typeof lightTheme.primary).toBe('object');
      expect(lightTheme.primary[500]).toBeDefined();
    });

    it('background renkleri tanımlı olmalı', () => {
      expect(lightTheme.background).toBeDefined();
      expect(lightTheme.background.primary).toBeDefined();
    });
  });

  describe('Dark Theme', () => {
    it('tüm gerekli renk kategorilerini içermeli', () => {
      expect(darkTheme.primary).toBeDefined();
      expect(darkTheme.background).toBeDefined();
      expect(darkTheme.text).toBeDefined();
      expect(darkTheme.border).toBeDefined();
      expect(darkTheme.error).toBeDefined();
      expect(darkTheme.success).toBeDefined();
      expect(darkTheme.warning).toBeDefined();
    });

    it('primary renkler tanımlı olmalı', () => {
      expect(darkTheme.primary).toBeDefined();
      expect(typeof darkTheme.primary).toBe('object');
      expect(darkTheme.primary[500]).toBeDefined();
    });

    it('background renkleri tanımlı olmalı', () => {
      expect(darkTheme.background).toBeDefined();
      expect(darkTheme.background.primary).toBeDefined();
    });
  });

  describe('Color Consistency', () => {
    it('light ve dark temaların aynı anahtarları olmalı', () => {
      const lightKeys = Object.keys(lightTheme).sort();
      const darkKeys = Object.keys(darkTheme).sort();

      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe('Semantic Colors', () => {
    it('error rengi tanımlı olmalı', () => {
      expect(lightTheme.error).toBeDefined();
      expect(darkTheme.error).toBeDefined();
    });

    it('success rengi tanımlı olmalı', () => {
      expect(lightTheme.success).toBeDefined();
      expect(darkTheme.success).toBeDefined();
    });

    it('warning rengi tanımlı olmalı', () => {
      expect(lightTheme.warning).toBeDefined();
      expect(darkTheme.warning).toBeDefined();
    });
  });

  describe('colors palette', () => {
    it('primary color palette tanımlı olmalı', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary[500]).toBeDefined();
    });

    it('neutral color palette tanımlı olmalı', () => {
      expect(colors.neutral).toBeDefined();
      expect(colors.neutral[0]).toBeDefined();
    });
  });
});
