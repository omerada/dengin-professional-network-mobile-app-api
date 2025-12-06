// src/features/messaging/components/ConversationItem/ConversationItem.types.ts
// ConversationItem type definitions
// Instagram DM kalitesinde konuşma listesi öğesi

import type { StyleProp, ViewStyle } from 'react-native';
import type { Conversation } from '../../types';

/**
 * ConversationItem Props
 */
export interface ConversationItemProps {
  /**
   * Konuşma verisi
   */
  conversation: Conversation;

  /**
   * Tıklama handler
   */
  onPress: (conversation: Conversation) => void;

  /**
   * Uzun basma handler
   */
  onLongPress?: (conversation: Conversation) => void;

  /**
   * Animasyon indexi
   */
  index?: number;

  /**
   * Stil override
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * ConversationAvatar Props
 */
export interface ConversationAvatarProps {
  /**
   * Profil resmi URL
   */
  profileImageUrl: string | null;

  /**
   * Kullanıcı adı (ilk harf için)
   */
  fullName: string;

  /**
   * Çevrimiçi mi
   */
  isOnline: boolean;

  /**
   * Doğrulanmış mı
   */
  verified: boolean;
}

/**
 * ConversationContent Props
 */
export interface ConversationContentProps {
  /**
   * Katılımcı adı
   */
  fullName: string;

  /**
   * Meslek
   */
  profession: string;

  /**
   * Son mesaj önizlemesi
   */
  preview: string;

  /**
   * Zaman
   */
  time: string;

  /**
   * Yazıyor mu
   */
  isTyping: boolean;

  /**
   * Okunmamış mı
   */
  hasUnread: boolean;

  /**
   * Okunmamış sayısı
   */
  unreadCount: number;

  /**
   * Son mesaj benim mi
   */
  isSentByMe: boolean;
}

/**
 * UnreadBadge Props
 */
export interface UnreadBadgeProps {
  count: number;
}
