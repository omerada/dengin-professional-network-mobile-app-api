// src/shared/components/SearchBar/SearchBar.tsx
// Meslektaş Design System - Modern SearchBar Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useRef, useState } from 'react';
import { View, TextInput, Pressable, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { styles } from './SearchBar.styles';
import { SearchBarProps, SEARCH_BAR_SIZES } from './SearchBar.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern SearchBar Component
 *
 * Features:
 * - Animated focus state with expanding container
 * - Clear button with fade animation
 * - Cancel button with layout animation
 * - Loading state indicator
 * - Haptic feedback
 * - Multiple sizes
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Ara..."
 *   showCancelButton
 *   onCancel={() => setSearchQuery('')}
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = memo(
  ({
    value,
    onChangeText,
    placeholder = 'Ara...',
    size = 'md',
    showCancelButton = false,
    cancelText = 'Vazgeç',
    onCancel,
    onClear,
    onSubmit,
    loading = false,
    autoFocus = false,
    style,
    testID,
    ...inputProps
  }) => {
    const colors = useColors();
    const { trigger } = useHaptic();
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Get size config
    const sizeConfig = SEARCH_BAR_SIZES[size];

    // Animation values
    const focusProgress = useSharedValue(0);
    const clearButtonScale = useSharedValue(value.length > 0 ? 1 : 0);

    // Handle focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      focusProgress.value = withSpring(1, spring.snappy);
    }, [focusProgress]);

    // Handle blur
    const handleBlur = useCallback(() => {
      setIsFocused(false);
      focusProgress.value = withSpring(0, spring.snappy);
    }, [focusProgress]);

    // Handle text change
    const handleChangeText = useCallback(
      (text: string) => {
        onChangeText(text);
        clearButtonScale.value = withTiming(text.length > 0 ? 1 : 0, { duration: 150 });
      },
      [onChangeText, clearButtonScale],
    );

    // Handle clear
    const handleClear = useCallback(() => {
      trigger('light');
      onChangeText('');
      clearButtonScale.value = withTiming(0, { duration: 150 });
      onClear?.();
      inputRef.current?.focus();
    }, [onChangeText, clearButtonScale, onClear, trigger]);

    // Handle cancel
    const handleCancel = useCallback(() => {
      trigger('light');
      onChangeText('');
      clearButtonScale.value = withTiming(0, { duration: 150 });
      inputRef.current?.blur();
      onCancel?.();
    }, [onChangeText, clearButtonScale, onCancel, trigger]);

    // Handle submit
    const handleSubmit = useCallback(() => {
      trigger('light');
      onSubmit?.(value);
    }, [onSubmit, value, trigger]);

    // Animated styles
    const containerAnimatedStyle = useAnimatedStyle(() => ({
      borderWidth: interpolate(focusProgress.value, [0, 1], [1, 2]),
      borderColor: isFocused ? colors.interactive.default : colors.border.default,
    }));

    const clearButtonAnimatedStyle = useAnimatedStyle(() => ({
      opacity: clearButtonScale.value,
      transform: [{ scale: clearButtonScale.value }],
    }));

    return (
      <View style={[styles.container, style]} testID={testID}>
        <Animated.View
          style={[
            styles.inputContainer,
            {
              height: sizeConfig.height,
              backgroundColor: colors.background.secondary,
              paddingHorizontal: sizeConfig.padding,
            },
            containerAnimatedStyle,
          ]}>
          {/* Search Icon */}
          <Icon
            name="search-outline"
            size={sizeConfig.iconSize}
            color={isFocused ? colors.interactive.default : colors.text.tertiary}
          />

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                fontSize: sizeConfig.fontSize,
                color: colors.text.primary,
              },
            ]}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={placeholder}
            accessibilityRole="search"
            {...inputProps}
          />

          {/* Loading Indicator */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={colors.interactive.default}
              style={styles.loadingIndicator}
            />
          )}

          {/* Clear Button */}
          {value.length > 0 && !loading && (
            <AnimatedPressable
              style={[styles.clearButton, clearButtonAnimatedStyle]}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Temizle"
              accessibilityRole="button">
              <Icon name="close-circle" size={sizeConfig.iconSize} color={colors.text.tertiary} />
            </AnimatedPressable>
          )}
        </Animated.View>

        {/* Cancel Button */}
        {showCancelButton && isFocused && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={cancelText}
              accessibilityRole="button">
              <Text style={[styles.cancelText, { color: colors.interactive.default }]}>
                {cancelText}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
