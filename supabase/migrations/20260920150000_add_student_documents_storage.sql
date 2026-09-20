-- Storage bucket for student identity documents (profile uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  false,
  1048576,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Students can upload own documents" ON storage.objects;
CREATE POLICY "Students can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND auth.role() = 'authenticated'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Students can view own documents" ON storage.objects;
CREATE POLICY "Students can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Students can update own documents" ON storage.objects;
CREATE POLICY "Students can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'student-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Students can delete own documents" ON storage.objects;
CREATE POLICY "Students can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
