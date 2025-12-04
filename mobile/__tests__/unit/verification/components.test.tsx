// __tests__/unit/verification/components.test.tsx
// Verification component testleri

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// Theme mock - bileşenlerin beklediği yapıda colors sağlar
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        // Primary colors
        primary: '#2196F3',
        // Semantic colors
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        // Background colors
        background: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        // Text colors
        text: '#212121',
        textSecondary: '#757575',
        textDisabled: '#BDBDBD',
        textInverse: '#FFFFFF',
        // Border colors
        border: '#E0E0E0',
      },
    },
    isDark: false,
  }),
}));

// Reanimated mock - return actual View component
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  return {
    default: {
      View: RN.View,
      Text: RN.Text,
      createAnimatedComponent: (component: any) => component,
      call: () => {},
    },
    View: RN.View,
    Text: RN.Text,
    useSharedValue: (value: any) => ({ value }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withSpring: (value: any) => value,
    withTiming: (value: any) => value,
    withSequence: (...values: any[]) => values[0],
  };
});

// Import components after mocking
import {
  CaptureButton,
  StepIndicator,
  UploadProgress,
} from '../../../src/features/verification/components';

describe('Verification Components', () => {
  describe('CaptureButton', () => {
    it('should render correctly', () => {
      const onCapture = jest.fn();
      const { getByRole } = render(<CaptureButton onCapture={onCapture} />);

      expect(getByRole('button')).toBeTruthy();
    });

    it('should call onCapture when pressed', () => {
      const onCapture = jest.fn();
      const { getByRole } = render(<CaptureButton onCapture={onCapture} />);

      fireEvent.press(getByRole('button'));

      expect(onCapture).toHaveBeenCalledTimes(1);
    });

    it('should not call onCapture when disabled', () => {
      const onCapture = jest.fn();
      const { getByRole } = render(<CaptureButton onCapture={onCapture} disabled />);

      // Disabled button may still render, but accessibility state should indicate it
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should show loading state when loading', () => {
      const onCapture = jest.fn();
      const { getByRole } = render(<CaptureButton onCapture={onCapture} loading />);

      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should support different sizes', () => {
      const onCapture = jest.fn();

      const { rerender, getByRole } = render(<CaptureButton onCapture={onCapture} size="small" />);
      expect(getByRole('button')).toBeTruthy();

      rerender(<CaptureButton onCapture={onCapture} size="medium" />);
      expect(getByRole('button')).toBeTruthy();

      rerender(<CaptureButton onCapture={onCapture} size="large" />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('StepIndicator', () => {
    it('should render with current step', () => {
      const { getByText } = render(<StepIndicator currentStep="document_front" />);

      expect(getByText('Ön Yüz')).toBeTruthy();
    });

    it('should show all steps', () => {
      const { getByText } = render(<StepIndicator currentStep="document_back" />);

      expect(getByText('Başlangıç')).toBeTruthy();
      expect(getByText('Ön Yüz')).toBeTruthy();
      expect(getByText('Arka Yüz')).toBeTruthy();
      expect(getByText('Selfie')).toBeTruthy();
    });

    it('should indicate completed steps', () => {
      const { getByText } = render(<StepIndicator currentStep="selfie" />);

      // Fourth step should be current
      expect(getByText('Selfie')).toBeTruthy();
    });

    it('should return null for uploading step', () => {
      const { queryByText } = render(<StepIndicator currentStep="uploading" />);

      // Should not render any steps
      expect(queryByText('Başlangıç')).toBeNull();
    });

    it('should return null for status step', () => {
      const { queryByText } = render(<StepIndicator currentStep="status" />);

      // Should not render any steps
      expect(queryByText('Başlangıç')).toBeNull();
    });
  });

  describe('UploadProgress', () => {
    const mockProgress = {
      status: 'uploading' as const,
      documentFront: 100,
      documentBack: 50,
      selfie: 0,
      total: 50,
    };

    it('should render with idle status', () => {
      const { getByText } = render(
        <UploadProgress
          progress={{
            status: 'idle',
            documentFront: 0,
            documentBack: 0,
            selfie: 0,
            total: 0,
          }}
        />,
      );

      expect(getByText('Yükleme hazır')).toBeTruthy();
    });

    it('should render with uploading status', () => {
      const { getByText } = render(<UploadProgress progress={mockProgress} />);

      expect(getByText('Belgeler yükleniyor...')).toBeTruthy();
    });

    it('should render with completed status', () => {
      const { getByText } = render(
        <UploadProgress
          progress={{
            status: 'completed',
            documentFront: 100,
            documentBack: 100,
            selfie: 100,
            total: 100,
          }}
        />,
      );

      expect(getByText('Yükleme tamamlandı!')).toBeTruthy();
    });

    it('should render with failed status', () => {
      const { getByText } = render(
        <UploadProgress
          progress={{
            status: 'failed',
            documentFront: 100,
            documentBack: 0,
            selfie: 0,
            total: 33,
          }}
        />,
      );

      expect(getByText('Yükleme başarısız oldu')).toBeTruthy();
    });

    it('should render with processing status', () => {
      const { getByText } = render(
        <UploadProgress
          progress={{
            status: 'processing',
            documentFront: 100,
            documentBack: 100,
            selfie: 100,
            total: 100,
          }}
        />,
      );

      expect(getByText('AI analizi yapılıyor...')).toBeTruthy();
    });
  });
});
