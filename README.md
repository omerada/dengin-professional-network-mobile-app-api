# 📄 **MVP Proje Tanımı ve Teknik Analiz Dokümanı**

**Proje Adı (Geçici) :** Meslektas
**Proje Türü:** Meslek Doğrulamalı Kapalı Sosyal Ağ
**Platform:** Mobil uygulama (React Native / Expo)
**Durum:** MVP Planlama

---

## 🎯 **1. Proje Amacı (Kısa ve Net)**

Kullanıcıların kendi mesleklerine özel kapalı bir sosyal alan oluşturmasını sağlamak.
Her kullanıcı, mesleğini **belge + selfie + AI doğrulama** ile kanıtlar.
Sadece aynı mesleğe sahip kişiler birbirini görebilir, paylaşabilir ve sohbet edebilir. Anasayfalarında meslektaşlarının postlarını görebilir.

Temel olarak uygulamada şuan her kullanıcının 4 ana ekranı olur.

1- AnaSayfa (Keşfet); Meslektaşların yaptığı paylaşımlar sayfası.
2- Tüm meslektaşların bulunduğu ortak chat (sohbet) sayfası.
3- Kullanıcının özel chat (sohbet) sayfası. Birebir sohbet ettiği kişilerin olduğu özel alan.
4- Kullanıcının kendi profil sayfası; gönderilerini ve profilini görüntülediği ayarladığı sayfa.

---

## 🧩 **2. MVP’de Olacak Temel Özellikler**

### **Kullanıcı & Meslek Doğrulama**

- Kullanıcı kayıt & giriş (Burada kullanılacak yapıya karar verilecek gelecekteki ölçeklenebilirlik, güvenlik ve bütçe açısından değerlendirilip en iyi çözüm hakkında; Temelde Google,Instagram ve Normal mail ile kayıt olma olacak.)
- Meslek seçimi; Olabildiğince çok kitleye sahip olan meslekler öncelikli olarak projeye eklenecek. Burada diploma + kimlik doğrulama şartı aranan önemli meslekler olacak. Bunun dışında belgesiz de yapılabilecek örneğin Garsonluk, Kuryelik, Berberlik gibi mesleklerde olacak bunlarda zorunlu belge ve kimlik doğrulama zorunlu olmayacak. Ancak kullanıcı daha sonra uygulamaya kayıt olduktan sonra dilerse doğrulanmış profil yani mavi tik almak isterse tc+selfie AI doğrulaması ile doğrulama yaparsa başarılı bir şekilde mavi tik alabilecek. Kullanıcı ilk kayıt sırasında meslek doğrulaması isteyen meslekleri seçerse tc+selfie ile AI Kimlik doğrulaması daha sonra AI ile yüklenen diplomanın doğruluğu değerlendirilecek daha sonra duruma göre kullanıcıya meslek doğrulaması onaylanırsa kendi mesleği kategorisinden devam edecek doğrulanmaz ise mesleği olmayanlar için ayrılan herkesi kapsayan kategoriyi seçebilip devam edebilecek. Kullanıcıdan sadece doğrulama istenen mesleklerde belge istenecek bu koşulu sağlamaz ise o mesleği seçemeyecek! Kullanıcı dilerse ilk kayıt olurken herhangi bir mesleği seçmeden devam edebilecek daha sonrasında meslek seçimi yapabilecek seçim yapmayan kullanıcılar ama bir mesleği seçip doğrulandıktan sonra herhangi bir şekilde meslek değişimi vs. yapamayacak!
- Belge yükleme (diploma/sertifika fotoğrafı) -> AI Doğrulaması
- Selfie + belge tutma fotoğrafı -> AI Doğrulaması
- AI ile otomatik belge-sahip eşleşmesi
- Manuel admin onayı. (Bunun ihtiyaç durumu üzerinde durulup değerlendirilecek gerçekten ihtiyaç var mı yok mu ??)
- Doğrulama tamamlanınca belgelerin sunucudan otomatik silinmesi (KVKK uyumlu) Kullanıcıların veri güvenliği konusunda endişelerini gidermek için doğrulama aşamasına geçerken uygun bir şekilde kullanıcıları verileri hakkında güzel bir açıklama ve yapı ile bilgilendirilme yapılacak.

### **Profil**

- Ad, soyad, meslek, kısa bio açıklaması
- Mesleği doğrulanmış ibaresi (badge), Doğrulanmış profil ibaresi.
- Gönderiler; Gönderilere diğer kullanıcılar eğer kullanıcı yorum yapmayı açtıysa yorum yapabilecek. Beğenebilecek gönderiyi veya dislike verebilecek.
- Profilden gidilen dişli icon ile Ayarlar bölümü profil, kullanıcı ayarları vs.

### **Meslek Akışı (Feed)**

- Aynı meslek grubundaki kullanıcıların paylaşımları
- Metin + görsel paylaşımı

### **Sohbet**

- Meslek topluluğuna özel genel sohbet odası
- 1’e 1 mesajlaşma (MVP’de minimal)

### **Bildirimler**

- Yeni mesaj
- Yeni yorum / beğeni (opsiyon)

---

## 🔐 **3. KVKK Uyum Modeli (MVP için)**

- Belge ve fotoğraf sadece doğrulama amacıyla işlenecek
- Doğrulama tamamlanınca **tamamen silinecek**
- Aydınlatma metni + açık rıza alınacak
- Saklama yok → KVKK yükümlülüğü minimum

---

## 🛠 **4. Teknik Mimari (MVP)**

### **Frontend**

- React Native + Expo
- State yönetimi: Zustand veya Redux Toolkit (İhtiyaçlar ve ölçeklenebilirlik durumuna göre karar verilecek?)
- Navigation: React Navigation
- Medya yükleme: Expo ImagePicker
- Kamera: Expo Camera

### **Backend**

- Spring Boot
- REST API
- AI doğrulama servisi entegrasyonu
- Meslek feed, sohbet API’leri
- Admin panel

### **Database**

- Postgresql düşünülüyor! Ancak burada uygulamanın genel ihtiyaçları gelecek, ölçeklenebilirlik durumuna göre düşünülüp artısı eksisi yapılıp ona göre DB seçiminde Fiyat performansda göz önünde bulundurularak karar verilecek.

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

   - Belgedeki isim → selfie yüz tanıma eşleşmesi
   - Belge formatı, sahtecilik izleri
   - Meslek doğruluğu (diploma veya sertifika tespiti)

4. Sonuç admin paneline düşer. Bu aşama muamma şuan için AI hatasız ve doğru bir şekilde Admin onayına ihtiyaç duymadan bunu yapamaz mı? Yapabilirse admin onayına gerek yok bence durumlara göre değerlendirelim.
5. Belgeler otomatik olarak silinir

---

## ⚙️ **6. Admin Panel - Web App mi? Mobil App İçine mi Entegre?**

- Giriş
- Bekleyen doğrulamalar (Admin doğrulaması olursa?)
- Kullanıcı detayları
- Onay / reddet
- Basit istatistikler (opsiyonel)

---

## 📱 **7. MVP Kullanıcı Akışı (Özet)**

1. Kullanıcı kayıt olur
2. Meslek seçer
3. Doğrulama gereken meslek ise => Belge + selfie yükler.
4. AI kontrolü Onay → Duruma göre admin onayı
5. Onaylanınca ana sayfa açılır:

   - Meslektaş feed
   - Profil
   - Meslek sohbeti

6. Paylaşım + mesajlaşma yapılır.

---

## 🚀 **8. MVP’nin Hedefi**

- Genel meslek grubuyla pilot yayın
- 500–2000 arası doğrulanmış kullanıcı
- Kapalı ve güvenli profesyonel topluluk deneyimi

---

## 📌 **9. Geliştirme Süresi (Gerçekçi Tahmin)**

- **Frontend mobil:** 3–5 hafta
- **Backend + AI entegrasyon:** 3–4 hafta
- **Admin panel:** 1 hafta
- **Test + yayın:** 1–2 hafta

**Toplam: 6–9 hafta (2 kişi full odaklı ekip).**

---

Hazır!
