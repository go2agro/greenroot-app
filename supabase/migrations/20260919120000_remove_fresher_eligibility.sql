-- Remove fresher ineligibility statements from internship eligibility lists.
UPDATE internships
SET eligibility_requirements = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements_text(eligibility_requirements::jsonb) AS elem
  WHERE elem !~* 'fresher\s+candidates?\s+are\s+not\s+eligible'
)
WHERE eligibility_requirements::text ~* 'fresher\s+candidates?\s+are\s+not\s+eligible';
