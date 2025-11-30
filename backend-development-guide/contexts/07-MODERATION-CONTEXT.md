# Moderation Context - Auto-moderation & Content Safety

> **Bounded Context:** Moderation  
> **Complexity:** ⭐⭐⭐ High (Auto-moderation logic)  
> **Core Domain:** ❌ No (Supporting Domain)

---

## 📚 İçindekiler

1. [Context Overview](#context-overview)
2. [Domain Model](#domain-model)
3. [Aggregates](#aggregates)
4. [Domain Services](#domain-services)
5. [Domain Events](#domain-events)
6. [Business Rules](#business-rules)
7. [Integration Points](#integration-points)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Context Overview

### Responsibility

İçerik moderasyonu, kullanıcı raporlama, auto-moderation kuralları, ban yönetimi, spam detection.

### Ubiquitous Language

```
ModerationCase: Moderasyon vakası (Aggregate Root)
Report: Kullanıcı raporu (Entity)
AutoModerationRule: Otomatik moderasyon kuralı
ModerationAction: WARN, HIDE_CONTENT, SUSPEND_USER, BAN_USER
ReportReason: SPAM, OFFENSIVE, HARASSMENT, INAPPROPRIATE, OTHER
ContentViolation: İçerik ihlali
BanHistory: Ban geçmişi
ModerationQueue: Manuel inceleme kuyruğu
```

### Context Boundaries

```
IN SCOPE:
✅ User reporting system
✅ Auto-moderation rules
✅ Manual review queue
✅ Moderation actions (warn, hide, suspend, ban)
✅ Ban lifecycle management
✅ Spam detection
✅ Violation tracking
✅ Appeal process
✅ Moderation analytics

OUT OF SCOPE:
❌ Content creation (Social/Messaging Contexts)
❌ User authentication (Identity Context)
❌ Notifications (Notification Context)
```

---

## 🏗️ Domain Model

### Aggregate: ModerationCase

```java
/**
 * Moderation Case Aggregate Root
 *
 * Business Rules:
 * - 5 reports → Auto-hide content
 * - 10 reports → Auto-suspend user (1 day)
 * - 3 suspensions → Permanent ban
 * - Manual review has 48-hour SLA
 * - Appeals allowed (max 1 appeal per case)
 * - Ban durations: 1 day, 7 days, 30 days, PERMANENT
 */
@Entity
@Table(name = "moderation_cases")
public class ModerationCase extends AggregateRoot {

    @EmbeddedId
    private ModerationCaseId id;

    @Embedded
    private UserId targetUserId;

    @Embedded
    private ContentId targetContentId; // Post, Comment, or Message

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type")
    private ContentType contentType;

    @OneToMany(mappedBy = "moderationCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("reportedAt ASC")
    private List<Report> reports = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationStatus status;

    @Embedded
    private AutoModerationDecision autoDecision;

    @Embedded
    private ManualReview manualReview;

    @Embedded
    private ModerationAction action;

    @Column(name = "total_report_count")
    private int totalReportCount;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "review_due_at")
    private Instant reviewDueAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create new moderation case
     */
    public static ModerationCase create(
        UserId targetUserId,
        ContentId targetContentId,
        ContentType contentType
    ) {
        ModerationCase moderationCase = new ModerationCase();
        moderationCase.id = ModerationCaseId.generate();
        moderationCase.targetUserId = targetUserId;
        moderationCase.targetContentId = targetContentId;
        moderationCase.contentType = contentType;
        moderationCase.status = ModerationStatus.OPEN;
        moderationCase.totalReportCount = 0;
        moderationCase.createdAt = Instant.now();

        moderationCase.registerEvent(new ModerationCaseCreatedEvent(
            moderationCase.id,
            targetUserId,
            targetContentId,
            contentType
        ));

        return moderationCase;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Add report to case
     * Business rule: Auto-moderate when threshold reached
     */
    public void addReport(
        UserId reporterId,
        ReportReason reason,
        String description
    ) {
        // Prevent self-reporting
        if (reporterId.equals(targetUserId)) {
            throw new CannotReportSelfException("Cannot report yourself");
        }

        // Check duplicate report from same user
        boolean alreadyReported = reports.stream()
            .anyMatch(r -> r.getReporterId().equals(reporterId));

        if (alreadyReported) {
            throw new DuplicateReportException(
                "User already reported this content"
            );
        }

        // Add report
        Report report = Report.create(this, reporterId, reason, description);
        reports.add(report);
        totalReportCount++;

        registerEvent(new ReportAddedEvent(
            this.id,
            reporterId,
            reason,
            totalReportCount
        ));

        // Check auto-moderation thresholds
        checkAutoModeration();
    }

    /**
     * Auto-moderation logic
     * Business rules:
     * - 5 reports → Hide content
     * - 10 reports → Suspend user (temp)
     */
    private void checkAutoModeration() {
        if (totalReportCount >= 10) {
            // Auto-suspend user
            autoSuspendUser();
        } else if (totalReportCount >= 5) {
            // Auto-hide content
            autoHideContent();
        }
    }

    private void autoHideContent() {
        if (this.status != ModerationStatus.OPEN) {
            return; // Already handled
        }

        this.status = ModerationStatus.AUTO_MODERATED;
        this.autoDecision = AutoModerationDecision.hideContent(
            "Threshold reached: " + totalReportCount + " reports"
        );
        this.action = ModerationAction.hideContent(this.id, "Auto-moderation");

        registerEvent(new ContentAutoHiddenEvent(
            this.id,
            this.targetContentId,
            this.contentType,
            totalReportCount
        ));
    }

    private void autoSuspendUser() {
        if (this.status != ModerationStatus.OPEN) {
            return; // Already handled
        }

        this.status = ModerationStatus.AUTO_MODERATED;
        this.autoDecision = AutoModerationDecision.suspendUser(
            "Threshold reached: " + totalReportCount + " reports"
        );

        // Calculate suspension duration based on violation history
        Duration suspensionDuration = calculateSuspensionDuration();

        this.action = ModerationAction.suspendUser(
            this.id,
            suspensionDuration,
            "Auto-moderation"
        );

        registerEvent(new UserAutoSuspendedEvent(
            this.id,
            this.targetUserId,
            suspensionDuration,
            totalReportCount
        ));
    }

    /**
     * Send to manual review
     */
    public void sendToManualReview(String reason) {
        if (this.status == ModerationStatus.RESOLVED) {
            throw new IllegalStateException("Case already resolved");
        }

        this.status = ModerationStatus.MANUAL_REVIEW;
        this.manualReview = ManualReview.create(reason);
        this.reviewDueAt = Instant.now().plus(Duration.ofHours(48)); // 48h SLA

        registerEvent(new ManualReviewRequiredEvent(
            this.id,
            this.targetContentId,
            reason
        ));
    }

    /**
     * Manual moderation by admin
     */
    public void moderateManually(
        AdminId moderatorId,
        ModerationDecision decision,
        String notes
    ) {
        if (this.status != ModerationStatus.MANUAL_REVIEW) {
            throw new IllegalStateException(
                "Only cases in manual review can be moderated"
            );
        }

        this.status = ModerationStatus.RESOLVED;
        this.manualReview.complete(moderatorId, decision, notes);
        this.resolvedAt = Instant.now();

        // Apply decision
        applyDecision(decision, notes);

        registerEvent(new ModerationCaseResolvedEvent(
            this.id,
            moderatorId,
            decision
        ));
    }

    private void applyDecision(ModerationDecision decision, String reason) {
        this.action = switch (decision) {
            case APPROVE -> ModerationAction.approve(this.id, reason);
            case HIDE_CONTENT -> ModerationAction.hideContent(this.id, reason);
            case WARN_USER -> ModerationAction.warnUser(this.id, reason);
            case SUSPEND_USER -> ModerationAction.suspendUser(
                this.id,
                calculateSuspensionDuration(),
                reason
            );
            case BAN_USER -> ModerationAction.banUser(this.id, reason);
        };

        registerEvent(new ModerationActionAppliedEvent(
            this.id,
            this.targetUserId,
            decision
        ));
    }

    /**
     * Calculate suspension duration based on violation history
     * Business rule:
     * - 1st violation: 1 day
     * - 2nd violation: 7 days
     * - 3rd violation: 30 days
     * - 4th+ violation: PERMANENT BAN
     */
    private Duration calculateSuspensionDuration() {
        // This would typically query violation history
        int violationCount = 1; // Placeholder

        return switch (violationCount) {
            case 1 -> Duration.ofDays(1);
            case 2 -> Duration.ofDays(7);
            case 3 -> Duration.ofDays(30);
            default -> Duration.ofDays(365 * 100); // Effectively permanent
        };
    }

    /**
     * Dismiss case (no action needed)
     */
    public void dismiss(AdminId moderatorId, String reason) {
        if (this.status == ModerationStatus.RESOLVED) {
            throw new IllegalStateException("Case already resolved");
        }

        this.status = ModerationStatus.DISMISSED;
        this.resolvedAt = Instant.now();
        this.action = ModerationAction.approve(this.id, reason);

        registerEvent(new ModerationCaseDismissedEvent(
            this.id,
            moderatorId,
            reason
        ));
    }

    /**
     * Appeal moderation decision
     * Business rule: Max 1 appeal per case
     */
    public void appeal(UserId appealerId, String appealReason) {
        if (!appealerId.equals(targetUserId)) {
            throw new UnauthorizedAppealException(
                "Only target user can appeal"
            );
        }

        if (this.status != ModerationStatus.RESOLVED) {
            throw new IllegalStateException(
                "Can only appeal resolved cases"
            );
        }

        if (this.manualReview != null && this.manualReview.hasAppeal()) {
            throw new AppealAlreadyExistsException(
                "Case already appealed"
            );
        }

        this.status = ModerationStatus.APPEAL;
        this.manualReview.addAppeal(appealReason);

        registerEvent(new ModerationAppealedEvent(
            this.id,
            appealerId,
            appealReason
        ));
    }

    /**
     * Check if case is overdue for review
     */
    public boolean isOverdue() {
        return reviewDueAt != null && Instant.now().isAfter(reviewDueAt);
    }
}
```

### Entity: Report

```java
/**
 * Report Entity
 * Part of ModerationCase aggregate
 */
@Entity
@Table(name = "reports")
public class Report extends BaseEntity {

    @EmbeddedId
    private ReportId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderation_case_id", nullable = false)
    private ModerationCase moderationCase;

    @Embedded
    private UserId reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportReason reason;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "reported_at")
    private Instant reportedAt;

    // Factory
    public static Report create(
        ModerationCase moderationCase,
        UserId reporterId,
        ReportReason reason,
        String description
    ) {
        // Validation
        if (description != null && description.length() > 500) {
            throw new DescriptionTooLongException(
                "Description max 500 characters"
            );
        }

        Report report = new Report();
        report.id = ReportId.generate();
        report.moderationCase = moderationCase;
        report.reporterId = reporterId;
        report.reason = reason;
        report.description = description;
        report.reportedAt = Instant.now();

        return report;
    }
}
```

### Value Objects

```java
/**
 * Auto Moderation Decision Value Object
 */
@Embeddable
public class AutoModerationDecision {

    @Enumerated(EnumType.STRING)
    @Column(name = "auto_decision")
    private AutoDecisionType decision;

    @Column(name = "auto_decision_reason")
    private String reason;

    @Column(name = "auto_decided_at")
    private Instant decidedAt;

    public static AutoModerationDecision hideContent(String reason) {
        AutoModerationDecision decision = new AutoModerationDecision();
        decision.decision = AutoDecisionType.HIDE_CONTENT;
        decision.reason = reason;
        decision.decidedAt = Instant.now();
        return decision;
    }

    public static AutoModerationDecision suspendUser(String reason) {
        AutoModerationDecision decision = new AutoModerationDecision();
        decision.decision = AutoDecisionType.SUSPEND_USER;
        decision.reason = reason;
        decision.decidedAt = Instant.now();
        return decision;
    }
}

/**
 * Manual Review Value Object
 */
@Embeddable
public class ManualReview {

    @Column(name = "review_reason")
    private String reason;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_decision")
    private ModerationDecision decision;

    @Column(name = "review_notes")
    private String notes;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "appeal_reason")
    private String appealReason;

    @Column(name = "appealed_at")
    private Instant appealedAt;

    public static ManualReview create(String reason) {
        ManualReview review = new ManualReview();
        review.reason = reason;
        return review;
    }

    public void complete(
        AdminId reviewerId,
        ModerationDecision decision,
        String notes
    ) {
        this.reviewerId = reviewerId.value();
        this.decision = decision;
        this.notes = notes;
        this.reviewedAt = Instant.now();
    }

    public void addAppeal(String appealReason) {
        this.appealReason = appealReason;
        this.appealedAt = Instant.now();
    }

    public boolean hasAppeal() {
        return appealReason != null;
    }
}

/**
 * Moderation Action Value Object
 */
@Embeddable
public class ModerationAction {

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type")
    private ActionType actionType;

    @Column(name = "action_reason")
    private String reason;

    @Column(name = "suspension_duration_days")
    private Integer suspensionDurationDays;

    @Column(name = "applied_at")
    private Instant appliedAt;

    public static ModerationAction approve(ModerationCaseId caseId, String reason) {
        ModerationAction action = new ModerationAction();
        action.actionType = ActionType.APPROVE;
        action.reason = reason;
        action.appliedAt = Instant.now();
        return action;
    }

    public static ModerationAction hideContent(ModerationCaseId caseId, String reason) {
        ModerationAction action = new ModerationAction();
        action.actionType = ActionType.HIDE_CONTENT;
        action.reason = reason;
        action.appliedAt = Instant.now();
        return action;
    }

    public static ModerationAction warnUser(ModerationCaseId caseId, String reason) {
        ModerationAction action = new ModerationAction();
        action.actionType = ActionType.WARN_USER;
        action.reason = reason;
        action.appliedAt = Instant.now();
        return action;
    }

    public static ModerationAction suspendUser(
        ModerationCaseId caseId,
        Duration duration,
        String reason
    ) {
        ModerationAction action = new ModerationAction();
        action.actionType = ActionType.SUSPEND_USER;
        action.suspensionDurationDays = (int) duration.toDays();
        action.reason = reason;
        action.appliedAt = Instant.now();
        return action;
    }

    public static ModerationAction banUser(ModerationCaseId caseId, String reason) {
        ModerationAction action = new ModerationAction();
        action.actionType = ActionType.BAN_USER;
        action.reason = reason;
        action.appliedAt = Instant.now();
        return action;
    }
}
```

### Enums

```java
public enum ReportReason {
    SPAM,           // Spam or misleading content
    OFFENSIVE,      // Offensive language
    HARASSMENT,     // Harassment or bullying
    INAPPROPRIATE,  // Inappropriate content
    IMPERSONATION,  // Impersonation
    OTHER           // Other (requires description)
}

public enum ModerationStatus {
    OPEN,           // New case
    AUTO_MODERATED, // Handled by auto-moderation
    MANUAL_REVIEW,  // Waiting for manual review
    APPEAL,         // User appealed
    RESOLVED,       // Case closed
    DISMISSED       // No action needed
}

public enum ModerationDecision {
    APPROVE,        // No violation
    HIDE_CONTENT,   // Hide content
    WARN_USER,      // Warn user
    SUSPEND_USER,   // Temporary suspension
    BAN_USER        // Permanent ban
}

public enum ActionType {
    APPROVE,
    HIDE_CONTENT,
    WARN_USER,
    SUSPEND_USER,
    BAN_USER
}

public enum ContentType {
    POST,
    COMMENT,
    MESSAGE
}
```

---

## 🛠️ Domain Services

### SpamDetectionService

```java
/**
 * Domain Service: Spam Detection
 *
 * Business rules:
 * - Same content posted within 5 minutes → SPAM
 * - Excessive emoji (>20%) → SPAM
 * - URL shorteners → SPAM
 * - Blacklisted keywords → SPAM
 */
public class SpamDetectionService {

    private static final List<String> URL_SHORTENERS = List.of(
        "bit.ly", "tinyurl.com", "goo.gl", "t.co"
    );

    private static final List<String> SPAM_KEYWORDS = List.of(
        "bedava", "ücretsiz", "hemen tıkla", "kazanç",
        "satın al", "indirim", "promosyon"
    );

    /**
     * Check if content is spam
     */
    public SpamCheckResult checkSpam(String content, UserId userId) {
        List<String> violations = new ArrayList<>();

        // Check excessive emoji
        double emojiRatio = calculateEmojiRatio(content);
        if (emojiRatio > 0.2) {
            violations.add("Excessive emoji usage: " + (emojiRatio * 100) + "%");
        }

        // Check URL shorteners
        for (String shortener : URL_SHORTENERS) {
            if (content.contains(shortener)) {
                violations.add("Contains URL shortener: " + shortener);
            }
        }

        // Check spam keywords
        String lowerContent = content.toLowerCase();
        for (String keyword : SPAM_KEYWORDS) {
            if (lowerContent.contains(keyword)) {
                violations.add("Contains spam keyword: " + keyword);
            }
        }

        // Check duplicate content (would query recent posts)
        // ...

        boolean isSpam = !violations.isEmpty();
        return new SpamCheckResult(isSpam, violations);
    }

    private double calculateEmojiRatio(String content) {
        long emojiCount = content.codePoints()
            .filter(this::isEmoji)
            .count();

        return (double) emojiCount / content.length();
    }

    private boolean isEmoji(int codePoint) {
        return (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
               (codePoint >= 0x1F300 && codePoint <= 0x1F5FF);
    }
}

record SpamCheckResult(boolean isSpam, List<String> violations) {}
```

### ViolationHistoryService

```java
/**
 * Domain Service: Track user violation history
 */
public class ViolationHistoryService {

    private final ModerationCaseRepository repository;

    /**
     * Get user's violation count
     */
    public int getViolationCount(UserId userId) {
        return repository.countResolvedCasesByUser(
            userId,
            ModerationStatus.RESOLVED
        );
    }

    /**
     * Get suspension count
     */
    public int getSuspensionCount(UserId userId) {
        return repository.countActionsByUserAndType(
            userId,
            ActionType.SUSPEND_USER
        );
    }

    /**
     * Check if user should be permanently banned
     * Business rule: 3 suspensions → permanent ban
     */
    public boolean shouldBePermanentlyBanned(UserId userId) {
        return getSuspensionCount(userId) >= 3;
    }
}
```

---

## 📨 Domain Events

```java
public record ReportAddedEvent(
    ModerationCaseId caseId,
    UserId reporterId,
    ReportReason reason,
    int totalReportCount,
    Instant reportedAt
) implements DomainEvent {}

public record ContentAutoHiddenEvent(
    ModerationCaseId caseId,
    ContentId contentId,
    ContentType contentType,
    int reportCount,
    Instant hiddenAt
) implements DomainEvent {}

public record UserAutoSuspendedEvent(
    ModerationCaseId caseId,
    UserId userId,
    Duration suspensionDuration,
    int reportCount,
    Instant suspendedAt
) implements DomainEvent {}

public record ModerationActionAppliedEvent(
    ModerationCaseId caseId,
    UserId targetUserId,
    ModerationDecision decision,
    Instant appliedAt
) implements DomainEvent {}

public record ModerationAppealedEvent(
    ModerationCaseId caseId,
    UserId appealerId,
    String appealReason,
    Instant appealedAt
) implements DomainEvent {}
```

---

## 📋 Business Rules

### BR-MOD-001: Auto-Hide Threshold

```
Rule: 5 reports → Auto-hide content
Enforcement: ModerationCase.checkAutoModeration()
```

### BR-MOD-002: Auto-Suspend Threshold

```
Rule: 10 reports → Auto-suspend user (temp)
Enforcement: ModerationCase.autoSuspendUser()
```

### BR-MOD-003: Suspension Escalation

```
Rule:
  - 1st violation: 1 day
  - 2nd violation: 7 days
  - 3rd violation: 30 days
  - 4th+ violation: PERMANENT BAN
Enforcement: ModerationCase.calculateSuspensionDuration()
```

### BR-MOD-004: Manual Review SLA

```
Rule: Manual review must be completed within 48 hours
Enforcement: ModerationCase.reviewDueAt + Alert system
```

### BR-MOD-005: Single Appeal

```
Rule: Max 1 appeal per case
Enforcement: ModerationCase.appeal()
Exception: AppealAlreadyExistsException
```

### BR-MOD-006: No Self-Reporting

```
Rule: User cannot report own content
Enforcement: ModerationCase.addReport()
Exception: CannotReportSelfException
```

### BR-MOD-007: No Duplicate Reports

```
Rule: User can report content only once
Enforcement: ModerationCase.addReport()
Exception: DuplicateReportException
```

---

## 🔗 Integration Points

### Upstream Event Consumers

```java
@Component
public class ModerationEventListener {

    @EventListener
    @Async
    public void onPostCreated(PostCreatedEvent event) {
        // Run spam detection
        spamDetectionService.checkSpam(event.content(), event.authorId());
    }

    @EventListener
    @Async
    public void onCommentAdded(CommentAddedEvent event) {
        // Run spam detection
    }
}
```

### Downstream Actions

```java
// Updates other contexts based on moderation actions

// ContentAutoHiddenEvent → Social Context: Hide post/comment
// UserAutoSuspendedEvent → Identity Context: Suspend user
// ModerationActionAppliedEvent → Identity Context: Ban user
```

---

## 🛠️ Implementation Guide

### Package Structure

```
moderation/
├── domain/
│   ├── model/
│   │   ├── ModerationCase.java (Aggregate Root)
│   │   ├── Report.java (Entity)
│   │   ├── ModerationCaseId.java (Value Object)
│   │   ├── AutoModerationDecision.java (Value Object)
│   │   ├── ManualReview.java (Value Object)
│   │   ├── ModerationAction.java (Value Object)
│   │   ├── ReportReason.java (Enum)
│   │   └── ModerationStatus.java (Enum)
│   ├── service/
│   │   ├── SpamDetectionService.java
│   │   └── ViolationHistoryService.java
│   ├── repository/
│   │   └── ModerationCaseRepository.java (Interface)
│   └── event/
│       ├── ReportAddedEvent.java
│       ├── ContentAutoHiddenEvent.java
│       └── UserAutoSuspendedEvent.java
│
├── application/
│   ├── command/
│   │   ├── ReportContentCommand.java
│   │   ├── ModerateCaseCommand.java
│   │   └── AppealCaseCommand.java
│   ├── query/
│   │   ├── GetPendingCasesQuery.java
│   │   └── GetUserViolationsQuery.java
│   ├── service/
│   │   └── ModerationApplicationService.java
│   └── dto/
│       ├── ModerationCaseDTO.java
│       └── ReportDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── ModerationCaseJpaRepository.java
│   │   └── ModerationCaseRepositoryImpl.java
│   └── event/
│       └── ModerationEventListener.java
│
└── api/
    ├── ModerationController.java (Admin)
    └── ReportController.java (User)
```

---

**Complexity:** ⭐⭐⭐ High  
**Lines of Code (estimated):** 1800-2200  
**Implementation Time:** Sprint 9-10 (3-4 weeks)

---

**✅ ALL 6 BOUNDED CONTEXTS COMPLETED!**

1. ✅ Identity Context
2. ✅ Verification Context
3. ✅ Social Context
4. ✅ Messaging Context
5. ✅ Notification Context
6. ✅ Moderation Context

**Next Steps:** Tactical Patterns, Application Layer, Infrastructure Layer, Testing, Sprint Planning
