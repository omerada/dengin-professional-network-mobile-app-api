// __tests__/e2e/auth/login.e2e.ts
// End-to-end test for login flow
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { device, element, by, expect } from 'detox';

describe('Login Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('hoş geldiniz ekranını göstermeli', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await expect(element(by.text('Meslektaş'))).toBeVisible();
  });

  it('giriş ekranına yönlendirmeli', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('geçersiz email ile hata göstermeli', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();

    await expect(element(by.text('Geçerli bir email adresi giriniz'))).toBeVisible();
  });

  it('kısa şifre ile hata göstermeli', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('short');
    await element(by.id('submit-button')).tap();

    await expect(element(by.text('Şifre en az 8 karakter olmalıdır'))).toBeVisible();
  });

  it('başarılı giriş sonrası ana ekrana yönlendirmeli', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('valid@example.com');
    await element(by.id('password-input')).typeText('ValidPassword123');
    await element(by.id('submit-button')).tap();

    // Wait for navigation
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('şifremi unuttum akışını göstermeli', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('forgot-password-link')).tap();

    await expect(element(by.id('forgot-password-screen'))).toBeVisible();
    await expect(element(by.text('Şifre Sıfırlama'))).toBeVisible();
  });

  it('kayıt ekranına yönlendirmeli', async () => {
    await element(by.id('register-button')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });
});
