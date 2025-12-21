// __tests__/unit/navigation/linking.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { linking as linkingConfig } from '../../../src/core/navigation/linking';

describe('Navigation Linking', () => {
  describe('Linking Config', () => {
    it('prefixes tanımlı olmalı', () => {
      expect(linkingConfig.prefixes).toBeDefined();
      expect(Array.isArray(linkingConfig.prefixes)).toBe(true);
      expect(linkingConfig.prefixes.length).toBeGreaterThan(0);
    });

    it('config tanımlı olmalı', () => {
      expect(linkingConfig.config).toBeDefined();
      expect(linkingConfig.config.screens).toBeDefined();
    });
  });

  describe('Deep Link Paths', () => {
    const screens = linkingConfig.config.screens;

    it('Auth ekranları tanımlı olmalı', () => {
      expect(screens.Auth).toBeDefined();
      if (typeof screens.Auth === 'object') {
        expect(screens.Auth.screens).toBeDefined();
      }
    });

    it('Main ekranları tanımlı olmalı', () => {
      expect(screens.Main).toBeDefined();
      if (typeof screens.Main === 'object') {
        expect(screens.Main.screens).toBeDefined();
      }
    });
  });

  describe('URL Handling', () => {
    it('dengin:// scheme desteklenmeli', () => {
      expect(linkingConfig.prefixes).toContain('dengin://');
    });

    it('https deep link desteklenmeli', () => {
      const hasHttps = linkingConfig.prefixes.some((prefix: string) =>
        prefix.startsWith('https://'),
      );
      expect(hasHttps).toBe(true);
    });
  });

  describe('Screen Paths', () => {
    it('login path doğru olmalı', () => {
      const authScreens = linkingConfig.config.screens.Auth;
      if (typeof authScreens === 'object' && authScreens.screens) {
        expect(authScreens.screens.Login).toBe('login');
      }
    });

    it('register path doğru olmalı', () => {
      const authScreens = linkingConfig.config.screens.Auth;
      if (typeof authScreens === 'object' && authScreens.screens) {
        expect(authScreens.screens.Register).toBe('register');
      }
    });

    it('forgot password path doğru olmalı', () => {
      const authScreens = linkingConfig.config.screens.Auth;
      if (typeof authScreens === 'object' && authScreens.screens) {
        expect(authScreens.screens.ForgotPassword).toBe('forgot-password');
      }
    });
  });
});
