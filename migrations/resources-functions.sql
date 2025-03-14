-- Resources-related database functions

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.toggle_upvote(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_related_resources(UUID, INTEGER) CASCADE;

-- Function to toggle upvote status
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

-- Function to get related resources based on tags
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

-- Function to get comments for a resource
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