// src/features/messaging/components/MessageBubble/MessageAttachment.tsx
// Mesaj eki (resim, dosya) bileşeni
// Instagram kalitesinde medya görüntüleme

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { styles } from './MessageBubble.styles';
import type { MessageAttachmentProps } from './MessageBubble.types';

/**
 * Dosya boyutu formatlama
 */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * MessageAttachment - Mesaj eki görüntüleme
 *
 * Özellikler:
 * - Resim önizlemesi (tap to zoom)
 * - Dosya kartı (isim + boyut)
 * - Animated press feedback
 */
export const MessageAttachment: React.FC<MessageAttachmentProps> = memo(
  ({ attachment, isOwn, onImagePress }) => {
    const colors = useColors();
    const scale = useSharedValue(1);

    const { url, contentType, fileName, fileSize } = attachment;
    const isImage = contentType?.startsWith('image/');

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.97, { damping: 15 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, [scale]);

    const handlePress = useCallback(() => {
      if (isImage && onImagePress) {
        onImagePress(url);
      }
    }, [isImage, onImagePress, url]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Dynamic styles based on ownership
    const dynamicStyles = useMemo(
      () =>
        StyleSheet.create({
          fileBackground: {
            backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : colors.background.tertiary,
          },
          fileName: {
            color: isOwn ? colors.text.inverse : colors.text.primary,
          },
          fileSize: {
            color: isOwn ? 'rgba(255,255,255,0.7)' : colors.text.tertiary,
          },
          iconColor: {
            // Placeholder for icon color reference
          },
        }),
      [isOwn, colors],
    );

    const iconColor = isOwn ? colors.text.inverse : colors.text.secondary;
    const downloadIconColor = isOwn ? 'rgba(255,255,255,0.7)' : colors.text.secondary;

    // Resim
    if (isImage) {
      return (
        <Animated.View entering={FadeIn.duration(300)} style={animatedStyle}>
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.imageContainer}>
            <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
          </Pressable>
        </Animated.View>
      );
    }

    // Dosya
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={[styles.fileContainer, dynamicStyles.fileBackground]}>
          <Icon name="document-outline" size={24} color={iconColor} />
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, dynamicStyles.fileName]} numberOfLines={1}>
              {fileName || 'Dosya'}
            </Text>
            {fileSize && (
              <Text style={[styles.fileSize, dynamicStyles.fileSize]}>
                {formatFileSize(fileSize)}
              </Text>
            )}
          </View>
          <Icon name="download-outline" size={20} color={downloadIconColor} />
        </View>
      </Animated.View>
    );
  },
);

MessageAttachment.displayName = 'MessageAttachment';
