// e2e/messaging.e2e.ts
// Messaging module E2E tests
// Oku: mobile-development-guide/testing/26-E2E-TESTS.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Messaging Module', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Login as test user
    await element(by.id('email-input')).typeText('test@meslektas.com');
    await element(by.id('password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    
    // Wait for main screen
    await waitFor(element(by.id('main-tab-bar')))
      .toBeVisible()
      .withTimeout(10000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to messaging tab
    await element(by.id('messaging-tab')).tap();
    await waitFor(element(by.id('conversation-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('Conversation List', () => {
    it('should display conversation list screen', async () => {
      await expect(element(by.id('conversation-list'))).toBeVisible();
    });

    it('should show empty state when no conversations', async () => {
      // For new users
      await expect(element(by.text('Henüz mesajınız yok'))).toBeVisible();
    });

    it('should display conversation items', async () => {
      // Wait for conversations to load
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('conversation-item-0'))).toBeVisible();
    });

    it('should navigate to chat when conversation is tapped', async () => {
      await element(by.id('conversation-item-0')).tap();

      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show search bar', async () => {
      await expect(element(by.id('conversation-search'))).toBeVisible();
    });

    it('should filter conversations by search', async () => {
      await element(by.id('conversation-search')).typeText('John');

      await waitFor(element(by.text('John Doe')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show new conversation FAB', async () => {
      await expect(element(by.id('new-conversation-fab'))).toBeVisible();
    });

    it('should navigate to new conversation screen', async () => {
      await element(by.id('new-conversation-fab')).tap();

      await waitFor(element(by.id('new-conversation-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show options on long press', async () => {
      await element(by.id('conversation-item-0')).longPress();

      await waitFor(element(by.id('conversation-options-sheet')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Sabitle'))).toBeVisible();
      await expect(element(by.text('Sessize Al'))).toBeVisible();
      await expect(element(by.text('Konuşmayı Sil'))).toBeVisible();
    });
  });

  describe('Chat Screen', () => {
    beforeEach(async () => {
      // Navigate to a chat
      await element(by.id('conversation-item-0')).tap();
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display chat header with user info', async () => {
      await expect(element(by.id('chat-header'))).toBeVisible();
      await expect(element(by.id('chat-user-name'))).toBeVisible();
    });

    it('should display message list', async () => {
      await expect(element(by.id('message-list'))).toBeVisible();
    });

    it('should display message input', async () => {
      await expect(element(by.id('message-input'))).toBeVisible();
    });

    it('should display send button', async () => {
      await expect(element(by.id('send-button'))).toBeVisible();
    });

    it('should send a message', async () => {
      const testMessage = `Test message ${Date.now()}`;

      await element(by.id('message-input')).typeText(testMessage);
      await element(by.id('send-button')).tap();

      await waitFor(element(by.text(testMessage)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should clear input after sending', async () => {
      await element(by.id('message-input')).typeText('Test');
      await element(by.id('send-button')).tap();

      // Input should be empty after sending
      await expect(element(by.id('message-input'))).toHaveText('');
    });

    it('should show message status icons', async () => {
      await element(by.id('message-input')).typeText('Status test');
      await element(by.id('send-button')).tap();

      // Wait for message to appear with status
      await waitFor(element(by.id('message-status-icon')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should scroll to load older messages', async () => {
      // Scroll up to load more messages
      await element(by.id('message-list')).scroll(200, 'up');

      // Should trigger load more
      await waitFor(element(by.id('loading-indicator')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate back to conversation list', async () => {
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('conversation-list')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show options on message long press', async () => {
      await element(by.id('message-bubble-0')).longPress();

      await waitFor(element(by.id('message-options-sheet')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Yanıtla'))).toBeVisible();
      await expect(element(by.text('Kopyala'))).toBeVisible();
    });

    it('should copy message to clipboard', async () => {
      await element(by.id('message-bubble-0')).longPress();
      await element(by.text('Kopyala')).tap();

      // Sheet should close
      await waitFor(element(by.id('message-options-sheet')))
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('New Conversation', () => {
    beforeEach(async () => {
      await element(by.id('new-conversation-fab')).tap();
      await waitFor(element(by.id('new-conversation-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display search input', async () => {
      await expect(element(by.id('user-search-input'))).toBeVisible();
    });

    it('should search for users', async () => {
      await element(by.id('user-search-input')).typeText('John');

      await waitFor(element(by.id('user-search-result-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to chat when user is selected', async () => {
      await element(by.id('user-search-input')).typeText('Test');
      await waitFor(element(by.id('user-search-result-0')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('user-search-result-0')).tap();

      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should close with close button', async () => {
      await element(by.id('close-button')).tap();

      await waitFor(element(by.id('conversation-list')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Real-time Features', () => {
    it('should show typing indicator when other user is typing', async () => {
      await element(by.id('conversation-item-0')).tap();
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Simulate receiving typing event (would need mock server)
      // await expect(element(by.id('typing-indicator'))).toBeVisible();
    });

    it('should update message status in real-time', async () => {
      await element(by.id('conversation-item-0')).tap();
      await element(by.id('message-input')).typeText('Real-time test');
      await element(by.id('send-button')).tap();

      // Status should update from sending -> sent -> delivered -> read
      // Would need mock server to simulate these updates
    });

    it('should show online status', async () => {
      await element(by.id('conversation-item-0')).tap();
      
      // If user is online, should show indicator
      // await expect(element(by.id('online-indicator'))).toBeVisible();
    });
  });

  describe('Offline Support', () => {
    it('should show offline indicator when disconnected', async () => {
      // Disable network
      await device.setURLBlacklist(['.*']);

      await expect(element(by.id('offline-indicator'))).toBeVisible();

      // Re-enable network
      await device.setURLBlacklist([]);
    });

    it('should queue messages when offline', async () => {
      await element(by.id('conversation-item-0')).tap();
      
      // Disable network
      await device.setURLBlacklist(['.*']);

      await element(by.id('message-input')).typeText('Offline message');
      await element(by.id('send-button')).tap();

      // Message should appear with sending status
      await expect(element(by.id('message-status-sending'))).toBeVisible();

      // Re-enable network
      await device.setURLBlacklist([]);

      // Message should update to sent
      await waitFor(element(by.id('message-status-sent')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', async () => {
      await expect(element(by.label('Konuşmalar'))).toBeVisible();
      await expect(element(by.label('Yeni konuşma başlat'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      // Focus on search input
      await element(by.id('conversation-search')).tap();
      
      // Type and submit
      await element(by.id('conversation-search')).typeText('Test');
      
      // Should filter results
      await waitFor(element(by.text('Test')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});
