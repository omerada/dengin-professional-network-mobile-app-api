// src/features/feed/components/EmptyFeed.tsx
// Production-ready Empty Feed with multiple states
// Oku: mobile-development-guide/ui-ux-modernization/07-EMPTY-STATES.md

import React, { memo } from 'react';
import { EmptyState } from '@shared/components';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

// Type placeholder
type MainStackNavigationProp = StackNavigationProp<any>;

// ============================================================================
// Types
// ============================================================================

/**
 * Feed empty state types
 */
export type EmptyFeedType =
  | 'no-posts' // Hiç gönderi yok
  | 'no-following' // Takip edilen yok
  | 'no-results' // Arama/filtreleme sonucu yok
  | 'offline' // Çevrimdışı mod
  | 'error'; // Sunucu hatası

interface EmptyFeedProps {
  /** Empty state type - determines content and actions */
  type?: EmptyFeedType;
  /** Custom title override */
  title?: string;
  /** Custom message override */
  message?: string;
  /** Custom action label override */
  actionLabel?: string;
  /** Custom action handler */
  onAction?: () => void;
  /** Custom icon override */
  icon?: string;
  /** Retry handler for error states */
  onRetry?: () => void;
}

// ============================================================================
// EmptyFeed Component
// ============================================================================

/**
 * EmptyFeed Component with contextual states
 *
 * Supports 5 different empty states:
 * - no-posts: İlk gönderi oluşturma teşviki
 * - no-following: Kullanıcı takip etme teşviki
 * - no-results: Arama/filtreleme sonucu boş
 * - offline: İnternet bağlantısı yok
 * - error: Sunucu hatası
 *
 * @example
 * ```tsx
 * <EmptyFeed type="no-following" />
 * <EmptyFeed type="error" onRetry={refetch} />
 * <EmptyFeed type="no-posts" onAction={() => navigate('CreatePost')} />
 * ```
 */
export const EmptyFeed: React.FC<EmptyFeedProps> = memo(
  ({ type = 'no-posts', title, message, actionLabel, onAction, icon, onRetry }) => {
    const navigation = useNavigation<MainStackNavigationProp>();

    // State-specific configurations
    const configs: Record<
      EmptyFeedType,
      {
        icon: string;
        title: string;
        description: string;
        actionTitle?: string;
        actionHandler?: () => void;
      }
    > = {
      'no-posts': {
        icon: 'newspaper-outline',
        title: 'Henüz Gönderi Yok',
        description: 'İlk gönderiyi sen oluştur ve profesyonel ağını genişletmeye başla!',
        actionTitle: 'Gönderi Oluştur',
        actionHandler: () => navigation.navigate('CreatePost'),
      },
      'no-following': {
        icon: 'people-outline',
        title: 'Henüz Kimseyi Takip Etmiyorsun',
        description:
          'Profesyonelleri keşfet ve ağını genişlet. Takip ettiğin kişilerin gönderileri burada görünecek.',
        actionTitle: 'Keşfet',
        actionHandler: () => {
          // Navigate to explore/search
          // TODO: Add explore screen navigation when available
        },
      },
      'no-results': {
        icon: 'search-outline',
        title: 'Sonuç Bulunamadı',
        description:
          'Aradığın kriterlere uygun gönderi bulunamadı. Farklı filtreler deneyebilirsin.',
      },
      offline: {
        icon: 'cloud-offline-outline',
        title: 'İnternet Bağlantısı Yok',
        description: 'Gönderileri görmek için internet bağlantınızı kontrol edin.',
      },
      error: {
        icon: 'alert-circle-outline',
        title: 'Bir Hata Oluştu',
        description: 'Gönderiler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
        actionTitle: 'Tekrar Dene',
        actionHandler: onRetry,
      },
    };

    const config = configs[type];

    return (
      <EmptyState
        icon={icon || config.icon}
        title={title || config.title}
        description={message || config.description}
        action={
          (actionLabel || config.actionTitle) && (onAction || config.actionHandler)
            ? {
                title: actionLabel || config.actionTitle!,
                onPress: onAction || config.actionHandler!,
                variant: type === 'error' ? 'secondary' : 'primary',
              }
            : undefined
        }
        floatingIcon
        animated
      />
    );
  },
);

EmptyFeed.displayName = 'EmptyFeed';

export default EmptyFeed;
