-- Add phone_number column to attendance_records
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS phone_number text;
