# 🌐 Network Setup Guide - Meslektaş App

Bu rehber, mobil uygulama geliştirme sırasında backend bağlantı sorunlarını çözmek için hazırlanmıştır.

## 🎯 Özet

Artık **IP adresi değişikliklerinde manuel güncelleme yapmaya gerek yok!**

- ✅ Backend: Tüm origin'lere izin verir (development modunda)
- ✅ Mobil: Otomatik olarak doğru IP'yi kullanır
- ✅ Esnek konfigürasyon seçenekleri

---

## 📱 Mobil Uygulama Konfigürasyonu

### Otomatik Mod (Önerilen)

**Emulator/Simulator için:**

```bash
# Hiçbir şey yapmanıza gerek yok!
# localhost otomatik olarak çevrilir:
# - Android Emulator: 10.0.2.2
# - iOS Simulator: localhost
```

**Gerçek Cihaz için:**

1. Bilgisayarınızın IP adresini bulun:

   ```powershell
   # Windows
   ipconfig
   # IPv4 Address altında görünen IP'yi not edin (örn: 192.168.1.101)
   ```

2. İki seçenek:

   **A) Environment Variable (Önerilen):**

   ```bash
   # mobile/.env dosyası oluşturun
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.101:8080
   ```

   **B) app.json:**

   ```json
   {
     "expo": {
       "extra": {
         "API_BASE_URL": "http://192.168.1.101:8080"
       }
     }
   }
   ```

3. Uygulamayı yeniden başlatın

---

## 🔧 Backend Konfigürasyonu

### CORS Ayarları

Backend artık **wildcard pattern** kullanıyor - tüm origin'lere izin verir:

```yaml
# backend/src/main/resources/application.yml
app:
  cors:
    allowed-origins: "*" # Development için tüm origin'lere izin ver
```

**Production için:**

```yaml
app:
  cors:
    allowed-origins: "https://meslektas.com,https://app.meslektas.com"
```

### Güvenlik Notları

- Development modunda `*` güvenlidir
- Production'da mutlaka spesifik domain'ler kullanın
- `allow-credentials: true` ile wildcard kullanılamaz (Spring Security kuralı)

---

## 🚀 Hızlı Başlangıç

### 1. Backend'i Başlatın

```bash
cd backend
mvn spring-boot:run
```

### 2. Backend'in Çalıştığını Doğrulayın

```powershell
# Port dinlemede mi?
netstat -ano | findstr :8080

# Health check
curl http://localhost:8080/actuator/health
```

### 3. Mobil Uygulamayı Başlatın

**Emulator/Simulator için:**

```bash
cd mobile
npm start
# Sonra 'a' (Android) veya 'i' (iOS)
```

**Gerçek Cihaz için:**

```bash
# 1. IP'nizi ayarlayın (yukarıdaki adımlar)
# 2. Aynı WiFi ağına bağlı olduğunuzdan emin olun
# 3. QR kod ile bağlanın
npm start
```

---

## 🔍 Sorun Giderme

### Hala "Network Error" alıyorsanız:

#### 1. Backend Erişilebilir mi?

```powershell
# Localhost test
curl http://localhost:8080/actuator/health

# Network IP test (kendi IP'nizi yazın)
curl http://192.168.1.101:8080/actuator/health
```

#### 2. Firewall Kontrolü

```powershell
# Windows Firewall'da 8080 portuna izin verin
New-NetFirewallRule -DisplayName "Spring Boot Dev" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

#### 3. Aynı Ağda mısınız?

- Bilgisayar ve mobil cihaz **aynı WiFi ağında** olmalı
- VPN aktif değilse daha iyi
- Kurumsal ağlarda port kısıtlaması olabilir

#### 4. CORS Loglarını Kontrol Edin

Backend konsolunda CORS reddedilmesi varsa:

```
Access to XMLHttpRequest blocked by CORS policy
```

Çözüm: Backend'i yeniden başlatın (application.yml değişti)

#### 5. Mobil App Logları

```bash
# Metro bundler'da logları kontrol edin
# [API] Using base URL: ... mesajını görmelisiniz
```

---

## 📋 Konfigürasyon Öncelikleri

Mobil uygulama şu sırayla konfigürasyon arar:

1. `app.json` → `extra.API_BASE_URL`
2. Environment Variable → `EXPO_PUBLIC_API_BASE_URL`
3. Default → `http://localhost:8080` (platform'a göre çevrilir)

---

## 🎨 Platform Farklılıkları

| Platform             | Localhost Kullanımı    | Gerçek IP Gerekli mi? |
| -------------------- | ---------------------- | --------------------- |
| Android Emulator     | ✅ Otomatik (10.0.2.2) | ❌                    |
| iOS Simulator        | ✅ Otomatik            | ❌                    |
| Gerçek Android Cihaz | ❌                     | ✅                    |
| Gerçek iOS Cihaz     | ❌                     | ✅                    |

---

## 💡 Geliştirme İpuçları

### IP Değiştiğinde Ne Yapmalı?

**Hiçbir şey!** Sadece:

1. `.env` dosyasındaki IP'yi güncelleyin (eğer gerçek cihaz kullanıyorsanız)
2. Metro bundler'ı yeniden başlatın (`r` tuşuna basın)

### Farklı Makinelerde Çalışma

Backend CORS wildcard kullandığı için, farklı IP'lerden gelen istekleri otomatik kabul eder.

### Production Hazırlığı

Production'a geçmeden önce:

```yaml
# application-prod.yml
app:
  cors:
    allowed-origins: "https://meslektas.com"
```

---

## 🔗 İlgili Dosyalar

- `mobile/src/config/env.ts` - Environment konfigürasyonu
- `mobile/src/core/api/client.ts` - API client ve platform-specific IP handling
- `backend/src/main/resources/application.yml` - CORS ayarları
- `backend/src/main/java/com/meslektas/config/CorsConfig.java` - CORS implementasyonu

---

## ✅ Checklist

Backend ve mobil app arasında bağlantı sorunları varsa:

- [ ] Backend 8080 portunda çalışıyor mu? (`netstat -ano | findstr :8080`)
- [ ] Backend health endpoint erişilebilir mi? (`curl localhost:8080/actuator/health`)
- [ ] Gerçek cihaz kullanıyorsanız IP ayarlandı mı?
- [ ] Aynı WiFi ağındasınız mı?
- [ ] Firewall 8080 portunu engelliyor mu?
- [ ] Backend CORS wildcard kullanıyor mu? (`allowed-origins: *`)
- [ ] Metro bundler'da [API] log mesajlarını görüyor musunuz?

---

## 🆘 Hala Sorun mu Var?

Console loglarını kontrol edin:

**Backend:**

```
INFO: CORS filter initialized with allowed origins: [*]
```

**Mobile:**

```
LOG  [API] Android emulator detected, using 10.0.2.2 for localhost
# veya
LOG  [API] Using base URL: http://192.168.1.101:8080
```

**Network Error:**

```
ERROR [API] Unexpected error: {"message": "İnternet bağlantınızı kontrol edin..."}
```

Bu durumda backend'e network seviyesinde erişim yok demektir.
