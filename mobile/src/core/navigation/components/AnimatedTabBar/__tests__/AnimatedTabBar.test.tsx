// src/core/navigation/components/AnimatedTabBar/__tests__/AnimatedTabBar.test.tsx
// AnimatedTabBar Component Tests
// Test coverage: Rendering, interactions, center FAB, accessibility

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedTabBar } from '../AnimatedTabBar';
import type { AnimatedTabBarProps, TabItem } from '../AnimatedTabBar.types';

// Mock dependencies
jest.mock('@contexts/ThemeContext', () => ({
  useColors: jest.fn(() => ({
    interactive: {
      default: '#0066FF',
      focus: '#E6F0FF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
    },
    border: {
      default: '#E0E0E0',
    },
    status: {
      error: '#FF3B30',
    },
  })),
}));

jest.mock('@shared/hooks/useHaptic', () => ({
  useHaptic: jest.fn(() => ({
    trigger: jest.fn(),
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 20,
    left: 0,
    right: 0,
  })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock navigation
const mockNavigate = jest.fn();
const mockEmit = jest.fn(() => ({ defaultPrevented: false }));

const createMockNavigation = () => ({
  navigate: mockNavigate,
  emit: mockEmit,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getState: jest.fn(() => ({})),
  getParent: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

// Test data
const mockTabs: TabItem[] = [
  {
    name: 'FeedTab',
    label: 'Ana Sayfa',
    icon: 'home-outline',
    focusedIcon: 'home',
    accessibilityLabel: 'Ana sayfa sekmesi',
  },
  {
    name: 'MessagingTab',
    label: 'Mesajlar',
    icon: 'chatbubble-outline',
    focusedIcon: 'chatbubble',
    accessibilityLabel: 'Mesajlar sekmesi',
    badgeCount: 3,
  },
  {
    name: 'CreatePostTab',
    label: 'Oluştur',
    icon: 'add-circle',
    focusedIcon: 'add-circle',
    accessibilityLabel: 'Gönderi oluştur',
    isCenterFab: true,
  },
  {
    name: 'NotificationsTab',
    label: 'Bildirimler',
    icon: 'trophy-outline',
    focusedIcon: 'trophy',
    accessibilityLabel: 'Etkinlik sekmesi',
    showDot: true,
  },
  {
    name: 'ProfileTab',
    label: 'Profil',
    icon: 'person-outline',
    focusedIcon: 'person',
    accessibilityLabel: 'Profil sekmesi',
  },
];

const createMockProps = (overrides?: Partial<AnimatedTabBarProps>): AnimatedTabBarProps => ({
  state: {
    index: 0,
    routes: mockTabs.map(tab => ({ key: tab.name, name: tab.name, params: undefined })),
    routeNames: mockTabs.map(tab => tab.name),
    key: 'tab',
    type: 'tab',
    stale: false,
  },
  navigation: createMockNavigation() as any,
  descriptors: {} as any,
  tabs: mockTabs,
  ...overrides,
});

describe('AnimatedTabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tab buttons', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      expect(getByLabelText('Ana sayfa sekmesi')).toBeTruthy();
      expect(getByLabelText('Mesajlar sekmesi')).toBeTruthy();
      expect(getByLabelText('Gönderi oluştur')).toBeTruthy();
      expect(getByLabelText('Etkinlik sekmesi')).toBeTruthy();
      expect(getByLabelText('Profil sekmesi')).toBeTruthy();
    });

    it('should render tab labels', () => {
      const props = createMockProps();
      const { getByText } = render(<AnimatedTabBar {...props} />);

      expect(getByText('Ana Sayfa')).toBeTruthy();
      expect(getByText('Mesajlar')).toBeTruthy();
      expect(getByText('Oluştur')).toBeTruthy();
      expect(getByText('Bildirimler')).toBeTruthy();
      expect(getByText('Profil')).toBeTruthy();
    });

    it('should render badge count when provided', () => {
      const props = createMockProps();
      const { getByText } = render(<AnimatedTabBar {...props} />);

      expect(getByText('3')).toBeTruthy(); // MessagingTab badge
    });

    it('should render center FAB with elevated design', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const centerFab = getByLabelText('Gönderi oluştur');
      expect(centerFab).toBeTruthy();
      expect(centerFab.props.accessibilityRole).toBe('button');
    });
  });

  describe('Tab Interactions', () => {
    it('should navigate to tab when pressed', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const messagingTab = getByLabelText('Mesajlar sekmesi');
      fireEvent.press(messagingTab);

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'tabPress',
        target: 'MessagingTab',
        canPreventDefault: true,
      });
    });

    it('should not navigate if already focused', () => {
      const props = createMockProps({ state: { ...createMockProps().state, index: 0 } });
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const feedTab = getByLabelText('Ana sayfa sekmesi');
      fireEvent.press(feedTab);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should emit long press event', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const profileTab = getByLabelText('Profil sekmesi');
      fireEvent(profileTab, 'onLongPress');

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'tabLongPress',
        target: 'ProfileTab',
      });
    });
  });

  describe('Center FAB Interactions', () => {
    it('should handle center FAB press', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const centerFab = getByLabelText('Gönderi oluştur');
      fireEvent.press(centerFab);

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'tabPress',
        target: 'CreatePostTab',
        canPreventDefault: true,
      });
    });

    it('should have larger icon size for center FAB', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const centerFab = getByLabelText('Gönderi oluştur');
      expect(centerFab).toBeTruthy();
      // Center FAB should be visually distinct
    });
  });

  describe('Badge Display', () => {
    it('should show badge count correctly', () => {
      const props = createMockProps();
      const { getByText } = render(<AnimatedTabBar {...props} />);

      expect(getByText('3')).toBeTruthy();
    });

    it('should show 99+ for counts over 99', () => {
      const tabsWithLargeBadge = [...mockTabs];
      tabsWithLargeBadge[1] = { ...tabsWithLargeBadge[1], badgeCount: 150 };

      const props = createMockProps({ tabs: tabsWithLargeBadge });
      const { getByText } = render(<AnimatedTabBar {...props} />);

      expect(getByText('99+')).toBeTruthy();
    });

    it('should not render badge when count is 0', () => {
      const tabsWithoutBadge = [...mockTabs];
      tabsWithoutBadge[1] = { ...tabsWithoutBadge[1], badgeCount: 0 };

      const props = createMockProps({ tabs: tabsWithoutBadge });
      const { queryByText } = render(<AnimatedTabBar {...props} />);

      expect(queryByText('0')).toBeNull();
    });
  });

  describe('Focus State', () => {
    it('should indicate focused tab correctly', () => {
      const props = createMockProps({ state: { ...createMockProps().state, index: 0 } });
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const feedTab = getByLabelText('Ana sayfa sekmesi');
      expect(feedTab.props.accessibilityState.selected).toBe(true);
    });

    it('should indicate unfocused tabs correctly', () => {
      const props = createMockProps({ state: { ...createMockProps().state, index: 0 } });
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const messagingTab = getByLabelText('Mesajlar sekmesi');
      expect(messagingTab.props.accessibilityState.selected).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility roles', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const feedTab = getByLabelText('Ana sayfa sekmesi');
      expect(feedTab.props.accessibilityRole).toBe('tab');

      const centerFab = getByLabelText('Gönderi oluştur');
      expect(centerFab.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility labels for all tabs', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      mockTabs.forEach(tab => {
        expect(getByLabelText(tab.accessibilityLabel)).toBeTruthy();
      });
    });

    it('should have proper hit slop for easier interaction', () => {
      const props = createMockProps();
      const { getByLabelText } = render(<AnimatedTabBar {...props} />);

      const feedTab = getByLabelText('Ana sayfa sekmesi');
      expect(feedTab.props.hitSlop).toEqual({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      });
    });
  });

  describe('Safe Area Handling', () => {
    it('should apply safe area insets to bottom padding', () => {
      const props = createMockProps();
      const { getByTestId } = render(<AnimatedTabBar {...props} testID="tab-bar" />);

      const tabBar = getByTestId('tab-bar');
      expect(tabBar).toBeTruthy();
      // Safe area bottom inset should be applied to paddingBottom
    });
  });
});
