-- Add postcode to all three tables
ALTER TABLE public.students ADD COLUMN postcode TEXT;
ALTER TABLE public.mentors ADD COLUMN postcode TEXT;
ALTER TABLE public.facilitators ADD COLUMN postcode TEXT;

-- Add CV URL to mentors table
ALTER TABLE public.mentors ADD COLUMN cv_url TEXT;

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false);

-- RLS policies for CV bucket
CREATE POLICY "Users can upload their own CV"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own CV"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own CV"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own CV"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow facilitators to view all CVs
CREATE POLICY "Facilitators can view all CVs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' AND 
  has_role(auth.uid(), 'FACILITATOR'::app_role)
);