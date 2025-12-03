// src/features/feed/components/FeedHeader.tsx
// Feed header - filter tabs
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { useFeedStore } from '../stores';
import type { FeedFilter } from '../types';

interface FilterOption {
  key: FeedFilter;
  label: string;
  icon: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'following', label: 'Takip', icon: 'people-outline' },
  { key: 'popular', label: 'Popüler', icon: 'flame-outline' },
  { key: 'nearby', label: 'Yakın', icon: 'location-outline' },
];

interface FeedHeaderProps {
  onCreatePress?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = memo(({ onCreatePress }) => {
  const { theme } = useTheme();
  const filter = useFeedStore((state) => state.filter);
  const setFilter = useFeedStore((state) => state.setFilter);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.primary,
          borderBottomColor: theme.colors.border.light,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = filter === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary[500]
                    : theme.colors.background.secondary,
                },
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Icon
                name={option.icon}
                size={16}
                color={isActive ? '#FFFFFF' : theme.colors.text.secondary}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? '#FFFFFF' : theme.colors.text.secondary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {onCreatePress && (
        <Pressable
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={onCreatePress}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
});

FeedHeader.displayName = 'FeedHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filters: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default FeedHeader;
