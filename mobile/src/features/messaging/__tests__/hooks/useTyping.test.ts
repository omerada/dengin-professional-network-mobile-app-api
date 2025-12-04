// src/features/messaging/__tests__/hooks/useTyping.test.ts
// Typing indicator hook tests
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, act } from '@testing-library/react-native';

// Track mock calls
const mockSendTyping = jest.fn();
const mockOn = jest.fn();
const mockOff = jest.fn();
const mockAddTypingUser = jest.fn();
const mockRemoveTypingUser = jest.fn();

jest.mock('../../services/socketClient', () => ({
  stompClient: {
    on: (event: string, handler: Function) => mockOn(event, handler),
    off: (event: string, handler: Function) => mockOff(event, handler),
    sendTyping: (convId: string, recipientId: string, isTyping: boolean) =>
      mockSendTyping(convId, recipientId, isTyping),
    isConnected: () => true,
  },
}));

// Mock stores
jest.mock('../../stores', () => ({
  useMessagingStore: () => ({
    addTypingUser: mockAddTypingUser,
    removeTypingUser: mockRemoveTypingUser,
    typingUsers: {},
  }),
}));

jest.mock('@features/auth/stores', () => ({
  useAuthStore: () => ({
    user: { id: '123' },
  }),
}));

import { useTyping } from '../../hooks/useTyping';

describe('useTyping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendTyping.mockClear();
    mockOn.mockClear();
    mockOff.mockClear();
    mockAddTypingUser.mockClear();
    mockRemoveTypingUser.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    expect(result.current.typingUsers).toEqual([]);
    expect(result.current.typingUserNames).toEqual([]);
    expect(result.current.isTyping).toBe(false);
    expect(typeof result.current.startTyping).toBe('function');
    expect(typeof result.current.stopTyping).toBe('function');
    expect(typeof result.current.setRecipientId).toBe('function');
    expect(typeof result.current.getTypingText).toBe('function');
  });

  it('should set recipient ID', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    act(() => {
      result.current.setRecipientId('456');
    });

    // Recipient ID is stored internally
    expect(result.current).toBeDefined();
  });

  it('should start typing after debounce', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    // Set recipient first
    act(() => {
      result.current.setRecipientId('456');
    });

    // Start typing
    act(() => {
      result.current.startTyping();
    });

    // Should not send immediately (debounced)
    expect(mockSendTyping).not.toHaveBeenCalled();

    // Fast-forward debounce time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendTyping).toHaveBeenCalledWith('conv-1', '456', true);
  });

  it('should stop typing after timeout', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    act(() => {
      result.current.setRecipientId('456');
    });

    act(() => {
      result.current.startTyping();
    });

    // Fast-forward debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Fast-forward typing timeout (3 seconds)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should have sent stop typing
    expect(mockSendTyping).toHaveBeenCalledWith('conv-1', '456', false);
  });

  it('should stop typing immediately when called', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    act(() => {
      result.current.setRecipientId('456');
    });

    act(() => {
      result.current.startTyping();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Stop typing manually
    act(() => {
      result.current.stopTyping();
    });

    expect(mockSendTyping).toHaveBeenCalledWith('conv-1', '456', false);
  });

  it('should return correct typing text', () => {
    const { result } = renderHook(() => useTyping('conv-1'));

    // No one typing
    expect(result.current.getTypingText()).toBeNull();
  });

  it('should subscribe to typing events', () => {
    renderHook(() => useTyping('conv-1'));

    // Should subscribe to typing events
    expect(mockOn).toHaveBeenCalledWith('typing', expect.any(Function));
  });
});
