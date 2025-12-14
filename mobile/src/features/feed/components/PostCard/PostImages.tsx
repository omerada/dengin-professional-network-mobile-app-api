// src/features/feed/components/PostCard/PostImages.tsx
// Dengin Design System - Modern PostImages Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { useHaptic } from '@shared/hooks/useHaptic';

import { imageStyles } from './PostCard.styles';
import type { PostImagesProps } from './PostCard.types';

/**
 * Modern PostImages Component
 *
 * Features:
 * - Single image display (full width)
 * - Grid layout for multiple images (2, 3, 4+)
 * - "+X more" overlay for 4+ images
 * - Press to open gallery
 * - Fade-in animation
 *
 * @example
 * ```tsx
 * <PostImages
 *   images={post.images}
 *   postId={post.id}
 *   onImagePress={(index) => openGallery(index)}
 * />
 * ```
 */
export const PostImages: React.FC<PostImagesProps> = memo(
  ({ images, postId, onImagePress, testID }) => {
    const { trigger } = useHaptic();
    const navigation = useNavigation();

    // Handle image press
    const handleImagePress = useCallback(
      (index: number) => {
        trigger('light');
        if (onImagePress) {
          onImagePress(index);
        } else {
          // @ts-expect-error - navigation types not fully typed
          navigation.navigate('ImageGallery', {
            images: images.map(img => img.url),
            initialIndex: index,
            postId,
          });
        }
      },
      [onImagePress, images, postId, navigation, trigger],
    );

    // Compute grid layout based on image count
    const layout = useMemo(() => {
      const count = images.length;

      if (count === 1) {
        return { type: 'single' as const };
      }

      if (count === 2) {
        return { type: 'grid' as const, columns: 2, rows: 1 };
      }

      if (count === 3) {
        return { type: 'grid' as const, columns: 3, rows: 1 };
      }

      // 4 or more: 2x2 grid with "+X" overlay on last
      return { type: 'grid' as const, columns: 2, rows: 2, overflow: count - 4 };
    }, [images.length]);

    if (images.length === 0) return null;

    // Single image layout
    if (layout.type === 'single') {
      const image = images[0];
      return (
        <View style={imageStyles.container} testID={testID}>
          <Pressable onPress={() => handleImagePress(0)}>
            <Animated.View entering={FadeIn.duration(300)}>
              <Image
                source={{ uri: image.thumbnailUrl ?? image.url }}
                style={imageStyles.singleImage}
                resizeMode="cover"
                accessibilityLabel="Gönderi görseli"
              />
            </Animated.View>
          </Pressable>
        </View>
      );
    }

    // Grid layout (2, 3, 4+ images)
    const displayImages = images.slice(0, 4);

    // Get appropriate style based on layout
    const getItemStyle = () => {
      if (layout.columns === 2 && layout.rows === 2) {
        return imageStyles.gridItemMedium;
      }
      if (layout.columns === 3) {
        return imageStyles.gridItemSmall;
      }
      return imageStyles.gridItemLarge;
    };

    const itemStyle = getItemStyle();

    return (
      <View style={imageStyles.container} testID={testID}>
        <View style={imageStyles.gridContainer}>
          {displayImages.map((image, index) => (
            <Pressable
              key={image.url ?? index}
              onPress={() => handleImagePress(index)}
              style={itemStyle}>
              <Animated.View
                entering={FadeIn.delay(index * 50).duration(300)}
                style={imageStyles.gridImageContainer}>
                <Image
                  source={{ uri: image.thumbnailUrl ?? image.url }}
                  style={imageStyles.gridImage}
                  resizeMode="cover"
                />

                {/* Overflow indicator on last image */}
                {layout.overflow && layout.overflow > 0 && index === 3 && (
                  <View style={imageStyles.moreOverlay}>
                    <Text style={imageStyles.moreText}>+{layout.overflow}</Text>
                  </View>
                )}
              </Animated.View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  },
);

PostImages.displayName = 'PostImages';
