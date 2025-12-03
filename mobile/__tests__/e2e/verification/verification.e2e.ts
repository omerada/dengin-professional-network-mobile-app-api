// __tests__/e2e/verification/verification.e2e.ts
// Verification E2E testleri (Detox)

describe('Verification E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Verification Flow', () => {
    it('should show verification intro screen', async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      // Navigate to verification
      await waitFor(element(by.id('verification-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('verification-button')).tap();

      // Check intro screen
      await expect(element(by.text('Kimlik Doğrulama'))).toBeVisible();
      await expect(element(by.id('start-verification-button'))).toBeVisible();
    });

    it('should request camera permission', async () => {
      // Login and navigate to verification
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('verification-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('verification-button')).tap();

      // Start verification
      await element(by.id('start-verification-button')).tap();

      // Camera permission should be requested
      // Note: This requires permission handling in the test environment
      await waitFor(element(by.id('document-capture-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should capture document front', async () => {
      // Login and start verification
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('verification-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('verification-button')).tap();
      await element(by.id('start-verification-button')).tap();

      // Capture document front
      await waitFor(element(by.id('capture-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('capture-button')).tap();

      // Should show preview
      await waitFor(element(by.id('image-preview')))
        .toBeVisible()
        .withTimeout(5000);

      // Confirm capture
      await element(by.id('confirm-button')).tap();

      // Should move to document back
      await expect(element(by.text('Arka Yüz'))).toBeVisible();
    });

    it('should allow retaking photo', async () => {
      // Login and start verification
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('verification-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('verification-button')).tap();
      await element(by.id('start-verification-button')).tap();

      // Capture and retake
      await waitFor(element(by.id('capture-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('capture-button')).tap();

      await waitFor(element(by.id('retake-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('retake-button')).tap();

      // Should be back at capture screen
      await expect(element(by.id('capture-button'))).toBeVisible();
    });

    it('should complete full verification flow', async () => {
      // Login
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      // Start verification
      await waitFor(element(by.id('verification-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('verification-button')).tap();
      await element(by.id('start-verification-button')).tap();

      // Document front
      await waitFor(element(by.id('capture-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('capture-button')).tap();
      await element(by.id('confirm-button')).tap();

      // Document back
      await waitFor(element(by.id('capture-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('capture-button')).tap();
      await element(by.id('confirm-button')).tap();

      // Selfie
      await waitFor(element(by.id('capture-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('capture-button')).tap();
      await element(by.id('confirm-button')).tap();

      // Review screen
      await waitFor(element(by.id('review-screen')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.id('document-front-preview'))).toBeVisible();
      await expect(element(by.id('document-back-preview'))).toBeVisible();
      await expect(element(by.id('selfie-preview'))).toBeVisible();

      // Submit
      await element(by.id('submit-button')).tap();

      // Status screen
      await waitFor(element(by.id('status-screen')))
        .toBeVisible()
        .withTimeout(10000);
      await expect(element(by.text(/İnceleniyor|Onaylandı/i))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle upload failure gracefully', async () => {
      // Setup mock to fail upload
      // This would require network mocking in the E2E environment

      // Login and complete capture steps
      // ...

      // Submit should show error
      await waitFor(element(by.text(/Hata|Tekrar Dene/i)))
        .toBeVisible()
        .withTimeout(10000);

      // Retry button should be visible
      await expect(element(by.id('retry-button'))).toBeVisible();
    });
  });
});
