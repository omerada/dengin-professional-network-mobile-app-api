// src/features/messaging/components/MessageBubble/MessageBubble.types.ts
// MessageBubble type definitions
// Instagram/WhatsApp kalitesinde mesaj baloncuğu

import type { StyleProp, ViewStyle } from 'react-native';
import type { Message, ClientMessage, ClientMessageStatus } from '../../types';

/**
 * Mesaj status type - Backend ile uyumlu
 */
export type MessageStatusType = ClientMessageStatus;

/**
 * Swipe-to-reply durumu
 */
export interface SwipeState {
  isActive: boolean;
  direction: 'left' | 'right' | null;
  progress: number;
}

/**
 * Mesaj reaksiyonu
 */
export interface MessageReaction {
  emoji: string;
  userId: string;
  userName?: string;
}

/**
 * MessageBubble Props
 */
export interface MessageBubbleProps {
  /**
   * Mesaj verisi
   */
  message: Message | ClientMessage;

  /**
   * Mesajın kendi mesajımız olup olmadığı
   */
  isOwn?: boolean;

  /**
   * Avatar gösterilsin mi
   */
  showAvatar?: boolean;

  /**
   * Mesaj index'i (animasyon için)
   */
  index?: number;

  /**
   * Long press handler
   */
  onLongPress?: (message: Message | ClientMessage) => void;

  /**
   * Swipe-to-reply handler
   */
  onReply?: (message: Message | ClientMessage) => void;

  /**
   * Resim tıklama handler
   */
  onImagePress?: (url: string) => void;

  /**
   * Yeniden gönder handler (hatalı mesajlar için)
   */
  onRetry?: (message: Message | ClientMessage) => void;

  /**
   * Stil override
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * MessageStatus Component Props
 */
export interface MessageStatusIconProps {
  status: MessageStatusType;
  animated?: boolean;
}

/**
 * MessageContent Props (text, reply preview)
 */
export interface MessageContentProps {
  message: Message | ClientMessage;
  isOwn: boolean;
  textColor: string;
}

/**
 * MessageAttachment Props
 */
export interface MessageAttachmentProps {
  attachment: {
    url: string;
    contentType?: string;
    fileName?: string;
    fileSize?: number;
  };
  isOwn: boolean;
  onImagePress?: (url: string) => void;
}

/**
 * MessageMeta Props (time, status)
 */
export interface MessageMetaProps {
  message: Message | ClientMessage;
  isOwn: boolean;
  metaColor: string;
}
