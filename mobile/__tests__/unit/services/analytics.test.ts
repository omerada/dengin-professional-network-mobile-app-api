// __tests__/unit/services/analytics.test.ts
// Unit tests for analytics service
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

// Firebase mocks are in setup.ts

import { Analytics, AnalyticsEvent, AnalyticsScreen } from '@shared/services/analytics';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const mockAnalytics = analytics() as jest.Mocked<ReturnType<typeof analytics>>;
const mockCrashlytics = crashlytics() as jest.Mocked<ReturnType<typeof crashlytics>>;

describe('Analytics Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Ensure analytics is enabled for tests
    await Analytics.setEnabled(true);
  });

  describe('setEnabled', () => {
    it('should enable analytics collection', async () => {
      await Analytics.setEnabled(true);

      expect(mockAnalytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(true);
      expect(mockCrashlytics.setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(true);
    });

    it('should disable analytics collection', async () => {
      await Analytics.setEnabled(false);

      expect(mockAnalytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(false);
      expect(mockCrashlytics.setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('setUserId', () => {
    it('should set user ID on both analytics and crashlytics', async () => {
      await Analytics.setUserId('user-123');

      expect(mockAnalytics.setUserId).toHaveBeenCalledWith('user-123');
      expect(mockCrashlytics.setUserId).toHaveBeenCalledWith('user-123');
    });

    it('should clear user ID when null is passed', async () => {
      await Analytics.setUserId(null);

      expect(mockAnalytics.setUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties', async () => {
      await Analytics.setUserProperties({
        isVerified: true,
        profession: 'Developer',
      });

      expect(mockAnalytics.setUserProperties).toHaveBeenCalledWith({
        is_verified: 'true',
        profession: 'Developer',
      });

      expect(mockCrashlytics.setAttribute).toHaveBeenCalledWith('is_verified', 'true');
      expect(mockCrashlytics.setAttribute).toHaveBeenCalledWith('profession', 'Developer');
    });
  });

  describe('logScreenView', () => {
    it('should log screen view', async () => {
      await Analytics.logScreenView(AnalyticsScreen.FEED);

      expect(mockAnalytics.logScreenView).toHaveBeenCalledWith({
        screen_name: AnalyticsScreen.FEED,
        screen_class: AnalyticsScreen.FEED,
      });
    });

    it('should log screen view with custom class', async () => {
      await Analytics.logScreenView('CustomScreen', 'CustomClass');

      expect(mockAnalytics.logScreenView).toHaveBeenCalledWith({
        screen_name: 'CustomScreen',
        screen_class: 'CustomClass',
      });
    });
  });

  describe('logEvent', () => {
    it('should log custom event', async () => {
      await Analytics.logEvent(AnalyticsEvent.POST_LIKED, { postId: 'post-123' });

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(AnalyticsEvent.POST_LIKED, {
        postId: 'post-123',
      });
    });

    it('should sanitize long string params', async () => {
      const longString = 'a'.repeat(200);
      await Analytics.logEvent(AnalyticsEvent.SEARCH_PERFORMED, { query: longString });

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(AnalyticsEvent.SEARCH_PERFORMED, {
        query: 'a'.repeat(100),
      });
    });

    it('should sanitize null values', async () => {
      await Analytics.logEvent('test_event', { value: null });

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith('test_event', { value: 'null' });
    });
  });

  describe('logLogin', () => {
    it('should log login with method', async () => {
      await Analytics.logLogin('email');

      expect(mockAnalytics.logLogin).toHaveBeenCalledWith({ method: 'email' });
    });
  });

  describe('logSignUp', () => {
    it('should log sign up with method', async () => {
      await Analytics.logSignUp('email');

      expect(mockAnalytics.logSignUp).toHaveBeenCalledWith({ method: 'email' });
    });
  });

  describe('logShare', () => {
    it('should log share event', async () => {
      await Analytics.logShare('post', 'post-123', 'twitter');

      expect(mockAnalytics.logShare).toHaveBeenCalledWith({
        content_type: 'post',
        item_id: 'post-123',
        method: 'twitter',
      });
    });
  });

  describe('logSearch', () => {
    it('should log search event', async () => {
      await Analytics.logSearch('test query');

      expect(mockAnalytics.logSearch).toHaveBeenCalledWith({
        search_term: 'test query',
      });
    });
  });

  describe('logError', () => {
    it('should record error to crashlytics', () => {
      const error = new Error('Test error');
      Analytics.logError(error);

      expect(mockCrashlytics.recordError).toHaveBeenCalledWith(error);
    });

    it('should set context attributes', () => {
      const error = new Error('Test error');
      Analytics.logError(error, { screen: 'Feed', action: 'refresh' });

      expect(mockCrashlytics.setAttribute).toHaveBeenCalledWith('screen', 'Feed');
      expect(mockCrashlytics.setAttribute).toHaveBeenCalledWith('action', 'refresh');
    });

    it('should log error event to analytics', () => {
      const error = new Error('Test error');
      Analytics.logError(error, { context: 'test' }, false);

      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(
        AnalyticsEvent.ERROR_OCCURRED,
        expect.objectContaining({
          error_message: 'Test error',
          error_name: 'Error',
          is_fatal: false,
        }),
      );
    });
  });

  describe('setCustomKey', () => {
    it('should set custom key on crashlytics', async () => {
      await Analytics.setCustomKey('custom_key', 'custom_value');

      expect(mockCrashlytics.setAttribute).toHaveBeenCalledWith('custom_key', 'custom_value');
    });
  });

  describe('log', () => {
    it('should log message to crashlytics', () => {
      Analytics.log('Test message');

      expect(mockCrashlytics.log).toHaveBeenCalledWith('Test message');
    });
  });

  describe('reset', () => {
    it('should reset analytics data', async () => {
      await Analytics.reset();

      expect(mockAnalytics.resetAnalyticsData).toHaveBeenCalled();
    });
  });
});
