-- Allow DOC and DOCX values in application_answers.file_type
ALTER TABLE public.application_answers
  DROP CONSTRAINT IF EXISTS application_answers_file_type_check;

ALTER TABLE public.application_answers
  ADD CONSTRAINT application_answers_file_type_check
  CHECK (file_type = ANY (ARRAY['pdf'::text, 'image'::text, 'doc'::text, 'docx'::text]));
