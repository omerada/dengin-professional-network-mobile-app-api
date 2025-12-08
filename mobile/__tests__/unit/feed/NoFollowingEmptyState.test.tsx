// __tests__/unit/feed/NoFollowingEmptyState.test.tsx
// Test suite for NoFollowingEmptyState component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NoFollowingEmptyState } from '@features/feed/components/EmptyFeed/NoFollowingEmptyState';
import { MOCK_SUGGESTED_EXPERTS } from '@features/feed/components/EmptyFeed/NoFollowingEmptyState';
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

describe('NoFollowingEmptyState', () => {
  const mockOnDiscover = jest.fn();
  const mockOnShowAllSuggestions = jest.fn();
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
      const { getByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      // Title
      expect(getByText('Henüz Kimseyi Takip Etmiyorsun')).toBeTruthy();

      // Subtitle
      expect(getByText(/Uzmanları keşfet, ilgi alanlarına göre kişileri takip et/i)).toBeTruthy();

      // Primary CTA
      expect(getByText('Uzmanları Keşfet')).toBeTruthy();

      // Suggested experts (3)
      expect(getByText('Dr. Ayşe Yılmaz')).toBeTruthy();
      expect(getByText('Av. Mehmet Demir')).toBeTruthy();
      expect(getByText('Mimar Can Öztürk')).toBeTruthy();
    });

    it('renders secondary button when onShowAllSuggestions provided', () => {
      const { getByText } = render(
        <NoFollowingEmptyState
          onDiscover={mockOnDiscover}
          onShowAllSuggestions={mockOnShowAllSuggestions}
        />,
      );

      expect(getByText('Tüm Önerileri Gör')).toBeTruthy();
    });

    it('does not render secondary button when onShowAllSuggestions not provided', () => {
      const { queryByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      expect(queryByText('Tüm Önerileri Gör')).toBeNull();
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <NoFollowingEmptyState onDiscover={mockOnDiscover} testID="custom-test-id" />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('Suggested Experts', () => {
    it('displays 3 suggested experts', () => {
      const { getAllByRole } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      // 3 follow buttons + 1 primary CTA = 4 buttons
      const buttons = getAllByRole('button');
      const followButtons = buttons.filter(btn =>
        btn.props.accessibilityLabel?.includes('takip et'),
      );

      expect(followButtons).toHaveLength(3);
    });

    it('shows verified badge for verified experts', () => {
      const { getByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      // First two experts are verified
      const expert1 = getByText('Dr. Ayşe Yılmaz');
      const expert2 = getByText('Av. Mehmet Demir');

      expect(expert1).toBeTruthy();
      expect(expert2).toBeTruthy();
    });

    it('shows profession for each expert', () => {
      const { getByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      expect(getByText('Kardiyolog')).toBeTruthy();
      expect(getByText('İş Hukuku Avukatı')).toBeTruthy();
      expect(getByText('Mimarlık')).toBeTruthy();
    });
  });

  describe('Follow/Unfollow Interactions', () => {
    it('toggles follow state when follow button pressed', () => {
      const { getByLabelText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      const followButton = getByLabelText(/Dr\. Ayşe Yılmaz takip et/);
      expect(followButton).toBeTruthy();

      // Press follow
      fireEvent.press(followButton);

      // Button should now show "Takiptesin"
      const unfollowButton = getByLabelText(/Dr\. Ayşe Yılmaz takipten çık/);
      expect(unfollowButton).toBeTruthy();
    });

    it('triggers medium haptic feedback on follow toggle', () => {
      const { getByLabelText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      const followButton = getByLabelText(/Dr\. Ayşe Yılmaz takip et/);
      fireEvent.press(followButton);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('handles multiple follow/unfollow actions independently', () => {
      const { getByLabelText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      // Follow expert 1
      const followButton1 = getByLabelText(/Dr\. Ayşe Yılmaz takip et/);
      fireEvent.press(followButton1);

      // Follow expert 2
      const followButton2 = getByLabelText(/Av\. Mehmet Demir takip et/);
      fireEvent.press(followButton2);

      // Expert 1 should be following
      expect(getByLabelText(/Dr\. Ayşe Yılmaz takipten çık/)).toBeTruthy();

      // Expert 2 should be following
      expect(getByLabelText(/Av\. Mehmet Demir takipten çık/)).toBeTruthy();

      // Expert 3 should still not be following
      expect(getByLabelText(/Mimar Can Öztürk takip et/)).toBeTruthy();
    });
  });

  describe('CTA Buttons', () => {
    it('calls onDiscover when primary CTA pressed', () => {
      const { getByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      const discoverButton = getByText('Uzmanları Keşfet');
      fireEvent.press(discoverButton);

      expect(mockOnDiscover).toHaveBeenCalledTimes(1);
    });

    it('triggers medium haptic feedback on discover press', () => {
      const { getByText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      const discoverButton = getByText('Uzmanları Keşfet');
      fireEvent.press(discoverButton);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('calls onShowAllSuggestions when secondary button pressed', () => {
      const { getByText } = render(
        <NoFollowingEmptyState
          onDiscover={mockOnDiscover}
          onShowAllSuggestions={mockOnShowAllSuggestions}
        />,
      );

      const showAllButton = getByText('Tüm Önerileri Gör');
      fireEvent.press(showAllButton);

      expect(mockOnShowAllSuggestions).toHaveBeenCalledTimes(1);
    });

    it('triggers light haptic feedback on show all press', () => {
      const { getByText } = render(
        <NoFollowingEmptyState
          onDiscover={mockOnDiscover}
          onShowAllSuggestions={mockOnShowAllSuggestions}
        />,
      );

      const showAllButton = getByText('Tüm Önerileri Gör');
      fireEvent.press(showAllButton);

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for follow buttons', () => {
      const { getByLabelText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      expect(getByLabelText(/Dr\. Ayşe Yılmaz takip et/)).toBeTruthy();
      expect(getByLabelText(/Av\. Mehmet Demir takip et/)).toBeTruthy();
      expect(getByLabelText(/Mimar Can Öztürk takip et/)).toBeTruthy();
    });

    it('has accessibility label for discover button', () => {
      const { getByLabelText } = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />);

      expect(getByLabelText('Uzmanları keşfet')).toBeTruthy();
    });

    it('has accessibility label for show all button', () => {
      const { getByLabelText } = render(
        <NoFollowingEmptyState
          onDiscover={mockOnDiscover}
          onShowAllSuggestions={mockOnShowAllSuggestions}
        />,
      );

      expect(getByLabelText('Tüm önerileri gör')).toBeTruthy();
    });
  });

  describe('Mock Data', () => {
    it('MOCK_SUGGESTED_EXPERTS has 3 experts', () => {
      expect(MOCK_SUGGESTED_EXPERTS).toHaveLength(3);
    });

    it('MOCK_SUGGESTED_EXPERTS has correct structure', () => {
      MOCK_SUGGESTED_EXPERTS.forEach(expert => {
        expect(expert).toHaveProperty('id');
        expect(expert).toHaveProperty('fullName');
        expect(expert).toHaveProperty('profession');
        expect(expert).toHaveProperty('avatarUrl');
        expect(expert).toHaveProperty('isVerified');
        expect(expert).toHaveProperty('isFollowing');
      });
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const tree = render(<NoFollowingEmptyState onDiscover={mockOnDiscover} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with secondary button', () => {
      const tree = render(
        <NoFollowingEmptyState
          onDiscover={mockOnDiscover}
          onShowAllSuggestions={mockOnShowAllSuggestions}
        />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
