# 📱 Ekran Tasarımları ve Wireframe Spesifikasyonları

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Tasarım Prensipleri](#tasarım-prensipleri)
2. [Renk Paleti ve Tipografi](#renk-paleti-ve-tipografi)
3. [Onboarding Ekranları](#onboarding-ekranları)
4. [Ana Ekranlar](#ana-ekranlar)
5. [Feed ve Gönderi Ekranları](#feed-ve-gönderi-ekranları)
6. [Sohbet Ekranları](#sohbet-ekranları)
7. [Profil ve Ayarlar Ekranları](#profil-ve-ayarlar-ekranları)
8. [Özel Durumlar ve Modaller](#özel-durumlar-ve-modaller)

---

## 🎨 Tasarım Prensipleri

### Temel İlkeler

1. **Minimal ve Temiz**

   - Gereksiz öğelerden kaçınma
   - Beyaz alanı etkin kullanma
   - Odak noktalarını belirgin yapma

2. **Profesyonel ve Güvenilir**

   - Kurumsal renk paleti
   - Tutarlı tipografi
   - İkonların profesyonel görünümü

3. **Erişilebilir ve Kullanıcı Dostu**

   - Yüksek kontrast oranları (WCAG 2.1 AA)
   - Büyük dokunma alanları (min 44x44 pt)
   - Anlaşılır label'lar ve ipuçları

4. **Tutarlılık**
   - Component'ler arası tutarlılık
   - Platform spesifik tasarım (iOS/Android)
   - Navigasyon tutarlılığı

### Design System

**Platform:** React Native (iOS & Android)  
**UI Framework:** React Native Paper / Native Base (karar verilecek)  
**İkonlar:** React Native Vector Icons (Ionicons, Material Icons)  
**Animasyon:** React Native Reanimated

---

## 🎨 Renk Paleti ve Tipografi

### Renk Paleti

#### Primary Colors (Ana Renkler)

```
Primary Blue: #0066FF
  - Butonlar, linkler, aktif durumlar
  - Hex: #0066FF
  - RGB: (0, 102, 255)

Primary Dark: #0052CC
  - Hover states, darker variants

Primary Light: #3385FF
  - Background tints, lighter variants
```

#### Secondary Colors (İkincil Renkler)

```
Success Green: #00C853
  - Başarılı işlemler, onay mesajları

Error Red: #FF3B30
  - Hatalar, silme işlemleri, uyarılar

Warning Orange: #FF9500
  - Uyarılar, dikkat gerektiren durumlar

Info Blue: #5AC8FA
  - Bilgilendirme mesajları
```

#### Neutral Colors (Nötr Renkler)

```
White: #FFFFFF
  - Arka planlar, kartlar

Light Gray: #F5F5F5
  - Secondary backgrounds

Gray: #E0E0E0
  - Borders, dividers

Dark Gray: #757575
  - Secondary text

Black: #212121
  - Primary text, başlıklar
```

#### Professional Badges (Rozet Renkleri)

```
Verified Blue: #1DA1F2 (Meslek Doğrulanmış)
Premium Gold: #FFD700 (Mavi Tik)
Active Green: #00C853 (Aktif Üye)
```

### Tipografi

#### Font Family

```
iOS: SF Pro Text / SF Pro Display
Android: Roboto
```

#### Font Sizes & Weights

```css
/* Başlıklar */
H1: 32px, Bold (700)
H2: 24px, Semi-Bold (600)
H3: 20px, Semi-Bold (600)
H4: 18px, Medium (500)

/* Gövde Metinleri */
Body Large: 16px, Regular (400)
Body: 14px, Regular (400)
Body Small: 12px, Regular (400)

/* Butonlar ve Etiketler */
Button: 16px, Medium (500)
Caption: 12px, Regular (400)
Overline: 10px, Medium (500), UPPERCASE
```

#### Line Heights

```
H1: 40px (1.25)
H2: 32px (1.33)
H3: 28px (1.4)
Body: 20px (1.43)
Caption: 16px (1.33)
```

---

## 📱 Onboarding Ekranları

### SCR-001: Splash Screen

**Açıklama:** Uygulama açılırken gösterilen ilk ekran

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│          [LOGO: Meslektaş]      │
│                                 │
│                                 │
│                                 │
│        Loading Animation        │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Öğeler:**

- Uygulama logosu (merkez, 120x120)
- Loading spinner (altında)
- Beyaz arka plan

**Animasyon:** Fade-in logo, dönen spinner

---

### SCR-002: Onboarding Slider (İlk Açılış)

**Açıklama:** İlk kez açan kullanıcılara özellik tanıtımı

```
[Slide 1: Doğrulanmış Topluluk]
┌─────────────────────────────────┐
│         [İkon: Shield]          │
│                                 │
│   Doğrulanmış Profesyoneller    │
│                                 │
│   AI destekli doğrulama ile     │
│   %100 güvenilir topluluk       │
│                                 │
│         ●  ○  ○  ○              │
│                                 │
│  [Atla]            [İleri →]    │
└─────────────────────────────────┘

[Slide 2: Meslek Bazlı Ağ]
[Slide 3: Güvenli Sohbet]
[Slide 4: KVKK Uyumlu]
```

**Öğeler:**

- İllüstrasyon/İkon (üstte, 200x200)
- Başlık (H2, Bold, Center)
- Açıklama (Body, Center, max 2 satır)
- Progress Dots (4 adet)
- Atla butonu (Text Button, sol üst)
- İleri butonu (Primary Button, sağ alt)
- Son slide'da "Başlayalım" butonu

---

### SCR-003: Giriş/Kayıt Ekranı

**Açıklama:** Kullanıcının giriş veya kayıt olma seçeneği

```
┌─────────────────────────────────┐
│        [LOGO: Meslektaş]        │
│                                 │
│    Meslektaşlarınla Bağlan      │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🔵 Google ile Devam Et   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📸 Instagram ile Devam   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ✉️  E-posta ile Kayıt    │  │
│  └───────────────────────────┘  │
│                                 │
│  ────────  VEYA  ────────        │
│                                 │
│     Zaten hesabın var mı?       │
│         [Giriş Yap]             │
│                                 │
│  By continuing, you agree to    │
│  our Terms & Privacy Policy     │
└─────────────────────────────────┘
```

**Öğeler:**

- Logo (80x80, merkez üst)
- Başlık (H3, Center)
- 3 OAuth Butonu (48px height, full width - 32px margin)
- Divider ("VEYA" text)
- Giriş yap linki (Text Button)
- Terms & Privacy linki (Caption, Center)

**Buton Stili:**

- Border radius: 8px
- Padding: 12px 24px
- İkon + Text (horizontal)
- Gölge: subtle shadow

---

### SCR-004: E-posta Kayıt Formu

```
┌─────────────────────────────────┐
│  [←]        Kayıt Ol            │
│─────────────────────────────────│
│                                 │
│  Ad *                           │
│  ┌───────────────────────────┐  │
│  │  Adınızı girin            │  │
│  └───────────────────────────┘  │
│                                 │
│  Soyad *                        │
│  ┌───────────────────────────┐  │
│  │  Soyadınızı girin         │  │
│  └───────────────────────────┘  │
│                                 │
│  E-posta *                      │
│  ┌───────────────────────────┐  │
│  │  ornek@email.com          │  │
│  └───────────────────────────┘  │
│                                 │
│  Şifre *                        │
│  ┌───────────────────────────┐  │
│  │  ●●●●●●●●           [👁]   │  │
│  └───────────────────────────┘  │
│  Min 8 karakter, 1 büyük harf   │
│                                 │
│  ☑️ KVKK Aydınlatma Metnini     │
│     okudum ve kabul ediyorum    │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Kayıt Ol             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Validasyon Göstergeleri:**

- Hatalı input: Kırmızı border + hata mesajı altında
- Başarılı: Yeşil check icon sağ tarafta
- Şifre güvenlik indikatörü: Zayıf/Orta/Güçlü

---

### SCR-005: Meslek Seçimi Ekranı

```
┌─────────────────────────────────┐
│  [←]     Meslek Seçimi          │
│─────────────────────────────────│
│                                 │
│  🔍  Meslek ara...               │
│                                 │
│─────────────────────────────────│
│                                 │
│  Popüler Meslekler              │
│                                 │
│  ┌───────────────────────────┐  │
│  │  💻 Yazılım Geliştirici   │  │
│  │      📜 Doğrulama Gerekli │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ⚕️  Doktor               │  │
│  │      📜 Doğrulama Gerekli │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ☕ Barista               │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🔧 Mühendis              │  │
│  │      📜 Doğrulama Gerekli │  │
│  └───────────────────────────┘  │
│                                 │
│  ────────  VEYA  ────────        │
│                                 │
│        Şimdilik Atla            │
└─────────────────────────────────┘
```

**Meslek Kartı:**

- Meslek ikonu + ismi
- Doğrulama badge (varsa)
- Tıklanabilir (ripple effect)
- Checkmark seçiliyse

---

### SCR-006: Belge Doğrulama - Bilgilendirme

```
┌─────────────────────────────────┐
│  [←]    Meslek Doğrulama        │
│─────────────────────────────────│
│                                 │
│     [İllüstrasyon: Document]    │
│                                 │
│    Diploma/Sertifika Yükle      │
│                                 │
│  Mesleğinizi doğrulamak için:   │
│                                 │
│  ✓ Diploma veya sertifika foto  │
│  ✓ Belgenizi tutarak selfie     │
│  ✓ AI ile otomatik doğrulama    │
│                                 │
│  ────────────────────────────── │
│                                 │
│  🔒 Gizlilik ve Güvenlik        │
│                                 │
│  Yüklediğiniz belgeler sadece   │
│  doğrulama için kullanılır ve   │
│  işlem sonrası otomatik silinir.│
│                                 │
│  [KVKK Aydınlatma Metni]        │
│                                 │
│  ┌───────────────────────────┐  │
│  │     Doğrulamaya Başla     │  │
│  └───────────────────────────┘  │
│                                 │
│        Daha Sonra               │
└─────────────────────────────────┘
```

---

### SCR-007: Belge Yükleme Ekranı

```
┌─────────────────────────────────┐
│  [←]    Belge Yükleme   [?]     │
│─────────────────────────────────│
│                                 │
│  Adım 1/2: Diploma/Sertifika    │
│  ●━━━━━━○━━━━━━                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   [Belge Önizleme]        │  │
│  │   veya                    │  │
│  │   📁 Yükleme Alanı        │  │
│  │                           │  │
│  │   Belgenizi buraya        │  │
│  │   sürükleyin veya         │  │
│  │   tıklayarak seçin        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📷 Fotoğraf Çek          │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📁 Galeriden Seç         │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📄 PDF Yükle             │  │
│  └───────────────────────────┘  │
│                                 │
│  Max 5MB | JPG, PNG, PDF        │
│                                 │
│  ┌───────────────────────────┐  │
│  │      İleri →              │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Önizleme Modu:**

- Yüklenen belge gösterilir
- Crop/Rotate seçenekleri
- Yeniden Yükle butonu
- İleri butonu aktif olur

---

### SCR-008: Selfie Çekme Ekranı

```
┌─────────────────────────────────┐
│  [←]    Selfie Çekme    [?]     │
│─────────────────────────────────│
│                                 │
│  Adım 2/2: Selfie + Belge       │
│  ━━━━━━━●━━━━━━                 │
│                                 │
│  Belgenizi tutarak selfie çekin │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │                           │  │
│  │     KAMERA GÖRÜNÜMÜ       │  │
│  │                           │  │
│  │     [Yüz Tanıma Frame]    │  │
│  │                           │  │
│  │                           │  │
│  │                           │  │
│  │   Belgeyi göğsünüze yakın │  │
│  │   tutun ve yüzünüzü       │  │
│  │   çerçeveye hizalayın     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│          🔄  [  ⚪  ]  💡        │
│       (Döndür) (Çek) (Flaş)     │
│                                 │
└─────────────────────────────────┘
```

**Önizleme Modu:**

```
┌─────────────────────────────────┐
│  [←]    Önizleme                │
│─────────────────────────────────│
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   [Çekilen Selfie]        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Yeniden Çek             │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Onayla ve Gönder        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

### SCR-009: Doğrulama İşleniyor

```
┌─────────────────────────────────┐
│     Doğrulama İşleniyor...      │
│─────────────────────────────────│
│                                 │
│                                 │
│     [Animasyon: AI Processing]  │
│                                 │
│                                 │
│    ✓ Belgeler yüklendi          │
│    🔄 AI analizi yapılıyor...   │
│    ⏳ Kimlik doğrulanıyor...    │
│                                 │
│    Bu işlem 30-60 saniye        │
│    sürebilir.                   │
│                                 │
│    [Progress Bar]               │
│    65%                          │
│                                 │
│                                 │
│    Lütfen sayfayı kapatmayın    │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

### SCR-010: Doğrulama Sonuç Ekranları

**Başarılı:**

```
┌─────────────────────────────────┐
│                                 │
│     [İkon: ✅ Checkmark]        │
│                                 │
│    Doğrulama Başarılı!          │
│                                 │
│  Mesleğiniz başarıyla           │
│  doğrulandı.                    │
│                                 │
│  Artık meslektaşlarınızla       │
│  bağlanabilirsiniz!             │
│                                 │
│  🏆 Doğrulanmış rozeti          │
│     kazandınız!                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │    Keşfetmeye Başla       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Başarısız:**

```
┌─────────────────────────────────┐
│                                 │
│     [İkon: ⚠️ Warning]          │
│                                 │
│    Doğrulama Başarısız          │
│                                 │
│  Üzgünüz, belgeleriniz          │
│  doğrulanamadı.                 │
│                                 │
│  Olası nedenler:                │
│  • Belge kalitesi düşük         │
│  • Selfie ve belge eşleşmedi    │
│  • Belge bilgileri okunamadı    │
│                                 │
│  Kalan deneme hakkı: 2          │
│                                 │
│  ┌───────────────────────────┐  │
│  │    Yeniden Dene           │  │
│  └───────────────────────────┘  │
│                                 │
│   Genel Kategoriye Geç          │
└─────────────────────────────────┘
```

---

## 🏠 Ana Ekranlar

### SCR-011: Ana Sayfa (Feed)

```
┌─────────────────────────────────┐
│ Meslektaş    🔍  🔔(3)  [📷]    │
│─────────────────────────────────│
│  ┌───────────────────────────┐  │
│  │ [👤] Ahmet Yılmaz     [●●●]│  │
│  │     💼 Yazılım Geliştirici ✓│  │
│  │ ──────────────────────────│  │
│  │ React Native projemde     │  │
│  │ state management için     │  │
│  │ öneriniz var mı?          │  │
│  │                           │  │
│  │ [📷 Görsel]               │  │
│  │                           │  │
│  │ 👍 24  💬 8  📅 2 saat    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [👤] Zeynep Kaya     [●●●]│  │
│  │     ⚕️ Doktor ✓            │  │
│  │ ──────────────────────────│  │
│  │ Bugün çok yoğun bir       │  │
│  │ nöbet geçirdim...         │  │
│  │                           │  │
│  │ 👍 45  👎 2  💬 12        │  │
│  │ 📅 5 saat önce            │  │
│  └───────────────────────────┘  │
│                                 │
│  [Loading more...]              │
│                                 │
├─────────────────────────────────┤
│ [🏠]  [💬]  [➕]  [👤]  [⚙️]    │
└─────────────────────────────────┘
```

**Gönderi Kartı Detayları:**

- Avatar (40x40, sol üst)
- Ad + Meslek (1 satır, truncate)
- Doğrulama rozeti (varsa)
- Menü butonu (sağ üst, 3 nokta)
- İçerik (max 3 satır, "Devamını gör")
- Görseller (grid, 1-5 adet)
- Etkileşim butonları (Like, Dislike, Comment)
- Tarih (relative: "2 saat önce")

**Tab Bar (Alt):**

- Ana Sayfa (Home)
- Sohbet (Chat) - Badge sayısı
- Yeni Gönderi (+) - Büyük, primary
- Profil (User)
- Ayarlar (Settings)

---

### SCR-012: Gönderi Detay Ekranı

```
┌─────────────────────────────────┐
│  [←]    Gönderi           [●●●] │
│─────────────────────────────────│
│  ┌───────────────────────────┐  │
│  │ [👤] Ahmet Yılmaz         │  │
│  │     💼 Yazılım Geliştirici ✓│  │
│  │ ──────────────────────────│  │
│  │ React Native projemde     │  │
│  │ state management için     │  │
│  │ öneriniz var mı? Redux mu │  │
│  │ Zustand mı daha iyi olur? │  │
│  │                           │  │
│  │ [📷 Görsel - Full]        │  │
│  │                           │  │
│  │ 👍 24  👎 2  💬 8         │  │
│  │ 📅 2 saat önce            │  │
│  └───────────────────────────┘  │
│─────────────────────────────────│
│                                 │
│  💬 Yorumlar (8)                │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [👤] Mehmet Demir     2s  │  │
│  │     💼 Senior Developer ✓ │  │
│  │ ──────────────────────────│  │
│  │ Zustand öneririm, daha    │  │
│  │ basit ve hızlı.           │  │
│  │                           │  │
│  │ 👍 5   💬 Cevapla         │  │
│  └───────────────────────────┘  │
│                                 │
│    ┌─────────────────────────┐  │
│    │ [👤] Ali Veli       1dk │  │
│    │ ────────────────────────│  │
│    │ Ben de Zustand          │  │
│    │ kullanıyorum, +1        │  │
│    │                         │  │
│    │ 👍 2                    │  │
│    └─────────────────────────┘  │
│                                 │
│  [Daha fazla yorum...]          │
│                                 │
├─────────────────────────────────┤
│  [Yorum yaz...]         [Gönder]│
└─────────────────────────────────┘
```

---

## 💬 Sohbet Ekranları

### SCR-013: Sohbet Ana Ekranı

```
┌─────────────────────────────────┐
│  Mesajlar              [Ara 🔍] │
│─────────────────────────────────│
│                                 │
│  ┌ Tab Seçimi ────────────────┐ │
│  │  Genel Sohbet  |  Özel    │ │
│  └──────────────────────────────┘│
│                                 │
│  🏢 Yazılım Geliştirici Odası   │
│  ┌───────────────────────────┐  │
│  │ 👥 Aktif: 45 kişi         │  │
│  │ 💬 Son mesaj: Merhaba...  │  │
│  │ 🕒 2 dakika önce          │  │
│  └───────────────────────────┘  │
│                                 │
│─────────  Özel Mesajlar  ────────│
│                                 │
│  ┌───────────────────────────┐  │
│  │ [👤●] Mehmet Demir    3   │  │
│  │ 💬 Tamam, yarın görüşe... │  │
│  │ 🕒 5 dakika önce          │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [👤] Zeynep Kaya      ✓✓  │  │
│  │ 💬 Teşekkürler!           │  │
│  │ 🕒 1 saat önce            │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [👤] Ahmet Yılmaz         │  │
│  │ 💬 Senin yorumunu ...     │  │
│  │ 🕒 Dün                    │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│ [🏠]  [💬]  [➕]  [👤]  [⚙️]    │
└─────────────────────────────────┘
```

**Konuşma Kartı:**

- Profil fotoğrafı + Online indicator (yeşil nokta)
- Ad + Son görülme / Online
- Son mesaj önizlemesi (truncate)
- Zaman (relative)
- Okunmamış badge (sağ üst, kırmızı)
- Okundu işareti (✓✓)
- Swipe → Arşivle/Sil

---

### SCR-014: Grup Sohbet Ekranı

```
┌─────────────────────────────────┐
│  [←] Yazılım Gelişt...  [👥 45] │
│─────────────────────────────────│
│                                 │
│  ┌─Ahmet Yılmaz──10:23─────┐   │
│  │ Merhaba arkadaşlar!     │   │
│  └─────────────────────────┘   │
│                                 │
│       ┌─Sen──10:25────────┐     │
│       │ Selam! Nasılsın? │     │
│       └──────────────────┘     │
│                                 │
│  ┌─Mehmet Demir──10:26─────┐   │
│  │ Ben de buradayım 👋     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─Zeynep Kaya──10:27──────┐   │
│  │ Yeni bir proje üzerinde │   │
│  │ çalışıyor musunuz?      │   │
│  └─────────────────────────┘   │
│                                 │
│       ┌─Sen──10:28────────┐     │
│       │ Evet, React Native│     │
│       │ ile uğraşıyorum   │     │
│       └──────────────────┘     │
│                                 │
│  [Typing: Ahmet yazıyor...]     │
│                                 │
├─────────────────────────────────┤
│  [😊] [Mesajınız...]    [Gönder]│
└─────────────────────────────────┘
```

**Mesaj Balonu:**

- Başkası: Sol hizalı, açık gri
- Sen: Sağ hizalı, mavi
- Ad + Zaman (üstte, küçük)
- Mesaj içeriği
- Emoji desteği

---

### SCR-015: Özel Mesaj Ekranı

```
┌─────────────────────────────────┐
│  [←] Mehmet Demir    [👤]  [●●●] │
│      💼 Senior Developer ✓      │
│      🟢 Aktif                    │
│─────────────────────────────────│
│                                 │
│  ┌─Mehmet──Dün 18:30────────┐   │
│  │ Projeyi inceledim,      │   │
│  │ güzel olmuş!            │   │
│  └─────────────────────────┘   │
│                                 │
│       ┌─Sen──Dün 18:35────┐     │
│       │ Teşekkürler! 🙏  │     │
│       └──────────────────┘     │
│                                 │
│  ┌─Mehmet──Bugün 10:15─────┐   │
│  │ Yarın görüşelim mi?     │   │
│  └─────────────────────────┘   │
│                                 │
│       ┌─Sen──10:20────────┐     │
│       │ Olur, saat kaçta?│ ✓✓  │
│       └──────────────────┘     │
│                                 │
│  ┌─Mehmet──10:22────────────┐   │
│  │ 14:00'te uygun mu?      │   │
│  └─────────────────────────┘   │
│                                 │
│  [Typing: Mehmet yazıyor...]    │
│                                 │
├─────────────────────────────────┤
│  [😊] [📎] [Mesajınız...] [Gönder]│
└─────────────────────────────────┘
```

**Özellikler:**

- Karşı taraf bilgisi (üstte)
- Online/Offline durumu
- Okundu işareti (✓✓)
- Yazıyor göstergesi
- Emoji picker
- Dosya ekleme (gelecekte)

---

## 👤 Profil ve Ayarlar Ekranları

### SCR-016: Profil Ekranı (Kendi)

```
┌─────────────────────────────────┐
│  [←]    Profil          [⚙️]    │
│─────────────────────────────────│
│                                 │
│        [Profil Fotoğrafı]       │
│         (120x120, merkez)       │
│                                 │
│       Ahmet Yılmaz ✓💎          │
│   💼 Yazılım Geliştirici        │
│      📍 İstanbul, Türkiye       │
│                                 │
│  "React Native ve backend       │
│   geliştirici. Açık kaynak      │
│   tutkunu."                     │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Profili Düzenle         │  │
│  └───────────────────────────┘  │
│                                 │
│─────────  İstatistikler  ────────│
│                                 │
│   24 Gönderi   156 Beğeni       │
│   Katılım: 3 Haziran 2024       │
│                                 │
│─────────  Gönderiler  ───────────│
│                                 │
│  ┌─────┬─────┬─────┐            │
│  │ [📷]│ [📷]│ [📷]│            │
│  ├─────┼─────┼─────┤            │
│  │ [📷]│ [📷]│ [📷]│            │
│  └─────┴─────┴─────┘            │
│                                 │
├─────────────────────────────────┤
│ [🏠]  [💬]  [➕]  [👤]  [⚙️]    │
└─────────────────────────────────┘
```

---

### SCR-017: Başkasının Profili

```
┌─────────────────────────────────┐
│  [←]    Profil          [●●●]   │
│─────────────────────────────────│
│                                 │
│        [Profil Fotoğrafı]       │
│                                 │
│       Mehmet Demir ✓            │
│   💼 Senior Developer           │
│      📍 Ankara, Türkiye         │
│                                 │
│  "10 yıllık yazılım deneyimi"   │
│                                 │
│  ┌───────────────────────────┐  │
│  │   💬 Mesaj Gönder         │  │
│  └───────────────────────────┘  │
│                                 │
│─────────  İstatistikler  ────────│
│                                 │
│   45 Gönderi   320 Beğeni       │
│   Katılım: 1 Mayıs 2024         │
│                                 │
│─────────  Gönderiler  ───────────│
│                                 │
│  (Grid görünüm, yukarıdakigibi) │
│                                 │
├─────────────────────────────────┤
│ [🏠]  [💬]  [➕]  [👤]  [⚙️]    │
└─────────────────────────────────┘
```

**Menü (●●●):**

- Engelle
- Bildir
- Paylaş (gelecekte)

---

### SCR-018: Ayarlar Ekranı

```
┌─────────────────────────────────┐
│  [←]        Ayarlar             │
│─────────────────────────────────│
│                                 │
│  👤 Hesap                        │
│  ┌───────────────────────────┐  │
│  │ Profili Düzenle        >  │  │
│  ├───────────────────────────┤  │
│  │ Şifre Değiştir         >  │  │
│  ├───────────────────────────┤  │
│  │ Gizlilik                >  │  │
│  └───────────────────────────┘  │
│                                 │
│  🔔 Bildirimler                  │
│  ┌───────────────────────────┐  │
│  │ Bildirim Tercihleri    >  │  │
│  ├───────────────────────────┤  │
│  │ Sessiz Saatler         >  │  │
│  └───────────────────────────┘  │
│                                 │
│  🔒 Güvenlik ve Gizlilik         │
│  ┌───────────────────────────┐  │
│  │ Engellenen Kullanıcılar >  │  │
│  ├───────────────────────────┤  │
│  │ Veri ve KVKK           >  │  │
│  ├───────────────────────────┤  │
│  │ İki Faktörlü Doğrulama >  │  │
│  └───────────────────────────┘  │
│                                 │
│  ℹ️ Hakkında                     │
│  ┌───────────────────────────┐  │
│  │ Yardım ve Destek       >  │  │
│  ├───────────────────────────┤  │
│  │ Kullanım Koşulları     >  │  │
│  ├───────────────────────────┤  │
│  │ Gizlilik Politikası    >  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🚪 Çıkış Yap              │  │
│  └───────────────────────────┘  │
│                                 │
│  Versiyon 1.0.0 (MVP)           │
│                                 │
└─────────────────────────────────┘
```

---

## 🔔 Özel Durumlar ve Modaller

### SCR-019: Boş Durum Ekranları

**Boş Feed:**

```
┌─────────────────────────────────┐
│  Ana Sayfa                      │
│─────────────────────────────────│
│                                 │
│                                 │
│     [İllüstrasyon: Empty]       │
│                                 │
│    Henüz gönderi yok            │
│                                 │
│  Meslek grubunuzda henüz        │
│  paylaşım yapılmamış.           │
│                                 │
│  İlk paylaşımı siz yapın!       │
│                                 │
│  ┌───────────────────────────┐  │
│  │   ➕ Gönderi Oluştur      │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Boş Mesajlar:**

```
┌─────────────────────────────────┐
│  Mesajlar                       │
│─────────────────────────────────│
│                                 │
│                                 │
│     [İllüstrasyon: Chat]        │
│                                 │
│    Henüz mesaj yok              │
│                                 │
│  Meslektaşlarınızla             │
│  sohbet etmeye başlayın!        │
│                                 │
│  ┌───────────────────────────┐  │
│  │   💬 Sohbete Başla        │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

### SCR-020: Hata Ekranları

**İnternet Yok:**

```
┌─────────────────────────────────┐
│                                 │
│     [İkon: 📡 No Signal]        │
│                                 │
│   Bağlantı Hatası               │
│                                 │
│  İnternet bağlantınızı          │
│  kontrol edin ve yeniden        │
│  deneyin.                       │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Yeniden Dene            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Sunucu Hatası:**

```
┌─────────────────────────────────┐
│                                 │
│     [İkon: ⚠️ Error]            │
│                                 │
│   Bir Sorun Oluştu              │
│                                 │
│  Sunucuya bağlanılamadı.        │
│  Lütfen daha sonra tekrar       │
│  deneyin.                       │
│                                 │
│  Hata Kodu: 500                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Ana Sayfaya Dön         │  │
│  └───────────────────────────┘  │
│                                 │
│  [Destek ile İletişime Geç]     │
│                                 │
└─────────────────────────────────┘
```

---

### SCR-021: Onay Modalleri

**Gönderi Silme:**

```
┌─────────────────────────────────┐
│                                 │
│    Gönderiyi Sil?               │
│                                 │
│  Bu işlem geri alınamaz.        │
│  Gönderi kalıcı olarak          │
│  silinecek.                     │
│                                 │
│  ┌───────────────────────────┐  │
│  │   İptal                   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   🗑️ Sil                  │  │
│  │   (Kırmızı)               │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Çıkış Yapma:**

```
┌─────────────────────────────────┐
│                                 │
│    Çıkış Yap?                   │
│                                 │
│  Çıkış yapmak istediğinize      │
│  emin misiniz?                  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   İptal                   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Çıkış Yap               │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## 📊 Component Spesifikasyonları

### Button Variants

```
Primary Button:
- Background: #0066FF
- Text: White, 16px, Medium
- Padding: 12px 24px
- Border Radius: 8px
- Height: 48px
- Width: Full / Auto
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

Secondary Button:
- Background: Transparent
- Border: 1px solid #0066FF
- Text: #0066FF, 16px, Medium
- Padding: 12px 24px
- Border Radius: 8px
- Height: 48px

Text Button:
- Background: Transparent
- Text: #0066FF, 14px, Medium
- Padding: 8px 16px
- No border

Icon Button:
- Size: 40x40
- Icon: 24x24
- Background: Transparent (or light gray on press)
- Border Radius: 20px (circle)
```

### Input Fields

```
Text Input:
- Height: 48px
- Border: 1px solid #E0E0E0
- Border Radius: 8px
- Padding: 12px 16px
- Font: 16px, Regular
- Placeholder: #757575
- Focus: Border #0066FF, 2px

Error State:
- Border: #FF3B30, 2px
- Error Text: #FF3B30, 12px (below input)

Success State:
- Border: #00C853, 1px
- Check Icon: Green (right side)
```

### Cards

```
Post Card:
- Background: White
- Border Radius: 12px
- Padding: 16px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Margin: 8px horizontal, 4px vertical

Chat Card:
- Background: White
- Border Radius: 8px
- Padding: 12px 16px
- No shadow
- Divider: 1px solid #E0E0E0 (bottom)
```

### Badges

```
Notification Badge:
- Size: 20x20 (min)
- Background: #FF3B30
- Text: White, 12px, Bold
- Border Radius: 10px
- Position: Top-right corner

Verification Badge:
- Size: 18x18
- Icon: Checkmark
- Background: #1DA1F2 (Meslek Doğrulanmış)
- Background: #FFD700 (Profil Doğrulanmış)
- Position: Inline with text
```

---

## 📝 Sonuç

Bu dokümanda Meslektaş uygulamasının tüm ekran tasarımları wireframe formatında detaylandırılmıştır. Tasarımlar minimal, kullanıcı dostu ve profesyonel bir görünüm için optimize edilmiştir.

**Toplam Ekran Sayısı:** 21  
**Ana Ekran Kategorileri:** 5 (Onboarding, Ana, Sohbet, Profil, Özel)

---

**Hazırlayan:** UI/UX Tasarım Ekibi  
**Onaylayan:** Product Owner & Design Lead  
**Dağıtım:** Development Team, QA, Stakeholders

**Not:** Bu wireframe'ler yüksek sadakat (high-fidelity) tasarımlara dönüştürülmeden önce kullanıcı testlerine tabi tutulmalıdır.
