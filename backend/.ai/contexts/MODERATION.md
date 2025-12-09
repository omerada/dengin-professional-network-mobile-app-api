# Moderation Context - Content Moderation & Safety

## Overview

İçerik moderasyonu, kullanıcı raporları ve yaptırım yönetimi sistemi.

---

## Domain Model

### ContentReport (Aggregate Root)

```java
@Entity
@Table(name = "content_reports")
public class ContentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long reporterId;

    @Enumerated(EnumType.STRING)
    private ReportType type;  // POST, COMMENT, MESSAGE, USER

    private String contentId;  // Post ID, Comment ID, etc.

    @Enumerated(EnumType.STRING)
    private ReportReason reason;

    @Column(columnDefinition = "TEXT")
    private String details;  // Reporter's explanation

    @Enumerated(EnumType.STRING)
    private ReportStatus status;  // PENDING, REVIEWED, RESOLVED, DISMISSED

    private Long reviewedBy;  // Admin/Moderator ID
    private String reviewNotes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;
}
```

### ReportType (Enum)

```java
public enum ReportType {
    POST,
    COMMENT,
    MESSAGE,
    USER
}
```

### ReportReason (Enum)

```java
public enum ReportReason {
    SPAM("Spam veya yanıltıcı"),
    HARASSMENT("Taciz veya zorbalık"),
    HATE_SPEECH("Nefret söylemi"),
    VIOLENCE("Şiddet içeriği"),
    INAPPROPRIATE("Uygunsuz içerik"),
    MISINFORMATION("Yanlış bilgi"),
    COPYRIGHT("Telif hakkı ihlali"),
    OTHER("Diğer");

    private final String displayName;
}
```

### UserSanction (Aggregate Root)

```java
@Entity
@Table(name = "user_sanctions")
public class UserSanction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private SanctionType type;

    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    private Long issuedBy;  // Admin ID

    private LocalDateTime expiresAt;  // null for permanent

    private Boolean active = true;

    // Appeal
    private String appealReason;
    private LocalDateTime appealedAt;

    @Enumerated(EnumType.STRING)
    private AppealStatus appealStatus;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### SanctionType (Enum)

```java
public enum SanctionType {
    WARNING(null),              // Warning only, no restriction
    TEMPORARY_BAN(Duration.ofDays(7)),  // Cannot login
    PERMANENT_BAN(null),        // Permanent account ban
    POST_RESTRICTION(Duration.ofDays(3)),  // Cannot create posts
    COMMENT_RESTRICTION(Duration.ofDays(1));  // Cannot comment

    private final Duration defaultDuration;
}
```

---

## API Endpoints

### User Reporting

#### Report Content

```java
POST /api/moderation/reports
Authorization: Bearer {token}

{
  "type": "POST",
  "contentId": "123",
  "reason": "SPAM",
  "details": "Bu gönderi spam içeriyor..."
}

// Response
{
  "success": true,
  "message": "Report submitted successfully. We'll review it soon.",
  "data": {
    "id": "uuid-123",
    "status": "PENDING"
  }
}
```

**Rules:**

- Cannot report own content
- Cannot report same content twice
- Max 10 reports per day per user

#### Get My Reports

```java
GET /api/moderation/reports/my?page=0&size=20

// Returns user's submitted reports
```

---

### Admin/Moderator Endpoints

#### Get Pending Reports

```java
GET /api/admin/moderation/reports/pending?page=0&size=20
Authorization: Bearer {admin_token}

// Response
{
  "content": [
    {
      "id": "uuid-123",
      "reporterId": 5,
      "reporterName": "Ahmet Yılmaz",
      "type": "POST",
      "contentId": "456",
      "reason": "SPAM",
      "details": "Bu gönderi spam içeriyor...",
      "status": "PENDING",
      "createdAt": "2025-12-09T10:00:00Z",
      "reportCount": 3  // How many users reported this content
    }
  ]
}
```

#### Review Report

```java
POST /api/admin/moderation/reports/{id}/review

{
  "action": "REMOVE_CONTENT",  // or DISMISS, WARN_USER, BAN_USER
  "notes": "Content removed for violating community guidelines"
}
```

**Actions:**

- `DISMISS`: No action, report was false/minor
- `WARN_USER`: Send warning to content owner
- `REMOVE_CONTENT`: Delete/hide the content
- `BAN_USER`: Apply sanction to user

---

### Sanctions

#### Apply Sanction

```java
POST /api/admin/moderation/sanctions

{
  "userId": 5,
  "type": "TEMPORARY_BAN",
  "reason": "Spam içerik paylaşımı",
  "details": "Kullanıcı 3 kez uyarıldı, 7 günlük ban uygulandı",
  "duration": "P7D"  // ISO 8601 duration (7 days)
}
```

#### Get User Sanctions

```java
GET /api/admin/moderation/sanctions/user/{userId}

// Returns all sanctions for user
```

#### Get Active Sanctions

```java
GET /api/admin/moderation/sanctions/active?page=0&size=20

// Returns currently active bans/restrictions
```

---

### User Appeals

#### Appeal Sanction

```java
POST /api/moderation/sanctions/{id}/appeal
Authorization: Bearer {token}

{
  "reason": "Ben spam yapmadım, yanlışlıkla oldu..."
}
```

#### Review Appeal (Admin)

```java
POST /api/admin/moderation/appeals/{id}/review

{
  "decision": "APPROVED",  // or REJECTED
  "notes": "Appeal approved, sanction lifted"
}
```

---

## Business Rules

### Reporting

1. **Rate Limits:**

   - Max 10 reports per day per user
   - Cannot report same content twice
   - Cannot report own content

2. **Auto-Actions:**

   - 5+ reports → Auto-hide content (pending review)
   - 10+ reports → Auto-temp ban (pending review)

3. **Abuse Detection:**
   - Users with 80%+ dismissed reports flagged for review

### Sanctions

1. **Escalation:**

   ```
   1st offense: Warning
   2nd offense: 1-day post restriction
   3rd offense: 7-day ban
   4th offense: Permanent ban
   ```

2. **Duration:**

   - Warnings: No expiry
   - Temporary bans: 1, 7, 30, or 90 days
   - Permanent bans: Never expire

3. **Enforcement:**
   - Active ban → Cannot login
   - Post restriction → Cannot create posts (can comment)
   - Comment restriction → Cannot comment (can create posts)

### Appeals

1. Can only appeal once per sanction
2. Appeal window: 30 days from sanction date
3. Decision is final (cannot re-appeal)

---

## Service Layer

### ReportService

```java
@Service
@Transactional
public class ReportContentService {

    public ReportResponse submitReport(
        Long reporterId,
        ReportRequest request
    ) {
        // Validate not reporting own content
        validateNotOwnContent(reporterId, request);

        // Check for duplicate
        if (isDuplicateReport(reporterId, request)) {
            throw new BusinessException("Already reported", "DUPLICATE_REPORT");
        }

        // Create report
        ContentReport report = new ContentReport();
        report.setReporterId(reporterId);
        report.setType(request.getType());
        report.setContentId(request.getContentId());
        report.setReason(request.getReason());
        report.setDetails(request.getDetails());
        report.setStatus(ReportStatus.PENDING);

        ContentReport saved = reportRepository.save(report);

        // Check if auto-action needed
        long reportCount = reportRepository.countPendingReports(
            request.getType(),
            request.getContentId()
        );

        if (reportCount >= 5) {
            autoHideContent(request.getType(), request.getContentId());
        }

        return reportMapper.toResponse(saved);
    }

    private void autoHideContent(ReportType type, String contentId) {
        switch (type) {
            case POST -> postService.hidePost(Long.parseLong(contentId));
            case COMMENT -> commentService.hideComment(Long.parseLong(contentId));
            case MESSAGE -> messageService.hideMessage(Long.parseLong(contentId));
        }
    }
}
```

### ModerationService

```java
@Service
@Transactional
public class ModerationService {

    public void applySanction(ApplySanctionRequest request, Long adminId) {
        // Create sanction
        UserSanction sanction = new UserSanction();
        sanction.setUserId(request.getUserId());
        sanction.setType(request.getType());
        sanction.setReason(request.getReason());
        sanction.setDetails(request.getDetails());
        sanction.setIssuedBy(adminId);

        if (request.getType().getDefaultDuration() != null) {
            sanction.setExpiresAt(
                LocalDateTime.now().plus(request.getType().getDefaultDuration())
            );
        }

        sanctionRepository.save(sanction);

        // Apply restriction
        if (request.getType() == SanctionType.TEMPORARY_BAN ||
            request.getType() == SanctionType.PERMANENT_BAN) {

            // Invalidate all user sessions
            sessionService.invalidateAllSessions(request.getUserId());
        }

        // Send notification
        notificationService.send(
            request.getUserId(),
            NotificationType.ACCOUNT_WARNING,
            Map.of(
                "sanctionType", request.getType().name(),
                "reason", request.getReason()
            )
        );

        log.info("Sanction applied: userId={}, type={}, admin={}",
            request.getUserId(), request.getType(), adminId);
    }
}
```

---

## Enforcement Interceptor

```java
@Component
public class SanctionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler
    ) throws Exception {

        UserPrincipal principal = getCurrentUser();
        if (principal == null) return true;

        // Check for active ban
        List<UserSanction> activeSanctions = sanctionRepository
            .findActiveSanctions(principal.getId());

        for (UserSanction sanction : activeSanctions) {
            if (sanction.getType() == SanctionType.TEMPORARY_BAN ||
                sanction.getType() == SanctionType.PERMANENT_BAN) {

                response.setStatus(403);
                response.getWriter().write(
                    "Account banned: " + sanction.getReason()
                );
                return false;
            }

            if (sanction.getType() == SanctionType.POST_RESTRICTION &&
                request.getRequestURI().contains("/api/posts") &&
                request.getMethod().equals("POST")) {

                response.setStatus(403);
                response.getWriter().write("Cannot create posts while restricted");
                return false;
            }
        }

        return true;
    }
}
```

---

## Integration Points

### → Social Context

```java
// Auto-hide reported posts
if (reportCount >= 5) {
    post.setHidden(true);
}

// Delete posts from banned users
if (sanction.getType() == SanctionType.PERMANENT_BAN) {
    postService.deleteAllByUser(userId);
}
```

### → Notification Context

```java
// Notify user of warning/ban
notificationService.send(
    userId,
    NotificationType.ACCOUNT_WARNING,
    metadata
);
```

---

## Repository Methods

```java
public interface ContentReportRepository extends JpaRepository<ContentReport, UUID> {

    @Query("SELECT COUNT(r) FROM ContentReport r WHERE r.type = :type AND r.contentId = :contentId AND r.status = 'PENDING'")
    long countPendingReports(
        @Param("type") ReportType type,
        @Param("contentId") String contentId
    );

    @Query("SELECT r FROM ContentReport r WHERE r.reporterId = :reporterId AND r.type = :type AND r.contentId = :contentId")
    Optional<ContentReport> findDuplicate(
        @Param("reporterId") Long reporterId,
        @Param("type") ReportType type,
        @Param("contentId") String contentId
    );

    Page<ContentReport> findByStatus(ReportStatus status, Pageable pageable);
}

public interface UserSanctionRepository extends JpaRepository<UserSanction, UUID> {

    @Query("""
        SELECT s FROM UserSanction s
        WHERE s.userId = :userId
        AND s.active = true
        AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP)
    """)
    List<UserSanction> findActiveSanctions(@Param("userId") Long userId);

    @Query("SELECT s FROM UserSanction s WHERE s.appealStatus = 'PENDING'")
    List<UserSanction> findPendingAppeals();
}
```

---

## Common Errors

```java
DUPLICATE_REPORT (400)
→ Already reported this content

CANNOT_REPORT_OWN_CONTENT (400)
→ Cannot report your own content

REPORT_LIMIT_EXCEEDED (429)
→ Max 10 reports per day

SANCTION_NOT_FOUND (404)
→ Invalid sanction ID

APPEAL_WINDOW_EXPIRED (400)
→ Can only appeal within 30 days

ALREADY_APPEALED (400)
→ Can only appeal once
```

---

## Testing

```java
@SpringBootTest
@Transactional
class ModerationServiceTest {

    @Autowired
    private ReportContentService reportService;

    @Test
    void shouldAutoHideAfter5Reports() {
        // Given
        Post post = createPost();

        // When
        for (int i = 0; i < 5; i++) {
            reportService.submitReport(
                (long) i,
                new ReportRequest(ReportType.POST, post.getId().toString(), ReportReason.SPAM, "")
            );
        }

        // Then
        Post updated = postRepository.findById(post.getId()).orElseThrow();
        assertThat(updated.isHidden()).isTrue();
    }
}
```

---

**Last Updated:** 2025-12-09
