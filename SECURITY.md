# Güvenlik Politikası

## Desteklenen Sürümler

| Sürüm | Destek Durumu   |
| ----- | --------------- |
| 1.0.x | ✅ Aktif destek |

## Güvenlik Açığı Bildirimi

Dengin projesinin güvenliğini ciddiye alıyoruz. Bir güvenlik açığı tespit ettiyseniz, lütfen sorumlu bir şekilde bildirin.

### Nasıl Bildirilir?

**Güvenlik açıklarını GitHub Issues üzerinden** **_açık olarak bildirmeyin._**

Bunun yerine:

1. **E-posta gönderin:** security@dengin.com adresine e-posta atın
2. Açığın detaylı açıklamasını ekleyin
3. Mümkünse tekrarlama adımlarını belirtin
4. Etkisini ve potansiyel zararı değerlendirin

### Ne Beklemelisiniz?

- **24 saat içinde:** Bildiriminizin alındığına dair onay
- **72 saat içinde:** İlk değerlendirme ve öncelik belirleme
- **7 gün içinde:** Düzeltme planı veya ek bilgi talebi

### Bildirim Kapsamı

Aşağıdaki güvenlik konularını bildirmenizi rica ederiz:

- Kimlik doğrulama ve yetkilendirme açıkları
- SQL injection, XSS, CSRF zafiyetleri
- Hassas veri sızıntısı
- API endpoint güvenlik açıkları
- Bağımlılık güvenlik açıkları (CVE)
- Ortam değişkeni veya gizli anahtar sızıntıları

## Güvenlik Uygulamaları

### Kimlik Doğrulama

- JWT tabanlı stateless authentication
- Access token (1 saat) + Refresh token (7 gün)
- Şifre hashing: bcrypt
- Rate limiting: Brute-force koruması

### Veri Güvenliği

- Hassas veriler ortam değişkenlerinde saklanır
- `.env` dosyaları versiyon kontrolüne dahil edilmez
- Firebase credentials JSON ile güvenli iletişim
- HTTPS zorunlu (üretim)

### Bağımlılık Güvenliği

- Düzenli bağımlılık güncelemeleri
- `npm audit` ve `mvn dependency-check` taramaları

### API Güvenliği

- CORS kısıtlamaları
- Input validasyonu (backend + frontend)
- Rate limiting (Bucket4j)
- Request/response logging (geliştirme)

## Geliştirici İçin Güvenlik Kontrol Listesi

Kod katkısı yaparken aşağıdaki kontrolleri uygulayın:

- [ ] Hassas bilgiler (API key, şifre, token) kaynak kodda yok
- [ ] `.env.example` dosyalarında gerçek credential yok
- [ ] SQL sorgularında parameterized query kullanılıyor
- [ ] Kullanıcı girdileri server-side doğrulanıyor
- [ ] Yeni endpoint'ler için uygun authentication/authorization var
- [ ] Dosya yükleme limitleri ve tip kontrolleri mevcut
- [ ] Log mesajlarında hassas veri yok

## Teşekkürler

Güvenlik açıklıklarını sorumlu bir şekilde bildiren araştırmacılara ve katkıcılara teşekkür ederiz.
