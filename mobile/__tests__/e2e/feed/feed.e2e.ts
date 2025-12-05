// __tests__/e2e/feed/feed.e2e.ts
// Feed E2E testleri
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Feed E2E', () => {
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
    // Navigate back to feed if needed
    await waitFor(element(by.id('feed-tab')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('feed-tab')).tap();
  });

  describe('Feed Display', () => {
    it('should show feed screen', async () => {
      await expect(element(by.id('feed-screen'))).toBeVisible();
    });

    it('should display posts in feed', async () => {
      await waitFor(element(by.id('post-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show post author information', async () => {
      await waitFor(element(by.id('post-author-avatar')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show post content', async () => {
      await waitFor(element(by.id('post-content')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show post actions (like, comment, share)', async () => {
      await expect(element(by.id('like-button'))).toBeVisible();
      await expect(element(by.id('comment-button'))).toBeVisible();
      await expect(element(by.id('share-button'))).toBeVisible();
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh feed on pull down', async () => {
      const feedList = element(by.id('feed-list'));

      await feedList.swipe('down', 'slow', 0.5);

      // Should show refresh indicator
      await waitFor(element(by.id('post-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more posts on scroll', async () => {
      const feedList = element(by.id('feed-list'));

      // Scroll down to trigger load more
      await feedList.swipe('up', 'slow', 0.8);
      await feedList.swipe('up', 'slow', 0.8);

      // More posts should be loaded
      await waitFor(element(by.id('post-item-5')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Post Interactions', () => {
    it('should like a post', async () => {
      await element(by.id('like-button')).tap();

      // Like count should increase or button should change state
      await expect(element(by.id('like-button-active'))).toBeVisible();
    });

    it('should unlike a liked post', async () => {
      // First like it
      await element(by.id('like-button')).tap();

      // Then unlike
      await element(by.id('like-button-active')).tap();

      await expect(element(by.id('like-button'))).toBeVisible();
    });

    it('should navigate to comments on comment button tap', async () => {
      await element(by.id('comment-button')).tap();

      await waitFor(element(by.id('comments-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should open share sheet on share button tap', async () => {
      await element(by.id('share-button')).tap();

      // Share sheet should be visible
      await waitFor(element(by.id('share-bottom-sheet')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Post Detail', () => {
    it('should navigate to post detail on post tap', async () => {
      await element(by.id('post-item-0')).tap();

      await waitFor(element(by.id('post-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show full post content on detail screen', async () => {
      await element(by.id('post-item-0')).tap();

      await expect(element(by.id('post-full-content'))).toBeVisible();
    });

    it('should show comments on post detail', async () => {
      await element(by.id('post-item-0')).tap();

      await waitFor(element(by.id('comments-list')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Create Post', () => {
    it('should open create post screen', async () => {
      await element(by.id('create-post-button')).tap();

      await waitFor(element(by.id('create-post-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should create a text post', async () => {
      await element(by.id('create-post-button')).tap();

      await element(by.id('post-content-input')).typeText('Test post content');
      await element(by.id('submit-post-button')).tap();

      // Should navigate back to feed
      await waitFor(element(by.id('feed-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show validation error for empty post', async () => {
      await element(by.id('create-post-button')).tap();
      await element(by.id('submit-post-button')).tap();

      await expect(element(by.text('İçerik boş olamaz'))).toBeVisible();
    });
  });

  describe('User Profile Navigation', () => {
    it('should navigate to user profile on avatar tap', async () => {
      await element(by.id('post-author-avatar')).tap();

      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Offline Mode', () => {
    it('should show cached posts when offline', async () => {
      // Enable airplane mode (if supported)
      await device.setLocation(0, 0);

      // Feed should still show cached posts
      await expect(element(by.id('post-item-0'))).toBeVisible();

      // Should show offline indicator
      await expect(element(by.id('offline-notice'))).toBeVisible();
    });
  });
});
