// src/core/navigation/MainNavigator.tsx
// Dengin Design System - Modern Main Navigator
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MainTabParamList,
  FeedStackParamList,
  MessagingStackParamList,
  ProfileStackParamList,
} from '@shared/types';
import { AnimatedTabBar, TabItem } from './components/AnimatedTabBar';
import { NAVIGATION_ANIMATIONS, MODAL_SCREEN_OPTIONS } from '@constants';

// Screens
import { FeedScreen } from '@features/feed/screens/FeedScreen';
import { PostDetailScreen } from '@features/feed/screens/PostDetailScreen';
import { CreatePostScreen } from '@features/feed/screens/CreatePostScreen';
import { CommentsScreen } from '@features/feed/screens/CommentsScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';
import { NotificationSettingsScreen } from '@features/notifications/screens/NotificationSettingsScreen';
import { VerificationStatusScreen } from '@features/verification/screens/VerificationStatusScreen';
import { ConversationListScreen } from '@features/messaging/screens/ConversationListScreen';
import { ChatScreen } from '@features/messaging/screens/ChatScreen';
import { ActivityScreen } from '@features/activity/screens/ActivityScreen';
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
    name: 'CreatePostTab',
    label: '', // No label for center FAB
    icon: 'add-circle',
    focusedIcon: 'add-circle',
    accessibilityLabel: 'Gönderi oluştur',
    isCenterFab: true, // Elevated center button
  },
  {
    name: 'ActivityTab',
    label: 'Etkinlik',
    icon: 'trophy-outline',
    focusedIcon: 'trophy',
    accessibilityLabel: 'Etkinlik sekmesi',
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
  <FeedStack.Navigator
    screenOptions={{
      headerShown: false,
      ...NAVIGATION_ANIMATIONS.stack,
    }}>
    <FeedStack.Screen name="Feed" component={FeedScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen} />
    <FeedStack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={MODAL_SCREEN_OPTIONS}
    />
    <FeedStack.Screen name="Comments" component={CommentsScreen} />
    <FeedStack.Screen name="Notifications" component={NotificationsScreen} />
    <FeedStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    <FeedStack.Screen name="VerificationStatus" component={VerificationStatusScreen} />
  </FeedStack.Navigator>
);

// Messaging Stack
const MessagingStack = createNativeStackNavigator<MessagingStackParamList>();
const MessagingStackNavigator: React.FC = () => (
  <MessagingStack.Navigator
    screenOptions={{
      headerShown: false,
      ...NAVIGATION_ANIMATIONS.stack,
    }}>
    <MessagingStack.Screen name="ConversationList" component={ConversationListScreen} />
    <MessagingStack.Screen name="Chat" component={ChatScreen} />
    <MessagingStack.Screen
      name="NewConversation"
      component={require('@features/messaging/screens/NewConversationScreen').NewConversationScreen}
      options={MODAL_SCREEN_OPTIONS}
    />
  </MessagingStack.Navigator>
);

// Profile Stack
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
      ...NAVIGATION_ANIMATIONS.stack,
    }}>
    {/* Modern Premium Profile Screen */}
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
      <Tab.Screen
        name="CreatePostTab"
        component={FeedStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('FeedTab', {
              screen: 'CreatePost',
            } as never);
          },
        })}
      />
      <Tab.Screen name="ActivityTab" component={ActivityScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};
