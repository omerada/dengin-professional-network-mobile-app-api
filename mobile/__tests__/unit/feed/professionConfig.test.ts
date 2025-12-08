// __tests__/unit/feed/professionConfig.test.ts
// Meslektaş Design System - Profession Config Tests
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 692-780

import {
  getProfessionColor,
  getProfessionIcon,
  PROFESSION_COLORS,
  PROFESSION_ICONS,
  type ProfessionCategory,
} from '../../../src/features/feed/components/FeedHeader/professionConfig';

describe('professionConfig', () => {
  describe('PROFESSION_ICONS', () => {
    it('contains all 8 profession categories', () => {
      const categories: ProfessionCategory[] = [
        'MEDICAL',
        'LEGAL',
        'ENGINEERING',
        'EDUCATION',
        'SERVICE',
        'CREATIVE',
        'BUSINESS',
        'OTHER',
      ];

      categories.forEach(category => {
        expect(PROFESSION_ICONS[category]).toBeDefined();
        expect(typeof PROFESSION_ICONS[category]).toBe('string');
      });
    });

    it('has unique icons for each category', () => {
      const icons = Object.values(PROFESSION_ICONS);
      const uniqueIcons = new Set(icons);

      expect(uniqueIcons.size).toBe(icons.length);
    });

    it('contains valid Ionicons names', () => {
      // These are valid Ionicons icon names
      const validIcons = [
        'medical',
        'scale',
        'construct',
        'school',
        'briefcase',
        'color-palette',
        'trending-up',
        'people',
      ];

      Object.values(PROFESSION_ICONS).forEach(icon => {
        expect(validIcons).toContain(icon);
      });
    });
  });

  describe('PROFESSION_COLORS', () => {
    it('contains all 8 profession categories', () => {
      const categories: ProfessionCategory[] = [
        'MEDICAL',
        'LEGAL',
        'ENGINEERING',
        'EDUCATION',
        'SERVICE',
        'CREATIVE',
        'BUSINESS',
        'OTHER',
      ];

      categories.forEach(category => {
        expect(PROFESSION_COLORS[category]).toBeDefined();
        expect(typeof PROFESSION_COLORS[category]).toBe('string');
      });
    });

    it('has valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      Object.values(PROFESSION_COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('uses Material Design colors', () => {
      // Material Design palette colors
      expect(PROFESSION_COLORS.MEDICAL).toBe('#4CAF50'); // Green
      expect(PROFESSION_COLORS.LEGAL).toBe('#2196F3'); // Blue
      expect(PROFESSION_COLORS.ENGINEERING).toBe('#FF9800'); // Orange
      expect(PROFESSION_COLORS.EDUCATION).toBe('#9C27B0'); // Purple
      expect(PROFESSION_COLORS.SERVICE).toBe('#00BCD4'); // Cyan
      expect(PROFESSION_COLORS.CREATIVE).toBe('#E91E63'); // Pink
      expect(PROFESSION_COLORS.BUSINESS).toBe('#607D8B'); // Blue Grey
      expect(PROFESSION_COLORS.OTHER).toBe('#9E9E9E'); // Grey
    });
  });

  describe('getProfessionIcon', () => {
    it('returns correct icon for each category', () => {
      expect(getProfessionIcon('MEDICAL')).toBe('medical');
      expect(getProfessionIcon('LEGAL')).toBe('scale');
      expect(getProfessionIcon('ENGINEERING')).toBe('construct');
      expect(getProfessionIcon('EDUCATION')).toBe('school');
      expect(getProfessionIcon('SERVICE')).toBe('briefcase');
      expect(getProfessionIcon('CREATIVE')).toBe('color-palette');
      expect(getProfessionIcon('BUSINESS')).toBe('trending-up');
      expect(getProfessionIcon('OTHER')).toBe('people');
    });

    it('returns OTHER icon when category is undefined', () => {
      expect(getProfessionIcon()).toBe(PROFESSION_ICONS.OTHER);
      expect(getProfessionIcon(undefined)).toBe(PROFESSION_ICONS.OTHER);
    });

    it('returns OTHER icon for invalid category', () => {
      // @ts-expect-error Testing invalid category
      expect(getProfessionIcon('INVALID')).toBe(PROFESSION_ICONS.OTHER);
    });
  });

  describe('getProfessionColor', () => {
    it('returns correct color for each category', () => {
      expect(getProfessionColor('MEDICAL')).toBe('#4CAF50');
      expect(getProfessionColor('LEGAL')).toBe('#2196F3');
      expect(getProfessionColor('ENGINEERING')).toBe('#FF9800');
      expect(getProfessionColor('EDUCATION')).toBe('#9C27B0');
      expect(getProfessionColor('SERVICE')).toBe('#00BCD4');
      expect(getProfessionColor('CREATIVE')).toBe('#E91E63');
      expect(getProfessionColor('BUSINESS')).toBe('#607D8B');
      expect(getProfessionColor('OTHER')).toBe('#9E9E9E');
    });

    it('returns OTHER color when category is undefined', () => {
      expect(getProfessionColor()).toBe(PROFESSION_COLORS.OTHER);
      expect(getProfessionColor(undefined)).toBe(PROFESSION_COLORS.OTHER);
    });

    it('returns OTHER color for invalid category', () => {
      // @ts-expect-error Testing invalid category
      expect(getProfessionColor('INVALID')).toBe(PROFESSION_COLORS.OTHER);
    });
  });

  describe('Color-Icon Mapping', () => {
    it('maintains consistent category keys between colors and icons', () => {
      const colorKeys = Object.keys(PROFESSION_COLORS);
      const iconKeys = Object.keys(PROFESSION_ICONS);

      expect(colorKeys.sort()).toEqual(iconKeys.sort());
    });

    it('has same number of colors and icons', () => {
      expect(Object.keys(PROFESSION_COLORS).length).toBe(Object.keys(PROFESSION_ICONS).length);
    });
  });
});
