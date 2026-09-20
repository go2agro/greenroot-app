CREATE TABLE IF NOT EXISTS placement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  forwarded_at TIMESTAMPTZ,
  forwarded_by UUID
);

CREATE INDEX IF NOT EXISTS idx_placement_documents_application_id
  ON placement_documents(application_id);

CREATE INDEX IF NOT EXISTS idx_placement_documents_forwarded_at
  ON placement_documents(application_id, forwarded_at);
