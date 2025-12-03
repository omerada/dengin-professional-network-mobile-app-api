// __tests__/unit/shared/Button.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../src/shared/components/Button';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button Component', () => {
  describe('Rendering', () => {
    it('title ile render edilmeli', () => {
      const { getByText } = renderWithTheme(<Button title="Test Button" onPress={() => {}} />);

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('primary variant ile doğru stil uygulanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Primary" onPress={() => {}} variant="primary" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('secondary variant ile doğru stil uygulanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Secondary" onPress={() => {}} variant="secondary" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('outline variant ile doğru stil uygulanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Outline" onPress={() => {}} variant="outline" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('ghost variant ile doğru stil uygulanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Ghost" onPress={() => {}} variant="ghost" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('small size ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Small" onPress={() => {}} size="small" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('medium size ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Medium" onPress={() => {}} size="medium" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('large size ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Large" onPress={() => {}} size="large" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('States', () => {
    it('disabled durumda tıklanamaz olmalı', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button title="Disabled" onPress={onPress} disabled testID="button" />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('loading durumda spinner göstermeli', () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <Button title="Loading" onPress={() => {}} loading testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
      // Title should not be visible when loading
      expect(queryByText('Loading')).toBeNull();
    });

    it('loading durumda tıklanamaz olmalı', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button title="Loading" onPress={onPress} loading testID="button" />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('tıklandığında onPress çağırmalı', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button title="Click Me" onPress={onPress} testID="button" />
      );

      fireEvent.press(getByTestId('button'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('accessibility label olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          title="Accessible Button"
          onPress={() => {}}
          testID="button"
          accessibilityLabel="Custom label"
        />
      );

      const button = getByTestId('button');
      expect(button.props.accessibilityLabel).toBe('Custom label');
    });

    it('disabled durumda accessibility state doğru olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Disabled" onPress={() => {}} disabled testID="button" />
      );

      const button = getByTestId('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Icons', () => {
    it('leftIcon ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="With Icon" onPress={() => {}} leftIcon="arrow-left" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('rightIcon ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="With Icon" onPress={() => {}} rightIcon="arrow-right" testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Full Width', () => {
    it('fullWidth true ise genişlik %100 olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Button title="Full Width" onPress={() => {}} fullWidth testID="button" />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });
});
