-- Drop the old field_mappings table as we are moving to a JSONB approach
DROP TABLE IF EXISTS field_mappings;

-- Update form_templates to use the new JSONB structure
ALTER TABLE form_templates 
ADD COLUMN site VARCHAR(255) UNIQUE,
ADD COLUMN field_mappings JSONB DEFAULT '{}'::jsonb;

-- Drop the old name/url_pattern if we are fully replacing, or just keep them
-- Let's keep name and url_pattern but make sure site is used as the primary identifier
-- for template matching.

-- Insert the Teletalk example seed data
INSERT INTO form_templates (name, site, url_pattern, field_mappings)
VALUES (
  'Teletalk Standard', 
  'teletalk', 
  '*.teletalk.com.bd/*',
  '{
    "fatherName": "personal_info.father_name",
    "motherName": "personal_info.mother_name",
    "applicantName": "personal_info.full_name",
    "dob": "personal_info.date_of_birth",
    "nid": "personal_info.nid",
    "passport": "personal_info.passport_number"
  }'::jsonb
) ON CONFLICT (site) DO UPDATE SET field_mappings = EXCLUDED.field_mappings;
