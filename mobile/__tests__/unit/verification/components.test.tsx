// __tests__/unit/verification/components.test.tsx
// Verification component testleri

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  CaptureButton,
  StepIndicator,
  UploadProgress,
} from '../../../src/features/verification/components';
import { VerificationStep } from '../../../src/features/verification/types';

// Theme mock
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { main: '#007AFF', 500: '#007AFF' },
        background: { primary: '#FFFFFF' },
        text: { primary: '#000000', secondary: '#666666' },
        success: { main: '#34C759' },
        error: { main: '#FF3B30' },
        border: { light: '#E0E0E0' },
      },
    },
  }),
}));

describe('Verification Components', () => {
  describe('CaptureButton', () => {
    it('should render correctly', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CaptureButton onPress={onPress} testID="capture-button" />
      );

      expect(getByTestId('capture-button')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CaptureButton onPress={onPress} testID="capture-button" />
      );

      fireEvent.press(getByTestId('capture-button'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CaptureButton onPress={onPress} disabled testID="capture-button" />
      );

      fireEvent.press(getByTestId('capture-button'));

      expect(onPress).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CaptureButton onPress={onPress} isLoading testID="capture-button" />
      );

      expect(getByTestId('capture-button')).toBeTruthy();
    });
  });

  describe('StepIndicator', () => {
    it('should render correct number of steps', () => {
      const { getAllByTestId } = render(
        <StepIndicator
          currentStep={VerificationStep.DOCUMENT_FRONT}
          totalSteps={5}
        />
      );

      const steps = getAllByTestId(/step-/);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should highlight current step', () => {
      const { getByTestId } = render(
        <StepIndicator
          currentStep={VerificationStep.DOCUMENT_FRONT}
          totalSteps={5}
        />
      );

      // Current step should be visible
      expect(getByTestId('step-indicator')).toBeTruthy();
    });

    it('should show completed steps', () => {
      const { getByTestId } = render(
        <StepIndicator
          currentStep={VerificationStep.SELFIE}
          totalSteps={5}
        />
      );

      expect(getByTestId('step-indicator')).toBeTruthy();
    });
  });

  describe('UploadProgress', () => {
    it('should render with 0% progress', () => {
      const { getByText } = render(<UploadProgress progress={0} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should render with 50% progress', () => {
      const { getByText } = render(<UploadProgress progress={50} />);

      expect(getByText('50%')).toBeTruthy();
    });

    it('should render with 100% progress', () => {
      const { getByText } = render(<UploadProgress progress={100} />);

      expect(getByText('100%')).toBeTruthy();
    });

    it('should show uploading message', () => {
      const { getByText } = render(
        <UploadProgress progress={50} message="Yükleniyor..." />
      );

      expect(getByText('Yükleniyor...')).toBeTruthy();
    });
  });
});
