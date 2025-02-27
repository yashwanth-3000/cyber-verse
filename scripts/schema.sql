-- CAUTION: This script will drop all existing tables in the public schema
-- Make sure you have backups if needed before running this

-- First, disable triggers to avoid foreign key constraint issues during drops
SET session_replication_role = 'replica';

-- Drop all existing tables, views, and functions in the public schema
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all views
    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argTypes FROM pg_proc WHERE pronamespace = 'public'::regnamespace)
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argTypes || ') CASCADE';
    END LOOP;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create tables with proper relationships
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    published BOOLEAN DEFAULT true NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE resource_tags (
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (resource_id, tag_id)
);

CREATE TABLE upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (resource_id, user_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_published ON resources(published);
CREATE INDEX idx_resources_featured ON resources(featured);
CREATE INDEX idx_resource_tags_resource_id ON resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag_id ON resource_tags(tag_id);
CREATE INDEX idx_upvotes_resource_id ON upvotes(resource_id);
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX idx_comments_resource_id ON comments(resource_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Create GIN indexes for text search
CREATE INDEX idx_resources_title_trgm ON resources USING GIN (title gin_trgm_ops);
CREATE INDEX idx_resources_description_trgm ON resources USING GIN (description gin_trgm_ops);
CREATE INDEX idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);

-- Create views for easier querying
CREATE VIEW resources_with_stats AS
SELECT 
    r.*,
    p.full_name as author_name,
    p.avatar_url as author_avatar,
    COUNT(DISTINCT u.id) as upvotes_count,
    COUNT(DISTINCT c.id) as comments_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
FROM resources r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN upvotes u ON r.id = u.resource_id
LEFT JOIN comments c ON r.id = c.resource_id
LEFT JOIN resource_tags rt ON r.id = rt.resource_id
LEFT JOIN tags t ON rt.tag_id = t.id
WHERE r.published = true
GROUP BY r.id, p.full_name, p.avatar_url;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION toggle_upvote(
    resource_id_param UUID,
    user_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
    upvote_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM upvotes 
        WHERE resource_id = resource_id_param AND user_id = user_id_param
    ) INTO upvote_exists;
    
    IF upvote_exists THEN
        DELETE FROM upvotes 
        WHERE resource_id = resource_id_param AND user_id = user_id_param;
        RETURN FALSE;
    ELSE
        INSERT INTO upvotes (resource_id, user_id)
        VALUES (resource_id_param, user_id_param);
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get related resources
CREATE OR REPLACE FUNCTION get_related_resources(resource_id_param UUID, limit_param INTEGER DEFAULT 5)
RETURNS SETOF resources_with_stats AS $$
BEGIN
    RETURN QUERY
    WITH resource_tags AS (
        SELECT tag_id FROM resource_tags WHERE resource_id = resource_id_param
    )
    SELECT DISTINCT rs.*
    FROM resources_with_stats rs
    JOIN resource_tags rt ON rs.id IN (
        SELECT resource_id FROM resource_tags 
        WHERE tag_id IN (SELECT tag_id FROM resource_tags)
    )
    WHERE rs.id != resource_id_param
    ORDER BY (
        SELECT COUNT(*) FROM resource_tags rt2 
        WHERE rt2.resource_id = rs.id AND rt2.tag_id IN (SELECT tag_id FROM resource_tags)
    ) DESC, rs.upvotes_count DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_timestamp
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_comments_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Create policies for resources
CREATE POLICY "Published resources are viewable by everyone"
ON resources FOR SELECT
USING (published = true);

CREATE POLICY "Users can view their own unpublished resources"
ON resources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resources"
ON resources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
ON resources FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
ON resources FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for tags
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create policies for resource_tags
CREATE POLICY "Resource tags are viewable by everyone"
ON resource_tags FOR SELECT
USING (true);

CREATE POLICY "Users can tag their own resources"
ON resource_tags FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM resources WHERE id = resource_id
    )
);

CREATE POLICY "Users can remove tags from their own resources"
ON resource_tags FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id FROM resources WHERE id = resource_id
    )
);

-- Create policies for upvotes
CREATE POLICY "Upvotes are viewable by everyone"
ON upvotes FOR SELECT
USING (true);

CREATE POLICY "Users can upvote resources"
ON upvotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes"
ON upvotes FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id); 