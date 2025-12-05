# 🧭 Navigasyon Patterns

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Akıcı ve sezgisel navigasyon deneyimi

---

## 📑 İçindekiler

1. [Navigasyon Felsefesi](#navigasyon-felsefesi)
2. [Tab Navigator](#tab-navigator)
3. [Stack Navigator Animations](#stack-navigator-animations)
4. [Modal Presentations](#modal-presentations)
5. [Gesture Navigation](#gesture-navigation)
6. [Deep Linking](#deep-linking)
7. [Navigation Guards](#navigation-guards)

---

## 🎯 Navigasyon Felsefesi

### Prensipler

```
1. PREDICTABLE: Kullanıcı nereye gideceğini bilmeli
2. GESTURAL: Doğal swipe gesture'ları desteklenmeli
3. CONTEXTUAL: Bağlama uygun geçişler
4. FAST: <300ms transition süresi
5. ACCESSIBLE: Screen reader uyumlu
```

### Navigasyon Hierarşisi

```
App
├── Auth Flow (Stack)
│   ├── Splash
│   ├── Onboarding
│   ├── Login
│   └── Register
│
├── Main Flow (Tab)
│   ├── Home (Stack)
│   │   ├── Feed
│   │   ├── PostDetail
│   │   └── Comments
│   │
│   ├── Search (Stack)
│   │   ├── Explore
│   │   ├── SearchResults
│   │   └── UserProfile
│   │
│   ├── Create (Modal)
│   │   └── CreatePost
│   │
│   ├── Messages (Stack)
│   │   ├── ChatList
│   │   └── Chat
│   │
│   └── Profile (Stack)
│       ├── MyProfile
│       ├── EditProfile
│       └── Settings
│
└── Modals (Stack)
    ├── ImageViewer
    ├── VideoPlayer
    └── UserPicker
```

---

## 📱 Tab Navigator

### Animated Tab Bar Configuration

```typescript
// src/navigation/MainTabNavigator.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

// Screens
import { HomeStack } from "./HomeStack";
import { SearchStack } from "./SearchStack";
import { CreateScreen } from "@features/create/screens/CreateScreen";
import { MessagesStack } from "./MessagesStack";
import { ProfileStack } from "./ProfileStack";

// Components
import { AnimatedTabButton, CreateTabButton } from "./components";

const Tab = createBottomTabNavigator();

interface TabItem {
  name: string;
  component: React.ComponentType<any>;
  icon: string;
  focusedIcon: string;
  label: string;
  badge?: number;
}

const tabs: TabItem[] = [
  {
    name: "HomeTab",
    component: HomeStack,
    icon: "home-outline",
    focusedIcon: "home",
    label: "Ana Sayfa",
  },
  {
    name: "SearchTab",
    component: SearchStack,
    icon: "search-outline",
    focusedIcon: "search",
    label: "Keşfet",
  },
  {
    name: "CreateTab",
    component: CreateScreen,
    icon: "add-circle-outline",
    focusedIcon: "add-circle",
    label: "Oluştur",
  },
  {
    name: "MessagesTab",
    component: MessagesStack,
    icon: "chatbubble-outline",
    focusedIcon: "chatbubble",
    label: "Mesajlar",
    badge: 3,
  },
  {
    name: "ProfileTab",
    component: ProfileStack,
    icon: "person-outline",
    focusedIcon: "person",
    label: "Profil",
  },
];

export const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { trigger: triggerHaptic } = useHaptic();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={[
              StyleSheet.absoluteFill,
              { borderTopWidth: 1, borderTopColor: colors.border.light },
            ]}
          />
        ),
      }}
      tabBar={(props) => <CustomTabBar {...props} tabs={tabs} />}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
          }}
          listeners={{
            tabPress: () => triggerHaptic("selection"),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

// Custom tab bar component
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  tabs: TabItem[];
}

const CustomTabBar = memo<CustomTabBarProps>(
  ({ state, descriptors, navigation, tabs }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {state.routes.map((route: any, index: number) => {
          const tab = tabs[index];
          const isFocused = state.index === index;

          // Special handling for create tab
          if (tab.name === "CreateTab") {
            return (
              <CreateTabButton
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
              />
            );
          }

          return (
            <AnimatedTabButton
              key={route.key}
              icon={isFocused ? tab.focusedIcon : tab.icon}
              isFocused={isFocused}
              badge={tab.badge}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              }}
            />
          );
        })}
      </View>
    );
  }
);

// Animated tab button
interface AnimatedTabButtonProps {
  icon: string;
  isFocused: boolean;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
}

export const AnimatedTabButton = memo<AnimatedTabButtonProps>(
  ({ icon, isFocused, badge, onPress, onLongPress }) => {
    const { colors } = useTheme();

    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <Ionicons
            name={icon as any}
            size={26}
            color={isFocused ? colors.primary.main : colors.text.tertiary}
          />

          {badge && badge > 0 && (
            <AnimatedBadge count={badge} size="small" style={styles.badge} />
          )}
        </Animated.View>
      </Pressable>
    );
  }
);

// Create button (special center button)
export const CreateTabButton = memo<{ onPress: () => void }>(({ onPress }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.createButton}
    >
      <Animated.View
        style={[
          styles.createButtonInner,
          { backgroundColor: colors.primary.main },
          animatedStyle,
        ]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
  },
  createButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

---

## 📚 Stack Navigator Animations

### Custom Transition Animations

```typescript
// src/navigation/config/transitions.ts

import {
  TransitionPresets,
  StackCardInterpolationProps,
  StackCardStyleInterpolator,
} from "@react-navigation/stack";
import { Easing } from "react-native-reanimated";

// iOS-style slide from right
export const SlideFromRight: StackCardStyleInterpolator = ({
  current,
  next,
  layouts,
}) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });

  const overlayOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const nextTranslateX = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.width * 0.3],
      })
    : 0;

  return {
    cardStyle: {
      transform: [{ translateX }],
    },
    overlayStyle: {
      backgroundColor: "#000",
      opacity: overlayOpacity,
    },
  };
};

// Instagram-style slide from bottom for modals
export const SlideFromBottom: StackCardStyleInterpolator = ({
  current,
  layouts,
}) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.height, 0],
  });

  const borderRadius = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return {
    cardStyle: {
      transform: [{ translateY }],
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
  };
};

// Fade transition for overlays
export const Fade: StackCardStyleInterpolator = ({ current }) => {
  return {
    cardStyle: {
      opacity: current.progress,
    },
  };
};

// Scale and fade for alerts/dialogs
export const ScaleFade: StackCardStyleInterpolator = ({ current }) => {
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return {
    cardStyle: {
      opacity: current.progress,
      transform: [{ scale }],
    },
  };
};

// Shared element transition setup
export const SharedElement: StackCardStyleInterpolator = ({
  current,
  layouts,
}) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });

  return {
    cardStyle: {
      transform: [{ translateX }],
    },
  };
};

// Navigation options presets
export const navigationPresets = {
  // Default stack transition
  default: {
    cardStyleInterpolator: SlideFromRight,
    transitionSpec: {
      open: {
        animation: "spring" as const,
        config: {
          damping: 20,
          stiffness: 250,
          mass: 1,
        },
      },
      close: {
        animation: "spring" as const,
        config: {
          damping: 20,
          stiffness: 250,
          mass: 1,
        },
      },
    },
  },

  // Modal presentation
  modal: {
    cardStyleInterpolator: SlideFromBottom,
    cardOverlayEnabled: true,
    gestureEnabled: true,
    gestureDirection: "vertical" as const,
    transitionSpec: {
      open: {
        animation: "spring" as const,
        config: {
          damping: 20,
          stiffness: 300,
        },
      },
      close: {
        animation: "timing" as const,
        config: {
          duration: 250,
          easing: Easing.out(Easing.ease),
        },
      },
    },
  },

  // Fade for overlays
  fade: {
    cardStyleInterpolator: Fade,
    cardOverlayEnabled: true,
    transitionSpec: {
      open: {
        animation: "timing" as const,
        config: {
          duration: 200,
        },
      },
      close: {
        animation: "timing" as const,
        config: {
          duration: 150,
        },
      },
    },
  },

  // Dialog/Alert
  dialog: {
    cardStyleInterpolator: ScaleFade,
    cardOverlayEnabled: true,
    presentation: "transparentModal" as const,
    transitionSpec: {
      open: {
        animation: "spring" as const,
        config: {
          damping: 15,
          stiffness: 400,
        },
      },
      close: {
        animation: "timing" as const,
        config: {
          duration: 150,
        },
      },
    },
  },
};
```

### Stack Navigator Setup

```typescript
// src/navigation/HomeStack.tsx

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { navigationPresets } from "./config/transitions";
import { AnimatedHeader } from "./components/AnimatedHeader";

// Screens
import { FeedScreen } from "@features/feed/screens/FeedScreen";
import { PostDetailScreen } from "@features/feed/screens/PostDetailScreen";
import { CommentsScreen } from "@features/feed/screens/CommentsScreen";
import { ProfileScreen } from "@features/profile/screens/ProfileScreen";

export type HomeStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  Comments: { postId: string };
  Profile: { userId: string };
};

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationPresets.default,
        header: (props) => <AnimatedHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{
          ...navigationPresets.modal,
          headerTitle: "Yorumlar",
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          headerTitle: "",
        })}
      />
    </Stack.Navigator>
  );
};
```

---

## 🎭 Modal Presentations

### Bottom Sheet Modal

```typescript
// src/navigation/components/BottomSheetModal.tsx

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface BottomSheetModalRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetModalProps {
  children: React.ReactNode;
  snapPoints?: number[];
  onClose?: () => void;
}

export const BottomSheetModal = forwardRef<
  BottomSheetModalRef,
  BottomSheetModalProps
>(({ children, snapPoints = [0.5, 0.9], onClose }, ref) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const contextY = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const snapPointsPx = snapPoints.map((p) => SCREEN_HEIGHT * (1 - p));
  const maxTranslateY = snapPointsPx[0];
  const minTranslateY = snapPointsPx[snapPointsPx.length - 1];

  // Open modal
  const open = useCallback(() => {
    isOpen.value = true;
    translateY.value = withSpring(maxTranslateY, { damping: 20 });
  }, [maxTranslateY]);

  // Close modal
  const close = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      isOpen.value = false;
      if (onClose) runOnJS(onClose)();
    });
  }, [onClose]);

  // Expose methods
  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        minTranslateY,
        contextY.value + event.translationY
      );
    })
    .onEnd((event) => {
      // Snap to closest point or close
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(close)();
      } else {
        // Find closest snap point
        let closest = snapPointsPx[0];
        let minDistance = Math.abs(translateY.value - closest);

        for (const point of snapPointsPx) {
          const distance = Math.abs(translateY.value - point);
          if (distance < minDistance) {
            minDistance = distance;
            closest = point;
          }
        }

        translateY.value = withSpring(closest, { damping: 20 });
      }
    });

  // Animated styles
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, maxTranslateY],
      [0, 0.5]
    );

    return {
      opacity,
      pointerEvents: isOpen.value ? "auto" : "none",
    };
  });

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        onTouchEnd={close}
      />

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface.primary },
            sheetStyle,
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[styles.handle, { backgroundColor: colors.border.medium }]}
            />
          </View>

          {/* Content */}
          <View style={{ paddingBottom: insets.bottom }}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
```

---

## 👆 Gesture Navigation

### SwipeBackGesture

```typescript
// src/navigation/components/SwipeBackGesture.tsx

import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeBackGestureProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const SwipeBackGesture = memo<SwipeBackGestureProps>(
  ({ children, enabled = true }) => {
    const navigation = useNavigation();

    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const panGesture = Gesture.Pan()
      .enabled(enabled)
      .activeOffsetX([10, 50]) // Only activate from left edge
      .onStart((event) => {
        startX.value = event.x;
      })
      .onUpdate((event) => {
        // Only allow swipe if started near left edge
        if (startX.value < 30) {
          translateX.value = Math.max(0, event.translationX);
        }
      })
      .onEnd((event) => {
        if (translateX.value > SWIPE_THRESHOLD || event.velocityX > 500) {
          translateX.value = withSpring(SCREEN_WIDTH, { damping: 20 }, () => {
            runOnJS(navigation.goBack)();
          });
        } else {
          translateX.value = withSpring(0);
        }
      });

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        translateX.value,
        [0, SCREEN_WIDTH],
        [1, 0.95],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateX: translateX.value }, { scale }],
      };
    });

    const shadowStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [0, SCREEN_WIDTH * 0.3],
        [0, 0.3],
        Extrapolate.CLAMP
      );

      return {
        opacity,
        left: -20,
      };
    });

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* Shadow */}
          <Animated.View style={[styles.shadow, shadowStyle]} />

          {children}
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: "#000",
  },
});
```

---

## 🔗 Deep Linking

### Deep Link Configuration

```typescript
// src/navigation/config/linking.ts

import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

export const linking: LinkingOptions<any> = {
  prefixes: [
    Linking.createURL("/"),
    "meslektas://",
    "https://meslektas.com",
    "https://www.meslektas.com",
  ],

  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
          Register: "register",
          ResetPassword: "reset-password/:token",
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Feed: "feed",
              PostDetail: "post/:postId",
              Comments: "post/:postId/comments",
            },
          },
          SearchTab: {
            screens: {
              Explore: "explore",
              SearchResults: "search",
            },
          },
          MessagesTab: {
            screens: {
              ChatList: "messages",
              Chat: "chat/:chatId",
            },
          },
          ProfileTab: {
            screens: {
              MyProfile: "profile",
              EditProfile: "profile/edit",
              Settings: "settings",
            },
          },
        },
      },
      // External profiles
      UserProfile: "user/:userId",
    },
  },

  // Custom getStateFromPath for complex routes
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },

  subscribe(listener) {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      listener(url);
    });

    return () => subscription.remove();
  },
};

// Handle deep link analytics
export const handleDeepLink = (url: string) => {
  // Log deep link for analytics
  console.log("Deep link opened:", url);

  // Parse and track
  const { path, queryParams } = Linking.parse(url);

  // Track in analytics
  analytics.track("deep_link_opened", {
    path,
    params: queryParams,
  });
};
```

---

## 🛡️ Navigation Guards

### Auth Guard

```typescript
// src/navigation/guards/AuthGuard.tsx

import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireVerification = false,
}) => {
  const navigation = useNavigation();
  const { isAuthenticated, isVerified, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" as never }],
      });
      return;
    }

    if (requireVerification && !isVerified) {
      navigation.navigate("Verification" as never);
      return;
    }
  }, [
    isAuthenticated,
    isVerified,
    isLoading,
    requireAuth,
    requireVerification,
  ]);

  if (isLoading) {
    return null; // Or loading screen
  }

  return <>{children}</>;
};

// HOC version
export const withAuthGuard = (
  Component: React.ComponentType<any>,
  options?: Omit<AuthGuardProps, "children">
) => {
  return (props: any) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );
};
```

---

## ✅ Acceptance Criteria

```
□ Tab bar animasyonları 60 FPS
□ Stack transitions spring physics
□ Modal slide-to-dismiss çalışıyor
□ Gesture navigation smooth
□ Deep linking tüm routelar için çalışıyor
□ Auth guard redirect'ler doğru
□ Keyboard avoidance tüm ekranlarda
□ Safe area insets doğru
□ Accessibility navigasyon destekli
□ Screen reader focus yönetimi
```

---

Bu navigasyon pattern'leri Instagram/Happen kalitesinde akıcı uygulama deneyimi sağlar.
