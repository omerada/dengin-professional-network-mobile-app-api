// src/core/navigation/MainNavigator.tsx
// Meslektaş Design System - Modern Main Navigator
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MainTabParamList,
  FeedStackParamList,
  MessagingStackParamList,
  NotificationsStackParamList,
  ProfileStackParamList,
} from '@shared/types';
import { useColors } from '@contexts/ThemeContext';
import { AnimatedTabBar, TabItem } from './components/AnimatedTabBar';

// Screens
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

// ============================================================================
// Tab Configuration
// ============================================================================

const TAB_CONFIG: TabItem[] = [
  {
    name: 'FeedTab',
    label: 'Ana Sayfa',
    icon: 'home-outline',
    focusedIcon: 'home',
    accessibilityLabel: 'Ana sayfa sekmesi',
  },
  {
    name: 'MessagingTab',
    label: 'Mesajlar',
    icon: 'chatbubble-outline',
    focusedIcon: 'chatbubble',
    accessibilityLabel: 'Mesajlar sekmesi',
  },
  {
    name: 'NotificationsTab',
    label: 'Bildirimler',
    icon: 'notifications-outline',
    focusedIcon: 'notifications',
    accessibilityLabel: 'Bildirimler sekmesi',
  },
  {
    name: 'ProfileTab',
    label: 'Profil',
    icon: 'person-outline',
    focusedIcon: 'person',
    accessibilityLabel: 'Profil sekmesi',
  },
];

// ============================================================================
// Stack Navigators
// ============================================================================

const Tab = createBottomTabNavigator<MainTabParamList>();

// Feed Stack
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const FeedStackNavigator: React.FC = () => (
  <FeedStack.Navigator screenOptions={{ headerShown: false }}>
    <FeedStack.Screen name="Feed" component={FeedScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen} />
    <FeedStack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{ presentation: 'modal' }}
    />
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

// ============================================================================
// Main Navigator
// ============================================================================

/**
 * Main Tab Navigator - authenticated user's main navigation
 *
 * Features:
 * - Custom animated tab bar with spring physics
 * - Haptic feedback on tab changes
 * - Badge support for notifications/messages
 * - Blur background on iOS
 */
export const MainNavigator: React.FC = () => {
  const colors = useColors();

  // Custom tab bar renderer
  const renderTabBar = useCallback(
    (props: any) => <AnimatedTabBar {...props} tabs={TAB_CONFIG} />,
    [],
  );

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="FeedTab" component={FeedStackNavigator} />
      <Tab.Screen name="MessagingTab" component={MessagingStackNavigator} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};
