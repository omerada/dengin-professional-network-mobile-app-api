-- Seed profession data
-- Categories: MEDICAL, LEGAL, ENGINEERING, EDUCATION, SERVICE, CREATIVE, BUSINESS, OTHER

INSERT INTO professions (name, category, requires_verification, description) VALUES
-- MEDICAL (Sağlık)
('Doktor', 'MEDICAL', TRUE, 'Tıp fakültesi mezunu, doktor unvanına sahip'),
('Hemşire', 'MEDICAL', TRUE, 'Hemşirelik bölümü mezunu, aktif hemşire belgesi sahibi'),
('Eczacı', 'MEDICAL', TRUE, 'Eczacılık fakültesi mezunu, eczacı ruhsatı sahibi'),
('Diş Hekimi', 'MEDICAL', TRUE, 'Diş hekimliği fakültesi mezunu'),
('Veteriner', 'MEDICAL', TRUE, 'Veteriner fakültesi mezunu'),
('Fizyoterapist', 'MEDICAL', TRUE, 'Fizyoterapi bölümü mezunu, sertifikalı'),

-- LEGAL (Hukuk)
('Avukat', 'LEGAL', TRUE, 'Hukuk fakültesi mezunu, baro kaydı olan'),
('Noter', 'LEGAL', TRUE, 'Noterlik sınavını kazanmış, aktif noter'),
('Hakim', 'LEGAL', TRUE, 'Hakimlik sınavını kazanmış, aktif hakim'),
('Savcı', 'LEGAL', TRUE, 'Savcılık sınavını kazanmış, aktif savcı'),

-- ENGINEERING (Mühendislik)
('Yazılım Mühendisi', 'ENGINEERING', FALSE, 'Yazılım geliştirme alanında çalışan'),
('Bilgisayar Mühendisi', 'ENGINEERING', TRUE, 'Bilgisayar mühendisliği diploması sahibi'),
('İnşaat Mühendisi', 'ENGINEERING', TRUE, 'İnşaat mühendisliği diploması sahibi'),
('Elektrik Mühendisi', 'ENGINEERING', TRUE, 'Elektrik mühendisliği diploması sahibi'),
('Makine Mühendisi', 'ENGINEERING', TRUE, 'Makine mühendisliği diploması sahibi'),
('Endüstri Mühendisi', 'ENGINEERING', TRUE, 'Endüstri mühendisliği diploması sahibi'),

-- EDUCATION (Eğitim)
('Öğretmen', 'EDUCATION', TRUE, 'Öğretmenlik sertifikası olan, MEB onaylı'),
('Akademisyen', 'EDUCATION', TRUE, 'Üniversitede aktif olarak çalışan öğretim üyesi'),
('Okul Müdürü', 'EDUCATION', TRUE, 'MEB onaylı okul müdürü'),

-- SERVICE (Hizmet Sektörü)
('Garson', 'SERVICE', FALSE, 'Restoran, kafe veya otel hizmet personeli'),
('Barista', 'SERVICE', FALSE, 'Profesyonel kahve hazırlama uzmanı'),
('Aşçı', 'SERVICE', FALSE, 'Profesyonel mutfak çalışanı'),
('Kuaför', 'SERVICE', FALSE, 'Saç kesim ve bakım uzmanı'),
('Güzellik Uzmanı', 'SERVICE', FALSE, 'Cilt bakımı ve güzellik hizmetleri'),

-- CREATIVE (Yaratıcı Sektör)
('Grafik Tasarımcı', 'CREATIVE', FALSE, 'Görsel tasarım profesyoneli'),
('İç Mimar', 'CREATIVE', TRUE, 'İç mimarlık diploması sahibi'),
('Mimar', 'CREATIVE', TRUE, 'Mimarlık diploması sahibi'),
('Fotoğrafçı', 'CREATIVE', FALSE, 'Profesyonel fotoğrafçılık hizmeti veren'),

-- BUSINESS (İş Dünyası)
('Muhasebeci', 'BUSINESS', TRUE, 'Muhasebe diploması veya SMMM belgesi sahibi'),
('İnsan Kaynakları Uzmanı', 'BUSINESS', FALSE, 'İK alanında profesyonel çalışan'),
('Pazarlama Uzmanı', 'BUSINESS', FALSE, 'Pazarlama ve satış alanında uzman'),

-- OTHER (Diğer)
('Diğer Meslek', 'OTHER', FALSE, 'Belirli bir meslek kategorisi olmayan kullanıcılar');

-- Create indexes for faster lookups
CREATE INDEX idx_professions_name_trgm ON professions USING gin (name gin_trgm_ops);

-- Add full-text search support (optional, PostgreSQL specific)
ALTER TABLE professions ADD COLUMN search_vector tsvector;

UPDATE professions SET search_vector = 
    to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(description, ''));

CREATE INDEX idx_professions_search ON professions USING gin(search_vector);

-- Trigger to auto-update search vector
CREATE OR REPLACE FUNCTION professions_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector('turkish', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE ON professions
    FOR EACH ROW EXECUTE FUNCTION professions_search_vector_update();

COMMENT ON COLUMN professions.search_vector IS 'Full-text search vector for Turkish language';
