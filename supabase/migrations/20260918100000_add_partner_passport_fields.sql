-- Add passport fields to partner_profiles
ALTER TABLE partner_profiles
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS passport_url text,
  ADD COLUMN IF NOT EXISTS passport_photo_url text;

-- Create storage bucket for partner identity documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Partners can upload their own documents
CREATE POLICY "Partners can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-documents'
  AND auth.role() = 'authenticated'
);

-- Partners can view their own documents
CREATE POLICY "Partners can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partner-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Partners can update their own documents (needed for upsert uploads)
CREATE POLICY "Partners can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'partner-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Partners can delete their own documents
CREATE POLICY "Partners can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
