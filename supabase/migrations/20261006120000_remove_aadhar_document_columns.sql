-- Students only need Aadhaar number; front/back document uploads are no longer collected.
ALTER TABLE public.student_profiles
  DROP COLUMN IF EXISTS aadhar_front_url,
  DROP COLUMN IF EXISTS aadhar_back_url;
