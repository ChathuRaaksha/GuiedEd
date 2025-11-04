-- Add email tracking fields to invites table
ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Create index on invite_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(invite_token);

-- Add daily invite limit tracking table
CREATE TABLE IF NOT EXISTS public.student_invite_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  invite_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invite_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, invite_date)
);

-- Enable Row Level Security
ALTER TABLE public.student_invite_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for student invite limits
CREATE POLICY "Students can view their own invite limits"
ON public.student_invite_limits
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert invite limits"
ON public.student_invite_limits
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update invite limits"
ON public.student_invite_limits
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_invite_limits_updated_at
  BEFORE UPDATE ON public.student_invite_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check daily invite limit
CREATE OR REPLACE FUNCTION check_invite_limit(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(invite_count, 0)
  INTO v_count
  FROM public.student_invite_limits
  WHERE student_id = p_student_id
    AND invite_date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to increment invite count
CREATE OR REPLACE FUNCTION increment_invite_count(p_student_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.student_invite_limits (student_id, invite_date, invite_count)
  VALUES (p_student_id, CURRENT_DATE, 1)
  ON CONFLICT (student_id, invite_date)
  DO UPDATE SET invite_count = student_invite_limits.invite_count + 1;
END;
$$ LANGUAGE plpgsql;
