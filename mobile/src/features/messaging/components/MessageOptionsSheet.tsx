// src/features/messaging/components/MessageOptionsSheet.tsx
// Mesaj seçenekleri alt sayfası
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@contexts/ThemeContext';
import type { Message } from '../types';

interface MessageOptionsSheetProps {
  message: Message | null;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReport?: (message: Message) => void;
}

export interface MessageOptionsSheetRef {
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

export const MessageOptionsSheet = forwardRef<
  MessageOptionsSheetRef,
  MessageOptionsSheetProps
>(({
  message,
  isOwn,
  onReply,
  onCopy,
  onDelete,
  onReport,
}, ref) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleReply = useCallback(() => {
    if (message) {
      onReply?.(message);
      bottomSheetRef.current?.close();
    }
  }, [message, onReply]);

  const handleCopy = useCallback(async () => {
    if (message) {
      await Clipboard.setStringAsync(message.content);
      onCopy?.(message);
      bottomSheetRef.current?.close();
    }
  }, [message, onCopy]);

  const handleDelete = useCallback(() => {
    if (message) {
      onDelete?.(message);
      bottomSheetRef.current?.close();
    }
  }, [message, onDelete]);

  const handleReport = useCallback(() => {
    if (message) {
      onReport?.(message);
      bottomSheetRef.current?.close();
    }
  }, [message, onReport]);

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
      snapPoints={['30%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background.primary }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
    >
      <BottomSheetView style={styles.content}>
        {/* Message preview */}
        {message && (
          <View style={[styles.preview, { backgroundColor: theme.colors.background.secondary }]}>
            <Text
              style={[styles.previewText, { color: theme.colors.text.secondary }]}
              numberOfLines={2}
            >
              {message.content}
            </Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.options}>
          <OptionItem
            icon="arrow-undo-outline"
            label="Yanıtla"
            onPress={handleReply}
          />

          <OptionItem
            icon="copy-outline"
            label="Kopyala"
            onPress={handleCopy}
          />

          {isOwn ? (
            <OptionItem
              icon="trash-outline"
              label="Sil"
              onPress={handleDelete}
              destructive
            />
          ) : (
            <OptionItem
              icon="flag-outline"
              label="Bildir"
              onPress={handleReport}
              destructive
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

MessageOptionsSheet.displayName = 'MessageOptionsSheet';

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  preview: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
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

export default MessageOptionsSheet;
