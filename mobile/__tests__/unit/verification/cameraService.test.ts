// __tests__/unit/verification/cameraService.test.ts
// Camera service testleri

import { cameraService } from '../../../src/features/verification/services/cameraService';
import { Camera } from 'react-native-vision-camera';

// Vision Camera mock
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    getCameraPermissionStatus: jest.fn(),
    requestCameraPermission: jest.fn(),
    getAvailableCameraDevices: jest.fn(),
  },
  useCameraDevice: jest.fn(),
  useCameraFormat: jest.fn(),
}));

// PermissionsAndroid mock
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  PermissionsAndroid: {
    PERMISSIONS: {
      CAMERA: 'android.permission.CAMERA',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    request: jest.fn(),
  },
}));

describe('Camera Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return granted when permission is granted', async () => {
      (Camera.getCameraPermissionStatus as jest.Mock).mockResolvedValueOnce('granted');

      const result = await cameraService.checkPermission();

      expect(result).toBe('granted');
    });

    it('should return denied when permission is denied', async () => {
      (Camera.getCameraPermissionStatus as jest.Mock).mockResolvedValueOnce('denied');

      const result = await cameraService.checkPermission();

      expect(result).toBe('denied');
    });

    it('should return not-determined when permission is not asked', async () => {
      (Camera.getCameraPermissionStatus as jest.Mock).mockResolvedValueOnce('not-determined');

      const result = await cameraService.checkPermission();

      expect(result).toBe('not-determined');
    });
  });

  describe('requestPermission', () => {
    it('should request and return permission status', async () => {
      (Camera.requestCameraPermission as jest.Mock).mockResolvedValueOnce('granted');

      const result = await cameraService.requestPermission();

      expect(result).toBe('granted');
      expect(Camera.requestCameraPermission).toHaveBeenCalled();
    });
  });

  describe('getDevices', () => {
    it('should return available camera devices', async () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockResolvedValueOnce(mockDevices);

      const result = await cameraService.getDevices();

      expect(result).toEqual(mockDevices);
      expect(result).toHaveLength(2);
    });

    it('should handle error when getting devices', async () => {
      (Camera.getAvailableCameraDevices as jest.Mock).mockRejectedValueOnce(
        new Error('Camera not available')
      );

      await expect(cameraService.getDevices()).rejects.toThrow('Camera not available');
    });
  });

  describe('getBackCamera', () => {
    it('should return back camera device', async () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockResolvedValueOnce(mockDevices);

      const result = await cameraService.getBackCamera();

      expect(result?.position).toBe('back');
    });
  });

  describe('getFrontCamera', () => {
    it('should return front camera device', async () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockResolvedValueOnce(mockDevices);

      const result = await cameraService.getFrontCamera();

      expect(result?.position).toBe('front');
    });
  });
});
