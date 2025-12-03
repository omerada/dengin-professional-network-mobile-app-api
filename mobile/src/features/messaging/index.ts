// src/features/messaging/index.ts
// Messaging module barrel export
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

// Types
export * from './types';

// Core Socket (STOMP WebSocket)
export {
  stompClient,
  messageQueue,
  connectionMonitor,
  SocketStatus,
} from '@core/socket';

// Services
export { messagingService } from './services/messagingService';

// Stores
export { useMessagingStore } from './stores';

// Hooks
export {
  useConversations,
  useConversation,
  useMessages,
  useSendMessage,
  useTyping,
  useSocket,
  useMarkAsRead,
  useStartConversation,
  useTotalUnreadCount,
  useUnreadCount,
} from './hooks';

// Components
export {
  MessageBubble,
  MessageInput,
  MessageList,
  TypingIndicator,
  ConversationItem,
  ChatHeader,
  EmptyChat,
  EmptyConversations,
  ConversationOptionsSheet,
  MessageOptionsSheet,
} from './components';

// Screens
export {
  ConversationListScreen,
  ChatScreen,
  NewConversationScreen,
} from './screens';
