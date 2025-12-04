// __tests__/unit/core/apiClient.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import axios from 'axios';
import { apiClient } from '../../../src/core/api/client';

// Mock secure storage
jest.mock('../../../src/core/storage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  SECURE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
}));

// Mock config
jest.mock('../../../src/config/env', () => ({
  ENV: {
    API_BASE_URL: 'https://api.test.com',
    isDevelopment: false,
  },
}));

jest.mock('../../../src/config/app', () => ({
  APP_CONFIG: {
    API: {
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000,
    },
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('axios instance olmalı', () => {
      expect(apiClient).toBeDefined();
    });

    it('get metodu olmalı', () => {
      expect(typeof apiClient.get).toBe('function');
    });

    it('post metodu olmalı', () => {
      expect(typeof apiClient.post).toBe('function');
    });

    it('put metodu olmalı', () => {
      expect(typeof apiClient.put).toBe('function');
    });

    it('delete metodu olmalı', () => {
      expect(typeof apiClient.delete).toBe('function');
    });

    it('interceptors tanımlı olmalı', () => {
      expect(apiClient.interceptors).toBeDefined();
      expect(apiClient.interceptors.request).toBeDefined();
      expect(apiClient.interceptors.response).toBeDefined();
    });
  });

  describe('Headers', () => {
    it('default headers ayarlanmış olmalı', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    });
  });
});
