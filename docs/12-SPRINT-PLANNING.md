# 📅 Sprint Planlaması ve Proje Takvimi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Sprint Yapısı ve Metodoloji](#sprint-yapısı-ve-metodoloji)
2. [Sprint Detayları](#sprint-detayları)
3. [Milestone ve Deliverables](#milestone-ve-deliverables)
4. [Kaynak Planlaması](#kaynak-planlaması)
5. [Risk Yönetimi](#risk-yönetimi)
6. [Kalite Kriterleri](#kalite-kriterleri)

---

## 🏃 Sprint Yapısı ve Metodoloji

### Agile Scrum Yaklaşımı

**Sprint Süresi:** 2 hafta  
**Toplam Sprint Sayısı:** 12 sprint  
**Toplam Süre:** 24 hafta (~6 ay)  
**Ekip Büyüklüğü:** 5-6 kişi

### Sprint Döngüsü

```
Sprint Planning (İlk Gün)
    ↓
Daily Standup (Her gün, 15 dakika)
    ↓
Development & Testing (2 hafta)
    ↓
Sprint Review (Son gün öğleden önce)
    ↓
Sprint Retrospective (Son gün öğleden sonra)
    ↓
[Yeni Sprint Başlar]
```

### Toplantılar

| Toplantı           | Süre     | Sıklık      | Katılımcılar            |
| ------------------ | -------- | ----------- | ----------------------- |
| Sprint Planning    | 4 saat   | Sprint başı | Tüm ekip + PO           |
| Daily Standup      | 15 dk    | Her gün     | Development ekibi       |
| Sprint Review      | 2 saat   | Sprint sonu | Tüm ekip + Stakeholders |
| Sprint Retro       | 1.5 saat | Sprint sonu | Tüm ekip                |
| Backlog Refinement | 2 saat   | Haftalık    | PO + Dev Lead           |

---

## 📋 Sprint Detayları

### **Sprint 1-2: Temel Altyapı ve Setup** (Hafta 1-4)

**Hedef:** Proje altyapısını kurmak ve temel backend/frontend yapısını oluşturmak

#### Sprint 1 (Hafta 1-2)

**Story Points:** 40

**Backend:**

- [x] Spring Boot proje setup
- [x] PostgreSQL kurulum ve connection
- [x] User entity ve repository
- [x] JWT authentication implementasyonu
- [x] Basic REST API yapısı
- [x] Error handling ve logging

**Frontend:**

- [x] React Native + Expo setup
- [x] Navigation yapısı (React Navigation)
- [x] State management setup (Zustand)
- [x] API client (Axios) kurulumu
- [x] Temel screen layout'ları

**DevOps:**

- [x] Git repository setup
- [x] CI/CD pipeline (GitHub Actions)
- [x] Development environment setup

**Deliverable:**

- Çalışan backend sunucu
- Boilerplate mobil uygulama
- Çalışan CI/CD

---

#### Sprint 2 (Hafta 3-4)

**Story Points:** 42

**Backend:**

- [x] Profession entity ve API'ler
- [x] Email service entegrasyonu
- [x] File upload servisi
- [x] S3/Cloudinary entegrasyonu
- [x] Database migration scripts

**Frontend:**

- [x] Splash screen
- [x] Onboarding slider
- [x] Login/Register ekranları
- [x] OAuth entegrasyonu (Google, Instagram)
- [x] Form validasyonları

**Deliverable:**

- Kayıt ve giriş sistemi
- OAuth çalışıyor
- Dosya yükleme hazır

---

### **Sprint 3-4: Meslek Seçimi ve Doğrulama** (Hafta 5-8)

**Hedef:** Meslek doğrulama sistemini tamamlamak

#### Sprint 3 (Hafta 5-6)

**Story Points:** 45

**Backend:**

- [x] Verification request entity ve API
- [x] AI servisi entegrasyon hazırlığı
- [x] Document validation servisi
- [x] Face recognition API entegrasyonu

**Frontend:**

- [x] Meslek seçimi ekranı
- [x] Belge yükleme ekranı
- [x] Selfie çekme ekranı
- [x] Doğrulama progress ekranı
- [x] Kamera ve galeri izinleri

**Deliverable:**

- Meslek seçimi tamamlandı
- Belge yükleme çalışıyor

---

#### Sprint 4 (Hafta 7-8)

**Story Points:** 48

**Backend:**

- [x] AI doğrulama algoritması
- [x] Confidence score hesaplama
- [x] Auto-approval logic
- [x] Belge otomatik silme (KVKK)
- [x] Doğrulama notification servisi

**Frontend:**

- [x] Doğrulama sonuç ekranları (başarılı/başarısız)
- [x] Mavi tik doğrulama akışı
- [x] Bildirim sistemi entegrasyonu (FCM/APNS)

**Deliverable:**

- End-to-end doğrulama sistemi çalışıyor
- KVKK uyumlu belge silme aktif

---

### **Sprint 5-6: Feed ve Gönderi Sistemi** (Hafta 9-12)

**Hedef:** Ana sayfa feed ve gönderi özelliklerini tamamlamak

#### Sprint 5 (Hafta 9-10)

**Story Points:** 43

**Backend:**

- [x] Post entity ve CRUD API'ler
- [x] Feed endpoint (profession-based filtering)
- [x] Image upload ve optimization
- [x] Pagination implementasyonu

**Frontend:**

- [x] Ana sayfa feed ekranı
- [x] Gönderi kartı component
- [x] Infinite scroll
- [x] Pull-to-refresh
- [x] Image viewer/gallery

**Deliverable:**

- Feed görüntüleme çalışıyor
- Gönderi oluşturma aktif

---

#### Sprint 6 (Hafta 11-12)

**Story Points:** 40

**Backend:**

- [x] Comment entity ve API'ler
- [x] Like/Dislike sistemi
- [x] Notification servisi (beğeni, yorum)
- [x] Gönderi edit/delete API'ler

**Frontend:**

- [x] Gönderi detay ekranı
- [x] Yorum sistemi (ana ve alt yorumlar)
- [x] Beğeni/dislike butonları
- [x] Gönderi düzenleme/silme
- [x] Bildirimler ekranı

**Deliverable:**

- Tam fonksiyonel feed sistemi
- Etkileşim özellikleri tamamlandı

---

### **Sprint 7-8: Sohbet Sistemi** (Hafta 13-16)

**Hedef:** Gerçek zamanlı mesajlaşma sistemini kurmak

#### Sprint 7 (Hafta 13-14)

**Story Points:** 50

**Backend:**

- [x] WebSocket sunucu setup (STOMP)
- [x] Chat room entity ve API'ler
- [x] Message entity ve storage
- [x] Online user tracking
- [x] Typing indicator

**Frontend:**

- [x] Mesajlar ana ekranı (inbox)
- [x] Grup sohbet ekranı
- [x] WebSocket client entegrasyonu
- [x] Gerçek zamanlı mesaj alma/gönderme
- [x] Yazıyor göstergesi

**Deliverable:**

- Grup sohbet çalışıyor
- Gerçek zamanlı iletişim aktif

---

#### Sprint 8 (Hafta 15-16)

**Story Points:** 45

**Backend:**

- [x] Private chat API'ler
- [x] Read receipt (okundu) sistemi
- [x] Message search ve filtering
- [x] Message delete API

**Frontend:**

- [x] Özel mesaj ekranı
- [x] Sohbet listesi
- [x] Okundu göstergeleri (✓✓)
- [x] Mesaj silme özelliği
- [x] Push notification

**Deliverable:**

- Özel mesajlaşma tamamlandı
- Bildirimler çalışıyor

---

### **Sprint 9: Admin Panel** (Hafta 17-18)

**Hedef:** Admin panel web uygulamasını geliştirmek

**Story Points:** 38

**Backend:**

- [x] Admin authentication
- [x] Admin dashboard API'ler
- [x] Report management API
- [x] User management API
- [x] Verification review API (opsiyonel)

**Frontend (Web - React):**

- [x] Admin login
- [x] Dashboard (istatistikler)
- [x] Kullanıcı yönetimi
- [x] İçerik moderasyonu
- [x] Bildiri yönetimi
- [x] Doğrulama inceleme (opsiyonel)

**Deliverable:**

- Çalışan admin panel
- Moderasyon araçları

---

### **Sprint 10-11: Test, Bug Fix, Optimizasyon** (Hafta 19-22)

**Hedef:** Kapsamlı testler ve performans optimizasyonu

#### Sprint 10 (Hafta 19-20)

**Story Points:** 35

**Testing:**

- [x] Unit testler (backend)
- [x] Integration testler
- [x] E2E testler (Detox - mobil)
- [x] API testleri (Postman/Newman)
- [x] Load testing (JMeter)

**Optimization:**

- [x] Database indexing
- [x] Query optimization
- [x] Image CDN kurulumu
- [x] Caching (Redis - opsiyonel)
- [x] Frontend performance

**Deliverable:**

- Test coverage >80%
- Performance benchmarks

---

#### Sprint 11 (Hafta 21-22)

**Story Points:** 30

**Bug Fixing:**

- [x] Kritik bug'lar düzeltildi
- [x] UI/UX iyileştirmeleri
- [x] Accessibility kontrolleri
- [x] Security audit

**Polishing:**

- [x] Loading states
- [x] Error handling iyileştirme
- [x] Animasyonlar ve transitions
- [x] Offline mode hazırlıkları (cache)

**Deliverable:**

- Stabil ve optimize edilmiş uygulama
- Güvenlik açıkları kapatıldı

---

### **Sprint 12: Deployment ve Lansman** (Hafta 23-24)

**Hedef:** Production deployment ve uygulama yayını

**Story Points:** 25

**DevOps:**

- [x] Production sunucu kurulumu
- [x] Database migration (prod)
- [x] SSL/TLS sertifika kurulumu
- [x] Monitoring kurulumu (Sentry, Analytics)
- [x] Backup sistemleri

**App Store:**

- [x] App Store metadata (screenshots, description)
- [x] Play Store metadata
- [x] App Store submission (iOS)
- [x] Play Store submission (Android)
- [x] Beta testing (TestFlight, Play Console)

**Documentation:**

- [x] API dokümantasyonu tamamlandı
- [x] User manual
- [x] Release notes

**Deliverable:**

- App Store ve Play Store'da yayında
- Production ortamı canlı
- İlk kullanıcılar davet edildi

---

## 🎯 Milestone ve Deliverables

### Milestone 1: MVP Temel Altyapı (Hafta 4)

✅ Backend ve frontend altyapısı hazır  
✅ Kayıt ve giriş çalışıyor  
✅ Dosya yükleme servisi aktif

### Milestone 2: Doğrulama Sistemi (Hafta 8)

✅ AI doğrulama end-to-end çalışıyor  
✅ KVKK uyumlu belge silme aktif  
✅ Bildirim sistemi çalışıyor

### Milestone 3: Core Features (Hafta 12)

✅ Feed ve gönderi sistemi tamamlandı  
✅ Etkileşim özellikleri (like, yorum) çalışıyor  
✅ Profil yönetimi aktif

### Milestone 4: Sosyal Özellikler (Hafta 16)

✅ Grup ve özel sohbet çalışıyor  
✅ Gerçek zamanlı mesajlaşma aktif  
✅ Push notification çalışıyor

### Milestone 5: MVP Tamamlandı (Hafta 22)

✅ Tüm core features çalışıyor  
✅ Test coverage yeterli  
✅ Performance hedefleri tutturuldu  
✅ Güvenlik audit geçildi

### Milestone 6: Production Launch (Hafta 24)

✅ App Store ve Play Store'da yayında  
✅ Production ortamı stabil  
✅ İlk 100-200 kullanıcı aktif

---

## 👥 Kaynak Planlaması

### Ekip Yapısı

| Rol                  | Kişi             | Sprint 1-4  | Sprint 5-8     | Sprint 9-11 | Sprint 12    |
| -------------------- | ---------------- | ----------- | -------------- | ----------- | ------------ |
| **Full-Stack Dev 1** | Dev A            | Backend     | Backend + Web  | Testing     | Deployment   |
| **Full-Stack Dev 2** | Dev B            | Frontend    | Frontend       | Bug Fix     | Deployment   |
| **UI/UX Designer**   | Designer         | Wireframes  | Refinement     | Polish      | Marketing    |
| **AI/ML Engineer**   | ML Engineer (PT) | -           | AI Integration | -           | -            |
| **QA Engineer**      | QA               | Setup       | Testing        | Full QA     | UAT          |
| **Project Manager**  | PM               | Planning    | Coordination   | Review      | Launch Coord |
| **DevOps**           | DevOps (PT)      | Infra Setup | Monitoring     | Security    | Production   |

**PT:** Part-time

### Çalışma Yükü Tahmini

| Sprint     | Story Points | Toplam Adam/Saat | Velocity   |
| ---------- | ------------ | ---------------- | ---------- |
| Sprint 1   | 40           | 320              | 40         |
| Sprint 2   | 42           | 336              | 41         |
| Sprint 3   | 45           | 360              | 43         |
| Sprint 4   | 48           | 384              | 46         |
| Sprint 5   | 43           | 344              | 43         |
| Sprint 6   | 40           | 320              | 40         |
| Sprint 7   | 50           | 400              | 50         |
| Sprint 8   | 45           | 360              | 45         |
| Sprint 9   | 38           | 304              | 38         |
| Sprint 10  | 35           | 280              | 35         |
| Sprint 11  | 30           | 240              | 30         |
| Sprint 12  | 25           | 200              | 25         |
| **TOPLAM** | **481**      | **3,848**        | **40 avg** |

---

## ⚠️ Risk Yönetimi

### Yüksek Riskler

| Risk                        | Olasılık | Etki   | Azaltma Stratejisi                | Sorumlu     |
| --------------------------- | -------- | ------ | --------------------------------- | ----------- |
| AI doğrulama yetersiz       | Orta     | Yüksek | Erken test, alternatif AI servisi | ML Engineer |
| Kullanıcı adaptasyonu düşük | Yüksek   | Kritik | Beta test, feedback loop          | PM          |
| Performance sorunları       | Orta     | Orta   | Load testing, optimization        | DevOps      |
| Security breach             | Düşük    | Kritik | Security audit, penetration test  | Dev Lead    |
| KVKK uyumsuzluk             | Düşük    | Yüksek | Legal review, audit               | PM + Legal  |
| Ekip üyesi kaybı            | Düşük    | Yüksek | Knowledge sharing, documentation  | PM          |
| Budget aşımı                | Orta     | Orta   | Weekly budget review              | PM          |

### Bağımlılıklar

- AI servisi (AWS Rekognition) erişimi → Sprint 4'ten önce
- App Store Developer Account → Sprint 11'den önce
- Production sunucu → Sprint 12'den önce
- SSL sertifikası → Sprint 12'den önce

---

## ✅ Kalite Kriterleri

### Definition of Done (DoD)

Her user story tamamlanmış sayılması için:

- [ ] Kod yazıldı ve code review yapıldı
- [ ] Unit testler yazıldı (coverage >70%)
- [ ] Integration testler geçti
- [ ] UI/UX tasarıma uygun
- [ ] Performans testleri geçti
- [ ] Security kontrolleri yapıldı
- [ ] Dokümantasyon güncellendi
- [ ] Product Owner onayladı
- [ ] Staging'de test edildi
- [ ] Kritik bug yok

### Sprint Kabul Kriterleri

Her sprint tamamlanmış sayılması için:

- [ ] Planlanan story'lerin %80'i tamamlandı
- [ ] Sprint goal'ları karşılandı
- [ ] Test coverage hedefi tutturuldu
- [ ] Kritik bug yok
- [ ] Sprint demo başarılı
- [ ] Stakeholder feedback alındı

### MVP Kabul Kriterleri

MVP tamamlanmış sayılması için:

#### Fonksiyonel

- [ ] Kullanıcı kayıt/giriş çalışıyor (3 yöntem)
- [ ] Meslek doğrulama %85+ başarı oranı
- [ ] Feed ve gönderi sistemi çalışıyor
- [ ] Sohbet sistemi çalışıyor
- [ ] Bildirimler çalışıyor
- [ ] Profil yönetimi çalışıyor

#### Teknik

- [ ] Uygulama crash oranı < 1%
- [ ] API response time < 500ms
- [ ] Uptime > 95%
- [ ] Test coverage > 80%
- [ ] Security audit geçildi

#### İş

- [ ] 500+ doğrulanmış kullanıcı
- [ ] 5 pilot meslek grubu aktif
- [ ] App Store rating > 4.0
- [ ] DAU > 150
- [ ] Retention (7 gün) > 40%

---

## 📊 İlerleme Takibi

### Haftalık Raporlama

Her hafta Cuma günü:

- Sprint progress raporu
- Burndown chart
- Blocker'lar ve aksiyonlar
- Velocity güncelleme
- Risk değerlendirmesi

### Kullanılan Araçlar

- **Project Management:** Jira / Trello
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Jest, Detox, JUnit
- **Monitoring:** Sentry, Firebase Analytics
- **Communication:** Slack
- **Documentation:** Confluence / Notion

---

## 📝 Sonuç

Bu sprint planı, Meslektaş MVP projesinin 24 haftalık (6 aylık) geliştirme sürecini detaylandırmaktadır. Plan esnek olup, ekip velocity'si ve stakeholder feedback'ine göre güncellenecektir.

**Toplam Sprint:** 12  
**Toplam Story Point:** 481  
**Ortalama Velocity:** 40 SP/sprint  
**Hedef Lansman:** 24. hafta sonu

---

**Hazırlayan:** Project Manager & Scrum Master  
**Onaylayan:** Product Owner & Stakeholders  
**Dağıtım:** Tüm Proje Ekibi

**Not:** Bu plan her sprint retrospective'inde gözden geçirilip güncellenecektir.
