# 🗄️ Veritabanı Şeması ve İlişkiler

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Schemas](#table-schemas)
4. [Indexes ve Performance](#indexes-ve-performance)
5. [Constraints ve Relationships](#constraints-ve-relationships)
6. [Migration Strategy](#migration-strategy)
7. [Backup ve Recovery](#backup-ve-recovery)

---

## 📊 Database Overview

**Database Management System:** PostgreSQL 15  
**Charset:** UTF-8  
**Collation:** tr_TR.UTF-8  
**Timezone:** UTC

### Neden PostgreSQL?

✅ **Open Source:** Ücretsiz ve topluluk desteği güçlü  
✅ **ACID Uyumlu:** Veri tutarlılığı garantisi  
✅ **JSON Desteği:** Esnek veri yapıları  
✅ **Full-Text Search:** Gelişmiş arama yetenekleri  
✅ **Scalability:** Yüksek performans ve ölçeklenebilirlik  
✅ **Extensions:** pg_trgm, uuid-ossp gibi eklentiler

---

## 🔗 Entity Relationship Diagram

```
┌─────────────────┐
│   professions   │
│─────────────────│
│ id (PK)         │
│ name            │
│ category        │
│ requires_verify │
└─────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────┐         ┌──────────────────┐
│     users       │─────────│ verification_    │
│─────────────────│  1:N    │   requests       │
│ id (PK)         │         │──────────────────│
│ email (UNIQUE)  │         │ id (PK)          │
│ password_hash   │         │ user_id (FK)     │
│ name            │         │ profession_id(FK)│
│ surname         │         │ document_url     │
│ profession_id(FK│         │ selfie_url       │
│ is_verified     │         │ status           │
│ created_at      │         │ ai_confidence    │
└─────────────────┘         └──────────────────┘
    │       │
    │ 1:N   │ 1:N
    ↓       ↓
┌──────────┐  ┌──────────┐
│  posts   │  │ messages │
│──────────│  │──────────│
│ id (PK)  │  │ id (PK)  │
│ user_id  │  │ sender_id│
│ content  │  │ room_id  │
│ images   │  │ content  │
└──────────┘  └──────────┘
    │              │
    │ 1:N          │
    ↓              ↓
┌──────────┐  ┌──────────┐
│ comments │  │chat_rooms│
│──────────│  │──────────│
│ id (PK)  │  │ id (PK)  │
│ post_id  │  │ room_type│
│ user_id  │  │ prof_id  │
│ content  │  └──────────┘
└──────────┘
```

---

## 📋 Table Schemas

### 1. users

**Açıklama:** Sistemdeki tüm kullanıcıların bilgilerini saklar.

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    profession_id BIGINT,
    is_profession_verified BOOLEAN DEFAULT FALSE,
    is_profile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',

    CONSTRAINT fk_profession FOREIGN KEY (profession_id)
        REFERENCES professions(id) ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'BANNED', 'DELETED'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(profession_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Kolonlar:**

- `id`: Birincil anahtar, otomatik artan
- `email`: Benzersiz, küçük harfe normalize edilmiş
- `password_hash`: BCrypt ile hashlenmiş şifre (OAuth kullanıcılarında NULL)
- `name`, `surname`: Kullanıcı adı
- `bio`: Kısa profil açıklaması (max 200 karakter)
- `avatar_url`: S3'teki profil fotoğrafı URL'i
- `profession_id`: Seçilen meslek (NULL olabilir)
- `is_profession_verified`: Meslek doğrulandı mı?
- `is_profile_verified`: Mavi tik var mı?
- `status`: ACTIVE, BANNED, DELETED

---

### 2. professions

**Açıklama:** Meslek kategorileri ve bilgileri.

```sql
CREATE TABLE professions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requires_verification BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_category CHECK (category IN (
        'MEDICAL', 'LEGAL', 'ENGINEERING', 'EDUCATION',
        'FINANCE', 'ARCHITECTURE', 'SERVICE', 'GENERAL'
    ))
);

-- Indexes
CREATE INDEX idx_professions_category ON professions(category);
CREATE INDEX idx_professions_verification ON professions(requires_verification);
```

**Seed Data:**

```sql
INSERT INTO professions (name, category, requires_verification) VALUES
('Doktor', 'MEDICAL', TRUE),
('Hemşire', 'MEDICAL', TRUE),
('Yazılım Geliştirici', 'ENGINEERING', TRUE),
('Öğretmen', 'EDUCATION', TRUE),
('Avukat', 'LEGAL', TRUE),
('Garson', 'SERVICE', FALSE),
('Genel', 'GENERAL', FALSE);
```

---

### 3. verification_requests

**Açıklama:** Kullanıcıların meslek doğrulama talepleri.

```sql
CREATE TABLE verification_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    profession_id BIGINT NOT NULL,
    document_url TEXT,
    selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    ai_confidence_score DECIMAL(5,2),
    ai_result_details JSON,
    admin_note TEXT,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_profession FOREIGN KEY (profession_id)
        REFERENCES professions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewed_by)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'))
);

-- Indexes
CREATE INDEX idx_verification_user ON verification_requests(user_id);
CREATE INDEX idx_verification_status ON verification_requests(status);
CREATE INDEX idx_verification_created_at ON verification_requests(created_at DESC);
```

**Lifecycle:**

1. User uploads document → Status: PENDING
2. AI processes → Status: APPROVED/REJECTED/MANUAL_REVIEW
3. If APPROVED → User.is_profession_verified = TRUE, Documents DELETED
4. If REJECTED → User can retry (max 3 attempts)

---

### 4. posts

**Açıklama:** Kullanıcıların paylaşımları.

```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    profession_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    images JSON,
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_comment_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_profession FOREIGN KEY (profession_id)
        REFERENCES professions(id) ON DELETE CASCADE,
    CONSTRAINT chk_post_status CHECK (status IN ('ACTIVE', 'DELETED', 'REPORTED', 'BANNED')),
    CONSTRAINT chk_content_length CHECK (char_length(content) BETWEEN 1 AND 1000)
);

-- Indexes
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_profession ON posts(profession_id, created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Full-text search index
CREATE INDEX idx_posts_content_fulltext ON posts USING gin(to_tsvector('turkish', content));
```

**Images JSON Format:**

```json
[
  {
    "url": "https://cdn.meslektas.com/posts/abc123.jpg",
    "width": 1080,
    "height": 1920,
    "size": 524288
  }
]
```

---

### 5. comments

**Açıklama:** Gönderilere yapılan yorumlar.

```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_post FOREIGN KEY (post_id)
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id)
        REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT chk_comment_status CHECK (status IN ('ACTIVE', 'DELETED', 'REPORTED')),
    CONSTRAINT chk_comment_length CHECK (char_length(content) BETWEEN 1 AND 500)
);

-- Indexes
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
```

---

### 6. likes

**Açıklama:** Post ve comment beğenileri (like/dislike).

```sql
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id BIGINT NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_like_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_target_type CHECK (target_type IN ('POST', 'COMMENT')),
    UNIQUE(user_id, target_type, target_id)
);

-- Indexes
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_user ON likes(user_id);
```

**Business Logic:**

- Bir kullanıcı bir post/comment'i sadece 1 kez beğenebilir
- `is_like = TRUE` → Like, `is_like = FALSE` → Dislike
- Toggle işlemi: Aynı beğeniyi tekrar tıklarsa kaldırılır

---

### 7. chat_rooms

**Açıklama:** Sohbet odaları (Meslek grubu + Özel mesajlar).

```sql
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_type VARCHAR(20) NOT NULL,
    profession_id BIGINT,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_room_profession FOREIGN KEY (profession_id)
        REFERENCES professions(id) ON DELETE CASCADE,
    CONSTRAINT chk_room_type CHECK (room_type IN ('PROFESSION_GROUP', 'PRIVATE'))
);

-- Indexes
CREATE INDEX idx_chatrooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chatrooms_profession ON chat_rooms(profession_id);
```

**Room Types:**

- `PROFESSION_GROUP`: Meslek grubu sohbet odası (profession_id gerekli)
- `PRIVATE`: 1-1 özel mesajlaşma (profession_id NULL)

---

### 8. chat_participants

**Açıklama:** Sohbet odası katılımcıları.

```sql
CREATE TABLE chat_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,

    CONSTRAINT fk_participant_room FOREIGN KEY (room_id)
        REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_participant_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_room ON chat_participants(room_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);
```

---

### 9. messages

**Açıklama:** Sohbet mesajları.

```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_room FOREIGN KEY (room_id)
        REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_message_type CHECK (message_type IN ('TEXT', 'IMAGE', 'SYSTEM')),
    CONSTRAINT chk_message_length CHECK (char_length(content) BETWEEN 1 AND 2000)
);

-- Indexes
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Partitioning (for large scale)
-- CREATE TABLE messages_2025_11 PARTITION OF messages
--   FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

---

### 10. notifications

**Açıklama:** Kullanıcı bildirimleri.

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN (
        'NEW_MESSAGE', 'NEW_LIKE', 'NEW_COMMENT', 'NEW_DISLIKE',
        'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED',
        'POST_REPORTED', 'SYSTEM'
    ))
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Auto-delete old notifications (30 days)
-- Scheduled job or PostgreSQL function
```

---

### 11. user_blocks

**Açıklama:** Kullanıcıların engellediği diğer kullanıcılar.

```sql
CREATE TABLE user_blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blocker FOREIGN KEY (blocker_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blocked FOREIGN KEY (blocked_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_not_self_block CHECK (blocker_id <> blocked_id),
    UNIQUE(blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON user_blocks(blocked_id);
```

---

### 12. reports

**Açıklama:** Kullanıcı şikayetleri.

```sql
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reporter FOREIGN KEY (reporter_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewed_by)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_target_type CHECK (target_type IN ('POST', 'COMMENT', 'MESSAGE', 'USER')),
    CONSTRAINT chk_reason CHECK (reason IN ('SPAM', 'HARASSMENT', 'FAKE', 'INAPPROPRIATE', 'OTHER')),
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED'))
);

-- Indexes
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
```

---

## 🎯 Indexes ve Performance

### Index Strategy

1. **Primary Keys:** Otomatik index oluşturulur
2. **Foreign Keys:** Manuel index eklenir (JOIN performance)
3. **Search Columns:** email, status, created_at
4. **Composite Indexes:** Frequently queried combinations

### Query Optimization Examples

```sql
-- Fast profession-based feed query
SELECT p.* FROM posts p
WHERE p.profession_id = ?
  AND p.status = 'ACTIVE'
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;
-- Uses: idx_posts_profession (profession_id, created_at)

-- Fast user's posts query
SELECT p.* FROM posts p
WHERE p.user_id = ?
ORDER BY p.created_at DESC;
-- Uses: idx_posts_user (user_id, created_at)

-- Full-text search
SELECT p.* FROM posts p
WHERE to_tsvector('turkish', p.content) @@ to_tsquery('turkish', 'yazılım');
-- Uses: idx_posts_content_fulltext
```

---

## 🔄 Migration Strategy

### Flyway Migrations

**Klasör:** `src/main/resources/db/migration/`

```
V1__initial_schema.sql          # Tüm tablolar
V2__add_indexes.sql             # Performance indexes
V3__seed_professions.sql        # İlk meslek verileri
V4__add_fulltext_search.sql     # Full-text search
V5__add_user_blocks.sql         # User blocking feature
V6__add_notifications.sql       # Notification system
```

**Naming Convention:**

- `V{version}__{description}.sql` (Versioned)
- `R__{description}.sql` (Repeatable)

**Execution:**

```bash
mvn flyway:migrate
mvn flyway:info
mvn flyway:validate
```

---

## 💾 Backup ve Recovery

### Backup Strategy

1. **Daily Automated Backups:**

   - Full database dump (pg_dump)
   - Retention: 30 days
   - Storage: AWS S3

2. **Point-in-Time Recovery:**

   - WAL archiving enabled
   - Recovery window: 7 days

3. **Backup Script:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="meslektas_backup_$DATE.sql.gz"

pg_dump -h localhost -U postgres meslektas | gzip > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://meslektas-backups/
```

### Recovery Procedure

```bash
# Restore from backup
gunzip meslektas_backup_20251129.sql.gz
psql -h localhost -U postgres -d meslektas < meslektas_backup_20251129.sql
```

---

**Hazırlayan:** Database Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
