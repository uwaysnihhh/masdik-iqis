-- Create pustaka table for digital library
CREATE TABLE public.pustaka (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'document', -- document, video, audio
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.pustaka ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active pustaka items
CREATE POLICY "Pustaka viewable by everyone"
ON public.pustaka
FOR SELECT
USING (is_active = true);

-- Allow admins to insert
CREATE POLICY "Admins can insert pustaka"
ON public.pustaka
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update
CREATE POLICY "Admins can update pustaka"
ON public.pustaka
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete
CREATE POLICY "Admins can delete pustaka"
ON public.pustaka
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_pustaka_updated_at
BEFORE UPDATE ON public.pustaka
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();