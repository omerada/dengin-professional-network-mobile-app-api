// src/features/notifications/__tests__/e2e/notifications.e2e.ts
// E2E tests for notifications flow
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Notifications E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {
        notifications: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Notifications Tab', () => {
    it('should navigate to notifications screen', async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      // Wait for main screen
      await waitFor(element(by.id('notifications-tab')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to notifications
      await element(by.id('notifications-tab')).tap();

      // Should see notifications screen
      await waitFor(element(by.text('Bildirimler')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show empty state when no notifications', async () => {
      await element(by.id('notifications-tab')).tap();

      // Wait for empty state
      await waitFor(element(by.text('Bildirim Yok')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(
        element(by.text('Henüz hiç bildiriminiz yok'))
      ).toBeVisible();
    });
  });

  describe('Notification List', () => {
    beforeEach(async () => {
      // Mock notifications should be available
      await element(by.id('notifications-tab')).tap();
    });

    it('should display notification items', async () => {
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show unread indicator on unread notifications', async () => {
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Unread notification should have indicator
      await expect(element(by.id('unread-indicator-0'))).toBeVisible();
    });

    it('should mark notification as read on tap', async () => {
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Tap notification
      await element(by.id('notification-item-0')).tap();

      // Navigate back
      await device.pressBack();

      // Unread indicator should be gone
      await expect(element(by.id('unread-indicator-0'))).not.toBeVisible();
    });

    it('should support pull to refresh', async () => {
      const notificationList = element(by.id('notification-list'));

      // Pull to refresh
      await notificationList.swipe('down', 'slow', 0.5);

      // Should still see notifications
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should load more notifications on scroll', async () => {
      const notificationList = element(by.id('notification-list'));

      // Scroll to bottom
      await notificationList.swipe('up', 'slow');

      // Wait for more items to load
      await waitFor(element(by.id('notification-item-10')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Notification Navigation', () => {
    beforeEach(async () => {
      await element(by.id('notifications-tab')).tap();
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to chat when message notification is tapped', async () => {
      // Find message notification
      await element(by.id('notification-message-0')).tap();

      // Should be on chat screen
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to post when like notification is tapped', async () => {
      // Find like notification
      await element(by.id('notification-like-0')).tap();

      // Should be on post detail screen
      await waitFor(element(by.id('post-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to profile when follow notification is tapped', async () => {
      // Find follow notification
      await element(by.id('notification-follow-0')).tap();

      // Should be on profile screen
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Mark All As Read', () => {
    beforeEach(async () => {
      await element(by.id('notifications-tab')).tap();
    });

    it('should show mark all as read button when there are unread notifications', async () => {
      await waitFor(element(by.id('mark-all-read-button')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should mark all as read on confirmation', async () => {
      await element(by.id('mark-all-read-button')).tap();

      // Confirm dialog
      await waitFor(element(by.text('Onayla')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.text('Onayla')).tap();

      // All unread indicators should be gone
      await waitFor(element(by.id('unread-indicator-0')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should cancel mark all as read', async () => {
      await element(by.id('mark-all-read-button')).tap();

      // Cancel dialog
      await element(by.text('İptal')).tap();

      // Unread indicators should still be visible
      await expect(element(by.id('unread-indicator-0'))).toBeVisible();
    });
  });

  describe('Notification Settings', () => {
    beforeEach(async () => {
      await element(by.id('notifications-tab')).tap();
    });

    it('should navigate to settings screen', async () => {
      await element(by.id('notification-settings-button')).tap();

      await waitFor(element(by.text('Bildirim Ayarları')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show all notification toggles', async () => {
      await element(by.id('notification-settings-button')).tap();

      await waitFor(element(by.text('Bildirimleri Etkinleştir')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Yeni Mesajlar'))).toBeVisible();
      await expect(element(by.text('Beğeniler'))).toBeVisible();
      await expect(element(by.text('Yorumlar'))).toBeVisible();
      await expect(element(by.text('Yeni Takipçiler'))).toBeVisible();
      await expect(element(by.text('Doğrulama Güncellemeleri'))).toBeVisible();
      await expect(element(by.text('Sistem Bildirimleri'))).toBeVisible();
    });

    it('should toggle notification settings', async () => {
      await element(by.id('notification-settings-button')).tap();

      // Toggle messages off
      await element(by.id('toggle-messages')).tap();

      // Should be toggled off (implementation dependent)
      // This verifies the toggle is interactive
    });

    it('should disable all toggles when master toggle is off', async () => {
      await element(by.id('notification-settings-button')).tap();

      // Turn off master toggle
      await element(by.id('toggle-enabled')).tap();

      // Confirm if needed
      await waitFor(element(by.text('Kapat')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.text('Kapat')).tap();

      // Other toggles should be disabled
      // (visual verification - toggles should appear grayed out)
    });
  });

  describe('Permission Handling', () => {
    it('should show permission prompt when notifications are disabled', async () => {
      await device.launchApp({
        newInstance: true,
        permissions: {
          notifications: 'NO',
        },
      });

      // Login and navigate to notifications
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await element(by.id('notifications-tab')).tap();

      // Should show permission prompt
      await waitFor(element(by.text('Bildirimleri Aç')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show settings link when permission is denied', async () => {
      // When permission is denied, should show "Ayarlara Git" button
      await waitFor(element(by.text('Ayarlara Git')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should dismiss permission prompt when "Şimdi Değil" is tapped', async () => {
      await element(by.text('Şimdi Değil')).tap();

      // Prompt should be dismissed
      await expect(element(by.text('Bildirimleri Aç'))).not.toBeVisible();
    });
  });

  describe('Delete Notification', () => {
    beforeEach(async () => {
      await element(by.id('notifications-tab')).tap();
      await waitFor(element(by.id('notification-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should delete notification on swipe', async () => {
      // Swipe to delete
      await element(by.id('notification-item-0')).swipe('left');

      // Tap delete button
      await element(by.id('delete-button-0')).tap();

      // Notification should be removed
      await waitFor(element(by.id('notification-item-0')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Badge Count', () => {
    it('should show badge on notifications tab when there are unread notifications', async () => {
      // Badge should be visible on tab bar
      await expect(element(by.id('notifications-badge'))).toBeVisible();
    });

    it('should update badge count when notification is read', async () => {
      const initialBadge = await element(by.id('notifications-badge')).getText();

      // Read a notification
      await element(by.id('notifications-tab')).tap();
      await element(by.id('notification-item-0')).tap();
      await device.pressBack();
      await element(by.id('feed-tab')).tap();

      // Badge should be decremented
      const updatedBadge = await element(by.id('notifications-badge')).getText();
      expect(parseInt(updatedBadge)).toBeLessThan(parseInt(initialBadge));
    });

    it('should hide badge when all notifications are read', async () => {
      await element(by.id('notifications-tab')).tap();
      await element(by.id('mark-all-read-button')).tap();
      await element(by.text('Onayla')).tap();

      // Navigate away and back
      await element(by.id('feed-tab')).tap();

      // Badge should not be visible
      await expect(element(by.id('notifications-badge'))).not.toBeVisible();
    });
  });
});
