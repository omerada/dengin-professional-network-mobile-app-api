# 💬 Mesajlaşma Deneyimi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Instagram/WhatsApp kalitesinde mesajlaşma UI/UX

---

## 📑 İçindekiler

1. [Mevcut Durum Analizi](#mevcut-durum-analizi)
2. [Hedef Deneyim](#hedef-deneyim)
3. [Chat List Screen](#chat-list-screen)
4. [Chat Screen](#chat-screen)
5. [Message Bubbles](#message-bubbles)
6. [Message Input](#message-input)
7. [Media Messages](#media-messages)
8. [Typing Indicators](#typing-indicators)
9. [Read Receipts](#read-receipts)
10. [Message Actions](#message-actions)

---

## 📊 Mevcut Durum Analizi

### Mevcut ChatScreen.tsx Özellikleri

```
✓ FlatList ile mesaj listesi
✓ WebSocket bağlantısı
✓ Temel mesaj bubble'ları
✓ Input alanı
✗ Animasyonlu mesaj girişi yok
✗ Swipe-to-reply yok
✗ Typing indicator animasyonu yok
✗ Read receipts animasyonu yok
✗ Media picker entegrasyonu zayıf
✗ Message grouping yok
```

### Performans Metrikleri

```
Mevcut:
- Message render: ~15ms
- Scroll FPS: 45-55
- Send latency: 200-300ms

Hedef:
- Message render: <8ms
- Scroll FPS: 60
- Send latency: <100ms (optimistic)
```

---

## 🎯 Hedef Deneyim

### Instagram DM / WhatsApp Özellikleri

```
1. Smooth 60 FPS scroll
2. Animasyonlu mesaj girişi (slide + fade)
3. Swipe-to-reply gesture
4. Long press menu with haptic
5. Typing indicator with bouncing dots
6. Animated read receipts (✓ → ✓✓ → blue ✓✓)
7. Image zoom with gesture
8. Voice message with waveform
9. Reactions (emoji picker)
10. Message grouping by time
```

---

## 📱 Chat List Screen

### ModernChatList Component

```typescript
// src/features/messaging/screens/ChatListScreen.tsx

import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, View, Text, RefreshControl } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import {
  SearchBar,
  SwipeableRow,
  ModernAvatar,
  AnimatedBadge,
} from "@shared/components";
import { formatRelativeTime } from "@utils/date";

interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
    isRead: boolean;
    isSentByMe: boolean;
  };
  unreadCount: number;
}

interface ChatListScreenProps {
  navigation: any;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter chats by search
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter((chat) =>
      chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  // Swipe actions
  const leftActions = useMemo(
    () => [
      {
        id: "archive",
        icon: <ArchiveIcon />,
        backgroundColor: colors.semantic.info,
        onPress: () => {},
      },
    ],
    [colors]
  );

  const rightActions = useMemo(
    () => [
      {
        id: "mute",
        icon: <MuteIcon />,
        backgroundColor: colors.semantic.warning,
        onPress: () => {},
      },
      {
        id: "delete",
        icon: <DeleteIcon />,
        backgroundColor: colors.semantic.error,
        onPress: () => {},
      },
    ],
    [colors]
  );

  // Render chat item
  const renderItem = useCallback(
    ({ item, index }: { item: Chat; index: number }) => (
      <Animated.View
        entering={FadeIn.delay(index * 30).springify()}
        layout={Layout.springify()}
      >
        <SwipeableRow leftActions={leftActions} rightActions={rightActions}>
          <ChatListItem
            chat={item}
            onPress={() => navigation.navigate("Chat", { chatId: item.id })}
          />
        </SwipeableRow>
      </Animated.View>
    ),
    [navigation, leftActions, rightActions]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
    >
      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingTop: insets.top }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Sohbet ara..."
        />
      </View>

      {/* Chat List */}
      <FlashList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={76}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              /* Refresh logic */
            }}
            tintColor={colors.primary.main}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      />

      {/* New Chat FAB */}
      <AnimatedFAB
        icon="create-outline"
        onPress={() => navigation.navigate("NewChat")}
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
      />
    </View>
  );
};

// Chat list item component
interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

const ChatListItem = memo<ChatListItemProps>(({ chat, onPress }) => {
  const { colors } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      style={[styles.chatItem, { backgroundColor: colors.surface.primary }]}
    >
      <View style={styles.avatarContainer}>
        <ModernAvatar
          source={{ uri: chat.participant.avatar }}
          name={chat.participant.name}
          size={56}
          showOnlineStatus
          isOnline={chat.participant.isOnline}
        />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text
            style={[
              styles.chatName,
              { color: colors.text.primary },
              !chat.lastMessage.isRead && styles.unreadName,
            ]}
            numberOfLines={1}
          >
            {chat.participant.name}
          </Text>
          <Text
            style={[
              styles.chatTime,
              {
                color:
                  chat.unreadCount > 0
                    ? colors.primary.main
                    : colors.text.tertiary,
              },
            ]}
          >
            {formatRelativeTime(chat.lastMessage.timestamp)}
          </Text>
        </View>

        <View style={styles.chatPreview}>
          <Text
            style={[
              styles.chatMessage,
              { color: colors.text.secondary },
              !chat.lastMessage.isRead && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage.isSentByMe && "✓ "}
            {chat.lastMessage.text}
          </Text>

          {chat.unreadCount > 0 && (
            <AnimatedBadge count={chat.unreadCount} size="small" />
          )}
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  unreadName: {
    fontWeight: "600",
  },
  chatTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  chatPreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
  },
  unreadMessage: {
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 16,
  },
});
```

---

## 💬 Chat Screen

### ModernChatScreen Component

```typescript
// src/features/messaging/screens/ChatScreen.tsx

import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import {
  ModernAvatar,
  MessageBubble,
  ChatInput,
  TypingIndicator,
} from "@shared/components";
import { useWebSocket } from "@hooks/useWebSocket";
import { useHaptic } from "@hooks/useHaptic";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  status: "sending" | "sent" | "delivered" | "read";
  replyTo?: Message;
  reactions?: { emoji: string; userId: string }[];
}

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  route,
  navigation,
}) => {
  const { chatId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { trigger: triggerHaptic } = useHaptic();

  const flashListRef = useRef<FlashList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const scrollY = useSharedValue(0);

  // WebSocket connection
  const { sendMessage, isConnected } = useWebSocket({
    url: `wss://api.meslektas.com/chat/${chatId}`,
    onMessage: (data) => {
      if (data.type === "message") {
        addNewMessage(data.message);
      } else if (data.type === "typing") {
        setOtherUserTyping(data.isTyping);
      } else if (data.type === "read") {
        updateMessageStatus(data.messageId, "read");
      }
    },
  });

  // Add new message with animation
  const addNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [message, ...prev]);
      triggerHaptic("impactLight");

      // Scroll to bottom
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [triggerHaptic]
  );

  // Send message
  const handleSendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        text,
        timestamp: new Date(),
        senderId: "me",
        status: "sending",
        replyTo: replyingTo || undefined,
      };

      // Optimistic update
      addNewMessage(newMessage);
      setReplyingTo(null);

      // Send via WebSocket
      sendMessage({
        type: "message",
        text,
        replyTo: replyingTo?.id,
      });

      triggerHaptic("impactLight");
    },
    [replyingTo, sendMessage, triggerHaptic, addNewMessage]
  );

  // Handle swipe-to-reply
  const handleReply = useCallback(
    (message: Message) => {
      setReplyingTo(message);
      triggerHaptic("impactMedium");
    },
    [triggerHaptic]
  );

  // Handle long press for menu
  const handleLongPress = useCallback(
    (message: Message) => {
      triggerHaptic("impactHeavy");
      // Show action menu
    },
    [triggerHaptic]
  );

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = message.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  }, [messages]);

  // Render message item
  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMe = item.senderId === "me";
      const showAvatar =
        !isMe &&
        (index === messages.length - 1 ||
          messages[index + 1]?.senderId !== item.senderId);

      return (
        <MessageBubble
          message={item}
          isMe={isMe}
          showAvatar={showAvatar}
          onReply={() => handleReply(item)}
          onLongPress={() => handleLongPress(item)}
          onReactionAdd={(emoji) => {
            /* Add reaction */
          }}
        />
      );
    },
    [messages, handleReply, handleLongPress]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface.secondary }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <ChatHeader
        navigation={navigation}
        isOnline={true}
        isTyping={otherUserTyping}
      />

      {/* Messages */}
      <FlashList
        ref={flashListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        inverted
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 8,
        }}
        ListHeaderComponent={otherUserTyping ? <TypingIndicator /> : null}
      />

      {/* Reply preview */}
      {replyingTo && (
        <ReplyPreview
          message={replyingTo}
          onClose={() => setReplyingTo(null)}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTypingChange={setIsTyping}
        replyingTo={replyingTo}
        style={{ paddingBottom: insets.bottom }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## 💭 Message Bubbles

### MessageBubble Component

```typescript
// src/features/messaging/components/MessageBubble/MessageBubble.tsx

import React, { memo, useCallback, useRef } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  scheduleOnRN,
  interpolate,
  Extrapolate,
  FadeIn,
  SlideInRight,
  SlideInLeft,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { ModernAvatar } from "@shared/components";
import { formatMessageTime } from "@utils/date";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;
const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.75;

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  status: "sending" | "sent" | "delivered" | "read";
  replyTo?: Message;
  reactions?: { emoji: string; userId: string }[];
}

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  onReply: () => void;
  onLongPress: () => void;
  onReactionAdd: (emoji: string) => void;
}

export const MessageBubble = memo<MessageBubbleProps>(
  ({ message, isMe, showAvatar, onReply, onLongPress, onReactionAdd }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const replyIconOpacity = useSharedValue(0);

    // Entry animation
    const enteringAnimation = isMe
      ? SlideInRight.springify().damping(15)
      : SlideInLeft.springify().damping(15);

    // Swipe-to-reply gesture
    const panGesture = Gesture.Pan()
      .activeOffsetX(isMe ? [-15, 0] : [0, 15])
      .failOffsetY([-10, 10])
      .onUpdate((event) => {
        const direction = isMe ? -1 : 1;
        const clampedX = Math.max(
          0,
          Math.min(SWIPE_THRESHOLD, event.translationX * direction)
        );
        translateX.value = clampedX * direction;
        replyIconOpacity.value = interpolate(
          clampedX,
          [0, SWIPE_THRESHOLD],
          [0, 1],
          Extrapolate.CLAMP
        );

        // Haptic at threshold
        if (clampedX >= SWIPE_THRESHOLD - 5 && replyIconOpacity.value < 1) {
          scheduleOnRN(triggerHaptic)("impactMedium");
        }
      })
      .onEnd((event) => {
        const direction = isMe ? -1 : 1;
        const shouldTriggerReply =
          Math.abs(translateX.value) >= SWIPE_THRESHOLD;

        translateX.value = withSpring(0);
        replyIconOpacity.value = withTiming(0);

        if (shouldTriggerReply) {
          scheduleOnRN(onReply)();
        }
      });

    // Long press gesture
    const longPressGesture = Gesture.LongPress()
      .minDuration(500)
      .onStart(() => {
        scale.value = withSequence(withSpring(0.95), withSpring(1));
        scheduleOnRN(triggerHaptic)("impactHeavy");
        scheduleOnRN(onLongPress)();
      });

    const gesture = Gesture.Race(panGesture, longPressGesture);

    // Animated styles
    const bubbleStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }));

    const replyIconStyle = useAnimatedStyle(() => ({
      opacity: replyIconOpacity.value,
      transform: [{ scale: replyIconOpacity.value }],
    }));

    // Status icon
    const StatusIcon = () => {
      if (!isMe) return null;

      const statusIcons = {
        sending: "○",
        sent: "✓",
        delivered: "✓✓",
        read: "✓✓",
      };

      const statusColor =
        message.status === "read" ? colors.primary.main : colors.text.tertiary;

      return (
        <Animated.Text
          style={[styles.status, { color: statusColor }]}
          entering={FadeIn}
        >
          {statusIcons[message.status]}
        </Animated.Text>
      );
    };

    return (
      <View
        style={[
          styles.container,
          isMe ? styles.containerMe : styles.containerOther,
        ]}
      >
        {/* Reply icon */}
        <Animated.View
          style={[
            styles.replyIcon,
            isMe ? styles.replyIconMe : styles.replyIconOther,
            replyIconStyle,
          ]}
        >
          <ReplyIcon size={20} color={colors.text.secondary} />
        </Animated.View>

        {/* Avatar */}
        {!isMe && showAvatar && (
          <ModernAvatar source={{ uri: "" }} size={28} style={styles.avatar} />
        )}

        {/* Bubble */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            entering={enteringAnimation}
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
              {
                backgroundColor: isMe
                  ? colors.primary.main
                  : colors.surface.primary,
                maxWidth: BUBBLE_MAX_WIDTH,
              },
              bubbleStyle,
            ]}
          >
            {/* Reply preview */}
            {message.replyTo && (
              <View
                style={[
                  styles.replyPreview,
                  {
                    borderLeftColor: isMe
                      ? "rgba(255,255,255,0.5)"
                      : colors.primary.main,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.replyText,
                    {
                      color: isMe
                        ? "rgba(255,255,255,0.8)"
                        : colors.text.secondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {message.replyTo.text}
                </Text>
              </View>
            )}

            {/* Message text */}
            <Text
              style={[
                styles.messageText,
                { color: isMe ? "#FFFFFF" : colors.text.primary },
              ]}
            >
              {message.text}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.time,
                  {
                    color: isMe
                      ? "rgba(255,255,255,0.7)"
                      : colors.text.tertiary,
                  },
                ]}
              >
                {formatMessageTime(message.timestamp)}
              </Text>
              <StatusIcon />
            </View>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <View
                style={[
                  styles.reactions,
                  { backgroundColor: colors.surface.secondary },
                ]}
              >
                {message.reactions.map((reaction, index) => (
                  <Text key={index} style={styles.reactionEmoji}>
                    {reaction.emoji}
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  containerMe: {
    justifyContent: "flex-end",
  },
  containerOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  time: {
    fontSize: 11,
  },
  status: {
    fontSize: 12,
    marginLeft: 4,
  },
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 6,
  },
  replyText: {
    fontSize: 13,
  },
  reactions: {
    position: "absolute",
    bottom: -10,
    right: 12,
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 14,
    marginHorizontal: 1,
  },
  replyIcon: {
    position: "absolute",
    bottom: 8,
  },
  replyIconMe: {
    left: 12,
  },
  replyIconOther: {
    right: 12,
  },
});
```

---

## ⌨️ Message Input

### ChatInput Component

```typescript
// src/features/messaging/components/ChatInput/ChatInput.tsx

import React, { memo, useCallback, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  Platform,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
  Layout,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { PressableScale } from "@shared/components";

interface ChatInputProps {
  onSend: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  replyingTo?: any;
  style?: ViewStyle;
}

export const ChatInput = memo<ChatInputProps>(
  ({ onSend, onTypingChange, replyingTo, style }) => {
    const { colors, isDark } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const inputRef = useRef<TextInput>(null);
    const [text, setText] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const inputHeight = useSharedValue(44);
    const sendButtonScale = useSharedValue(0);
    const attachmentOpacity = useSharedValue(1);

    // Handle text change
    const handleTextChange = useCallback(
      (newText: string) => {
        setText(newText);

        // Show/hide send button
        if (newText.length > 0 && text.length === 0) {
          sendButtonScale.value = withSpring(1, {
            damping: 12,
            stiffness: 300,
          });
          attachmentOpacity.value = withTiming(0, { duration: 150 });
        } else if (newText.length === 0 && text.length > 0) {
          sendButtonScale.value = withSpring(0, { damping: 12 });
          attachmentOpacity.value = withTiming(1, { duration: 150 });
        }

        // Notify typing
        onTypingChange?.(newText.length > 0);
      },
      [text, onTypingChange]
    );

    // Handle send
    const handleSend = useCallback(() => {
      if (text.trim().length === 0) return;

      triggerHaptic("impactLight");
      onSend(text.trim());
      setText("");

      // Reset animations
      sendButtonScale.value = withSpring(0);
      attachmentOpacity.value = withTiming(1);
      inputHeight.value = withSpring(44);
    }, [text, onSend, triggerHaptic]);

    // Handle content size change for multiline
    const handleContentSizeChange = useCallback((event: any) => {
      const newHeight = Math.min(
        120,
        Math.max(44, event.nativeEvent.contentSize.height + 20)
      );
      inputHeight.value = withSpring(newHeight);
    }, []);

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
      height: inputHeight.value + 16,
    }));

    const sendButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: sendButtonScale.value }],
      opacity: sendButtonScale.value,
    }));

    const attachmentStyle = useAnimatedStyle(() => ({
      opacity: attachmentOpacity.value,
      transform: [{ scale: attachmentOpacity.value }],
    }));

    // Send button gesture
    const sendGesture = Gesture.Tap()
      .onBegin(() => {
        sendButtonScale.value = withSpring(0.9);
      })
      .onFinalize((_, success) => {
        sendButtonScale.value = withSpring(1);
        if (success) {
          scheduleOnRN(handleSend)();
        }
      });

    return (
      <Animated.View
        style={[styles.container, containerStyle, style]}
        layout={Layout.springify()}
      >
        <BlurView
          intensity={90}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.inputRow, { borderColor: colors.border.light }]}>
          {/* Attachment button */}
          <Animated.View style={attachmentStyle}>
            <PressableScale
              onPress={() => {
                /* Open attachment picker */
              }}
              style={styles.iconButton}
            >
              <AttachIcon size={24} color={colors.text.secondary} />
            </PressableScale>
          </Animated.View>

          {/* Text input */}
          <Animated.View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surface.secondary },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onContentSizeChange={handleContentSizeChange}
              placeholder="Mesaj yaz..."
              placeholderTextColor={colors.text.tertiary}
              style={[styles.input, { color: colors.text.primary }]}
              multiline
              maxLength={1000}
              returnKeyType="default"
              blurOnSubmit={false}
            />

            {/* Emoji button */}
            <PressableScale
              onPress={() => {
                /* Open emoji picker */
              }}
              style={styles.emojiButton}
            >
              <EmojiIcon size={24} color={colors.text.secondary} />
            </PressableScale>
          </Animated.View>

          {/* Send button */}
          <GestureDetector gesture={sendGesture}>
            <Animated.View
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary.main },
                sendButtonStyle,
              ]}
            >
              <SendIcon size={20} color="#FFFFFF" />
            </Animated.View>
          </GestureDetector>

          {/* Voice button (when no text) */}
          <Animated.View style={[styles.voiceButton, attachmentStyle]}>
            <PressableScale
              onPress={() => {
                /* Start voice recording */
              }}
              onLongPress={() => {
                /* Hold to record */
              }}
            >
              <MicIcon size={24} color={colors.primary.main} />
            </PressableScale>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }
);

ChatInput.displayName = "ChatInput";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiButton: {
    marginLeft: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 4,
    bottom: 2,
  },
  voiceButton: {
    position: "absolute",
    right: 4,
    bottom: 2,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## ⏳ Typing Indicators

### TypingIndicator Component

```typescript
// src/features/messaging/components/TypingIndicator/TypingIndicator.tsx

import React, { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useTheme } from "@theme";

export const TypingIndicator = memo(() => {
  const { colors } = useTheme();

  // Create 3 bouncing dots
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    const bounceAnimation = (delay: number) =>
      withRepeat(
        withSequence(
          withDelay(delay, withTiming(-6, { duration: 300 })),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );

    dot1Y.value = bounceAnimation(0);
    dot2Y.value = bounceAnimation(150);
    dot3Y.value = bounceAnimation(300);

    return () => {
      // Cleanup
    };
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
    >
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.text.tertiary },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.text.tertiary },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.text.tertiary },
          dot3Style,
        ]}
      />
    </Animated.View>
  );
});

TypingIndicator.displayName = "TypingIndicator";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    marginLeft: 48, // Avatar space
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});
```

---

## ✅ Acceptance Criteria

### Mesajlaşma Deneyimi İçin

```
□ 60 FPS scroll performance
□ Mesajlar optimistic update ile anında görünür
□ Swipe-to-reply <100ms tepki süresi
□ Typing indicator bouncing animation
□ Read receipts animated transitions
□ Message grouping by sender and time
□ Long press context menu with haptic
□ Voice message waveform visualization
□ Image zoom with pinch gesture
□ Emoji reactions with animation
□ Dark mode fully supported
□ Accessibility labels for screen readers
□ Keyboard avoiding behavior correct
□ Safe area insets handled
```

---

Bu dokümantasyon, Instagram/WhatsApp kalitesinde mesajlaşma deneyimi sağlayacak tüm komponentleri içerir.
