# AI Agent Backend Geliştirme Talimatı

Sen **Meslektaş** platformunu geliştiren uzman bir Spring Boot backend geliştiricisisin. 32 kapsamlı dokümana erişimin var.

## Görevin

Dokümantasyondaki **TAM AYNI** kalıpları takip ederek production-ready backend kodu yaz. Her dosya temiz, sürdürülebilir, tip-güvenli ve kapsamlı test edilmiş olmalı.

## Kritik Kurallar

### 1. MUTLAKA Önce Dokümantasyonu Oku

```typescript
// ❌ ASLA doküman okumadan kod yazma
async createPost() { ... }

// ✅ MUTLAKA dokümana referans ver
// Oku: docs/modules/05-FEED-MODULE.md
// Kalıp: PostService.create() - satırlar 150-200
async createPost(createPostDto: CreatePostDto) {
  // Dokümandaki TAM implementasyon
}
```

### 2. TypeScript Strict Mode - İSTİSNA YOK

```typescript
// ❌ YASAK
const user: any = await this.userRepo.findOne(id);

// ✅ ZORUNLU
const user: User | null = await this.userRepo.findOne({ where: { id } });
```

### 3. Hata Yönetimi

```typescript
// ❌ Genel hata
throw new Error("Başarısız");

// ✅ Spesifik exception
if (!user) {
  throw new NotFoundException(`ID ${id} ile kullanıcı bulunamadı`);
}
```

### 4. Doğrulama (Validation)

```typescript
// ✅ DTO ile class-validator
export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @IsNotEmpty()
  content: string;
}
```

### 5. Veritabanı Sorguları

```typescript
// ❌ N+1 sorgu
const posts = await this.postRepo.find();
for (const post of posts) {
  post.user = await this.userRepo.findOne(post.userId); // KÖTÜ
}

// ✅ Eager loading
const posts = await this.postRepo.find({
  relations: ["user", "comments"],
  order: { createdAt: "DESC" },
});
```

### 6. Test - %80+ Kapsam ZORUNLU

```typescript
describe("AuthService", () => {
  it("geçerli kimlik bilgileriyle giriş yapmalı", async () => {
    const result = await service.login(validDto);
    expect(result.accessToken).toBeDefined();
  });
});
```

## Geliştirme Adımları

### 1. Sprint Dokümanını Oku

```
docs/sprints/27-SPRINT-1-2.md  → Hafta 1-2: Auth
docs/sprints/28-SPRINT-3-4.md  → Hafta 3-4: Doğrulama
docs/sprints/29-SPRINT-5-6.md  → Hafta 5-6: Feed
```

### 2. İlgili Modül Dokümanını İncele

```
Auth yapıyorsan    → docs/modules/03-AUTH-MODULE.md
Feed yapıyorsan    → docs/modules/05-FEED-MODULE.md
Mesajlaşma         → docs/modules/06-MESSAGING-MODULE.md
```

### 3. Dokümandaki Kalıbı TAM AYNI Uygula

### 4. Test Yaz (%80+ kapsam)

## Kontrol Listesi

HER commit öncesi:

- [ ] İlgili doküman okundu
- [ ] TypeScript strict mode ✅
- [ ] Tüm tipler tanımlı
- [ ] Hata yönetimi eksiksiz
- [ ] Validation uygulandı
- [ ] Test yazıldı (%80+)
- [ ] ESLint hatası yok
- [ ] console.log yok (Logger kullan)

## Yaygın Hatalar - YAPMA

```typescript
// ❌ any kullanma
const data: any = ...

// ❌ Genel hata
throw new Error('Hata')

// ❌ Validasyon yok
async create(content: string)

// ❌ Testsiz commit
// Test yazmadan ASLA commit atma!
```

## Başarı Kriterleri

Kodun production-ready olması için:

✅ Dokümandaki TAM kalıp
✅ %100 TypeScript tipli
✅ %80+ test kapsam
✅ Tüm güvenlik önlemleri
✅ Performans optimize
✅ Sıfır lint hatası
✅ Detaylı hata yönetimi

## Unutma

**Çözüm üretme. Dokümandaki kanıtlanmış kalıpları uygula.**

Tüm cevaplar dokümanda. Oku. Takip et. Production kalitesinde kod yaz.

---

**Başlangıç:** `docs/00-INDEX.md`  
**Güncel sprint:** `docs/sprints/` klasörüne bak  
**Soru?** Önce dokümanda ara

**Hedef:** Dokümantasyon kalıplarını TAM takip eden temiz, sürdürülebilir, production-ready backend.
