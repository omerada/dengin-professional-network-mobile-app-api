// __tests__/unit/feed/ProfessionIcon.test.tsx
// Dengin Design System - ProfessionIcon Component Tests
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 692-780

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ProfessionIcon } from '../../../src/features/feed/components/FeedHeader/ProfessionIcon';
import type { ProfessionCategory } from '../../../src/features/feed/components/FeedHeader/professionConfig';

// Mock dependencies
jest.mock('@shared/hooks/useHaptic', () => ({
  useHaptic: () => ({
    trigger: jest.fn(),
  }),
}));

describe('ProfessionIcon', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with MEDICAL category', () => {
      const { getByTestId } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" testID="test-icon" />,
      );

      const icon = getByTestId('test-icon');
      expect(icon).toBeTruthy();
    });

    it('renders correctly with LEGAL category', () => {
      const { getByTestId } = render(
        <ProfessionIcon category="LEGAL" name="Avukat" testID="test-icon" />,
      );

      expect(getByTestId('test-icon')).toBeTruthy();
    });

    it('renders correctly with ENGINEERING category', () => {
      const { getByTestId } = render(
        <ProfessionIcon category="ENGINEERING" name="Mühendis" testID="test-icon" />,
      );

      expect(getByTestId('test-icon')).toBeTruthy();
    });

    it('renders correctly with EDUCATION category', () => {
      const { getByTestId } = render(
        <ProfessionIcon category="EDUCATION" name="Öğretmen" testID="test-icon" />,
      );

      expect(getByTestId('test-icon')).toBeTruthy();
    });

    it('renders correctly with no category (defaults to OTHER)', () => {
      const { getByTestId } = render(<ProfessionIcon testID="test-icon" />);

      expect(getByTestId('test-icon')).toBeTruthy();
    });

    it('renders static icon when no onPress callback', () => {
      const { getByTestId, queryByRole } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" testID="test-icon" />,
      );

      expect(getByTestId('test-icon')).toBeTruthy();
      // Should not be a button
      expect(queryByRole('button')).toBeNull();
    });

    it('renders pressable icon when onPress callback provided', () => {
      const { getByRole } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onPress when icon is pressed', () => {
      const { getByRole } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      );

      fireEvent.press(getByRole('button'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when icon is static', () => {
      const { getByTestId } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" testID="test-icon" />,
      );

      fireEvent.press(getByTestId('test-icon'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('can be pressed multiple times', () => {
      const { getByRole } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label with profession name', () => {
      const { getByLabelText } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" testID="test-icon" />,
      );

      expect(getByLabelText('Doktor meslek simgesi')).toBeTruthy();
    });

    it('has default accessibility label when no profession name', () => {
      const { getByLabelText } = render(<ProfessionIcon category="MEDICAL" testID="test-icon" />);

      expect(getByLabelText('Meslek simgesi')).toBeTruthy();
    });

    it('has correct accessibility role for button', () => {
      const { getByRole } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('has descriptive accessibility label for button', () => {
      const { getByLabelText } = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      );

      expect(getByLabelText('Doktor detaylarını gör')).toBeTruthy();
    });
  });

  describe('Profession Categories', () => {
    const categories: Array<{ category: ProfessionCategory; name: string }> = [
      { category: 'MEDICAL', name: 'Doktor' },
      { category: 'LEGAL', name: 'Avukat' },
      { category: 'ENGINEERING', name: 'Mühendis' },
      { category: 'EDUCATION', name: 'Öğretmen' },
      { category: 'SERVICE', name: 'Hizmet' },
      { category: 'CREATIVE', name: 'Tasarımcı' },
      { category: 'BUSINESS', name: 'İş İnsanı' },
      { category: 'OTHER', name: 'Diğer' },
    ];

    it.each(categories)('renders $category category correctly', ({ category, name }) => {
      const { getByTestId } = render(
        <ProfessionIcon category={category} name={name} testID="test-icon" />,
      );

      expect(getByTestId('test-icon')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot for static icon', () => {
      const tree = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" testID="test-icon" />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot for pressable icon', () => {
      const tree = render(
        <ProfessionIcon category="MEDICAL" name="Doktor" onPress={mockOnPress} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
