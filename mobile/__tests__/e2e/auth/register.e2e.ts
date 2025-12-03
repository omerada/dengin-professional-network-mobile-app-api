// __tests__/e2e/auth/register.e2e.ts
// End-to-end test for registration flow
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { device, element, by, expect } from 'detox';

describe('Register Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('kayıt ekranını göstermeli', async () => {
    await element(by.id('register-button')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });

  it('tüm form alanlarını göstermeli', async () => {
    await element(by.id('register-button')).tap();

    await expect(element(by.id('first-name-input'))).toBeVisible();
    await expect(element(by.id('last-name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('confirm-password-input'))).toBeVisible();
    await expect(element(by.id('accept-terms-checkbox'))).toBeVisible();
  });

  it('boş form gönderiminde hata göstermeli', async () => {
    await element(by.id('register-button')).tap();
    await element(by.id('submit-button')).tap();

    await expect(element(by.text('Ad alanı zorunludur'))).toBeVisible();
  });

  it('eşleşmeyen şifreler için hata göstermeli', async () => {
    await element(by.id('register-button')).tap();

    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('Password123');
    await element(by.id('confirm-password-input')).typeText('DifferentPassword');
    await element(by.id('accept-terms-checkbox')).tap();
    await element(by.id('submit-button')).tap();

    await expect(element(by.text('Şifreler eşleşmiyor'))).toBeVisible();
  });

  it('zayıf şifre için hata göstermeli', async () => {
    await element(by.id('register-button')).tap();

    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('weak');
    await element(by.id('confirm-password-input')).typeText('weak');
    await element(by.id('accept-terms-checkbox')).tap();
    await element(by.id('submit-button')).tap();

    await expect(
      element(by.text('Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir'))
    ).toBeVisible();
  });

  it('koşullar kabul edilmeden form gönderilemez', async () => {
    await element(by.id('register-button')).tap();

    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('Password123');
    await element(by.id('confirm-password-input')).typeText('Password123');
    // Not tapping accept terms
    await element(by.id('submit-button')).tap();

    await expect(element(by.text('Kullanım koşullarını kabul etmelisiniz'))).toBeVisible();
  });

  it('başarılı kayıt sonrası doğrulama ekranına yönlendirmeli', async () => {
    await element(by.id('register-button')).tap();

    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('Password123');
    await element(by.id('confirm-password-input')).typeText('Password123');
    await element(by.id('accept-terms-checkbox')).tap();
    await element(by.id('submit-button')).tap();

    // Wait for navigation to verification screen
    await waitFor(element(by.id('verification-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('giriş ekranına geri dönebilmeli', async () => {
    await element(by.id('register-button')).tap();
    await element(by.id('login-link')).tap();

    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
