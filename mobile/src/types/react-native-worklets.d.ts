// Type declarations for react-native-worklets
declare module 'react-native-worklets' {
  export function scheduleOnRN(callback: () => void): void;
  export function scheduleOnJS(callback: () => void): void;
}
