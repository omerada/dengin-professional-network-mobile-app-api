// src/features/feed/components/EmptyFeed/NoPostsEmptyState/NoPostsEmptyState.types.ts
// Type definitions for NoPostsEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1634-1657
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 412-455

/**
 * Props for NoPostsEmptyState component
 */
export interface NoPostsEmptyStateProps {
  /**
   * User's profession for AI seed content
   */
  profession?: string;

  /**
   * Callback when "Trendleri Keşfet" CTA is pressed
   */
  onExploreTrends: () => void;

  /**
   * Callback when "İlk Paylaşımını Yap" button is pressed
   */
  onCreatePost?: () => void;

  /**
   * Optional test ID for testing
   * @default 'no-posts-empty-state'
   */
  testID?: string;
}

/**
 * AI-powered seed content (trending topics based on profession)
 */
export interface AISeedTrendCard {
  id: string;
  title: string;
  category: string;
  icon: string;
}

/**
 * Mock trending topics for different professions
 * TODO: Replace with real AI API call when backend ready
 */
export const MOCK_PROFESSION_TRENDS: Record<string, AISeedTrendCard[]> = {
  MEDICAL: [
    {
      id: 'med-1',
      title: 'Yapay Zeka Destekli Teşhis Sistemleri',
      category: 'Teknoloji',
      icon: 'medical-outline',
    },
    {
      id: 'med-2',
      title: 'Hasta Verisi Güvenliği',
      category: 'Güvenlik',
      icon: 'shield-checkmark-outline',
    },
  ],
  LEGAL: [
    {
      id: 'legal-1',
      title: 'Dijital Sözleşmeler ve E-İmza',
      category: 'Teknoloji',
      icon: 'document-text-outline',
    },
    {
      id: 'legal-2',
      title: 'KVKK Güncellemeleri 2025',
      category: 'Mevzuat',
      icon: 'shield-outline',
    },
  ],
  ENGINEERING: [
    {
      id: 'eng-1',
      title: 'Sürdürülebilir Yapı Tasarımı',
      category: 'İnşaat',
      icon: 'construct-outline',
    },
    {
      id: 'eng-2',
      title: 'Endüstri 4.0 Otomasyon',
      category: 'Teknoloji',
      icon: 'settings-outline',
    },
  ],
  DEFAULT: [
    {
      id: 'default-1',
      title: 'Profesyonel İletişim İpuçları',
      category: 'Kariyer',
      icon: 'people-outline',
    },
    {
      id: 'default-2',
      title: 'Networkin Gücü',
      category: 'Networking',
      icon: 'git-network-outline',
    },
  ],
};

/**
 * Get trending topics by profession
 */
export const getTrendsByProfession = (profession?: string): AISeedTrendCard[] => {
  if (!profession) return MOCK_PROFESSION_TRENDS.DEFAULT;

  const upperProfession = profession.toUpperCase();
  return MOCK_PROFESSION_TRENDS[upperProfession] || MOCK_PROFESSION_TRENDS.DEFAULT;
};
