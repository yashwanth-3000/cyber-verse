-- Apply all migrations in the correct order

-- 1. First, drop any functions that might depend on views/tables
DROP FUNCTION IF EXISTS public.toggle_upvote(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_related_resources(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_resource_comments(UUID) CASCADE;

-- 2. Drop tables and views with CASCADE to remove any dependencies
DROP VIEW IF EXISTS resources_with_stats CASCADE;
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- 3. Create the resources table
CREATE TABLE IF NOT EXISTS public.resources (
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

-- 4. Create the tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create the resource-tags association table
CREATE TABLE IF NOT EXISTS public.resource_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_resource_tag UNIQUE (resource_id, tag_id)
);

-- 6. Create the upvotes table
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_resource_upvote UNIQUE (resource_id, user_id)
);

-- 7. Create the comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_resources_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add triggers to update the updated_at column
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE PROCEDURE public.update_resources_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.update_resources_updated_at_column();

-- 10. Create indexes for performance
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_published ON public.resources(published);
CREATE INDEX idx_resources_featured ON public.resources(featured);
CREATE INDEX idx_resource_tags_resource_id ON public.resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag_id ON public.resource_tags(tag_id);
CREATE INDEX idx_upvotes_resource_id ON public.upvotes(resource_id);
CREATE INDEX idx_upvotes_user_id ON public.upvotes(user_id);
CREATE INDEX idx_comments_resource_id ON public.comments(resource_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- 11. Create the resources_with_stats view
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

-- 12. Create the toggle_upvote function
CREATE OR REPLACE FUNCTION public.toggle_upvote(resource_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  upvote_exists BOOLEAN;
BEGIN
  -- Check if the upvote already exists
  SELECT EXISTS(
    SELECT 1 
    FROM public.upvotes 
    WHERE resource_id = resource_id_param AND user_id = user_id_param
  ) INTO upvote_exists;
  
  -- If upvote exists, remove it
  IF upvote_exists THEN
    DELETE FROM public.upvotes
    WHERE resource_id = resource_id_param AND user_id = user_id_param;
    RETURN FALSE;
  -- If upvote doesn't exist, add it
  ELSE
    INSERT INTO public.upvotes(resource_id, user_id)
    VALUES (resource_id_param, user_id_param);
    RETURN TRUE;
  END IF;
END;
$$;

-- 13. Create the get_related_resources function
CREATE OR REPLACE FUNCTION public.get_related_resources(resource_id_param UUID, limit_param INTEGER DEFAULT 3)
RETURNS SETOF public.resources_with_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT rws.*
  FROM public.resources_with_stats rws
  JOIN public.resource_tags rt1 ON rws.id = rt1.resource_id
  JOIN public.resource_tags rt2 ON rt1.tag_id = rt2.tag_id AND rt2.resource_id = resource_id_param
  WHERE rws.id != resource_id_param
  ORDER BY rws.upvotes_count DESC, rws.created_at DESC
  LIMIT limit_param;
END;
$$;

-- 14. Create the get_resource_comments function
CREATE OR REPLACE FUNCTION public.get_resource_comments(resource_id_param UUID)
RETURNS TABLE(
  id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.created_at,
    p.full_name AS author_name,
    p.avatar_url AS author_avatar
  FROM 
    public.comments c
  JOIN 
    public.profiles p ON c.user_id = p.id
  WHERE 
    c.resource_id = resource_id_param
  ORDER BY 
    c.created_at DESC;
END;
$$; 