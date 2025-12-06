// src/features/feed/components/ImagePreviewGrid.tsx
// Görsel önizleme grid komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useCallback } from 'react';
import { View, Image, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import type { LocalImage } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48 - 16) / 3;

interface ImagePreviewGridProps {
  images: LocalImage[];
  onRemove: (index: number) => void;
  onAdd: () => void;
  maxImages?: number;
}

export const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = memo(
  ({ images, onRemove, onAdd, maxImages = 5 }) => {
    const colors = useColors();

    const canAddMore = images.length < maxImages;

    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <Pressable
                style={[styles.removeButton, { backgroundColor: colors.text.primary }]}
                onPress={() => onRemove(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}

          {canAddMore && (
            <Pressable
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
              onPress={onAdd}>
              <Icon name="add" size={28} color={colors.text.secondary} />
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  },
);

ImagePreviewGrid.displayName = 'ImagePreviewGrid';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  imageWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImagePreviewGrid;
