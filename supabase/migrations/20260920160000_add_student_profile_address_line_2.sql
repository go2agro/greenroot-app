-- Add missing address_line_2 column to student_profiles (exists on admin/partner profiles)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS address_line_2 text;
