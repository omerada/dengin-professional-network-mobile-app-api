# 📱 Kullanıcı Gereksinimleri ve User Stories

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Fonksiyonel Gereksinimler](#fonksiyonel-gereksinimler)
2. [Fonksiyonel Olmayan Gereksinimler](#fonksiyonel-olmayan-gereksinimler)
3. [User Stories](#user-stories)
4. [Kabul Kriterleri](#kabul-kriterleri)
5. [Öncelik Matrisi](#öncelik-matrisi)

---

## 🔧 Fonksiyonel Gereksinimler

### FR-001: Kullanıcı Kayıt ve Giriş

#### FR-001.1: Kayıt Seçenekleri

- Sistem, kullanıcıların 3 farklı yöntemle kayıt olmasına izin vermelidir:
  - Google hesabı (OAuth 2.0)
  - Instagram hesabı (OAuth 2.0)
  - E-posta ve şifre

#### FR-001.2: Kayıt Form Validasyonu

- E-posta formatı kontrol edilmelidir
- Şifre minimum 8 karakter olmalıdır
- Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir
- Ad ve soyad zorunlu alanlar olmalıdır
- KVKK aydınlatma metni okunup onaylanmalıdır

#### FR-001.3: Giriş

- Kullanıcılar e-posta + şifre ile giriş yapabilmelidir
- OAuth ile kayıtlı kullanıcılar OAuth ile giriş yapabilmelidir
- "Beni Hatırla" seçeneği olmalıdır
- "Şifremi Unuttum" özelliği olmalıdır

### FR-002: Meslek Seçimi ve Doğrulama

#### FR-002.1: Meslek Listesi

- Sistem, kategorize edilmiş meslek listesi sunmalıdır
- Meslekler "Doğrulama Gerektiren" ve "Doğrulama Gerektirmeyen" olarak ayrılmalıdır
- Kullanıcı arama yaparak meslek bulabilmelidir
- Kullanıcı meslek seçmeden "Genel Kategori"de devam edebilmelidir

#### FR-002.2: Belge Yükleme (Doğrulama Gerektiren Meslekler)

- Kullanıcı diploma/sertifika fotoğrafı yükleyebilmelidir
- Desteklenen formatlar: JPG, PNG, PDF
- Maksimum dosya boyutu: 5MB
- Minimum çözünürlük: 1024x768

#### FR-002.3: Selfie Doğrulama

- Kullanıcı belgeyi tutarak selfie çekebilmelidir
- Kamera izni talep edilmelidir
- Çekilen fotoğraf önizleme gösterilmelidir
- Kullanıcı fotoğrafı yeniden çekebilmelidir

#### FR-002.4: AI Doğrulama Süreci

- Yüklenen belgeler AI servisine gönderilmelidir
- OCR ile belge üzerinden metin çıkarılmalıdır
- Yüz tanıma ile selfie ve belge fotoğrafı karşılaştırılmalıdır
- Liveness detection yapılmalıdır
- Confidence score %85'in üzerindeyse otomatik onay verilmelidir
- %60-85 arasında ise manuel admin incelemesine gönderilmelidir (opsiyonel)
- %60'ın altındaysa otomatik red verilmelidir

#### FR-002.5: Doğrulama Sonrası

- Doğrulama sonucu kullanıcıya bildirilmelidir
- Başarılı doğrulama sonrası belgeler otomatik silinmelidir
- Kullanıcıya belge imhası hakkında bilgi verilmelidir
- Doğrulanmış rozet profilde gösterilmelidir

#### FR-002.6: Mavi Tik (Opsiyonel Doğrulama)

- Doğrulama gerektirmeyen mesleklerdeki kullanıcılar mavi tik alabilmelidir
- TC kimlik + selfie ile doğrulama yapılmalıdır
- Başarılı doğrulama sonrası mavi tik rozeti verilmelidir

### FR-003: Profil Yönetimi

#### FR-003.1: Profil Bilgileri

- Ad, soyad (düzenlenebilir)
- Profil fotoğrafı (yüklenebilir, değiştirilebilir)
- Bio (max 200 karakter)
- Meslek bilgisi (değiştirilemez - doğrulama sonrası)
- Şehir (opsiyonel)
- Doğum tarihi (gizli, yaş hesaplama için)

#### FR-003.2: Profil İstatistikleri

- Toplam gönderi sayısı
- Toplam beğeni sayısı
- Toplam yorum sayısı
- Kayıt tarihi

#### FR-003.3: Rozetler

- Meslek doğrulanmış rozeti
- Profil doğrulanmış rozeti (mavi tik)
- Aktif üye rozeti (gelecekte)

#### FR-003.4: Ayarlar

- Gizlilik ayarları
- Bildirim tercihleri
- Hesap güvenliği
- Veri ve KVKK
- Yardım ve destek
- Hesap silme

### FR-004: Ana Sayfa (Feed)

#### FR-004.1: Gönderi Listesi

- Sadece aynı meslek grubundaki kullanıcıların gönderileri gösterilmelidir
- Kronolojik sıralama (en yeni üstte)
- Pull-to-refresh ile yenileme
- Infinite scroll (sayfalama)

#### FR-004.2: Gönderi Kartı

- Kullanıcı profil fotoğrafı ve ismi
- Meslek rozeti
- Gönderi içeriği (max 1000 karakter)
- Görseller (1-5 adet)
- Beğeni/dislike sayısı
- Yorum sayısı
- Paylaşım tarihi
- Menü (…) butonu

#### FR-004.3: Gönderi Etkileşimleri

- Beğeni (like) butonu
- Dislike butonu
- Yorum butonu
- Kaydet butonu (gelecekte)
- Paylaş butonu (gelecekte)

### FR-005: Gönderi Oluşturma

#### FR-005.1: Gönderi Formu

- Metin girişi (max 1000 karakter)
- Görsel ekleme (max 5 adet, her biri max 10MB)
- Yorum yapma açma/kapatma toggle
- Karakter sayacı
- Önizleme

#### FR-005.2: Gönderi Validasyonu

- Boş gönderi yayınlanamamalıdır
- Maksimum karakter sınırı aşılmamalıdır
- Görsel boyutu kontrol edilmelidir
- Desteklenen format: JPG, PNG, GIF

#### FR-005.3: Gönderi Yayınlama

- Yayınla butonuna basıldığında gönderi kaydedilmelidir
- Kullanıcı feed sayfasına yönlendirilmelidir
- Başarılı yayın bildirimi gösterilmelidir

### FR-006: Yorum Sistemi

#### FR-006.1: Yorum Listesi

- Gönderiye yapılan yorumlar listelenmeli
- Kronolojik sıralama
- Yorum sahibinin profil fotoğrafı ve ismi
- Meslek rozeti
- Yorum metni
- Yorum tarihi
- Beğeni sayısı

#### FR-006.2: Yorum Yapma

- Yorum metni max 500 karakter olmalı
- Boş yorum gönderilememelidir
- Yorum sahibine bildirim gönderilmelidir
- Gönderi sahibine bildirim gönderilmelidir

#### FR-006.3: Alt Yorum (Reply)

- Yorumlara tek seviye alt yorum yapılabilmeli
- Alt yorum sahibine bildirim gönderilmeli

#### FR-006.4: Yorum İşlemleri

- Kendi yorumunu düzenleyebilme
- Kendi yorumunu silebilme
- Gönderi sahibi tüm yorumları silebilme
- Yorum bildirme (spam, taciz, vb.)

### FR-007: Meslek Sohbet Odası

#### FR-007.1: Genel Sohbet

- Aynı meslek grubundaki tüm kullanıcılar katılabilmeli
- Gerçek zamanlı mesajlaşma (WebSocket)
- Son 100 mesaj geçmişi gösterilmeli
- Daha eski mesajlar scroll ile yüklenebilmeli

#### FR-007.2: Mesaj Gönderme

- Metin mesajı (max 1000 karakter)
- Emoji picker
- Mesaj gönderme butonu
- Enter tuşu ile gönderme (web'de)

#### FR-007.3: Mesaj Gösterimi

- Mesaj balonu (kendi mesajları sağda, diğerleri solda)
- Gönderen ismi ve profil fotoğrafı
- Mesaj zamanı
- Mesaj durumu (gönderildi, görüldü - gelecekte)

#### FR-007.4: Aktif Kullanıcılar

- Online kullanıcı sayısı gösterilmeli
- Aktif kullanıcı listesi (opsiyonel)

### FR-008: Özel Mesajlaşma

#### FR-008.1: Sohbet Listesi

- Tüm konuşmalar listelenmeli
- Son mesaj önizlemesi
- Okunmamış mesaj sayısı
- Son mesaj zamanı
- Karşı taraf profil fotoğrafı ve ismi

#### FR-008.2: Sohbet Ekranı

- Gerçek zamanlı mesajlaşma
- Mesaj geçmişi (infinite scroll)
- Yazıyor... göstergesi
- Okundu bilgisi (✓✓)

#### FR-008.3: Mesaj İşlemleri

- Mesaj gönderme
- Mesaj silme (her iki taraf için)
- Kullanıcı engelleme
- Sohbet bildirme

### FR-009: Bildirim Sistemi

#### FR-009.1: Bildirim Türleri

- Yeni özel mesaj
- Yeni grup mesajı
- Gönderi beğenisi
- Yeni yorum
- Alt yoruma cevap
- Doğrulama sonucu
- Sistem bildirimleri

#### FR-009.2: Bildirim Gösterimi

- Bildirim listesi
- Okunmamış sayısı
- Bildirim zamanı
- Bildirim ikonu
- İlgili sayfaya yönlendirme

#### FR-009.3: Bildirim Ayarları

- Her bildirim türü için açma/kapatma
- Sessiz saatler
- Ses ve titreşim tercihleri

#### FR-009.4: Push Notification

- FCM (Android) ve APNS (iOS) entegrasyonu
- Uygulama kapalıyken bildirim
- Bildirime tıklayınca ilgili sayfa açılmalı

### FR-010: Arama ve Filtreleme

#### FR-010.1: Kullanıcı Arama

- İsim ve soyisim ile arama
- Meslek filtreleme
- Doğrulanmış kullanıcılar filtresi

#### FR-010.2: Gönderi Arama (Gelecekte)

- İçerik arama
- Tarih filtreleme
- Popüler gönderiler

### FR-011: Bildiri ve Moderasyon

#### FR-011.1: İçerik Bildirme

- Gönderi bildirme
- Yorum bildirme
- Mesaj bildirme
- Kullanıcı bildirme

#### FR-011.2: Bildiri Nedenleri

- Spam
- Taciz veya zorbalık
- Sahte profil
- Uygunsuz içerik
- Telif hakkı ihlali
- Diğer (açıklama ile)

#### FR-011.3: Kullanıcı Engelleme

- Kullanıcıyı engelleyebilme
- Engellenen kullanıcı listesi
- Engeli kaldırabilme

---

## ⚙️ Fonksiyonel Olmayan Gereksinimler

### NFR-001: Performans

- Uygulama başlangıç süresi < 3 saniye
- Ana sayfa yüklenme süresi < 2 saniye
- API response time < 500ms (ortalama)
- Mesaj gönderme gecikm esi < 1 saniye
- Görsel yükleme < 5 saniye (optimizasyon ile)

### NFR-002: Güvenilirlik

- Sistem uptime > 99% (MVP için 95%+)
- Veri kaybı riski minimum (daily backup)
- Hata recovery mekanizması
- Offline mod (mesaj geçmişi cache - gelecekte)

### NFR-003: Güvenlik

- HTTPS zorunlu
- JWT token süre sınırlı (24 saat)
- Password hashing (bcrypt/argon2)
- Rate limiting (API abuse önleme)
- XSS, CSRF, SQL Injection koruması
- File upload validation
- Veri şifreleme (at rest)

### NFR-004: Kullanılabilirlik

- Responsive tasarım (iOS ve Android)
- Türkçe dil desteği
- Erişilebilirlik standartları (accessibility)
- Sezgisel navigasyon
- Tutarlı UI/UX
- Hata mesajları anlaşılır olmalı

### NFR-005: Ölçeklenebilirlik

- 10,000 aktif kullanıcıya kadar ölçeklenebilir (MVP)
- Database indexing
- API pagination
- Image CDN kullanımı
- Caching stratejisi

### NFR-006: Uyumluluk

- iOS 14.0+
- Android 8.0+ (API level 26+)
- KVKK uyumlu
- App Store ve Play Store politikalarına uygun

### NFR-007: Bakım ve Destek

- Detaylı log kayıtları
- Error tracking (Sentry, Crashlytics)
- Analytics (Firebase Analytics)
- A/B testing altyapısı (gelecekte)
- Remote config (Firebase Remote Config)

---

## 📖 User Stories

### Epic 1: Kullanıcı Onboarding

#### US-001: Kullanıcı Kayıt

**Konu:** Kullanıcı olarak, farklı yöntemlerle kayıt olabilmek istiyorum  
**Neden:** Hızlı ve kolay kayıt olmak istiyorum

**Kabul Kriterleri:**

- [ ] Google ile kayıt olabilmeliyim
- [ ] Instagram ile kayıt olabilmeliyim
- [ ] E-posta ile kayıt olabilmeliyim
- [ ] KVKK metnini okuyup onaylamalıyım
- [ ] Kayıt sonrası otomatik giriş yapılmalı

**Story Points:** 8  
**Öncelik:** Yüksek

#### US-002: Meslek Seçimi

**Konu:** Kullanıcı olarak, mesleğimi seçebilmek istiyorum  
**Neden:** Kendi meslek grubumla etkileşime geçmek istiyorum

**Kabul Kriterleri:**

- [ ] Meslek listesini görebilmeliyim
- [ ] Arama yaparak meslek bulabilmeliyim
- [ ] Doğrulama gerektiren meslekler işaretli olmalı
- [ ] Meslek seçmeden devam edebilmeliyim

**Story Points:** 5  
**Öncelik:** Yüksek

#### US-003: Belge Doğrulama

**Konu:** Kullanıcı olarak, mesleğimi doğrulamak istiyorum  
**Neden:** Doğrulanmış rozet almak ve güvenilir görünmek istiyorum

**Kabul Kriterleri:**

- [ ] Diploma/sertifika yükleyebilmeliyim
- [ ] Selfie çekebilmeliyim
- [ ] Doğrulama sürecini takip edebilmeliyim
- [ ] Doğrulama sonucunu bildirim ile öğrenebilmeliyim
- [ ] Belgelerimin silindiğine dair bilgi almalıyım

**Story Points:** 13  
**Öncelik:** Kritik

### Epic 2: Feed ve İçerik

#### US-004: Ana Sayfa Feed

**Konu:** Kullanıcı olarak, meslektaşlarımın paylaşımlarını görmek istiyorum  
**Neden:** Mesleki bilgi ve deneyim paylaşımlarını takip etmek istiyorum

**Kabul Kriterleri:**

- [ ] Sadece aynı meslekteki paylaşımları görmeliyim
- [ ] Yeni paylaşımları üstte görmeliyim
- [ ] Aşağı kaydırarak daha fazla gönderi yüklenebilmeli
- [ ] Feed'i yenileyebilmeliyim (pull-to-refresh)

**Story Points:** 8  
**Öncelik:** Yüksek

#### US-005: Gönderi Paylaşma

**Konu:** Kullanıcı olarak, düşüncelerimi ve görsellerimi paylaşmak istiyorum  
**Neden:** Deneyimlerimi meslektaşlarımla paylaşmak istiyorum

**Kabul Kriterleri:**

- [ ] Metin yazabilmeliyim (max 1000 karakter)
- [ ] Görsel ekleyebilmeliyim (max 5 adet)
- [ ] Yorum yapma seçeneğini açıp kapatabilmeliyim
- [ ] Paylaşımdan önce önizleme görebilmeliyim

**Story Points:** 8  
**Öncelik:** Yüksek

#### US-006: Gönderi Beğenme

**Konu:** Kullanıcı olarak, beğendiğim gönderileri beğenmek veya beğenmemek istiyorum  
**Neden:** Görüşümü belirtmek istiyorum

**Kabul Kriterleri:**

- [ ] Like butonu ile beğenebilmeliyim
- [ ] Dislike butonu ile beğenmeyebilmeliyim
- [ ] Beğeni durumunu değiştirebilmeliyim
- [ ] Beğeni sayısını görebilmeliyim

**Story Points:** 5  
**Öncelik:** Orta

#### US-007: Yorum Yapma

**Konu:** Kullanıcı olarak, gönderilere yorum yapabilmek istiyorum  
**Neden:** Fikirlerimi ve sorularımı paylaşmak istiyorum

**Kabul Kriterleri:**

- [ ] Yorum yazabilmeliyim (max 500 karakter)
- [ ] Yorumlara cevap verebilmeliyim
- [ ] Kendi yorumumu düzenleyebilmeliyim
- [ ] Kendi yorumumu silebilmeliyim

**Story Points:** 8  
**Öncelik:** Orta

### Epic 3: Sohbet

#### US-008: Meslek Sohbet Odası

**Konu:** Kullanıcı olarak, meslektaşlarımla grup sohbeti yapabilmek istiyorum  
**Neden:** Gerçek zamanlı iletişim kurmak istiyorum

**Kabul Kriterleri:**

- [ ] Meslek sohbet odasına girebilmeliyim
- [ ] Mesaj gönderebilmeliyim
- [ ] Geçmiş mesajları görebilmeliyim
- [ ] Online kullanıcı sayısını görebilmeliyim

**Story Points:** 13  
**Öncelik:** Yüksek

#### US-009: Özel Mesajlaşma

**Konu:** Kullanıcı olarak, bireysel kullanıcılarla özel mesajlaşabilmek istiyorum  
**Neden:** Birebir iletişim kurmak istiyorum

**Kabul Kriterleri:**

- [ ] Kullanıcıya özel mesaj gönderebilmeliyim
- [ ] Tüm konuşmalarımı listeleyebilmeliyim
- [ ] Okundu bilgisini görebilmeliyim
- [ ] Yazıyor... göstergesini görebilmeliyim

**Story Points:** 13  
**Öncelik:** Orta

### Epic 4: Profil ve Ayarlar

#### US-010: Profil Görüntüleme

**Konu:** Kullanıcı olarak, kendi profilimi ve diğer kullanıcıların profillerini görebilmek istiyorum  
**Neden:** Profil bilgilerini ve paylaşımlarını incelemek istiyorum

**Kabul Kriterleri:**

- [ ] Profil bilgilerini görebilmeliyim
- [ ] Gönderileri görebilmeliyim
- [ ] Rozetleri görebilmeliyim
- [ ] İstatistikleri görebilmeliyim

**Story Points:** 5  
**Öncelik:** Orta

#### US-011: Profil Düzenleme

**Konu:** Kullanıcı olarak, profil bilgilerimi güncelleyebilmek istiyorum  
**Neden:** Bilgilerimi güncel tutmak istiyorum

**Kabul Kriterleri:**

- [ ] Profil fotoğrafı değiştirebilmeliyim
- [ ] Bio güncelleyebilmeliyim
- [ ] Şehir ekleyebilmeliyim
- [ ] Ad-soyad güncelleyebilmeliyim

**Story Points:** 5  
**Öncelik:** Düşük

#### US-012: Bildirim Ayarları

**Konu:** Kullanıcı olarak, bildirim tercihlerimi ayarlayabilmek istiyorum  
**Neden:** Gereksiz bildirimleri kapatmak istiyorum

**Kabul Kriterleri:**

- [ ] Her bildirim türü için açıp kapatabilmeliyim
- [ ] Sessiz saatler ayarlayabilmeliyim
- [ ] Ses ve titreşim tercihlerini değiştirebilmeliyim

**Story Points:** 5  
**Öncelik:** Düşük

### Epic 5: Güvenlik ve Moderasyon

#### US-013: Kullanıcı Engelleme

**Konu:** Kullanıcı olarak, istemediğim kullanıcıları engelleyebilmek istiyorum  
**Neden:** Rahatsız edici kullanıcılardan korunmak istiyorum

**Kabul Kriterleri:**

- [ ] Kullanıcıyı engelleyebilmeliyim
- [ ] Engellenen kullanıcıların içeriğini görmemeliyim
- [ ] Engellenen kullanıcı bana mesaj gönderememeli
- [ ] Engellediğim kullanıcıları listeleyebilmeliyim
- [ ] Engeli kaldırabilmeliyim

**Story Points:** 8  
**Öncelik:** Orta

#### US-014: İçerik Bildirme

**Konu:** Kullanıcı olarak, uygunsuz içerikleri bildirebilmek istiyorum  
**Neden:** Topluluğu spam ve uygunsuz içerikten korumak istiyorum

**Kabul Kriterleri:**

- [ ] Gönderi bildirebilmeliyim
- [ ] Yorum bildirebilmeliyim
- [ ] Mesaj bildirebilmeliyim
- [ ] Kullanıcı bildirebilmeliyim
- [ ] Bildiri nedeni seçebilmeliyim

**Story Points:** 5  
**Öncelik:** Orta

---

## ✅ Kabul Kriterleri

### Genel Kabul Kriterleri (Definition of Done)

Her user story tamamlanmış sayılabilmesi için:

- [ ] Kod yazılmış ve code review yapılmış
- [ ] Unit testler yazılmış ve başarılı
- [ ] Integration testler yazılmış ve başarılı
- [ ] UI/UX tasarıma uygun
- [ ] Performans testleri geçilmiş
- [ ] Güvenlik kontrolleri yapılmış
- [ ] Dokümantasyon güncellenmiş
- [ ] Product Owner onayı alınmış
- [ ] Staging ortamında test edilmiş
- [ ] Bug yok veya kritik bug yok

### MVP Kabul Kriterleri

MVP tamamlanmış sayılabilmesi için:

#### Fonksiyonel Kabul Kriterleri

- [ ] Kullanıcı kayıt ve giriş yapabiliyor (3 yöntem)
- [ ] Meslek seçimi ve doğrulama çalışıyor
- [ ] AI doğrulama %85+ başarı oranı
- [ ] Feed'de gönderiler görüntüleniyor
- [ ] Gönderi oluşturma, beğeni, yorum çalışıyor
- [ ] Meslek sohbet odası çalışıyor
- [ ] Özel mesajlaşma çalışıyor
- [ ] Bildirimler çalışıyor
- [ ] Profil görüntüleme ve düzenleme çalışıyor
- [ ] Kullanıcı engelleme ve bildirme çalışıyor

#### Teknik Kabul Kriterleri

- [ ] Uygulama crash oranı < 1%
- [ ] API response time < 500ms
- [ ] Uygulama başlangıç süresi < 3s
- [ ] Tüm kritik API'ler dokümante edilmiş
- [ ] Database backup sistemi çalışıyor
- [ ] Error tracking (Sentry/Crashlytics) kurulu
- [ ] Analytics (Firebase) kurulu
- [ ] KVKK uyumlu (belgeler siliniyor)

#### İş Kabul Kriterleri

- [ ] 500+ doğrulanmış kullanıcı
- [ ] 5 pilot meslek grubu aktif
- [ ] Günlük 50+ gönderi
- [ ] Günlük 200+ mesaj
- [ ] App Store ve Play Store'da yayında
- [ ] Rating > 4.0/5
- [ ] Retention (7 gün) > 40%

---

## 📊 Öncelik Matrisi (MoSCoW)

### Must Have (Olmazsa Olmaz - MVP İçin Kritik)

1. Kullanıcı kayıt ve giriş (US-001)
2. Meslek seçimi (US-002)
3. Belge doğrulama (US-003)
4. Ana sayfa feed (US-004)
5. Gönderi paylaşma (US-005)
6. Meslek sohbet odası (US-008)
7. Bildirimler (temel)

### Should Have (Olması Çok İyi Olur - MVP İçin Önemli)

1. Gönderi beğenme (US-006)
2. Yorum yapma (US-007)
3. Özel mesajlaşma (US-009)
4. Profil görüntüleme (US-010)
5. Kullanıcı engelleme (US-013)
6. İçerik bildirme (US-014)

### Could Have (Olabilir - MVP Sonrası)

1. Profil düzenleme (US-011)
2. Bildirim ayarları (US-012)
3. Gelişmiş arama
4. İçerik kaydetme
5. Paylaşım (share)

### Won't Have (Olmayacak - İlk Versiyonda)

1. Video paylaşımı
2. Hikaye (stories)
3. Canlı yayın
4. Sesli/görüntülü arama
5. İş ilanları
6. E-ticaret entegrasyonu
7. Oyunlaştırma (gamification)

---

## 📌 Sonuç

Bu dokümanda Meslektaş uygulaması için tüm fonksiyonel ve fonksiyonel olmayan gereksinimler, user story'ler ve kabul kriterleri detaylandırılmıştır. MVP geliştirme sürecinde bu dokümana referans verilmeli ve her sprint'te öncelikli user story'ler seçilmelidir.

**Toplam User Stories:** 14  
**Toplam Story Points:** 115  
**Tahmini Sprint Sayısı:** 10-12 (2 haftalık sprintler)

---

**Hazırlayan:** Proje Analisti  
**Onaylayan:** Product Owner  
**Dağıtım:** Development Team, QA, Stakeholders
