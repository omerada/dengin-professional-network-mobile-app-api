// src/features/messaging/screens/ConversationListScreen.tsx
// Konuşma listesi ekranı - Backend API ile uyumlu
// Backend: ConversationController - GET /api/conversations
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SCREEN_ANIMATIONS } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic, useLoadingTimeout } from '@shared/hooks';
import { showOperationError } from '@shared/utils';
import { ConversationItem, ConversationSkeleton } from '../components';
import { useConversations, useSocket } from '../hooks';
import {
  AnimatedListItem,
  UnifiedEmptyState,
  CustomRefreshControl,
  UnifiedScreenHeader,
  ActionSheet,
} from '@shared/components';
import type { Conversation } from '../types';
import type { MessagingStackParamList } from '@core/navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList>;

export const ConversationListScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const { triggerNavigation } = useSemanticHaptic();
  const toast = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useSharedValue(0);

  // Scroll handler for collapsible header
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

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

  // Loading timeout protection
  useLoadingTimeout(isLoading && conversations.length === 0, {
    timeout: 30000,
    onTimeout: () => {
      toast.error('Konuşmalar yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.');
    },
    onRetry: async () => {
      await refetch();
    },
  });

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
      triggerNavigation('navigate');
      try {
        if (!conversation) {
          console.error('[ConversationList] Conversation is null/undefined');
          showOperationError(toast, { trigger: triggerNavigation }, 'Konuşma bilgisi bulunamadı');
          return;
        }

        if (!conversation.conversationId) {
          console.error('[ConversationList] Missing conversationId');
          showOperationError(toast, { trigger: triggerNavigation }, 'Konuşma ID bulunamadı');
          return;
        }

        if (!conversation.participant) {
          console.error('[ConversationList] Missing participant');
          showOperationError(toast, { trigger: triggerNavigation }, 'Katılımcı bilgisi bulunamadı');
          return;
        }

        navigation.navigate('Chat', {
          conversationId: conversation.conversationId,
          participant: conversation.participant,
          conversation: conversation,
        });
      } catch (error) {
        console.error('[ConversationList] Error opening conversation:', error);
        showOperationError(
          toast,
          { trigger: triggerNavigation },
          'Konuşma açılırken bir hata oluştu',
        );
      }
    },
    [navigation, triggerNavigation],
  );

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleConversationLongPress = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const handleCloseActionSheet = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (selectedConversation) {
      (navigation as any).navigate('Profile', { userId: selectedConversation.participant.userId });
      setSelectedConversation(null);
    }
  }, [navigation, selectedConversation]);

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
    ({ item, index }: { item: Conversation; index: number }) => {
      if (!item) {
        console.error('[ConversationList] renderItem: item is null/undefined');
        return null;
      }

      return (
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(index)}>
          <AnimatedListItem
            onPress={() => handleConversationPress(item)}
            onLongPress={() => handleConversationLongPress(item)}>
            <ConversationItem conversation={item} />
          </AnimatedListItem>
        </Animated.View>
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
    if (isLoading) return null;

    return (
      <UnifiedEmptyState
        icon="chatbubbles-outline"
        title="Henüz Mesajınız Yok"
        description="Profesyonellerle sohbet başlatın ve ağınızı genişletin"
        primaryAction={{
          label: 'Yeni Sohbet Başlat',
          icon: 'add-circle-outline',
          onPress: handleNewConversation,
        }}
      />
    );
  }, [isLoading, handleNewConversation]);

  // Render
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={{ flex: 1 }}>
        {/* UnifiedScreenHeader with search variant - collapsible */}
        <UnifiedScreenHeader
          variant="search"
          title="Mesajlar"
          collapsible
          scrollY={scrollY}
          searchProps={{
            value: searchQuery,
            onChangeText: setSearchQuery,
            placeholder: 'Konuşmalarda ara...',
          }}
        />

        {/* Connection indicator */}
        {!isConnected && (
          <View style={[styles.connectionBar, { backgroundColor: colors.status.warning }]}>
            <Icon name="cloud-offline" size={16} color={colors.text.inverse} />
          </View>
        )}

        {/* Loading state - Skeleton */}
        {isLoading && <ConversationSkeleton count={8} />}

        {/* Conversation list - P2: FlashList for 10x performance */}
        {!isLoading && (
          <FlashList
            data={filteredConversations}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            // estimatedItemSize removed - using automatic estimation
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={<CustomRefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
            contentContainerStyle={[
              styles.listContent,
              filteredConversations.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // Collapsible header scroll handler
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          />
        )}
      </Animated.View>

      {/* Conversation Options ActionSheet */}
      {selectedConversation && (
        <ActionSheet
          visible={!!selectedConversation}
          onClose={handleCloseActionSheet}
          title={selectedConversation.participant.fullName}
          message="Konuşma seçenekleri"
          options={[
            {
              id: 'view-profile',
              label: 'Profili Görüntüle',
              icon: 'person',
              onPress: handleViewProfile,
            },
          ]}
          cancelLabel="İptal"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  connectionBar: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  container: {
    flex: 1,
  },
  emptyListContent: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 16,
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
});

export default ConversationListScreen;
