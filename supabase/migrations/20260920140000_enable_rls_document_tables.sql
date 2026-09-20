-- Secure placement_documents and admin_application_documents with RLS.
-- Server actions use the service role and bypass RLS; these policies block direct API access.

ALTER TABLE placement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage placement documents"
ON placement_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.status = 'accepted'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.status = 'accepted'
  )
);

CREATE POLICY "Partners view own placement documents"
ON placement_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'partner'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.partner_id = auth.uid()
      AND a.status = 'accepted'
  )
);

CREATE POLICY "Partners insert own placement documents"
ON placement_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'partner'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.partner_id = auth.uid()
      AND a.status = 'accepted'
  )
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Partners delete own placement documents"
ON placement_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'partner'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.partner_id = auth.uid()
      AND a.status = 'accepted'
  )
);

CREATE POLICY "Students view forwarded placement documents"
ON placement_documents
FOR SELECT
TO authenticated
USING (
  forwarded_at IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = placement_documents.application_id
      AND a.student_id = auth.uid()
      AND a.status = 'accepted'
  )
);

ALTER TABLE admin_application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage admin application documents"
ON admin_application_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = admin_application_documents.application_id
      AND a.status = 'accepted'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = admin_application_documents.application_id
      AND a.status = 'accepted'
  )
);

CREATE POLICY "Partners view admin application documents"
ON admin_application_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'partner'
  )
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = admin_application_documents.application_id
      AND a.partner_id = auth.uid()
      AND a.status = 'accepted'
  )
);

CREATE POLICY "Students view admin application documents"
ON admin_application_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = admin_application_documents.application_id
      AND a.student_id = auth.uid()
      AND a.status = 'accepted'
  )
);
