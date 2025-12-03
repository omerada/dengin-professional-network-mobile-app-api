// src/core/navigation/MainNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, FeedStackParamList, MessagingStackParamList, NotificationsStackParamList, ProfileStackParamList } from '@shared/types';
import { useTheme } from '@contexts/ThemeContext';

// Placeholder screens - will be implemented in later sprints
import { FeedScreen } from '@features/feed/screens/FeedScreen';
import { PostDetailScreen } from '@features/feed/screens/PostDetailScreen';
import { CreatePostScreen } from '@features/feed/screens/CreatePostScreen';
import { CommentsScreen } from '@features/feed/screens/CommentsScreen';
import { ConversationListScreen } from '@features/messaging/screens/ConversationListScreen';
import { ChatScreen } from '@features/messaging/screens/ChatScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { EditProfileScreen } from '@features/profile/screens/EditProfileScreen';
import { SettingsScreen } from '@features/profile/screens/SettingsScreen';

// Tab icons - will be replaced with proper icons
const TabIcon = ({ focused, color }: { focused: boolean; color: string }) => null;

const Tab = createBottomTabNavigator<MainTabParamList>();

// Feed Stack
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const FeedStackNavigator: React.FC = () => (
  <FeedStack.Navigator screenOptions={{ headerShown: false }}>
    <FeedStack.Screen name="Feed" component={FeedScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen} />
    <FeedStack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
    <FeedStack.Screen name="Comments" component={CommentsScreen} />
  </FeedStack.Navigator>
);

// Messaging Stack
const MessagingStack = createNativeStackNavigator<MessagingStackParamList>();
const MessagingStackNavigator: React.FC = () => (
  <MessagingStack.Navigator screenOptions={{ headerShown: false }}>
    <MessagingStack.Screen name="ConversationList" component={ConversationListScreen} />
    <MessagingStack.Screen name="Chat" component={ChatScreen} />
  </MessagingStack.Navigator>
);

// Notifications Stack
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const NotificationsStackNavigator: React.FC = () => (
  <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
    <NotificationsStack.Screen name="Notifications" component={NotificationsScreen} />
  </NotificationsStack.Navigator>
);

// Profile Stack
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

/**
 * Main Tab Navigator - authenticated user's main navigation
 */
export const MainNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
        },
      }}>
      <Tab.Screen
        name="FeedTab"
        component={FeedStackNavigator}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarAccessibilityLabel: 'Ana sayfa sekmesi',
        }}
      />
      <Tab.Screen
        name="MessagingTab"
        component={MessagingStackNavigator}
        options={{
          tabBarLabel: 'Mesajlar',
          tabBarAccessibilityLabel: 'Mesajlar sekmesi',
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStackNavigator}
        options={{
          tabBarLabel: 'Bildirimler',
          tabBarAccessibilityLabel: 'Bildirimler sekmesi',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profil',
          tabBarAccessibilityLabel: 'Profil sekmesi',
        }}
      />
    </Tab.Navigator>
  );
};
