# AWS S3 + CloudFront Profile Photo Infrastructure Setup

## Overview

This document provides production-ready AWS infrastructure setup for profile photo uploads using:
- **S3 Bucket**: Secure storage with non-public access
- **CloudFront CDN**: Fast, cached image delivery worldwide
- **IAM Roles**: Least-privilege access for backend EC2/ECS
- **Presigned URLs**: Secure, time-limited direct uploads from mobile

## Architecture

```
Mobile App
    ↓
1. Request presigned URL (POST /api/users/me/avatar/presigned-url)
    ↓
Backend (IAM Role)
    ↓
2. Generate presigned URL (S3:PutObject permission)
    ↓
    ← Return presigned URL + S3 key
    ↓
Mobile App
    ↓
3. Upload image directly to S3 (PUT to presigned URL)
    ↓
    ← S3 confirms upload
    ↓
4. Confirm upload (POST /api/users/me/avatar/confirm with S3 key)
    ↓
Backend (IAM Role)
    ↓
5. Validate S3 upload (S3:HeadObject permission)
6. Update user.avatarUrl with CloudFront URL
    ↓
    ← Return CloudFront URL: https://d1234abcd.cloudfront.net/users/123/avatar.jpg
    ↓
Mobile App displays image via CloudFront CDN
```

## S3 Bucket Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://meslektas-prod --region eu-central-1
```

### 2. Block All Public Access

```bash
aws s3api put-public-access-block \
  --bucket meslektas-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

**Important**: Bucket must remain PRIVATE. Only CloudFront can access via Origin Access Control (OAC).

### 3. Enable Versioning (Optional)

```bash
aws s3api put-bucket-versioning \
  --bucket meslektas-prod \
  --versioning-configuration Status=Enabled
```

### 4. Configure Lifecycle Policy (Cost Optimization)

Delete incomplete multipart uploads after 7 days:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket meslektas-prod \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteIncompleteMultipartUploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7
      },
      "Filter": {}
    },
    {
      "Id": "DeleteOldProfileImages",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "users/"
      },
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

## CloudFront Distribution Setup

### 1. Create Origin Access Control (OAC)

OAC is the modern replacement for Origin Access Identity (OAI).

```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config file://oac-config.json
```

**oac-config.json:**
```json
{
  "Name": "meslektas-s3-oac",
  "Description": "Origin Access Control for Meslektaş S3 bucket",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
```

Save the OAC ID from response: `E1ABCDEFGHIJKL`

### 2. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-distribution.json
```

**cloudfront-distribution.json:**
```json
{
  "CallerReference": "meslektas-profile-images-2025",
  "Comment": "Meslektaş profile images CDN",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-meslektas-prod",
        "DomainName": "meslektas-prod.s3.eu-central-1.amazonaws.com",
        "OriginAccessControlId": "E1ABCDEFGHIJKL",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-meslektas-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "MinTTL": 31536000,
    "DefaultTTL": 31536000,
    "MaxTTL": 31536000
  },
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  }
}
```

**Note**: `CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6` is AWS Managed-CachingOptimized.

Save CloudFront domain: `d1234abcd.cloudfront.net`

### 3. Update S3 Bucket Policy to Allow CloudFront OAC

```bash
aws s3api put-bucket-policy \
  --bucket meslektas-prod \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::meslektas-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

**Replace:**
- `ACCOUNT_ID`: Your AWS account ID (e.g., `123456789012`)
- `DISTRIBUTION_ID`: CloudFront distribution ID (e.g., `E2ABCDEFGHIJKL`)

## IAM Role for Backend (EC2/ECS)

### 1. Create IAM Policy for S3 Profile Images

```bash
aws iam create-policy \
  --policy-name MeslektasS3ProfileImagesPolicy \
  --policy-document file://s3-policy.json
```

**s3-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowProfileImageOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::meslektas-prod/users/*"
    },
    {
      "Sid": "AllowPresignedURLGeneration",
      "Effect": "Allow",
      "Action": [
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::meslektas-prod/users/*"
    }
  ]
}
```

### 2. Attach Policy to Backend IAM Role

```bash
aws iam attach-role-policy \
  --role-name MeslektasBackendRole \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/MeslektasS3ProfileImagesPolicy
```

**Note**: If backend role doesn't exist, create it:

```bash
aws iam create-role \
  --role-name MeslektasBackendRole \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name MeslektasBackendRole \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/MeslektasS3ProfileImagesPolicy
```

**trust-policy.json** (for EC2):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**For ECS/Fargate**, use:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## Backend Configuration

### application.yml (Production Profile)

```yaml
spring:
  config:
    activate:
      on-profile: prod

# AWS Configuration
aws:
  region: eu-central-1
  s3:
    bucket: meslektas-prod
    profile-images:
      folder: users
    presigned-url:
      expiration: 300  # 5 minutes
  cloudfront:
    domain: d1234abcd.cloudfront.net  # Your CloudFront domain

# No AWS credentials in config - use IAM role
```

### Environment Variables (Optional)

```bash
export AWS_REGION=eu-central-1
export AWS_S3_BUCKET=meslektas-prod
export AWS_CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net
```

## Security Checklist

- [x] S3 bucket is PRIVATE (Block all public access)
- [x] CloudFront uses Origin Access Control (OAC)
- [x] S3 bucket policy only allows CloudFront service principal
- [x] Backend uses IAM role (no hardcoded credentials)
- [x] IAM policy uses least-privilege (only `users/*` folder)
- [x] Presigned URLs expire in 5 minutes
- [x] Content-Type validation (only image/jpeg, image/png, image/webp)
- [x] Max file size: 5MB (enforced by presigned URL)
- [x] S3 key validation (must match user ID)
- [x] HTTPS-only access (CloudFront redirects HTTP → HTTPS)

## Cost Optimization

### S3 Storage Costs
- **Standard Storage**: $0.023 per GB/month (eu-central-1)
- **Estimate**: 10,000 users × 500KB avg = 5GB = **$0.12/month**

### S3 Request Costs
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests (via CloudFront, negligible)
- **Estimate**: 10,000 uploads/month = **$0.05/month**

### CloudFront Data Transfer Costs
- **First 10TB/month**: $0.085 per GB
- **Estimate**: 10,000 users × 500KB × 10 views = 50GB = **$4.25/month**

### Total Estimated Cost: ~$5/month for 10,000 active users

**Cost Optimization Tips:**
1. Enable CloudFront caching (1 year TTL) → Reduce S3 GET requests
2. Use WebP format → Smaller file sizes
3. Delete old avatars on new upload → Reduce storage costs
4. Use lifecycle policy → Auto-delete incomplete uploads

## Monitoring & Alerts

### CloudWatch Metrics

1. **S3 Metrics:**
   - `NumberOfObjects` (users/ folder)
   - `BucketSizeBytes` (users/ folder)
   - `4xxErrors`, `5xxErrors`

2. **CloudFront Metrics:**
   - `Requests`
   - `BytesDownloaded`
   - `4xxErrorRate`, `5xxErrorRate`

### Recommended Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name meslektas-cloudfront-5xx-errors \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --metric-name 5xxErrorRate \
  --namespace AWS/CloudFront \
  --period 300 \
  --statistic Average \
  --threshold 5.0 \
  --dimensions Name=DistributionId,Value=E2ABCDEFGHIJKL \
  --alarm-actions arn:aws:sns:eu-central-1:ACCOUNT_ID:meslektas-alerts
```

## Testing

### 1. Test Presigned URL Generation (Backend)

```bash
curl -X POST http://localhost:8080/api/users/me/avatar/presigned-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "image/jpeg"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Presigned URL generated successfully",
  "data": {
    "url": "https://meslektas-prod.s3.eu-central-1.amazonaws.com/users/123/avatar-abc123.jpg?X-Amz-...",
    "key": "users/123/avatar-abc123.jpg",
    "expiresIn": 300,
    "contentType": "image/jpeg",
    "maxFileSize": 5242880
  }
}
```

### 2. Test Direct S3 Upload (Mobile)

```bash
curl -X PUT "PRESIGNED_URL" \
  --upload-file test-avatar.jpg \
  -H "Content-Type: image/jpeg"
```

**Expected Response:** `200 OK` (empty body)

### 3. Test Upload Confirmation (Backend)

```bash
curl -X POST http://localhost:8080/api/users/me/avatar/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "users/123/avatar-abc123.jpg"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": 123,
    "avatarUrl": "https://d1234abcd.cloudfront.net/users/123/avatar-abc123.jpg",
    ...
  }
}
```

### 4. Test CloudFront Image Delivery

```bash
curl -I https://d1234abcd.cloudfront.net/users/123/avatar-abc123.jpg
```

**Expected Headers:**
```
HTTP/2 200
content-type: image/jpeg
cache-control: max-age=31536000
x-cache: Hit from cloudfront
x-amz-cf-id: ...
```

## Troubleshooting

### Issue: "Access Denied" when accessing CloudFront URL

**Solution:**
1. Verify S3 bucket policy allows CloudFront OAC
2. Check CloudFront distribution has OAC configured
3. Ensure S3 bucket is not public (CloudFront should be only access method)

### Issue: "SignatureDoesNotMatch" when uploading to presigned URL

**Solution:**
1. Check backend IAM role has `s3:PutObject` permission
2. Verify presigned URL hasn't expired (5 minutes)
3. Ensure `Content-Type` header matches presigned URL's content type

### Issue: "Upload verification failed: metadata mismatch"

**Solution:**
1. Check S3 object metadata was set correctly during presigned URL generation
2. Verify `user-id` metadata matches authenticated user

### Issue: Backend can't generate presigned URLs

**Solution:**
1. Check EC2/ECS has IAM role attached
2. Verify IAM policy allows `s3:PutObject` on `users/*` folder
3. Check AWS SDK configuration in `application.yml`

## Migration from Old System

If migrating from multipart upload to presigned URLs:

1. **Keep old endpoint** (`POST /api/users/me/avatar`) for backward compatibility (marked as `@Deprecated`)
2. **Migrate mobile app** to use new presigned URL endpoints
3. **Monitor usage** of deprecated endpoint
4. **Remove deprecated endpoint** after all clients updated (3-6 months)

### Migration Checklist

- [x] Backend: `ProfileImageS3Service` with presigned URL methods
- [x] Backend: `ProfileImageController` with new endpoints
- [x] Backend: `UserService.updateAvatarUrl()` for presigned URL flow
- [x] Backend: AWS config (S3 bucket, CloudFront domain)
- [x] Mobile: `profileApi.uploadAvatarWithPresignedUrl()` method
- [x] Mobile: `useUploadAvatarWithPresignedUrl()` hook
- [x] Mobile: `EditProfileScreen` using new hook
- [x] Infrastructure: S3 bucket policy with CloudFront OAC
- [x] Infrastructure: CloudFront distribution configured
- [x] Infrastructure: IAM role for backend EC2/ECS

## Production Deployment Steps

1. **Setup AWS Infrastructure:**
   - Create S3 bucket (block public access)
   - Create CloudFront distribution with OAC
   - Configure S3 bucket policy
   - Create IAM role with S3 policy

2. **Configure Backend:**
   - Update `application.yml` with S3 bucket name
   - Add CloudFront domain to config
   - Deploy backend with IAM role attached

3. **Test Backend:**
   - Test presigned URL generation
   - Test S3 upload confirmation
   - Test CloudFront image delivery

4. **Deploy Mobile App:**
   - Update to use new presigned URL endpoints
   - Test end-to-end upload flow
   - Monitor error rates

5. **Monitor & Optimize:**
   - Setup CloudWatch alarms
   - Monitor S3 and CloudFront metrics
   - Optimize costs (caching, lifecycle policies)

---

**Last Updated:** 2025-01-21  
**Author:** Meslektaş Development Team  
**Version:** 1.0.0
