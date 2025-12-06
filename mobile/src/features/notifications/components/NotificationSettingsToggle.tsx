// src/features/notifications/components/NotificationSettingsToggle.tsx
// Toggle component for notification settings
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';

interface NotificationSettingsToggleProps {
  icon: string;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NotificationSettingsToggle: React.FC<NotificationSettingsToggleProps> = memo(
  ({ icon, title, description, value, onValueChange, disabled = false }) => {
    const colors = useColors();

    const handlePress = () => {
      if (!disabled) {
        onValueChange(!value);
      }
    };

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: colors.background.secondary },
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
        disabled={disabled}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: value ? colors.interactive.subtle : colors.background.tertiary,
            },
          ]}>
          <Icon
            name={icon}
            size={20}
            color={value ? colors.interactive.default : colors.text.secondary}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: disabled ? colors.text.disabled : colors.text.primary },
            ]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.text.secondary }]} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: colors.border.default,
            true: colors.interactive.subtle,
          }}
          thumbColor={value ? colors.interactive.default : colors.background.primary}
          ios_backgroundColor={colors.border.default}
        />
      </Pressable>
    );
  },
);

NotificationSettingsToggle.displayName = 'NotificationSettingsToggle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});

export default NotificationSettingsToggle;
