-- Add cv_data JSONB column to mentors table to store structured CV information
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS cv_data JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the expected structure
COMMENT ON COLUMN public.mentors.cv_data IS 'Structured CV data in JSON format containing: work_experience (array of {company, role, years, description}), education (array of {institution, degree, field, year}), certifications (array of {name, issuer, year}), achievements (array of strings), projects (array of {name, description, year})';

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_mentors_cv_data ON public.mentors USING gin (cv_data);