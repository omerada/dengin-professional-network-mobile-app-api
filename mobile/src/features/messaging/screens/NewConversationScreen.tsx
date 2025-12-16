// src/features/messaging/screens/NewConversationScreen.tsx
// Yeni konuşma başlatma ekranı
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { spacing } from '@theme';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useUserSearch } from '@features/social/hooks';
import { useStartConversation } from '../hooks';
import { getErrorMessage } from '@core/utils/errorUtils';
import type { UserSummary } from '../types';
import type { MessagingStackParamList } from '@core/navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList, 'NewConversation'>;

interface UserItemProps {
  user: UserSummary;
  onPress: (user: UserSummary) => void;
  isLoading?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress, isLoading }) => {
  const colors = useColors();

  return (
    <Pressable
      onPress={() => onPress(user)}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.userItem,
        pressed && { backgroundColor: colors.background.secondary },
      ]}>
      {/* Avatar */}
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
          <Icon name="person" size={20} color={colors.interactive.default} />
        </View>
      )}

      {/* Name */}
      <Text style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
        {user.displayName}
      </Text>

      {/* Loading or arrow */}
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.interactive.default} />
      ) : (
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      )}
    </Pressable>
  );
};

export const NewConversationScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Hooks
  const { startConversation } = useStartConversation();

  // User search with real API
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isFetching,
  } = useUserSearch(debouncedSearch, debouncedSearch.length >= 2);

  // Show loading state
  const showLoading = useMemo(() => isSearching || isFetching, [isSearching, isFetching]);

  // Handlers
  const handleUserPress = useCallback(
    async (user: UserSummary) => {
      try {
        setLoadingUserId(user.id);
        const conversationId = await startConversation(user.id);
        navigation.replace('Chat', { conversationId });
      } catch (error) {
        // Show backend error message with modern toast
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage, 'Konuşma Başlatılamadı');
      } finally {
        setLoadingUserId(null);
      }
    },
    [navigation, startConversation, toast],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render
  const renderItem = useCallback(
    ({ item }: { item: UserSummary }) => (
      <UserItem user={item} onPress={handleUserPress} isLoading={loadingUserId === item.id} />
    ),
    [handleUserPress, loadingUserId],
  );

  const keyExtractor = useCallback((item: UserSummary) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {showLoading ? (
          <ActivityIndicator size="large" color={colors.interactive.default} />
        ) : (
          <>
            <Icon name="search-outline" size={48} color={colors.text.tertiary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              {searchQuery.trim().length >= 2
                ? 'Kullanıcı bulunamadı'
                : 'Konuşma başlatmak için en az 2 karakter girin'}
            </Text>
          </>
        )}
      </View>
    ),
    [showLoading, searchQuery, colors],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border.default,
          },
        ]}>
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.background.secondary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon name="chevron-back" size={24} color={colors.text.primary} />
          </View>
        </Pressable>
        <Text style={[styles.title, { color: colors.text.primary }]}>Yeni Konuşma</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background.primary }]}>
          <Icon name="search" size={18} color={colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Kullanıcı ara..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* User list */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          searchResults.length === 0 && styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    flexGrow: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchInputContainer: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  userItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs, // 12
    paddingHorizontal: spacing.md, // 16
    paddingVertical: spacing.sm + spacing.xs, // 12
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
});

export default NewConversationScreen;
