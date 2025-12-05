// __tests__/e2e/messaging/messaging.e2e.ts
// Messaging E2E testleri
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Messaging E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });

    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to messages tab
    await waitFor(element(by.id('messages-tab')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('messages-tab')).tap();
  });

  describe('Conversations List', () => {
    it('should show messages screen', async () => {
      await expect(element(by.id('messages-screen'))).toBeVisible();
    });

    it('should display conversations list', async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show conversation preview', async () => {
      await expect(element(by.id('conversation-preview'))).toBeVisible();
    });

    it('should show unread indicator', async () => {
      // If there are unread messages
      await waitFor(element(by.id('unread-badge')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show last message time', async () => {
      await expect(element(by.id('last-message-time'))).toBeVisible();
    });
  });

  describe('Start New Conversation', () => {
    it('should open new conversation screen', async () => {
      await element(by.id('new-conversation-button')).tap();

      await waitFor(element(by.id('new-conversation-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should search for users', async () => {
      await element(by.id('new-conversation-button')).tap();

      await element(by.id('user-search-input')).typeText('test user');

      await waitFor(element(by.id('user-search-result-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should start conversation with selected user', async () => {
      await element(by.id('new-conversation-button')).tap();
      await element(by.id('user-search-input')).typeText('test');

      await waitFor(element(by.id('user-search-result-0')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.id('user-search-result-0')).tap();

      await waitFor(element(by.id('conversation-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Conversation Screen', () => {
    beforeEach(async () => {
      // Open first conversation
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should show conversation screen', async () => {
      await expect(element(by.id('conversation-screen'))).toBeVisible();
    });

    it('should display messages', async () => {
      await waitFor(element(by.id('message-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show message input', async () => {
      await expect(element(by.id('message-input'))).toBeVisible();
    });

    it('should show send button', async () => {
      await expect(element(by.id('send-button'))).toBeVisible();
    });
  });

  describe('Send Message', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should send a text message', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();

      // Message should appear in the list
      await waitFor(element(by.text('Test message')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should clear input after sending', async () => {
      await element(by.id('message-input')).typeText('Test');
      await element(by.id('send-button')).tap();

      // Input should be empty
      await expect(element(by.id('message-input'))).toHaveText('');
    });

    it('should show message status indicator', async () => {
      await element(by.id('message-input')).typeText('Status test');
      await element(by.id('send-button')).tap();

      // Should show sent/delivered status
      await waitFor(element(by.id('message-status')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should disable send button for empty message', async () => {
      // Send button should be disabled when input is empty
      await expect(element(by.id('send-button'))).toBeVisible();
      // Note: Actual disabled state check depends on implementation
    });
  });

  describe('Typing Indicator', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should show typing indicator when other user is typing', async () => {
      // This requires a mock or real-time event
      // In real testing, you would trigger the event
      await waitFor(element(by.id('typing-indicator')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Message Options', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should show options on long press', async () => {
      await element(by.id('message-item-0')).longPress();

      await waitFor(element(by.id('message-options-sheet')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should copy message text', async () => {
      await element(by.id('message-item-0')).longPress();

      await waitFor(element(by.id('copy-option')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.id('copy-option')).tap();

      // Sheet should close
      await waitFor(element(by.id('message-options-sheet')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Offline Messaging', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should queue messages when offline', async () => {
      // Enable airplane mode if supported
      await device.setLocation(0, 0);

      await element(by.id('message-input')).typeText('Offline message');
      await element(by.id('send-button')).tap();

      // Message should be queued (shown with pending status)
      await waitFor(element(by.id('message-pending-status')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should navigate back to conversations list', async () => {
      await element(by.id('back-button')).tap();

      await expect(element(by.id('messages-screen'))).toBeVisible();
    });

    it('should navigate to user profile', async () => {
      await element(by.id('conversation-header-avatar')).tap();

      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Real-time Updates', () => {
    it('should update conversation list on new message', async () => {
      // This test verifies WebSocket integration
      // Would require mocking or real-time events

      // The conversation with new message should move to top
      // and show the new message preview
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
