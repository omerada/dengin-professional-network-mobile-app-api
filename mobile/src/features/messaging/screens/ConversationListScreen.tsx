// src/features/messaging/screens/ConversationListScreen.tsx
// Konuşma listesi ekranı - Backend API ile uyumlu
// Backend: ConversationController - GET /api/conversations
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { ConversationItem, EmptyConversations } from '../components';
import { useConversations, useSocket } from '../hooks';
import type { Conversation } from '../types';
import type { MessagingStackParamList } from '@core/navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList>;

export const ConversationListScreen: React.FC = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const { isConnected } = useSocket();
  const {
    conversations,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useConversations();

  // Filtered conversations - participant.fullName ile arama
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        c =>
          c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.participant.profession?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()),
      )
    : conversations;

  // Handlers
  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      try {
        if (!conversation) {
          console.error('[ConversationList] Conversation is null/undefined');
          Alert.alert('Hata', 'Konuşma bilgisi bulunamadı');
          return;
        }

        if (!conversation.conversationId) {
          console.error('[ConversationList] Missing conversationId');
          Alert.alert('Hata', 'Konuşma ID bulunamadı');
          return;
        }

        if (!conversation.participant) {
          console.error('[ConversationList] Missing participant');
          Alert.alert('Hata', 'Katılımcı bilgisi bulunamadı');
          return;
        }

        navigation.navigate('Chat', {
          conversationId: conversation.conversationId,
          participant: conversation.participant,
          conversation: conversation,
        });
      } catch (error) {
        console.error('[ConversationList] Error opening conversation:', error);
        Alert.alert('Hata', 'Konuşma açılırken bir hata oluştu');
      }
    },
    [navigation],
  );

  const handleConversationLongPress = useCallback(
    (conversation: Conversation) => {
      Alert.alert(conversation.participant.fullName, 'Konuşma seçenekleri', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Profili Görüntüle',
          onPress: () => {
            (navigation as any).navigate('Profile', { userId: conversation.participant.userId });
          },
        },
      ]);
    },
    [navigation],
  );

  const handleNewConversation = useCallback(() => {
    navigation.navigate('NewConversation');
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render functions
  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      if (!item) {
        console.error('[ConversationList] renderItem: item is null/undefined');
        return null;
      }

      return (
        <ConversationItem
          conversation={item}
          onPress={handleConversationPress}
          onLongPress={handleConversationLongPress}
        />
      );
    },
    [handleConversationPress, handleConversationLongPress],
  );

  const keyExtractor = useCallback((item: Conversation) => item.conversationId, []);

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </View>
    );
  }, [isFetchingNextPage, colors.interactive.default]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.default} />
        </View>
      );
    }
    return <EmptyConversations onStartConversation={handleNewConversation} />;
  }, [isLoading, handleNewConversation, colors.interactive.default]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      {/* Connection indicator */}
      {!isConnected && (
        <View style={[styles.connectionBar, { backgroundColor: colors.status.warning }]}>
          <Icon name="cloud-offline" size={16} color={colors.text.inverse} />
        </View>
      )}

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background.primary }]}>
          <Icon name="search" size={18} color={colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Konuşmalarda ara..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Conversation list */}
      <FlatList
        data={filteredConversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[colors.interactive.default]}
            tintColor={colors.interactive.default}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* New conversation FAB */}
      <Pressable
        onPress={handleNewConversation}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.interactive.default, bottom: insets.bottom + 16 },
          pressed && styles.fabPressed,
        ]}>
        <Icon name="create-outline" size={24} color={colors.text.inverse} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  connectionBar: {
    paddingVertical: 4,
    alignItems: 'center',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});

export default ConversationListScreen;
