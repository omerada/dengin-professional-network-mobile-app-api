<p align="center">
  <img src="assets/logo-placeholder.png" alt="Dengin Logo" width="120" height="120" />
</p>

<h1 align="center">Dengin</h1>

<p align="center">
  <strong>Doğrulanmış Profesyoneller İçin Sosyal Ağ Platformu</strong>
</p>

<p align="center">
  <a href="#özellikler">Özellikler</a> •
  <a href="#mimari">Mimari</a> •
  <a href="#kurulum">Kurulum</a> •
  <a href="#teknoloji-yığını">Teknoloji</a> •
  <a href="#katkıda-bulunma">Katkıda Bulunma</a> •
  <a href="#lisans">Lisans</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk" alt="Java" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Dengin Nedir?

**Dengin**, meslek doğrulaması yapılmış profesyonelleri bir araya getiren, yapay zeka destekli bir sosyal ağ platformudur. Platform, kullanıcıların gerçek kimliklerini doğrulayarak güvenilir bir profesyonel topluluk oluşturur.

Spam hesaplar ve sahte profiller yerine; AI tabanlı kimlik doğrulama, meslek bazlı topluluklar ve gerçek zamanlı iletişim ile profesyoneller arasında anlamlı bağlantılar kurmayı hedefler.

## Özellikler

### 🔐 Kimlik Doğrulama Sistemi

- **AI Tabanlı Yüz Tanıma** — AWS Rekognition ile kimlik belgesi ve canlılık tespiti
- **Meslek Doğrulama** — Yapay zeka ile profesyonel yetkinlik seviyesi belirleme
- **Doğrulama Rozetleri** — Bronz, Gümüş, Altın seviye mesleki rozetler

### 📱 Sosyal Akış

- Mesleğe özel içerik akışı ve keşif
- Gönderi paylaşma, beğenme, yorum yapma
- AI tabanlı içerik kalite filtresi

### 💬 Gerçek Zamanlı Mesajlaşma

- WebSocket (STOMP) üzerinden anlık mesajlaşma
- Dosya ve medya paylaşımı
- Okundu bilgisi ve yazıyor göstergesi

### 🔔 Akıllı Bildirimler

- Firebase Cloud Messaging ile push bildirimler
- Bildirim tercihleri özelleştirme
- Arka plan bildirimleri desteği

### 👤 Profesyonel Profil

- Detaylı meslek bazlı profil
- Sektöre özel topluluklar
- Takipçi/takip edilen sistemi

### 🛡️ Güvenlik & Gizlilik

- KVKK uyumlu veri işleme
- Biyometrik kimlik doğrulama
- JWT tabanlı güvenli oturum yönetimi
- İçerik moderasyonu ve raporlama

## Mimari

Proje, **monorepo** yapısında iki ana modülden oluşur:

```
dengin/
├── backend/          # Spring Boot REST API (Java 17)
├── mobile/           # React Native Mobil Uygulama (TypeScript)
├── CONTRIBUTING.md   # Katkıda bulunma rehberi
├── SECURITY.md       # Güvenlik politikası
└── LICENSE           # MIT Lisansı
```

### Backend — Spring Boot 3.2

Strategic Domain-Driven Design (DDD) mimarisi ile 6 bağımsız bounded context:

| Context          | Açıklama                                                |
| ---------------- | ------------------------------------------------------- |
| **Identity**     | Kullanıcı yönetimi, kimlik doğrulama, OAuth2, profiller |
| **Verification** | AI destekli kimlik doğrulama pipeline'ı                 |
| **Social**       | Gönderiler, yorumlar, beğeniler, sosyal etkileşimler    |
| **Messaging**    | Gerçek zamanlı WebSocket mesajlaşma                     |
| **Notification** | Çok kanallı bildirim sistemi (FCM, email)               |
| **Moderation**   | İçerik moderasyonu ve raporlama                         |

### Mobile — React Native + Expo

Feature-driven modüler mimari ile 11 bağımsız feature modülü:

| Modül             | Açıklama                               |
| ----------------- | -------------------------------------- |
| **auth**          | Kayıt, giriş, OAuth2, parola sıfırlama |
| **feed**          | Akış, gönderi oluşturma, keşif         |
| **messaging**     | Gerçek zamanlı sohbet                  |
| **verification**  | Belge yükleme, biyometrik doğrulama    |
| **profile**       | Profil yönetimi, rozetler              |
| **notifications** | Push bildirim yönetimi                 |
| **social**        | Sosyal etkileşimler, takip sistemi     |
| **moderation**    | İçerik raporlama                       |
| **activity**      | Aktivite zaman çizelgesi               |
| **onboarding**    | Uygulama tanıtım akışı                 |
| **legal**         | Yasal sayfalar (KVKK, gizlilik)        |

## Teknoloji Yığını

### Backend

| Teknoloji          | Kullanım                         |
| ------------------ | -------------------------------- |
| Java 17            | Programlama dili                 |
| Spring Boot 3.2    | Web framework                    |
| Spring Security    | Kimlik doğrulama & yetkilendirme |
| PostgreSQL 15      | İlişkisel veritabanı             |
| Redis 7            | Önbellekleme & oturum yönetimi   |
| Flyway             | Veritabanı migration             |
| AWS S3             | Dosya depolama                   |
| AWS Rekognition    | Yüz tanıma & kimlik doğrulama    |
| WebSocket (STOMP)  | Gerçek zamanlı iletişim          |
| Firebase Admin SDK | Push bildirimler                 |
| MapStruct          | DTO dönüşümleri                  |
| Testcontainers     | Entegrasyon testleri             |
| Sentry             | Hata izleme                      |

### Mobile

| Teknoloji              | Kullanım                              |
| ---------------------- | ------------------------------------- |
| React Native 0.81      | Cross-platform mobil framework        |
| Expo SDK 54            | Geliştirme araçları & native modüller |
| TypeScript 5.x         | Tip güvenli geliştirme                |
| Zustand + Immer        | Durum yönetimi                        |
| React Query 5          | Sunucu durumu & veri çekme            |
| React Navigation 6     | Ekran yönlendirme                     |
| Axios                  | HTTP istemcisi                        |
| STOMP.js + SockJS      | WebSocket istemcisi                   |
| Firebase Messaging     | Push bildirimler                      |
| Lottie                 | Animasyonlar                          |
| Jest + Testing Library | Birim & entegrasyon testleri          |

### Altyapı

| Teknoloji      | Kullanım                   |
| -------------- | -------------------------- |
| Docker Compose | Yerel geliştirme ortamı    |
| LocalStack     | AWS servis emülasyonu      |
| pgAdmin        | Veritabanı yönetim arayüzü |
| Fastlane       | Mobil CI/CD otomasyon      |
| EAS Build      | Expo native build servisi  |

## Kurulum

### Ön Gereksinimler

- **Java 17+** ve **Maven 3.8+**
- **Node.js 18+** ve **npm 9+**
- **Docker** ve **Docker Compose**
- **Android Studio** veya **Xcode** (mobil geliştirme için)

### Hızlı Başlangıç

```bash
# 1. Repoyu klonlayın
git clone https://github.com/your-org/dengin.git
cd dengin

# 2. Backend kurulumu
cd backend
cp .env.example .env          # Ortam değişkenlerini yapılandırın
docker-compose up -d           # Altyapıyı başlatın (PostgreSQL, Redis, LocalStack)
node scripts/get-local-ip.js   # Yerel IP'yi otomatik yapılandırın
mvn clean install              # Derleyin
mvn spring-boot:run            # Başlatın (http://localhost:8080)

# 3. Mobile kurulumu
cd ../mobile
cp .env.example .env           # Ortam değişkenlerini yapılandırın
npm install                    # Bağımlılıkları yükleyin
npm start                      # Expo dev server başlatın
```

Detaylı kurulum talimatları:

- **Backend:** [backend/README.md](backend/README.md)
- **Mobile:** [mobile/README.md](mobile/README.md)

## Proje Yapısı

```
dengin/
├── backend/
│   ├── src/main/java/com/dengin/
│   │   ├── common/              # Paylaşılan çekirdek (exception, API wrapper)
│   │   ├── config/              # Spring yapılandırma bean'leri
│   │   ├── identity/            # Kullanıcı & kimlik doğrulama context'i
│   │   ├── verification/        # AI doğrulama pipeline context'i
│   │   ├── social/              # Sosyal etkileşim context'i
│   │   ├── messaging/           # Mesajlaşma context'i
│   │   ├── notification/        # Bildirim context'i
│   │   ├── moderation/          # Moderasyon context'i
│   │   └── shared/              # Ortak altyapı
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway migration dosyaları (18 migration)
│   │   ├── application.yml      # Geliştirme yapılandırması
│   │   └── application-prod.yml # Üretim yapılandırması
│   ├── docker-compose.yml       # Geliştirme altyapısı
│   └── pom.xml                  # Maven bağımlılıkları
│
├── mobile/
│   ├── src/
│   │   ├── features/            # 11 bağımsız feature modülü
│   │   ├── core/                # Navigasyon, API istemcisi, depolama
│   │   ├── shared/              # 43+ ortak bileşen, 22 hook
│   │   ├── theme/               # Renk, tipografi, animasyon sistemi
│   │   ├── contexts/            # Theme, Locale, Toast provider'ları
│   │   ├── config/              # Uygulama ve ortam yapılandırması
│   │   └── constants/           # Animasyon, gesture, navigasyon sabitleri
│   ├── __tests__/               # Birim, entegrasyon, e2e testler
│   ├── fastlane/                # App Store / Play Store otomasyon
│   ├── android/                 # Android native yapılandırma
│   └── package.json             # npm bağımlılıkları
│
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── README.md
```

## API Dokümantasyonu

Backend çalıştırıldıktan sonra:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI Spec:** http://localhost:8080/v3/api-docs
- **Health Check:** http://localhost:8080/actuator/health

### Temel API Endpoint'leri

| Yöntem | Endpoint                | Açıklama                     |
| ------ | ----------------------- | ---------------------------- |
| `POST` | `/api/v1/auth/register` | Kullanıcı kaydı              |
| `POST` | `/api/v1/auth/login`    | Giriş yapma                  |
| `POST` | `/api/v1/auth/refresh`  | Token yenileme               |
| `GET`  | `/api/v1/users/me`      | Mevcut kullanıcı profili     |
| `GET`  | `/api/v1/feed`          | Sosyal akış                  |
| `POST` | `/api/v1/posts`         | Gönderi oluşturma            |
| `GET`  | `/api/v1/conversations` | Sohbet listesi               |
| `WS`   | `/ws`                   | WebSocket bağlantısı (STOMP) |

## Test

### Backend

```bash
cd backend
mvn test                    # Tüm testleri çalıştırın
mvn clean verify            # Kapsam raporu ile çalıştırın
```

### Mobile

```bash
cd mobile
npm run test:unit           # Birim testleri
npm run test:integration    # Entegrasyon testleri
npm run test:e2e            # Uçtan uca testler
npm run typecheck           # TypeScript tip kontrolü
```

Kapsam hedefi: **%70** (dal, fonksiyon, satır)

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Başlamadan önce lütfen [CONTRIBUTING.md](CONTRIBUTING.md) rehberimizi okuyun.

### Hızlı Katkı Adımları

1. Repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## Güvenlik

Güvenlik açıkları bildirmek için lütfen [SECURITY.md](SECURITY.md) dosyasını inceleyin.

**Önemli:** `.env` dosyalarını asla commit etmeyin. Hassas bilgiler için ortam değişkenlerini kullanın.

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır. Detaylar için `LICENSE` dosyasını inceleyin.

---

<p align="center">
  Dengin ile profesyonel ağınızı güvenle genişletin.
</p>
