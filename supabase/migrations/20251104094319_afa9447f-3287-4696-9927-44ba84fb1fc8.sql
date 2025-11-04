-- Update students table: change grade to education_level
ALTER TABLE public.students 
  DROP COLUMN grade,
  ADD COLUMN education_level TEXT NOT NULL DEFAULT 'high_school';

-- Add education_level and city to mentors table
ALTER TABLE public.mentors 
  ADD COLUMN education_level TEXT,
  ADD COLUMN city TEXT;