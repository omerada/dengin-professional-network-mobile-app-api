# 📄 **MVP Proje Tanımı ve Teknik Analiz Dokümanı**

**Proje Adı (Geçici):** *Meslonca / Meslup / UstaAlan (isim sonradan kesinleşecek)*
**Proje Türü:** Meslek Doğrulamalı Kapalı Sosyal Ağ
**Platform:** Mobil uygulama (React Native / Expo)
**Durum:** MVP Planlama

---

## 🎯 **1. Proje Amacı (Kısa ve Net)**

Kullanıcıların kendi mesleklerine özel kapalı bir sosyal alan oluşturmasını sağlamak.
Her kullanıcı, mesleğini **belge + selfie + AI doğrulama** ile kanıtlar.
Sadece aynı mesleğe sahip kişiler birbirini görebilir, paylaşabilir ve sohbet edebilir.

---

## 🧩 **2. MVP’de Olacak Temel Özellikler**

### **Kullanıcı & Meslek Doğrulama**

* Kullanıcı kayıt & giriş (Firebase Auth önerilir)
* Meslek seçimi
* Belge yükleme (diploma/sertifika fotoğrafı)
* Selfie + belge tutma fotoğrafı
* AI ile otomatik belge-sahip eşleşmesi
* Manuel admin onayı
* Doğrulama tamamlanınca belgelerin sunucudan otomatik silinmesi (KVKK uyumlu)

### **Profil**

* Ad, soyad, meslek, kısa bio
* Mesleği doğrulanmış ibaresi (badge)

### **Meslek Akışı (Feed)**

* Aynı meslek grubundaki kullanıcıların paylaşımları
* Metin + görsel paylaşımı

### **Sohbet**

* Meslek topluluğuna özel genel sohbet odası
* 1’e 1 mesajlaşma (MVP’de minimal)

### **Bildirimler**

* Yeni mesaj
* Yeni yorum / beğeni (opsiyon)

---

## 🔐 **3. KVKK Uyum Modeli (MVP için)**

* Belge ve fotoğraf sadece doğrulama amacıyla işlenecek
* Doğrulama tamamlanınca **tamamen silinecek**
* Aydınlatma metni + açık rıza alınacak
* Saklama yok → KVKK yükümlülüğü minimum

---

## 🛠 **4. Teknik Mimari Önerisi (MVP)**

### **Frontend**

* React Native + Expo
* State yönetimi: Zustand veya Redux Toolkit
* Navigation: React Navigation
* Medya yükleme: Expo ImagePicker
* Kamera: Expo Camera

### **Backend**

* Node.js (NestJS) veya Spring Boot (isteğe göre)
* REST API
* AI doğrulama servisi entegrasyonu
* Meslek feed, sohbet API’leri
* Admin panel (web tabanlı basit)

### **Database**

* Firestore (Firebase) veya PostgreSQL + Prisma
* Önerilen yapı (hızlı MVP için): **Firebase Firestore**

### **Koleksiyonlar / Tablolar**

```
users
  id
  name
  email
  job
  verified (boolean)
  avatarUrl
  bio
  createdAt

posts
  id
  userId
  job
  text
  imageUrl
  createdAt

messages
  roomId
  senderId
  text
  createdAt

verification_requests
  userId
  job
  documentUrl
  selfieUrl
  status (pending/approved/rejected)
  createdAt
```

---

## 🤖 **5. AI Doğrulama Akışı**

1. Kullanıcı belge + selfie yükler
2. Backend görüntüleri AI’a gönderir
3. AI şu kontrolleri yapar:

   * Belgedeki isim → selfie yüz tanıma eşleşmesi
   * Belge formatı, sahtecilik izleri
   * Meslek doğruluğu (diploma veya sertifika tespiti)
4. Sonuç admin paneline düşer
5. Admin onayı → kullanıcı "mesleği doğrulanmış" olur
6. Belgeler otomatik olarak silinir

---

## ⚙️ **6. Admin Panel**

* Giriş
* Bekleyen doğrulamalar
* Kullanıcı detayları
* Onay / reddet
* Basit istatistikler (opsiyonel)

---

## 📱 **7. MVP Kullanıcı Akışı (Özet)**

1. Kullanıcı kayıt olur
2. Meslek seçer
3. Belge + selfie yükler
4. AI kontrolü → admin onayı
5. Onaylanınca ana sayfa açılır:

   * Meslektaş feed
   * Profil
   * Meslek sohbeti
6. Paylaşım + mesajlaşma yapılır

---

## 🚀 **8. MVP’nin Hedefi**

* 10 meslek grubuyla pilot yayın
* 500–2000 arası doğrulanmış kullanıcı
* Kapalı ve güvenli profesyonel topluluk deneyimi

---

## 📌 **9. Geliştirme Süresi (Gerçekçi Tahmin)**

* **Frontend mobil:** 3–5 hafta
* **Backend + AI entegrasyon:** 3–4 hafta
* **Admin panel:** 1 hafta
* **Test + yayın:** 1–2 hafta

**Toplam: 6–9 hafta (2 kişi full odaklı ekip).**

---

Hazır!
