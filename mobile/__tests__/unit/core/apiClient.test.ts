// __tests__/unit/core/apiClient.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import axios from 'axios';
import { apiClient } from '../../../src/core/api/client';
import { tokenService } from '../../../src/features/auth/services/tokenService';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  };
});

// Mock token service
jest.mock('../../../src/features/auth/services/tokenService', () => ({
  tokenService: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    isTokenExpired: jest.fn(),
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('axios instance oluşturulmalı', () => {
      expect(axios.create).toHaveBeenCalled();
    });

    it('doğru baseURL kullanmalı', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
        })
      );
    });

    it('timeout ayarlanmalı', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: expect.any(Number),
        })
      );
    });

    it('interceptors eklenmiş olmalı', () => {
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Methods', () => {
    it('GET isteği yapabilmeli', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');

      expect(mockInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('POST isteği yapabilmeli', async () => {
      const mockResponse = { data: { success: true } };
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockInstance.post.mockResolvedValue(mockResponse);

      const postData = { name: 'Test' };
      const result = await apiClient.post('/test', postData);

      expect(mockInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('PUT isteği yapabilmeli', async () => {
      const mockResponse = { data: { updated: true } };
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockInstance.put.mockResolvedValue(mockResponse);

      const putData = { name: 'Updated' };
      const result = await apiClient.put('/test/1', putData);

      expect(mockInstance.put).toHaveBeenCalledWith('/test/1', putData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('DELETE isteği yapabilmeli', async () => {
      const mockResponse = { data: { deleted: true } };
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/test/1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Request Interceptor', () => {
    it('Authorization header eklenmeli', async () => {
      const mockToken = 'test-token';
      (tokenService.getAccessToken as jest.Mock).mockResolvedValue(mockToken);

      // The interceptor is called with the config object
      // We need to test the interceptor logic directly
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];

      const config = { headers: {} };
      const result = await requestInterceptor(config);

      // Verify token was requested
      expect(tokenService.getAccessToken).toHaveBeenCalled();
    });
  });

  describe('Response Interceptor', () => {
    it('başarılı yanıtı işlemeli', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      };

      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      const responseInterceptor = mockInstance.interceptors.response.use.mock.calls[0][0];

      const result = responseInterceptor(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('network hatası işlemeli', async () => {
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      const networkError = new Error('Network Error');
      mockInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
    });

    it('401 hatası işlemeli', async () => {
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockInstance.get.mockRejectedValue(error);

      await expect(apiClient.get('/test')).rejects.toEqual(error);
    });

    it('500 hatası işlemeli', async () => {
      const mockInstance = (axios.create as jest.Mock).mock.results[0].value;
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      mockInstance.get.mockRejectedValue(error);

      await expect(apiClient.get('/test')).rejects.toEqual(error);
    });
  });
});
