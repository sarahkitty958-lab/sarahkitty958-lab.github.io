-- Create table for editable site content
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view content
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
USING (true);

-- Only admins can update content
CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert content
CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete content
CREATE POLICY "Admins can delete site content"
ON public.site_content
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default content for all sections
INSERT INTO public.site_content (section_key, content) VALUES
('hero', '{"badge": "Fun Stories & Cooking Kits", "title_line1": "Welcome to", "title_line2": "Stuffed Adventures", "description": "Discover heartwarming tales of cuddly companions and bring their adventures to life with our magical cooking kits!", "button_stories": "📚 Read Stories", "button_shop": "🎨 Shop Kits"}'),
('stories_section', '{"emoji": "📖", "title": "Our Stories", "description": "Dive into magical worlds where stuffed animals come alive with friendship, courage, and adventure."}'),
('shop_section', '{"emoji": "🎨", "title": "Cooking Kits", "description": "Bring the adventure home with our delightful cooking kits inspired by our stories."}'),
('faq_section', '{"emoji": "❓", "title": "Questions & Answers", "description": "Got questions? We''ve got answers! Here''s everything you need to know."}'),
('about_section', '{"emoji": "💝", "title": "About Stuffed Adventures", "description": "Where imagination meets creation, and every stuffed friend has a story to tell.", "mission_title": "Our Mission", "mission_text": "At Stuffed Adventures, we believe every child deserves magical stories that inspire wonder and creativity. We''re on a mission to bring families closer together through storytelling and the joy of making something beautiful with your own hands. Each stuffed friend you create becomes a companion for adventures yet to come.", "card1_title": "Made with Love", "card1_text": "Every story and kit is crafted with care and attention to detail, designed to spark joy and creativity.", "card2_title": "Inspiring Creativity", "card2_text": "Our kits encourage hands-on creativity, helping children (and adults!) bring their favorite characters to life.", "card3_title": "Family Bonding", "card3_text": "Reading together and crafting creates precious memories. These adventures are made to be shared."}'),
('footer', '{"brand_name": "Stuffed Adventures", "tagline": "Made with ❤️ for little dreamers", "copyright": "© {year} Stuffed Adventures. All rights reserved."}')