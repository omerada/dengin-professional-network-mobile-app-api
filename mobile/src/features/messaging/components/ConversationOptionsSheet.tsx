// src/features/messaging/components/ConversationOptionsSheet.tsx
// Konuşma seçenekleri alt sayfası - Clean Modal Solution
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
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

export const ConversationOptionsSheet = forwardRef<
  ConversationOptionsSheetRef,
  ConversationOptionsSheetProps
>(({ conversation, onPin, onMute, onDelete, onBlock }, ref) => {
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

  const handlePin = useCallback(() => {
    if (conversation) {
      onPin?.(conversation);
      handleClose();
    }
  }, [conversation, onPin, handleClose]);

  const handleMute = useCallback(() => {
    if (conversation) {
      onMute?.(conversation);
      handleClose();
    }
  }, [conversation, onMute, handleClose]);

  const handleDelete = useCallback(() => {
    if (conversation) {
      onDelete?.(conversation);
      handleClose();
    }
  }, [conversation, onDelete, handleClose]);

  const handleBlock = useCallback(() => {
    if (conversation) {
      onBlock?.(conversation);
      handleClose();
    }
  }, [conversation, onBlock, handleClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
          {/* Handle indicator */}
          <View style={[styles.handleIndicator, { backgroundColor: colors.text.tertiary }]} />

          <View style={styles.content}>
            {/* Header */}
            {conversation && (
              <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                <Text
                  style={[styles.headerTitle, { color: colors.text.primary }]}
                  numberOfLines={1}>
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

              <OptionItem icon="ban" label="Engelle" onPress={handleBlock} destructive />
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

ConversationOptionsSheet.displayName = 'ConversationOptionsSheet';

const MODAL_OVERLAY_BG = 'rgba(0, 0, 0, 0.5)';

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
  },
  handleIndicator: {
    alignSelf: 'center',
    borderRadius: 2,
    height: 4,
    marginTop: 8,
    marginBottom: 16,
    width: 40,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_BG,
    flex: 1,
    justifyContent: 'flex-end',
  },
  optionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 16,
  },
  options: {
    paddingTop: 8,
  },
});

export default ConversationOptionsSheet;
