# 🔄 Kullanıcı Akışları (User Flows)

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Onboarding Akışları](#onboarding-akışları)
2. [Ana Özellik Akışları](#ana-özellik-akışları)
3. [Sohbet Akışları](#sohbet-akışları)
4. [Profil ve Ayarlar Akışları](#profil-ve-ayarlar-akışları)
5. [Moderasyon Akışları](#moderasyon-akışları)

---

## 🚀 Onboarding Akışları

### UF-001: Kullanıcı Kayıt Akışı

```
BAŞLANGIÇ
    ↓
Açılış Ekranı
    ├── Giriş Yap
    └── Kayıt Ol
        ↓
Kayıt Yöntemi Seçimi
    ├── Google ile Devam Et
    │   ↓
    │   Google OAuth
    │   ↓
    │   [Başarılı] → Ad/Soyad Otomatik Dolduruldu
    │   ↓
    ├── Instagram ile Devam Et
    │   ↓
    │   Instagram OAuth
    │   ↓
    │   [Başarılı] → Ad/Soyad Otomatik Dolduruldu
    │   ↓
    └── E-posta ile Kayıt
        ↓
        E-posta ve Şifre Girişi
        ├── E-posta format kontrolü
        ├── Şifre güvenlik kontrolü
        └── Ad/Soyad girişi
        ↓
KVKK Aydınlatma Metni
    ├── Metni Oku
    ├── Onay Checkbox
    └── [Onaylanmadan devam edilemez]
    ↓
Kayıt Butonu
    ↓
Backend Doğrulama
    ├── E-posta benzersizlik kontrolü
    ├── Şifre hash'leme
    └── Kullanıcı kaydı oluşturma
    ↓
[Başarılı]
    ↓
Hoşgeldin Ekranı
    ↓
Meslek Seçimi Ekranına Yönlendir
```

**Alternatif Akışlar:**

- **A1:** E-posta zaten kayıtlı → Hata mesajı → "Giriş Yap" önerisi
- **A2:** Şifre güvenli değil → Hata mesajı → Yeniden dene
- **A3:** OAuth başarısız → Hata mesajı → Alternatif yöntem öner

---

### UF-002: Meslek Seçimi ve Doğrulama Akışı

```
Meslek Seçimi Ekranı
    ↓
Seçenek Sunumu
    ├── Meslek Seç
    └── Şimdilik Atla → GE NEL KATEGORİ → ANA SAYFA
    ↓
Meslek Arama/Listele
    ├── Arama yapma
    ├── Kategoriye göre filtreleme
    └── Meslek seçme
    ↓
Meslek Seçildi
    ↓
Doğrulama Gereksinimi Kontrolü
    ├── Doğrulama GEREKMİYOR
    │   ↓
    │   "Mavi Tik Almak İster Misin?" Modalı
    │   ├── Evet → Mavi Tik Doğrulama Akışı
    │   └── Hayır → ANA SAYFA
    │   ↓
    └── Doğrulama GEREKİYOR
        ↓
Doğrulama Bilgilendirme Ekranı
    ├── Süreç açıklaması
    ├── Gerekli belgeler listesi
    ├── KVKK bilgilendirmesi
    └── "Başla" butonu
    ↓
Belge Yükleme Ekranı
    ├── Diploma/Sertifika Seç
    │   ├── Galeriden Seç
    │   ├── Kamera ile Çek
    │   └── PDF Yükle
    │   ↓
    │   Önizleme
    │   ├── Yeniden Yükle
    │   └── Onayla
    ↓
Selfie Çekme Ekranı
    ├── "Belgeyi Elin de Tut" talimatı
    ├── Kamera izni talep et
    ├── Selfie çek
    │   ↓
    │   Önizleme
    │   ├── Yeniden Çek
    │   └── Onayla
    ↓
Yükleme ve AI Doğrulama
    ├── "Belgeler Yükleniyor..." (Progress)
    ├── "AI Doğrulama Yapılıyor..." (Progress)
    └── Backend'e gönder
        ↓
        AI Servisi
        ├── OCR (Belge metin çıkarma)
        ├── Face Recognition (Yüz eşleştirme)
        ├── Liveness Detection (Canlılık)
        └── Document Verification (Belge doğruluk)
        ↓
        Confidence Score Hesaplama
        ↓
        ├── Score > 85% → OTOMATIK ONAY
        │   ↓
        │   Belgeleri Sil (KVKK)
        │   ↓
        │   Kullanıcıya Bildirim Gönder
        │   ↓
        │   "Doğrulama Başarılı!" Ekranı
        │   ↓
        │   ANA SAYFA (Doğrulanmış Rozet ile)
        │
        ├── 60% < Score < 85% → MANUEL İNCELEME (Opsiyonel)
        │   ↓
        │   Admin Paneline Gönder
        │   ↓
        │   "İnceleniyor..." Ekranı
        │   ↓
        │   [Admin Onayı Bekleniyor]
        │   ↓
        │   ├── Admin Onay → Başarılı Akış
        │   └── Admin Red → Başarısız Akış
        │
        └── Score < 60% → OTOMATIK RED
            ↓
            Belgeleri Sil
            ↓
            "Doğrulama Başarısız" Ekranı
            ├── Neden açıklaması
            ├── Yeniden Dene (3 hak)
            └── Genel Kategoriye Geç
            ↓
            ANA SAYFA (Doğrulanmamış)
```

**Alternatif Akışlar:**

- **A1:** Kamera izni verilmedi → İzin açıklaması → Ayarlara yönlendir
- **A2:** Dosya boyutu fazla → Hata mesajı → Yeniden yükle
- **A3:** AI servisi timeout → "Teknik sorun" mesajı → Yeniden dene
- **A4:** 3 başarısız deneme → Genel kategoriye yönlendir

---

### UF-003: Giriş Akışı

```
Giriş Ekranı
    ↓
Giriş Yöntemi Seçimi
    ├── E-posta + Şifre
    │   ↓
    │   Credential girişi
    │   ↓
    │   Backend Doğrulama
    │   ├── [Başarılı] → JWT Token Al
    │   └── [Başarısız] → Hata Mesajı
    │       ├── E-posta bulunamadı
    │       └── Şifre hatalı
    │   ↓
    ├── Google ile Giriş
    │   ↓
    │   Google OAuth
    │   ↓
    │   Backend Token Doğrulama
    │   ↓
    └── Instagram ile Giriş
        ↓
        Instagram OAuth
        ↓
        Backend Token Doğrulama
        ↓
[Başarılı Giriş]
    ↓
Token Kaydet (AsyncStorage)
    ↓
Kullanıcı Durumu Kontrolü
    ├── Meslek Seçimi Yapılmamış → Meslek Seçimi Ekranı
    ├── Doğrulama Beklemede → Doğrulama Durumu Ekranı
    └── Tamamlanmış → ANA SAYFA
```

**Alternatif Akışlar:**

- **A1:** "Beni Hatırla" seçili → Token sakla → Otomatik giriş
- **A2:** "Şifremi Unuttum" → E-posta gir → Sıfırlama linki gönder
- **A3:** Hesap yasaklanmış → "Hesap askıya alındı" mesajı → Destek

---

## 📰 Ana Özellik Akışları

### UF-004: Ana Sayfa Feed Görüntüleme

```
ANA SAYFA (Feed)
    ↓
Sayfa Yükleniyor
    ├── Backend API Call
    │   ├── GET /api/posts?profession_id={id}&page=1
    │   └── Kullanıcının meslek grubuna göre filtrele
    │   ↓
    │   [Başarılı]
    │   ├── Gönderileri Al (20 adet)
    │   └── Cache'e Kaydet
    │   ↓
    └── [Başarısız]
        └── Hata Mesajı → Yeniden Dene
    ↓
Gönderi Listesi Göster
    ├── Gönderi Kartları
    │   ├── Kullanıcı Bilgisi (Ad, Profil Fotoğrafı, Meslek)
    │   ├── Gönderi İçeriği (Metin + Görseller)
    │   ├── Etkileşim Butonları (Beğeni, Dislike, Yorum)
    │   └── Zaman Damgası
    │   ↓
    ├── Infinite Scroll
    │   ↓
    │   Kullanıcı Aşağı Kaydırır
    │   ↓
    │   Sayfa Sonu Algılanır
    │   ↓
    │   Sonraki Sayfa Yükle (page++)
    │   ↓
    └── Pull to Refresh
        ↓
        Kullanıcı Yukarı Çeker
        ↓
        Feed Yenilenir (page=1)
        ↓
        Yeni Gönderiler Varsa Göster
```

**Etkileşim Akışları:**

- Gönderi Tıklama → Gönderi Detay Ekranı
- Profil Tıklama → Kullanıcı Profil Sayfası
- Beğeni Tıklama → Beğeni Gönder (UF-005)
- Yorum Tıklama → Yorum Listesi (UF-007)
- Menü (…) Tıklama → Gönderi Seçenekleri

---

### UF-005: Gönderi Paylaşma

```
Ana Sayfa
    ↓
"+" (Yeni Gönderi) Butonu Tıkla
    ↓
Gönderi Oluştur Ekranı
    ↓
İçerik Girişi
    ├── Metin Girişi (Max 1000 karakter)
    │   └── Karakter Sayacı Göster
    │   ↓
    └── Görsel Ekleme (Opsiyonel)
        ├── Galeriden Seç (Max 5 adet)
        ├── Kamera ile Çek
        └── Görselleri Önizle
        ↓
Ayarlar
    ├── Yorum Yapma Toggle (Açık/Kapalı)
    └── (Gelecekte: Görünürlük, Etiketler)
    ↓
"Paylaş" Butonu
    ↓
Validasyon
    ├── Boş mu? → Hata: "İçerik boş olamaz"
    ├── Karakter sınırı aşıldı mı? → Hata
    ├── Görsel boyutu uygun mu? → Hata
    └── [Geçti]
    ↓
Backend'e Gönder
    ├── Upload Görseller (S3/Cloudinary)
    ├── POST /api/posts
    │   └── {text, images[], is_comment_enabled}
    └── "Paylaşılıyor..." Loading
    ↓
[Başarılı]
    ├── "Paylaşım Başarılı!" Toast
    ├── Feed Yenile
    └── Gönderi Üstte Göster
    ↓
Ana Sayfa'ya Dön
```

**Alternatif Akışlar:**

- **A1:** İnternet yok → "Bağlantı hatası" → Taslak kaydet (local)
- **A2:** Upload başarısız → Hata mesajı → Yeniden dene
- **A3:** Spam tespiti → "İçerik kurallarına uygun değil" → Red

---

### UF-006: Gönderi Beğeni/Dislike

```
Feed'de Gönderi Görüntüleniyor
    ↓
Beğeni Butonu Tıklanır
    ↓
Durumu Kontrol Et
    ├── Daha Önce Beğenilmiş mi?
    │   ├── EVET → Beğeniyi Kaldır
    │   │   ↓
    │   │   DELETE /api/likes/{id}
    │   │   ↓
    │   │   Buton Durumunu Güncelle (Pasif)
    │   │   ↓
    │   └── HAYIR → Beğen
    │       ↓
    │       POST /api/likes {post_id, is_like: true}
    │       ↓
    │       Buton Durumunu Güncelle (Aktif)
    │       ↓
    │       Gönderi Sahibine Bildirim Gönder
    │       ↓
    └── Daha Önce Dislike mi?
        ├── EVET → Dislike Kaldır, Like Ekle
        └── HAYIR → Like Ekle
    ↓
Beğeni Sayısını Güncelle (UI)
    ├── Optimistic Update (Hemen göster)
    └── Backend Response ile Doğrula
```

**Dislike Akışı (Benzer):**

- Dislike butonu → is_like: false
- Diğer işlemler aynı

---

### UF-007: Yorum Yapma ve Görüntüleme

```
Gönderi Detay Ekranı
    ↓
Yorum Bölümü
    ├── Yorumları Yükle
    │   ├── GET /api/posts/{post_id}/comments
    │   └── Yorumları Listele (Kronolojik)
    │   ↓
    └── Yorum Input Alanı
        ↓
Kullanıcı Yorum Yazar (Max 500 karakter)
    ↓
"Gönder" Butonu
    ↓
Validasyon
    ├── Boş mu? → Hata
    ├── Karakter sınırı aşıldı mı? → Hata
    └── [Geçti]
    ↓
POST /api/comments
    └── {post_id, content}
    ↓
[Başarılı]
    ├── Yorum Listeye Eklenir
    ├── Gönderi Sahibine Bildirim
    ├── Parent Comment Varsa → Yorum Sahibine Bildirim
    └── "Yorum gönderildi" Toast
    ↓
Yorum Göster (UI Update)
```

**Alt Yorum (Reply) Akışı:**

```
Yoruma "Cevapla" Tıkla
    ↓
Input Alanı Odaklanır
    ├── "@kullanıcı_adı" otomatik eklenir
    └── parent_comment_id kaydedilir
    ↓
Yorum Yaz ve Gönder
    ↓
POST /api/comments
    └── {post_id, parent_comment_id, content}
    ↓
Alt Yorum Olarak Göster (Girinti ile)
```

---

## 💬 Sohbet Akışları

### UF-008: Meslek Sohbet Odası

```
Ana Sayfa
    ↓
"Sohbet" Tab'ına Tıkla
    ↓
Meslek Sohbet Odası Ekranı
    ↓
WebSocket Bağlantısı Kur
    ├── ws://server/chat/{profession_id}
    ├── Bağlantı Başarılı → Online
    └── Bağlantı Başarısız → Hata Mesajı
    ↓
Son 100 Mesajı Yükle
    ├── GET /api/chat/rooms/{profession_id}/messages?limit=100
    └── Mesajları Göster (Scroll en altta)
    ↓
Gerçek Zamanlı Dinleme
    ├── Yeni Mesaj Geldi (WebSocket Event)
    │   ↓
    │   Mesajı Listeye Ekle
    │   ↓
    │   Scroll Aşağı (Otomatik)
    │   ↓
    │   Bildirim Gönder (Uygulama açık değilse)
    │   ↓
    └── Kullanıcı Online/Offline (WebSocket Event)
        ↓
        Aktif Kullanıcı Sayısını Güncelle
        ↓
Mesaj Gönderme
    ├── Kullanıcı Metin Yazar
    ├── Emoji Picker Açılabilir
    └── "Gönder" Butonu / Enter
    ↓
    WebSocket Emit
    ├── socket.emit('send_message', {room_id, content})
    └── "Gönderiliyor..." Durumu
    ↓
    Backend İşleme
    ├── Mesajı Kaydet (DB)
    ├── Broadcast (Tüm odadakilere)
    └── WebSocket Event → Tüm Client'lara
    ↓
    [Başarılı]
    ├── Mesaj Listeye Eklenir
    ├── Gönderen Simgesi (✓)
    └── Input Temizlenir
```

**Alternatif Akışlar:**

- **A1:** WebSocket bağlantısı kesildi → "Bağlantı yeniden kuruluyor..."
- **A2:** Mesaj gönderilemedi → Hata simgesi → Yeniden dene
- **A3:** Scroll yukarı → Eski mesajlar yükle (pagination)

---

### UF-009: Özel Mesajlaşma

```
Kullanıcı Profili
    ↓
"Mesaj Gönder" Butonu Tıkla
    ↓
Mevcut Konuşma Kontrolü
    ├── Daha Önce Konuşma Var mı?
    │   ├── EVET → Mevcut Sohbet Ekranı Aç
    │   └── HAYIR → Yeni Sohbet Oluştur
    │       ↓
    │       POST /api/chat/rooms {user_ids: [my_id, target_id], type: 'PRIVATE'}
    │       ↓
    ↓
Sohbet Ekranı
    ↓
Mesaj Geçmişini Yükle
    ├── GET /api/chat/rooms/{room_id}/messages
    └── Mesajları Göster
    ↓
WebSocket Bağlantısı
    ├── ws://server/chat/{room_id}
    └── Realtime Events Dinle
    ↓
Mesaj Gönderme
    ├── Metin Girişi
    ├── "Yazıyor..." Gösterme
    │   ↓
    │   socket.emit('typing', {room_id, user_id})
    │   ↓
    │   Karşı Tarafa "Yazıyor..." Göster
    │   ↓
    └── "Gönder" Butonu
        ↓
        WebSocket Emit
        ├── socket.emit('send_message', {room_id, content})
        └── Optimistic UI Update
        ↓
        Backend
        ├── Mesajı Kaydet
        ├── Alıcıya Push Notification
        └── WebSocket Broadcast
        ↓
        [Başarılı]
        ├── Mesaj Durumu: "Gönderildi" (✓)
        ├── Karşı Taraf Okursa: "Okundu" (✓✓)
        └── read_at güncelle
```

**Özel Özellikler:**

- **Yazıyor Göstergesi:** Timeout 3s sonra kaybolur
- **Okundu Bilgisi:** Karşı taraf sohbet ekranını açınca
- **Mesaj Silme:** Long press → "Sil" → Her iki taraf için sil

---

### UF-010: Sohbet Listesi (İnbox)

```
"Mesajlar" Tab'ı
    ↓
Sohbet Listesi Yükle
    ├── GET /api/chat/rooms?user_id={my_id}&type=PRIVATE
    └── Konuşmaları Listele
    ↓
Her Konuşma Kartı
    ├── Karşı Taraf Profil Fotoğrafı
    ├── Karşı Taraf Adı
    ├── Son Mesaj Önizlemesi (50 karakter)
    ├── Son Mesaj Zamanı
    ├── Okunmamış Mesaj Badge (Sayı)
    └── Online Durumu (Yeşil Nokta)
    ↓
Sıralama
    ├── Okunmamış olanlar üstte
    └── Son mesaj zamanına göre (en yeni üstte)
    ↓
Konuşmaya Tıkla
    ↓
Sohbet Ekranı Aç (UF-009)
```

---

## 👤 Profil ve Ayarlar Akışları

### UF-011: Profil Görüntüleme

```
Feed'de Kullanıcı Adına Tıkla
    VEYA
Profil Tab'ına Tıkla (Kendi Profili)
    ↓
Profil Ekranı Yükleniyor
    ├── GET /api/users/{user_id}
    └── GET /api/posts?user_id={user_id}
    ↓
Profil Bilgileri Göster
    ├── Profil Fotoğrafı
    ├── Ad Soyad
    ├── Meslek ve Rozetler
    │   ├── Meslek Doğrulanmış ✅
    │   └── Profil Doğrulanmış 💎
    ├── Bio
    ├── İstatistikler
    │   ├── Gönderi Sayısı
    │   ├── Beğeni Sayısı
    │   └── Kayıt Tarihi
    └── Gönderiler (Grid View)
    ↓
Etkileşim Butonları (Başkasının Profili ise)
    ├── "Mesaj Gönder" → Sohbet Ekranı
    ├── "Engelle" → Engelleme Modalı
    └── "Bildir" → Bildiri Modalı
    ↓
Kendi Profiliyse
    ├── "Profili Düzenle" → Düzenleme Ekranı
    └── "Ayarlar" (Dişli Icon) → Ayarlar Ekranı
```

---

### UF-012: Profil Düzenleme

```
Profil Ekranı
    ↓
"Profili Düzenle" Butonu
    ↓
Düzenleme Ekranı
    ↓
Değiştirilebilir Alanlar
    ├── Profil Fotoğrafı
    │   ├── Kamera ile Çek
    │   ├── Galeriden Seç
    │   └── Önizleme + Crop
    │   ↓
    ├── Ad
    ├── Soyad
    ├── Bio (Max 200 karakter)
    ├── Şehir (Dropdown)
    └── Doğum Tarihi (Date Picker)
    ↓
"Kaydet" Butonu
    ↓
Validasyon
    ├── Ad/Soyad boş mu? → Hata
    ├── Bio karakter sınırı → Hata
    └── [Geçti]
    ↓
PUT /api/users/{user_id}
    ├── Upload Profil Fotoğrafı (varsa)
    └── Update User Data
    ↓
[Başarılı]
    ├── "Profil güncellendi" Toast
    ├── Profil Ekranına Dön
    └── Güncel Bilgileri Göster
```

---

### UF-013: Bildirim Ayarları

```
Ayarlar Ekranı
    ↓
"Bildirimler" Seçeneği
    ↓
Bildirim Ayarları Ekranı
    ↓
Bildirim Türleri (Toggle Switches)
    ├── Yeni Mesajlar (Özel) [ON/OFF]
    ├── Grup Mesajları [ON/OFF]
    ├── Gönderi Beğenileri [ON/OFF]
    ├── Yorumlar [ON/OFF]
    ├── Cevaplar [ON/OFF]
    ├── Doğrulama Bildirimleri [ON/OFF]
    └── Sistem Bildirimleri [ON/OFF]
    ↓
Bildirim Zamanlaması
    ├── Sessiz Saatler [ON/OFF]
    │   ├── Başlangıç Saati (Time Picker)
    │   └── Bitiş Saati (Time Picker)
    │   ↓
    └── Ses ve Titreşim
        ├── Bildirim Sesi [ON/OFF]
        ├── Ses Seçimi (Dropdown)
        └── Titreşim [ON/OFF]
    ↓
Değişikliklerde Otomatik Kaydet
    └── PUT /api/users/{user_id}/settings
```

---

## ⚠️ Moderasyon Akışları

### UF-014: İçerik Bildirme

```
Gönderi/Yorum/Mesaj
    ↓
"..." Menü Butonu Tıkla
    ↓
"Bildir" Seçeneği
    ↓
Bildiri Modalı
    ↓
Bildiri Nedeni Seç (Radio Buttons)
    ├── Spam
    ├── Taciz veya Zorbalık
    ├── Sahte Profil/Bilgi
    ├── Uygunsuz İçerik
    ├── Telif Hakkı İhlali
    └── Diğer
    ↓
Açıklama Alanı (Opsiyonel, Max 500 karakter)
    ↓
"Gönder" Butonu
    ↓
POST /api/reports
    └── {target_type, target_id, reason, description}
    ↓
[Başarılı]
    ├── "Bildiriminiz alındı. Teşekkürler!" Toast
    ├── Modal Kapanır
    └── Backend → Admin Paneline İlet
```

**Admin Paneli Akışı:**

```
Admin Panel → Bildirimler Sekmesi
    ↓
Bekleyen Bildirimler Listesi
    ├── Bildiri ID
    ├── Bildiren Kullanıcı
    ├── İçerik Türü ve ID
    ├── Neden
    ├── Tarih
    └── Durum (Beklemede)
    ↓
Bildiriye Tıkla
    ↓
İçerik Detayı Göster
    ├── Bildirilen İçerik (Gönderi/Yorum/Mesaj)
    ├── Bildiri Nedeni ve Açıklama
    ├── İçerik Sahibi Bilgisi
    └── Geçmiş Bildirimler (varsa)
    ↓
Admin Aksiyonu
    ├── İçeriği Sil
    ├── Kullanıcıyı Uyar
    ├── Kullanıcıyı Banla
    ├── İçeriği Onaylı İşaretle (Bildiriyi Reddet)
    └── Not Ekle
    ↓
Aksiyon Uygula
    ├── Durum: "İncelendi" olarak güncelle
    ├── İlgili kullanıcıya bildirim gönder
    └── Gerekirse içerik/kullanıcı durumunu değiştir
```

---

### UF-015: Kullanıcı Engelleme

```
Kullanıcı Profili
    ↓
"..." Menü Butonu
    ↓
"Engelle" Seçeneği
    ↓
Onay Modalı
    ├── "Bu kullanıcıyı engellemek istediğinize emin misiniz?"
    ├── "Artık birbirinizin içeriklerini göremeyeceksiniz."
    └── Butonlar
        ├── İptal
        └── Engelle (Kırmızı)
    ↓
[Engelle Tıklandı]
    ↓
POST /api/user-blocks
    └── {blocker_id: my_id, blocked_id: target_id}
    ↓
[Başarılı]
    ├── "Kullanıcı engellendi" Toast
    ├── Profil Ekranından Çık
    └── Backend İşlemleri
        ├── Engellenen kullanıcının gönderileri feed'de gizlenir
        ├── Mesajlaşma engellenir
        ├── Etkileşim engellenir
        └── Bildirimler durdurulur
```

**Engeli Kaldırma:**

```
Ayarlar → Engellenen Kullanıcılar
    ↓
Engellenen Kullanıcı Listesi
    ↓
Kullanıcı Seç → "Engeli Kaldır"
    ↓
DELETE /api/user-blocks/{id}
    ↓
"Engel kaldırıldı" Toast
```

---

## 🔄 Genel Akış Kuralları

### Hata Yönetimi

Tüm akışlarda standart hata yönetimi:

```
[Hata Durumu]
    ↓
Hata Türü Belirle
    ├── Network Error → "İnternet bağlantınızı kontrol edin"
    ├── Timeout → "İstek zaman aşımına uğradı. Yeniden deneyin"
    ├── 400 Bad Request → İlgili alan hatası göster
    ├── 401 Unauthorized → Token yenile VEYA Çıkış yap
    ├── 403 Forbidden → "Bu işlem için yetkiniz yok"
    ├── 404 Not Found → "İçerik bulunamadı"
    ├── 500 Server Error → "Sunucu hatası. Lütfen daha sonra deneyin"
    └── Unknown → "Bir hata oluştu"
    ↓
Kullanıcıya Toast/Modal ile Bildir
    ├── Yeniden Dene Butonu (İsteğe Bağlı)
    └── Destek Linki (Kritik hatalarda)
```

### Loading States

```
İşlem Başladı
    ↓
Loading Göstergesi
    ├── Spinner (Küçük işlemler)
    ├── Skeleton Screen (Sayfa yükleme)
    ├── Progress Bar (Upload/Download)
    └── "İşleniyor..." Metni
    ↓
İşlem Tamamlandı
    ↓
Loading Gizle
    ↓
Sonuç Göster
```

### Offline Mode (Gelecek Versiyon)

```
İnternet Bağlantısı Yok
    ↓
Offline Banner Göster
    ↓
Cache'den Veri Göster
    ├── Son yüklenen feed
    ├── Mesaj geçmişi
    └── Profil bilgileri
    ↓
Kullanıcı İşlem Yapmaya Çalışırsa
    ↓
"Çevrimdışı moddasınız" Uyarısı
    ↓
İşlem Queue'ya Alınır (Opsiyonel)
    ↓
Bağlantı Geri Geldiğinde
    ↓
Queue'daki İşlemler Gönderilir
```

---

## 📝 Sonuç

Bu dokümanda Meslektaş uygulamasının tüm kullanıcı akışları detaylandırılmıştır. Her akış, kullanıcı yolculuğunu baştan sona takip eder ve alternatif senaryoları içerir. Geliştirme sürecinde bu akışlar referans alınarak UI/UX tasarımı ve backend API'leri şekillendirilmelidir.

**Toplam Kullanıcı Akışı:** 15  
**Kritik Akışlar:** 8 (Onboarding, Feed, Sohbet, Doğrulama)

---

**Hazırlayan:** UX Tasarım Ekibi & Proje Analisti  
**Onaylayan:** Product Owner  
**Dağıtım:** Design, Development, QA Teams
