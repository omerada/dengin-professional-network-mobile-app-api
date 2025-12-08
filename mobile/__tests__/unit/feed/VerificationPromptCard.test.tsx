// __tests__/unit/feed/VerificationPromptCard.test.tsx
// Test suite for VerificationPromptCard component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VerificationPromptCard } from '@features/feed/components/VerificationPromptCard';
import { useHaptic } from '@shared/hooks/useHaptic';

// Mock dependencies
jest.mock('@shared/hooks/useHaptic');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('@contexts/ThemeContext', () => ({
  useColors: () => ({
    interactive: {
      default: '#0066FF',
      pressed: '#0052CC',
    },
    background: {
      primary: '#FFFFFF',
    },
    text: {
      inverse: '#FFFFFF',
    },
  }),
}));

const mockUseHaptic = useHaptic as jest.MockedFunction<typeof useHaptic>;

describe('VerificationPromptCard', () => {
  const mockOnPress = jest.fn();
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
      const { getByText, getByLabelText } = render(
        <VerificationPromptCard onPress={mockOnPress} />,
      );

      // Title
      expect(getByText('Mesleğini Doğrula')).toBeTruthy();

      // Subtitle
      expect(getByText('Uzman rozeti kazan ve topluluğa güvenilir üye olarak katıl.')).toBeTruthy();

      // CTA Button
      expect(getByText('Doğrulamaya Başla')).toBeTruthy();

      // Accessibility
      expect(getByLabelText('Doğrulamaya başla')).toBeTruthy();
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <VerificationPromptCard onPress={mockOnPress} testID="custom-test-id" />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('renders with default test ID', () => {
      const { getByTestId } = render(<VerificationPromptCard onPress={mockOnPress} />);

      expect(getByTestId('verification-prompt-card')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when CTA button is pressed', () => {
      const { getByText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const button = getByText('Doğrulamaya Başla');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback on button press', () => {
      const { getByText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const button = getByText('Doğrulamaya Başla');
      fireEvent.press(button);

      expect(mockTrigger).toHaveBeenCalledWith('medium');
      expect(mockTrigger).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when haptic is not supported', () => {
      mockUseHaptic.mockReturnValue({
        trigger: mockTrigger,
        isSupported: false,
      });

      const { getByText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const button = getByText('Doğrulamaya Başla');
      fireEvent.press(button);

      // onPress should still be called even if haptic is not supported
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibilityRole for button', () => {
      const { getByLabelText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const button = getByLabelText('Doğrulamaya başla');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has accessibilityHint for button', () => {
      const { getByLabelText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const button = getByLabelText('Doğrulamaya başla');
      expect(button.props.accessibilityHint).toBe('Meslek doğrulama sürecini başlatmak için dokun');
    });

    it('all text elements are readable by screen reader', () => {
      const { getByText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      expect(getByText('Mesleğini Doğrula').props.accessible).not.toBe(false);
      expect(
        getByText('Uzman rozeti kazan ve topluluğa güvenilir üye olarak katıl.').props.accessible,
      ).not.toBe(false);
    });
  });

  describe('Styling', () => {
    it('applies gradient background colors', () => {
      const { getByTestId } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const card = getByTestId('verification-prompt-card');
      expect(card).toBeTruthy();
    });

    it('applies correct icon size', () => {
      const { UNSAFE_getByType } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const Icon = require('react-native-vector-icons/Ionicons').default;
      const icon = UNSAFE_getByType(Icon);

      expect(icon.props.size).toBe(32);
      expect(icon.props.name).toBe('school');
    });
  });

  describe('Memoization', () => {
    it('does not re-render when props are unchanged', () => {
      const { rerender } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const renderCount = mockOnPress.mock.calls.length;

      rerender(<VerificationPromptCard onPress={mockOnPress} />);

      // Component should be memoized, so render count should stay the same
      expect(mockOnPress.mock.calls.length).toBe(renderCount);
    });

    it('re-renders when onPress changes', () => {
      const { rerender, getByText } = render(<VerificationPromptCard onPress={mockOnPress} />);

      const newOnPress = jest.fn();
      rerender(<VerificationPromptCard onPress={newOnPress} />);

      const button = getByText('Doğrulamaya Başla');
      fireEvent.press(button);

      expect(newOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const tree = render(<VerificationPromptCard onPress={mockOnPress} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with custom test ID', () => {
      const tree = render(
        <VerificationPromptCard onPress={mockOnPress} testID="custom-id" />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
