# 🎯 Meslektaş - Meslek Doğrulamalı Kapalı Sosyal Ağ

[![Project Status](https://img.shields.io/badge/Status-MVP%20Planning-orange)]()
[![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo-blue)]()
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-green)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)]()
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

> **Profesyoneller için güvenilir, doğrulanmış ve mesleğe özel kapalı sosyal ağ platformu**

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Temel Özellikler](#-temel-özellikler)
- [Teknik Mimari](#️-teknik-mimari)
- [Dokümantasyon](#-dokümantasyon)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [MVP Hedefleri](#-mvp-hedefleri)
- [Proje Zaman Planı](#-proje-zaman-planı)
- [Ekip ve İletişim](#-ekip-ve-i̇letişim)

---

## 🎯 Proje Hakkında

**Proje Adı:** Meslektaş  
**Proje Türü:** Meslek Doğrulamalı Kapalı Sosyal Ağ  
**Platform:** Mobil Uygulama (React Native / Expo)  
**Backend:** Spring Boot (Java)  
**Database:** PostgreSQL  
**Durum:** MVP Planlama Aşaması  
**Hedef Kitle:** Doğrulanmış profesyoneller  
**İlk Lansman:** Pilot meslek grupları ile kapalı beta

### 🌟 Vizyon

Meslektaş, profesyonellerin kendi meslek grupları içinde güvenli, doğrulanmış ve özel bir sosyal ağ deneyimi yaşamalarını sağlayan bir platformdur. Her kullanıcı, mesleğini **AI destekli belge ve kimlik doğrulama** sistemiyle kanıtlayarak, sadece kendi meslektaşlarıyla etkileşime geçebilir.

### 🎯 Temel Amaç

- ✅ Meslek gruplarına özel **kapalı ve güvenli** sosyal alanlar oluşturmak
- ✅ **AI ve belge doğrulama** ile sahte profilleri engellemek
- ✅ Profesyoneller arası **kaliteli networking** ve bilgi paylaşımı
- ✅ Meslek bazlı **topluluk deneyimi** sunmak
- ✅ **KVKK uyumlu** ve güvenilir bir platform inşa etmek

### 📱 Ana Ekranlar (4 Temel Modül)

| #   | Ekran                   | Açıklama                                                         |
| --- | ----------------------- | ---------------------------------------------------------------- |
| 1   | **Ana Sayfa (Keşfet)**  | Meslektaşların paylaşımlarını görüntüleme, beğeni ve yorum yapma |
| 2   | **Meslek Sohbet Odası** | Tüm meslektaşların katılabildiği genel grup sohbeti              |
| 3   | **Özel Mesajlar**       | Birebir özel mesajlaşma alanı                                    |
| 4   | **Profil**              | Kullanıcının kendi profili, gönderileri ve ayarları              |

---

## 🚀 Temel Özellikler

### 🔐 Kullanıcı Yönetimi ve Doğrulama

#### Kayıt ve Giriş Sistemi

- **Çoklu Kayıt Seçenekleri:**
  - 🔵 Google hesabı ile giriş (OAuth 2.0)
  - 📸 Instagram hesabı ile giriş (OAuth 2.0)
  - ✉️ E-posta ile klasik kayıt
- **Güvenlik:** JWT token bazlı session yönetimi
- **İki Faktörlü Doğrulama:** E-posta veya SMS ile (opsiyonel)

#### Meslek Seçimi ve Kategorileri

**📜 Doğrulama Gerektiren Meslekler (Belge + Kimlik Zorunlu):**

<details>
<summary>Sağlık Sektörü</summary>

- Doktor (tüm branşlar)
- Hemşire
- Eczacı
- Diyetisyen
- Fizyoterapist
- Tıbbi Sekreter
</details>

<details>
<summary>Hukuk ve Adalet</summary>

- Avukat
- Hakim
- Savcı
- Noter
- İcra Müdürü
</details>

<details>
<summary>Mühendislik ve Teknik</summary>

- Bilgisayar Mühendisi
- Makine Mühendisi
- İnşaat Mühendisi
- Elektrik-Elektronik Mühendisi
- Endüstri Mühendisi
- Kimya Mühendisi
- (Tüm mühendislik branşları)
</details>

<details>
<summary>Eğitim ve Akademi</summary>

- Öğretmen (tüm branşlar)
- Akademisyen
- Öğretim Görevlisi
- Okul Müdürü
</details>

<details>
<summary>Finans ve Muhasebe</summary>

- Mali Müşavir (SMMM)
- Yeminli Mali Müşavir (YMM)
- Muhasebeci
- Gümrük Müşaviri
</details>

<details>
<summary>Mimarlık ve Tasarım</summary>

- Mimar
- İç Mimar
- Şehir Plancısı
- Peyzaj Mimarı
</details>

**✨ Doğrulama Gerektirmeyen Meslekler (Opsiyonel Doğrulama):**

<details>
<summary>Hizmet Sektörü</summary>

- Garson / Barista
- Kurye / Sürücü
- Berber / Kuaför
- Güzellik Uzmanı
- Masöz
</details>

<details>
<summary>Gastronomi</summary>

- Aşçı
- Pizzacı
- Pastane Ustası
- Barmen
</details>

<details>
<summary>Satış ve Pazarlama</summary>

- Satış Danışmanı
- Pazarlamacı
- Emlakçı
- Temsilci
</details>

**🌐 Genel Kategori:**

- Meslek seçimi yapmadan devam edenler
- Doğrulama reddedilenler
- Meslek belirtmek istemeyenler

#### 🤖 AI Destekli Doğrulama Süreci

**Doğrulama Akış Diyagramı:**

```
KULLANICI KAYIT
       ↓
  MESLEK SEÇİMİ
       ↓
  ┌─────────────────────────────┐
  │                             │
  ↓                             ↓
DOĞRULAMA GEREKEN          DOĞRULAMA GEREKMEDİK
  MESLEK                        MESLEK
  ↓                             ↓
BELGE YÜKLEME               DİREKT GİRİŞ
  ↓                             ↓
DİPLOMA/SERTİFİKA           ANA SAYFA
  ↓
SELFİE + BELGE TUTMA
  ↓
AI KİMLİK DOĞRULAMA
  ↓
AI BELGE DOĞRULAMA
  ↓
  ┌─────────────────────────────┐
  │                             │
  ↓                             ↓
BAŞARILI                    BAŞARISIZ
  ↓                             ↓
MESLEK ONAYI              MANUEL ADMIN (?)
  ↓                             ↓
BELGELERİ SİL            GEN EL KATEGORİ
  ↓                             ↓
ANA SAYFA                   ANA SAYFA
```

**Doğrulama Adımları:**

1. **Belge Yükleme**

   - 📄 Diploma veya meslek sertifikası fotoğrafı
   - Desteklenen formatlar: JPG, PNG, PDF
   - Maksimum boyut: 5MB
   - Minimum çözünürlük: 1024x768

2. **Selfie Doğrulama**

   - 🤳 Kullanıcı belgeyi elinde tutarak selfie çeker
   - Yüz tanıma algoritması ile kimlik tespiti
   - Canlılık kontrolü (liveness detection)
   - Anti-spoofing mekanizması

3. **AI Kontrolleri**

   **📄 Belge Doğrulama:**

   - ✅ Belge formatı ve sahtecilik kontrolü
   - ✅ OCR ile metin çıkarma
   - ✅ İsim-soyisim eşleştirmesi
   - ✅ Meslek alanı tespiti
   - ✅ Kurum doğrulama (üniversite/kurumsal logolar)
   - ✅ Belge tarihi ve geçerlilik kontrolü

   **👤 Kimlik Doğrulama:**

   - ✅ Yüz tanıma ve eşleştirme
   - ✅ Belge üzerindeki fotoğraf ile selfie karşılaştırması
   - ✅ Canlılık tespiti (anti-spoofing)
   - ✅ Kimlik tutarlılığı kontrolü
   - ✅ Derin öğrenme bazlı sahtecilik tespiti

4. **Sonuç İşleme**

   - ✅ **Başarılı:** Kullanıcı doğrulanır, belgeler anında silinir
   - ⚠️ **Belirsiz:** Manuel admin incelemesine gönderilir (değerlendirilecek)
   - ❌ **Başarısız:** Kullanıcı genel kategoriye yönlendirilir veya yeniden deneme hakkı

5. **Belge İmhası (KVKK Uyum)**
   - 🔥 Doğrulama tamamlanır tamamlanmaz belgeler **otomatik** ve **kalıcı** olarak silinir
   - 💾 Sadece doğrulama sonucu (boolean) veritabanında saklanır
   - 📧 Kullanıcıya belge imhası hakkında bilgilendirme mesajı gönderilir
   - 📋 İmha işlemi log kaydına alınır (KVKK denetim izi)

#### 💎 Mavi Tik (Doğrulanmış Profil)

- Doğrulama gerektirmeyen mesleklerde **opsiyonel**
- TC Kimlik + Selfie AI doğrulaması ile alınabilir
- Profilde görünürlük artışı sağlar
- Güven skorunu yükseltir
- Özel rozet ve işaretleme

### 📱 Profil Yönetimi

**Profil Bilgileri:**

- 👤 Ad, Soyad (zorunlu)
- 💼 Meslek (seçiliyorsa)
- 📝 Bio / Kısa tanıtım (max 200 karakter)
- 🖼️ Profil fotoğrafı
- 📍 Şehir bilgisi (opsiyonel)
- 🎂 Doğum tarihi (gizli, yaş hesaplama için)

**Doğrulama Rozetleri:**

- ✅ Meslek Doğrulanmış
- 💎 Profil Doğrulanmış (Mavi Tik)
- ⭐ Aktif Üye (belirli etkileşim sonrası)

**Kullanıcı Eylemleri:**

- ➕ Gönderi oluşturma (metin + görsel)
- ✏️ Gönderi düzenleme/silme
- 💬 Yorum yapma açma/kapatma
- 🔒 Gizlilik ayarları
- ⚙️ Hesap ayarları
- 🚫 Kullanıcı engelleme
- 📊 İstatistikler (gönderi, beğeni, takipçi sayıları)

### 📰 Ana Sayfa (Feed)

**İçerik Gösterimi:**

- 👥 Sadece **aynı meslek grubundaki** kullanıcıların gönderileri
- 🕒 Kronolojik sıralama (en yeni üstte)
- 🔄 Yenile (pull to refresh)
- 🎯 Algoritma bazlı öneri sistemi (gelecek versiyonlarda)

**Gönderi Özellikleri:**

- 📝 Metin içerik (max 1000 karakter)
- 🖼️ Görsel ekleme (1-5 adet, max 10MB toplam)
- 👍 Beğeni (like) ve 👎 karşı beğeni (dislike)
- 💬 Yorum yapma (kullanıcı ayarına bağlı)
- 🕐 Paylaşım tarihi ve zamanı
- 👁️ Görüntülenme sayısı

**Etkileşim Seçenekleri:**

- 👍 Beğen / 👎 Beğenme
- 💬 Yorum yap
- 🔖 Kaydet (gelecek versiyonlarda)
- 🔗 Paylaş (gelecek versiyonlarda)
- ⚠️ Şikayet et / Bildir

**Yorum Sistemi:**

- Alt yorumlar (1 seviye)
- Yorum beğenme
- Yorum silme (sadece gönderi sahibi veya yorum sahibi)
- Yorum bildirme

### 💬 Sohbet Sistemi

#### 1. Genel Meslek Sohbet Odası

- **Kapsam:** Aynı meslek grubundaki tüm kullanıcılar
- **Erişim:** Doğrulanmış kullanıcılar için açık
- **Özellikler:**
  - ⚡ Gerçek zamanlı mesajlaşma (WebSocket/Socket.io)
  - 📝 Metin mesajları
  - 😊 Emoji desteği
  - 🔔 Anlık bildirimler
  - 📜 Son 100 mesaj geçmişi gösterimi
  - 👥 Aktif kullanıcı listesi
  - ⚠️ Mesaj bildirme sistemi

#### 2. Özel Mesajlar (1'e 1)

- **Birebir mesajlaşma:** Kullanıcılar arası direkt iletişim
- **Özellikler:**
  - ⚡ Gerçek zamanlı mesajlaşma
  - ✓✓ Mesaj okundu bilgisi
  - ✍️ Yazıyor... göstergesi
  - 📜 Mesaj geçmişi (sınırsız)
  - 🔔 Push bildirim
  - 🖼️ Fotoğraf paylaşımı (gelecek versiyonda)

**Gizlilik ve Güvenlik:**

- 🚫 Kullanıcı engelleme özelliği
- 🗑️ Mesaj silme (her iki taraf için)
- ⚠️ Spam ve taciz bildirimi
- 🔒 Şifreli iletişim (end-to-end gelecekte)

### 🔔 Bildirim Sistemi

**Bildirim Türleri:**

- 💬 Yeni mesaj (özel mesaj ve grup)
- ❤️ Gönderi beğenisi
- 💭 Yeni yorum
- 💙 Gönderi kaydedildi
- ✅ Doğrulama onayı/reddi
- 👤 Yeni takipçi (gelecek versiyonlarda)
- 🎉 Rozet kazanımı

**Bildirim Kanalları:**

- 📱 In-app bildirimler
- 🔔 Push notification (FCM için Android / APNS için iOS)
- 📧 E-posta bildirimleri (opsiyonel, kullanıcı ayarı)

**Bildirim Ayarları:**

- Bildirim türleri için ayrı ayrı açma/kapatma
- Sessiz saatler ayarı
- Ses ve titreşim tercihleri

---

## 🛡️ KVKK ve Güvenlik

### KVKK Uyum Modeli

**Veri İşleme Prensipleri:**

- ✅ **Amaç Sınırlaması:** Belgeler sadece doğrulama için işlenir
- ✅ **Veri Minimizasyonu:** Sadece gerekli veriler toplanır
- ✅ **Saklama Süresi Sınırlaması:** Doğrulama sonrası belgeler silinir
- ✅ **Şeffaflık:** Kullanıcılara açık aydınlatma metni
- ✅ **Açık Rıza:** Her aşamada kullanıcı onayı
- ✅ **Güvenli İşleme:** SSL/TLS şifreleme

**Kullanıcı Hakları (KVKK Madde 11):**

- 📖 Kişisel verilerinin işlenip işlenmediğini öğrenme
- ℹ️ İşlenmişse buna ilişkin bilgi talep etme
- 🎯 İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
- 🔄 Yurt içi/yurt dışı aktarılan 3. kişileri bilme
- ✏️ Verilerin düzeltilmesini isteme
- 🗑️ Verilerin silinmesini/yok edilmesini talep etme
- 📢 Aktarılan 3. kişilere düzeltme/silme bildirimini isteme
- ⚖️ İşlenen verilerin analizi sonucu aleyhte sonuç çıkmasına itiraz etme
- 💰 Kanuna aykırı işleme nedeniyle zararın tazminini talep etme

**Güvenlik Önlemleri:**

- 🔒 SSL/TLS şifreleme (HTTPS zorunlu)
- 🔐 Veritabanı şifreleme (at rest encryption)
- 🛡️ Güvenli dosya yükleme ve validasyon
- 🚫 XSS, CSRF, SQL Injection koruması
- ⏱️ Rate limiting (DDoS koruması)
- 🔑 Güçlü parola politikası (min 8 karakter, büyük-küçük-sayı-sembol)
- 🔐 Password hashing (bcrypt/argon2)
- 📝 Aktivite loglama ve monitoring

### Veri Saklama Politikası

| Veri Türü                  | Saklama Süresi                | İmha Yöntemi                    | KVKK Hukuki Dayanak          |
| -------------------------- | ----------------------------- | ------------------------------- | ---------------------------- |
| Doğrulama Belgeleri        | **0 gün** (Doğrulama sonrası) | Otomatik kalıcı silme           | Açık rıza - amaç sınırlaması |
| Selfie Fotoğrafları        | **0 gün** (Doğrulama sonrası) | Otomatik kalıcı silme           | Açık rıza - amaç sınırlaması |
| Kullanıcı Profil Bilgileri | Hesap aktif olduğu sürece     | Hesap silindiğinde kalıcı silme | Sözleşme ilişkisi            |
| Gönderiler ve Yorumlar     | Kullanıcı silene kadar        | Kullanıcı talebi ile            | Sözleşme ilişkisi            |
| Özel Mesajlar              | Kullanıcı silene kadar        | Her iki taraf silebilir         | Sözleşme ilişkisi            |
| Grup Sohbet Mesajları      | 90 gün                        | Otomatik arşivleme              | Meşru menfaat                |
| Log Kayıtları              | 1 yıl                         | Otomatik arşivleme/silme        | Hukuki yükümlülük            |
| Bildirimler                | 30 gün                        | Otomatik silme                  | Meşru menfaat                |

**Veri Aktarımı:**

- 🌍 Veriler Türkiye içinde saklanır (sunucular Türkiye'de)
- 🚫 Yurt dışı veri aktarımı yapılmaz (MVP aşamasında)
- 🔒 3. parti servisler (AI doğrulama) için veri koruma anlaşması

---

## 🛠️ Teknik Mimari

### Frontend (Mobil Uygulama)

**Teknoloji Stack:**

- ⚛️ **Framework:** React Native (v0.72+)
- 📦 **Build Tool:** Expo (SDK 49+)
- 🗄️ **State Management:** Zustand veya Redux Toolkit (karar verilecek)
  - _Zustand:_ Daha basit, hafif, hızlı (MVP için ideal)
  - _Redux Toolkit:_ Daha gelişmiş, ölçeklenebilir (gelecek için)
- 🧭 **Navigation:** React Navigation v6
- 🎨 **UI Framework:** React Native Paper / Native Base (değerlendirilecek)
- 📸 **Kamera:** Expo Camera
- 🖼️ **Medya:** Expo ImagePicker, Image Manipulator
- 🔔 **Push Notification:** Expo Notifications + FCM/APNS
- 💬 **Real-time:** Socket.io Client
- 📡 **API Client:** Axios + React Query
- 🔐 **Auth:** Expo AuthSession (OAuth), AsyncStorage (token)

**Klasör Yapısı:**

```
mobile-app/
├── src/
│   ├── screens/          # Ekranlar
│   │   ├── Auth/
│   │   ├── Feed/
│   │   ├── Profile/
│   │   ├── Chat/
│   │   └── Verification/
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   ├── navigation/       # Navigation yapısı
│   ├── store/            # State management
│   ├── services/         # API servisleri
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Yardımcı fonksiyonlar
│   ├── constants/        # Sabitler
│   └── assets/           # Görseller, fontlar
├── app.json
├── package.json
└── tsconfig.json
```

### Backend (API Server)

**Teknoloji Stack:**

- ☕ **Framework:** Spring Boot 3.x (Java 17+)
- 🗄️ **ORM:** Spring Data JPA + Hibernate
- 🔒 **Security:** Spring Security + JWT
- 🌐 **API:** RESTful API
- 💬 **WebSocket:** Spring WebSocket + STOMP
- 📧 **Email:** Spring Mail
- 📤 **File Upload:** Multipart file handling
- 🤖 **AI Integration:** RestTemplate/WebClient (AI servisi için)
- 📝 **Validation:** Spring Validation + Hibernate Validator
- 📊 **Logging:** SLF4J + Logback
- 🧪 **Testing:** JUnit 5, Mockito, Spring Boot Test

**Klasör Yapısı:**

```
backend/
├── src/main/java/com/meslektas/
│   ├── controller/       # REST endpoints
│   ├── service/          # İş mantığı
│   ├── repository/       # Veritabanı erişimi
│   ├── model/            # Entity sınıfları
│   ├── dto/              # Data Transfer Objects
│   ├── security/         # JWT, Auth config
│   ├── config/           # Yapılandırmalar
│   ├── exception/        # Özel exception sınıfları
│   ├── util/             # Yardımcı sınıflar
│   └── websocket/        # WebSocket handlers
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/     # Flyway migrations
└── pom.xml
```

### Database (PostgreSQL)

**Neden PostgreSQL?**

- ✅ Açık kaynak ve ücretsiz
- ✅ Yüksek performans ve ölçeklenebilirlik
- ✅ JSON desteği (esnek veri yapıları)
- ✅ Full-text search yetenekleri
- ✅ ACID uyumlu
- ✅ Büyük topluluk ve dokümantasyon

**Alternatif Değerlendirme:**

- MySQL: Daha basit, ancak gelişmiş özellikler eksik
- MongoDB: NoSQL, esneklik yüksek ama ACID garantisi zayıf
- **Karar:** PostgreSQL (ölçeklenebilir, güvenilir, zengin özellikler)

**Veritabanı Şeması:**

```sql
-- USERS TABLE
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    profession_id BIGINT,
    is_profession_verified BOOLEAN DEFAULT FALSE,
    is_profile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, BANNED, DELETED
    FOREIGN KEY (profession_id) REFERENCES professions(id)
);

-- PROFESSIONS TABLE
CREATE TABLE professions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- MEDICAL, LEGAL, ENGINEERING, etc.
    requires_verification BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VERIFICATION_REQUESTS TABLE
CREATE TABLE verification_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    profession_id BIGINT NOT NULL,
    document_url TEXT,
    selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    ai_confidence_score DECIMAL(5,2),
    ai_result_details JSON,
    admin_note TEXT,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (profession_id) REFERENCES professions(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- POSTS TABLE
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    profession_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    images JSON, -- Array of image URLs
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_comment_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DELETED, REPORTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (profession_id) REFERENCES professions(id)
);

-- COMMENTS TABLE
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT, -- For nested comments
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- LIKES TABLE (Post & Comment likes)
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- POST, COMMENT
    target_id BIGINT NOT NULL,
    is_like BOOLEAN NOT NULL, -- TRUE for like, FALSE for dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, target_type, target_id)
);

-- CHAT_ROOMS TABLE
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_type VARCHAR(20) NOT NULL, -- PROFESSION_GROUP, PRIVATE
    profession_id BIGINT, -- NULL for private chats
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profession_id) REFERENCES professions(id)
);

-- CHAT_PARTICIPANTS TABLE
CREATE TABLE chat_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(room_id, user_id)
);

-- MESSAGES TABLE
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT', -- TEXT, IMAGE, SYSTEM
    metadata JSON, -- For image URLs, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- NEW_MESSAGE, NEW_LIKE, NEW_COMMENT, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON, -- Additional data (post_id, user_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- USER_BLOCKS TABLE
CREATE TABLE user_blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users(id),
    FOREIGN KEY (blocked_id) REFERENCES users(id),
    UNIQUE(blocker_id, blocked_id)
);

-- REPORTS TABLE
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- POST, COMMENT, MESSAGE, USER
    target_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL, -- SPAM, HARASSMENT, FAKE, etc.
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, REVIEWED, ACTIONED
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- INDEXES for performance
CREATE INDEX idx_posts_profession ON posts(profession_id, created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(profession_id);
```

### AI Doğrulama Servisi

**AI Servisi Gereksinimleri:**

- 🔍 **OCR (Optical Character Recognition):** Belge üzerinden metin çıkarma
- 👁️ **Computer Vision:** Belge doğrulama, sahtecilik tespiti
- 👤 **Face Recognition:** Yüz tanıma ve eşleştirme
- 🎭 **Liveness Detection:** Canlılık kontrolü (anti-spoofing)

**Önerilen AI Servisleri:**

| Servis                       | Özellikler                          | Maliyet         | Karar                  |
| ---------------------------- | ----------------------------------- | --------------- | ---------------------- |
| **AWS Rekognition**          | Yüz tanıma, OCR, sahtecilik tespiti | Orta-yüksek     | ✅ Kapsamlı            |
| **Azure Cognitive Services** | OCR, yüz tanıma, belge analizi      | Orta            | ✅ Güçlü               |
| **Google Cloud Vision**      | OCR, yüz tanıma, etiketleme         | Orta            | ✅ İyi performans      |
| **Custom AI Model**          | Tamamen özelleştirilebilir          | Düşük (hosting) | ⚠️ Geliştirme zahmetli |
| **FaceFirst**                | Sadece yüz tanıma                   | Düşük-orta      | ❌ Kısıtlı             |

**Önerilen Çözüm:**

- **Aşama 1 (MVP):** AWS Rekognition veya Azure Cognitive Services (hızlı entegrasyon)
- **Aşama 2:** Kendi AI modelimizi eğitme (maliyet optimizasyonu)

**AI Doğrulama API Akışı:**

```
Backend API
    ↓
Upload Documents (S3/Azure Blob)
    ↓
Call AI Service (REST API)
    ↓
    ├── OCR Service
    │   └── Extract text from document
    ├── Face Recognition
    │   └── Compare selfie with document photo
    ├── Liveness Detection
    │   └── Check if selfie is real (not photo of photo)
    └── Document Verification
        └── Check document authenticity
    ↓
AI Response (JSON)
    ├── confidence_score (0-100)
    ├── face_match (boolean)
    ├── liveness_check (boolean)
    ├── document_valid (boolean)
    └── extracted_data (name, profession, etc.)
    ↓
Business Logic Decision
    ├── If confidence > 85% → APPROVED
    ├── If 60% < confidence < 85% → MANUAL_REVIEW
    └── If confidence < 60% → REJECTED
    ↓
Delete Documents (GDPR/KVKK)
    ↓
Notify User
```

### Admin Panel

**Platform Seçimi: Web App mi, Mobil App mi?**

| Özellik        | Web App                       | Mobil App İçi              |
| -------------- | ----------------------------- | -------------------------- |
| **Erişim**     | Masaüstü browser (hızlı)      | Mobil cihaz                |
| **Geliştirme** | React/Angular (hızlı)         | React Native (ekstra efor) |
| **Kullanım**   | Büyük ekran, detaylı inceleme | Küçük ekran, sınırlı       |
| **Güvenlik**   | Ayrı domain, izole            | Ana app içinde, risk       |
| **Maliyet**    | Düşük                         | Orta                       |

**Karar: Web App (Ayrı Platform)**

**Neden?**

- ✅ Doğrulama incelemeleri için büyük ekran gerekli
- ✅ Hızlı geliştirme (React + Spring Boot API)
- ✅ Güvenlik (ayrı authentication)
- ✅ Detaylı raporlama ve analytics

**Admin Panel Özellikleri:**

- 🔐 Admin girişi (email + password)
- 📊 Dashboard (istatistikler)
  - Toplam kullanıcı sayısı
  - Bekleyen doğrulamalar
  - Günlük/haftalık aktif kullanıcılar
  - Meslek dağılımı
- ✅ Doğrulama yönetimi (eğer manuel onay gerekirse)
  - Bekleyen doğrulamalar listesi
  - Belge görüntüleme
  - Onay/Red işlemi
  - Admin notu ekleme
- 👥 Kullanıcı yönetimi
  - Kullanıcı listesi
  - Kullanıcı detayları
  - Ban/Unban
  - Hesap silme
- ⚠️ Şikayet yönetimi
  - Bildirilen içerikler
  - Bildirilen kullanıcılar
  - Aksiyon alma (silme, uyarı, ban)
- 📈 Analitik ve raporlar
  - Kullanıcı büyümesi grafiği
  - Etkileşim istatistikleri
  - Meslek bazlı analiz

**Admin Panel Tech Stack:**

- ⚛️ React + TypeScript
- 🎨 Material-UI veya Ant Design
- 📊 Recharts (grafikler)
- 🔐 JWT Authentication
- 📡 Axios (API calls)

---

## 📚 Dokümantasyon

Proje dokümantasyonu aşağıdaki bölümlere ayrılmıştır:

### 📁 Dokümantasyon Dosyaları

| Dosya                               | Açıklama                                         |
| ----------------------------------- | ------------------------------------------------ |
| `docs/01-PROJECT-OVERVIEW.md`       | Proje genel bakış ve vizyon                      |
| `docs/02-USER-REQUIREMENTS.md`      | Kullanıcı gereksinimleri ve user stories         |
| `docs/03-USER-FLOWS.md`             | Kullanıcı akışları ve senaryolar                 |
| `docs/04-SCREEN-DESIGNS.md`         | Ekran tasarımları ve wireframe spesifikasyonları |
| `docs/05-BUSINESS-RULES.md`         | İş kuralları ve validasyonlar                    |
| `docs/06-TECHNICAL-ARCHITECTURE.md` | Detaylı teknik mimari ve sistem tasarımı         |
| `docs/07-DATABASE-SCHEMA.md`        | Veritabanı şeması ve ilişkiler                   |
| `docs/08-API-SPECIFICATIONS.md`     | API endpoint dokümantasyonu                      |
| `docs/09-AI-VERIFICATION-DESIGN.md` | AI doğrulama sistem tasarımı                     |
| `docs/10-SECURITY-KVKK.md`          | Güvenlik önlemleri ve KVKK uyum planı            |
| `docs/11-TEST-SCENARIOS.md`         | Test senaryoları ve kabul kriterleri             |
| `docs/12-SPRINT-PLANNING.md`        | Sprint planlaması ve zaman takvimi               |
| `docs/13-DEVELOPMENT-STANDARDS.md`  | Geliştirme standartları ve kılavuzlar            |
| `docs/14-DEPLOYMENT-GUIDE.md`       | Deployment ve DevOps kılavuzu                    |

---

## 💻 Kurulum ve Çalıştırma

### Gereksinimler

**Mobil Uygulama:**

- Node.js 18+ ve npm/yarn
- Expo CLI
- React Native geliştirme ortamı
- Android Studio (Android) / Xcode (iOS)

**Backend:**

- JDK 17+
- Maven 3.8+
- PostgreSQL 14+
- IDE (IntelliJ IDEA / Eclipse)

### Kurulum Adımları

#### 1. Repository'yi Clone Edin

```bash
git clone https://github.com/omerada/meslektas.git
cd meslektas
```

#### 2. Backend Kurulumu

```bash
cd backend
mvn clean install
# application.yml dosyasını yapılandırın
mvn spring-boot:run
```

#### 3. Mobil Uygulama Kurulumu

```bash
cd mobile-app
npm install
# veya
yarn install

# Expo ile çalıştırma
npx expo start
```

#### 4. Admin Panel Kurulumu

```bash
cd admin-panel
npm install
npm start
```

### Ortam Değişkenleri

**Backend (.env veya application.yml):**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/meslektas
    username: your_db_user
    password: your_db_password

jwt:
  secret: your_jwt_secret_key
  expiration: 86400000

ai:
  service:
    url: https://ai-service-url
    api-key: your_ai_api_key

aws:
  s3:
    bucket: meslektas-documents
    region: eu-central-1
```

**Mobil App (.env):**

```bash
API_URL=http://localhost:8080/api
WEBSOCKET_URL=ws://localhost:8080/ws
EXPO_PUBLIC_API_KEY=your_expo_api_key
```

---

## 🎯 MVP Hedefleri

### İlk Lansman Hedefleri

- 📱 Fonksiyonel mobil uygulama (iOS + Android)
- 🤖 AI doğrulama sistemi entegre
- 💼 En az **5 pilot meslek grubu**
  - Yazılım Geliştirici
  - Öğretmen
  - Hemşire
  - Garson/Barista
  - Pazarlamacı
- 👥 **500-2000 doğrulanmış kullanıcı**
- 📊 Temel analitik ve raporlama
- 🛡️ Tam KVKK uyumlu sistem

### Başarı Kriterleri (KPI)

| Metrik                       | Hedef (İlk 3 Ay) |
| ---------------------------- | ---------------- |
| Aktif Kullanıcı              | 500+             |
| Doğrulama Başarı Oranı       | >85%             |
| Günlük Aktif Kullanıcı (DAU) | 150+             |
| Ortalama Session Süresi      | >5 dakika        |
| Gönderi Paylaşım (günlük)    | 50+              |
| Mesaj (günlük)               | 200+             |
| Kullanıcı Memnuniyeti        | >4.0/5           |

### MVP Sonrası Özellikler (v2.0+)

- 🎥 Video paylaşımı
- 🔍 Gelişmiş arama ve filtreleme
- 🏆 Gamification (rozetler, liderlik tablosu)
- 💼 İş ilanları ve fırsatlar
- 📚 Eğitim içerikleri
- 🌐 Web versiyonu
- 🔔 Gelişmiş bildirim sistemi
- 📊 Detaylı analitik dashboard (kullanıcılar için)
- 💰 Premium üyelik sistemi

---

## ⏱️ Proje Zaman Planı

### Sprint Yapısı (2 haftalık sprintler)

**Sprint 1-2 (4 hafta): Temel Altyapı**

- ✅ Veritabanı şeması oluşturma
- ✅ Backend API temel yapısı
- ✅ Authentication & Authorization
- ✅ Mobil app base setup
- ✅ Navigation yapısı

**Sprint 3-4 (4 hafta): Kullanıcı Yönetimi ve Doğrulama**

- ✅ Kayıt ve giriş ekranları
- ✅ Meslek seçimi
- ✅ Belge yükleme UI
- ✅ AI doğrulama entegrasyonu
- ✅ Profil yönetimi

**Sprint 5-6 (4 hafta): Feed ve Etkileşim**

- ✅ Ana sayfa feed
- ✅ Gönderi oluşturma/düzenleme/silme
- ✅ Beğeni ve yorum sistemi
- ✅ Bildirim sistemi

**Sprint 7-8 (4 hafta): Sohbet Sistemi**

- ✅ Genel meslek sohbet odası
- ✅ WebSocket entegrasyonu
- ✅ Özel mesajlaşma
- ✅ Mesaj bildirimleri

**Sprint 9 (2 hafta): Admin Panel**

- ✅ Admin dashboard
- ✅ Doğrulama yönetimi (eğer gerekliyse)
- ✅ Kullanıcı ve içerik yönetimi

**Sprint 10-11 (4 hafta): Test ve Optimizasyon**

- ✅ Kapsamlı testler (unit, integration, E2E)
- ✅ Performans optimizasyonu
- ✅ Bug fixing
- ✅ KVKK uyum kontrolleri
- ✅ Güvenlik audit

**Sprint 12 (2 hafta): Deployment ve Lansman**

- ✅ Production deployment
- ✅ App Store & Play Store yayınlama
- ✅ Dokümantasyon tamamlama
- ✅ Beta kullanıcı davetleri

**Toplam Süre: ~24 hafta (6 ay)**

### Ekip Yapısı (Tavsiye Edilen)

| Rol                      | Kişi Sayısı   | Sorumluluklar                          |
| ------------------------ | ------------- | -------------------------------------- |
| **Full-Stack Developer** | 2             | Frontend + Backend geliştirme          |
| **UI/UX Designer**       | 1             | Tasarım, wireframe, kullanıcı deneyimi |
| **AI/ML Engineer**       | 1 (Part-time) | AI doğrulama entegrasyonu              |
| **QA Engineer**          | 1             | Test, kalite kontrol                   |
| **Project Manager**      | 1             | Planlama, koordinasyon                 |
| **DevOps**               | 1 (Part-time) | CI/CD, deployment, monitoring          |

**Toplam: 5-6 kişi (bazıları part-time)**

---

## 🚀 Deployment Stratejisi

### Ortam Yapısı

1. **Development:** Geliştirme ortamı (local)
2. **Staging:** Test ortamı (production benzeri)
3. **Production:** Canlı ortam

### Hosting Önerileri

**Backend:**

- AWS EC2 / DigitalOcean Droplet
- AWS Elastic Beanstalk (otomatik ölçeklendirme)
- Heroku (hızlı deployment, pahalı)

**Database:**

- AWS RDS (PostgreSQL) - Yönetilen
- DigitalOcean Managed Database
- Self-hosted (daha ucuz, daha fazla yönetim)

**Dosya Depolama:**

- AWS S3 (önerilen)
- Azure Blob Storage
- Cloudinary (resim optimizasyonu ile)

**CDN:**

- AWS CloudFront
- Cloudflare

**CI/CD:**

- GitHub Actions (önerilen, ücretsiz)
- GitLab CI/CD
- Jenkins

---

## 📞 Ekip ve İletişim

**Proje Sahibi:** [İsim]  
**Teknik Lider:** [İsim]  
**GitHub:** https://github.com/omerada/meslektas

### İletişim Kanalları

- 📧 Email: team@meslektas.com
- 💬 Slack: meslektas-team.slack.com
- 📋 Jira: meslektas.atlassian.net

---

## 📄 Lisans

Bu proje özel mülkiyettedir. Tüm hakları saklıdır.

---

## 🙏 Teşekkürler

Bu projeyi hayata geçiren ekibe teşekkürler!

---

**Son Güncelleme:** 29 Kasım 2025  
**Versiyon:** 1.0 (MVP Planning)  
**Durum:** 🟡 Planlama Aşaması
