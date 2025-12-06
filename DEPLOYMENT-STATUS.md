# AWS S3 + CloudFront Profile Images - Production Entegrasyon Tamamlandı ✅

## Entegre Edilen Bilgiler

### S3 Bucket
- **Bucket Name**: `meslektas-prod`
- **Region**: `eu-central-1`
- **Folder**: `users/{userId}/avatar-{uuid}.jpg`

### CloudFront Distribution
- **Domain**: `daw1sj0p0yrom.cloudfront.net`
- **Distribution ID**: `E8MH2YKVE51HB`
- **ARN**: `arn:aws:cloudfront::180826369601:distribution/E8MH2YKVE51HB`

## Backend Konfigürasyonu

### application.yml - Production Profile ✅
```yaml
aws:
  s3:
    bucket: ${AWS_S3_BUCKET:meslektas-prod}
    profile-images:
      folder: users
    presigned-url:
      expiration: 300 # 5 minutes
  cloudfront:
    domain: ${AWS_CLOUDFRONT_DOMAIN:daw1sj0p0yrom.cloudfront.net}
```

Default değerler eklendi, bu sayede environment variable olmasa bile çalışır.

### Environment Variables (Opsiyonel)
Eğer farklı ortamlarda farklı değerler kullanmak istersen:

```bash
export AWS_S3_BUCKET=meslektas-prod
export AWS_CLOUDFRONT_DOMAIN=daw1sj0p0yrom.cloudfront.net
```

## Test Adımları

### 1. Backend'i Başlat (Production Profile)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

Ya da Maven kurulu ise:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 2. Presigned URL Test

```bash
# JWT token al (login)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Presigned URL iste
curl -X POST http://localhost:8080/api/users/me/avatar/presigned-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"image/jpeg"}'
```

**Beklenen Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://meslektas-prod.s3.eu-central-1.amazonaws.com/users/123/avatar-abc.jpg?X-Amz-...",
    "key": "users/123/avatar-abc.jpg",
    "expiresIn": 300
  }
}
```

### 3. S3'e Upload Test

```bash
# Presigned URL'e PUT request (test image ile)
curl -X PUT "PRESIGNED_URL_FROM_ABOVE" \
  --upload-file test-avatar.jpg \
  -H "Content-Type: image/jpeg"
```

### 4. Upload Confirm Test

```bash
curl -X POST http://localhost:8080/api/users/me/avatar/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"users/123/avatar-abc.jpg"}'
```

**Beklenen Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://daw1sj0p0yrom.cloudfront.net/users/123/avatar-abc.jpg"
  }
}
```

### 5. CloudFront Image Test

Tarayıcıda aç:
```
https://daw1sj0p0yrom.cloudfront.net/users/123/avatar-abc.jpg
```

## Mobile Test

### EditProfileScreen'den Test

1. Backend'i başlat (production profile)
2. Mobile'da Expo Go ile uygulamayı aç
3. Profile → Edit Profile → Avatar'a tıkla
4. "Fotoğraf Çek" veya "Galeriden Seç"
5. Upload progress göreceksin (0-100%)
6. Başarılı olursa CloudFront URL'den avatar yüklenecek

### Beklenen Akış
```
[Mobile] POST /api/users/me/avatar/presigned-url
  ↓ (10% progress)
[Backend] Generate presigned URL (S3 + IAM role)
  ↓ (30% progress)
[Mobile] PUT to S3 presigned URL (direct upload)
  ↓ (50% progress)
[Mobile] POST /api/users/me/avatar/confirm
  ↓ (80% progress)
[Backend] Validate S3 upload, return CloudFront URL
  ↓ (100% progress)
[Mobile] Display image from CloudFront CDN
```

## Troubleshooting

### Problem: "Access Denied" S3'e upload ederken

**Çözüm 1**: IAM role kontrolü (backend EC2/ECS için)
```bash
aws iam get-role --role-name MeslektasBackendRole
aws iam list-attached-role-policies --role-name MeslektasBackendRole
```

**Çözüm 2**: IAM user credentials (local test için)
```bash
aws s3 ls s3://meslektas-prod/users/ --profile your-profile
```

### Problem: "SignatureDoesNotMatch" presigned URL'de

**Sebep**: IAM credentials eksik veya yanlış

**Çözüm**: Environment variables kontrol et
```bash
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

### Problem: CloudFront URL'de "Access Denied"

**Sebep**: S3 bucket policy CloudFront OAC'ye izin vermiyor

**Çözüm**: S3 bucket policy güncelle (dokümantasyonda var)
```bash
aws s3api get-bucket-policy --bucket meslektas-prod
```

## Production Deployment Checklist ✅

- [x] S3 bucket oluşturuldu: `meslektas-prod`
- [x] CloudFront distribution kuruldu: `daw1sj0p0yrom.cloudfront.net`
- [x] Backend `application.yml` güncellendi (default values)
- [x] `.env.production.example` dosyası oluşturuldu
- [x] `.env.local.example` dosyası oluşturuldu
- [ ] IAM role oluşturuldu (backend EC2/ECS için)
- [ ] S3 bucket policy CloudFront OAC'ye izin veriyor
- [ ] Backend production'a deploy edildi
- [ ] Mobile app test edildi
- [ ] CloudWatch alarms kuruldu

## Sonraki Adımlar

1. **IAM Role Kurulumu** (Production EC2/ECS için)
   - Dokümantasyon: `backend-development-guide/infrastructure/22-AWS-S3-CLOUDFRONT-PROFILE-IMAGES.md`
   - IAM policy oluştur: `MeslektasS3ProfileImagesPolicy`
   - Backend role'e attach et

2. **S3 Bucket Policy Güncelle**
   - CloudFront OAC'ye GetObject izni ver
   - Dokümantasyondaki JSON'u kullan

3. **Backend Deploy**
   - Production profile ile başlat
   - Environment variables set et
   - IAM role attach et (EC2/ECS)

4. **Mobile Deploy**
   - Expo Go ile test
   - Production build oluştur
   - App Store / Google Play'e yükle

## Faydalı Komutlar

```bash
# S3 bucket içeriğini listele
aws s3 ls s3://meslektas-prod/users/ --recursive

# CloudFront distribution detayları
aws cloudfront get-distribution --id E8MH2YKVE51HB

# CloudFront cache invalidation (gerekirse)
aws cloudfront create-invalidation \
  --distribution-id E8MH2YKVE51HB \
  --paths "/users/*"
```

---

**Status**: 🎉 AWS entegrasyonu tamamlandı, backend ve mobile hazır!  
**Next**: IAM role kurulumu + S3 bucket policy + production test
