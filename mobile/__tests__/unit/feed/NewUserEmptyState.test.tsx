// __tests__/unit/feed/NewUserEmptyState.test.tsx
// Test suite for NewUserEmptyState component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NewUserEmptyState } from '@features/feed/components/EmptyFeed/NewUserEmptyState';
import {
  getChecklistStatus,
  getCompletionPercentage,
  getTotalXP,
} from '@features/feed/components/EmptyFeed/NewUserEmptyState';
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
      secondary: '#F3F4F6',
      tertiary: '#E5E7EB',
      success: '#ECFDF5',
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

describe('NewUserEmptyState', () => {
  const mockOnCompleteProfile = jest.fn();
  const mockOnChecklistItemPress = jest.fn();
  const mockTrigger = jest.fn();

  const mockNewUser = {
    name: 'Ahmet',
    hasAvatar: false,
    hasBio: false,
    followingCount: 0,
    postCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHaptic.mockReturnValue({
      trigger: mockTrigger,
      isSupported: true,
    });
  });

  describe('Rendering', () => {
    it('renders correctly with all elements', () => {
      const { getByText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      // Title with user name
      expect(getByText(/Hoş Geldin, Ahmet!/i)).toBeTruthy();

      // Subtitle
      expect(getByText(/Meslektaş topluluğuna katılmak için birkaç adım kaldı/i)).toBeTruthy();

      // Checklist items
      expect(getByText('Profil fotoğrafı ekle')).toBeTruthy();
      expect(getByText('Bio yaz')).toBeTruthy();
      expect(getByText('5 kişiyi takip et')).toBeTruthy();
      expect(getByText('İlk gönderiyi paylaş')).toBeTruthy();

      // CTA button
      expect(getByText('Profilimi Tamamla')).toBeTruthy();
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <NewUserEmptyState
          user={mockNewUser}
          onCompleteProfile={mockOnCompleteProfile}
          testID="custom-test-id"
        />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('renders with default test ID', () => {
      const { getByTestId } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByTestId('new-user-empty-state')).toBeTruthy();
    });
  });

  describe('Checklist Status', () => {
    it('shows all items as incomplete for new user', () => {
      const { getAllByLabelText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      const incompleteItems = getAllByLabelText(/tamamlanmadı/);
      expect(incompleteItems).toHaveLength(4);
    });

    it('shows avatar item as completed when user has avatar', () => {
      const userWithAvatar = { ...mockNewUser, hasAvatar: true };

      const { getByLabelText } = render(
        <NewUserEmptyState user={userWithAvatar} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText(/Profil fotoğrafı ekle.*tamamlandı/)).toBeTruthy();
    });

    it('shows bio item as completed when user has bio', () => {
      const userWithBio = { ...mockNewUser, hasBio: true };

      const { getByLabelText } = render(
        <NewUserEmptyState user={userWithBio} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText(/Bio yaz.*tamamlandı/)).toBeTruthy();
    });

    it('shows follow item as completed when user follows 5+ people', () => {
      const userWithFollowing = { ...mockNewUser, followingCount: 5 };

      const { getByLabelText } = render(
        <NewUserEmptyState user={userWithFollowing} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText(/5 kişiyi takip et.*tamamlandı/)).toBeTruthy();
    });

    it('shows post item as completed when user has posted', () => {
      const userWithPost = { ...mockNewUser, postCount: 1 };

      const { getByLabelText } = render(
        <NewUserEmptyState user={userWithPost} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText(/İlk gönderiyi paylaş.*tamamlandı/)).toBeTruthy();
    });
  });

  describe('Progress Calculation', () => {
    it('shows 0% progress for new user', () => {
      const { getByText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByText(/0% • 0 XP/)).toBeTruthy();
    });

    it('shows 25% progress when 1 item completed', () => {
      const userWithOneComplete = { ...mockNewUser, hasAvatar: true };

      const { getByText } = render(
        <NewUserEmptyState user={userWithOneComplete} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByText(/25% • 10 XP/)).toBeTruthy();
    });

    it('shows 50% progress when 2 items completed', () => {
      const userWithTwoComplete = { ...mockNewUser, hasAvatar: true, hasBio: true };

      const { getByText } = render(
        <NewUserEmptyState user={userWithTwoComplete} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByText(/50% • 20 XP/)).toBeTruthy();
    });

    it('shows 100% progress when all items completed', () => {
      const completeUser = {
        ...mockNewUser,
        hasAvatar: true,
        hasBio: true,
        followingCount: 5,
        postCount: 1,
      };

      const { getByText } = render(
        <NewUserEmptyState user={completeUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByText(/100% • 70 XP/)).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onCompleteProfile when CTA button pressed', () => {
      const { getByText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      const ctaButton = getByText('Profilimi Tamamla');
      fireEvent.press(ctaButton);

      expect(mockOnCompleteProfile).toHaveBeenCalledTimes(1);
    });

    it('triggers medium haptic feedback on CTA press', () => {
      const { getByText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      const ctaButton = getByText('Profilimi Tamamla');
      fireEvent.press(ctaButton);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
    });

    it('calls onChecklistItemPress when checklist item pressed', () => {
      const { getByText } = render(
        <NewUserEmptyState
          user={mockNewUser}
          onCompleteProfile={mockOnCompleteProfile}
          onChecklistItemPress={mockOnChecklistItemPress}
        />,
      );

      const avatarItem = getByText('Profil fotoğrafı ekle');
      fireEvent.press(avatarItem);

      expect(mockOnChecklistItemPress).toHaveBeenCalledWith('avatar');
    });

    it('triggers light haptic feedback on checklist item press', () => {
      const { getByText } = render(
        <NewUserEmptyState
          user={mockNewUser}
          onCompleteProfile={mockOnCompleteProfile}
          onChecklistItemPress={mockOnChecklistItemPress}
        />,
      );

      const bioItem = getByText('Bio yaz');
      fireEvent.press(bioItem);

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });
  });

  describe('Helper Functions', () => {
    it('getChecklistStatus returns correct status', () => {
      const user = {
        hasAvatar: true,
        hasBio: false,
        followingCount: 5,
        postCount: 0,
      };

      const status = getChecklistStatus(user);

      expect(status.avatar).toBe(true);
      expect(status.bio).toBe(false);
      expect(status.follow).toBe(true);
      expect(status.post).toBe(false);
    });

    it('getCompletionPercentage calculates correctly', () => {
      const newUser = { hasAvatar: false, hasBio: false, followingCount: 0, postCount: 0 };
      const halfComplete = { hasAvatar: true, hasBio: true, followingCount: 0, postCount: 0 };
      const allComplete = { hasAvatar: true, hasBio: true, followingCount: 5, postCount: 1 };

      expect(getCompletionPercentage(newUser)).toBe(0);
      expect(getCompletionPercentage(halfComplete)).toBe(50);
      expect(getCompletionPercentage(allComplete)).toBe(100);
    });

    it('getTotalXP calculates correctly', () => {
      const newUser = { hasAvatar: false, hasBio: false, followingCount: 0, postCount: 0 };
      const partialUser = { hasAvatar: true, hasBio: false, followingCount: 5, postCount: 0 };
      const allComplete = { hasAvatar: true, hasBio: true, followingCount: 5, postCount: 1 };

      expect(getTotalXP(newUser)).toBe(0);
      expect(getTotalXP(partialUser)).toBe(30); // 10 (avatar) + 20 (follow)
      expect(getTotalXP(allComplete)).toBe(70); // 10+10+20+30
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for checklist items', () => {
      const { getByLabelText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText(/Profil fotoğrafı ekle.*10 XP/)).toBeTruthy();
      expect(getByLabelText(/Bio yaz.*10 XP/)).toBeTruthy();
      expect(getByLabelText(/5 kişiyi takip et.*20 XP/)).toBeTruthy();
      expect(getByLabelText(/İlk gönderiyi paylaş.*30 XP/)).toBeTruthy();
    });

    it('has accessibility label for CTA button', () => {
      const { getByLabelText } = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      );

      expect(getByLabelText('Profilimi tamamla')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot with new user', () => {
      const tree = render(
        <NewUserEmptyState user={mockNewUser} onCompleteProfile={mockOnCompleteProfile} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with partial completion', () => {
      const partialUser = { ...mockNewUser, hasAvatar: true, hasBio: true };

      const tree = render(
        <NewUserEmptyState user={partialUser} onCompleteProfile={mockOnCompleteProfile} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
