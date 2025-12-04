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

  describe('getAvailableDevices', () => {
    it('should return available camera devices', () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue(mockDevices);

      const result = cameraService.getAvailableDevices();

      expect(result).toEqual(mockDevices);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no devices', () => {
      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue([]);

      const result = cameraService.getAvailableDevices();

      expect(result).toEqual([]);
    });
  });

  describe('getBestBackCamera', () => {
    it('should return back camera device', () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true, supportsPhotoHdr: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue(mockDevices);

      const result = cameraService.getBestBackCamera();

      expect(result?.position).toBe('back');
    });

    it('should return undefined when no back camera', () => {
      const mockDevices = [{ id: 'front', position: 'front', hasFlash: false }];

      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue(mockDevices);

      const result = cameraService.getBestBackCamera();

      expect(result).toBeUndefined();
    });
  });

  describe('getBestFrontCamera', () => {
    it('should return front camera device', () => {
      const mockDevices = [
        { id: 'back', position: 'back', hasFlash: true },
        { id: 'front', position: 'front', hasFlash: false },
      ];

      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue(mockDevices);

      const result = cameraService.getBestFrontCamera();

      expect(result?.position).toBe('front');
    });

    it('should return undefined when no front camera', () => {
      const mockDevices = [{ id: 'back', position: 'back', hasFlash: true }];

      (Camera.getAvailableCameraDevices as jest.Mock).mockReturnValue(mockDevices);

      const result = cameraService.getBestFrontCamera();

      expect(result).toBeUndefined();
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default camera settings', () => {
      const settings = cameraService.getDefaultSettings();

      expect(settings.flash).toBe('auto');
      expect(settings.focus).toBe('auto');
      expect(settings.zoom).toBe(1);
      expect(settings.position).toBe('back');
    });
  });

  describe('toggleFlash', () => {
    it('should cycle through flash modes', () => {
      expect(cameraService.toggleFlash('off')).toBe('on');
      expect(cameraService.toggleFlash('on')).toBe('auto');
      expect(cameraService.toggleFlash('auto')).toBe('off');
    });
  });

  describe('togglePosition', () => {
    it('should toggle between back and front', () => {
      expect(cameraService.togglePosition('back')).toBe('front');
      expect(cameraService.togglePosition('front')).toBe('back');
    });
  });
});
