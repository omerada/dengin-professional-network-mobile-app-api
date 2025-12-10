// Type declarations for react-native-biometrics
// Native module - only works in EAS Build, mocked for Expo Go

declare module 'react-native-biometrics' {
  export interface BiometryType {
    available: boolean;
    biometryType?: 'FaceID' | 'TouchID' | 'Biometrics';
    error?: string;
  }

  export interface SimplePromptResult {
    success: boolean;
    error?: string;
  }

  export interface CreateKeysResult {
    publicKey: string;
  }

  export interface BiometricKeysExistResult {
    keysExist: boolean;
  }

  export interface DeleteKeysResult {
    keysDeleted: boolean;
  }

  export interface CreateSignatureResult {
    success: boolean;
    signature?: string;
    error?: string;
  }

  export interface CreateSignatureOptions {
    promptMessage: string;
    payload: string;
    cancelButtonText?: string;
  }

  export interface SimplePromptOptions {
    promptMessage: string;
    cancelButtonText?: string;
    fallbackPromptMessage?: string;
  }

  export default class ReactNativeBiometrics {
    constructor(options?: { allowDeviceCredentials?: boolean });

    isSensorAvailable(): Promise<BiometryType>;
    simplePrompt(options: SimplePromptOptions): Promise<SimplePromptResult>;
    createKeys(options?: { allowDeviceCredentials?: boolean }): Promise<CreateKeysResult>;
    biometricKeysExist(): Promise<BiometricKeysExistResult>;
    deleteKeys(): Promise<DeleteKeysResult>;
    createSignature(options: CreateSignatureOptions): Promise<CreateSignatureResult>;

    static readonly BiometryTypes: {
      FaceID: 'FaceID';
      TouchID: 'TouchID';
      Biometrics: 'Biometrics';
    };
  }

  export const BiometryTypes: {
    FaceID: 'FaceID';
    TouchID: 'TouchID';
    Biometrics: 'Biometrics';
  };
}
