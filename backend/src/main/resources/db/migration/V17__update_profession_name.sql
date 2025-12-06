-- Update 'Genel Kullanıcı' to 'Diğer Meslek'
-- Reason: UI/UX improvement - more professional naming

UPDATE professions 
SET name = 'Diğer Meslek' 
WHERE name = 'Genel Kullanıcı' AND category = 'OTHER';

COMMENT ON TABLE professions IS 'Updated profession name from Genel Kullanıcı to Diğer Meslek for better UX';
