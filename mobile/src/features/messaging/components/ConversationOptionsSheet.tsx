// src/features/messaging/components/ConversationOptionsSheet.tsx
// Konuşma seçenekleri alt sayfası - Web compatible
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import type { ConversationSummary } from '../types';

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
    console.log('[ConversationOptionsSheet] BottomSheet not available');
  }
}

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
    const { theme } = useTheme();
    const color = destructive ? theme.colors.status.error : theme.colors.text.primary;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.optionItem,
          pressed && { backgroundColor: theme.colors.background.secondary },
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
  const { theme } = useTheme();
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

  const renderBackdrop = useCallback(
    (props: any) =>
      BottomSheetBackdrop ? (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ) : null,
    [],
  );

  const renderContent = () => (
    <>
      {/* Header */}
      {conversation && (
        <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.text.primary }]}
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

        <OptionItem icon="trash-outline" label="Konuşmayı Sil" onPress={handleDelete} destructive />

        <OptionItem icon="ban" label="Engelle" onPress={handleBlock} destructive />
      </View>
    </>
  );

  // Web: Modal kullan
  if (Platform.OS === 'web') {
    return (
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
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
      snapPoints={['35%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background.primary }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}>
      <BottomSheetView style={styles.content}>{renderContent()}</BottomSheetView>
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

export default ConversationOptionsSheet;
