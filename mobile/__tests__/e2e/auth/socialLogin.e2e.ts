// __tests__/e2e/auth/socialLogin.e2e.ts
// Social Login E2E testleri
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Social Login E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Google Sign In', () => {
    it('Google ile giriş butonunu göstermeli', async () => {
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await expect(element(by.id('google-signin-button'))).toBeVisible();
    });

    it('Google ile giriş butonuna basılınca Google auth açılmalı', async () => {
      await element(by.id('google-signin-button')).tap();

      // Google auth sheet or webview should appear
      // Note: Actual Google auth cannot be fully tested in E2E
      // as it requires real authentication
      await waitFor(element(by.text('Google')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('Google auth iptal edilince login ekranına dönmeli', async () => {
      await element(by.id('google-signin-button')).tap();

      // Cancel the auth if possible
      if (device.getPlatform() === 'ios') {
        await element(by.label('Cancel')).tap();
      } else {
        await device.pressBack();
      }

      await expect(element(by.id('welcome-screen'))).toBeVisible();
    });
  });

  describe('Apple Sign In', () => {
    beforeAll(async () => {
      // Skip Apple Sign In tests on Android
      if (device.getPlatform() !== 'ios') {
        return;
      }
    });

    it('Apple ile giriş butonunu göstermeli (sadece iOS)', async () => {
      if (device.getPlatform() !== 'ios') {
        return;
      }

      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await expect(element(by.id('apple-signin-button'))).toBeVisible();
    });

    it('Apple ile giriş butonuna basılınca Apple auth açılmalı', async () => {
      if (device.getPlatform() !== 'ios') {
        return;
      }

      await element(by.id('apple-signin-button')).tap();

      // Apple Sign In sheet should appear
      await waitFor(element(by.label('Sign in with Apple')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('Apple auth iptal edilince login ekranına dönmeli', async () => {
      if (device.getPlatform() !== 'ios') {
        return;
      }

      await element(by.id('apple-signin-button')).tap();

      // Cancel the auth
      await element(by.label('Cancel')).tap();

      await expect(element(by.id('welcome-screen'))).toBeVisible();
    });
  });

  describe('Social Login Error Handling', () => {
    it('network hatası durumunda hata mesajı göstermeli', async () => {
      // Simulate offline mode
      await device.setLocation(0, 0); // This may cause network issues

      await element(by.id('google-signin-button')).tap();

      // Should show error message
      await waitFor(element(by.text('Bağlantı hatası')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('hesap zaten mevcut hatası göstermeli', async () => {
      // This test assumes a test account is set up that already exists
      // In real E2E testing, you would need mock server support
      await element(by.id('google-signin-button')).tap();

      // If account exists with different provider
      await waitFor(element(by.text('Bu email başka bir yöntemle kayıtlı')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Social Login to Main App Flow', () => {
    it('yeni kullanıcı social login sonrası profil tamamlama ekranına gitmeli', async () => {
      // This test requires mocked backend that returns isNewUser: true
      await element(by.id('google-signin-button')).tap();

      // Wait for profile completion screen
      await waitFor(element(by.id('profile-completion-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('mevcut kullanıcı social login sonrası ana ekrana gitmeli', async () => {
      // This test requires mocked backend that returns existing user
      await element(by.id('google-signin-button')).tap();

      // Wait for main screen
      await waitFor(element(by.id('main-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
