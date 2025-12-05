// __tests__/integration/auth/LoginForm.test.tsx
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, LocaleProvider } from '../../../src/contexts';
import { LoginScreen } from '../../../src/features/auth/screens';
import { authApi } from '../../../src/features/auth/services/authApi';

// Test wrapper with all required providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <NavigationContainer>{children}</NavigationContainer>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      reset: mockReset,
    }),
  };
});

// Mock auth API
jest.mock('../../../src/features/auth/services/authApi', () => ({
  authApi: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock token service
jest.mock('../../../src/features/auth/services/tokenService', () => ({
  tokenService: {
    saveTokens: jest.fn(),
    getAccessToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen Integration', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render email and password inputs', () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  it('should show validation error for invalid email', async () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const emailInput = screen.getByTestId('email-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta/i)).toBeTruthy();
    });
  });

  it('should show validation error for short password', async () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/en az 6 karakter/i)).toBeTruthy();
    });
  });

  it('should call login API with valid credentials', async () => {
    const mockLoginResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
      },
    };

    (authApi.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error alert on login failure', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Geçersiz kimlik bilgileri'));

    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it('should navigate to register screen on sign up link press', () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const registerLink = screen.getByTestId('register-link');
    fireEvent.press(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to forgot password screen on link press', () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const forgotPasswordLink = screen.getByTestId('forgot-password-link');
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should toggle password visibility', () => {
    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('password-toggle');

    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Press toggle
    fireEvent.press(toggleButton);

    // Password should now be visible
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('should show loading state while submitting', async () => {
    // Make login take some time
    (authApi.login as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000)),
    );

    render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Button should show loading state
    await waitFor(() => {
      expect(loginButton.props.accessibilityState?.busy).toBe(true);
    });
  });
});
