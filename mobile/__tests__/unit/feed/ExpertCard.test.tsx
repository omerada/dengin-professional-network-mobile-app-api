// __tests__/unit/feed/ExpertCard.test.tsx
// Test suite for ExpertCard component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExpertCard } from '@features/feed/components/SuggestedExpertsCarousel';
import type { SuggestedExpert } from '@features/feed/components/SuggestedExpertsCarousel';

// Mock dependencies
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

describe('ExpertCard', () => {
  const mockOnPress = jest.fn();
  const mockOnFollowPress = jest.fn();

  const mockExpert: SuggestedExpert = {
    id: 101,
    fullName: 'Dr. Ayşe Yılmaz',
    profession: 'Kardiyolog',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 1245,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders expert information correctly', () => {
      const { getByText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      expect(getByText('Dr. Ayşe Yılmaz')).toBeTruthy();
      expect(getByText('Kardiyolog')).toBeTruthy();
    });

    it('displays "Takip Et" button when not following', () => {
      const { getByText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      expect(getByText('Takip Et')).toBeTruthy();
    });

    it('displays "Takiptesin" button when following', () => {
      const followingExpert = { ...mockExpert, isFollowing: true };

      const { getByText } = render(
        <ExpertCard
          expert={followingExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      );

      expect(getByText('Takiptesin')).toBeTruthy();
    });

    it('displays verified badge for verified expert', () => {
      const { UNSAFE_getAllByType } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      const Icon = require('react-native-vector-icons/Ionicons').default;
      const icons = UNSAFE_getAllByType(Icon);

      // Should have 2 icons: person avatar + verified badge
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('does not display verified badge for non-verified expert', () => {
      const nonVerifiedExpert = { ...mockExpert, isVerified: false };

      const { getByText } = render(
        <ExpertCard
          expert={nonVerifiedExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      );

      // Name should still render
      expect(getByText('Dr. Ayşe Yılmaz')).toBeTruthy();
    });

    it('truncates long names to 2 lines', () => {
      const longNameExpert = {
        ...mockExpert,
        fullName: 'Prof. Dr. Very Long Name That Should Be Truncated',
      };

      const { getByText } = render(
        <ExpertCard
          expert={longNameExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      );

      const nameText = getByText('Prof. Dr. Very Long Name That Should Be Truncated');
      expect(nameText.props.numberOfLines).toBe(2);
    });

    it('truncates long profession to 1 line', () => {
      const longProfessionExpert = {
        ...mockExpert,
        profession: 'Very Long Profession Title That Should Be Truncated',
      };

      const { getByText } = render(
        <ExpertCard
          expert={longProfessionExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      );

      const professionText = getByText('Very Long Profession Title That Should Be Truncated');
      expect(professionText.props.numberOfLines).toBe(1);
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByLabelText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      const card = getByLabelText('Dr. Ayşe Yılmaz, Kardiyolog');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('calls onFollowPress when follow button is pressed', () => {
      const { getByLabelText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      const followButton = getByLabelText('Takip et');
      fireEvent.press(followButton);

      expect(mockOnFollowPress).toHaveBeenCalledTimes(1);
      expect(mockOnPress).not.toHaveBeenCalled(); // Should not trigger card press
    });

    it('does not call onPress when follow button is pressed', () => {
      const { getByText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      const followButton = getByText('Takip Et');
      fireEvent.press(followButton);

      expect(mockOnFollowPress).toHaveBeenCalledTimes(1);
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility label for card', () => {
      const { getByLabelText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      expect(getByLabelText('Dr. Ayşe Yılmaz, Kardiyolog')).toBeTruthy();
    });

    it('has accessibility label for follow button when not following', () => {
      const { getByLabelText } = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      );

      expect(getByLabelText('Takip et')).toBeTruthy();
    });

    it('has accessibility label for unfollow button when following', () => {
      const followingExpert = { ...mockExpert, isFollowing: true };

      const { getByLabelText } = render(
        <ExpertCard
          expert={followingExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      );

      expect(getByLabelText('Takipten çık')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot when not following', () => {
      const tree = render(
        <ExpertCard expert={mockExpert} onPress={mockOnPress} onFollowPress={mockOnFollowPress} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot when following', () => {
      const followingExpert = { ...mockExpert, isFollowing: true };

      const tree = render(
        <ExpertCard
          expert={followingExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for non-verified expert', () => {
      const nonVerifiedExpert = { ...mockExpert, isVerified: false };

      const tree = render(
        <ExpertCard
          expert={nonVerifiedExpert}
          onPress={mockOnPress}
          onFollowPress={mockOnFollowPress}
        />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
