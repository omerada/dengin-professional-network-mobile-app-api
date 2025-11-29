# 📋 Proje Genel Bakış ve Vizyon

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Yönetici Özeti](#yönetici-özeti)
2. [Proje Vizyonu ve Misyonu](#proje-vizyonu-ve-misyonu)
3. [Problem Tanımı](#problem-tanımı)
4. [Çözüm Önerisi](#çözüm-önerisi)
5. [Hedef Kitle Analizi](#hedef-kitle-analizi)
6. [Pazar Analizi](#pazar-analizi)
7. [Rekabet Analizi](#rekabet-analizi)
8. [Başarı Kriterleri](#başarı-kriterleri)
9. [Proje Kısıtları](#proje-kısıtları)
10. [Riskler ve Risk Yönetimi](#riskler-ve-risk-yönetimi)

---

## 🎯 Yönetici Özeti

**Meslektaş**, meslek gruplarına özel, doğrulanmış ve kapalı bir sosyal ağ platformudur. Kullanıcılar, **AI destekli belge ve kimlik doğrulama** sistemi ile mesleklerini kanıtlayarak, sadece kendi meslektaşlarıyla etkileşime geçebilirler.

### Temel Özellikler

- 🔐 **AI Doğrulama:** Diploma/sertifika + selfie ile otomatik doğrulama
- 🏢 **Meslek Bazlı Ayrım:** Her meslek grubu kendi kapalı topluluğuna sahip
- 💬 **Sosyal Etkileşim:** Feed, gönderi, yorum, beğeni sistemi
- 💭 **Sohbet:** Meslek grubu sohbet odası + özel mesajlaşma
- 🛡️ **KVKK Uyumlu:** Veri güvenliği ve gizlilik öncelikli

### MVP Hedefi

- **Platform:** React Native mobil uygulama (iOS + Android)
- **Backend:** Spring Boot (Java)
- **Veritabanı:** PostgreSQL
- **İlk Lansman:** 5 pilot meslek grubu ile 500-2000 kullanıcı
- **Süre:** 6 ay (24 hafta)

---

## 🌟 Proje Vizyonu ve Misyonu

### Vizyon

> "Türkiye'nin en güvenilir ve doğrulanmış profesyonel sosyal ağı olmak. Her meslek grubuna özel, kaliteli ve güvenli bir topluluk deneyimi sunmak."

### Misyon

> "Profesyonellerin kendi meslektaşlarıyla güvenli bir ortamda bağlantı kurmasını, bilgi paylaşmasını ve networking yapmasını sağlamak. Sahte profilleri ve spam içeriği tamamen ortadan kaldırarak, kaliteli ve değerli etkileşimleri mümkün kılmak."

### Temel Değerler

1. **Güven:** Her kullanıcı doğrulanmıştır ve gerçektir
2. **Gizlilik:** KVKK uyumlu, kullanıcı verisi korunur
3. **Kalite:** Spam ve sahte içerik yoktur
4. **Topluluk:** Meslek bazlı güçlü bağlar
5. **Şeffaflık:** Açık iletişim ve dürüstlük

---

## 🔍 Problem Tanımı

### Mevcut Durum

**Genel Sosyal Medya Platformlarındaki Sorunlar:**

1. **Sahte Profiller ve Spam**

   - LinkedIn'de sahte iş ilanları ve dolandırıcılık
   - Facebook gruplarında doğrulamasız kullanıcılar
   - Instagram'da bot hesaplar ve spam mesajlar

2. **Düşük Kaliteli İçerik**

   - Profesyonel olmayan paylaşımlar
   - İlgisiz içerik akışı
   - Gereksiz bildirimler ve rahatsız edici mesajlar

3. **Gizlilik Endişeleri**

   - Kişisel verilerin korunmaması
   - 3. taraf veri satışı
   - Hedefli reklam bombardımanı

4. **Meslek Bazlı Topluluk Eksikliği**
   - Meslektaşlarla bağlantı kurmak zor
   - Mesleğe özel içerik bulmak zahmetli
   - Güvenilir profesyonelleri ayırt etmek imkansız

### Kullanıcı İhtiyaçları (Pain Points)

| Kullanıcı Tipi | İhtiyaç                          | Mevcut Çözüm        | Eksiklik               |
| -------------- | -------------------------------- | ------------------- | ---------------------- |
| **Doktor**     | Meslektaşlarla vaka tartışması   | WhatsApp grupları   | Doğrulamasız, dağınık  |
| **Avukat**     | Hukuki bilgi paylaşımı           | LinkedIn            | Spam, sahte profiller  |
| **Öğretmen**   | Eğitim materyali paylaşımı       | Facebook grupları   | Kalitesiz içerik       |
| **Mühendis**   | Teknik soru-cevap                | Reddit, Ekşi Sözlük | Anonimlik, güvensizlik |
| **Garson**     | İş fırsatları, deneyim paylaşımı | -                   | Platformsuz            |

---

## 💡 Çözüm Önerisi

### Meslektaş'ın Sunduğu Çözümler

#### 1. AI Destekli Doğrulama Sistemi

**Problem:** Sahte profiller ve doğrulanmamış kullanıcılar  
**Çözüm:**

- Diploma/sertifika + selfie yükleme
- AI ile otomatik belge ve yüz tanıma
- Doğrulama sonrası belgelerin silinmesi (KVKK)
- Doğrulanmış rozet sistemi

**Faydalar:**

- ✅ %100 doğrulanmış kullanıcı tabanı
- ✅ Sahte profil riski sıfır
- ✅ Güvenilir topluluk

#### 2. Meslek Bazlı Kapalı Topluluklar

**Problem:** İlgisiz içerik ve düşük kaliteli etkileşim  
**Çözüm:**

- Her meslek grubu kendi feed'ine sahip
- Sadece aynı meslek grubu paylaşımları görünür
- Meslek odası sohbet sistemi

**Faydalar:**

- ✅ %100 ilgili içerik
- ✅ Değerli bilgi paylaşımı
- ✅ Güçlü topluluk bağları

#### 3. KVKK Uyumlu Veri Güvenliği

**Problem:** Gizlilik endişeleri ve veri güvenliği  
**Çözüm:**

- Doğrulama sonrası belgelerin otomatik silinmesi
- Aydınlatma metni ve açık rıza
- Şifreli iletişim
- Veri minimizasyonu prensibi

**Faydalar:**

- ✅ Kullanıcı güveni
- ✅ Yasal uyumluluk
- ✅ Veri güvenliği

#### 4. Spam ve Düşük Kalite İçerik Kontrolü

**Problem:** Spam, reklam ve gereksiz bildirimler  
**Çözüm:**

- Doğrulanmış kullanıcılar → spam riski düşük
- İçerik moderasyonu ve bildiri sistemi
- Reklamsız deneyim (MVP'de)

**Faydalar:**

- ✅ Temiz ve kaliteli feed
- ✅ Değerli etkileşimler
- ✅ Kullanıcı memnuniyeti

---

## 👥 Hedef Kitle Analizi

### Primer Hedef Kitle (MVP)

#### 1. **Sağlık Sektörü Çalışanları**

- **Demografi:** 25-55 yaş, lisans+
- **Meslek:** Doktor, hemşire, eczacı, diyetisyen
- **İhtiyaç:** Vaka tartışması, bilgi paylaşımı, networking
- **Boyut:** ~1M+ (Türkiye'de)
- **Dijital Yeterlilik:** Yüksek
- **Ödeme Gücü:** Orta-yüksek

#### 2. **Teknoloji Sektörü**

- **Demografi:** 22-45 yaş, lisans+
- **Meslek:** Yazılım geliştirici, mühendis, IT uzmanı
- **İhtiyaç:** Teknik soru-cevap, iş fırsatları, networking
- **Boyut:** ~500K+ (Türkiye'de)
- **Dijital Yeterlilik:** Çok yüksek
- **Ödeme Gücü:** Yüksek

#### 3. **Eğitim Sektörü**

- **Demografi:** 25-60 yaş, lisans+
- **Meslek:** Öğretmen, akademisyen
- **İhtiyaç:** Materyal paylaşımı, deneyim aktarımı
- **Boyut:** ~1.2M+ (Türkiye'de)
- **Dijital Yeterlilik:** Orta-yüksek
- **Ödeme Gücü:** Orta

#### 4. **Hukuk Sektörü**

- **Demografi:** 25-65 yaş, lisans+
- **Meslek:** Avukat, hakim, savcı
- **İhtiyaç:** Hukuki tartışma, emsal paylaşımı, networking
- **Boyut:** ~150K+ (Türkiye'de)
- **Dijital Yeterlilik:** Orta-yüksek
- **Ödeme Gücü:** Yüksek

#### 5. **Hizmet Sektörü**

- **Demografi:** 18-50 yaş
- **Meslek:** Garson, barista, berber, kuaför, kurye
- **İhtiyaç:** İş fırsatları, deneyim paylaşımı, topluluk
- **Boyut:** ~2M+ (Türkiye'de)
- **Dijital Yeterlilik:** Orta
- **Ödeme Gücü:** Düşük-orta

### Sekonder Hedef Kitle (Gelecek Versiyonlar)

- Finans ve muhasebe profesyonelleri
- Mimarlık ve tasarım
- Pazarlama ve satış
- İnsan kaynakları
- Lojistik ve nakliyat

### Kullanıcı Personaları

#### Persona 1: Dr. Ayşe (35, Kadın Doğum Uzmanı)

- **Amaç:** Meslektaşlarıyla vaka tartışmak, güncel bilgi almak
- **Sorun:** WhatsApp gruplarında spam, LinkedIn'de sahte profiller
- **Beklenti:** Doğrulanmış doktorlarla güvenli ortam
- **Teknoloji:** iPhone kullanıcısı, günde 2-3 saat sosyal medya

#### Persona 2: Mehmet (28, Yazılım Geliştirici)

- **Amaç:** Teknik sorular sormak, iş fırsatları bulmak
- **Sorun:** Reddit ve Stack Overflow'da anonimlik, LinkedIn'de spam
- **Beklenti:** Doğrulanmış yazılımcılarla networking
- **Teknoloji:** Android kullanıcısı, teknoloji tutkunu

#### Persona 3: Zeynep (42, İlkokul Öğretmeni)

- **Amaç:** Eğitim materyali paylaşmak, deneyim aktarmak
- **Sorun:** Facebook gruplarında kalitesiz içerik
- **Beklenti:** Sadece öğretmenlerle etkileşim
- **Teknoloji:** Orta seviye dijital yeterlilik

#### Persona 4: Can (24, Barista)

- **Amaç:** İş fırsatları, deneyim paylaşımı
- **Sorun:** Sektöre özel platform yok
- **Beklenti:** Barista topluluğu, iş ilanları
- **Teknoloji:** Instagram ve TikTok kullanıcısı

---

## 📊 Pazar Analizi

### Pazar Büyüklüğü (Türkiye)

| Sektör     | Çalışan Sayısı | Potansiyel Kullanıcı | Pazar Payı Hedefi (1. Yıl) |
| ---------- | -------------- | -------------------- | -------------------------- |
| Sağlık     | ~1.2M          | 500K                 | 5-10% (25-50K)             |
| Teknoloji  | ~500K          | 300K                 | 10-15% (30-45K)            |
| Eğitim     | ~1.2M          | 400K                 | 3-5% (12-20K)              |
| Hukuk      | ~150K          | 100K                 | 5-10% (5-10K)              |
| Hizmet     | ~2M            | 500K                 | 1-3% (5-15K)               |
| **TOPLAM** | **~5M+**       | **~1.8M**            | **77-140K**                |

**İlk Yıl Gerçekçi Hedef:** 10-20K aktif kullanıcı

### Pazar Trendleri

1. **Profesyonel Networking Artışı**

   - COVID-19 sonrası dijital networking talebi arttı
   - Uzaktan çalışma ile online topluluklar önem kazandı

2. **Gizlilik ve Veri Güvenliği Bilinci**

   - Kullanıcılar veri güvenliğine daha fazla önem veriyor
   - KVKK farkındalığı artıyor

3. **Niche Sosyal Ağlar**

   - Genel platformlardan özel topluluklara geçiş
   - İlgi alanı bazlı ağlar popüler

4. **AI ve Otomasyon**
   - AI doğrulama sistemleri yaygınlaşıyor
   - Chatbot ve otomatik moderasyon

### Gelir Modeli (Gelecek Versiyonlar)

| Gelir Kaynağı      | Açıklama                     | Tahmini Gelir (Yıllık)       |
| ------------------ | ---------------------------- | ---------------------------- |
| **Freemium**       | Temel özellikler ücretsiz    | -                            |
| **Premium Üyelik** | Gelişmiş özellikler (₺49/ay) | ₺588K (1000 premium x 12 ay) |
| **İş İlanları**    | Şirketlerin ilan yayınlaması | ₺240K (20 ilan/ay x ₺1000)   |
| **Kurumsal Paket** | Kurumlar için toplu üyelik   | ₺600K (10 kurum x ₺5000/ay)  |
| **Eğitim İçerik**  | Online kurslar, sertifikalar | ₺180K                        |
| **TOPLAM**         | İlk yıl tahmini              | **₺1.6M+**                   |

_Not: MVP aşamasında tamamen ücretsiz, gelir modeli v2.0 ile başlar._

---

## 🏆 Rekabet Analizi

### Direkt Rakipler

#### 1. LinkedIn

**Güçlü Yönleri:**

- ✅ Dünya çapında 800M+ kullanıcı
- ✅ İş ilanları ve kariyer fırsatları
- ✅ Marka bilinirliği yüksek
- ✅ Güçlü networking özellikleri

**Zayıf Yönleri:**

- ❌ Sahte profiller ve spam çok
- ❌ Meslek bazlı ayrım yok
- ❌ Türkiye'de düşük kullanım
- ❌ Doğrulama sistemi zayıf

**Meslektaş'ın Avantajı:**

- ✅ %100 doğrulanmış kullanıcılar
- ✅ Meslek bazlı kapalı topluluklar
- ✅ Türkçe ve Türkiye odaklı

#### 2. Facebook Grupları

**Güçlü Yönleri:**

- ✅ Geniş kullanıcı tabanı
- ✅ Kolay grup oluşturma
- ✅ Çok sayıda meslek grubu var

**Zayıf Yönleri:**

- ❌ Doğrulama yok
- ❌ Spam ve düşük kalite içerik
- ❌ Gizlilik endişeleri
- ❌ Dağınık yapı

**Meslektaş'ın Avantajı:**

- ✅ Profesyonel ve temiz platform
- ✅ AI doğrulama
- ✅ KVKK uyumlu

#### 3. WhatsApp/Telegram Grupları

**Güçlü Yönleri:**

- ✅ Gerçek zamanlı iletişim
- ✅ Kullanımı kolay
- ✅ Yaygın kullanım

**Zayıf Yönleri:**

- ❌ Ölçeklenebilir değil (max 256 kişi WA)
- ❌ Doğrulama yok
- ❌ Arama ve arşivleme zor
- ❌ Profesyonel değil

**Meslektaş'ın Avantajı:**

- ✅ Sınırsız kullanıcı
- ✅ Feed sistemi
- ✅ Arama ve filtreleme

### Dolaylı Rakipler

- **Clubhouse:** Sesli sohbet (meslek bazlı değil)
- **Discord:** Gaming odaklı (profesyonel değil)
- **Reddit:** Anonim (doğrulama yok)
- **Slack Communities:** Daha çok şirket içi

### SWOT Analizi

#### Güçlü Yönler (Strengths)

- ✅ AI destekli doğrulama sistemi (benzersiz)
- ✅ Meslek bazlı kapalı topluluklar
- ✅ KVKK uyumlu veri güvenliği
- ✅ Türkiye pazarına odaklı
- ✅ Spam ve sahte profil riski sıfır

#### Zayıf Yönler (Weaknesses)

- ❌ Sıfır kullanıcı tabanı (başlangıç)
- ❌ Marka bilinirliği yok
- ❌ Sınırlı bütçe (MVP)
- ❌ Doğrulama süreci kullanıcı için zahmetli olabilir
- ❌ Gelir modeli net değil (MVP'de)

#### Fırsatlar (Opportunities)

- ✅ Türkiye'de niche profesyonel ağ eksikliği
- ✅ LinkedIn'in Türkiye'de düşük kullanımı
- ✅ KVKK ve gizlilik bilincinin artması
- ✅ COVID sonrası dijital networking talebi
- ✅ Devlet destekli dijital dönüşüm

#### Tehditler (Threats)

- ❌ LinkedIn'in Türkiye'ye yatırım yapması
- ❌ Kullanıcıların doğrulama sürecini zahmetli bulması
- ❌ Rakip platformların benzer özellik eklemesi
- ❌ Düşük kullanıcı adaptasyonu (network effect)
- ❌ Ekonomik kriz (kullanıcı harcamaları düşer)

---

## 📈 Başarı Kriterleri (KPI)

### MVP Başarı Metrikleri (İlk 3 Ay)

| Metrik                             | Hedef     | Ölçüm Yöntemi             |
| ---------------------------------- | --------- | ------------------------- |
| **Kayıtlı Kullanıcı**              | 1000+     | Backend DB                |
| **Doğrulanmış Kullanıcı**          | 500+      | Verification table        |
| **Günlük Aktif Kullanıcı (DAU)**   | 150+      | Analytics                 |
| **Haftalık Aktif Kullanıcı (WAU)** | 400+      | Analytics                 |
| **Aylık Aktif Kullanıcı (MAU)**    | 600+      | Analytics                 |
| **Günlük Gönderi**                 | 50+       | Posts table               |
| **Günlük Mesaj**                   | 200+      | Messages table            |
| **Doğrulama Başarı Oranı**         | >85%      | Verification success rate |
| **Uygulama Crash Oranı**           | <1%       | Crashlytics               |
| **Ortalama Session Süresi**        | >5 dakika | Analytics                 |
| **Kullanıcı Memnuniyeti (Rating)** | >4.0/5    | App Store reviews         |
| **Retention (7 gün)**              | >40%      | Analytics                 |
| **Retention (30 gün)**             | >20%      | Analytics                 |

### Uzun Vadeli Hedefler (1 Yıl)

| Metrik            | 6 Ay  | 12 Ay  |
| ----------------- | ----- | ------ |
| Toplam Kullanıcı  | 5,000 | 20,000 |
| DAU               | 1,000 | 5,000  |
| MAU               | 3,000 | 15,000 |
| Meslek Kategorisi | 10    | 25+    |
| App Store Rating  | 4.2+  | 4.5+   |
| Premium Kullanıcı | -     | 500+   |

---

## 🚧 Proje Kısıtları

### Zaman Kısıtları

- **MVP Süresi:** 6 ay (24 hafta)
- **İlk Lansman:** Ay sonları hedeflenir (app review süreci)
- **Sprint Döngüsü:** 2 haftalık sprintler

### Bütçe Kısıtları

- **Geliştirme:** Sınırlı ekip (2 developer + 1 designer)
- **Hosting:** Düşük maliyetli çözümler (DigitalOcean, AWS Free Tier)
- **AI Servisi:** Başlangıç için düşük maliyetli API (pay-as-you-go)
- **Pazarlama:** Organik büyüme, sosyal medya (düşük bütçe)

### Teknik Kısıtlar

- **Platform:** Sadece mobil (web yok - MVP'de)
- **AI Doğrulama:** 3. parti servis kullanımı (custom model yok)
- **Ölçeklenebilirlik:** MVP için basit mimari (gelecekte refactor)

### İnsan Kaynakları Kısıtları

- **Ekip Boyutu:** 5-6 kişi (bazıları part-time)
- **Uzmanlık:** Limited AI/ML expertise (3. parti servis kullanımı)
- **DevOps:** Part-time DevOps (manuel deployment)

### Yasal Kısıtlar

- **KVKK Uyumu:** Zorunlu
- **App Store/Play Store:** Politikalara uyum
- **Meslek Odaları:** Bazı mesleklerde onay gerekebilir (araştırılacak)

---

## ⚠️ Riskler ve Risk Yönetimi

### Yüksek Öncelikli Riskler

#### 1. Kullanıcı Adaptasyonu Riski

**Risk:** Kullanıcılar doğrulama sürecini zahmetli bulup vazgeçebilir  
**Olasılık:** Yüksek (60%)  
**Etki:** Kritik  
**Azaltma Stratejisi:**

- Doğrulama sürecini mümkün olduğunca basitleştirmek
- Kullanıcıya süreç boyunca rehberlik etmek
- İlk beta kullanıcılardan feedback almak
- Ödüllendirme sistemi (erken katılım rozeti)

#### 2. AI Doğrulama Hata Oranı

**Risk:** AI yanlış sonuçlar verebilir (sahte belgeler onaylanabilir veya gerçekler red edilebilir)  
**Olasılık:** Orta (40%)  
**Etki:** Yüksek  
**Azaltma Stratejisi:**

- Yüksek confidence threshold (>85%)
- Manuel admin review mekanizması (opsiyonel)
- Kullanıcı itiraz sistemi
- AI modelini sürekli iyileştirme

#### 3. Network Effect Başarısızlığı

**Risk:** Yeterli kullanıcı olmadan platform değersiz olur (empty feed)  
**Olasılık:** Orta (50%)  
**Etki:** Kritik  
**Azaltma Stratejisi:**

- Pilot meslek gruplarıyla başlama (focused launch)
- İlk 100-200 kullanıcıyı manuel davet etme
- Influencer ve topluluk liderlerini dahil etme
- İçerik teşvik programı (ödüllendirme)

#### 4. KVKK Uyumsuzluk

**Risk:** KVKK ihlali nedeniyle yasal sorunlar  
**Olasılık:** Düşük (20%)  
**Etki:** Kritik  
**Azaltma Stratejisi:**

- Hukuk danışmanlığı almak
- KVKK uzmanı ile çalışmak
- Aydınlatma metni ve açık rıza alımı
- Belge otomatik silme mekanizması
- Düzenli audit

### Orta Öncelikli Riskler

#### 5. Teknik Altyapı Sorunları

**Risk:** Sunucu çökmesi, veri kaybı, performans sorunları  
**Olasılık:** Orta (40%)  
**Etki:** Orta  
**Azaltma Stratejisi:**

- Yedekleme stratejisi (daily backups)
- Load balancing (gelecekte)
- Monitoring ve alerting
- Disaster recovery plan

#### 6. Güvenlik İhlalleri

**Risk:** Hacking, veri sızdırma, DDoS saldırıları  
**Olasılık:** Orta (30%)  
**Etki:** Yüksek  
**Azaltma Stratejisi:**

- Güvenlik audit
- Penetration testing
- Rate limiting ve firewall
- SSL/TLS şifreleme
- Regular security updates

### Düşük Öncelikli Riskler

#### 7. Rekabet

**Risk:** Büyük platformlar (LinkedIn) benzer özellikler ekleyebilir  
**Olasılık:** Düşük (20%)  
**Etki:** Orta  
**Azaltma Stratejisi:**

- Hızlı iterasyon ve yenilik
- Türkiye pazarına odaklanma
- Güçlü topluluk oluşturma
- Unique value proposition (AI doğrulama)

---

## 📝 Sonuç ve Sonraki Adımlar

### MVP İçin Öncelikler

1. ✅ Temel altyapı kurulumu (backend, frontend, DB)
2. ✅ AI doğrulama entegrasyonu
3. ✅ Kullanıcı yönetimi ve auth
4. ✅ Feed ve gönderi sistemi
5. ✅ Sohbet sistemi
6. ✅ KVKK uyum kontrolleri

### İlk Lansman Stratejisi

1. 🎯 Pilot meslek grupları seçimi (5 grup)
2. 👥 İlk 100-200 kullanıcıyı manuel davet
3. 🧪 Beta test ve feedback toplama
4. 🐛 Bug fixing ve optimizasyon
5. 🚀 Public launch (App Store + Play Store)

### Başarı İçin Kritik Faktörler

- ✅ Kusursuz doğrulama deneyimi
- ✅ Hızlı ve stabil uygulama
- ✅ Güvenilir ve güvenli platform
- ✅ Aktif ve ilgili topluluk
- ✅ Sürekli iyileştirme ve dinleme

---

**Hazırlayan:** Proje Yönetim Ekibi  
**Onaylayan:** [Proje Sponsoru]  
**Dağıtım:** Tüm proje paydaşları
