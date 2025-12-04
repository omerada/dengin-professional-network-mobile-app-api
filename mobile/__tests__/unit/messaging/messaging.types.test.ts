// __tests__/unit/messaging/messaging.types.test.ts
// Unit tests for messaging type definitions
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import type {
  MessageStatus,
  ClientMessageStatus,
  Participant,
  MessageAttachment,
  LastMessage,
  Conversation,
  Message,
  ConversationListResponse,
  MessageListResponse,
  SendMessageRequest,
  WsMessageResponse,
  WsSendMessageRequest,
  WsTypingNotification,
  WsReadReceipt,
  UserSummary,
} from '@features/messaging/types';

describe('Messaging Types', () => {
  describe('MessageStatus', () => {
    it('should accept valid status values', () => {
      const sent: MessageStatus = 'SENT';
      const delivered: MessageStatus = 'DELIVERED';
      const read: MessageStatus = 'READ';

      expect(sent).toBe('SENT');
      expect(delivered).toBe('DELIVERED');
      expect(read).toBe('READ');
    });
  });

  describe('ClientMessageStatus', () => {
    it('should extend MessageStatus with SENDING and FAILED', () => {
      const sending: ClientMessageStatus = 'SENDING';
      const failed: ClientMessageStatus = 'FAILED';
      const sent: ClientMessageStatus = 'SENT';

      expect(sending).toBe('SENDING');
      expect(failed).toBe('FAILED');
      expect(sent).toBe('SENT');
    });
  });

  describe('Participant', () => {
    it('should have required fields', () => {
      const participant: Participant = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        fullName: 'Test User',
        profession: 'Developer',
        profileImageUrl: null,
        verified: true,
        online: false,
        lastSeenAt: null,
      };

      expect(participant.userId).toBeDefined();
      expect(participant.fullName).toBeDefined();
      expect(participant.profession).toBeDefined();
      expect(participant.verified).toBeDefined();
      expect(participant.online).toBeDefined();
    });

    it('should allow nullable profileImageUrl and lastSeenAt', () => {
      const participant: Participant = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        fullName: 'Test User',
        profession: 'Developer',
        profileImageUrl: 'https://example.com/avatar.jpg',
        verified: true,
        online: true,
        lastSeenAt: '2024-01-01T12:00:00Z',
      };

      expect(participant.profileImageUrl).toBe('https://example.com/avatar.jpg');
      expect(participant.lastSeenAt).toBe('2024-01-01T12:00:00Z');
    });
  });

  describe('MessageAttachment', () => {
    it('should have required fields', () => {
      const attachment: MessageAttachment = {
        url: 'https://cdn.example.com/file.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        fileName: 'document.pdf',
      };

      expect(attachment.url).toBeDefined();
      expect(attachment.contentType).toBeDefined();
      expect(attachment.fileSize).toBeGreaterThan(0);
      expect(attachment.fileName).toBeDefined();
    });
  });

  describe('LastMessage', () => {
    it('should have required fields', () => {
      const lastMessage: LastMessage = {
        content: 'Hello!',
        hasAttachment: false,
        sentByMe: true,
        read: true,
        sentAt: '2024-01-01T12:00:00Z',
      };

      expect(lastMessage.content).toBeDefined();
      expect(lastMessage.hasAttachment).toBe(false);
      expect(lastMessage.sentByMe).toBe(true);
      expect(lastMessage.read).toBe(true);
      expect(lastMessage.sentAt).toBeDefined();
    });
  });

  describe('Conversation', () => {
    it('should have required fields', () => {
      const conversation: Conversation = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        participant: {
          userId: '123e4567-e89b-12d3-a456-426614174001',
          fullName: 'Test User',
          profession: 'Developer',
          profileImageUrl: null,
          verified: true,
          online: false,
          lastSeenAt: null,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: '2024-01-01T12:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
      };

      expect(conversation.conversationId).toBeDefined();
      expect(conversation.participant).toBeDefined();
      expect(conversation.unreadCount).toBe(0);
    });

    it('should allow null lastMessage', () => {
      const conversation: Conversation = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        participant: {
          userId: '123e4567-e89b-12d3-a456-426614174001',
          fullName: 'Test User',
          profession: 'Developer',
          profileImageUrl: null,
          verified: true,
          online: false,
          lastSeenAt: null,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: '2024-01-01T12:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
      };

      expect(conversation.lastMessage).toBeNull();
    });
  });

  describe('Message', () => {
    it('should have required fields', () => {
      const message: Message = {
        messageId: '123e4567-e89b-12d3-a456-426614174002',
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        senderId: '123e4567-e89b-12d3-a456-426614174001',
        senderName: 'Test User',
        content: 'Hello World',
        attachments: [],
        status: 'SENT',
        createdAt: '2024-01-01T12:00:00Z',
      };

      expect(message.messageId).toBeDefined();
      expect(message.conversationId).toBeDefined();
      expect(message.senderId).toBeDefined();
      expect(message.senderName).toBeDefined();
      expect(message.content).toBeDefined();
      expect(message.attachments).toBeDefined();
      expect(message.status).toBe('SENT');
      expect(message.createdAt).toBeDefined();
    });

    it('should support attachments array', () => {
      const message: Message = {
        messageId: '123e4567-e89b-12d3-a456-426614174002',
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        senderId: '123e4567-e89b-12d3-a456-426614174001',
        senderName: 'Test User',
        content: 'Check this file',
        attachments: [
          {
            url: 'https://cdn.example.com/file.pdf',
            contentType: 'application/pdf',
            fileSize: 1024,
            fileName: 'document.pdf',
          },
        ],
        status: 'DELIVERED',
        createdAt: '2024-01-01T12:00:00Z',
      };

      expect(message.attachments).toHaveLength(1);
      expect(message.attachments[0].fileName).toBe('document.pdf');
    });
  });

  describe('ConversationListResponse', () => {
    it('should match page-based pagination structure', () => {
      const response: ConversationListResponse = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };

      expect(response.content).toBeDefined();
      expect(response.page).toBe(0);
      expect(response.size).toBe(20);
      expect(response.totalElements).toBe(0);
      expect(response.totalPages).toBe(0);
      expect(response.hasMore).toBe(false);
    });
  });

  describe('MessageListResponse', () => {
    it('should match page-based pagination structure', () => {
      const response: MessageListResponse = {
        content: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };

      expect(response.content).toBeDefined();
      expect(response.page).toBe(0);
      expect(response.size).toBe(50);
      expect(response.hasMore).toBe(false);
    });
  });

  describe('SendMessageRequest', () => {
    it('should have required fields', () => {
      const request: SendMessageRequest = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Hello',
        recipientId: '123e4567-e89b-12d3-a456-426614174001',
      };

      expect(request.conversationId).toBeDefined();
      expect(request.content).toBeDefined();
      expect(request.recipientId).toBeDefined();
    });

    it('should allow optional attachmentKey', () => {
      const request: SendMessageRequest = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Check this file',
        recipientId: '123e4567-e89b-12d3-a456-426614174001',
        attachmentKey: 'uploads/123/file.pdf',
      };

      expect(request.attachmentKey).toBe('uploads/123/file.pdf');
    });
  });

  describe('WebSocket DTOs', () => {
    describe('WsMessageResponse', () => {
      it('should match WebSocket message structure', () => {
        const wsMessage: WsMessageResponse = {
          messageId: '123e4567-e89b-12d3-a456-426614174002',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          senderId: '123e4567-e89b-12d3-a456-426614174001',
          senderName: 'Test User',
          content: 'Hello',
          attachments: [],
          status: 'SENT',
          createdAt: '2024-01-01T12:00:00Z',
        };

        expect(wsMessage.messageId).toBeDefined();
        expect(wsMessage.conversationId).toBeDefined();
        expect(wsMessage.senderId).toBeDefined();
      });
    });

    describe('WsSendMessageRequest', () => {
      it('should match WebSocket send message structure', () => {
        const request: WsSendMessageRequest = {
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          recipientId: '123e4567-e89b-12d3-a456-426614174001',
          content: 'Hello',
        };

        expect(request.conversationId).toBeDefined();
        expect(request.recipientId).toBeDefined();
        expect(request.content).toBeDefined();
      });
    });

    describe('WsTypingNotification', () => {
      it('should match typing notification structure', () => {
        const typing: WsTypingNotification = {
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          userName: 'Test User',
          typing: true,
        };

        expect(typing.conversationId).toBeDefined();
        expect(typing.userId).toBeDefined();
        expect(typing.userName).toBeDefined();
        expect(typing.typing).toBe(true);
      });
    });

    describe('WsReadReceipt', () => {
      it('should match read receipt structure', () => {
        const receipt: WsReadReceipt = {
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          readByUserId: '123e4567-e89b-12d3-a456-426614174001',
          lastReadMessageId: '123e4567-e89b-12d3-a456-426614174002',
          messagesRead: 5,
          readAt: '2024-01-01T12:00:00Z',
        };

        expect(receipt.conversationId).toBeDefined();
        expect(receipt.readByUserId).toBeDefined();
        expect(receipt.lastReadMessageId).toBeDefined();
        expect(receipt.messagesRead).toBe(5);
        expect(receipt.readAt).toBeDefined();
      });
    });
  });

  describe('UserSummary', () => {
    it('should have required fields for conversation creation', () => {
      const user: UserSummary = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        displayName: 'Test User',
        avatarUrl: null,
      };

      expect(user.id).toBeDefined();
      expect(user.displayName).toBeDefined();
      expect(user.avatarUrl).toBeNull();
    });

    it('should allow optional profession and verified', () => {
      const user: UserSummary = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        profession: 'Developer',
        verified: true,
      };

      expect(user.profession).toBe('Developer');
      expect(user.verified).toBe(true);
    });
  });
});
