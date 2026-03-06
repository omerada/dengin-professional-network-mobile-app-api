# Katkıda Bulunma Rehberi

Dengin projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, katkı sürecini kolaylaştırmak için hazırlanmıştır.

## İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim?](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Standartları](#kod-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request Süreci](#pull-request-süreci)
- [Issue Raporlama](#issue-raporlama)

## Davranış Kuralları

Bu proje, [Contributor Covenant](https://www.contributor-covenant.org/) davranış kurallarını benimser. Tüm katılımcıların saygılı ve profesyonel bir ortam sürdürmesi beklenir.

## Nasıl Katkıda Bulunabilirim?

### Hata Bildirimi

- GitHub Issues üzerinden hata raporu açın
- Hatayı tekrarlamak için adımları detaylı yazın
- Beklenen ve gerçekleşen davranışı belirtin
- Ortam bilgilerinizi ekleyin (OS, Java/Node sürümü, vb.)

### Özellik Önerisi

- GitHub Issues üzerinden "feature request" label'ı ile açın
- Özelliğin neden gerekli olduğunu açıklayın
- Mümkünse kullanım senaryolarını belirtin

### Kod Katkısı

1. Repoyu fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi yapın
4. Testleri çalıştırın
5. Pull Request açın

## Geliştirme Ortamı

### Ön Gereksinimler

- **Java 17+** ve **Maven 3.8+** (backend)
- **Node.js 18+** ve **npm 9+** (mobile)
- **Docker** ve **Docker Compose**
- **Git**

### Kurulum

```bash
# 1. Fork'u klonlayın
git clone https://github.com/YOUR_USERNAME/dengin.git
cd dengin

# 2. Backend kurulumu
cd backend
cp .env.example .env
docker-compose up -d
mvn clean install

# 3. Mobile kurulumu
cd ../mobile
cp .env.example .env
npm install
```

### Çalıştırma

```bash
# Backend
cd backend && mvn spring-boot:run

# Mobile (ayrı terminal)
cd mobile && npm start
```

## Kod Standartları

### Backend (Java / Spring Boot)

- **Java 17** özelliklerini kullanın (records, sealed classes, pattern matching)
- **DDD mimarisi** kurallarına uyun:
  - Domain katmanı altyapıya bağımlı olmamalı
  - Repository interface'leri domain'de, implementasyonları infrastructure'da
  - Context'ler arası iletişim domain event'leri üzerinden
- **Naming convention'lar:**
  - Controller: `*Controller`
  - Service: `*Service` (application), `*DomainService` (domain)
  - Entity: `PascalCase` (tekil isim)
  - DTO: `*Request`, `*Response`, `*DTO`
- **MapStruct** kullanın, manuel DTO dönüşümü yapmayın
- Yeni tablolar için **Flyway migration** oluşturun

### Mobile (TypeScript / React Native)

- **TypeScript strict mode** aktif — `any` kullanmayın
- **Feature-driven mimari** kurallarına uyun:
  - Her feature kendi dizininde izole
  - Shared katmanında ortak bileşenler
  - Cross-feature import'lardan kaçının
- **Naming convention'lar:**
  - Component: `PascalCase.tsx`
  - Hook: `useXxx.ts`
  - Store: `xxxStore.ts`
  - Service: `xxxService.ts`
  - Type: `xxx.types.ts`
- **Path alias** kullanın (`@features/*`, `@shared/*`, `@core/*`)
- **Functional component** kullanın, class component kullanmayın
- Custom hook'larda `use` prefix'i zorunlu

### Genel Kurallar

- Kod İngilizce yazılmalı (değişken, fonksiyon, yorum)
- Kullanıcıya açık metinler Türkçe olabilir
- Kendi kendini açıklayan kod yazın, gereksiz yorum eklemeyin
- Karmaşık iş mantığı için açıklayıcı yorum ekleyin

## Commit Mesajları

[Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz:

```
<tip>(<kapsam>): <açıklama>

[opsiyonel gövde]

[opsiyonel footer]
```

### Tipler

| Tip        | Açıklama                              |
| ---------- | ------------------------------------- |
| `feat`     | Yeni özellik                          |
| `fix`      | Hata düzeltme                         |
| `docs`     | Dokümantasyon değişikliği             |
| `style`    | Kod formatı (işlevsel değişiklik yok) |
| `refactor` | Yeniden yapılandırma                  |
| `test`     | Test ekleme/düzeltme                  |
| `chore`    | Build, CI, bağımlılık güncellemesi    |
| `perf`     | Performans iyileştirme                |

### Kapsamlar

| Kapsam         | Açıklama               |
| -------------- | ---------------------- |
| `backend`      | Backend değişiklikleri |
| `mobile`       | Mobile değişiklikleri  |
| `identity`     | Kimlik context'i       |
| `social`       | Sosyal context'i       |
| `messaging`    | Mesajlaşma context'i   |
| `verification` | Doğrulama context'i    |
| `notification` | Bildirim context'i     |
| `moderation`   | Moderasyon context'i   |
| `infra`        | Altyapı, Docker, CI/CD |

### Örnekler

```bash
feat(mobile): feed ekranına pull-to-refresh eklendi
fix(backend): JWT token yenileme hatası düzeltildi
docs(readme): kurulum adımları güncellendi
refactor(identity): AuthService dependency injection düzenlendi
test(messaging): WebSocket bağlantı testleri eklendi
chore(infra): Docker Compose Redis sürümü güncellendi
```

## Pull Request Süreci

### PR Açmadan Önce

1. **Branch oluşturun:**

   ```bash
   git checkout -b feature/yeni-ozellik
   # veya
   git checkout -b fix/hata-duzeltme
   ```

2. **Testleri çalıştırın:**

   ```bash
   # Backend
   cd backend && mvn test

   # Mobile
   cd mobile && npm test && npm run typecheck
   ```

3. **Lint kontrolü:**
   ```bash
   cd mobile && npx eslint src/ --ext .ts,.tsx
   ```

### PR Şablonu

PR açarken aşağıdaki bilgileri ekleyin:

```markdown
## Açıklama

<!-- Bu PR ne yapıyor? Neden gerekli? -->

## Değişiklik Türü

- [ ] Yeni özellik (feat)
- [ ] Hata düzeltme (fix)
- [ ] Yeniden yapılandırma (refactor)
- [ ] Dokümantasyon (docs)

## İlgili Issue

<!-- Closes #123 -->

## Test

<!-- Testler nasıl çalıştırıldı? -->

- [ ] Birim testleri geçiyor
- [ ] Entegrasyon testleri geçiyor
- [ ] Manuel test yapıldı

## Kontrol Listesi

- [ ] Kod standartlarına uygun
- [ ] Yeni testler eklendi
- [ ] Mevcut testler geçiyor
- [ ] Dokümantasyon güncellendi (gerekiyorsa)
- [ ] Breaking change yok (varsa belirtildi)
```

### İnceleme Süreci

1. PR açıldığında en az **1 reviewer** onayı gerekir
2. CI/CD pipeline başarılı olmalıdır
3. Tüm yorum ve öneriler çözülmelidir
4. Merge öncesi branch güncel olmalıdır

## Issue Raporlama

### Hata Raporu Şablonu

```markdown
## Hata Açıklaması

<!-- Hatanın kısa açıklaması -->

## Tekrarlama Adımları

1. ...
2. ...
3. ...

## Beklenen Davranış

<!-- Ne olması gerekiyordu? -->

## Gerçekleşen Davranış

<!-- Ne oldu? -->

## Ortam

- OS: [ör. macOS 14, Windows 11]
- Java: [ör. 17.0.9]
- Node: [ör. 20.10.0]
- Docker: [ör. 24.0.7]

## Ekran Görüntüleri

<!-- Varsa ekleyin -->

## Ek Bilgiler

<!-- Log çıktıları, hata mesajları vb. -->
```

## Lisans

Bu projeye katkıda bulunarak, katkılarınızın [MIT Lisansı](LICENSE) altında lisanslanacağını kabul etmiş olursunuz.
