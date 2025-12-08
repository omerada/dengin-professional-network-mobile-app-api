// __tests__/unit/feed/NoPostsEmptyState.test.tsx
// Test suite for NoPostsEmptyState component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NoPostsEmptyState } from '@features/feed/components/EmptyFeed/NoPostsEmptyState';
import {
  MOCK_PROFESSION_TRENDS,
  getTrendsByProfession,
} from '@features/feed/components/EmptyFeed/NoPostsEmptyState';
import { useHaptic } from '@shared/hooks/useHaptic';

// Mock dependencies
jest.mock('@shared/hooks/useHaptic');
jest.mock('@contexts/ThemeContext', () => ({
  useColors: () => ({
    interactive: {
      default: '#0066FF',
    },
    background: {
      card: '#FFFFFF',
      secondary: '#F3F4F6',
      tertiary: '#E5E7EB',
    },
    border: {
      default: '#D1D5DB',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  }),
}));

const mockUseHaptic = useHaptic as jest.MockedFunction<typeof useHaptic>;

describe('NoPostsEmptyState', () => {
  const mockOnExploreTrends = jest.fn();
  const mockOnCreatePost = jest.fn();
  const mockTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHaptic.mockReturnValue({
      trigger: mockTrigger,
      isSupported: true,
    });
  });

  describe('Rendering', () => {
    it('renders correctly with all elements', () => {
      const { getByText } = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />);

      // Title
      expect(getByText('Takip Ettiklerin Henüz Gönderi Paylaşmadı')).toBeTruthy();

      // Subtitle
      expect(
        getByText(/AI-powered önerilerle ilginizi çekebilecek içerikleri keşfedin/i),
      ).toBeTruthy();

      // Section title
      expect(getByText('Senin için önerilen trendler')).toBeTruthy();

      // Primary CTA
      expect(getByText('Trendleri Keşfet')).toBeTruthy();
    });

    it('renders secondary button when onCreatePost provided', () => {
      const { getByText } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} onCreatePost={mockOnCreatePost} />,
      );

      expect(getByText('İlk Paylaşımını Yap')).toBeTruthy();
    });

    it('does not render secondary button when onCreatePost not provided', () => {
      const { queryByText } = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />);

      expect(queryByText('İlk Paylaşımını Yap')).toBeNull();
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} testID="custom-test-id" />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('AI Seed Content', () => {
    it('displays default trends when no profession provided', () => {
      const { getByText } = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />);

      const defaultTrends = MOCK_PROFESSION_TRENDS.DEFAULT;
      expect(getByText(defaultTrends[0].title)).toBeTruthy();
      expect(getByText(defaultTrends[1].title)).toBeTruthy();
    });

    it('displays MEDICAL trends for MEDICAL profession', () => {
      const { getByText } = render(
        <NoPostsEmptyState profession="MEDICAL" onExploreTrends={mockOnExploreTrends} />,
      );

      const medicalTrends = MOCK_PROFESSION_TRENDS.MEDICAL;
      expect(getByText(medicalTrends[0].title)).toBeTruthy();
      expect(getByText(medicalTrends[1].title)).toBeTruthy();
    });

    it('displays LEGAL trends for LEGAL profession', () => {
      const { getByText } = render(
        <NoPostsEmptyState profession="LEGAL" onExploreTrends={mockOnExploreTrends} />,
      );

      const legalTrends = MOCK_PROFESSION_TRENDS.LEGAL;
      expect(getByText(legalTrends[0].title)).toBeTruthy();
      expect(getByText(legalTrends[1].title)).toBeTruthy();
    });

    it('displays ENGINEERING trends for ENGINEERING profession', () => {
      const { getByText } = render(
        <NoPostsEmptyState profession="ENGINEERING" onExploreTrends={mockOnExploreTrends} />,
      );

      const engineeringTrends = MOCK_PROFESSION_TRENDS.ENGINEERING;
      expect(getByText(engineeringTrends[0].title)).toBeTruthy();
      expect(getByText(engineeringTrends[1].title)).toBeTruthy();
    });

    it('handles case-insensitive profession names', () => {
      const { getByText } = render(
        <NoPostsEmptyState profession="medical" onExploreTrends={mockOnExploreTrends} />,
      );

      const medicalTrends = MOCK_PROFESSION_TRENDS.MEDICAL;
      expect(getByText(medicalTrends[0].title)).toBeTruthy();
    });

    it('displays category for each trend', () => {
      const { getByText } = render(
        <NoPostsEmptyState profession="MEDICAL" onExploreTrends={mockOnExploreTrends} />,
      );

      expect(getByText('Teknoloji')).toBeTruthy();
      expect(getByText('Güvenlik')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onExploreTrends when primary CTA pressed', () => {
      const { getByText } = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />);

      const exploreButton = getByText('Trendleri Keşfet');
      fireEvent.press(exploreButton);

      expect(mockOnExploreTrends).toHaveBeenCalledTimes(1);
    });

    it('triggers medium haptic feedback on explore press', () => {
      const { getByText } = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />);

      const exploreButton = getByText('Trendleri Keşfet');
      fireEvent.press(exploreButton);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('calls onCreatePost when secondary button pressed', () => {
      const { getByText } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} onCreatePost={mockOnCreatePost} />,
      );

      const createPostButton = getByText('İlk Paylaşımını Yap');
      fireEvent.press(createPostButton);

      expect(mockOnCreatePost).toHaveBeenCalledTimes(1);
    });

    it('triggers medium haptic feedback on create post press', () => {
      const { getByText } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} onCreatePost={mockOnCreatePost} />,
      );

      const createPostButton = getByText('İlk Paylaşımını Yap');
      fireEvent.press(createPostButton);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('triggers light haptic feedback on trend card press', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByText } = render(
        <NoPostsEmptyState profession="MEDICAL" onExploreTrends={mockOnExploreTrends} />,
      );

      const trendCard = getByText('Yapay Zeka Destekli Teşhis Sistemleri');
      fireEvent.press(trendCard);

      expect(mockTrigger).toHaveBeenCalledWith('light');
      expect(consoleSpy).toHaveBeenCalledWith('Trend pressed: med-1');

      consoleSpy.mockRestore();
    });
  });

  describe('Helper Functions', () => {
    it('getTrendsByProfession returns MEDICAL trends for MEDICAL', () => {
      const trends = getTrendsByProfession('MEDICAL');
      expect(trends).toEqual(MOCK_PROFESSION_TRENDS.MEDICAL);
    });

    it('getTrendsByProfession returns LEGAL trends for LEGAL', () => {
      const trends = getTrendsByProfession('LEGAL');
      expect(trends).toEqual(MOCK_PROFESSION_TRENDS.LEGAL);
    });

    it('getTrendsByProfession returns DEFAULT trends for unknown profession', () => {
      const trends = getTrendsByProfession('UNKNOWN');
      expect(trends).toEqual(MOCK_PROFESSION_TRENDS.DEFAULT);
    });

    it('getTrendsByProfession returns DEFAULT trends when no profession provided', () => {
      const trends = getTrendsByProfession();
      expect(trends).toEqual(MOCK_PROFESSION_TRENDS.DEFAULT);
    });

    it('getTrendsByProfession handles case-insensitive input', () => {
      const trends = getTrendsByProfession('medical');
      expect(trends).toEqual(MOCK_PROFESSION_TRENDS.MEDICAL);
    });
  });

  describe('Accessibility', () => {
    it('has accessibility label for explore button', () => {
      const { getByLabelText } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />,
      );

      expect(getByLabelText('Trendleri keşfet')).toBeTruthy();
    });

    it('has accessibility label for create post button', () => {
      const { getByLabelText } = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} onCreatePost={mockOnCreatePost} />,
      );

      expect(getByLabelText('İlk paylaşımını yap')).toBeTruthy();
    });

    it('has proper accessibility labels for trend cards', () => {
      const { getByLabelText } = render(
        <NoPostsEmptyState profession="MEDICAL" onExploreTrends={mockOnExploreTrends} />,
      );

      const medicalTrends = MOCK_PROFESSION_TRENDS.MEDICAL;
      expect(
        getByLabelText(`${medicalTrends[0].title}, ${medicalTrends[0].category} kategorisi`),
      ).toBeTruthy();
      expect(
        getByLabelText(`${medicalTrends[1].title}, ${medicalTrends[1].category} kategorisi`),
      ).toBeTruthy();
    });
  });

  describe('Mock Data', () => {
    it('MOCK_PROFESSION_TRENDS has expected professions', () => {
      expect(MOCK_PROFESSION_TRENDS).toHaveProperty('MEDICAL');
      expect(MOCK_PROFESSION_TRENDS).toHaveProperty('LEGAL');
      expect(MOCK_PROFESSION_TRENDS).toHaveProperty('ENGINEERING');
      expect(MOCK_PROFESSION_TRENDS).toHaveProperty('DEFAULT');
    });

    it('each profession has 2 trends', () => {
      Object.values(MOCK_PROFESSION_TRENDS).forEach(trends => {
        expect(trends).toHaveLength(2);
      });
    });

    it('each trend has correct structure', () => {
      Object.values(MOCK_PROFESSION_TRENDS).forEach(trends => {
        trends.forEach(trend => {
          expect(trend).toHaveProperty('id');
          expect(trend).toHaveProperty('title');
          expect(trend).toHaveProperty('category');
          expect(trend).toHaveProperty('icon');
        });
      });
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot with default profession', () => {
      const tree = render(<NoPostsEmptyState onExploreTrends={mockOnExploreTrends} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with MEDICAL profession', () => {
      const tree = render(
        <NoPostsEmptyState profession="MEDICAL" onExploreTrends={mockOnExploreTrends} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with secondary button', () => {
      const tree = render(
        <NoPostsEmptyState onExploreTrends={mockOnExploreTrends} onCreatePost={mockOnCreatePost} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
