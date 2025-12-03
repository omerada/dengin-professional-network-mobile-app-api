// src/features/messaging/components/ConversationOptionsSheet.tsx
// Konuşma seçenekleri alt sayfası
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@contexts/ThemeContext';
import type { ConversationSummary } from '../types';

interface ConversationOptionsSheetProps {
  conversation: ConversationSummary | null;
  onPin?: (conversation: ConversationSummary) => void;
  onMute?: (conversation: ConversationSummary) => void;
  onDelete?: (conversation: ConversationSummary) => void;
  onBlock?: (conversation: ConversationSummary) => void;
}

export interface ConversationOptionsSheetRef {
  open: () => void;
  close: () => void;
}

interface OptionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

const OptionItem: React.FC<OptionItemProps> = memo(({
  icon,
  label,
  onPress,
  destructive = false,
}) => {
  const { theme } = useTheme();
  const color = destructive ? theme.colors.status.error : theme.colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionItem,
        pressed && { backgroundColor: theme.colors.background.secondary },
      ]}
    >
      <Icon name={icon} size={22} color={color} />
      <Text style={[styles.optionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
});

OptionItem.displayName = 'OptionItem';

export const ConversationOptionsSheet = forwardRef<
  ConversationOptionsSheetRef,
  ConversationOptionsSheetProps
>(({
  conversation,
  onPin,
  onMute,
  onDelete,
  onBlock,
}, ref) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handlePin = useCallback(() => {
    if (conversation) {
      onPin?.(conversation);
      bottomSheetRef.current?.close();
    }
  }, [conversation, onPin]);

  const handleMute = useCallback(() => {
    if (conversation) {
      onMute?.(conversation);
      bottomSheetRef.current?.close();
    }
  }, [conversation, onMute]);

  const handleDelete = useCallback(() => {
    if (conversation) {
      onDelete?.(conversation);
      bottomSheetRef.current?.close();
    }
  }, [conversation, onDelete]);

  const handleBlock = useCallback(() => {
    if (conversation) {
      onBlock?.(conversation);
      bottomSheetRef.current?.close();
    }
  }, [conversation, onBlock]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['35%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background.primary }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        {conversation && (
          <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
            <Text
              style={[styles.headerTitle, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {conversation.name}
            </Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.options}>
          <OptionItem
            icon={conversation?.isPinned ? 'pin-outline' : 'pin'}
            label={conversation?.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
            onPress={handlePin}
          />

          <OptionItem
            icon={conversation?.isMuted ? 'volume-high' : 'volume-mute'}
            label={conversation?.isMuted ? 'Sesi Aç' : 'Sessize Al'}
            onPress={handleMute}
          />

          <OptionItem
            icon="trash-outline"
            label="Konuşmayı Sil"
            onPress={handleDelete}
            destructive
          />

          <OptionItem
            icon="ban"
            label="Engelle"
            onPress={handleBlock}
            destructive
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

ConversationOptionsSheet.displayName = 'ConversationOptionsSheet';

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  options: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  optionLabel: {
    fontSize: 16,
  },
});

export default ConversationOptionsSheet;
