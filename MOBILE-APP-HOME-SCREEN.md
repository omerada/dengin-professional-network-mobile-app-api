# 🏠 Meslektaş Mobil Uygulama - Anasayfa Tasarım ve Geliştirme Dokümantasyonu

**Doküman Versiyonu:** 2.0  
**Son Güncelleme:** 8 Aralık 2025  
**Durum:** 🚀 Production-Ready Development Guide  
**Hedef:** Modern, Soft Kurumsal, Akıllı ve Kullanıcıyı Sevdiren Anasayfa

---

## 📋 İçindekiler

1. [Tasarım Vizyonu ve Hedefler](#tasarım-vizyonu-ve-hedefler)
2. [Proje Yapısı Analizi](#proje-yapısı-analizi)
3. [Backend API Entegrasyonu](#backend-api-entegrasyonu)
4. [Anasayfa Mimarisi](#anasayfa-mimarisi)
5. [Component Detayları](#component-detayları)
6. [Empty State Yönetimi](#empty-state-yönetimi)
7. [State Yönetimi](#state-yönetimi)
8. [UI/UX Implementasyonu](#uiux-implementasyonu)
9. [Animasyon ve Etkileşimler](#animasyon-ve-etkileşimler)
10. [Performans Optimizasyonu](#performans-optimizasyonu)
11. [AI Agent Geliştirme Talimatları](#ai-agent-geliştirme-talimatları)

---

## 🎯 Tasarım Vizyonu ve Hedefler

### Ana Amaç

Kullanıcının uygulamayı açtığı ilk andan itibaren **değerli, güvenilir, profesyonel ve modern** bir deneyim sunmak. Anasayfa, kullanıcıyı uygulamaya bağlayan, günlük kullanımı teşvik eden ve meslek ağını büyütmesini kolaylaştıran ana merkezdir.

### Tasarım Prensipleri

#### 1. **Soft Kurumsal Estetik**

- **Renk Paleti:** Modern mavi tonları (Primary #0066FF) + soft gri tonları
- **Tipografi:** SF Pro Display/Text (iOS), Roboto (Android) - profesyonel ve okunabilir
- **Spacing:** 8px grid sistemi - havadar ve temiz görünüm
- **Shadows:** Subtle elevation layers - derinlik hissi

#### 2. **Akıllı İçerik Yönetimi**

- **Context-Aware:** Kullanıcı durumuna göre dinamik içerik
- **AI-Powered:** Meslek bazlı öneriler ve trendler
- **Progressive Disclosure:** Bilgi kalabalığı yerine aşamalı açılım
- **Empty State Excellence:** Boş durumları fırsata çevirme

#### 3. **Kullanıcı Sevgisi**

- **Instant Feedback:** Her etkileşime anında yanıt (haptic + visual)
- **Smooth Animations:** 60 FPS spring animasyonlar
- **Delightful Micro-interactions:** Küçük sürprizler ve etkileşimler
- **Personalization:** Her kullanıcıya özel deneyim

### Referans Uygulamalar

| Özellik               | Instagram  | LinkedIn | TikTok     | Meslektaş Hedefi                                            |
| --------------------- | ---------- | -------- | ---------- | ----------------------------------------------------------- |
| Feed UX               | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | Instagram seviyesi smooth scroll + LinkedIn profesyonelliği |
| Bottom Tab Navigation | ⭐⭐⭐⭐   | ⭐⭐     | ⭐⭐⭐⭐⭐ | TikTok tarzı merkez FAB + Instagram'ın simetrik layout'u    |
| Onboarding            | ⭐⭐⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐   | Gamification + AI personalization                           |
| Empty States          | ⭐⭐⭐     | ⭐⭐     | ⭐⭐⭐⭐   | Motivating + value-driven + action-oriented                 |
| Animations            | ⭐⭐⭐⭐⭐ | ⭐⭐     | ⭐⭐⭐⭐⭐ | Instagram + TikTok seviyesi fluid + professional polish     |

---

## 🏗️ Proje Yapısı Analizi

### Backend Mimarisi (Spring Boot + DDD)

#### Domain Model - Social Context

**Post Aggregate Root:**

```java
@Entity
public class Post extends AggregateRoot {
    @EmbeddedId private PostId id;
    @Embedded private UserId authorId;
    @Embedded private Profession profession;
    @Column(length = 2000) private String content;
    @ElementCollection private List<ImageAttachment> images; // Max 4
    @OneToMany private List<Comment> comments;
    @ElementCollection private Set<Like> likes;
    @Enumerated private PostStatus status; // PUBLISHED, HIDDEN, DELETED
    private boolean commentsEnabled;
    private boolean isPinned;
    private Instant createdAt;
}
```

#### Backend API Endpoints

```
GET  /api/feed                    - Kişiselleştirilmiş feed (cursor pagination)
GET  /api/feed/trending           - Trend gönderiler (engagement bazlı)
GET  /api/posts/{id}              - Gönderi detayı
POST /api/posts                   - Yeni gönderi oluştur
PUT  /api/posts/{id}              - Gönderi düzenle
DELETE /api/posts/{id}            - Gönderi sil
POST /api/posts/{id}/like         - Beğen/beğeniyi kaldır
POST /api/posts/{id}/bookmark     - Kaydet/kaydı kaldır
GET  /api/posts/{id}/comments     - Yorumları getir
POST /api/posts/{id}/comments     - Yorum ekle
```

#### Feed Algorithm (FeedService.java)

**Relevance Score Formula:**

```
Total Score = Time(40%) + Engagement(30%) + Author(20%) + Content(10%)
```

**Time Score:**

- < 24 saat: 100 puan
- 1-3 gün: 75 puan
- 3-7 gün: 50 puan
- > 7 gün: 25 puan

**Engagement Score:**

- (likes × 2) + (comments × 5)
- Max 100 puan

**Author Score:**

- Takip edilen: 100 puan
- Aynı meslek: 75 puan
- Farklı meslek: 50 puan

**Content Score:**

- Görsel var: +20 puan
- Uzun içerik (>200 karakter): +10 puan
- Base: 70 puan

### Mobile Mimarisi (React Native + TypeScript)

#### Teknoloji Stack

```json
{
  "react-native": "0.81.5",
  "react": "19.1.0",
  "react-native-reanimated": "4.1.1",
  "react-native-gesture-handler": "2.28.0",
  "@gorhom/bottom-sheet": "5.2.7",
  "@tanstack/react-query": "5.12.2",
  "@shopify/flash-list": "1.6.3",
  "expo-image": "3.0.10",
  "lottie-react-native": "7.3.1",
  "zustand": "4.4.7"
}
```

#### Folder Structure

```
mobile/src/
├── features/
│   └── feed/
│       ├── screens/
│       │   └── FeedScreen.tsx          # Ana feed ekranı
│       ├── components/
│       │   ├── FeedHeader.tsx          # Header (logo, filters, avatar)
│       │   ├── PostCard.tsx            # Gönderi kartı
│       │   ├── PostActions.tsx         # Like, comment, share, bookmark
│       │   ├── EmptyFeed.tsx           # Boş feed durumu
│       │   └── FeedSkeleton.tsx        # Loading skeleton
│       ├── hooks/
│       │   ├── useFeed.ts              # Infinite query hook
│       │   ├── useLikePost.ts          # Like mutation
│       │   └── useBookmarkPost.ts      # Bookmark mutation
│       ├── services/
│       │   └── feedService.ts          # API service layer
│       └── types/
│           └── feed.types.ts           # TypeScript types
├── shared/
│   └── components/
│       ├── EmptyState/                 # Genel empty state component
│       ├── Avatar/                     # Profil fotoğrafı component
│       ├── Badge/                      # Verified, premium badge'ler
│       └── Button/                     # Modern button component
└── theme/
    ├── colors.ts                       # Renk paleti
    ├── typography.ts                   # Font ve text stilleri
    ├── spacing.ts                      # Spacing sistemi
    ├── shadows.ts                      # Shadow/elevation
    └── animations.ts                   # Animation configs
```

---

## 🔌 Backend API Entegrasyonu

### API Response Types

#### FeedPostResponse (Backend DTO)

```typescript
interface FeedPostResponse {
  id: number; // Post ID
  author: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
    profession: string;
    isVerified: boolean;
    isPremium: boolean;
  };
  content: string; // Post metni (max 2000 karakter)
  images: PostImageDto[]; // Görseller (max 4)
  stats: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };
  userInteraction: {
    isLiked: boolean; // Kullanıcı beğendi mi?
    isBookmarked: boolean; // Kullanıcı kaydetti mi?
  };
  createdAt: string; // ISO 8601 format
  relevanceScore: number; // Feed algoritması skoru (0-100)
}

interface PostImageDto {
  id: number;
  url: string; // S3 CloudFront URL
  thumbnailUrl: string; // Optimize edilmiş thumbnail
  width: number;
  height: number;
  order: number; // Görsel sırası (0-3)
}
```

### Feed API Service Implementation

```typescript
// src/features/feed/services/feedService.ts

import axios from "axios";
import { API_BASE_URL } from "@/config";
import type { Post } from "../types";

interface FeedResponse {
  success: boolean;
  data: {
    content: Post[];
    hasMore: boolean;
    totalElements: number;
  };
}

export const feedService = {
  /**
   * Kişiselleştirilmiş feed getir
   * GET /api/feed?limit={limit}&beforeId={beforeId}&professionFilter={professionId}
   */
  getFeed: async (
    limit: number = 20,
    professionFilter?: number,
    beforeId?: number
  ): Promise<{ posts: Post[]; hasMore: boolean; lastId?: number }> => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (professionFilter)
      params.append("professionFilter", professionFilter.toString());
    if (beforeId) params.append("beforeId", beforeId.toString());

    const response = await axios.get<FeedResponse>(
      `${API_BASE_URL}/api/feed?${params.toString()}`
    );

    const posts = response.data.data.content;
    const hasMore = response.data.data.hasMore;
    const lastId = posts.length > 0 ? posts[posts.length - 1].id : undefined;

    return { posts, hasMore, lastId };
  },

  /**
   * Trend gönderileri getir
   * GET /api/feed/trending?limit={limit}
   */
  getTrendingFeed: async (
    limit: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> => {
    const response = await axios.get<FeedResponse>(
      `${API_BASE_URL}/api/feed/trending?limit=${limit}`
    );

    return {
      posts: response.data.data.content,
      hasMore: false, // Trending endpoint pagination yok
    };
  },

  /**
   * Gönderiyi beğen/beğeniyi kaldır
   * POST /api/posts/{postId}/like
   */
  toggleLike: async (postId: number, isLiked: boolean): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {
      action: isLiked ? "UNLIKE" : "LIKE",
    });
  },

  /**
   * Gönderiyi kaydet/kaydı kaldır
   * POST /api/posts/{postId}/bookmark
   */
  toggleBookmark: async (
    postId: number,
    isBookmarked: boolean
  ): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/posts/${postId}/bookmark`, {
      action: isBookmarked ? "REMOVE" : "ADD",
    });
  },
};
```

### React Query Hooks

```typescript
// src/features/feed/hooks/useFeed.ts

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { feedService } from "../services";
import type { Post } from "../types";

export const FEED_QUERY_KEY = "feed";

interface FeedListResponse {
  posts: Post[];
  hasMore: boolean;
  lastId?: number;
}

/**
 * Infinite scroll feed hook
 * Cursor-based pagination (beforeId)
 */
export function useFeed(professionFilter?: number, limit = 20) {
  return useInfiniteQuery({
    queryKey: [FEED_QUERY_KEY, professionFilter, limit] as const,
    queryFn: async ({ pageParam }): Promise<FeedListResponse> => {
      return feedService.getFeed(limit, professionFilter, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: FeedListResponse) => {
      if (lastPage.hasMore && lastPage.posts.length > 0) {
        return lastPage.lastId; // Son post ID = cursor
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
}

/**
 * Feed helper - tüm sayfaları düz liste olarak döner
 */
export function useFeedPosts(professionFilter?: number, limit = 20) {
  const { data, ...rest } = useFeed(professionFilter, limit);
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return {
    posts,
    totalCount: posts.length,
    ...rest,
  };
}
```

---

## 🏛️ Anasayfa Mimarisi

### Anasayfa Durumları (State Machine)

```typescript
type FeedState =
  | 'loading'           // İlk yükleme - skeleton göster
  | 'empty'             // Hiç post yok - empty state göster
  | 'content'           // Postlar var - normal feed göster
  | 'error'             // Hata durumu - error state göster
  | 'refreshing'        // Pull-to-refresh aktif
  | 'loadingMore';      // Infinite scroll - sonraki sayfa yükleniyor

// State transitions
loading → empty | content | error
empty → content (new posts added)
content → refreshing → content
content → loadingMore → content
error → loading (retry)
```

### Bileşen Hiyerarşisi

```
FeedScreen (Ana Container)
├── SafeAreaView
│   ├── FeedHeader (Sticky)
│   │   ├── Logo (Sol)
│   │   ├── FilterTabs (Orta)
│   │   └── Actions (Sağ)
│   │       ├── NotificationBell
│   │       └── Avatar
│   └── FlashList (Virtualized Scroll)
│       ├── ListHeaderComponent
│       │   ├── VerificationPromptCard (Conditional)
│       │   └── AITrendInsightCard (Conditional)
│       ├── PostCard (Repeated Items)
│       │   ├── PostHeader
│       │   │   ├── Avatar
│       │   │   ├── AuthorInfo
│       │   │   └── MenuButton
│       │   ├── PostContent
│       │   ├── PostImages (Optional)
│       │   └── PostActions
│       │       ├── LikeButton
│       │       ├── CommentButton
│       │       ├── ShareButton
│       │       └── BookmarkButton
│       ├── SuggestedExpertsCarousel (Every 5 posts)
│       ├── ListEmptyComponent
│       │   └── EmptyFeed
│       └── ListFooterComponent
│           └── LoadingSpinner (Infinite scroll)
└── TabBar (Bottom Navigation - Global - Modern 5 Tab Design)
    ├── Ana Sayfa (home-outline/home)
    ├── Mesajlar (chatbubble-outline/chatbubble)
    ├── ✨ Gönderi Oluştur (add-circle - Elevated/Prominent)
    ├── Etkinlik (trophy-outline/trophy)
    └── Profil (person-outline/person)
```

**Bottom Tab Navigation - Modern Tasarım:**

```
┌────────────────────────────────────────────────────────────┐
│  [🏠]     [💬]        [➕]        [🏆]     [👤]          │
│  Ana     Mesaj      OLUŞTUR    Etkinlik  Profil           │
└────────────────────────────────────────────────────────────┘
           ↑              ↑               ↑
        Sol Grup      Merkez (Öne Çıkan)  Sağ Grup
```

**Tab Özellikleri:**

1. **Ana Sayfa** (`home-outline/home`)
   - Feed ekranı - gönderileri görüntüleme
   - Konum: Sol grup - 1. pozisyon
2. **Mesajlar** (`chatbubble-outline/chatbubble`)
   - Mesajlaşma ekranı - direkt mesajlar
   - Konum: Sol grup - 2. pozisyon
   - Badge: Okunmamış mesaj sayısı
3. **Gönderi Oluştur** (`add-circle`) ⭐ **MERKEZ - ÖNE ÇIKAN**
   - Yeni gönderi oluşturma modal'ı
   - Konum: TAM MERKEZ - 3. pozisyon
   - Tasarım: Elevated, büyük, renkli (Primary color)
   - Boyut: Diğer iconlardan %40 daha büyük
   - Davranış: Modal açar (presentation: 'modal')
   - Label: "Oluştur" veya label yok (sadece ikon)
4. **Etkinlik** (`trophy-outline/trophy`) 🆕
   - Challenge ekranı - yarışmalar, görevler, liderlik tablosu
   - Konum: Sağ grup - 4. pozisyon
   - İçerik: Weekly challenges, achievements, leaderboard
   - Badge: Yeni challenge veya ödül bildirimi
5. **Profil** (`person-outline/person`)
   - Kullanıcı profili - ayarlar, kaydedilenler, gönderiler
   - Konum: Sağ grup - 5. pozisyon

**Tasarım Prensipleri:**

✅ **Simetrik Denge:** 2 ikon sol + 1 merkez + 2 ikon sağ = balanced layout  
✅ **Merkez Vurgusu:** Gönderi oluştur butonu öne çıkar (büyük, elevated, renkli)  
✅ **Kolay Erişim:** En sık kullanılan aksiyonlar başparmaklarla erişilebilir  
✅ **Modern Estetik:** Instagram/TikTok tarzı merkez FAB (Floating Action Button)  
✅ **Minimal Bildirim:** Sadece header'da bildirim, tab bar temiz kalır

**NOT:**

- Bildirimler header'da badge ile gösterildiği için bottom tab'da bildirim sekmesine gerek yoktur
- Profil erişimi bottom tab'dan sağlandığı için header'da profil avatarına gerek yoktur
- Gönderi oluştur butonu merkezdedir ve diğerlerinden görsel olarak ayrışır

### Anasayfa Bölümleri Detayı

#### 1. Header (Sabit - Her Durumda Görünür)

**Konum:** Ekranın en üstü, sticky position  
**Yükseklik:** 56px (iOS SafeArea dahil)  
**Background:** Semi-transparent blur (iOS: UIBlurEffectStyleLight)

**Yapı:**

```
┌──────────────────────────────────────┐
│ [Meslek İkonu]  Ana Sayfa      [🔔] │
└──────────────────────────────────────┘
```

**Özellik:**

- Sol: Kullanıcının mesleğine özel dinamik ikon
- Orta: "Ana Sayfa" başlığı - basit ve net
- Sağ: Bildirim ikonu (varsa okunmamış sayısı badge ile)

**İmplementasyon:**

```typescript
// FeedHeader Component
interface FeedHeaderProps {
  unreadNotifications: number;
  onNotificationPress: () => void;
  userProfession?: Profession; // Kullanıcının mesleği
}

// Profession Icon Mapping
const PROFESSION_ICONS: Record<ProfessionCategory, string> = {
  MEDICAL: "medical", // 🏥 Sağlık - Steteskop ikonu
  LEGAL: "scale", // ⚖️ Hukuk - Terazi ikonu
  ENGINEERING: "construct", // 🔧 Mühendislik - İnşaat/araç ikonu
  EDUCATION: "school", // 🎓 Eğitim - Mezuniyet şapkası
  SERVICE: "briefcase", // 💼 Hizmet Sektörü - Çanta ikonu
  CREATIVE: "color-palette", // 🎨 Yaratıcı Sektör - Palet ikonu
  BUSINESS: "trending-up", // 📈 İş Dünyası - Grafik ikonu
  OTHER: "people", // 👥 Diğer - İnsan ikonu
};

// FeedHeader Implementation
export const FeedHeader: React.FC<FeedHeaderProps> = ({
  unreadNotifications,
  onNotificationPress,
  userProfession,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptic();

  // Meslek kategorisine göre ikon belirleme
  const professionIcon = userProfession
    ? PROFESSION_ICONS[userProfession.category]
    : "people";

  // Ikon rengi - meslek kategorisine göre özelleştirilebilir
  const iconColor = userProfession
    ? getProfessionColor(userProfession.category)
    : colors.primary.main;

  return (
    <Animated.View
      style={[
        styles.header,
        {
          backgroundColor: colors.background.paper,
          borderBottomColor: colors.border.light,
        },
      ]}
    >
      {/* Sol: Meslek İkonu */}
      <View style={styles.leftSection}>
        <Pressable
          onPress={() => {
            triggerHaptic("light");
            // Meslek detayları veya değiştirme ekranına yönlendir
          }}
          style={styles.professionIconContainer}
        >
          <Icon name={professionIcon} size={28} color={iconColor} />
        </Pressable>
      </View>

      {/* Orta: Ana Sayfa Başlığı */}
      <View style={styles.centerSection}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Ana Sayfa
        </Text>
        {userProfession && (
          <Text
            style={[styles.professionSubtitle, { color: colors.text.tertiary }]}
          >
            {userProfession.name}
          </Text>
        )}
      </View>

      {/* Sağ: Bildirim İkonu */}
      <View style={styles.rightSection}>
        <Pressable onPress={onNotificationPress} style={styles.iconButton}>
          <Icon
            name={
              unreadNotifications > 0
                ? "notifications"
                : "notifications-outline"
            }
            size={24}
            color={colors.text.primary}
          />
          {unreadNotifications > 0 && (
            <View
              style={[styles.badge, { backgroundColor: colors.error.main }]}
            >
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
};

// Meslek kategorisine göre renk belirleme helper
const getProfessionColor = (category: ProfessionCategory): string => {
  const colorMap: Record<ProfessionCategory, string> = {
    MEDICAL: "#00C853", // Yeşil - Sağlık
    LEGAL: "#1976D2", // Mavi - Hukuk
    ENGINEERING: "#FF6F00", // Turuncu - Mühendislik
    EDUCATION: "#7B1FA2", // Mor - Eğitim
    SERVICE: "#0097A7", // Cyan - Hizmet
    CREATIVE: "#E91E63", // Pembe - Yaratıcı
    BUSINESS: "#424242", // Gri - İş Dünyası
    OTHER: "#757575", // Açık Gri - Diğer
  };
  return colorMap[category] || "#0066FF";
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  professionIconContainer: {
    padding: 8,
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  professionSubtitle: {
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
```

**Header Tasarımı:**

- **Sol:** Meslek ikonu - renkli, tıklanabilir, meslek kimliği
- **Orta:** "Ana Sayfa" başlığı + alt satırda meslek adı (opsiyonel)
- **Sağ:** Bildirim ikonu (okunmamış sayısı badge ile gösterilir)

**Avantajları:**

✅ **Minimal ve Temiz:** Sadece gerekli elementler (meslek ikonu, başlık, bildirim)  
✅ **Odak:** Kullanıcı nerede olduğunu anında bilir  
✅ **Bottom Tab Uyumu:** Profil erişimi bottom navigation'dan sağlanır (4. tab)  
✅ **Mobil UX:** Maksimum içerik alanı, minimum distraction  
✅ **Bildirim Odaklı:** Önemli bildirimler header'da badge ile belirgin görüntülenir

**NOT:** Filtre seçenekleri (Tümü/Takip/Popüler) artık header'da değil, feed içinde ayrı bir filter bar olarak gösterilecek:

```typescript
// Feed Filter Bar (Header'ın hemen altında)
<View style={styles.filterBar}>
  <FilterChip label="Tümü" isActive={filter === 'all'} onPress={...} />
  <FilterChip label="Takip Ettiklerim" isActive={filter === 'following'} onPress={...} />
  <FilterChip label="Popüler" isActive={filter === 'popular'} onPress={...} />
</View>
```

**Meslek İkonu Özellikleri:**

- **Dinamik:** Kullanıcının mesleğine göre otomatik değişir
- **Renkli:** Her meslek kategorisinin kendine özel rengi vardır
- **Tıklanabilir:** İkona tıklayarak meslek detayları görülebilir
- **Subtitle:** Ortada meslek adı alt başlık olarak gösterilir

**Meslek İkon Haritası:**

| Meslek Kategorisi | İkon                 | Renk               | Açıklama                   |
| ----------------- | -------------------- | ------------------ | -------------------------- |
| MEDICAL           | `medical` (🏥)       | Yeşil (#00C853)    | Steteskop - Sağlık sektörü |
| LEGAL             | `scale` (⚖️)         | Mavi (#1976D2)     | Terazi - Hukuk sektörü     |
| ENGINEERING       | `construct` (🔧)     | Turuncu (#FF6F00)  | İnşaat/Araç - Mühendislik  |
| EDUCATION         | `school` (🎓)        | Mor (#7B1FA2)      | Mezuniyet şapkası - Eğitim |
| SERVICE           | `briefcase` (💼)     | Cyan (#0097A7)     | Çanta - Hizmet sektörü     |
| CREATIVE          | `color-palette` (🎨) | Pembe (#E91E63)    | Palet - Yaratıcı sektör    |
| BUSINESS          | `trending-up` (📈)   | Gri (#424242)      | Grafik - İş dünyası        |
| OTHER             | `people` (👥)        | Açık Gri (#757575) | İnsan - Diğer meslekler    |

**Kullanıcı Deneyimi:**

1. **İlk Açılış:** Kullanıcı mesleğini seçtiğinde, header'da mesleğine özel ikon belirir
2. **Meslek Değişikliği:** İkona tıklayarak meslek bilgilerini görüntüleyebilir
3. **Görsel Tanıma:** Renk ve ikon sayesinde hangi meslek topluluğunda olduğunu anında bilir
4. **Çoklu Meslek:** Kullanıcı birden fazla mesleğe sahipse, aktif meslek ikonu gösterilir
5. **Bildirim Badge:**
   - Okunmamış bildirim yoksa: `notifications-outline` ikonu (boş)
   - Okunmamış bildirim varsa: `notifications` ikonu (dolu) + kırmızı badge
   - Badge üzerinde sayı: 1-9 arası direkt sayı, 9+'dan fazla ise "9+"
   - Badge rengi: `colors.error.main` (#FF3B30) - dikkat çekici kırmızı
   - Badge konumu: İkon'un sağ üst köşesi (position: absolute)

**Bildirim Badge Görselleştirme:**

```
Bildirim Yok:        Bildirim Var (3):      Bildirim Çok (10+):
┌──────┐            ┌──────┐ ❸             ┌──────┐ 9⁺
│  🔔  │            │  🔔  │               │  🔔  │
└──────┘            └──────┘               └──────┘
```

#### 2. Verification Prompt Card (Conditional)

**Görünürlük Koşulu:** `user.isVerified === false`  
**Konum:** Feed başlangıcı (ilk item)  
**Stil:** Gradient card (Primary → Secondary)

**İçerik:**

```
┌──────────────────────────────────────┐
│ 🎓 Mesleğini Doğrula                 │
│                                      │
│ Uzman rozeti kazan ve topluluğa     │
│ güvenilir üye olarak katıl.         │
│                                      │
│ [Doğrulamaya Başla] ───────────────► │
└──────────────────────────────────────┘
```

#### 3. AI Trend Insight Card (Conditional)

**Görünürlük Koşulu:** Her zaman (feed boş/dolu farketmez)  
**Konum:** Verification card'dan sonra VEYA feed başlangıcı  
**Veri Kaynağı:** Backend AI servisi (future implementation)

**İçerik:**

```
┌──────────────────────────────────────┐
│ 💡 Bu Hafta [Meslek]'de Trend        │
│                                      │
│ 1. [Trend Başlık 1]                 │
│ 2. [Trend Başlık 2]                 │
│ 3. [Trend Başlık 3]                 │
│                                      │
│ [Daha Fazla Gör] ──────────────────► │
└──────────────────────────────────────┘
```

#### 4. Activity Tab - Etkinlik ve Challenge Ekranı 🏆

**Görünürlük:** Bottom Tab Navigation - 4. tab (Etkinlik)  
**Konum:** Ayrı ekran (CreatePost ile Profil arasında)  
**Hedef:** Kullanıcıları oyunlaştırma ile engage etme, topluluk aktivitesini artırma

**Etkinlik Ekranı İçeriği:**

```
┌──────────────────────────────────────────────────┐
│  🏆 Etkinlik                        [Ayarlar]    │
├──────────────────────────────────────────────────┤
│                                                  │
│  📊 Haftalık İlerleme                            │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░  60% (3/5 görev)             │
│                                                  │
│  🔥 Aktif Challenge'lar                          │
│  ┌────────────────────────────────────────────┐ │
│  │ 📝 İlk 3 Gönderi                           │ │
│  │ Bu hafta 3 gönderi paylaş                  │ │
│  │ ⭐ 50 puan                                  │ │
│  │ ▓▓▓▓▓▓░░░░ 2/3                             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 💬 Yorum Kralı                             │ │
│  │ 10 gönderiye yorum yap                     │ │
│  │ ⭐ 100 puan                                 │ │
│  │ ▓▓▓▓░░░░░░ 4/10                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  🏅 Liderlik Tablosu (Bu Hafta)                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🥇 1. Ahmet D. (Doktor)        1,250 puan  │ │
│  │ 🥈 2. Ayşe K. (Avukat)         1,120 puan  │ │
│  │ 🥉 3. Mehmet Y. (Mühendis)     1,050 puan  │ │
│  │ ...                                        │ │
│  │ 🔹 47. Sen                       340 puan  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  🎁 Ödüller                                      │
│  ┌────────────────────────────────────────────┐ │
│  │ ✅ İlk Gönderi Badge              (Kazanıldı)│ │
│  │ ✅ 10 Beğeni Alındı               (Kazanıldı)│ │
│  │ ⏳ Haftalık Aktif (4/7 gün)                │ │
│  │ 🔒 100 Takipçi                             │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Challenge Tipleri:**

1. **Günlük Görevler:**

   - İlk giriş (10 puan)
   - 1 gönderi paylaş (20 puan)
   - 3 yorum yap (30 puan)

2. **Haftalık Challenge'lar:**

   - 5 gönderi paylaş (100 puan)
   - 20 yorum yap (150 puan)
   - 10 yeni takipçi kazan (200 puan)

3. **Milestone Ödülleri:**
   - İlk 100 beğeni - "Popüler" rozeti
   - İlk 50 takipçi - "Influencer" rozeti
   - 7 gün aktif kullanım - "Sadık Kullanıcı" rozeti

**Backend Integration:**

```
GET  /api/challenges                - Aktif challenge listesi
GET  /api/challenges/{id}           - Challenge detayı
POST /api/challenges/{id}/claim     - Ödül talep et
GET  /api/leaderboard/weekly        - Haftalık liderlik
GET  /api/achievements              - Kullanıcı başarımları
```

**UX Faydaları:**

✅ **Gamification:** Kullanıcıları engage eder ve uygulamaya bağlar  
✅ **Social Proof:** Liderlik tablosu rekabet hissi yaratır  
✅ **Progress Tracking:** Görsel progress bar'lar motivasyon artırır  
✅ **Rewards System:** Badge ve ödüller kullanıcı sadakatini artırır  
✅ **Community Building:** Topluluk içi aktiviteyi teşvik eder

---

## 📦 Component Detayları

### PostCard Component

**Ana Gönderi Kartı - Instagram/LinkedIn Hibrit Tasarım**

```typescript
// src/features/feed/components/PostCard/PostCard.tsx

import React, { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { Avatar, Badge } from "@shared/components";
import { PostActions } from "./PostActions";
import { PostImages } from "./PostImages";
import type { Post } from "../../types";

interface PostCardProps {
  post: Post;
  index?: number;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onMenuPress: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = memo(
  ({
    post,
    index = 0,
    onLike,
    onComment,
    onShare,
    onBookmark,
    onMenuPress,
  }) => {
    const { colors } = useTheme();
    const { triggerHaptic } = useHaptic();

    // Double tap to like gesture
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        if (!post.userInteraction.isLiked) {
          triggerHaptic("medium");
          onLike(post.id);
        }
      });

    // Format time ago
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
      addSuffix: true,
      locale: tr,
    });

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(300)}
        layout={Layout.springify()}
        style={styles.container}
      >
        <GestureDetector gesture={doubleTapGesture}>
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.authorSection}>
                <Avatar
                  uri={post.author.avatarUrl}
                  name={post.author.displayName}
                  size="md"
                  isVerified={post.author.isVerified}
                  isPremium={post.author.isPremium}
                />
                <View style={styles.authorInfo}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.authorName,
                        { color: colors.text.primary },
                      ]}
                    >
                      {post.author.displayName}
                    </Text>
                    {post.author.isVerified && (
                      <Badge variant="verified" size="sm" />
                    )}
                  </View>
                  <Text
                    style={[styles.metadata, { color: colors.text.tertiary }]}
                  >
                    {post.author.profession} • {timeAgo}
                  </Text>
                </View>
              </View>

              <Pressable onPress={() => onMenuPress(post.id)} hitSlop={8}>
                <Icon
                  name="ellipsis-horizontal"
                  size={20}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text
                style={[styles.contentText, { color: colors.text.primary }]}
              >
                {post.content}
              </Text>
            </View>

            {/* Images */}
            {post.images.length > 0 && (
              <PostImages images={post.images} postId={post.id} />
            )}
          </View>
        </GestureDetector>

        {/* Actions */}
        <PostActions
          postId={post.id}
          stats={post.stats}
          userInteraction={post.userInteraction}
          onLike={() => onLike(post.id)}
          onComment={() => onComment(post.id)}
          onShare={() => onShare(post.id)}
          onBookmark={() => onBookmark(post.id)}
        />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
  },
  metadata: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
```

### PostActions Component

**Etkileşim Butonları - Like, Comment, Share, Bookmark**

```typescript
// src/features/feed/components/PostCard/PostActions.tsx

import React, { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

interface PostActionsProps {
  postId: number;
  stats: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };
  userInteraction: {
    isLiked: boolean;
    isBookmarked: boolean;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PostActions: React.FC<PostActionsProps> = memo(
  ({ stats, userInteraction, onLike, onComment, onShare, onBookmark }) => {
    const { colors } = useTheme();
    const { triggerHaptic } = useHaptic();

    // Animation values
    const likeScale = useSharedValue(1);
    const bookmarkScale = useSharedValue(1);

    // Like animation
    const handleLike = useCallback(() => {
      triggerHaptic("light");
      likeScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
      onLike();
    }, [onLike, triggerHaptic, likeScale]);

    // Bookmark animation
    const handleBookmark = useCallback(() => {
      triggerHaptic("light");
      bookmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
      onBookmark();
    }, [onBookmark, triggerHaptic, bookmarkScale]);

    const likeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: bookmarkScale.value }],
    }));

    return (
      <View style={styles.container}>
        <View style={styles.leftActions}>
          {/* Like Button */}
          <AnimatedPressable
            onPress={handleLike}
            style={[styles.actionButton, likeAnimatedStyle]}
          >
            <Icon
              name={userInteraction.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={
                userInteraction.isLiked
                  ? colors.error.main
                  : colors.text.secondary
              }
            />
            {stats.likeCount > 0 && (
              <Text
                style={[styles.actionCount, { color: colors.text.secondary }]}
              >
                {stats.likeCount}
              </Text>
            )}
          </AnimatedPressable>

          {/* Comment Button */}
          <Pressable onPress={onComment} style={styles.actionButton}>
            <Icon
              name="chatbubble-outline"
              size={24}
              color={colors.text.secondary}
            />
            {stats.commentCount > 0 && (
              <Text
                style={[styles.actionCount, { color: colors.text.secondary }]}
              >
                {stats.commentCount}
              </Text>
            )}
          </Pressable>

          {/* Share Button */}
          <Pressable onPress={onShare} style={styles.actionButton}>
            <Icon
              name="paper-plane-outline"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>
        </View>

        {/* Bookmark Button */}
        <AnimatedPressable
          onPress={handleBookmark}
          style={[styles.actionButton, bookmarkAnimatedStyle]}
        >
          <Icon
            name={
              userInteraction.isBookmarked ? "bookmark" : "bookmark-outline"
            }
            size={24}
            color={
              userInteraction.isBookmarked
                ? colors.primary.main
                : colors.text.secondary
            }
          />
        </AnimatedPressable>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: "500",
  },
});
```

---

### Bottom Tab Navigation Component

**Modern 5 Tab Design - Merkez FAB (Floating Action Button) ile**

```typescript
// src/core/navigation/components/AnimatedTabBar/AnimatedTabBar.tsx

import React, { useCallback } from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

interface TabItem {
  name: string;
  label: string;
  icon: string;
  focusedIcon: string;
  accessibilityLabel: string;
  badge?: number; // Badge sayısı (mesajlar için)
}

interface AnimatedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TABS: TabItem[] = [
  {
    name: "FeedTab",
    label: "Ana Sayfa",
    icon: "home-outline",
    focusedIcon: "home",
    accessibilityLabel: "Ana sayfa sekmesi",
  },
  {
    name: "MessagingTab",
    label: "Mesajlar",
    icon: "chatbubble-outline",
    focusedIcon: "chatbubble",
    accessibilityLabel: "Mesajlar sekmesi",
    badge: 3, // TODO: Backend'den gelecek
  },
  {
    name: "CreateTab",
    label: "", // Merkez butonu label'sız
    icon: "add-circle",
    focusedIcon: "add-circle",
    accessibilityLabel: "Gönderi oluştur",
  },
  {
    name: "ActivityTab",
    label: "Etkinlik",
    icon: "trophy-outline",
    focusedIcon: "trophy",
    accessibilityLabel: "Etkinlik sekmesi",
  },
  {
    name: "ProfileTab",
    label: "Profil",
    icon: "person-outline",
    focusedIcon: "person",
    accessibilityLabel: "Profil sekmesi",
  },
];

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptic();
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback(
    (route: any, index: number, isFocused: boolean) => {
      triggerHaptic("light");

      // Merkez buton (Create) - modal aç
      if (index === 2) {
        navigation.navigate("CreatePost");
        return;
      }

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation, triggerHaptic]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.paper,
          borderTopColor: colors.border.light,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TABS[index];
        const isCreateButton = index === 2; // Merkez buton

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tab.accessibilityLabel}
            onPress={() => handleTabPress(route, index, isFocused)}
            style={[styles.tab, isCreateButton && styles.createTab]}
          >
            {/* Merkez Buton - Özel Tasarım */}
            {isCreateButton ? (
              <View
                style={[
                  styles.createButton,
                  { backgroundColor: colors.primary.main },
                ]}
              >
                <Icon name={tab.icon} size={32} color="#FFFFFF" />
              </View>
            ) : (
              <>
                {/* Normal Tab */}
                <View style={styles.iconContainer}>
                  <Icon
                    name={isFocused ? tab.focusedIcon : tab.icon}
                    size={24}
                    color={
                      isFocused ? colors.primary.main : colors.text.tertiary
                    }
                  />
                  {/* Badge (Mesajlar için) */}
                  {tab.badge && tab.badge > 0 && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.error.main },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Label */}
                {tab.label && (
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused
                          ? colors.primary.main
                          : colors.text.tertiary,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                )}
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  createTab: {
    marginTop: -20, // Yukarı kaydırma efekti
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0066FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
```

**Bottom Tab Navigation Özellikleri:**

1. **5 Tab Yapısı:**

   - 2 tab sol (Ana Sayfa, Mesajlar)
   - 1 tab merkez (Gönderi Oluştur - elevated)
   - 2 tab sağ (Etkinlik, Profil)

2. **Merkez FAB (Floating Action Button):**

   - Boyut: 56x56px (diğer iconların ~2 katı)
   - Renk: Primary color (#0066FF)
   - Shadow: Prominent shadow (iOS + Android elevation)
   - Position: Yukarı kaydırılmış (marginTop: -20px)
   - Davranış: Modal açar (CreatePost screen)

3. **Badge Sistemi:**

   - Mesajlar tabında okunmamış mesaj sayısı
   - Kırmızı badge (error.main color)
   - 1-9 arası direkt, 10+ için "9+"
   - Konum: İkon'un sağ üst köşesi

4. **Aktif/Pasif Durumlar:**

   - Aktif: Dolu ikon + primary color + bold label
   - Pasif: Outline ikon + tertiary color + normal label
   - Merkez buton: Her zaman vurgulu (primary color)

5. **Platform Optimizasyonları:**
   - iOS: Native blur effect, shadow
   - Android: Elevation 8
   - Safe Area: Bottom inset support

**UX Avantajları:**

✅ **Thumbs-Friendly:** En önemli aksiyonlar merkez ve yan taraflarda  
✅ **Visual Hierarchy:** Merkez buton açıkça öne çıkar  
✅ **Modern Estetik:** Instagram/TikTok/Twitter tarzı FAB tasarımı  
✅ **Bilgi Dengesi:** Badge'ler bilgilendirici ama dikkat dağıtmıyor  
✅ **Temiz Navigasyon:** Bildirimler header'da, tab bar sadece ana navigasyon

---

## 🎭 Empty State Yönetimi

### Empty State Felsefesi

Meslektaş uygulamasında boş durum = **fırsat**. Her boş ekran, kullanıcıyı bir sonraki adıma yönlendiren, motive eden ve değer sunan bir deneyimdir.

### Empty State Türleri

#### 1. **Yeni Kullanıcı Empty State (Onboarding)**

**Durum:** Kullanıcı ilk kez uygulamayı açıyor, henüz kimseyi takip etmiyor  
**Hedef:** Kullanıcıyı doğrulamaya ve ilk bağlantıları kurmaya yönlendirme

```typescript
// EmptyFeed - New User Variant

<EmptyState type="new-user">
  <LottieAnimation source={require("@assets/animations/welcome.json")} />

  <Title>Hoş Geldin, {user.name}! 👋</Title>

  <Description>
    Meslektaş topluluğu seni bekliyor. Başlamak için birkaç adım kaldı.
  </Description>

  <OnboardingChecklist>
    <ChecklistItem
      completed={user.hasAvatar}
      icon="camera"
      title="Profil fotoğrafı ekle"
      onPress={navigateToProfileEdit}
    />
    <ChecklistItem
      completed={user.isVerified}
      icon="shield-checkmark"
      title="Mesleğini doğrula"
      badge="Önemli"
      onPress={navigateToVerification}
    />
    <ChecklistItem
      completed={user.followingCount >= 3}
      icon="people"
      title="İlk 3 profesyoneli takip et"
      onPress={navigateToSuggestions}
    />
  </OnboardingChecklist>

  <ProgressBar progress={completionPercentage} />
</EmptyState>
```

#### 2. **No Following Empty State**

**Durum:** Kullanıcı kayıtlı ama kimseyi takip etmiyor  
**Hedef:** Kullanıcıyı keşfet sayfasına veya önerilere yönlendirme

```typescript
<EmptyState type="no-following">
  <LottieAnimation source={require("@assets/animations/search-people.json")} />

  <Title>Feed'in Henüz Boş</Title>

  <Description>
    Meslektaşlarını takip ederek güncellemelerini feed'inde gör.
  </Description>

  <SuggestedExpertsPreview limit={3} />

  <PrimaryButton onPress={navigateToDiscover}>Keşfet</PrimaryButton>

  <SecondaryButton onPress={showAllSuggestions}>
    Tüm Önerileri Gör
  </SecondaryButton>
</EmptyState>
```

#### 3. **No Posts from Following Empty State**

**Durum:** Kullanıcı takip ediyor ama henüz post yok  
**Hedef:** Kullanıcıyı ilk postu paylaşmaya teşvik etme

```typescript
<EmptyState type="no-posts">
  <LottieAnimation source={require("@assets/animations/empty-feed.json")} />

  <Title>Henüz Paylaşım Yok</Title>

  <Description>
    Takip ettiklerinden henüz paylaşım gelmedi. Sen ilk adımı at!
  </Description>

  <AISeedContent profession={user.profession}>
    <TrendCard trend="Bu hafta en çok konuşulan: ..." />
    <TipCard tip="Yeni uzmanlar için ipucu: ..." />
  </AISeedContent>

  <PrimaryButton onPress={navigateToCreatePost}>
    İlk Paylaşımını Yap
  </PrimaryButton>
</EmptyState>
```

### EmptyState Component Implementation

```typescript
// src/shared/components/EmptyState/EmptyState.tsx

import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTheme } from "@theme";
import { ModernButton } from "@shared/components";

export type EmptyStateType =
  | "new-user"
  | "no-following"
  | "no-posts"
  | "search-no-results"
  | "generic";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

const EMPTY_CONFIG = {
  "new-user": {
    animation: require("@assets/animations/welcome.json"),
    defaultTitle: "Hoş Geldin!",
    defaultDescription: "Meslektaş topluluğu seni bekliyor.",
  },
  "no-following": {
    animation: require("@assets/animations/search-people.json"),
    defaultTitle: "Feed'in Henüz Boş",
    defaultDescription: "Meslektaşlarını takip ederek güncellemelerini gör.",
  },
  "no-posts": {
    animation: require("@assets/animations/empty-feed.json"),
    defaultTitle: "Henüz Paylaşım Yok",
    defaultDescription: "İlk paylaşımı sen yap!",
  },
  "search-no-results": {
    animation: require("@assets/animations/search-empty.json"),
    defaultTitle: "Sonuç Bulunamadı",
    defaultDescription: "Farklı kelimeler deneyebilirsin.",
  },
  generic: {
    animation: require("@assets/animations/empty-generic.json"),
    defaultTitle: "Burada Henüz Bir Şey Yok",
    defaultDescription: "",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    type,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    children,
  }) => {
    const { colors } = useTheme();
    const config = EMPTY_CONFIG[type];

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <LottieView
            source={config.animation}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}
        >
          {title || config.defaultTitle}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.description, { color: colors.text.secondary }]}
        >
          {description || config.defaultDescription}
        </Animated.Text>

        {children && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            {children}
          </Animated.View>
        )}

        {actionLabel && onAction && (
          <Animated.View
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.actions}
          >
            <ModernButton variant="primary" size="large" onPress={onAction}>
              {actionLabel}
            </ModernButton>

            {secondaryActionLabel && onSecondaryAction && (
              <ModernButton
                variant="secondary"
                size="large"
                onPress={onSecondaryAction}
              >
                {secondaryActionLabel}
              </ModernButton>
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  actions: {
    marginTop: 32,
    width: "100%",
    gap: 12,
  },
});
```

---

## 🔄 State Yönetimi

### Feed State Store (Zustand)

```typescript
// src/features/feed/stores/feedStore.ts

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type FeedFilter = "all" | "following" | "popular" | "nearby";

interface FeedState {
  // Filter state
  activeFilter: FeedFilter;
  setActiveFilter: (filter: FeedFilter) => void;

  // UI state
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;

  // Scroll position (for tab switching)
  scrollOffset: number;
  setScrollOffset: (offset: number) => void;

  // Last refresh timestamp
  lastRefreshAt: number | null;
  updateLastRefresh: () => void;
}

export const useFeedStore = create<FeedState>()(
  immer((set) => ({
    // Initial state
    activeFilter: "all",
    isRefreshing: false,
    scrollOffset: 0,
    lastRefreshAt: null,

    // Actions
    setActiveFilter: (filter) =>
      set((state) => {
        state.activeFilter = filter;
      }),

    setIsRefreshing: (refreshing) =>
      set((state) => {
        state.isRefreshing = refreshing;
      }),

    setScrollOffset: (offset) =>
      set((state) => {
        state.scrollOffset = offset;
      }),

    updateLastRefresh: () =>
      set((state) => {
        state.lastRefreshAt = Date.now();
      }),
  }))
);
```

### FeedScreen Implementation

```typescript
// src/features/feed/screens/FeedScreen.tsx

import React, { useCallback, useMemo } from "react";
import { RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useColors } from "@contexts/ThemeContext";
import { useFeedPosts, useLikePost, useBookmarkPost } from "../hooks";
import {
  FeedHeader,
  PostCard,
  EmptyFeed,
  FeedSkeleton,
  VerificationPromptCard,
  AITrendInsightCard,
  SuggestedExpertsCarousel,
} from "../components";
import { useFeedStore } from "../stores";
import { useAuthStore } from "@features/auth/stores";

export const FeedScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();

  // Store state
  const activeFilter = useFeedStore((state) => state.activeFilter);
  const setActiveFilter = useFeedStore((state) => state.setActiveFilter);

  // Auth state
  const user = useAuthStore((state) => state.user);
  const isVerified = user?.isVerified ?? false;

  // Notifications state (backend'den gelecek)
  const unreadNotifications = 3; // TODO: useNotifications hook'undan gelecek

  // Feed data
  const professionFilter =
    activeFilter === "all" ? undefined : user?.professionId;
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedPosts(professionFilter);

  // Mutations
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();

  // Handlers
  const handleLike = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        likePost.mutate({ postId, isLiked: post.userInteraction.isLiked });
      }
    },
    [posts, likePost]
  );

  const handleComment = useCallback(
    (postId: number) => {
      navigation.navigate("Comments" as never, { postId } as never);
    },
    [navigation]
  );

  const handleBookmark = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        bookmarkPost.mutate({
          postId,
          isBookmarked: post.userInteraction.isBookmarked,
        });
      }
    },
    [posts, bookmarkPost]
  );

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render item
  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      // Insert suggested experts every 5 posts
      if (index > 0 && index % 5 === 0) {
        return (
          <>
            <SuggestedExpertsCarousel />
            <PostCard
              post={item}
              index={index}
              onLike={handleLike}
              onComment={handleComment}
              onBookmark={handleBookmark}
            />
          </>
        );
      }

      return (
        <PostCard
          post={item}
          index={index}
          onLike={handleLike}
          onComment={handleComment}
          onBookmark={handleBookmark}
        />
      );
    },
    [handleLike, handleComment, handleBookmark]
  );

  // List header
  const ListHeaderComponent = useMemo(
    () => (
      <>
        {!isVerified && <VerificationPromptCard />}
        <AITrendInsightCard profession={user?.profession} />
      </>
    ),
    [isVerified, user?.profession]
  );

  // List empty
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return <FeedSkeleton />;

    if (user?.followingCount === 0) {
      return <EmptyFeed type="no-following" />;
    }

    return <EmptyFeed type="no-posts" />;
  }, [isLoading, user?.followingCount]);

  // List footer
  const ListFooterComponent = useMemo(() => {
    if (isFetchingNextPage) {
      return <FeedSkeleton count={2} />;
    }
    return null;
  }, [isFetchingNextPage]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.default }}
    >
      <FeedHeader
        unreadNotifications={unreadNotifications}
        onNotificationPress={() =>
          navigation.navigate("NotificationsTab" as never)
        }
        userProfession={user?.profession}
      />

      <FlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      />
    </SafeAreaView>
  );
};
```

---

## 🎨 UI/UX Implementasyonu

### Design System Tokens

```typescript
// src/theme/colors.ts - Renk Paleti

export const palette = {
  // Brand Blue
  blue: {
    50: "#E6F0FF",
    100: "#CCE0FF",
    500: "#0066FF", // Primary
    600: "#0052CC",
    900: "#001433",
  },

  // Success Green
  green: {
    500: "#00C853",
    600: "#00A344",
  },

  // Error Red
  red: {
    500: "#FF3B30",
    600: "#CC2F26",
  },

  // Neutral Gray
  gray: {
    0: "#FFFFFF",
    50: "#FAFBFC",
    100: "#F4F5F7",
    500: "#A5ADBA",
    900: "#172B4D",
  },
};

export const lightColors = {
  primary: {
    main: palette.blue[500],
    light: palette.blue[100],
    dark: palette.blue[600],
  },
  background: {
    default: palette.gray[0],
    paper: palette.gray[50],
    elevated: palette.gray[0],
  },
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[600],
    tertiary: palette.gray[500],
    inverse: palette.gray[0],
  },
  border: {
    default: palette.gray[200],
    light: palette.gray[100],
  },
  error: {
    main: palette.red[500],
  },
  success: {
    main: palette.green[500],
  },
};
```

### Typography System

```typescript
// src/theme/typography.ts

import { Platform } from "react-native";

export const fontFamily = {
  display: Platform.select({
    ios: "SF Pro Display",
    android: "Roboto",
  }),
  body: Platform.select({
    ios: "SF Pro Text",
    android: "Roboto",
  }),
};

export const typography = {
  h1: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  body1: {
    fontFamily: fontFamily.body,
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 24,
  },
  body2: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamily.body,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
  },
};
```

### Spacing System

```typescript
// src/theme/spacing.ts

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
};
```

---

## ✨ Animasyon ve Etkileşimler

### Spring Animasyon Konfigürasyonu

```typescript
// src/theme/animations.ts

export const spring = {
  // Yumuşak ve doğal - genel kullanım
  gentle: {
    damping: 20,
    stiffness: 150,
  },

  // Hızlı ve canlı - butonlar
  snappy: {
    damping: 15,
    stiffness: 200,
  },

  // Basma hissi - press animasyonları
  press: {
    damping: 10,
    stiffness: 300,
  },

  // Yavaş ve smooth - modal açılma
  smooth: {
    damping: 25,
    stiffness: 120,
  },
};

export const timing = {
  fast: 200,
  normal: 300,
  slow: 500,
};
```

### Haptic Feedback Patterns

```typescript
// src/shared/hooks/useHaptic.ts

import * as Haptics from "expo-haptics";

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning";

export const useHaptic = () => {
  const triggerHaptic = (type: HapticType) => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  };

  return { triggerHaptic };
};
```

### Micro-interactions

#### 1. Like Animation (Double Tap + Button)

```typescript
// Double tap heart burst animation
const doubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
    "worklet";
    if (!post.userInteraction.isLiked) {
      // Heart scale animation
      heartScale.value = withSpring(1.3, spring.snappy);
      heartOpacity.value = 1;

      // Auto hide
      heartScale.value = withDelay(600, withSpring(0, spring.smooth));
      heartOpacity.value = withDelay(600, withSpring(0));

      runOnJS(handleLike)();
    }
  });
```

#### 2. Pull to Refresh

```typescript
// Custom pull-to-refresh with spring animation
const scrollY = useSharedValue(0);
const refreshThreshold = -100;

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
  onEndDrag: (event) => {
    if (event.contentOffset.y < refreshThreshold) {
      runOnJS(handleRefresh)();
    }
  },
});
```

#### 3. Skeleton Loading

```typescript
// Shimmer effect for loading states
const FeedSkeleton = ({ count = 3 }) => {
  const shimmerTranslate = useSharedValue(-300);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(300, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPostCard key={index} shimmerStyle={shimmerStyle} />
      ))}
    </>
  );
};
```

---

## ⚡ Performans Optimizasyonu

### FlashList Optimizasyonu

```typescript
// src/features/feed/screens/FeedScreen.tsx

// ✅ DO: Use FlashList for better performance
<FlashList
  data={posts}
  renderItem={renderItem}
  estimatedItemSize={400} // Ortalama post yüksekliği
  drawDistance={800} // Render mesafesi
  // Optimization props
  keyExtractor={keyExtractor}
  removeClippedSubviews={true}
  maxToRenderPerBatch={5}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  // Callbacks
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
/>

// ❌ DON'T: Use FlatList for large lists
```

### Memoization Strategy

```typescript
// Component memoization
export const PostCard = memo(
  ({ post, ...handlers }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.stats.likeCount === nextProps.post.stats.likeCount &&
      prevProps.post.userInteraction.isLiked ===
        nextProps.post.userInteraction.isLiked
    );
  }
);

// Callback memoization
const handleLike = useCallback(
  (postId: number) => {
    likePost.mutate({ postId });
  },
  [likePost]
);

// Value memoization
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => b.relevanceScore - a.relevanceScore);
}, [posts]);
```

### Image Optimization

```typescript
// expo-image with blurhash and caching
<Image
  source={{ uri: post.images[0].url }}
  placeholder={{ blurhash: post.images[0].blurhash }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  priority="high"
  style={styles.postImage}
/>;

// Thumbnail for list, full size for detail
const imageSource = isListView
  ? post.images[0].thumbnailUrl
  : post.images[0].url;
```

### React Query Configuration

```typescript
// src/config/queryClient.ts

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 dakika
      gcTime: 10 * 60 * 1000, // 10 dakika (eski cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Optimistic updates for better UX
useMutation({
  mutationFn: feedService.toggleLike,
  onMutate: async ({ postId }) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });

    // Snapshot previous value
    const previousFeed = queryClient.getQueryData([FEED_QUERY_KEY]);

    // Optimistically update
    queryClient.setQueryData([FEED_QUERY_KEY], (old) => {
      return updatePostLike(old, postId);
    });

    return { previousFeed };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData([FEED_QUERY_KEY], context.previousFeed);
  },
});
```

---

## 🤖 AI Agent Geliştirme Talimatları

### Geliştirme Öncelikleri

#### Faz 1: Temel Yapı (Öncelik: 🔴 Yüksek)

1. ✅ **FeedScreen skeleton oluştur**
2. ✅ **Backend API entegrasyonu** - useFeed hook
3. ✅ **PostCard component** - temel gönderi kartı
4. ✅ **FeedHeader component** - meslek ikonu, bildirim
5. ⏳ **Bottom Tab Navigation** - 5 tab modern tasarım (merkez FAB)
6. ✅ **Loading states** - skeleton ve spinner

#### Faz 2: Etkileşimler (Öncelik: 🟡 Orta)

1. ⏳ **Like/Bookmark mutations** - optimistic updates
2. ⏳ **Pull-to-refresh** - custom spring animation
3. ⏳ **Infinite scroll** - cursor-based pagination
4. ⏳ **Double tap to like** - gesture handling
5. ⏳ **Haptic feedback** - tüm etkileşimlere
6. ⏳ **CreatePost modal** - gönderi oluşturma (merkez FAB)

#### Faz 3: Empty States & Activity (Öncelik: 🟢 Normal)

1. ⏳ **EmptyFeed component** - 3 varyant
2. ⏳ **Onboarding checklist** - yeni kullanıcı
3. ⏳ **AI seed content** - meslek bazlı içerik
4. ⏳ **Suggested experts** - carousel component
5. ⏳ **Activity/Challenge ekranı** - gamification sistemi
6. ⏳ **Leaderboard component** - haftalık sıralama

#### Faz 4: Polish & Advanced Features (Öncelik: 🔵 Düşük)

1. ⏳ **Animations refinement** - 60 FPS garantisi
2. ⏳ **Dark mode** - tema desteği
3. ⏳ **Accessibility** - screen reader desteği
4. ⏳ **Performance monitoring** - metrics toplama
5. ⏳ **Badge notifications** - real-time updates (WebSocket)
6. ⏳ **Challenge push notifications** - yeni görev bildirimleri

### Kritik Geliştirme Kuralları

#### ✅ YAPILMASI GEREKENLER

1. **TypeScript Strict Mode:**

```typescript
// ✅ DO: Full type safety
interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
}

// ❌ DON'T: Any types
const handleAction = (data: any) => {};
```

2. **Performance First:**

```typescript
// ✅ DO: Memoize expensive operations
const sortedPosts = useMemo(() =>
  posts.sort((a, b) => b.score - a.score),
  [posts]
);

// ❌ DON'T: Inline operations in render
{posts.sort((a, b) => b.score - a.score).map(...)}
```

3. **Reanimated for Animations:**

```typescript
// ✅ DO: Use reanimated worklets
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// ❌ DON'T: Use Animated API from RN
Animated.timing(value, { ... }).start();
```

4. **Error Boundaries:**

```typescript
// ✅ DO: Wrap components
<ErrorBoundary fallback={<ErrorScreen />}>
  <FeedScreen />
</ErrorBoundary>

// ❌ DON'T: Let app crash
```

5. **Accessibility:**

```typescript
// ✅ DO: Add accessibility props
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Gönderiyi beğen"
  accessibilityHint="Gönderiyi beğenmek için tıklayın"
>

// ❌ DON'T: Ignore a11y
<Pressable onPress={handlePress}>
```

#### ❌ YAPILMAMASI GEREKENLER

1. **setState in loops**
2. **Inline anonymous functions in renderItem**
3. **Deep nesting (> 4 levels)**
4. **Unused imports/variables**
5. **Console.log in production**
6. **Hardcoded strings (use i18n)**
7. **Direct state mutation**
8. **Blocking main thread**

### Test Senaryoları

#### Unit Tests

```typescript
// src/features/feed/hooks/__tests__/useFeed.test.ts

describe("useFeed", () => {
  it("should fetch feed posts", async () => {
    const { result } = renderHook(() => useFeed());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.posts).toHaveLength(20);
  });

  it("should handle pagination", async () => {
    const { result } = renderHook(() => useFeed());
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(40));
  });
});
```

#### Integration Tests

```typescript
// src/features/feed/__tests__/FeedScreen.test.tsx

describe("FeedScreen", () => {
  it("should render empty state when no posts", () => {
    const { getByText } = render(<FeedScreen />);
    expect(getByText("Feed'in Henüz Boş")).toBeTruthy();
  });

  it("should render posts when available", async () => {
    const { getAllByTestId } = render(<FeedScreen />);
    await waitFor(() => {
      expect(getAllByTestId("post-card")).toHaveLength(20);
    });
  });

  it("should handle like action", async () => {
    const { getAllByTestId } = render(<FeedScreen />);
    const likeButton = getAllByTestId("like-button")[0];

    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(likeButton).toHaveStyle({ color: "#FF3B30" });
    });
  });
});
```

### Kod Standartları

#### File Naming

```
✅ PostCard.tsx (PascalCase for components)
✅ useFeed.ts (camelCase for hooks)
✅ feedService.ts (camelCase for services)
✅ feed.types.ts (camelCase.types.ts for types)
✅ FeedScreen.styles.ts (PascalCase.styles.ts for styles)

❌ postCard.tsx
❌ UseFeed.ts
❌ FeedService.ts
```

#### Import Order

```typescript
// 1. React & React Native
import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Third-party libraries
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

// 3. Internal modules
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

// 4. Components
import { Avatar, Badge } from "@shared/components";
import { PostActions } from "./PostActions";

// 5. Types
import type { Post } from "../types";

// 6. Styles
import { styles } from "./PostCard.styles";
```

---

## 📊 Başarı Metrikleri

### Performans KPI'ları

- **Initial Load:** < 1 saniye
- **Scroll FPS:** Sabit 60 FPS
- **Time to Interactive:** < 2 saniye
- **Bundle Size:** < 5MB (JS bundle)

### Kullanıcı Deneyimi KPI'ları

- **Empty State Engagement:** > %40 click-through
- **Pull-to-Refresh Usage:** > %30 daily active users
- **Average Session Duration:** > 5 dakika
- **Feed Scroll Depth:** > %60 users scroll 10+ posts

### Teknik KPI'ları

- **Test Coverage:** > %80
- **TypeScript Strict:** %100
- **Accessibility Score:** > 90/100
- **Lighthouse Performance:** > 85/100

---

## 🚀 Deployment Checklist

### Pre-Production

- [ ] Tüm unit testler geçiyor
- [ ] Integration testler geçiyor
- [ ] E2E testler geçiyor
- [ ] Performance profiling yapıldı
- [ ] Memory leaks kontrol edildi
- [ ] Accessibility audit yapıldı
- [ ] Bundle size optimize edildi
- [ ] Error tracking entegre edildi (Sentry)
- [ ] Analytics entegre edildi (Firebase/Mixpanel)

### Production

- [ ] Feature flags aktif
- [ ] A/B test setup hazır
- [ ] Monitoring dashboards kurulu
- [ ] Alert rules tanımlı
- [ ] Rollback planı hazır
- [ ] Documentation güncel
- [ ] Team training tamamlandı

---

**Doküman Sonu**  
_Bu dokümantasyon, AI agent tarafından hatasız ve eksiksiz geliştirme yapılabilmesi için hazırlanmıştır._
