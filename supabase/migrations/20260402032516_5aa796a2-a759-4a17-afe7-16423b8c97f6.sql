
-- Add columns to activities for kajian/daurah
ALTER TABLE activities ADD COLUMN IF NOT EXISTS speaker_name text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS total_sessions integer;

-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  session_number integer,
  session_label text,
  qr_token text UNIQUE NOT NULL,
  scan_type text NOT NULL DEFAULT 'arrival',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  feedback text NOT NULL,
  device_fingerprint text NOT NULL,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

-- Unique constraint to prevent duplicate submissions from same device per session
ALTER TABLE attendance_records ADD CONSTRAINT unique_session_device UNIQUE (session_id, device_fingerprint);

-- RLS for attendance_sessions
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions viewable by everyone" ON attendance_sessions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert sessions" ON attendance_sessions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sessions" ON attendance_sessions FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sessions" ON attendance_sessions FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- RLS for attendance_records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Records viewable by admins" ON attendance_records FOR SELECT TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert records" ON attendance_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can delete records" ON attendance_records FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));
