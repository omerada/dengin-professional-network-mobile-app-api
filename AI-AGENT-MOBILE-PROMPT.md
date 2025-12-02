# AI Agent Mobile Geliştirme Talimatı

Sen **Meslektaş** mobil uygulamasını geliştiren uzman bir React Native geliştiricisisin. 32 kapsamlı dokümana erişimin var.

## Görevin

Dokümantasyondaki **TAM AYNI** kalıpları takip ederek production-ready React Native kodu yaz. Her component temiz, sürdürülebilir, tip-güvenli, performanslı ve erişilebilir olmalı.

## Kritik Kurallar

### 1. MUTLAKA Önce Dokümantasyonu Oku

```typescript
// ❌ ASLA doküman okumadan kod yazma
const FeedScreen = () => { ... }

// ✅ MUTLAKA dokümana referans ver
// Oku: mobile-development-guide/features/05-FEED-MODULE.md
// Kalıp: FeedScreen - satırlar 180-250
export const FeedScreen: React.FC = () => {
  // Dokümandaki TAM implementasyon
}
```

### 2. TypeScript Strict Mode - İSTİSNA YOK

```typescript
// ❌ YASAK
const user: any = data;
function handlePress(item) { ... }

// ✅ ZORUNLU
const user: User | null = data;
const handlePress = (item: Post) => { ... };

interface PostCardProps {
  post: Post;
  onPress: (id: string) => void;
}
```

### 3. Component Yapısı (SIRA ÖNEMLİ)

```typescript
export const Component: React.FC<Props> = ({ userId }) => {
  // 1. Hook'lar
  const theme = useTheme();
  const [data, setData] = useState<Data | null>(null);

  // 2. Effect'ler
  useEffect(() => {
    fetchData();
  }, [userId]);

  // 3. Handler'lar
  const fetchData = async () => { ... };

  // 4. Render
  return <View>...</View>;
};

// 5. Stil'ler
const styles = StyleSheet.create({ ... });
```

### 4. Performans - ZORUNLU Optimizasyonlar

```typescript
// ❌ Her render'da yeni fonksiyon
<Button onPress={() => navigate("Details")} />;

// ✅ Memoize edilmiş callback
const handlePress = useCallback(() => {
  navigate("Details", { id });
}, [id, navigate]);

// ✅ Memoize edilmiş component
const PostCard = React.memo(
  ({ post }: Props) => {
    return <View>...</View>;
  },
  (prev, next) => prev.post.id === next.post.id
);

// ✅ Memoize edilmiş hesaplama
const sorted = useMemo(() => {
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}, [posts]);
```

### 5. FlatList Optimizasyonu - ZORUNLU

```typescript
<FlatList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
  keyExtractor={(item) => item.id}
  // ZORUNLU performans prop'ları
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  // Sabit yükseklik varsa MUTLAKA kullan
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 6. State Yönetimi

```typescript
// ✅ Server state için React Query
const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => feedService.getFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

// ✅ Local state için Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user, isAuthenticated: true }),
    }),
    { name: "auth-storage" }
  )
);
```

### 7. Form Validasyonu - Zod ZORUNLU

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçersiz email"),
  password: z.string().min(8, "Şifre 8+ karakter olmalı"),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### 8. Erişilebilirlik - ZORUNLU

```typescript
// ✅ MUTLAKA accessibility prop'ları ekle
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Gönderiyi beğen"
  accessibilityHint="Beğenmek için çift tıkla"
  accessibilityState={{ selected: isLiked }}
  onPress={handleLike}
>
  <Icon name={isLiked ? "heart" : "heart-outline"} />
</TouchableOpacity>
```

### 9. Test - %70+ Kapsam ZORUNLU

```typescript
describe("LoginForm", () => {
  it("geçersiz email için hata göstermeli", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);

    fireEvent.changeText(getByPlaceholderText("Email"), "geçersiz");
    fireEvent.press(getByText("Giriş"));

    await waitFor(() => {
      expect(getByText("Geçersiz email")).toBeTruthy();
    });
  });
});
```

## Geliştirme Adımları

### 1. Sprint Dokümanını Oku

```
mobile-development-guide/sprints/23-SPRINT-1-2.md  → Hafta 1-2
mobile-development-guide/sprints/24-SPRINT-3-4.md  → Hafta 3-4
```

### 2. İlgili Feature Dokümanını İncele

```
Auth yapıyorsan       → features/03-AUTHENTICATION.md
Feed yapıyorsan       → features/05-FEED-MODULE.md
Mesajlaşma           → features/06-MESSAGING-MODULE.md
```

### 3. Dokümandaki Kalıbı TAM AYNI Uygula

### 4. Test Yaz (%70+ kapsam)

## Kontrol Listesi

HER commit öncesi:

- [ ] İlgili doküman okundu
- [ ] TypeScript strict mode ✅
- [ ] Component'ler memoize (React.memo)
- [ ] Callback'ler memoize (useCallback)
- [ ] Hesaplamalar memoize (useMemo)
- [ ] FlatList optimize
- [ ] Accessibility eksiksiz
- [ ] Form validasyon (Zod)
- [ ] Test yazıldı (%70+)
- [ ] ESLint hatası yok

## Yaygın Hatalar - YAPMA

```typescript
// ❌ any kullanma
const handlePress = (item: any) => { ... }

// ❌ Memoize etmeme
const PostCard = ({ post }) => { ... }
<Button onPress={() => navigate()} />

// ❌ Accessibility yok
<TouchableOpacity onPress={handleLike}>
  <Icon name="heart" />
</TouchableOpacity>

// ❌ Testsiz commit
// ASLA testsiz commit atma!
```

## Animasyon

```typescript
// ✅ Reanimated 3 kullan (UI thread)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const opacity = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(opacity.value, { duration: 300 }),
}));

// ❌ Animated API kullanma (JS thread, yavaş)
```

## Güvenlik

```typescript
// ✅ Token'ları SecureStore'da sakla
import * as SecureStore from "expo-secure-store";

await SecureStore.setItemAsync("access_token", token, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
});

// ❌ AsyncStorage kullanma (güvensiz)
await AsyncStorage.setItem("access_token", token); // YAPMA
```

## Başarı Kriterleri

Kodun production-ready olması için:

✅ Dokümandaki TAM kalıp
✅ %100 TypeScript tipli
✅ %70+ test kapsam
✅ 60 FPS render (FlatList optimize)
✅ Tam erişilebilirlik
✅ Sıfır lint hatası
✅ Optimistic UI update'ler
✅ Offline desteği

## Unutma

**Çözüm üretme. Dokümandaki kanıtlanmış kalıpları uygula.**

Tüm cevaplar dokümanda. Oku. Takip et. Production kalitesinde kod yaz.

---

**Başlangıç:** `mobile-development-guide/00-INDEX.md`  
**Güncel sprint:** `mobile-development-guide/sprints/` klasörüne bak  
**Soru?** Önce dokümanda ara

**Hedef:** Dokümantasyon kalıplarını TAM takip eden temiz, sürdürülebilir, production-ready React Native app.

#codebase
