-- Resume/CV uploaded from student profile identity documents section
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS resume_url text;
