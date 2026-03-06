// src/features/messaging/components/MessageOptionsSheet.tsx
// Mesaj seçenekleri alt sayfası - Modern BottomSheet Implementation
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useColors } from '@contexts/ThemeContext';
import { BottomSheet } from '@shared/components';
import { spacing } from '@theme';
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

const OptionItem: React.FC<OptionItemProps> = memo(
  ({ icon, label, onPress, destructive = false }) => {
    const colors = useColors();
    const color = destructive ? colors.status.error : colors.text.primary;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.optionItem,
          pressed && { backgroundColor: colors.background.secondary },
        ]}>
        <Icon name={icon} size={22} color={color} />
        <Text style={[styles.optionLabel, { color }]}>{label}</Text>
      </Pressable>
    );
  },
);

OptionItem.displayName = 'OptionItem';

export const MessageOptionsSheet = forwardRef<MessageOptionsSheetRef, MessageOptionsSheetProps>(
  ({ message, isOwn, onReply, onCopy, onDelete, onReport }, ref) => {
    const colors = useColors();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
      },
      close: () => {
        setVisible(false);
      },
    }));

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    const handleReply = useCallback(() => {
      if (message) {
        onReply?.(message);
        handleClose();
      }
    }, [message, onReply, handleClose]);

    const handleCopy = useCallback(async () => {
      if (message) {
        await Clipboard.setStringAsync(message.content);
        onCopy?.(message);
        handleClose();
      }
    }, [message, onCopy, handleClose]);

    const handleDelete = useCallback(() => {
      if (message) {
        onDelete?.(message);
        handleClose();
      }
    }, [message, onDelete, handleClose]);

    const handleReport = useCallback(() => {
      if (message) {
        onReport?.(message);
        handleClose();
      }
    }, [message, onReport, handleClose]);

    return (
      <BottomSheet visible={visible} onClose={handleClose} height="auto" swipeToDismiss={true}>
        <View style={styles.content}>
          {/* Message preview */}
          {message && (
            <View style={[styles.preview, { backgroundColor: colors.background.secondary }]}>
              <Text
                style={[styles.previewText, { color: colors.text.secondary }]}
                numberOfLines={2}>
                {message.content}
              </Text>
            </View>
          )}

          {/* Options */}
          <View style={styles.options}>
            <OptionItem icon="arrow-undo-outline" label="Yanıtla" onPress={handleReply} />

            <OptionItem icon="copy-outline" label="Kopyala" onPress={handleCopy} />

            {isOwn ? (
              <OptionItem icon="trash-outline" label="Sil" onPress={handleDelete} destructive />
            ) : (
              <OptionItem icon="flag-outline" label="Bildir" onPress={handleReport} destructive />
            )}
          </View>
        </View>
      </BottomSheet>
    );
  },
);

MessageOptionsSheet.displayName = 'MessageOptionsSheet';

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing['4'],
  },
  optionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing['4'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3.5'],
  },
  optionLabel: {
    fontSize: 16,
  },
  options: {
    paddingTop: spacing['2'],
  },
  preview: {
    borderRadius: spacing['2'],
    marginHorizontal: spacing['4'],
    marginVertical: spacing['2'],
    padding: spacing['3'],
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MessageOptionsSheet;
