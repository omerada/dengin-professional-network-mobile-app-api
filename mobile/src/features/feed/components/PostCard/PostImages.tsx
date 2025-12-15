// src/features/feed/components/PostCard/PostImages.tsx
// Dengin Design System - Modern PostImages Component
// P3: Optimized with skeleton loading and error handling
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, Text, View, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { useHaptic } from '@shared/hooks/useHaptic';
import { useColors } from '@contexts/ThemeContext';

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
    const colors = useColors();
    const navigation = useNavigation();

    // P3: Track loading state for each image
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});

    // P3: Image loading handlers
    const handleLoadStart = useCallback((index: number) => {
      setLoadingStates(prev => ({ ...prev, [index]: true }));
      setErrorStates(prev => ({ ...prev, [index]: false }));
    }, []);

    const handleLoadEnd = useCallback((index: number) => {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }, []);

    const handleError = useCallback((index: number) => {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
      setErrorStates(prev => ({ ...prev, [index]: true }));
    }, []);

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
      const isLoading = loadingStates[0];
      const hasError = errorStates[0];

      return (
        <View style={imageStyles.container} testID={testID}>
          <Pressable onPress={() => handleImagePress(0)}>
            <Animated.View entering={FadeIn.duration(300)}>
              {/* P3: Loading skeleton */}
              {isLoading && !hasError && (
                <View
                  style={[
                    imageStyles.skeleton,
                    imageStyles.singleImage,
                    { backgroundColor: colors.background.tertiary },
                  ]}>
                  <ActivityIndicator size="large" color={colors.text.tertiary} />
                </View>
              )}
              {/* P3: Error placeholder */}
              {hasError && (
                <View
                  style={[
                    imageStyles.errorPlaceholder,
                    imageStyles.singleImage,
                    { backgroundColor: colors.background.tertiary },
                  ]}>
                  <Text style={{ color: colors.text.tertiary }}>❌</Text>
                </View>
              )}
              {/* P3: Optimized image with handlers */}
              {!hasError && (
                <Image
                  source={{ uri: image.thumbnailUrl ?? image.url }}
                  style={imageStyles.singleImage}
                  resizeMode="cover"
                  accessibilityLabel="Gönderi görseli"
                  onLoadStart={() => handleLoadStart(0)}
                  onLoadEnd={() => handleLoadEnd(0)}
                  onError={() => handleError(0)}
                />
              )}
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
        </View>{/* P3: Grid skeleton */}
                {loadingStates[index] && !errorStates[index] && (
                  <View
                    style={[
                      imageStyles.skeleton,
                      imageStyles.gridImage,
                      { backgroundColor: colors.background.tertiary },
                    ]}>
                    <ActivityIndicator size="small" color={colors.text.tertiary} />
                  </View>
                )}
                {/* P3: Grid error placeholder */}
                {errorStates[index] && (
                  <View
                    style={[
                      imageStyles.errorPlaceholder,
                      imageStyles.gridImage,
                      { backgroundColor: colors.background.tertiary },
                    ]}>
                    <Text style={{ color: colors.text.tertiary, fontSize: 20 }}>❌</Text>
                  </View>
                )}
                {/* P3: Optimized grid image */}
                {!errorStates[index] && (
                  <Image
                    source={{ uri: image.thumbnailUrl ?? image.url }}
                    style={imageStyles.gridImage}
                    resizeMode="cover"
                    onLoadStart={() => handleLoadStart(index)}
                    onLoadEnd={() => handleLoadEnd(index)}
                    onError={() => handleError(index)}
                  />
                )} (2, 3, 4+ images)
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
