// src/features/messaging/screens/ConversationListScreen.tsx
// Konuşma listesi ekranı
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { useCallback, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@contexts/ThemeContext';
import {
  ConversationItem,
  EmptyConversations,
  ConversationOptionsSheet,
  type ConversationOptionsSheetRef,
} from '../components';
import { useConversations, useSocket } from '../hooks';
import { messagingService } from '../services';
import type { ConversationSummary } from '../types';
import type { MessagingStackParamList } from '@navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList>;

export const ConversationListScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);

  // Refs
  const optionsSheetRef = useRef<ConversationOptionsSheetRef>(null);

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

  // Filtered conversations
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // Handlers
  const handleConversationPress = useCallback((conversation: ConversationSummary) => {
    navigation.navigate('Chat', { conversationId: conversation.id });
  }, [navigation]);

  const handleConversationLongPress = useCallback((conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    optionsSheetRef.current?.open();
  }, []);

  const handleNewConversation = useCallback(() => {
    navigation.navigate('NewConversation');
  }, [navigation]);

  const handlePin = useCallback(async (conversation: ConversationSummary) => {
    try {
      if (conversation.isPinned) {
        await messagingService.unpinConversation(conversation.id);
      } else {
        await messagingService.pinConversation(conversation.id);
      }
      refetch();
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    }
  }, [refetch]);

  const handleMute = useCallback(async (conversation: ConversationSummary) => {
    try {
      if (conversation.isMuted) {
        await messagingService.unmuteConversation(conversation.id);
      } else {
        await messagingService.muteConversation(conversation.id);
      }
      refetch();
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    }
  }, [refetch]);

  const handleDelete = useCallback(async (conversation: ConversationSummary) => {
    Alert.alert(
      'Konuşmayı Sil',
      'Bu konuşmayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await messagingService.deleteConversation(conversation.id);
              refetch();
            } catch (error) {
              Alert.alert('Hata', 'Konuşma silinemedi');
            }
          },
        },
      ]
    );
  }, [refetch]);

  const handleBlock = useCallback((conversation: ConversationSummary) => {
    Alert.alert(
      'Kullanıcıyı Engelle',
      `${conversation.name} kullanıcısını engellemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement block user
            Alert.alert('Bilgi', 'Kullanıcı engellendi');
          },
        },
      ]
    );
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render functions
  const renderItem = useCallback(({ item }: { item: ConversationSummary }) => (
    <ConversationItem
      conversation={item}
      onPress={handleConversationPress}
      onLongPress={handleConversationLongPress}
    />
  ), [handleConversationPress, handleConversationLongPress]);

  const keyExtractor = useCallback((item: ConversationSummary) => item.id, []);

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingNextPage, theme.colors.primary]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      );
    }
    return <EmptyConversations onStartConversation={handleNewConversation} />;
  }, [isLoading, handleNewConversation, theme.colors.primary]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      {/* Connection indicator */}
      {!isConnected && (
        <View style={[styles.connectionBar, { backgroundColor: theme.colors.status.warning }]}>
          <Icon name="cloud-offline" size={16} color="#FFFFFF" />
        </View>
      )}

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          <Icon name="search" size={18} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Konuşmalarda ara..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={theme.colors.text.tertiary} />
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
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
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
          { backgroundColor: theme.colors.primary[500], bottom: insets.bottom + 16 },
          pressed && styles.fabPressed,
        ]}
      >
        <Icon name="create-outline" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Options bottom sheet */}
      <ConversationOptionsSheet
        ref={optionsSheetRef}
        conversation={selectedConversation}
        onPin={handlePin}
        onMute={handleMute}
        onDelete={handleDelete}
        onBlock={handleBlock}
      />
    </View>
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
