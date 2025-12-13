# 🎨 Instagram-Style Profile Screen

## Tasarım Özellikleri

Backend'inize **%100 uyumlu**, Instagram tarzında minimal profil ekranı tasarımı.

### 🎯 Tasarım Hedefleri

- ✅ **Instagram Benzeri**: Tanıdık, modern UI
- ✅ **Soft Orange Theme**: #F59E42 ana renk
- ✅ **Backend Uyumlu**: API response'larıyla birebir entegrasyon
- ✅ **Kullanıcı Deneyimi**: Temiz, sade, kolay kullanım
- ✅ **Light Theme**: Beyaz arka plan, minimal shadow'lar

---

## 📐 Ekran Bölümleri

### 1️⃣ **Profile Header - Instagram Style**

```
┌────────────────────────────────────┐
│  [AVATAR]    42        1.2K   856  │  ← Sol: Avatar (86x86)
│   86x86    Gönderi  Takipçi Takip  │  ← Sağ: İstatistikler
│                                    │
└────────────────────────────────────┘
```

**Özellikler:**
- ✅ Avatar **sol tarafta** (86x86px)
- ✅ **Tıklanabilir** - Tam ekran görüntüleme
- ✅ Kamera ikonu YOK
- ✅ İstatistikler sağ tarafta (horizontal)

**Backend Verileri:**
- `avatarUrl` - Profil fotoğrafı URL'i
- `stats.postCount` - Gönderi sayısı
- `stats.followerCount` - Takipçi sayısı  
- `stats.followingCount` - Takip edilen sayısı

### 2️⃣ **Name + Info Section**

```
┌────────────────────────────────────┐
│  Ahmet Yılmaz  ✏️                  │  ← fullName + Edit ikonu
│  Yazılım Geliştirici 🛡️            │  ← professionName + verified
│                                    │
│  Yazılım geliştirici, mobil        │  ← Bio
│  uygulama tutkunu...               │
│                                    │
└────────────────────────────────────┘
```

**Backend Verileri:**
- `fullName` - API'den gelen kullanıcı adı
- `professionName` - Meslek bilgisi
- `isProfessionVerified` - Doğrulanma durumu (🛡️ ikonu)
- `bio` - Kullanıcı biyografisi (opsiyonel)

### 3️⃣ **Actions Section**

#### **Kendi Profilim:**

```
┌────────────────────────────────────┐
│  [Profili Düzenle]     [⚙️]        │  ← 2 buton
└────────────────────────────────────┘
```

**Özellikler:**
- ✅ Profil fotoğrafı değiştirme: Sadece "Profil Düzenle" ekranında
- ✅ Ayarlar butonu: Ayarlar ekranına yönlendirir
- ✅ Çıkış Yap butonu: Profil ekranında DEĞİL, Ayarlar ekranında

**Navigasyon:** 
- Profili Düzenle → `/edit-profile`
- Ayarlar → `/settings`

#### **Başkasının Profili:**

```
┌────────────────────────────────────┐
│  [Takip Et]     [Mesaj Gönder]     │  ← 2 buton
└────────────────────────────────────┘
```

**Backend Actions:**
- `POST /api/social/follow/{userId}` - Takip et
- `DELETE /api/social/unfollow/{userId}` - Takipten çık
- Navigate to Chat - Mesaj gönder

### 4️⃣ **Image Viewer (Tam Ekran Avatar)**

```
┌────────────────────────────────────┐
│             [X]                    │  ← Kapat butonu
│                                    │
│                                    │
│        [TAM EKRAN AVATAR]          │  ← Zoom, pinch
│                                    │
│                                    │
│  (Dışarı tıkla = kapat)            │
└────────────────────────────────────┘
```

**Özellikler:**
- ✅ Profil fotoğrafına tıkla → Tam ekran açılır
- ✅ Pinch to zoom (yakınlaştır/uzaklaştır)
- ✅ Resmin dışına dokun → Modal kapanır
- ✅ X butonu ile kapat
- ✅ Swipe down to dismiss

### 5️⃣ **Posts Section (Gönderiler)**

```
┌──────────────────────────────────┐
│  Gönderiler            42        │
├──────────────────────────────────┤
│                                  │
│  [Post Card 1]                   │
│  [Post Card 2]                   │
│  [Post Card 3]                   │
│        ...                       │
│                                  │
│  [ Daha Fazla Göster ]           │
│                                  │
└──────────────────────────────────┘
```

**Backend Verileri:**
- `posts[]` array - Kullanıcının gönderileri
- Infinite scroll ile pagination

**Empty State:**
```
┌──────────────────────────────────┐
│         📷                        │
│                                  │
│  Henüz gönderi yok               │
│                                  │
└──────────────────────────────────┘
```

---

## 🎨 Renk Paleti

```typescript
// Primary - Soft Orange
primary: '#F59E42'

// Backgrounds
background: '#FFFFFF'
cardBackground: '#FFFFFF'
inputBackground: '#F5F5F5'

// Text
textPrimary: '#1A1A1A'
textSecondary: '#666666'
textTertiary: '#999999'

// Borders
border: '#E0E0E0'
borderLight: '#F0F0F0'

// Success (Verified Badge)
success: '#10C55F'

// Shadows
shadow: 'rgba(0, 0, 0, 0.06)'
```

---

## 📱 Bottom Navigation

```
┌────────────────────────────────────┐
│  🏠    💬    ➕    🏆    👤        │
│ Ana   Mesaj  Post  Etkinlik Profil │
└────────────────────────────────────┘
```

**Navigasyon:**
- Ana Sayfa → `/feed`
- Mesajlar → `/messages`
- Gönderi Ekle → `/create-post`
- Etkinlik → `/activity`
- Profil → `/profile`

---

## ⚙️ Settings Screen (Ayarlar Ekranı)

```
┌──────────────────────────────────┐
│  < Ayarlar                       │
├──────────────────────────────────┤
│                                  │
│  👤 Hesap Bilgileri         >    │
│  🔔 Bildirim Ayarları       >    │
│  🔒 Gizlilik               >    │
│  🛡️ Güvenlik                >    │
│                                  │
│  ──────────────────────────      │
│                                  │
│  🚪 Çıkış Yap                    │  ← Kırmızı buton
│                                  │
└──────────────────────────────────┘
```

**Backend Endpoints:**
- `GET /api/users/me` - Hesap bilgileri
- `PUT /api/users/me` - Profil güncelleme
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/settings/notifications` - Bildirim ayarları
- `GET /api/settings/privacy` - Gizlilik ayarları

---

## 🔌 Backend API Entegrasyonu

### Profil Görüntüleme

```typescript
// Kendi profilim
GET /api/users/me
Response: MyProfileResponse {
  id, email, name, surname, fullName,
  bio, avatarUrl, professionName,
  isProfessionVerified, stats: { ... }
}

// Başka kullanıcı profili
GET /api/users/{userId}
Response: ProfileResponse {
  userId, fullName, bio, avatarUrl,
  professionName, isProfessionVerified,
  isFollowing, isFollowedBy, stats: { ... }
}
```

### İstatistikler

```typescript
GET /api/users/{userId}/stats
Response: ProfileStats {
  postCount: number,
  followerCount: number,
  followingCount: number
}
```

### Gönderiler

```typescript
GET /api/posts/user/{userId}?page=0&size=10
Response: Page<Post> {
  content: Post[],
  totalElements, totalPages, ...
}
```

### Takip İşlemleri

```typescript
// Takip et
POST /api/social/follow/{userId}

// Takipten çık
DELETE /api/social/unfollow/{userId}
```

---

## 📦 Dosya Yapısı

```
src/features/profile/
├── screens/
│   ├── ModernProfileScreen.tsx         ← Yeni modern tasarım
│   ├── ProfileScreen.modern.styles.ts  ← Stil dosyası
│   ├── ProfileScreen.tsx               ← Eski tasarım (yedek)
│   ├── EditProfileScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── ProfileHeader/
│   ├── ProfileStats/
│   ├── ProfileBio/
│   └── ProfileActions/
├── hooks/
│   ├── useProfile.ts
│   ├── useMyProfile.ts
│   └── useProfileStats.ts
└── types/
    └── profile.types.ts
```

---

## 🚀 Kullanım

### Navigator'da Aktifleştirme

```typescript
// src/core/navigation/MainNavigator.tsx

import { ModernProfileScreen } from '@features/profile/screens/ModernProfileScreen';

<ProfileStack.Screen 
  name="Profile" 
  component={ModernProfileScreen}  // ← Yeni modern ekran
/>
```

### Direkt Import

```typescript
import { ModernProfileScreen } from '@features/profile/screens';

<ModernProfileScreen />
```

---

## ✅ Backend Uyumluluk Checklist

- ✅ `fullName` → API field ile birebir eşleşir
- ✅ `avatarUrl` → Direct binding
- ✅ `professionName` → API'den geliyor
- ✅ `isProfessionVerified` → Boolean flag
- ✅ `bio` → Optional field
- ✅ `stats.postCount`, `followerCount`, `followingCount` → API yapısı
- ✅ `posts[]` → Backend pagination ile uyumlu
- ✅ `isFollowing`, `isFollowedBy` → Relationship flags
- ✅ `/settings` route → Backend yönlendirme
- ✅ Follow/Unfollow actions → Backend API calls

---

## 🎯 Tasarım Prensipleri

1. **Spacing**: Geniş boşluklar (24px, 32px)
2. **Typography**: Net, büyük fontlar (22px, 20px, 18px)
3. **Colors**: Soft orange (#F59E42) + Nötr gri tonları
4. **Shadows**: Minimal, soft (opacity: 0.06-0.12)
5. **Borders**: İnce (1px), yumuşak köşeler (12px-16px)
6. **Icons**: Ionicons, 18-20px boyut
7. **Buttons**: Yuvarlak köşeler, soft outline
8. **Cards**: Beyaz arka plan, elevation shadow

---

## 📸 Ekran Görüntüleri

### Kendi Profilim
- Büyük avatar (96x96)
- Kamera ikonu
- Edit butonu
- İstatistik kartı
- Ayarlar butonu
- Gönderiler listesi

### Başka Kullanıcı Profili
- Avatar (tıklanamaz)
- Takip Et butonu
- Mesaj gönder butonu
- İstatistikler
- Gönderiler

---

## 🔄 Migration (Eski → Yeni)

Mevcut `ProfileScreen.tsx` korundu (yedek olarak).

Yeni tasarım: `ModernProfileScreen.tsx`

**Değişiklikler:**
- ✅ Instagram-style horizontal layout (avatar + stats)
- ✅ Profil fotoğrafı sol tarafta (86x86px)
- ✅ Tam ekran avatar görüntüleme (ImageViewer)
- ✅ Kamera ikonu kaldırıldı
- ✅ Profil düzenleme: Sadece "Profil Düzenle" ekranında
- ✅ Bio ve profession bilgileri avatar altında
- ✅ Minimal, temiz tasarım
- ✅ Backend %100 uyumlu

---

## 📝 Önemli Notlar

### ✅ Yapılanlar:
- [x] Avatar sol tarafa taşındı
- [x] İstatistikler sağ tarafa horizontal yerleştirildi
- [x] Avatar tıklanabilir (tam ekran görüntüleme)
- [x] ImageViewer entegrasyonu (zoom, pinch)
- [x] Kamera ikonu kaldırıldı
- [x] Profil düzenle + Ayarlar butonları
- [x] Bio ve profession avatar altında

### 🚫 Kaldırılanlar:
- Kamera ikonu (ana ekranda)
- Ortalanmış avatar düzeni
- Çıkış Yap butonu (profil ekranından)
- Stats card (kartlı görünüm)

### ⚠️ Önemli Kurallar:
1. **Profil fotoğrafı değiştirme**: SADECE "Profil Düzenle" ekranında
2. **Çıkış Yap butonu**: SADECE "Ayarlar" ekranında
3. **Avatar tıklama**: Tam ekran görüntüleme (ImageViewer)
4. **Modal kapatma**: Resmin dışına dokun VEYA X butonuna tıkla

---

## 🎨 Tasarım Referansları

- **Instagram** → Primary inspiration (layout, stats, buttons)
- **WhatsApp** → Profile photo full screen view
- **iOS Native** → Smooth animations, minimal design

---

**Tasarım Onayı:** ✅ Instagram benzeri, backend ile %100 uyumlu  
**Kod Durumu:** ✅ Prodüksiyona hazır  
**Test:** ✅ Tüm API entegrasyonları çalışıyor
**ImageViewer:** ✅ Tam ekran avatar görüntüleme
