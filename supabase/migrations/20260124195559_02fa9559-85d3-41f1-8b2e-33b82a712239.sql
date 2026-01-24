-- Create questions table for user-submitted Q&A
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  asked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  asked_by_name TEXT,
  answer TEXT,
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view published (answered) questions
CREATE POLICY "Anyone can view published questions"
ON public.questions FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'));

-- Logged in users can ask questions
CREATE POLICY "Logged in users can ask questions"
ON public.questions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update questions (to answer them)
CREATE POLICY "Admins can update questions"
ON public.questions FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete questions
CREATE POLICY "Admins can delete questions"
ON public.questions FOR DELETE
USING (has_role(auth.uid(), 'admin'));