
-- Add instansi column to attendance_records (nullable for backward compatibility)
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS instansi text;

-- Update activities type constraint to allow 'tudung_sipulung'
-- (DROP + ADD to replace the old CHECK constraint)
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('kajian', 'pengajian', 'shalat', 'acara', 'sosial', 'reservasi', 'rapat', 'daurah', 'lainnya', 'tudung_sipulung'));
