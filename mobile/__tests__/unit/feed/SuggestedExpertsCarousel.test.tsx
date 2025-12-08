// __tests__/unit/feed/SuggestedExpertsCarousel.test.tsx
// Test suite for SuggestedExpertsCarousel component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SuggestedExpertsCarousel } from '@features/feed/components/SuggestedExpertsCarousel';
import { MOCK_SUGGESTED_EXPERTS } from '@features/feed/components/SuggestedExpertsCarousel';
import { useHaptic } from '@shared/hooks/useHaptic';

// Mock dependencies
jest.mock('@shared/hooks/useHaptic');
jest.mock('@contexts/ThemeContext', () => ({
  useColors: () => ({
    interactive: {
      default: '#0066FF',
      success: '#10B981',
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

describe('SuggestedExpertsCarousel', () => {
  const mockOnExpertPress = jest.fn();
  const mockOnFollowToggle = jest.fn();
  const mockTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHaptic.mockReturnValue({
      trigger: mockTrigger,
      isSupported: true,
    });
  });

  describe('Rendering', () => {
    it('renders carousel with title', () => {
      const { getByText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      expect(getByText('Takip Edebileceğin Uzmanlar')).toBeTruthy();
    });

    it('renders horizontal ScrollView', () => {
      const { getByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      expect(getByLabelText('Önerilen uzmanlar listesi')).toBeTruthy();
    });

    it('displays all suggested experts', () => {
      const { getByText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      // Check first 3 experts
      expect(getByText('Dr. Ayşe Yılmaz')).toBeTruthy();
      expect(getByText('Av. Mehmet Demir')).toBeTruthy();
      expect(getByText('Mimar Can Öztürk')).toBeTruthy();
    });

    it('renders 8 expert cards by default', () => {
      const { getAllByRole } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const cards = getAllByRole('button').filter(btn =>
        btn.props.accessibilityHint?.includes('Profili görüntülemek'),
      );

      expect(cards).toHaveLength(8);
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
          testID="custom-test-id"
        />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('Expert Cards', () => {
    it('displays expert name and profession', () => {
      const { getByText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const firstExpert = MOCK_SUGGESTED_EXPERTS[0];
      expect(getByText(firstExpert.fullName)).toBeTruthy();
      expect(getByText(firstExpert.profession)).toBeTruthy();
    });

    it('shows follow button for all experts', () => {
      const { getAllByText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const followButtons = getAllByText('Takip Et');
      expect(followButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('calls onExpertPress when expert card is pressed', () => {
      const { getByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const firstExpert = MOCK_SUGGESTED_EXPERTS[0];
      const expertCard = getByLabelText(`${firstExpert.fullName}, ${firstExpert.profession}`);
      fireEvent.press(expertCard);

      expect(mockOnExpertPress).toHaveBeenCalledWith(firstExpert.id);
    });

    it('triggers light haptic feedback on expert press', () => {
      const { getByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const firstExpert = MOCK_SUGGESTED_EXPERTS[0];
      const expertCard = getByLabelText(`${firstExpert.fullName}, ${firstExpert.profession}`);
      fireEvent.press(expertCard);

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });

    it('calls onFollowToggle when follow button is pressed', () => {
      const { getAllByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const followButtons = getAllByLabelText('Takip et');
      fireEvent.press(followButtons[0]);

      const firstExpert = MOCK_SUGGESTED_EXPERTS[0];
      expect(mockOnFollowToggle).toHaveBeenCalledWith(firstExpert.id, true);
    });

    it('triggers medium haptic feedback on follow toggle', () => {
      const { getAllByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const followButtons = getAllByLabelText('Takip et');
      fireEvent.press(followButtons[0]);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('optimistically updates follow state', () => {
      const { getAllByLabelText, getByText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const followButtons = getAllByLabelText('Takip et');
      const firstFollowButton = followButtons[0];

      // Press follow
      fireEvent.press(firstFollowButton);

      // Should now show "Takiptesin" for that expert
      const firstExpert = MOCK_SUGGESTED_EXPERTS[0];
      const unfollowButton = getAllByLabelText('Takipten çık')[0];
      expect(unfollowButton).toBeTruthy();
    });

    it('handles multiple follow/unfollow actions independently', () => {
      const { getAllByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const followButtons = getAllByLabelText('Takip et');

      // Follow first expert
      fireEvent.press(followButtons[0]);
      expect(mockOnFollowToggle).toHaveBeenCalledWith(MOCK_SUGGESTED_EXPERTS[0].id, true);

      // Follow second expert
      fireEvent.press(followButtons[1]);
      expect(mockOnFollowToggle).toHaveBeenCalledWith(MOCK_SUGGESTED_EXPERTS[1].id, true);

      // Total calls: 2
      expect(mockOnFollowToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe('Mock Data', () => {
    it('MOCK_SUGGESTED_EXPERTS has 8 experts', () => {
      expect(MOCK_SUGGESTED_EXPERTS).toHaveLength(8);
    });

    it('MOCK_SUGGESTED_EXPERTS has correct structure', () => {
      MOCK_SUGGESTED_EXPERTS.forEach(expert => {
        expect(expert).toHaveProperty('id');
        expect(expert).toHaveProperty('fullName');
        expect(expert).toHaveProperty('profession');
        expect(expert).toHaveProperty('avatarUrl');
        expect(expert).toHaveProperty('isVerified');
        expect(expert).toHaveProperty('isFollowing');
        expect(expert).toHaveProperty('followerCount');
      });
    });

    it('all experts start with isFollowing: false', () => {
      MOCK_SUGGESTED_EXPERTS.forEach(expert => {
        expect(expert.isFollowing).toBe(false);
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessibility role for scroll view', () => {
      const { getByLabelText } = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      );

      const scrollView = getByLabelText('Önerilen uzmanlar listesi');
      expect(scrollView.props.accessibilityRole).toBe('list');
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const tree = render(
        <SuggestedExpertsCarousel
          onExpertPress={mockOnExpertPress}
          onFollowToggle={mockOnFollowToggle}
        />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
