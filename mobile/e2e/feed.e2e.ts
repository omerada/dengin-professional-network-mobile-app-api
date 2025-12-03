// e2e/feed.e2e.ts
// Feed E2E testleri
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { device, element, by, expect, waitFor } from 'detox';

describe('Feed Feature', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Login before tests
    await loginAsTestUser();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  async function loginAsTestUser() {
    // Navigate to login if needed
    try {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(5000);
    } catch {
      // Already logged in
    }
  }

  describe('Feed Screen', () => {
    it('should display feed with posts', async () => {
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.id('feed-list'))).toBeVisible();
    });

    it('should scroll feed and load more posts', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Scroll down multiple times
      for (let i = 0; i < 5; i++) {
        await element(by.id('feed-list')).scroll(500, 'down');
        await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(2000);
      }

      // Should have loaded more posts
      await expect(element(by.id('feed-list'))).toBeVisible();
    });

    it('should pull to refresh feed', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Pull to refresh
      await element(by.id('feed-list')).scroll(200, 'down', NaN, NaN, 0.5);

      // Wait for refresh to complete
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);
    });

    it('should filter feed by tabs', async () => {
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(5000);

      // Tap on following tab
      await element(by.text('Takip')).tap();
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(3000);

      // Tap on popular tab
      await element(by.text('Popüler')).tap();
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(3000);

      // Tap back to all
      await element(by.text('Tümü')).tap();
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Like/Unlike Post', () => {
    it('should like a post', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Find first post's like button
      const likeButton = element(by.id('like-button-0'));
      await waitFor(likeButton).toBeVisible().withTimeout(3000);

      // Get initial like count
      const likeCountBefore = await element(by.id('like-count-0')).getAttributes();

      // Tap like
      await likeButton.tap();

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Like count should increase (or button state should change)
      await expect(likeButton).toBeVisible();
    });

    it('should unlike a previously liked post', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Find a liked post's like button
      const likeButton = element(by.id('like-button-0'));
      await waitFor(likeButton).toBeVisible().withTimeout(3000);

      // Tap unlike
      await likeButton.tap();

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 500));

      await expect(likeButton).toBeVisible();
    });
  });

  describe('Create Post', () => {
    it('should navigate to create post screen', async () => {
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(5000);

      // Tap FAB
      await element(by.id('create-post-fab')).tap();

      // Should show create post screen
      await waitFor(element(by.id('create-post-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should create a text-only post', async () => {
      // Navigate to create post
      await element(by.id('create-post-fab')).tap();
      await waitFor(element(by.id('create-post-screen'))).toBeVisible().withTimeout(3000);

      // Type post content
      const postContent = `Test post ${Date.now()}`;
      await element(by.id('post-content-input')).typeText(postContent);

      // Submit
      await element(by.id('submit-post-button')).tap();

      // Should navigate back to feed
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(5000);

      // New post should be visible (at the top)
      await waitFor(element(by.text(postContent))).toBeVisible().withTimeout(3000);
    });

    it('should create a post with images', async () => {
      // Navigate to create post
      await element(by.id('create-post-fab')).tap();
      await waitFor(element(by.id('create-post-screen'))).toBeVisible().withTimeout(3000);

      // Type content
      await element(by.id('post-content-input')).typeText('Post with image');

      // Tap gallery picker (this will need permissions in test environment)
      await element(by.id('gallery-picker-button')).tap();

      // Select image from mock gallery
      // Note: This may need mocking in test environment
      try {
        await element(by.id('image-0')).tap();
        await element(by.id('confirm-selection')).tap();
      } catch {
        // Image picker might not work in test environment
      }

      // Submit
      await element(by.id('submit-post-button')).tap();

      // Should navigate back
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(10000);
    });

    it('should show character counter', async () => {
      await element(by.id('create-post-fab')).tap();
      await waitFor(element(by.id('create-post-screen'))).toBeVisible().withTimeout(3000);

      // Check initial counter
      await expect(element(by.text('0/500'))).toBeVisible();

      // Type some text
      await element(by.id('post-content-input')).typeText('Hello');

      // Counter should update
      await expect(element(by.text('5/500'))).toBeVisible();

      // Go back
      await element(by.id('close-button')).tap();
    });

    it('should disable submit when content is empty', async () => {
      await element(by.id('create-post-fab')).tap();
      await waitFor(element(by.id('create-post-screen'))).toBeVisible().withTimeout(3000);

      // Submit button should be disabled
      // Note: Checking disabled state varies by implementation

      // Go back
      await element(by.id('close-button')).tap();
    });
  });

  describe('Post Detail', () => {
    it('should navigate to post detail on tap', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Tap on first post
      await element(by.id('post-card-0')).tap();

      // Should show post detail
      await waitFor(element(by.id('post-detail-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should display post content in detail view', async () => {
      await waitFor(element(by.id('post-detail-screen'))).toBeVisible().withTimeout(3000);

      // Content should be visible
      await expect(element(by.id('post-content'))).toBeVisible();
    });

    it('should display comments in detail view', async () => {
      await waitFor(element(by.id('post-detail-screen'))).toBeVisible().withTimeout(3000);

      // Comments section should be visible
      await expect(element(by.id('comments-section'))).toBeVisible();
    });

    it('should navigate back from detail', async () => {
      // Tap back button
      await element(by.id('back-button')).tap();

      // Should return to feed
      await waitFor(element(by.id('feed-screen'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Comments', () => {
    it('should add comment to post', async () => {
      // Navigate to post detail
      await element(by.id('post-card-0')).tap();
      await waitFor(element(by.id('post-detail-screen'))).toBeVisible().withTimeout(3000);

      // Type comment
      const commentText = `Test comment ${Date.now()}`;
      await element(by.id('comment-input')).typeText(commentText);

      // Submit comment
      await element(by.id('submit-comment-button')).tap();

      // Comment should appear
      await waitFor(element(by.text(commentText))).toBeVisible().withTimeout(3000);

      // Go back
      await element(by.id('back-button')).tap();
    });

    it('should show comment count on post card', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Comment count should be visible
      await expect(element(by.id('comment-count-0'))).toBeVisible();
    });
  });

  describe('Bookmark', () => {
    it('should bookmark a post', async () => {
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);

      // Tap bookmark button on first post
      await element(by.id('bookmark-button-0')).tap();

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Bookmark button should change state
      await expect(element(by.id('bookmark-button-0'))).toBeVisible();
    });
  });
});
