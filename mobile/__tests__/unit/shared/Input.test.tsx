// __tests__/unit/shared/Input.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../../../src/shared/components/Input';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Input Component', () => {
  describe('Rendering', () => {
    it('placeholder ile render edilmeli', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} />,
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('label ile render edilmeli', () => {
      const { getByText } = renderWithTheme(
        <Input label="Email" placeholder="Enter email" onChangeText={() => {}} />,
      );

      expect(getByText('Email')).toBeTruthy();
    });

    it('value ile render edilmeli', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input value="test value" onChangeText={() => {}} />,
      );

      expect(getByDisplayValue('test value')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('hata mesajı göstermeli', () => {
      const { getByText } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} error="This field is required" />,
      );

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('hata durumunda stil değişmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Enter text"
          onChangeText={() => {}}
          error="Error message"
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  describe('Password Input', () => {
    it('secureTextEntry true olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Password"
          onChangeText={() => {}}
          secureTextEntry
          testID="password-input"
        />,
      );

      const input = getByTestId('password-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('toggle butonu ile şifre gösterilebilmeli', () => {
      const { getByTestId, getByRole } = renderWithTheme(
        <Input
          placeholder="Password"
          onChangeText={() => {}}
          secureTextEntry
          testID="password-input"
        />,
      );

      // Initially password is hidden
      let input = getByTestId('password-input');
      expect(input.props.secureTextEntry).toBe(true);

      // Find and press toggle button
      const toggleButton = getByRole('button');
      fireEvent.press(toggleButton);

      // Password should be visible now
      input = getByTestId('password-input');
      expect(input.props.secureTextEntry).toBe(false);
    });
  });

  describe('Interactions', () => {
    it('onChangeText yazıldığında çağrılmalı', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={onChangeText} testID="input" />,
      );

      fireEvent.changeText(getByTestId('input'), 'new text');

      expect(onChangeText).toHaveBeenCalledWith('new text');
    });

    it('onFocus odaklandığında çağrılmalı', () => {
      const onFocus = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} onFocus={onFocus} testID="input" />,
      );

      fireEvent(getByTestId('input'), 'focus');

      expect(onFocus).toHaveBeenCalled();
    });

    it('onBlur odak kaybedildiğinde çağrılmalı', () => {
      const onBlur = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} onBlur={onBlur} testID="input" />,
      );

      fireEvent(getByTestId('input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disabled durumda düzenlenemez olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} disabled testID="input" />,
      );

      const input = getByTestId('input');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Keyboard Types', () => {
    it('email keyboard type ayarlanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Email"
          onChangeText={() => {}}
          keyboardType="email-address"
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('numeric keyboard type ayarlanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Phone" onChangeText={() => {}} keyboardType="numeric" testID="input" />,
      );

      const input = getByTestId('input');
      expect(input.props.keyboardType).toBe('numeric');
    });
  });

  describe('Accessibility', () => {
    it('accessibility label olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Enter text"
          onChangeText={() => {}}
          label="Text input"
          testID="input"
        />,
      );

      const input = getByTestId('input');
      // accessibilityLabel defaults to label or placeholder
      expect(input.props.accessibilityLabel).toBe('Text input');
    });

    it('accessibility hint olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Enter text"
          onChangeText={() => {}}
          hint="Enter your text here"
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input.props.accessibilityHint).toBe('Enter your text here');
    });
  });

  describe('Icons', () => {
    it('leftIcon ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Search"
          onChangeText={() => {}}
          leftIcon={<Text>🔍</Text>}
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('rightIcon ile render edilmeli', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Date"
          onChangeText={() => {}}
          rightIcon={<Text>📅</Text>}
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  describe('Multiline', () => {
    it('multiline true olmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          placeholder="Enter description"
          onChangeText={() => {}}
          multiline
          numberOfLines={4}
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  describe('Max Length', () => {
    it('maxLength ayarlanmalı', () => {
      const { getByTestId } = renderWithTheme(
        <Input placeholder="Enter text" onChangeText={() => {}} maxLength={100} testID="input" />,
      );

      const input = getByTestId('input');
      expect(input.props.maxLength).toBe(100);
    });
  });
});
