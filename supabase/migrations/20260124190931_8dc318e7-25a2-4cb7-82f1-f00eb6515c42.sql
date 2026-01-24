-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_number SERIAL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_media table for images/videos within stories
CREATE TABLE public.story_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage)
CREATE POLICY "Anyone can view roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Stories policies (public read, admin write)
CREATE POLICY "Anyone can view published stories"
  ON public.stories FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert stories"
  ON public.stories FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update stories"
  ON public.stories FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stories"
  ON public.stories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Story media policies
CREATE POLICY "Anyone can view story media"
  ON public.story_media FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage story media"
  ON public.story_media FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Comments policies (logged in users can comment)
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Logged in users can add comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments or admins"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for story media
INSERT INTO storage.buckets (id, name, public) VALUES ('story-media', 'story-media', true);

-- Storage policies for story media
CREATE POLICY "Anyone can view story media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-media');

CREATE POLICY "Admins can upload story media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update story media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'story-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete story media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'story-media' AND public.has_role(auth.uid(), 'admin'));