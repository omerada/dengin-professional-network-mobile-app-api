// src/features/notifications/components/NotificationSettingsToggle.tsx
// Toggle component for notification settings
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';

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
    const { theme } = useTheme();

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
          { backgroundColor: theme.colors.surface },
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
        disabled={disabled}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: value
                ? theme.colors.primary[50]
                : theme.colors.grey[100],
            },
          ]}
        >
          <Icon
            name={icon}
            size={20}
            color={
              value ? theme.colors.primary[500] : theme.colors.text.secondary
            }
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: disabled ? theme.colors.text.disabled : theme.colors.text.primary },
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.description,
                { color: theme.colors.text.secondary },
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.colors.grey[300],
            true: theme.colors.primary[200],
          }}
          thumbColor={value ? theme.colors.primary[500] : theme.colors.grey[50]}
          ios_backgroundColor={theme.colors.grey[300]}
        />
      </Pressable>
    );
  }
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
