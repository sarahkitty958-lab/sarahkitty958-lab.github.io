-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_zip TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create character_avatars table for admin-managed profile pictures
CREATE TABLE public.character_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.character_avatars ENABLE ROW LEVEL SECURITY;

-- Anyone can view character avatars
CREATE POLICY "Anyone can view character avatars"
ON public.character_avatars
FOR SELECT
USING (true);

-- Only admins can manage character avatars
CREATE POLICY "Admins can manage character avatars"
ON public.character_avatars
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile pictures"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile pictures"
ON storage.objects
FOR DELETE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);