// Type declarations for react-native-vision-camera
// Native module - only works in EAS Build, mocked for Expo Go

declare module 'react-native-vision-camera' {
  import { ViewProps } from 'react-native';

  export type CameraPermissionStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

  export interface CameraDevice {
    id: string;
    name: string;
    position: 'front' | 'back';
    hasFlash: boolean;
    hasTorch: boolean;
    minZoom: number;
    maxZoom: number;
    neutralZoom: number;
    isMultiCam: boolean;
    supportsDepthCapture: boolean;
    supportsRawCapture: boolean;
    supportsLowLightBoost: boolean;
    supportsFocus: boolean;
  }

  export interface PhotoFile {
    path: string;
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
    isMirrored: boolean;
  }

  export interface TakePhotoOptions {
    flash?: 'on' | 'off' | 'auto';
    qualityPrioritization?: 'speed' | 'balanced' | 'quality';
    skipMetadata?: boolean;
    enableShutterSound?: boolean;
  }

  export interface CameraProps extends ViewProps {
    device: CameraDevice;
    isActive: boolean;
    photo?: boolean;
    video?: boolean;
    audio?: boolean;
    zoom?: number;
    enableZoomGesture?: boolean;
    orientation?: 'portrait' | 'landscape-left' | 'landscape-right';
  }

  export class Camera extends React.Component<CameraProps> {
    static getCameraPermissionStatus(): Promise<CameraPermissionStatus>;
    static requestCameraPermission(): Promise<CameraPermissionStatus>;
    static getMicrophonePermissionStatus(): Promise<CameraPermissionStatus>;
    static requestMicrophonePermission(): Promise<CameraPermissionStatus>;
    static getAvailableCameraDevices(): CameraDevice[];

    takePhoto(options?: TakePhotoOptions): Promise<PhotoFile>;
    takeSnapshot(options?: TakePhotoOptions): Promise<PhotoFile>;
  }

  export function useCameraDevice(
    position: 'front' | 'back',
    options?: {
      physicalDevices?: ('ultra-wide-angle-camera' | 'wide-angle-camera' | 'telephoto-camera')[];
    },
  ): CameraDevice | undefined;

  export function useCameraPermission(): {
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
  };

  export function useCameraFormat(
    device: CameraDevice | undefined,
    options?: {
      fps?: number;
      videoResolution?: 'max' | { width: number; height: number };
      photoResolution?: 'max' | { width: number; height: number };
    },
  ): any;
}
