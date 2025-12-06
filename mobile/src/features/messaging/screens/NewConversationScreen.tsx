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
import { useDebounce } from '@shared/hooks/useDebounce';
import { useUserSearch } from '@features/social/hooks';
import { useStartConversation } from '../hooks';
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
        // Error handled in hook
      } finally {
        setLoadingUserId(null);
      }
    },
    [navigation, startConversation],
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
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={24} color={colors.text.primary} />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NewConversationScreen;
