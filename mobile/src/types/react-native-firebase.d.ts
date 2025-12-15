// Type declarations for @react-native-firebase/messaging
declare module '@react-native-firebase/messaging' {
  export namespace FirebaseMessagingTypes {
    export interface RemoteMessage {
      messageId?: string;
      data?: { [key: string]: string };
      notification?: Notification;
      sentTime?: number;
      ttl?: number;
      from?: string;
      collapseKey?: string;
      messageType?: string;
    }

    export interface Notification {
      title?: string;
      body?: string;
      android?: AndroidNotification;
      ios?: IOSNotification;
    }

    export interface AndroidNotification {
      channelId?: string;
      priority?: 'min' | 'low' | 'default' | 'high' | 'max';
      smallIcon?: string;
      sound?: string;
    }

    export interface IOSNotification {
      badge?: number;
      sound?: string;
    }
  }

  export default interface Messaging {
    getToken(): Promise<string>;
    onMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void): () => void;
    requestPermission(): Promise<number>;
  }
}
