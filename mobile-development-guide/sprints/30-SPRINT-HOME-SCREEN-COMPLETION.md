# Sprint: Home Screen Completion - Missing Components

**Sprint Adı:** Home Screen Completion  
**Doküman Versiyonu:** 1.0  
**Sprint Süresi:** 2 hafta (10 iş günü)  
**Hedef:** MOBILE-APP-HOME-SCREEN.md'deki eksik kritik componentlerin production-ready implementasyonu  
**Başlangıç Analizi:** MOBILE-HOME-SCREEN-IMPLEMENTATION-ANALYSIS.md  
**Mevcut Durum:** %65 tamamlanmış - %35 eksik

---

## 📑 İçindekiler

1. [Sprint Overview](#sprint-overview)
2. [Definition of Done](#definition-of-done)
3. [Week 1: Empty State & Special Cards](#week-1-empty-state--special-cards)
4. [Week 2: Feed Integration & Header Enhancement](#week-2-feed-integration--header-enhancement)
5. [Technical Architecture](#technical-architecture)
6. [Testing Strategy](#testing-strategy)
7. [File Structure](#file-structure)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Risk Management](#risk-management)

---

## 🎯 Sprint Overview

### Sprint Goals

✅ **Production-Ready Components:** Tüm componentler clean, maintainable, test-covered  
✅ **Documentation Compliance:** MOBILE-APP-HOME-SCREEN.md v2.0'a %100 uyum  
✅ **Modern UX:** Instagram-style design patterns, haptic feedback, animations  
✅ **Accessibility:** WCAG 2.1 AA compliance  
✅ **Performance:** 60 FPS, optimized renders, proper memoization

### Sprint Scope

#### ✅ In Scope

- ✅ 8 critical components (P0 + P1 priority)
- ✅ FeedScreen integration
- ✅ FeedHeader enhancement
- ✅ Comprehensive unit tests (%70+ coverage)
- ✅ Component tests (React Testing Library)
- ✅ Documentation updates

#### ❌ Out of Scope

- ❌ Challenge/Activity screen (future sprint)
- ❌ Backend Challenge API (future sprint)
- ❌ Gamification system (future sprint)
- ❌ AI backend service (mock data ile başla)

### Key Metrics

| Metric                    | Current | Target | Delta |
| ------------------------- | ------- | ------ | ----- |
| Component Coverage        | %65     | %95    | +%30  |
| Empty State Management    | %20     | %100   | +%80  |
| Special Cards             | %0      | %100   | +%100 |
| FeedHeader Completeness   | %50     | %100   | +%50  |
| Overall Documentation Fit | %65     | %95    | +%30  |

---

## ✅ Definition of Done

### Per Component

- [ ] **Code Quality**
  - [ ] TypeScript strict mode - no `any` types
  - [ ] ESLint passes with no warnings
  - [ ] Prettier formatted
  - [ ] No console.log statements
  - [ ] Proper error handling
- [ ] **Testing**
  - [ ] Unit tests written (>%70 coverage)
  - [ ] Component tests (React Testing Library)
  - [ ] Snapshot tests for UI consistency
  - [ ] All tests passing
- [ ] **Accessibility**
  - [ ] accessibilityLabel on all interactive elements
  - [ ] accessibilityRole defined
  - [ ] Color contrast ratio >4.5:1
  - [ ] Keyboard navigation support
- [ ] **Performance**
  - [ ] useCallback for event handlers
  - [ ] useMemo for expensive computations
  - [ ] React.memo for component memoization
  - [ ] No unnecessary re-renders
- [ ] **UX/Design**
  - [ ] Haptic feedback on interactions
  - [ ] Reanimated animations (spring config)
  - [ ] Dark mode support
  - [ ] Loading states
  - [ ] Error states
- [ ] **Documentation**
  - [ ] JSDoc comments
  - [ ] Props interface documented
  - [ ] Usage examples in comments
  - [ ] README.md updated (if needed)

### Per Sprint

- [ ] All 8 components implemented
- [ ] FeedScreen integration complete
- [ ] FeedHeader enhancement complete
- [ ] Test coverage >%70
- [ ] No regressions in existing features
- [ ] Code review completed
- [ ] Documentation updated
- [ ] PR approved and merged

---

## 📅 Week 1: Empty State & Special Cards

### Day 1-2: Verification & AI Cards

#### User Story 1.1: VerificationPromptCard

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 759-795  
**Priority:** P0 - Critical

**Açıklama:**  
Kullanıcı doğrulanmamışsa, feed başlangıcında gradient card ile doğrulamaya teşvik edilir.

**Kabul Kriterleri:**

```
✅ Conditional rendering: user.isVerified === false
✅ Gradient background: Primary → Secondary
✅ Icon: 🎓 (school icon, 32px)
✅ Title: "Mesleğini Doğrula"
✅ Subtitle: "Uzman rozeti kazan ve topluluğa güvenilir üye olarak katıl."
✅ CTA button: "Doğrulamaya Başla"
✅ Button navigates to verification screen
✅ Haptic feedback on button press (medium)
✅ Spring animation on mount (FadeIn + SlideInUp)
✅ Accessibility: Full screen reader support
```

**Teknik Detaylar:**

```typescript
// Props
interface VerificationPromptCardProps {
  onPress: () => void;
  testID?: string;
}

// State
- useAuthStore: user.isVerified kontrolü
- useNavigation: VerificationScreen'e navigate

// Design
- Gradient: colors.gradients.primary
- Border radius: 16px
- Padding: 20px vertical, 16px horizontal
- Icon size: 32px
- Title: 18px, semibold
- Subtitle: 14px, regular
- Button: Primary style, full width

// Animation
- FadeIn (duration: 400ms)
- SlideInUp (distance: 20px)
- Spring config: snappy
```

**Dosyalar:**

```
mobile/src/features/feed/components/VerificationPromptCard/
├── index.ts
├── VerificationPromptCard.tsx
├── VerificationPromptCard.styles.ts
├── VerificationPromptCard.types.ts
└── __tests__/
    └── VerificationPromptCard.test.tsx
```

**Test Scenarios:**

```typescript
describe("VerificationPromptCard", () => {
  it("renders correctly when user is not verified");
  it("does not render when user is verified");
  it("navigates to verification screen on press");
  it("triggers haptic feedback on press");
  it("displays correct icon, title, subtitle");
  it("applies gradient background correctly");
  it("has proper accessibility labels");
  it("animates on mount");
});
```

---

#### User Story 1.2: AITrendInsightCard

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 797-810  
**Priority:** P0 - Critical

**Açıklama:**  
Feed başlangıcında AI-powered trend insights gösterilir (mock data ile başla).

**Kabul Kriterleri:**

```
✅ Her zaman görünür (feed boş/dolu farketmez)
✅ Profession-based trends (user.profession)
✅ Icon: 💡 (bulb-outline, 28px)
✅ Title: "Bu Hafta [Meslek]'de Trend"
✅ 3 trend item listelenir
✅ "Daha Fazla Gör" button
✅ Haptic feedback on item press (light)
✅ Spring animation on mount
✅ Mock data (future: backend AI service)
```

**Teknik Detaylar:**

```typescript
// Props
interface AITrendInsightCardProps {
  profession?: string;
  onTrendPress?: (trendId: string) => void;
  onMorePress?: () => void;
  testID?: string;
}

// Mock Data
const MOCK_TRENDS: Record<string, string[]> = {
  MEDICAL: [
    'Telemedicine 2025 Trends',
    'AI Diagnosis Systems',
    'Patient Data Privacy Laws',
  ],
  LEGAL: [
    'New Labor Law Changes',
    'Digital Evidence Guidelines',
    'Remote Court Sessions',
  ],
  // ... diğer meslekler
};

// Design
- Card background: colors.background.card
- Border: 1px, colors.border.default
- Border radius: 12px
- Icon: colors.interactive.default
- Title: 16px, semibold
- Trend items: 14px, regular
- "Daha Fazla Gör": 14px, colors.interactive.default

// Animation
- FadeIn (duration: 400ms, delay: 100ms)
- Each trend item: stagger animation (50ms delay)
```

**Dosyalar:**

```
mobile/src/features/feed/components/AITrendInsightCard/
├── index.ts
├── AITrendInsightCard.tsx
├── AITrendInsightCard.styles.ts
├── AITrendInsightCard.types.ts
├── mockTrends.ts
└── __tests__/
    └── AITrendInsightCard.test.tsx
```

**Test Scenarios:**

```typescript
describe("AITrendInsightCard", () => {
  it("renders correctly with mock trends");
  it("displays profession-specific trends");
  it("shows 3 trend items maximum");
  it("calls onTrendPress when trend item pressed");
  it('calls onMorePress when "Daha Fazla Gör" pressed');
  it("triggers haptic feedback on interactions");
  it("has proper accessibility for screen readers");
  it("animates with stagger effect");
});
```

---

### Day 3-4: Empty State Variants

#### User Story 1.3: NewUserEmptyState

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 1582-1607  
**Priority:** P0 - Critical

**Açıklama:**  
Yeni kullanıcılar için onboarding checklist ve gamification elements.

**Kabul Kriterleri:**

```
✅ Conditional: user.isNew === true (account age < 7 days)
✅ Onboarding checklist (4 items)
  - ✅ Profil fotoğrafı ekle
  - ✅ Bio yaz
  - ✅ 5 kişiyi takip et
  - ✅ İlk gönderiyi paylaş
✅ Progress bar (completed / total)
✅ Gamification: XP kazanımı göster
✅ CTA button: "Profilimi Tamamla"
✅ Motivational copy
✅ Haptic feedback on checklist item completion (success)
```

**Teknik Detaylar:**

```typescript
// Props
interface NewUserEmptyStateProps {
  user: User;
  onCompleteProfile: () => void;
  testID?: string;
}

// Checklist Items
interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  icon: string;
  xp: number;
}

const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  { id: 'avatar', label: 'Profil fotoğrafı ekle', isCompleted: false, icon: 'image', xp: 10 },
  { id: 'bio', label: 'Bio yaz', isCompleted: false, icon: 'create', xp: 10 },
  { id: 'follow', label: '5 kişiyi takip et', isCompleted: false, icon: 'people', xp: 20 },
  { id: 'post', label: 'İlk gönderiyi paylaş', isCompleted: false, icon: 'add-circle', xp: 30 },
];

// Design
- Empty state icon: rocket-outline (80px)
- Title: "Hoş Geldin!" (24px, bold)
- Subtitle: "Topluluğa katılmak için birkaç adım kaldı"
- Checklist item: checkmark icon (green if completed)
- Progress bar: linear, colors.interactive.default
- CTA button: Primary style
```

**Dosyalar:**

```
mobile/src/features/feed/components/EmptyFeed/
├── NewUserEmptyState.tsx
├── NewUserEmptyState.styles.ts
├── NewUserEmptyState.types.ts
└── __tests__/
    └── NewUserEmptyState.test.tsx
```

---

#### User Story 1.4: NoFollowingEmptyState

**Story Points:** 3  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 1609-1632  
**Priority:** P0 - Critical

**Kabul Kriterleri:**

```
✅ Conditional: user.followingCount === 0
✅ Icon: people-outline (80px)
✅ Title: "Henüz Kimseyi Takip Etmiyorsun"
✅ Subtitle: "Uzmanları keşfet, ilgi alanlarına göre kişileri takip et"
✅ Suggested experts preview (3 expert cards)
✅ CTA button: "Uzmanları Keşfet"
✅ Button navigates to discover screen
```

---

#### User Story 1.5: NoPostsEmptyState

**Story Points:** 3  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 1634-1657  
**Priority:** P0 - Critical

**Kabul Kriterleri:**

```
✅ Conditional: posts.length === 0 && user.followingCount > 0
✅ Icon: newspaper-outline (80px)
✅ Title: "Takip Ettiklerin Henüz Gönderi Paylaşmadı"
✅ Subtitle: "AI-powered önerilerle ilginizi çekebilecek içerikleri keşfedin"
✅ AI seed content (3 suggested posts - mock data)
✅ Trend cards (2 trending topics)
✅ CTA button: "Trendleri Keşfet"
```

---

### Day 5: SuggestedExpertsCarousel

#### User Story 1.6: SuggestedExpertsCarousel

**Story Points:** 8  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 419, 1971-1987  
**Priority:** P0 - Critical

**Açıklama:**  
Feed içinde her 5 postta bir horizontal scrollable expert carousel gösterilir.

**Kabul Kriterleri:**

```
✅ Her 5 postta bir görünür (index % 5 === 0)
✅ Horizontal ScrollView (snap to interval)
✅ Expert card design
  - Avatar (60px)
  - Full name
  - Profession
  - Verified badge (if verified)
  - Follow/Following button
✅ 5-10 suggested experts
✅ Follow/Unfollow interaction (optimistic update)
✅ Haptic feedback on follow button (medium)
✅ Card press navigates to profile
✅ Backend API: GET /api/users/suggested (mock data ile başla)
```

**Teknik Detaylar:**

```typescript
// Props
interface SuggestedExpertsCarouselProps {
  onExpertPress: (userId: number) => void;
  onFollowToggle: (userId: number, isFollowing: boolean) => void;
  testID?: string;
}

// Expert Card
interface ExpertCardProps {
  expert: SuggestedExpert;
  onPress: () => void;
  onFollowPress: () => void;
}

interface SuggestedExpert {
  id: number;
  fullName: string;
  profession: string;
  avatarUrl?: string;
  isVerified: boolean;
  isFollowing: boolean;
  followerCount: number;
}

// Design
- Carousel height: 140px
- Card width: 120px
- Card spacing: 12px
- Snap to interval: 132px (120 + 12)
- Card border radius: 12px
- Avatar: 60px circle
- Name: 14px, semibold, 2 lines
- Profession: 12px, regular, 1 line
- Follow button: 32px height, rounded

// Mock Data (future: backend API)
const MOCK_SUGGESTED_EXPERTS: SuggestedExpert[] = [...];

// Animation
- Carousel horizontal scroll (smooth)
- Follow button: scale animation on press
```

**Dosyalar:**

```
mobile/src/features/feed/components/SuggestedExpertsCarousel/
├── index.ts
├── SuggestedExpertsCarousel.tsx
├── ExpertCard.tsx
├── SuggestedExpertsCarousel.styles.ts
├── ExpertCard.styles.ts
├── SuggestedExpertsCarousel.types.ts
├── mockExperts.ts
└── __tests__/
    ├── SuggestedExpertsCarousel.test.tsx
    └── ExpertCard.test.tsx
```

**Test Scenarios:**

```typescript
describe("SuggestedExpertsCarousel", () => {
  it("renders horizontal scroll view with experts");
  it("displays 5-10 suggested experts");
  it("expert card shows avatar, name, profession");
  it("displays verified badge for verified users");
  it("calls onExpertPress when card pressed");
  it("calls onFollowToggle when follow button pressed");
  it("optimistically updates follow state");
  it("triggers haptic feedback on follow");
  it("has proper accessibility labels");
  it("scrolls smoothly with snap to interval");
});

describe("ExpertCard", () => {
  it("renders expert information correctly");
  it("displays follow button with correct state");
  it('shows "Takip Et" when not following');
  it('shows "Takiptesin" when following');
  it("animates on press");
});
```

---

## 📅 Week 2: Feed Integration & Header Enhancement

### Day 6-7: FeedScreen Integration

#### User Story 2.1: FeedScreen ListHeaderComponent Update

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 1989-2003  
**Priority:** P0 - Critical

**Açıklama:**  
FeedScreen'in ListHeaderComponent'inde VerificationPromptCard ve AITrendInsightCard entegrasyonu.

**Kabul Kriterleri:**

```
✅ FeedScreen.tsx güncelle
✅ ListHeaderComponent içine ekle:
  - VerificationPromptCard (conditional: !isVerified)
  - AITrendInsightCard (always visible)
  - FeedHeader (existing - değişiklik yok)
✅ useMemo ile proper memoization
✅ Component sırası doküman spesifikasyonuna uygun
✅ No performance regression (60 FPS maintained)
```

**Teknik Detaylar:**

```typescript
// FeedScreen.tsx update
const ListHeaderComponent = useMemo(
  () => (
    <>
      <FeedHeader onCreatePress={handleCreatePress} />
      {!isVerified && (
        <VerificationPromptCard onPress={handleVerificationPress} />
      )}
      <AITrendInsightCard
        profession={user?.profession?.name}
        onTrendPress={handleTrendPress}
        onMorePress={handleMoreTrendsPress}
      />
    </>
  ),
  [
    isVerified,
    user?.profession?.name,
    handleCreatePress,
    handleVerificationPress,
    handleTrendPress,
    handleMoreTrendsPress,
  ]
);
```

**Test Updates:**

```typescript
// FeedScreen.test.tsx
describe("FeedScreen ListHeaderComponent", () => {
  it("renders FeedHeader");
  it("renders VerificationPromptCard when user not verified");
  it("does not render VerificationPromptCard when user verified");
  it("always renders AITrendInsightCard");
  it("passes correct props to components");
  it("maintains 60 FPS performance");
});
```

---

#### User Story 2.2: FeedScreen renderPost Update

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 1971-1987  
**Priority:** P0 - Critical

**Açıklama:**  
Her 5 postta bir SuggestedExpertsCarousel gösterilmesi.

**Kabul Kriterleri:**

```
✅ renderPost callback güncelle
✅ Her 5 postta bir carousel ekle (index > 0 && index % 5 === 0)
✅ FlashList itemType ile proper recycling
✅ Carousel above post (not below)
✅ useCallback ile proper memoization
✅ No performance regression
```

**Teknik Detaylar:**

```typescript
// FeedScreen.tsx renderPost update
const renderPost = useCallback(
  ({ item, index }: ListRenderItemInfo<Post>) => {
    // Her 5 postta bir SuggestedExpertsCarousel ekle
    if (index > 0 && index % 5 === 0) {
      return (
        <>
          <SuggestedExpertsCarousel
            onExpertPress={handleExpertPress}
            onFollowToggle={handleFollowToggle}
          />
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onMenuPress={handleMenuPress}
          />
        </>
      );
    }

    return (
      <PostCard
        post={item}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
        onMenuPress={handleMenuPress}
      />
    );
  },
  [
    handleLike,
    handleComment,
    handleShare,
    handleBookmark,
    handleMenuPress,
    handleExpertPress,
    handleFollowToggle,
  ]
);

// FlashList itemType for proper recycling
const getItemType = useCallback((item: Post, index: number) => {
  if (index > 0 && index % 5 === 0) {
    return "postWithCarousel";
  }
  return "post";
}, []);
```

**Test Updates:**

```typescript
describe("FeedScreen renderPost", () => {
  it("renders PostCard for regular posts");
  it("renders SuggestedExpertsCarousel every 5th post");
  it("does not render carousel for first post");
  it("carousel appears above post, not below");
  it("maintains correct FlashList itemType");
  it("maintains 60 FPS with carousel");
});
```

---

### Day 8-9: FeedHeader Enhancement

#### User Story 2.3: FeedHeader Profession Icon

**Story Points:** 5  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 600-758  
**Priority:** P1 - High

**Açıklama:**  
FeedHeader'a sol tarafta dinamik meslek ikonu eklenmesi.

**Kabul Kriterleri:**

```
✅ Sol: Profession icon (dynamic, colorful)
✅ 8 meslek kategorisi için icon mapping
  - MEDICAL: medical (🏥 Yeşil #4CAF50)
  - LEGAL: scale (⚖️ Mavi #2196F3)
  - ENGINEERING: construct (🔧 Turuncu #FF9800)
  - EDUCATION: school (🎓 Mor #9C27B0)
  - SERVICE: briefcase (💼 Cyan #00BCD4)
  - CREATIVE: color-palette (🎨 Pembe #E91E63)
  - BUSINESS: trending-up (📈 Gri #607D8B)
  - OTHER: people (👥 Açık Gri #9E9E9E)
✅ Icon size: 24px
✅ Tıklanabilir (navigate to profession detail)
✅ Haptic feedback on press (light)
✅ Tooltip on long press (profession name)
```

**Teknik Detaylar:**

```typescript
// FeedHeader.types.ts update
export interface FeedHeaderProps {
  onCreatePress?: () => void;
  profession?: {
    name: string;
    category: ProfessionCategory;
  };
  onProfessionPress?: () => void;
  testID?: string;
}

// Profession icon mapping
const PROFESSION_ICONS: Record<ProfessionCategory, string> = {
  MEDICAL: "medical",
  LEGAL: "scale",
  ENGINEERING: "construct",
  EDUCATION: "school",
  SERVICE: "briefcase",
  CREATIVE: "color-palette",
  BUSINESS: "trending-up",
  OTHER: "people",
};

const PROFESSION_COLORS: Record<ProfessionCategory, string> = {
  MEDICAL: "#4CAF50",
  LEGAL: "#2196F3",
  ENGINEERING: "#FF9800",
  EDUCATION: "#9C27B0",
  SERVICE: "#00BCD4",
  CREATIVE: "#E91E63",
  BUSINESS: "#607D8B",
  OTHER: "#9E9E9E",
};

// Component
<Pressable
  style={styles.professionIconContainer}
  onPress={handleProfessionPress}
  onLongPress={handleProfessionLongPress}
  accessibilityLabel={`${profession.name} detaylarını gör`}
  accessibilityRole="button"
>
  <Icon name={professionIcon} size={24} color={professionColor} />
</Pressable>;
```

**Dosyalar (New):**

```
mobile/src/features/feed/components/FeedHeader/
├── ProfessionIcon.tsx          # ❌ NEW
├── ProfessionIcon.styles.ts    # ❌ NEW
└── professionConfig.ts         # ❌ NEW (icon/color mapping)
```

---

#### User Story 2.4: FeedHeader Notification Badge

**Story Points:** 3  
**Doküman Referans:** MOBILE-APP-HOME-SCREEN.md Lines 742-758  
**Priority:** P1 - High

**Açıklama:**  
FeedHeader'ın sağ tarafındaki bildirim ikonuna badge eklenmesi.

**Kabul Kriterleri:**

```
✅ Notification bell icon (right side)
✅ Badge görünümü:
  - Okunmamış bildirim yoksa: notifications-outline (boş)
  - Okunmamış bildirim varsa: notifications (dolu) + kırmızı badge
✅ Badge sayısı:
  - 1-9: Tam sayı göster
  - 10+: "9+" göster
✅ Badge position: Absolute (top-right corner)
✅ Badge size: 18px circle
✅ Badge text: 10px, semibold, white
✅ Navigate to notifications screen on press
✅ Haptic feedback on press (light)
```

**Teknik Detaylar:**

```typescript
// FeedHeader.types.ts update
export interface FeedHeaderProps {
  // ... existing props
  unreadNotifications?: number;
  onNotificationPress?: () => void;
}

// Component
<Pressable
  style={styles.notificationButton}
  onPress={handleNotificationPress}
  accessibilityLabel={`Bildirimler ${
    unreadNotifications > 0 ? `, ${unreadNotifications} okunmamış` : ""
  }`}
  accessibilityRole="button"
>
  <Icon
    name={unreadNotifications > 0 ? "notifications" : "notifications-outline"}
    size={24}
    color={colors.text.primary}
  />
  {unreadNotifications > 0 && (
    <View style={[styles.badge, { backgroundColor: colors.error.main }]}>
      <Text style={[styles.badgeText, { color: colors.text.inverse }]}>
        {unreadNotifications > 9 ? "9+" : unreadNotifications}
      </Text>
    </View>
  )}
</Pressable>;
```

**Styles:**

```typescript
badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  width: 18,
  height: 18,
  borderRadius: 9,
  justifyContent: 'center',
  alignItems: 'center',
},
badgeText: {
  fontSize: 10,
  fontWeight: '600',
  lineHeight: 12,
},
```

---

### Day 10: Polish & Testing

#### User Story 2.5: Integration Testing & Polish

**Story Points:** 5  
**Priority:** P0 - Critical

**Kabul Kriterleri:**

```
✅ All component tests passing
✅ Integration tests for FeedScreen
✅ E2E smoke tests
✅ Performance testing (60 FPS maintained)
✅ Accessibility audit
✅ Dark mode verification
✅ Code review completed
✅ Documentation updated
```

**Tasks:**

```
1. Run full test suite
2. Fix any failing tests
3. Performance profiling (React DevTools Profiler)
4. Accessibility testing (screen reader)
5. Dark mode visual QA
6. Update README.md
7. Create PR with comprehensive description
8. Request code review
```

---

## 🏗️ Technical Architecture

### Component Hierarchy

```
FeedScreen
├── ListHeaderComponent
│   ├── FeedHeader
│   │   ├── ProfessionIcon (NEW)
│   │   ├── FilterChips (EXISTING)
│   │   ├── CreateButton (EXISTING)
│   │   └── NotificationBell (ENHANCED - with badge)
│   ├── VerificationPromptCard (NEW - conditional)
│   └── AITrendInsightCard (NEW - always visible)
└── FlashList
    ├── PostCard (every item)
    └── SuggestedExpertsCarousel (every 5th item - NEW)
        └── ExpertCard (5-10 items)
```

### State Management

```typescript
// Auth Store (existing - Zustand)
useAuthStore:
  - user: User
  - isVerified: boolean

// Feed Store (existing - Zustand)
useFeedStore:
  - activeFilter: FeedFilter
  - setActiveFilter: (filter: FeedFilter) => void

// Notifications Store (NEW - Zustand)
useNotificationStore:
  - unreadCount: number
  - notifications: Notification[]
  - fetchUnreadCount: () => Promise<void>
  - markAsRead: (id: number) => Promise<void>

// Follow Store (existing - React Query)
useFollowMutation:
  - mutate: (userId: number) => Promise<void>
  - Optimistic updates
```

### API Integration

```typescript
// Existing
GET  /api/feed
GET  /api/feed/trending
POST /api/posts/{id}/like
POST /api/posts/{id}/bookmark

// NEW (Mock için - future: backend)
GET  /api/users/suggested        // SuggestedExpertsCarousel
GET  /api/trends/profession/:id  // AITrendInsightCard (mock data şimdilik)
GET  /api/notifications/unread   // FeedHeader badge

// Future Sprint (out of scope)
GET  /api/challenges
GET  /api/achievements
```

### Performance Optimization

```typescript
// Memoization
- useMemo: ListHeaderComponent, computed values
- useCallback: All event handlers
- React.memo: All components

// FlashList Optimization
- estimatedItemSize: 400 (PostCard average height)
- getItemType: Proper recycling for carousel items
- keyExtractor: Unique keys (post.id)

// Image Optimization
- expo-image: FastImage with cache
- blurhash: Placeholder for smooth loading

// Animation
- Reanimated: Smooth 60 FPS animations
- Spring config: Consistent snappy feel
```

---

## 🧪 Testing Strategy

### Test Coverage Goals

| Category          | Target | Tools                                        |
| ----------------- | ------ | -------------------------------------------- |
| Unit Tests        | >%80   | Jest                                         |
| Component Tests   | >%70   | React Testing Library                        |
| Integration Tests | >%60   | React Testing Library + React Query Mock     |
| Snapshot Tests    | %100   | Jest Snapshots                               |
| E2E Tests         | >%50   | Detox (smoke tests)                          |
| Accessibility     | %100   | @testing-library/jest-native (a11y matchers) |

### Test Structure

```
mobile/__tests__/
├── unit/
│   └── feed/
│       ├── VerificationPromptCard.test.tsx
│       ├── AITrendInsightCard.test.tsx
│       ├── SuggestedExpertsCarousel.test.tsx
│       ├── ExpertCard.test.tsx
│       ├── NewUserEmptyState.test.tsx
│       ├── NoFollowingEmptyState.test.tsx
│       ├── NoPostsEmptyState.test.tsx
│       ├── FeedHeader.test.tsx (update)
│       └── ProfessionIcon.test.tsx
├── integration/
│   └── feed/
│       ├── FeedScreen.integration.test.tsx (update)
│       └── FeedHeaderIntegration.test.tsx
└── e2e/
    └── feed/
        └── feed-flow.e2e.ts (update)
```

### Test Examples

```typescript
// VerificationPromptCard.test.tsx
describe("VerificationPromptCard", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all elements", () => {
    const { getByText, getByTestId } = render(
      <VerificationPromptCard
        onPress={mockOnPress}
        testID="verification-card"
      />
    );

    expect(getByText("Mesleğini Doğrula")).toBeTruthy();
    expect(getByText(/Uzman rozeti kazan/)).toBeTruthy();
    expect(getByText("Doğrulamaya Başla")).toBeTruthy();
    expect(getByTestId("verification-card")).toBeTruthy();
  });

  it("calls onPress when CTA button pressed", () => {
    const { getByText } = render(
      <VerificationPromptCard onPress={mockOnPress} />
    );

    fireEvent.press(getByText("Doğrulamaya Başla"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("has proper accessibility labels", () => {
    const { getByA11yLabel } = render(
      <VerificationPromptCard onPress={mockOnPress} />
    );

    expect(getByA11yLabel("Doğrulamaya başla")).toBeTruthy();
  });

  it("triggers haptic feedback on press", () => {
    const { trigger } = useHaptic();
    const { getByText } = render(
      <VerificationPromptCard onPress={mockOnPress} />
    );

    fireEvent.press(getByText("Doğrulamaya Başla"));
    expect(trigger).toHaveBeenCalledWith("medium");
  });

  it("matches snapshot", () => {
    const tree = renderer
      .create(<VerificationPromptCard onPress={mockOnPress} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

---

## 📁 File Structure

### Complete Directory Tree

```
mobile/src/features/feed/
├── components/
│   ├── VerificationPromptCard/          # ❌ NEW
│   │   ├── index.ts
│   │   ├── VerificationPromptCard.tsx
│   │   ├── VerificationPromptCard.styles.ts
│   │   ├── VerificationPromptCard.types.ts
│   │   └── __tests__/
│   │       └── VerificationPromptCard.test.tsx
│   ├── AITrendInsightCard/              # ❌ NEW
│   │   ├── index.ts
│   │   ├── AITrendInsightCard.tsx
│   │   ├── AITrendInsightCard.styles.ts
│   │   ├── AITrendInsightCard.types.ts
│   │   ├── mockTrends.ts
│   │   └── __tests__/
│   │       └── AITrendInsightCard.test.tsx
│   ├── SuggestedExpertsCarousel/        # ❌ NEW
│   │   ├── index.ts
│   │   ├── SuggestedExpertsCarousel.tsx
│   │   ├── ExpertCard.tsx
│   │   ├── SuggestedExpertsCarousel.styles.ts
│   │   ├── ExpertCard.styles.ts
│   │   ├── SuggestedExpertsCarousel.types.ts
│   │   ├── mockExperts.ts
│   │   └── __tests__/
│   │       ├── SuggestedExpertsCarousel.test.tsx
│   │       └── ExpertCard.test.tsx
│   ├── EmptyFeed/                       # ⚠️ UPDATE
│   │   ├── index.ts
│   │   ├── EmptyFeed.tsx               # ✅ EXISTING (update)
│   │   ├── NewUserEmptyState.tsx       # ❌ NEW
│   │   ├── NoFollowingEmptyState.tsx   # ❌ NEW
│   │   ├── NoPostsEmptyState.tsx       # ❌ NEW
│   │   ├── EmptyFeed.styles.ts
│   │   ├── EmptyFeed.types.ts
│   │   └── __tests__/
│   │       ├── EmptyFeed.test.tsx
│   │       ├── NewUserEmptyState.test.tsx
│   │       ├── NoFollowingEmptyState.test.tsx
│   │       └── NoPostsEmptyState.test.tsx
│   ├── FeedHeader/                      # ⚠️ UPDATE
│   │   ├── index.tsx                    # ✅ EXISTING
│   │   ├── FeedHeader.tsx               # ⚠️ UPDATE (add profession icon, notification badge)
│   │   ├── ProfessionIcon.tsx           # ❌ NEW
│   │   ├── NotificationBell.tsx         # ❌ NEW
│   │   ├── FeedHeader.styles.ts         # ⚠️ UPDATE
│   │   ├── FeedHeader.types.ts          # ⚠️ UPDATE
│   │   ├── professionConfig.ts          # ❌ NEW
│   │   └── __tests__/
│   │       ├── FeedHeader.test.tsx      # ⚠️ UPDATE
│   │       ├── ProfessionIcon.test.tsx  # ❌ NEW
│   │       └── NotificationBell.test.tsx # ❌ NEW
│   ├── PostCard/                        # ✅ EXISTING (no change)
│   └── ... (other existing components)
├── screens/
│   └── FeedScreen.tsx                   # ⚠️ UPDATE
├── hooks/
│   └── useFeed.ts                       # ✅ EXISTING (no change)
├── stores/
│   └── feedStore.ts                     # ✅ EXISTING (no change)
└── types/
    └── feed.types.ts                    # ⚠️ UPDATE (add new types)
```

### New Files Count

```
Total New Files: 28
- Components: 14 files
- Tests: 11 files
- Config/Mock: 3 files

Updates to Existing Files: 6
- FeedScreen.tsx
- FeedHeader.tsx + related files
- EmptyFeed.tsx
- feed.types.ts
```

---

## ✅ Acceptance Criteria

### Sprint-Level Acceptance

- [ ] **All 8 Components Implemented**
  - [ ] VerificationPromptCard
  - [ ] AITrendInsightCard
  - [ ] SuggestedExpertsCarousel + ExpertCard
  - [ ] NewUserEmptyState
  - [ ] NoFollowingEmptyState
  - [ ] NoPostsEmptyState
  - [ ] ProfessionIcon
  - [ ] NotificationBell (badge)
- [ ] **FeedScreen Integration**
  - [ ] ListHeaderComponent updated
  - [ ] renderPost updated (carousel every 5 posts)
  - [ ] Performance maintained (60 FPS)
- [ ] **FeedHeader Enhancement**
  - [ ] Profession icon integrated
  - [ ] Notification badge integrated
  - [ ] All interactions work correctly
- [ ] **Testing**
  - [ ] Unit test coverage >%70
  - [ ] All tests passing
  - [ ] Snapshot tests updated
- [ ] **Code Quality**
  - [ ] TypeScript strict mode (no `any`)
  - [ ] ESLint passes
  - [ ] Prettier formatted
  - [ ] Code review approved
- [ ] **Documentation**
  - [ ] JSDoc comments complete
  - [ ] README.md updated
  - [ ] Sprint documentation complete

### User Acceptance Testing (UAT)

```
Scenario 1: Unverified User First Login
✅ User sees VerificationPromptCard at feed top
✅ User sees AITrendInsightCard below verification card
✅ User taps "Doğrulamaya Başla" → navigates to verification
✅ Haptic feedback triggers on button press

Scenario 2: New User (No Following)
✅ User sees NoFollowingEmptyState
✅ User sees 3 suggested expert previews
✅ User taps "Uzmanları Keşfet" → navigates to discover

Scenario 3: Feed Scrolling
✅ User scrolls feed
✅ Every 5th post shows SuggestedExpertsCarousel above post
✅ User swipes carousel horizontally
✅ User taps expert card → navigates to profile
✅ User taps follow button → optimistic update, haptic feedback

Scenario 4: Profession Icon
✅ User sees profession icon (left) in FeedHeader
✅ Icon color matches profession category
✅ User taps icon → navigates to profession detail
✅ User long presses → tooltip shows profession name

Scenario 5: Notification Badge
✅ User sees notification bell (right) in FeedHeader
✅ Badge shows unread count (e.g., "3")
✅ Badge shows "9+" when unread > 9
✅ User taps bell → navigates to notifications
✅ Badge disappears when all read
```

---

## ⚠️ Risk Management

### Technical Risks

| Risk                             | Probability | Impact | Mitigation                                          |
| -------------------------------- | ----------- | ------ | --------------------------------------------------- |
| Performance regression           | Medium      | High   | Profiling, memoization, FlashList optimization      |
| FlashList carousel integration   | Medium      | Medium | Proper itemType, test extensively                   |
| Backend API not ready (AI trend) | High        | Low    | Mock data ile başla, future backend integration     |
| Accessibility issues             | Low         | Medium | A11y testing, screen reader verification            |
| Dark mode edge cases             | Low         | Low    | Visual QA in both modes                             |
| Test coverage below target       | Low         | Medium | Write tests concurrently with implementation        |
| Component reusability            | Low         | Low    | Follow existing patterns (PostCard, AnimatedTabBar) |
| State management complexity      | Low         | Medium | Use existing stores, avoid new state if possible    |

### Schedule Risks

| Risk                      | Probability | Impact | Mitigation                                 |
| ------------------------- | ----------- | ------ | ------------------------------------------ |
| Scope creep               | Medium      | High   | Strict adherence to DoD, no extra features |
| Underestimated complexity | Low         | Medium | Daily standup, early red flags             |
| External dependencies     | Low         | Low    | Mock data, no external API dependencies    |
| Code review delays        | Low         | Low    | Request review early (Day 8)               |
| Testing takes longer      | Medium      | Medium | Write tests concurrently, not at end       |

### Mitigation Strategies

```
1. Daily Check-ins
   - Review progress vs plan
   - Identify blockers early

2. Incremental Testing
   - Write tests alongside implementation
   - Don't defer testing to end

3. Performance Monitoring
   - Profile after each major change
   - Maintain 60 FPS benchmark

4. Code Review
   - Request review early (Day 8)
   - Address feedback promptly

5. Mock Data Strategy
   - Well-structured mock data
   - Easy to replace with real API later
```

---

## 📊 Success Metrics

### Quantitative Metrics

| Metric                  | Baseline | Target | Measurement                         |
| ----------------------- | -------- | ------ | ----------------------------------- |
| Component Coverage      | %65      | %95    | Count implemented / total specified |
| Test Coverage           | %60      | %75    | Jest coverage report                |
| Empty State Coverage    | %20      | %100   | All 3 variants implemented          |
| Special Cards Coverage  | %0       | %100   | All 2 cards implemented             |
| FeedHeader Completeness | %50      | %100   | Icon + badge implemented            |
| Frame Rate (FPS)        | 60       | 60     | React DevTools Profiler             |
| Bundle Size Increase    | -        | <50KB  | Metro bundler size report           |
| Accessibility Score     | -        | 100%   | @testing-library/jest-native        |

### Qualitative Metrics

```
✅ Code Maintainability
  - Clean, readable code
  - Proper TypeScript types
  - Comprehensive JSDoc comments

✅ User Experience
  - Smooth animations
  - Haptic feedback
  - Intuitive interactions

✅ Design Consistency
  - Matches existing components
  - Design system compliance
  - Dark mode support

✅ Documentation Quality
  - Clear implementation notes
  - Usage examples
  - Migration guide (if needed)
```

---

## 📋 Daily Standup Template

```markdown
## Day X Standup

### ✅ Yesterday

- Completed: [Component/Feature Name]
- Tests written: [Test Count]
- Blockers resolved: [List]

### 🎯 Today

- Goal: [Specific Component/Feature]
- Expected completion: [Story Points or %]

### 🚨 Blockers

- None / [List blockers]

### 📊 Progress

- Story Points Completed: X / 46
- Test Coverage: X%
- Days Remaining: X
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Mevcut projeyi pull
git pull origin main

# Dependencies güncel mi kontrol
cd mobile
npm install

# Backend running (if needed for API tests)
cd ../backend
./mvnw spring-boot:run
```

### Development Workflow

```bash
# 1. Branch oluştur
git checkout -b feature/home-screen-completion

# 2. İlk component'i oluştur (örnek: VerificationPromptCard)
mkdir -p mobile/src/features/feed/components/VerificationPromptCard
touch mobile/src/features/feed/components/VerificationPromptCard/index.ts
touch mobile/src/features/feed/components/VerificationPromptCard/VerificationPromptCard.tsx
# ... diğer dosyalar

# 3. Component'i implement et
# 4. Test yaz
# 5. Test çalıştır
npm test VerificationPromptCard

# 6. Commit
git add .
git commit -m "feat(feed): Add VerificationPromptCard component

- Gradient card design with CTA
- Conditional rendering based on verification status
- Haptic feedback on interactions
- Spring animations (FadeIn + SlideInUp)
- Comprehensive unit tests (%80 coverage)
- Accessibility support (screen reader labels)

Refs: MOBILE-APP-HOME-SCREEN.md Lines 759-795"

# 7. Her component için 2-6 tekrarla
# 8. Integration testleri
# 9. Final push
git push origin feature/home-screen-completion
```

### PR Template

```markdown
## Home Screen Completion - Missing Components

### 📝 Summary

Implements 8 critical components specified in MOBILE-APP-HOME-SCREEN.md v2.0 to complete Home Screen implementation from %65 to %95.

### ✅ Components Implemented

- [x] VerificationPromptCard (Lines 759-795)
- [x] AITrendInsightCard (Lines 797-810)
- [x] SuggestedExpertsCarousel (Lines 419, 1971-1987)
- [x] NewUserEmptyState (Lines 1582-1607)
- [x] NoFollowingEmptyState (Lines 1609-1632)
- [x] NoPostsEmptyState (Lines 1634-1657)
- [x] FeedHeader Profession Icon (Lines 600-758)
- [x] FeedHeader Notification Badge (Lines 742-758)

### 🧪 Testing

- Unit tests: 28 test files
- Coverage: 75% (target: >70%)
- Integration tests: FeedScreen integration
- Accessibility: All components tested with screen reader
- Performance: 60 FPS maintained

### 📸 Screenshots

[Attach before/after screenshots]

### 🔗 Related

- Issue: #XXX
- Documentation: MOBILE-APP-HOME-SCREEN.md
- Analysis: MOBILE-HOME-SCREEN-IMPLEMENTATION-ANALYSIS.md

### ✅ Checklist

- [x] Code follows style guide
- [x] Tests written and passing
- [x] Documentation updated
- [x] No console.log statements
- [x] Accessibility verified
- [x] Dark mode tested
- [x] Performance profiled (60 FPS)
```

---

## 📚 Additional Resources

### Design References

- Instagram feed UX patterns
- LinkedIn professional network carousel
- Twitter trends sidebar
- Modern onboarding checklists (Notion, Linear)

### Technical References

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [@shopify/flash-list](https://shopify.github.io/flash-list/)
- [React Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [Accessibility Guidelines](https://reactnative.dev/docs/accessibility)

### Internal Documentation

- `mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md`
- `mobile-development-guide/sprints/25-SPRINT-5-6.md`
- `MOBILE-APP-HOME-SCREEN.md` (v2.0, 2793 lines)
- `PULL_REQUEST_FEED_ANIMATEDTABBAR_CREATEPOST.md`

---

## 🎓 Sprint Review & Retrospective

### Review Questions (Day 10)

1. Are all 8 components production-ready?
2. Does FeedScreen integration work seamlessly?
3. Is test coverage >70%?
4. Are there any performance regressions?
5. Is the code maintainable and clean?

### Retrospective Template

```markdown
## What Went Well ✅

- [List successes]

## What Could Be Improved ⚠️

- [List improvement areas]

## Action Items for Next Sprint 🎯

- [List concrete actions]

## Blocked Items 🚫

- [List items that couldn't be completed]
```

---

**Sprint Hazırlayan:** GitHub Copilot (Claude Sonnet 4.5)  
**Tarih:** 8 Aralık 2025  
**Versiyon:** 1.0  
**Status:** ✅ Ready for Development

**Son Kontrol:**

- [x] Definition of Done tanımlı
- [x] Tüm user story'ler detaylandırılmış
- [x] Test stratejisi belirlenmiş
- [x] File structure planlanmış
- [x] Risk analizi yapılmış
- [x] Acceptance criteria net

🚀 **Sprint başlatılabilir!**
