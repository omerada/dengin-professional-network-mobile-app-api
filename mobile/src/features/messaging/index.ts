// src/features/messaging/index.ts
// Messaging module barrel export
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

// Types
export * from './types';

// Services
export { socketClient } from './services/socketClient';
export { messagingService } from './services/messagingService';
export { messageQueue } from './services/messageQueue';

// Stores
export { useMessagingStore } from './stores';

// Hooks
export {
  useConversations,
  useMessages,
  useSendMessage,
  useTyping,
  useSocket,
  useMarkAsRead,
  useStartConversation,
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
