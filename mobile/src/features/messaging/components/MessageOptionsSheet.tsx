// src/features/messaging/components/MessageOptionsSheet.tsx
// Mesaj seçenekleri alt sayfası - Web compatible
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useColors } from '@contexts/ThemeContext';
import type { Message } from '../types';

// BottomSheet'i sadece native platformlarda yükle
let BottomSheet: any = null;
let BottomSheetBackdrop: any = null;
let BottomSheetView: any = null;

if (Platform.OS !== 'web') {
  try {
    const bottomSheetModule = require('@gorhom/bottom-sheet');
    BottomSheet = bottomSheetModule.default;
    BottomSheetBackdrop = bottomSheetModule.BottomSheetBackdrop;
    BottomSheetView = bottomSheetModule.BottomSheetView;
  } catch (e) {
    console.log('[MessageOptionsSheet] BottomSheet not available');
  }
}

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
    const bottomSheetRef = useRef<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        if (Platform.OS === 'web') {
          setIsVisible(true);
        } else {
          bottomSheetRef.current?.expand();
        }
      },
      close: () => {
        if (Platform.OS === 'web') {
          setIsVisible(false);
        } else {
          bottomSheetRef.current?.close();
        }
      },
    }));

    const handleClose = useCallback(() => {
      if (Platform.OS === 'web') {
        setIsVisible(false);
      } else {
        bottomSheetRef.current?.close();
      }
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

    const renderBackdrop = useCallback(
      (props: any) =>
        BottomSheetBackdrop ? (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        ) : null,
      [],
    );

    const renderContent = () => (
      <>
        {/* Message preview */}
        {message && (
          <View style={[styles.preview, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.previewText, { color: colors.text.secondary }]} numberOfLines={2}>
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
      </>
    );

    // Web: Modal kullan
    if (Platform.OS === 'web') {
      return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
            <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
              {renderContent()}
            </View>
          </Pressable>
        </Modal>
      );
    }

    // Native: BottomSheet kullan
    if (!BottomSheet || !BottomSheetView) {
      return null;
    }

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['30%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background.primary }}
        handleIndicatorStyle={{ backgroundColor: colors.text.secondary }}>
        <BottomSheetView style={styles.content}>{renderContent()}</BottomSheetView>
      </BottomSheet>
    );
  },
);

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

export default MessageOptionsSheet;
