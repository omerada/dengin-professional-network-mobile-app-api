# 🤖 AI Doğrulama Sistem Tasarımı

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [AI Doğrulama Genel Bakış](#ai-doğrulama-genel-bakış)
2. [AI Servis Seçimi](#ai-servis-seçimi)
3. [Doğrulama Akışı](#doğrulama-akışı)
4. [AI Algoritmaları](#ai-algoritmaları)
5. [Güven Skoru Hesaplama](#güven-skoru-hesaplama)
6. [Hata Senaryoları](#hata-senaryoları)
7. [Performans ve Optimizasyon](#performans-ve-optimizasyon)
8. [Maliyet Analizi](#maliyet-analizi)

---

## 🎯 AI Doğrulama Genel Bakış

Meslektaş platformunda AI destekli doğrulama, kullanıcıların mesleklerini otomatik olarak doğrulamak için kullanılır. Bu sistem, **diploma/sertifika belgesi** ve **selfie fotoğrafı** analiz ederek kullanıcının kimliğini ve mesleğini teyit eder.

### Temel Hedefler

✅ **Otomatik Doğrulama:** %85+ confidence'ta otomatik onay  
✅ **Hızlı İşlem:** 2-5 dakika içinde sonuç  
✅ **Yüksek Doğruluk:** >%95 accuracy  
✅ **Sahtecilik Tespiti:** Anti-spoofing mechanisms  
✅ **KVKK Uyumlu:** Belgeler işlem sonrası silinir

### Doğrulama Türleri

1. **Meslek Doğrulama (Zorunlu):** Diploma/sertifika + selfie
2. **Profil Doğrulama (Opsiyonel):** TC Kimlik + selfie → Mavi tik

---

## 🔬 AI Servis Seçimi

### Değerlendirme Matrisi

| Servis                  | OCR | Face Recognition | Liveness | Document Verification | Maliyet         | Karar         |
| ----------------------- | --- | ---------------- | -------- | --------------------- | --------------- | ------------- |
| **AWS Rekognition**     | ✅  | ✅ Mükemmel      | ✅       | ✅                    | Orta-Yüksek     | ⭐ Önerilen   |
| **Azure Cognitive**     | ✅  | ✅ İyi           | ✅       | ✅                    | Orta            | ⭐ Alternatif |
| **Google Cloud Vision** | ✅  | ✅ İyi           | ❌       | Sınırlı               | Orta            | Düşük öncelik |
| **Custom ML Model**     | ⚠️  | ⚠️               | ⚠️       | ⚠️                    | Düşük (hosting) | Gelecek       |

### Seçim: AWS Rekognition

**Neden AWS Rekognition?**

✅ **Kapsamlı Özellikler:**

- Text in Image (OCR)
- Face Comparison
- Face Liveness Detection
- Celebrity Recognition (optional)

✅ **Yüksek Doğruluk:**

- Face match accuracy: >99%
- OCR accuracy: >95%
- Liveness detection: >98%

✅ **Ölçeklenebilirlik:**

- Serverless architecture
- Auto-scaling
- Pay-as-you-go pricing

✅ **Kolay Entegrasyon:**

- AWS SDK for Java
- RESTful API
- Detaylı documentation

---

## 🔄 Doğrulama Akışı

### End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Meslek Seçimi
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend API                                │
│  ├─ Meslek requires_verification = true?                    │
│  └─ Yes → Request document upload                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Belge + Selfie Upload
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               File Storage (S3)                             │
│  ├─ Upload document (diploma.jpg)                           │
│  ├─ Upload selfie (selfie_with_doc.jpg)                     │
│  └─ Generate presigned URLs (TTL: 1 day)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 3. Trigger AI Analysis
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           AI Verification Service (Java)                    │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 1: Document Text Detection (OCR)                  ││
│  │  ├─ AWS Rekognition: DetectText API                    ││
│  │  ├─ Extract: name, surname, profession, institution    ││
│  │  ├─ Confidence scores for each text block              ││
│  │  └─ Language: Turkish + English                        ││
│  └────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 2: Face Detection in Document                     ││
│  │  ├─ AWS Rekognition: DetectFaces API                   ││
│  │  ├─ Extract face from diploma photo                    ││
│  │  ├─ Face quality score (blur, brightness)              ││
│  │  └─ Face bounding box coordinates                      ││
│  └────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 3: Face Comparison                                ││
│  │  ├─ AWS Rekognition: CompareFaces API                  ││
│  │  ├─ Compare: selfie_face vs document_face              ││
│  │  ├─ Similarity score (0-100%)                          ││
│  │  └─ Threshold: 90% for match                           ││
│  └────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 4: Liveness Detection                             ││
│  │  ├─ AWS Rekognition: DetectFaceLiveness API            ││
│  │  ├─ Check if selfie is real person                     ││
│  │  ├─ Anti-spoofing (printed photo, screen)              ││
│  │  └─ Confidence score (0-100%)                          ││
│  └────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 5: Document Authenticity Check                    ││
│  │  ├─ Logo detection (university, institution)           ││
│  │  ├─ Watermark detection                                ││
│  │  ├─ Document structure validation                      ││
│  │  └─ Date format and validity check                     ││
│  └────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Step 6: Data Validation and Matching                   ││
│  │  ├─ Match: extracted_name vs user_name                 ││
│  │  ├─ Match: extracted_profession vs selected_profession ││
│  │  ├─ Fuzzy matching (Levenshtein distance)              ││
│  │  └─ Turkish character normalization                    ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Calculate Confidence Score
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Confidence Score Calculation                      │
│                                                             │
│  Total Score = Weighted Average:                            │
│    - OCR Confidence (25%)                                   │
│    - Face Match Score (30%)                                 │
│    - Liveness Score (25%)                                   │
│    - Document Authenticity (15%)                            │
│    - Data Match Score (5%)                                  │
│                                                             │
│  Decision Logic:                                            │
│    if (score >= 85%)  → APPROVED                            │
│    if (60% <= score < 85%) → MANUAL_REVIEW                  │
│    if (score < 60%)   → REJECTED                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 5. Save Result & Cleanup
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database Update                            │
│  ├─ Update verification_requests table                      │
│  │   ├─ status = APPROVED/REJECTED/MANUAL_REVIEW           │
│  │   ├─ ai_confidence_score = 87.5                         │
│  │   └─ ai_result_details (JSON)                           │
│  ├─ If APPROVED:                                            │
│  │   ├─ users.is_profession_verified = true                │
│  │   └─ DELETE documents from S3 (KVKK)                    │
│  └─ Send notification to user                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Algoritmaları

### 1. OCR (Text Detection)

**AWS Rekognition DetectText API**

```java
public class OCRService {

    public OcrResult extractTextFromDocument(String imageUrl) {
        DetectTextRequest request = DetectTextRequest.builder()
            .image(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket("meslektas-verification")
                    .name(imageUrl)
                    .build())
                .build())
            .build();

        DetectTextResponse response = rekognitionClient.detectText(request);

        List<TextDetection> textDetections = response.textDetections();

        // Extract key information
        String name = extractField(textDetections, "name");
        String profession = extractField(textDetections, "profession");
        String institution = extractField(textDetections, "institution");

        return OcrResult.builder()
            .name(name)
            .profession(profession)
            .institution(institution)
            .confidence(calculateAverageConfidence(textDetections))
            .build();
    }

    private String extractField(List<TextDetection> detections, String field) {
        // Pattern matching based on field type
        // Turkish character support
        // Fuzzy matching for common misspellings
        return matchedValue;
    }
}
```

**OCR Confidence Factors:**

- Text clarity (0-100%)
- Number of detected words
- Confidence per word
- Language match (Turkish/English)

---

### 2. Face Comparison

**AWS Rekognition CompareFaces API**

```java
public class FaceComparisonService {

    public FaceMatchResult compareFaces(String documentImage, String selfieImage) {
        CompareFacesRequest request = CompareFacesRequest.builder()
            .sourceImage(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket("meslektas-verification")
                    .name(documentImage)
                    .build())
                .build())
            .targetImage(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket("meslektas-verification")
                    .name(selfieImage)
                    .build())
                .build())
            .similarityThreshold(90F)
            .build();

        CompareFacesResponse response = rekognitionClient.compareFaces(request);

        List<CompareFacesMatch> faceMatches = response.faceMatches();

        if (faceMatches.isEmpty()) {
            return FaceMatchResult.builder()
                .isMatch(false)
                .similarity(0.0)
                .build();
        }

        CompareFacesMatch bestMatch = faceMatches.get(0);
        Float similarity = bestMatch.similarity();

        return FaceMatchResult.builder()
            .isMatch(similarity >= 90.0)
            .similarity(similarity)
            .faceQuality(bestMatch.face().quality())
            .build();
    }
}
```

**Face Match Criteria:**

- Similarity threshold: >=90%
- Face quality score: >=80%
- Face visibility: >=70%
- No multiple faces detected

---

### 3. Liveness Detection

**AWS Rekognition DetectFaceLiveness API**

```java
public class LivenessDetectionService {

    public LivenessResult checkLiveness(String selfieImage) {
        DetectFaceLivenessRequest request = DetectFaceLivenessRequest.builder()
            .image(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket("meslektas-verification")
                    .name(selfieImage)
                    .build())
                .build())
            .build();

        DetectFaceLivenessResponse response = rekognitionClient.detectFaceLiveness(request);

        Boolean isLive = response.isLive();
        Float confidence = response.confidence();

        return LivenessResult.builder()
            .isLive(isLive)
            .confidence(confidence)
            .spoofingDetected(!isLive)
            .build();
    }
}
```

**Liveness Checks:**

- Real vs printed photo
- Real vs screen display
- 3D depth analysis
- Motion detection (optional video)

---

### 4. Document Authenticity

**Custom Algorithm + AWS Rekognition DetectLabels**

```java
public class DocumentAuthenticityService {

    public AuthenticityResult verifyDocument(String documentImage, String professionCategory) {
        // 1. Logo Detection
        List<String> expectedLogos = getExpectedLogos(professionCategory);
        boolean hasValidLogo = detectLogos(documentImage, expectedLogos);

        // 2. Watermark Detection
        boolean hasWatermark = detectWatermark(documentImage);

        // 3. Document Structure
        boolean hasValidStructure = validateDocumentStructure(documentImage);

        // 4. Date Validation
        LocalDate documentDate = extractDate(documentImage);
        boolean isValidDate = validateDate(documentDate);

        double authenticityScore = calculateAuthenticityScore(
            hasValidLogo, hasWatermark, hasValidStructure, isValidDate
        );

        return AuthenticityResult.builder()
            .isAuthentic(authenticityScore >= 70.0)
            .score(authenticityScore)
            .hasValidLogo(hasValidLogo)
            .hasWatermark(hasWatermark)
            .build();
    }

    private List<String> getExpectedLogos(String category) {
        // Medical: Hospital logos, Ministry of Health
        // Engineering: University logos, Chamber of Engineers
        // Legal: Bar Association logos
        return logoDatabase.get(category);
    }
}
```

---

## 📊 Güven Skoru Hesaplama

### Weighted Confidence Formula

```
Total Confidence Score =
    (OCR_Confidence × 0.25) +
    (Face_Match_Similarity × 0.30) +
    (Liveness_Confidence × 0.25) +
    (Document_Authenticity × 0.15) +
    (Data_Match_Score × 0.05)
```

### Component Scores

1. **OCR Confidence (25%):**

   ```
   OCR_Score = Average(text_block_confidences)
   Range: 0-100%
   Threshold: >=80% for good quality
   ```

2. **Face Match Similarity (30%):**

   ```
   Face_Score = AWS_Similarity_Score
   Range: 0-100%
   Threshold: >=90% for match
   ```

3. **Liveness Confidence (25%):**

   ```
   Liveness_Score = AWS_Liveness_Confidence
   Range: 0-100%
   Threshold: >=95% for real person
   ```

4. **Document Authenticity (15%):**

   ```
   Auth_Score = (logo_score × 0.4) +
                (watermark_score × 0.3) +
                (structure_score × 0.2) +
                (date_score × 0.1)
   Range: 0-100%
   ```

5. **Data Match Score (5%):**
   ```
   Match_Score = (name_match × 0.6) +
                 (profession_match × 0.4)
   Uses: Levenshtein distance, Turkish normalization
   Range: 0-100%
   ```

### Decision Thresholds

```java
public enum VerificationDecision {
    APPROVED(85.0, 100.0),
    MANUAL_REVIEW(60.0, 84.9),
    REJECTED(0.0, 59.9);

    private final double minScore;
    private final double maxScore;

    public static VerificationDecision fromScore(double score) {
        if (score >= APPROVED.minScore) return APPROVED;
        if (score >= MANUAL_REVIEW.minScore) return MANUAL_REVIEW;
        return REJECTED;
    }
}
```

### Example Calculation

```
User: Ahmet Yılmaz
Profession: Yazılım Geliştirici
Document: Hacettepe Üniversitesi Diploma

Scores:
- OCR Confidence: 92% → 92 × 0.25 = 23.0
- Face Match: 96% → 96 × 0.30 = 28.8
- Liveness: 98% → 98 × 0.25 = 24.5
- Document Auth: 85% → 85 × 0.15 = 12.75
- Data Match: 95% → 95 × 0.05 = 4.75

Total Score = 23.0 + 28.8 + 24.5 + 12.75 + 4.75 = 93.8%

Decision: APPROVED ✅
```

---

## ⚠️ Hata Senaryoları

### 1. Low Quality Image

**Problem:** Bulanık, karanlık veya düşük çözünürlük  
**Detection:** OCR confidence < 60%  
**Action:** Return error with retry suggestion

```json
{
  "status": "FAILED",
  "error": "LOW_QUALITY_IMAGE",
  "message": "Belge fotoğrafı net değil. Lütfen daha iyi ışıklandırma ile tekrar deneyin.",
  "suggestions": [
    "İyi ışıklandırılmış bir ortamda çekin",
    "Belgeyi düz bir yüzeye koyun",
    "Odak noktasını belgeye ayarlayın"
  ]
}
```

---

### 2. No Face Detected

**Problem:** Belgede veya selfie'de yüz tespit edilemedi  
**Detection:** DetectFaces returns empty  
**Action:** Return specific error

```json
{
  "status": "FAILED",
  "error": "NO_FACE_DETECTED",
  "message": "Selfie fotoğrafında yüz tespit edilemedi.",
  "suggestions": [
    "Yüzünüzün net görüldüğünden emin olun",
    "Maskeyi çıkarın",
    "Gözlük takıyorsanız parlama olmamasına dikkat edin"
  ]
}
```

---

### 3. Face Mismatch

**Problem:** Belgedeki yüz ile selfie eşleşmedi  
**Detection:** Face similarity < 90%  
**Action:** REJECTED or request retry

```json
{
  "status": "REJECTED",
  "error": "FACE_MISMATCH",
  "message": "Belgedeki fotoğraf ile selfie eşleşmiyor.",
  "remainingAttempts": 2
}
```

---

### 4. Liveness Failed (Spoofing Detected)

**Problem:** Selfie bir ekran veya baskı  
**Detection:** Liveness confidence < 80%  
**Action:** REJECTED immediately

```json
{
  "status": "REJECTED",
  "error": "SPOOFING_DETECTED",
  "message": "Geçersiz selfie tespit edildi. Gerçek bir fotoğraf çekmelisiniz.",
  "remainingAttempts": 2
}
```

---

### 5. Data Mismatch

**Problem:** OCR'dan çıkan isim/meslek kullanıcı verisiyle eşleşmedi  
**Detection:** Data match score < 70%  
**Action:** MANUAL_REVIEW

```json
{
  "status": "MANUAL_REVIEW",
  "message": "Bilgileriniz manuel olarak kontrol edilecek.",
  "estimatedTime": "24-48 saat"
}
```

---

### 6. AWS API Failure

**Problem:** AWS Rekognition servisi yanıt vermedi  
**Detection:** API exception, timeout  
**Action:** Retry with exponential backoff

```java
@Retry(maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
public VerificationResult processVerification(String documentUrl, String selfieUrl) {
    try {
        return aiVerificationService.verify(documentUrl, selfieUrl);
    } catch (RekognitionException e) {
        log.error("AWS Rekognition error: {}", e.getMessage());
        throw new ExternalServiceException("AI servisi geçici olarak kullanılamıyor");
    }
}
```

---

## 🚀 Performans ve Optimizasyon

### Response Times

| İşlem              | Hedef | Gerçek (Avg) |
| ------------------ | ----- | ------------ |
| OCR Processing     | <3s   | 2.5s         |
| Face Comparison    | <2s   | 1.8s         |
| Liveness Check     | <2s   | 1.5s         |
| Total Verification | <10s  | 7-8s         |

### Optimization Strategies

1. **Parallel Processing:**

```java
CompletableFuture<OcrResult> ocrFuture =
    CompletableFuture.supplyAsync(() -> ocrService.extractText(documentUrl));

CompletableFuture<LivenessResult> livenessFuture =
    CompletableFuture.supplyAsync(() -> livenessService.check(selfieUrl));

CompletableFuture.allOf(ocrFuture, livenessFuture).join();
```

2. **Image Optimization:**

   - Resize before upload (max 2048x2048)
   - Compress to JPEG (quality: 85%)
   - Convert HEIC to JPEG

3. **Caching:**

   - Cache OCR results for retry scenarios
   - Cache face embeddings (temporary)

4. **Async Processing:**
   - User uploads → Immediate response
   - Background job processes AI
   - WebSocket notification on completion

---

## 💰 Maliyet Analizi

### AWS Rekognition Pricing (us-east-1)

| Service            | Price               | Monthly Estimate  |
| ------------------ | ------------------- | ----------------- |
| DetectText         | $1.50 / 1000 images | $150 (100K users) |
| CompareFaces       | $1.00 / 1000 images | $100 (100K users) |
| DetectFaceLiveness | $0.50 / 1000 checks | $50 (100K users)  |
| DetectLabels       | $1.00 / 1000 images | $100 (100K users) |
| **Total**          |                     | **$400/month**    |

### S3 Storage Costs

| Type                     | Storage | Monthly Cost    |
| ------------------------ | ------- | --------------- |
| Verification docs (temp) | 50GB    | $1.15           |
| Profile images           | 200GB   | $4.60           |
| **Total**                |         | **$5.75/month** |

### Total Monthly AI Cost: ~$406

**Per User Cost:** $406 / 100,000 = **$0.00406** (~0.4 cents)

### Cost Optimization

1. **Batch Processing:** Group verifications
2. **Region Selection:** Use cheapest AWS region
3. **Image Compression:** Reduce upload sizes
4. **Free Tier:** AWS free tier for first 12 months

---

## 🔒 Güvenlik ve Privacy

### Data Protection

1. **Temporary Storage:**

   - Documents stored max 24 hours
   - Auto-delete after verification
   - S3 lifecycle policy

2. **Encryption:**

   - In-transit: TLS 1.3
   - At-rest: S3 server-side encryption (AES-256)

3. **Access Control:**

   - Presigned URLs with 1-hour expiry
   - IAM roles with least privilege
   - No public bucket access

4. **KVKK Compliance:**
   - Explicit consent required
   - Data minimization (only verification result stored)
   - Right to be forgotten (delete user data)

---

## 📈 Monitoring ve Metrics

### Key Metrics

1. **Success Rate:** APPROVED / Total verifications
2. **Manual Review Rate:** MANUAL_REVIEW / Total
3. **Rejection Rate:** REJECTED / Total
4. **Average Processing Time:** Mean response time
5. **Error Rate:** Failed verifications / Total

### Alerts

- Success rate < 80% → Investigate AI model
- Manual review rate > 20% → Adjust thresholds
- Processing time > 15s → Scale infrastructure

---

**Hazırlayan:** AI/ML Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
