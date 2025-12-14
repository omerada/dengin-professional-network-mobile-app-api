// src/constants/emptyStatePresets.ts
// Standardized Empty State Presets for Dengin App

import type { EmptyStateProps } from '@shared/components/EmptyState/EmptyState';

/**
 * Standardized Empty State Configurations
 *
 * Usage:
 * import { EMPTY_STATE_PRESETS } from '@constants/emptyStatePresets';
 * <EmptyState {...EMPTY_STATE_PRESETS.emptyFeed} action={{ ...EMPTY_STATE_PRESETS.emptyFeed.action, onPress: handleAction }} />
 */
export const EMPTY_STATE_PRESETS: Record<
  string,
  Omit<EmptyStateProps, 'action'> & {
    action?: Omit<NonNullable<EmptyStateProps['action']>, 'onPress'>;
  }
> = {
  /**
   * Empty feed state - no posts
   */
  emptyFeed: {
    icon: 'newspaper-outline',
    title: 'Henüz gönderi yok',
    description: 'İlk gönderiyi oluşturmak için butona tıklayın',
    action: {
      title: 'Gönderi Oluştur',
      variant: 'primary',
    },
  },

  /**
   * Empty feed - no following
   */
  emptyFeedNoFollowing: {
    icon: 'people-outline',
    title: 'Henüz kimseyi takip etmiyorsun',
    description: 'Profesyonelleri keşfet ve ağını genişlet',
    action: {
      title: 'Keşfet',
      variant: 'primary',
    },
  },

  /**
   * Feed search no results
   */
  feedNoResults: {
    icon: 'search-outline',
    title: 'Sonuç bulunamadı',
    description: 'Farklı filtreler veya arama terimleri deneyin',
  },

  /**
   * Feed offline
   */
  feedOffline: {
    icon: 'cloud-offline-outline',
    title: 'İnternet bağlantısı yok',
    description: 'Bağlantınızı kontrol edin',
  },

  /**
   * Feed error
   */
  feedError: {
    icon: 'alert-circle-outline',
    title: 'Bir hata oluştu',
    description: 'Lütfen tekrar deneyin',
    action: {
      title: 'Tekrar Dene',
      variant: 'secondary',
    },
  },

  /**
   * Empty notifications state
   */
  emptyNotifications: {
    icon: 'notifications-outline',
    title: 'Bildirim yok',
    description: 'Yeni bildirimler burada görünecek',
  },

  /**
   * Empty messages state
   */
  emptyMessages: {
    icon: 'chatbubble-outline',
    title: 'Mesaj yok',
    description: 'Yeni bir sohbet başlatmak için butona tıklayın',
    action: {
      title: 'Yeni Sohbet',
      variant: 'primary',
    },
  },

  /**
   * Empty conversations state
   */
  emptyConversations: {
    icon: 'chatbubbles-outline',
    title: 'Henüz sohbet yok',
    description: 'Profesyonellerle bağlantı kurmak için ilk mesajı gönderin',
    action: {
      title: 'Sohbet Başlat',
      variant: 'primary',
    },
  },

  /**
   * Search no results state
   */
  searchNoResults: {
    icon: 'search-outline',
    title: 'Sonuç bulunamadı',
    description: 'Farklı anahtar kelimeler deneyin',
  },

  /**
   * Empty activity state
   */
  emptyActivity: {
    icon: 'trophy-outline',
    title: 'Henüz etkinlik yok',
    description: 'Aktiviteleriniz burada görünecek',
  },

  /**
   * Empty posts (user profile)
   */
  emptyPosts: {
    icon: 'document-text-outline',
    title: 'Henüz gönderi yok',
    description: 'Bu kullanıcının henüz paylaştığı gönderi bulunmuyor',
  },

  /**
   * Empty followers
   */
  emptyFollowers: {
    icon: 'people-outline',
    title: 'Takipçi yok',
    description: 'Henüz takipçiniz bulunmuyor',
  },

  /**
   * Empty following
   */
  emptyFollowing: {
    icon: 'person-add-outline',
    title: 'Kimseyi takip etmiyorsunuz',
    description: 'Profesyonelleri keşfetmek için arama yapın',
    action: {
      title: 'Keşfet',
      variant: 'primary',
    },
  },

  /**
   * Network error state
   */
  networkError: {
    icon: 'cloud-offline-outline',
    title: 'Bağlantı yok',
    description: 'İnternet bağlantınızı kontrol edin',
  },

  /**
   * Coming soon state
   */
  comingSoon: {
    icon: 'hourglass-outline',
    title: 'Yakında Gelecek',
    description: 'Bu özellik üzerinde çalışıyoruz',
  },
} as const;
