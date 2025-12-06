# 📱 Ekran Yeniden Tasarımları

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Tüm ana ekranların modernize edilmiş tasarımları

---

## 📑 İçindekiler

1. [Splash Screen](#splash-screen)
2. [Onboarding Flow](#onboarding-flow)
3. [Login/Register Screens](#loginregister-screens)
4. [Feed Screen](#feed-screen)
5. [Post Detail Screen](#post-detail-screen)
6. [Profile Screen](#profile-screen)
7. [Search Screen](#search-screen)
8. [Notifications Screen](#notifications-screen)
9. [Settings Screen](#settings-screen)

---

## 🌅 Splash Screen

### Mevcut Durum

- Statik logo
- Basit fade-in

### Hedef Tasarım

- Animasyonlu logo (Lottie)
- Brand gradient background
- Smooth transition to main app

### Implementation

```typescript
// src/features/splash/screens/SplashScreen.tsx

import React, { useEffect, useCallback } from "react";
import { StyleSheet, View, StatusBar, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  scheduleOnRN,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useTheme } from "@theme";
import { useAuth } from "@contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export const SplashScreen: React.FC = () => {
  const { colors } = useTheme();
  const { checkAuthStatus, isAuthenticated } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(-10);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const screenOpacity = useSharedValue(1);

  const navigateToMain = useCallback(() => {
    // Navigation logic here
  }, [isAuthenticated]);

  useEffect(() => {
    // Logo animation sequence
    logoOpacity.value = withTiming(1, { duration: 300 });
    logoScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    logoRotation.value = withSpring(0, { damping: 15 });

    // Text animation
    textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    // Check auth and navigate
    const timer = setTimeout(async () => {
      await checkAuthStatus();

      // Fade out
      screenOpacity.value = withTiming(0, { duration: 300 }, () => {
        scheduleOnRN(navigateToMain)();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background pattern (optional) */}
      <View style={styles.patternContainer}>
        {/* Add subtle pattern or particles here */}
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <LottieView
          source={require("@assets/animations/logo-animation.json")}
          autoPlay
          loop={false}
          style={styles.logo}
        />
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, textStyle]}>LONCA</Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, textStyle]}>
        Profesyonel Ağınız
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 24,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
```

---

## 🎯 Onboarding Flow

### Hedef Tasarım

- 3-4 slide paginated onboarding
- Lottie animations per slide
- Skip ve Continue butonları
- Progress indicator
- Parallax effects

### Implementation

```typescript
// src/features/onboarding/screens/OnboardingScreen.tsx

import React, { memo, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolate,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useTheme } from "@theme";
import { ModernButton } from "@shared/components";

const { width, height } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  animation: any; // Lottie source
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Meslek Doğrulama",
    description:
      "AI destekli doğrulama sistemi ile gerçek profesyonellerle tanışın",
    animation: require("@assets/animations/verification.json"),
    backgroundColor: "#667eea",
  },
  {
    id: "2",
    title: "Güvenli Bağlantılar",
    description: "Sadece doğrulanmış meslektaşlarınızla iletişim kurun",
    animation: require("@assets/animations/connection.json"),
    backgroundColor: "#764ba2",
  },
  {
    id: "3",
    title: "Mesleki Ağ",
    description:
      "Sektörünüzdeki profesyonellerle değerli bağlantılar oluşturun",
    animation: require("@assets/animations/network.json"),
    backgroundColor: "#f093fb",
  },
  {
    id: "4",
    title: "Başlamaya Hazır",
    description: "Profesyonel ağınızı bugün oluşturmaya başlayın",
    animation: require("@assets/animations/ready.json"),
    backgroundColor: "#f5576c",
  },
];

export const OnboardingScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Handle viewable items change
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  // Navigate to next slide
  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Navigate to auth
      handleComplete();
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    // Navigate to auth directly
  }, []);

  const handleComplete = useCallback(() => {
    // Mark onboarding as complete and navigate
  }, []);

  // Render slide item
  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingSlide; index: number }) => (
      <OnboardingSlide slide={item} index={index} scrollX={scrollX} />
    ),
    []
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Slides */}
      <AnimatedFlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        {/* Page indicators */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PageIndicator key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLastSlide && (
            <ModernButton
              title="Atla"
              variant="ghost"
              onPress={handleSkip}
              style={styles.skipButton}
            />
          )}

          <ModernButton
            title={isLastSlide ? "Başla" : "İleri"}
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
};

// Individual slide component with parallax
interface OnboardingSlideProps {
  slide: OnboardingSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const OnboardingSlide = memo<OnboardingSlideProps>(
  ({ slide, index, scrollX }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    // Animation styles
    const animationStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.7, 1, 0.7],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolate.CLAMP
      );

      return { transform: [{ scale }], opacity };
    });

    const textStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        inputRange,
        [width * 0.3, 0, -width * 0.3],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolate.CLAMP
      );

      return { transform: [{ translateX }], opacity };
    });

    return (
      <View style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
        <Animated.View style={[styles.animationContainer, animationStyle]}>
          <LottieView
            source={slide.animation}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </View>
    );
  }
);

// Page indicator with animation
interface PageIndicatorProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const PageIndicator = memo<PageIndicatorProps>(({ index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  animationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 24,
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
});
```

---

## 🔐 Login/Register Screens

### Hedef Tasarım

- Animasyonlu form transitions
- Floating labels
- Password strength indicator
- Social login buttons
- Keyboard-aware layout

### Implementation

```typescript
// src/features/auth/screens/LoginScreen.tsx

import React, { memo, useCallback, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { ModernInput, ModernButton, PressableScale } from "@shared/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const passwordRef = useRef<RNTextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Login logic
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Hoş Geldiniz
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Hesabınıza giriş yapın
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          layout={Layout.springify()}
          style={styles.form}
        >
          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ModernInput
                label="E-posta"
                placeholder="ornek@meslektas.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                leftIcon="mail"
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <ModernInput
                ref={passwordRef}
                label="Şifre"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
                leftIcon="lock"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={styles.inputSpacing}
              />
            )}
          />

          {/* Forgot Password */}
          <PressableScale
            onPress={() => {
              /* Navigate */
            }}
            style={styles.forgotPassword}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                { color: colors.primary.main },
              ]}
            >
              Şifremi Unuttum
            </Text>
          </PressableScale>

          {/* Login Button */}
          <ModernButton
            title="Giriş Yap"
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            style={styles.loginButton}
          />
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.dividerContainer}
        >
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: colors.border.light },
            ]}
          />
          <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>
            veya
          </Text>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: colors.border.light },
            ]}
          />
        </Animated.View>

        {/* Social Login */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.socialButtons}
        >
          <SocialButton
            provider="google"
            onPress={() => {
              /* Google login */
            }}
          />
          <SocialButton
            provider="apple"
            onPress={() => {
              /* Apple login */
            }}
          />
        </Animated.View>

        {/* Register Link */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={styles.registerContainer}
        >
          <Text style={[styles.registerText, { color: colors.text.secondary }]}>
            Hesabınız yok mu?{" "}
          </Text>
          <PressableScale
            onPress={() => {
              /* Navigate */
            }}
          >
            <Text style={[styles.registerLink, { color: colors.primary.main }]}>
              Kayıt Olun
            </Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Social login button component
interface SocialButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
}

const SocialButton = memo<SocialButtonProps>(({ provider, onPress }) => {
  const { colors, isDark } = useTheme();

  const config = {
    google: {
      icon: "logo-google",
      label: "Google ile devam et",
      backgroundColor: "#FFFFFF",
      textColor: "#1F1F1F",
    },
    apple: {
      icon: "logo-apple",
      label: "Apple ile devam et",
      backgroundColor: isDark ? "#FFFFFF" : "#000000",
      textColor: isDark ? "#000000" : "#FFFFFF",
    },
  }[provider];

  return (
    <ModernButton
      title={config.label}
      variant="outlined"
      leftIcon={config.icon}
      onPress={onPress}
      style={[styles.socialButton, { backgroundColor: config.backgroundColor }]}
      textStyle={{ color: config.textColor }}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  inputSpacing: {
    marginTop: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    marginBottom: 12,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
```

---

## 📰 Feed Screen

```
Detaylı implementasyon için bakınız: 08-FEED-EXPERIENCE.md
```

---

## 📄 Post Detail Screen

### Hedef Tasarım

- Full-screen image/video viewer
- Animated comments section
- Like/share animations
- Gesture-based navigation
- Author profile quick view

### Implementation

```typescript
// src/features/feed/screens/PostDetailScreen.tsx

import React, { memo, useCallback, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  scheduleOnRN,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "@theme";
import {
  HeartAnimation,
  DoubleTapLike,
  ModernAvatar,
  ModernButton,
  CommentItem,
} from "@shared/components";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.5;

interface PostDetailScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
  navigation: any;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { postId } = route.params;
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollY = useSharedValue(0);
  const [post, setPost] = useState<any>(null); // Fetch post data
  const [isLiked, setIsLiked] = useState(false);

  // Scroll handler for parallax
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animated style
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  // Image parallax style
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT],
      [0, -IMAGE_HEIGHT * 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  // Handle double tap like
  const handleDoubleTapLike = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      // API call to like post
    }
  }, [isLiked]);

  // Handle comment button
  const handleOpenComments = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  // Close gesture for navigation
  const closeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (event.translationX > 100) {
        scheduleOnRN(navigation.goBack)();
      }
    });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated header */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top }, headerStyle]}
      >
        <BlurView
          intensity={90}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <ModernButton
            variant="ghost"
            leftIcon="arrow-back"
            onPress={() => navigation.goBack()}
          />
          <Text
            style={[styles.headerTitle, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {post?.author?.name || "Post"}
          </Text>
          <ModernButton
            variant="ghost"
            leftIcon="ellipsis-horizontal"
            onPress={() => {
              /* More options */
            }}
          />
        </View>
      </Animated.View>

      {/* Main content */}
      <GestureDetector gesture={closeGesture}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          {/* Image with double-tap like */}
          <DoubleTapLike isLiked={isLiked} onDoubleTap={handleDoubleTapLike}>
            <Animated.View style={[styles.imageContainer, imageStyle]}>
              <Image
                source={{ uri: post?.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </Animated.View>
          </DoubleTapLike>

          {/* Actions bar */}
          <View
            style={[
              styles.actionsBar,
              { backgroundColor: colors.surface.primary },
            ]}
          >
            <View style={styles.actionsLeft}>
              <HeartAnimation isLiked={isLiked} onLike={setIsLiked} size={28} />
              <ModernButton
                variant="ghost"
                leftIcon="chatbubble-outline"
                onPress={handleOpenComments}
                style={styles.actionButton}
              />
              <ModernButton
                variant="ghost"
                leftIcon="paper-plane-outline"
                onPress={() => {
                  /* Share */
                }}
                style={styles.actionButton}
              />
            </View>
            <ModernButton
              variant="ghost"
              leftIcon="bookmark-outline"
              onPress={() => {
                /* Save */
              }}
            />
          </View>

          {/* Likes count */}
          <Text style={[styles.likesCount, { color: colors.text.primary }]}>
            {post?.likesCount?.toLocaleString()} beğeni
          </Text>

          {/* Author and caption */}
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>
              <Text style={[styles.authorName, { color: colors.text.primary }]}>
                {post?.author?.username}{" "}
              </Text>
              <Text style={{ color: colors.text.secondary }}>
                {post?.caption}
              </Text>
            </Text>
          </View>

          {/* View comments link */}
          <PressableScale onPress={handleOpenComments}>
            <Text
              style={[styles.viewComments, { color: colors.text.tertiary }]}
            >
              {post?.commentsCount} yorumun tümünü gör
            </Text>
          </PressableScale>

          {/* Timestamp */}
          <Text style={[styles.timestamp, { color: colors.text.tertiary }]}>
            {post?.createdAt}
          </Text>
        </Animated.ScrollView>
      </GestureDetector>

      {/* Comments Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["50%", "90%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface.primary }}
        handleIndicatorStyle={{ backgroundColor: colors.border.medium }}
      >
        <View style={styles.commentsHeader}>
          <Text style={[styles.commentsTitle, { color: colors.text.primary }]}>
            Yorumlar
          </Text>
        </View>
        <BottomSheetFlatList
          data={post?.comments || []}
          renderItem={({ item }) => <CommentItem comment={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 44,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 16,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  authorName: {
    fontWeight: "600",
  },
  viewComments: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
```

---

## 👤 Profile Screen

### Hedef Tasarım

- Parallax header with avatar
- Animated stats counters
- Segmented content tabs
- Pull-to-refresh
- Edit mode transitions

```
Detaylı implementasyon için bakınız: 10-PROFILE-EXPERIENCE.md
```

---

## 🔍 Search Screen

### Hedef Tasarım

- Animated search bar focus
- Recent searches with swipe-to-delete
- Trending topics
- Category filters
- Result type tabs

### Implementation Outline

```typescript
// Key components:
// - AnimatedSearchBar with focus animation
// - RecentSearchesList with SwipeableRow
// - TrendingTopicsGrid with staggered animation
// - SearchResultsTabs with animated indicator
// - EmptySearchState with Lottie
```

---

## 🔔 Notifications Screen

### Hedef Tasarım

- Grouped notifications (Today, This Week, Earlier)
- Swipe actions (mark read, delete)
- Animated entry for new notifications
- Read/unread visual distinction
- Pull-to-refresh

### Implementation Outline

```typescript
// Key components:
// - NotificationGroup with section headers
// - NotificationItem with SwipeableRow
// - TimeBasedGrouping logic
// - AnimatedBadge for unread count
// - EmptyNotificationsState
```

---

## ⚙️ Settings Screen

### Hedef Tasarım

- Grouped settings sections
- Animated toggle switches
- Theme preview with live switch
- Logout confirmation with haptic
- Version info with easter egg

### Implementation Outline

```typescript
// Key components:
// - SettingsSection with collapsible headers
// - SettingsRow with AnimatedSwitch
// - ThemePicker with live preview
// - LogoutButton with confirmation modal
// - AppVersionInfo with tap counter
```

---

## ✅ Acceptance Criteria

### Her Ekran İçin

```
□ 60 FPS scroll performance
□ Animasyonlar spring physics kullanıyor
□ Haptic feedback uygun yerlerde
□ Dark mode tam uyumlu
□ RTL layout desteği
□ Accessibility labels ekli
□ Error states tanımlı
□ Loading states tanımlı
□ Empty states tanımlı
□ Pull-to-refresh (uygunsa)
□ Keyboard-aware layout
□ Safe area insets
```

---

Bu ekran tasarımları, LONCA uygulamasını Instagram/Happen kalitesine taşıyacak foundation'ı sağlar.
