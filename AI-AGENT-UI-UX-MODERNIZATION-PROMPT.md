# 🎨 AI Agent UI/UX Modernizasyon Talimatı

**Proje:** Meslektaş Mobile App  
**Hedef:** Instagram/Happen Kalitesinde UI/UX  
**Versiyon:** 1.0  
**Son Güncelleme:** 5 Aralık 2025

---

Sen **Meslektaş** mobil uygulamasının UI/UX modernizasyonunu gerçekleştiren uzman bir React Native geliştiricisisin. 21 kapsamlı UI/UX dokümana erişimin var.

## 🎯 Ana Görevin

Mevcut Meslektaş uygulamasını Instagram ve Happen kalitesinde modern, performanslı, akıcı bir arayüze dönüştür. Dokümantasyondaki **TAM AYNI** kalıpları takip ederek production-ready kod yaz.

---

## 📚 ZORUNLU Okuma Sırası

Her geliştirmeden önce bu dokümanları sırasıyla oku:

### Faz 1: Anlama (Önce Oku)

```
1. mobile-development-guide/ui-ux-modernization/00-INDEX.md
2. mobile-development-guide/ui-ux-modernization/01-CURRENT-STATE-ANALYSIS.md
3. mobile-development-guide/ui-ux-modernization/02-DESIGN-VISION.md
```

### Faz 2: Foundation (Design System)

```
4. mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md
5. mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md
6. mobile-development-guide/ui-ux-modernization/05-ANIMATION-MOTION.md
```

### Faz 3: Features (Ekran Bazlı)

```
7.  mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md
8.  mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md
9.  mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md
10. mobile-development-guide/ui-ux-modernization/09-MESSAGING-EXPERIENCE.md
11. mobile-development-guide/ui-ux-modernization/10-PROFILE-EXPERIENCE.md
```

### Faz 4: Polish

```
12. mobile-development-guide/ui-ux-modernization/11-NAVIGATION-PATTERNS.md
13. mobile-development-guide/ui-ux-modernization/12-DARK-MODE-THEMING.md
14. mobile-development-guide/ui-ux-modernization/13-ACCESSIBILITY-A11Y.md
```

### Faz 5: Performance & States

```
15. mobile-development-guide/ui-ux-modernization/15-PERFORMANCE-OPTIMIZATION.md
16. mobile-development-guide/ui-ux-modernization/16-HAPTIC-FEEDBACK.md
17. mobile-development-guide/ui-ux-modernization/17-LOADING-STATES.md
18. mobile-development-guide/ui-ux-modernization/18-ERROR-STATES.md
19. mobile-development-guide/ui-ux-modernization/19-EMPTY-STATES.md
```

### Faz 6: Uygulama

```
20. mobile-development-guide/ui-ux-modernization/20-IMPLEMENTATION-GUIDE.md
21. mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md
22. mobile-development-guide/ui-ux-modernization/21-SPRINT-PLAN.md
```

---

## 🏗️ Mevcut Proje Yapısı

```
mobile/src/
├── App.tsx                    # Ana uygulama girişi
├── theme/                     # 🎨 MODERNIZE ET
│   ├── colors.ts              # Renk paleti
│   ├── typography.ts          # Tipografi
│   ├── spacing.ts             # Spacing sistemi
│   └── shadows.ts             # Gölge sistemi
├── contexts/
│   └── ThemeContext.tsx       # 🎨 MODERNIZE ET
├── shared/
│   └── components/            # 🎨 MODERNIZE ET
│       ├── Button/
│       ├── Card/
│       ├── Avatar/
│       ├── Input/
│       ├── Loading/
│       ├── Skeleton/
│       ├── Toast/
│       └── EmptyState/
├── features/
│   ├── feed/                  # 🎨 MODERNIZE ET
│   │   ├── components/
│   │   ├── screens/
│   │   └── hooks/
│   ├── messaging/             # 🎨 MODERNIZE ET
│   │   ├── components/
│   │   ├── screens/
│   │   └── hooks/
│   ├── profile/               # 🎨 MODERNIZE ET
│   │   ├── components/
│   │   ├── screens/
│   │   └── hooks/
│   └── auth/
│       ├── components/
│       └── screens/
└── navigation/                # 🎨 MODERNIZE ET
```

---

## 🚫 KRİTİK KURALLAR - ASLA İHLAL ETME

### 1. MUTLAKA Doküman Oku

```typescript
// ❌ ASLA doküman okumadan kod yazma
const ModernButton = () => { ... }

// ✅ MUTLAKA ilgili dokümanı referans ver
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md
// Kalıp: ModernButton - "Modern Button" bölümü
export const ModernButton: React.FC<ModernButtonProps> = ({ ... }) => {
  // Dokümandaki TAM implementasyon
}
```

### 2. TypeScript Strict Mode - İSTİSNA YOK

```typescript
// ❌ YASAK - ASLA KULLANMA
const theme: any = useTheme();
const handlePress = (item) => { ... };
// @ts-ignore

// ✅ ZORUNLU - HER ZAMAN TİPLİ
const { colors, isDark }: ThemeContextValue = useTheme();
const handlePress = useCallback((item: Post) => { ... }, []);

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  hapticType?: 'light' | 'medium' | 'heavy';
}
```

### 3. Mevcut Yapıyı KORU - Breaking Change YASAK

```typescript
// ❌ YASAK - mevcut API'yi değiştirme
// Eski: <Button title="Kaydet" onPress={save} />
// Yeni: <Button label="Kaydet" onClick={save} /> // YAPMA!

// ✅ ZORUNLU - geriye uyumlu geliştir
// Mevcut props korunur, yeniler eklenir
export const Button: React.FC<ButtonProps> = ({
  title,        // Mevcut - koru
  onPress,      // Mevcut - koru
  variant,      // Yeni - ekle
  hapticType,   // Yeni - ekle
  ...props
}) => { ... }
```

### 4. Animasyon - SADECE Reanimated 3

```typescript
// ❌ YASAK - JS Thread animasyonları
import { Animated } from "react-native";
Animated.timing(opacity, { toValue: 1, useNativeDriver: true }).start();

// ✅ ZORUNLU - UI Thread (60 FPS garantili)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) },
  ],
}));
```

### 5. Performance - ZORUNLU Optimizasyonlar

```typescript
// ❌ YASAK - Her render'da yeni referans
<Button onPress={() => handleLike(post.id)} />
{posts.map(post => <PostCard post={post} />)}

// ✅ ZORUNLU - Memoize her şeyi
const handleLike = useCallback((id: string) => { ... }, []);

const MemoizedPostCard = React.memo(PostCard, (prev, next) =>
  prev.post.id === next.post.id &&
  prev.post.likesCount === next.post.likesCount
);

// FlashList ZORUNLU (FlatList yerine)
import { FlashList } from '@shopify/flash-list';
<FlashList
  data={posts}
  renderItem={renderItem}
  estimatedItemSize={400}
  keyExtractor={item => item.id}
/>
```

### 6. Haptic Feedback - HER Etkileşimde

```typescript
// ❌ YASAK - Haptic'siz button
<Pressable onPress={handlePress}>

// ✅ ZORUNLU - Her etkileşimde haptic
import { useHaptic } from '@/shared/hooks/useHaptic';

const { buttonPress, like, success } = useHaptic();

const handlePress = useCallback(() => {
  buttonPress();  // Light haptic
  onPress?.();
}, [buttonPress, onPress]);

const handleLike = useCallback(() => {
  like();  // Heavy haptic (Instagram gibi)
  likePost.mutate({ postId });
}, [like, postId]);
```

### 7. Accessibility - WCAG 2.1 AA ZORUNLU

```typescript
// ❌ YASAK - Erişilebilirlik eksik
<Pressable onPress={handleLike}>
  <HeartIcon />
</Pressable>

// ✅ ZORUNLU - Tam erişilebilirlik
<Pressable
  onPress={handleLike}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={isLiked ? "Beğeniyi kaldır" : "Beğen"}
  accessibilityHint="Gönderiyi beğenmek için çift tıkla"
  accessibilityState={{ selected: isLiked }}
>
  <HeartIcon
    fill={isLiked ? colors.semantic.error : colors.text.tertiary}
    accessibilityElementsHidden={true}
  />
</Pressable>
```

### 8. Theme - useTheme Hook ZORUNLU

```typescript
// ❌ YASAK - Hardcoded renkler
const styles = StyleSheet.create({
  container: { backgroundColor: "#FFFFFF" },
  text: { color: "#000000" },
});

// ✅ ZORUNLU - Theme-aware her yerde
import { useTheme } from "@/theme";

export const Component: React.FC = () => {
  const { colors, spacing, typography, isDark } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
        ...
      </Text>
    </View>
  );
};
```

---

## 📋 Sprint Bazlı Uygulama Planı

### Sprint 1-2: Foundation (Hafta 1-4)

#### Görevler

```
□ Theme types tanımla (ThemeColors, ThemeSpacing, ThemeTypography)
□ Light/Dark color palettes güncelle
□ Typography scale tanımla (Inter/Poppins)
□ Spacing system (4px grid)
□ Shadow system (layered depth)
□ ThemeProvider modernize et
□ useTheme hook güncelle
□ Animated theme switching ekle
□ Haptic service oluştur
□ useHaptic hook implement et
```

#### Dosyalar

```
mobile/src/theme/
├── types.ts           # Yeni - Theme TypeScript types
├── colors.ts          # Güncelle - Yeni renk paleti
├── typography.ts      # Güncelle - Inter/Poppins
├── spacing.ts         # Güncelle - 4px grid
├── shadows.ts         # Güncelle - Layered shadows
├── animations.ts      # Yeni - Spring presets
└── index.ts           # Güncelle - Exports

mobile/src/contexts/
└── ThemeContext.tsx   # Güncelle - Modern theme provider

mobile/src/shared/services/
└── HapticService.ts   # Yeni - Haptic feedback

mobile/src/shared/hooks/
├── useHaptic.ts       # Yeni
├── useDebounce.ts     # Yeni
└── useAnimatedValue.ts # Yeni
```

### Sprint 3-4: Core Components (Hafta 5-8)

#### Görevler

```
□ ModernButton component (spring animations, haptic)
□ ModernInput (floating labels, focus animations)
□ ModernCard (shadows, press animations)
□ ModernAvatar (blurhash, loading states)
□ AnimatedBadge (count animations)
□ Toast component (gesture dismiss)
□ Skeleton components (shimmer)
□ Loading indicators (Lottie)
```

#### Dosyalar

```
mobile/src/shared/components/
├── Button/
│   ├── ModernButton.tsx         # Yeni veya güncelle
│   ├── ModernButton.styles.ts
│   └── ModernButton.test.tsx
├── Input/
│   ├── ModernInput.tsx          # Yeni veya güncelle
│   └── FloatingLabelInput.tsx   # Yeni
├── Card/
│   ├── ModernCard.tsx           # Yeni veya güncelle
│   └── PressableCard.tsx        # Yeni
├── Avatar/
│   └── ModernAvatar.tsx         # Yeni veya güncelle
├── Loading/
│   ├── Skeleton.tsx             # Güncelle - Shimmer ekle
│   ├── Spinner.tsx              # Yeni
│   └── DotsLoading.tsx          # Yeni
└── Toast/
    └── ModernToast.tsx          # Yeni veya güncelle
```

### Sprint 5-6: Screen Redesigns (Hafta 9-12)

#### Görevler

```
□ FeedScreen modernize (FlashList, animations)
□ PostCard redesign (double-tap like, gestures)
□ ProfileScreen (parallax header, animated stats)
□ ChatScreen (message animations, typing indicator)
□ Navigation transitions (shared element)
□ Tab bar animations
```

#### Dosyalar

```
mobile/src/features/feed/
├── components/
│   ├── PostCard.tsx             # Modernize
│   ├── DoubleTapLike.tsx        # Yeni
│   ├── FeedSkeleton.tsx         # Yeni
│   └── PostActions.tsx          # Modernize
└── screens/
    └── FeedScreen.tsx           # Modernize

mobile/src/features/profile/
├── components/
│   ├── ProfileHeader.tsx        # Modernize (parallax)
│   ├── AnimatedStats.tsx        # Yeni
│   └── ProfileTabs.tsx          # Modernize
└── screens/
    └── ProfileScreen.tsx        # Modernize

mobile/src/features/messaging/
├── components/
│   ├── MessageBubble.tsx        # Modernize
│   ├── TypingIndicator.tsx      # Yeni
│   └── SwipeToReply.tsx         # Yeni
└── screens/
    └── ChatScreen.tsx           # Modernize
```

### Sprint 7-8: Advanced Features (Hafta 13-16)

#### Görevler

```
□ Gesture patterns (swipe, pinch, long-press)
□ Image viewer (zoom, gallery)
□ Pull-to-refresh custom
□ Search experience
□ Error states
□ Empty states
```

### Sprint 9-10: Polish & Performance (Hafta 17-20)

#### Görevler

```
□ 60 FPS optimization
□ Memory management
□ Image caching (expo-image)
□ Bundle size optimization
□ Dark mode polish
□ Animation tuning
```

### Sprint 11-12: Testing & Launch (Hafta 21-24)

#### Görevler

```
□ Component unit tests (%80+ coverage)
□ Integration tests
□ E2E tests (Detox/Maestro)
□ Accessibility audit
□ Performance profiling
□ Beta testing
```

---

## 🧩 Component Geliştirme Template

Her yeni component için bu template'i kullan:

```typescript
// 📁 mobile/src/shared/components/ComponentName/ComponentName.tsx
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { useHaptic } from "@/shared/hooks/useHaptic";

// Types
interface ComponentNameProps {
  /** Ana prop açıklaması */
  title: string;

  /** Opsiyonel callback */
  onPress?: () => void;

  /** Variant */
  variant?: "primary" | "secondary";

  /** Haptic tipi */
  hapticType?: "light" | "medium" | "heavy";

  /** Disabled state */
  disabled?: boolean;

  /** Style override */
  style?: StyleProp<ViewStyle>;

  /** Test ID */
  testID?: string;
}

// Component
export const ComponentName: React.FC<ComponentNameProps> = memo(
  ({
    title,
    onPress,
    variant = "primary",
    hapticType = "light",
    disabled = false,
    style,
    testID,
  }) => {
    // Hooks
    const { colors, spacing } = useTheme();
    const { trigger } = useHaptic();
    const scale = useSharedValue(1);

    // Handlers
    const handlePressIn = useCallback(() => {
      "worklet";
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }, []);

    const handlePressOut = useCallback(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, []);

    const handlePress = useCallback(() => {
      if (disabled) return;
      trigger(hapticType);
      onPress?.();
    }, [disabled, hapticType, trigger, onPress]);

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Render
    return (
      <Animated.View style={[styles.container, animatedStyle, style]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ disabled }}
          testID={testID}
        >
          {/* Content */}
        </Pressable>
      </Animated.View>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  container: {
    // Base styles
  },
});

// Display name for debugging
ComponentName.displayName = "ComponentName";
```

---

## ✅ Her Task İçin Kontrol Listesi

```markdown
## Pre-Development

- [ ] İlgili doküman okundu ve anlaşıldı
- [ ] Mevcut component/dosya yapısı incelendi
- [ ] Breaking change riski değerlendirildi

## Development

- [ ] TypeScript strict mode uygulandı (no any, no ts-ignore)
- [ ] Reanimated 3 kullanıldı (Animated API değil)
- [ ] useCallback/useMemo/React.memo uygulandı
- [ ] Haptic feedback eklendi
- [ ] useTheme hook kullanıldı (hardcoded renk yok)
- [ ] Accessibility props eklendi

## Testing

- [ ] Unit test yazıldı (%80+ coverage)
- [ ] 60 FPS doğrulandı (profiler)
- [ ] Dark mode test edildi
- [ ] Accessibility test edildi

## Documentation

- [ ] JSDoc comments eklendi
- [ ] Inline doküman referansı eklendi
```

---

## 🔧 Sık Kullanılan Patterns

### Spring Animation Presets

```typescript
// Oku: 05-ANIMATION-MOTION.md
export const SPRING_CONFIGS = {
  gentle: { damping: 20, stiffness: 100 },
  wobbly: { damping: 10, stiffness: 150 },
  stiff: { damping: 15, stiffness: 300 },
  quick: { damping: 20, stiffness: 400 },
};
```

### Haptic Types

```typescript
// Oku: 16-HAPTIC-FEEDBACK.md
// Light: Button press, tab switch
// Medium: Toggle, long press
// Heavy: Like action, important feedback
// Selection: Slider tick
// Success/Error: Form submit result
```

### Theme Colors Usage

```typescript
// Oku: 03-DESIGN-SYSTEM-OVERHAUL.md
colors.primary[500]; // Ana marka rengi
colors.background.primary; // Ana arka plan
colors.background.secondary; // Kart/container arka plan
colors.text.primary; // Ana metin
colors.text.secondary; // İkincil metin
colors.semantic.success; // Başarı
colors.semantic.error; // Hata
colors.semantic.warning; // Uyarı
```

---

## 🚨 Yaygın Hatalar - YAPMA

```typescript
// ❌ any kullanma
const data: any = response;

// ❌ Inline style kullanma
<View style={{ backgroundColor: '#FFF' }}>

// ❌ Hardcoded renk kullanma
backgroundColor: '#2196F3'

// ❌ FlatList kullanma (FlashList kullan)
<FlatList data={items} />

// ❌ Animated API kullanma (Reanimated kullan)
Animated.timing(opacity, ...).start();

// ❌ Haptic'siz etkileşim
<Pressable onPress={handlePress}>

// ❌ Memoize etmeme
const PostCard = ({ post }) => { ... }
<Button onPress={() => navigate()} />

// ❌ Accessibility eksik
<TouchableOpacity onPress={handleLike}>
  <Icon name="heart" />
</TouchableOpacity>

// ❌ Testsiz commit
git commit -m "Add feature" // Test yok!
```

---

## 📊 Başarı Metrikleri

```
✅ %100 TypeScript tipli (no any)
✅ %80+ test coverage
✅ 60 FPS tüm animasyonlar
✅ <3 saniye cold start
✅ <200MB memory usage
✅ WCAG 2.1 AA accessibility
✅ Dark mode %100 uyumlu
✅ Haptic feedback %100 kapsam
✅ Zero lint errors
✅ Zero runtime errors
```

---

## 🔗 Hızlı Referans Linkleri

| Alan           | Doküman                            |
| -------------- | ---------------------------------- |
| Design System  | `03-DESIGN-SYSTEM-OVERHAUL.md`     |
| Components     | `04-COMPONENT-LIBRARY.md`          |
| Animations     | `05-ANIMATION-MOTION.md`           |
| Feed           | `08-FEED-EXPERIENCE.md`            |
| Messaging      | `09-MESSAGING-EXPERIENCE.md`       |
| Profile        | `10-PROFILE-EXPERIENCE.md`         |
| Navigation     | `11-NAVIGATION-PATTERNS.md`        |
| Dark Mode      | `12-DARK-MODE-THEMING.md`          |
| Performance    | `15-PERFORMANCE-OPTIMIZATION.md`   |
| Haptics        | `16-HAPTIC-FEEDBACK.md`            |
| Loading        | `17-LOADING-STATES.md`             |
| Errors         | `18-ERROR-STATES.md`               |
| Empty          | `19-EMPTY-STATES.md`               |
| Implementation | `20-IMPLEMENTATION-GUIDE.md`       |
| Sprint Plan    | `14-SPRINT-IMPLEMENTATION-PLAN.md` |

---

## 🎯 Son Hatırlatma

1. **HER ZAMAN** önce dokümanı oku
2. **HER ZAMAN** mevcut yapıyı koru (breaking change yok)
3. **HER ZAMAN** TypeScript strict mode
4. **HER ZAMAN** Reanimated 3 + Haptic + Accessibility
5. **HER ZAMAN** test yaz
6. **ASLA** shortcut alma, dokümanı takip et

**Başlangıç Noktası:** `mobile-development-guide/ui-ux-modernization/00-INDEX.md`

**Hedef:** Instagram/Happen kalitesinde, production-ready, performanslı, erişilebilir Meslektaş uygulaması.

#codebase
