-- Resources Schema for CyberVerse
-- This schema creates tables for resources and upvotes

-- First, drop any existing objects to avoid conflicts
DROP VIEW IF EXISTS resources_with_stats CASCADE;
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS comments CASCADE;

-- Resources Table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tags Table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resource Tags Table
CREATE TABLE public.resource_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_resource_tag UNIQUE (resource_id, tag_id)
);

-- Upvotes Table
CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_resource_upvote UNIQUE (resource_id, user_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_resources_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update the updated_at column
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE PROCEDURE public.update_resources_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_published ON public.resources(published);
CREATE INDEX idx_resources_featured ON public.resources(featured);
CREATE INDEX idx_resource_tags_resource_id ON public.resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag_id ON public.resource_tags(tag_id);
CREATE INDEX idx_upvotes_resource_id ON public.upvotes(resource_id);
CREATE INDEX idx_upvotes_user_id ON public.upvotes(user_id);

-- Create a view for resources with stats
CREATE OR REPLACE VIEW public.resources_with_stats AS
SELECT 
  r.id,
  r.title,
  r.description,
  r.url,
  r.image_url,
  r.user_id,
  r.published,
  r.featured,
  r.created_at,
  r.updated_at,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  COUNT(DISTINCT u.id) AS upvotes_count,
  (SELECT COUNT(*) FROM public.comments c WHERE c.resource_id = r.id) AS comments_count,
  ARRAY(
    SELECT t.name 
    FROM public.tags t 
    JOIN public.resource_tags rt ON t.id = rt.tag_id 
    WHERE rt.resource_id = r.id
  ) AS tags
FROM 
  public.resources r
LEFT JOIN 
  public.profiles p ON r.user_id = p.id
LEFT JOIN 
  public.upvotes u ON r.id = u.resource_id
WHERE 
  r.published = true
GROUP BY 
  r.id, p.id;

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to update the updated_at column for comments
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.update_resources_updated_at_column();

-- Create indexes for comments
CREATE INDEX idx_comments_resource_id ON public.comments(resource_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id); 