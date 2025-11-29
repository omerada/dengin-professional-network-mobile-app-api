# ⚖️ İş Kuralları ve Validasyonlar

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Kullanıcı ve Kimlik Doğrulama Kuralları](#kullanıcı-ve-kimlik-doğrulama-kuralları)
2. [Meslek Doğrulama Kuralları](#meslek-doğrulama-kuralları)
3. [İçerik Kuralları](#i̇çerik-kuralları)
4. [Etkileşim Kuralları](#etkileşim-kuralları)
5. [Sohbet Kuralları](#sohbet-kuralları)
6. [Güvenlik ve KVKK Kuralları](#güvenlik-ve-kvkk-kuralları)
7. [Moderasyon Kuralları](#moderasyon-kuralları)

---

## 👤 Kullanıcı ve Kimlik Doğrulama Kuralları

### BR-001: Kayıt Kuralları

#### BR-001.1: E-posta Validasyonu

```
Kural: E-posta adresi geçerli format olmalı ve benzersiz olmalıdır
Koşul: Kayıt sırasında
Validasyon:
  - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - Maksimum uzunluk: 255 karakter
  - Küçük harfe dönüştürülür (normalize)
  - Database'de benzersiz olmalı
Hata Mesajı: "Geçersiz e-posta formatı" veya "Bu e-posta zaten kullanımda"
```

#### BR-001.2: Şifre Güvenlik Kuralları

```
Kural: Şifre güçlü olmalıdır
Koşul: Kayıt ve şifre değiştirme sırasında
Validasyon:
  - Minimum uzunluk: 8 karakter
  - Maksimum uzunluk: 128 karakter
  - En az 1 büyük harf
  - En az 1 küçük harf
  - En az 1 rakam
  - En az 1 özel karakter (!@#$%^&*)
  - Yaygın şifreler reddedilir (örnek: "Password123")
Hata Mesajı: "Şifre güvenlik kurallarını karşılamıyor"
```

#### BR-001.3: Ad ve Soyad Kuralları

```
Kural: Ad ve soyad boş olamaz, geçerli karakterler içermelidir
Koşul: Kayıt ve profil güncelleme
Validasyon:
  - Minimum uzunluk: 2 karakter
  - Maksimum uzunluk: 50 karakter
  - Sadece harf, boşluk ve Türkçe karakterler (ğ, ü, ş, ı, ö, ç)
  - Baştaki/sondaki boşluklar temizlenir
  - İlk harf büyük harfe çevrilir
Hata Mesajı: "Ad/Soyad geçersiz karakterler içeriyor"
```

#### BR-001.4: KVKK Onayı

```
Kural: KVKK aydınlatma metni onaylanmalıdır
Koşul: Kayıt sırasında (zorunlu)
Validasyon:
  - Checkbox işaretli olmalı
  - Onay zamanı kaydedilir
  - IP adresi loglanır
Hata Mesajı: "KVKK metnini onaylamalısınız"
```

### BR-002: Giriş Kuralları

#### BR-002.1: Giriş Denemesi Sınırlaması

```
Kural: Başarısız giriş denemeleri sınırlandırılır
Koşul: Her giriş denemesinde
Validasyon:
  - 5 başarısız deneme → 15 dakika hesap kilidi
  - 10 başarısız deneme → 1 saat hesap kilidi
  - Captcha devreye girer (3. denemeden sonra)
  - IP bazlı rate limiting
Hata Mesajı: "Çok fazla başarısız deneme. X dakika sonra tekrar deneyin."
```

#### BR-002.2: Session Yönetimi

```
Kural: JWT token süre sınırlıdır
Koşul: Her API isteğinde
Validasyon:
  - Access Token süresi: 24 saat
  - Refresh Token süresi: 30 gün
  - Token expired → 401 Unauthorized
  - Tek oturum (başka cihazda giriş → önceki session sonlanır - MVP'de)
Hata Mesajı: "Oturumunuz sonlandı. Lütfen tekrar giriş yapın."
```

---

## 💼 Meslek Doğrulama Kuralları

### BR-003: Meslek Seçimi Kuralları

#### BR-003.1: Meslek Değiştirme Kısıtı

```
Kural: Bir kez doğrulanmış meslek değiştirilemez
Koşul: Doğrulama sonrası
Validasyon:
  - verified = true ise meslek değişikliği engellenir
  - Sadece admin panelinden değiştirilebilir (destek talebi ile)
  - Yeni doğrulama süreci gerektirir
İstisna: Genel kategoriden doğrulanmış mesleğe geçiş yapılabilir
Hata Mesajı: "Doğrulanmış meslek değiştirilemez. Destek ekibi ile iletişime geçin."
```

#### BR-003.2: Meslek Doğrulama Deneme Hakkı

```
Kural: Doğrulama için 3 deneme hakkı vardır
Koşul: Belge yükleme ve doğrulama
Validasyon:
  - 3 başarısız deneme sonrası → Genel kategoriye yönlendirilir
  - 30 gün sonra tekrar deneme hakkı tanınır
  - Her deneme arasında minimum 1 saat bekleme
Hata Mesajı: "Deneme hakkınız doldu. 30 gün sonra tekrar deneyebilirsiniz."
```

### BR-004: Belge Yükleme Kuralları

#### BR-004.1: Dosya Format ve Boyut

```
Kural: Yüklenen belgeler belirli formatlarda ve boyutta olmalıdır
Koşul: Belge/selfie yükleme
Validasyon:
  - İzin verilen formatlar: JPG, JPEG, PNG, PDF
  - Maksimum dosya boyutu: 5MB
  - Minimum çözünürlük: 1024x768 (resim için)
  - PDF sayfa sayısı: Max 3 sayfa
  - Dosya adı güvenli karakterler içermeli
Hata Mesajı: "Dosya formatı veya boyutu uygun değil"
```

#### BR-004.2: AI Doğrulama Eşik Değerleri

```
Kural: AI confidence score belirli eşik değerlerini geçmelidir
Koşul: AI doğrulama sonrası
Validasyon:
  - Score >= 85% → OTOMATIK ONAY
  - 60% <= Score < 85% → MANUEL İNCELEME (opsiyonel)
  - Score < 60% → OTOMATIK RED
  - Face match confidence: >= 80%
  - Liveness detection: PASS olmalı
  - Document validity: PASS olmalı
Hata Mesajı: "Doğrulama başarısız. Lütfen belgelerin net ve okunabilir olduğundan emin olun."
```

#### BR-004.3: Belge Saklama ve İmha

```
Kural: Belgeler doğrulama sonrası otomatik silinmelidir (KVKK)
Koşul: Doğrulama tamamlandığında
Validasyon:
  - Başarılı doğrulama → Belgeler anında silinir
  - Başarısız doğrulama → Belgeler anında silinir
  - Sadece doğrulama sonucu (boolean) saklanır
  - İmha işlemi loglanır (timestamp, user_id)
  - Kullanıcıya bildirim gönderilir
İstisna: Manuel inceleme bekleyen belgeler 7 gün saklanır, sonra silinir
```

---

## 📝 İçerik Kuralları

### BR-005: Gönderi Kuralları

#### BR-005.1: Gönderi Metin Kuralları

```
Kural: Gönderi metni belirli uzunlukta olmalı ve spam olmamalıdır
Koşul: Gönderi oluşturma/düzenleme
Validasyon:
  - Minimum uzunluk: 1 karakter (boş olamaz)
  - Maksimum uzunluk: 1000 karakter
  - XSS koruması (HTML/Script tag'leri temizlenir)
  - Spam kontrolü: Aynı mesajı 5 dakika içinde tekrar paylaşamaz
  - URL kısaltma servisleri engellenir (spam önleme)
  - Aşırı emoji kullanımı sınırlandırılır (max %20)
Hata Mesajı: "Gönderi çok kısa/uzun" veya "Spam tespit edildi"
```

#### BR-005.2: Görsel Yükleme Kuralları

```
Kural: Gönderilere maksimum 5 görsel eklenebilir
Koşul: Gönderi oluşturma
Validasyon:
  - Maksimum görsel sayısı: 5 adet
  - Her görsel max 10MB
  - Toplam max: 50MB
  - Desteklenen formatlar: JPG, PNG, GIF
  - Minimum boyut: 200x200
  - Maksimum boyut: 4096x4096
  - EXIF data temizlenir (gizlilik)
  - Otomatik resize ve optimizasyon
Hata Mesajı: "Maksimum 5 görsel yükleyebilirsiniz"
```

#### BR-005.3: Gönderi Görünürlük Kuralları

```
Kural: Gönderiler sadece aynı meslek grubuna gösterilir
Koşul: Feed görüntüleme
Validasyon:
  - user.profession_id = post.profession_id
  - Engellenen kullanıcıların gönderileri gizlenir
  - Bildirilen ve onaylanmamış içerikler gizlenir
  - Silinen içerikler gösterilmez (soft delete)
  - Kullanıcı banned ise gönderileri gizlenir
```

#### BR-005.4: Gönderi Düzenleme ve Silme

```
Kural: Sadece kendi gönderilerini düzenleyebilir/silebilir
Koşul: Gönderi düzenleme/silme
Validasyon:
  - user_id === post.user_id (sahiplik kontrolü)
  - Düzenleme: 24 saat içinde yapılabilir
  - Düzenleme geçmişi saklanır (audit)
  - "Düzenlendi" etiketi eklenir
  - Silme: Soft delete (status = 'DELETED')
  - Silinen gönderi 30 gün sonra hard delete
Hata Mesajı: "Bu gönderiyi düzenleme/silme yetkiniz yok"
```

### BR-006: Yorum Kuralları

#### BR-006.1: Yorum Metin Kuralları

```
Kural: Yorum belirli uzunlukta olmalıdır
Koşul: Yorum yapma
Validasyon:
  - Minimum uzunluk: 1 karakter
  - Maksimum uzunluk: 500 karakter
  - XSS koruması
  - Spam kontrolü (aynı yorum 1 dakika içinde tekrar edilemez)
  - Gönderi sahibi yorumları kapatmışsa yorum yapılamaz
Hata Mesajı: "Yorum çok kısa/uzun" veya "Yorumlar kapalı"
```

#### BR-006.2: Alt Yorum (Reply) Kuralları

```
Kural: Alt yorum sadece 1 seviye derinlikte olabilir
Koşul: Yoruma cevap verme
Validasyon:
  - parent_comment_id null ise → 1. seviye yorum
  - parent_comment_id dolu ise → Alt yorum
  - Alt yoruma alt yorum yapılamaz (max 1 seviye)
  - Silinen yoruma cevap verilemez
Hata Mesajı: "Alt yorumlara cevap verilemez"
```

#### BR-006.3: Yorum Silme Kuralları

```
Kural: Yorumu yorum sahibi veya gönderi sahibi silebilir
Koşul: Yorum silme
Validasyon:
  - user_id === comment.user_id (kendi yorumu)
  VEYA
  - user_id === post.user_id (gönderi sahibi)
  - Silinen yorum "Yorum silindi" olarak gösterilir (soft delete)
  - Alt yorumlar varsa sadece içerik silinir, yapı kalır
Hata Mesajı: "Bu yorumu silme yetkiniz yok"
```

---

## 👍 Etkileşim Kuralları

### BR-007: Beğeni Kuralları

#### BR-007.1: Beğeni/Dislike Kuralları

```
Kural: Bir gönderi/yorumu bir kez beğenebilir veya dislike yapabilir
Koşul: Beğeni/dislike işlemi
Validasyon:
  - Aynı gönderi/yoruma hem like hem dislike yapılamaz
  - Tekrar like → Like kaldırılır
  - Like varken dislike → Like kaldırılır, dislike eklenir
  - Kendi gönderisini/yorumunu beğenemez (opsiyonel - MVP'de izin verilebilir)
  - Engellenen kullanıcının içeriğini beğenemez
Veritabanı: UNIQUE constraint (user_id, target_type, target_id)
```

#### BR-007.2: Beğeni Sayısı Güncelleme

```
Kural: Beğeni sayıları gerçek zamanlı güncellenmelidir
Koşul: Her beğeni/dislike işleminde
Validasyon:
  - Like ekleme → like_count++
  - Like kaldırma → like_count--
  - Dislike ekleme → dislike_count++
  - Dislike kaldırma → dislike_count--
  - Negatif sayı kontrolü (min 0)
  - Database transaction ile atomik işlem
```

---

## 💬 Sohbet Kuralları

### BR-008: Mesaj Gönderme Kuralları

#### BR-008.1: Mesaj İçerik Kuralları

```
Kural: Mesaj belirli uzunlukta ve uygun içerikte olmalıdır
Koşul: Mesaj gönderme
Validasyon:
  - Minimum uzunluk: 1 karakter
  - Maksimum uzunluk: 1000 karakter
  - XSS koruması
  - Spam kontrolü: Aynı mesaj 10 saniye içinde tekrar gönderilemez
  - Rate limiting: Kullanıcı başına 60 mesaj/dakika
  - Engellenen kullanıcıya mesaj gönderilemez
Hata Mesajı: "Mesaj çok uzun" veya "Çok hızlı mesaj gönderiyorsunuz"
```

#### BR-008.2: Grup Sohbet Kuralları

```
Kural: Sadece aynı meslek grubundakiler grup sohbetine katılabilir
Koşul: Grup sohbetine erişim
Validasyon:
  - user.profession_id === chat_room.profession_id
  - Doğrulanmış kullanıcılar erişebilir
  - Banned kullanıcılar erişemez
  - Mesaj geçmişi: Son 100 mesaj yüklenir
  - Daha eskiler için pagination
Hata Mesajı: "Bu sohbet odasına erişim yetkiniz yok"
```

#### BR-008.3: Özel Mesaj Kuralları

```
Kural: Özel mesaj göndermek için karşılıklı engel olmamalı
Koşul: Özel mesaj gönderme
Validasyon:
  - İki kullanıcı arasında engel kontrolü
  - Engellenen kullanıcıya mesaj gönderilemez
  - Seni engelleyen kullanıcıya mesaj gönderilemez
  - İlk mesaj gönderildiğinde chat room oluşturulur
  - Aynı kullanıcıya aynı anda birden fazla chat room oluşturulamaz
Hata Mesajı: "Bu kullanıcıya mesaj gönderemezsiniz"
```

#### BR-008.4: Mesaj Silme Kuralları

```
Kural: Mesajı sadece gönderen silebilir
Koşul: Mesaj silme
Validasyon:
  - user_id === message.sender_id
  - Silinen mesaj "Mesaj silindi" olarak gösterilir (soft delete)
  - "Her iki taraf için sil" seçeneği (her iki kullanıcı için de silinir)
  - Grup sohbetinde sadece kendi mesajları silinebilir
  - Silme işlemi 24 saat içinde yapılmalı (opsiyonel)
Hata Mesajı: "Bu mesajı silme yetkiniz yok"
```

---

## 🔒 Güvenlik ve KVKK Kuralları

### BR-009: Güvenlik Kuralları

#### BR-009.1: Rate Limiting

```
Kural: API istekleri sınırlandırılmalıdır (DDoS koruması)
Koşul: Tüm API isteklerinde
Validasyon:
  - Genel: 100 istek/dakika (user başına)
  - Giriş: 5 deneme/15 dakika
  - Kayıt: 3 deneme/saat (IP başına)
  - Mesaj: 60 mesaj/dakika
  - Gönderi: 10 gönderi/saat
  - Yorum: 30 yorum/saat
  - Belge yükleme: 3 deneme/saat
Hata: 429 Too Many Requests
Hata Mesajı: "Çok fazla istek. Lütfen X saniye bekleyin."
```

#### BR-009.2: XSS ve Injection Koruması

```
Kural: Kullanıcı girdileri sanitize edilmelidir
Koşul: Her form girişinde
Validasyon:
  - HTML/Script tag'leri temizlenir
  - SQL Injection koruması (Prepared Statements)
  - Dosya yükleme path traversal koruması
  - CSRF token kontrolü
  - Input validation (backend + frontend)
```

#### BR-009.3: Parola Güvenliği

```
Kural: Parolalar güvenli şekilde saklanmalıdır
Koşul: Kayıt ve şifre değiştirme
Validasyon:
  - bcrypt veya argon2 ile hash'leme
  - Salt kullanımı
  - Şifre veritabanında plain text olarak asla saklanmaz
  - Şifre unutma: Token 1 saat geçerli
  - Eski şifre ile aynı olamaz (şifre değiştirmede)
```

### BR-010: KVKK Kuralları

#### BR-010.1: Veri Minimizasyonu

```
Kural: Sadece gerekli veriler toplanmalıdır
Koşul: Kayıt ve profil güncellemede
Validasyon:
  - Zorunlu alanlar: Ad, Soyad, E-posta, Şifre
  - Opsiyonel: Bio, Şehir, Doğum Tarihi
  - Hassas veriler (belge, selfie) geçici saklanır
  - Location, IP, Device info loglanır (güvenlik için)
  - Üçüncü partilerle veri paylaşımı yok (MVP)
```

#### BR-010.2: Veri Saklama Süresi

```
Kural: Veriler belirli sürelerle saklanmalıdır
Koşul: Veri saklama ve imha
Saklama Süreleri:
  - Doğrulama belgeleri: 0 gün (anında silinir)
  - Kullanıcı profil verileri: Hesap aktif olduğu sürece
  - Gönderiler/Yorumlar: Kullanıcı silene kadar
  - Mesajlar: Kullanıcı silene kadar
  - Log kayıtları: 1 yıl
  - Backup: 90 gün
  - Silinen hesaplar: 30 gün (soft delete), sonra hard delete
```

#### BR-010.3: Kullanıcı Hakları

```
Kural: Kullanıcılar verilerine erişim ve silme talep edebilir
Koşul: Kullanıcı talebi
Haklar:
  - Verilerine erişim talebi: 30 gün içinde yanıt
  - Veri taşınabilirliği: JSON formatında export
  - Veri düzeltme: Profil ayarlarından
  - Veri silme (unutulma hakkı): 30 gün içinde
  - İtiraz hakkı: Destek ekibi ile
Uygulama: Ayarlar > Veri ve KVKK bölümünden
```

---

## ⚠️ Moderasyon Kuralları

### BR-011: İçerik Moderasyonu

#### BR-011.1: Otomatik Spam Tespiti

```
Kural: Spam içerik otomatik tespit edilmeli ve engellenmeli
Koşul: Gönderi/yorum oluşturma
Validasyon:
  - Aynı içerik tekrarı (5 dakika içinde)
  - Aşırı emoji kullanımı (>20%)
  - URL kısaltma servisleri
  - Yasaklı kelime listesi kontrolü
  - Benzer içerik tespit algoritması
  - ML bazlı spam sınıflandırıcı (gelecekte)
Aksiyon: İçerik otomatik reddedilir veya incelemeye gönderilir
```

#### BR-011.2: Bildiri Sistemi Kuralları

```
Kural: Kullanıcılar uygunsuz içerik bildirebilir
Koşul: Bildiri gönderme
Validasyon:
  - Kullanıcı başına 10 bildiri/gün (spam önleme)
  - Aynı içeriği birden fazla bildirme sayılmaz
  - Bildiri nedeni seçimi zorunlu
  - Açıklama opsiyonel (max 500 karakter)
  - Yanlış bildiri cezalandırılabilir (spam bildiri)
Aksiyon: Admin paneline gönderilir
```

#### BR-011.3: Otomatik İçerik Engelleme

```
Kural: Belirli eşik aşılınca içerik otomatik engellenir
Koşul: Bildiri sayısı
Validasyon:
  - 5 bildiri → İçerik gizlenir (incelemeye alınır)
  - 10 bildiri → Kullanıcı geçici suspend edilir
  - 3 kez suspend → Kalıcı ban
  - Admin incelemesi gerektirir
  - Kullanıcıya bildirim gönderilir
```

### BR-012: Kullanıcı Ban Kuralları

#### BR-012.1: Geçici Suspend

```
Kural: İhlal durumunda kullanıcı geçici olarak askıya alınır
Koşul: İhlal tespiti
Süre:
  - 1. İhlal: 1 gün
  - 2. İhlal: 7 gün
  - 3. İhlal: 30 gün
İhlal Tipleri:
  - Spam içerik paylaşımı
  - Taciz veya zorbalık
  - Sahte bilgi paylaşımı
  - Yasaklı içerik
Aksiyon: Kullanıcı giriş yapamaz, suspend süresi gösterilir
```

#### BR-012.2: Kalıcı Ban

```
Kural: Ciddi ihlallerde kalıcı ban uygulanır
Koşul: Çok ciddi ihlal
Nedenler:
  - 3 kez geçici suspend
  - Tehdit, taciz, nefret söylemi
  - Sahte profil/doğrulama dolandırıcılığı
  - Telif hakkı ihlali (tekrarlı)
  - Yasadışı içerik paylaşımı
Aksiyon: Hesap kalıcı olarak kapatılır, veriler 30 gün sonra silinir
```

### BR-013: Engelleme Kuralları

#### BR-013.1: Kullanıcı Engelleme

```
Kural: Kullanıcılar birbirlerini engelleyebilir
Koşul: Engelleme işlemi
Validasyon:
  - Kullanıcı başına max 100 engelleme
  - Kendi kendini engelleyemez
  - Admin kullanıcıları engellenemez
Etki:
  - Engellenen kullanıcının gönderileri gizlenir
  - Mesajlaşma engellenir
  - Yorumlar gizlenir
  - Bildirimler durdurulur
  - Profil görüntülenemez
Hata Mesajı: "Bu kullanıcı engellenmiş"
```

#### BR-013.2: Engel Kaldırma

```
Kural: Engel istediği zaman kaldırılabilir
Koşul: Engel kaldırma
Validasyon:
  - Anında etki eder
  - Geçmiş mesajlar/içerikler görünür hale gelir
  - Bildirimler tekrar başlar
```

---

## 📊 İstatistik ve Raporlama Kuralları

### BR-014: Sayaçlar ve Metrikler

#### BR-014.1: Gönderi İstatistikleri

```
Kural: Gönderi metrikleri doğru tutulmalıdır
Validasyon:
  - like_count, dislike_count, comment_count, view_count
  - Her işlemde atomik güncelleme (transaction)
  - Negatif değer kontrolü (min 0)
  - Silinen içerikler sayılmaz
  - Cache mekanizması (performans için)
```

#### BR-014.2: Kullanıcı Aktivite Takibi

```
Kural: Kullanıcı aktiviteleri loglanmalıdır
Koşul: Önemli işlemlerde
Loglanan Aktiviteler:
  - Giriş/Çıkış (IP, device, timestamp)
  - Gönderi/yorum oluşturma
  - Doğrulama işlemleri
  - Profil değişiklikleri
  - Güvenlik olayları (şifre değişikliği, vb.)
Saklama: 1 yıl
```

---

## 📝 Sonuç

Bu dokümanda Meslektaş uygulamasının tüm iş kuralları ve validasyonlar detaylandırılmıştır. Geliştirme sürecinde bu kurallar backend ve frontend'de uygulanmalı, testlerde doğrulanmalıdır.

**Toplam İş Kuralı Kategorisi:** 14  
**Kritik Kurallar:** Doğrulama, KVKK, Güvenlik, Moderasyon

---

**Hazırlayan:** İş Analisti & Backend Ekibi  
**Onaylayan:** Product Owner & Legal  
**Dağıtım:** Development Team, QA, Compliance
