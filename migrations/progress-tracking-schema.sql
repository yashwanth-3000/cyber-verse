-- Progress Tracking Schema for CyberVerse
-- This schema creates tables to track user progress through the platform

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-key-here';

-- First, drop any existing objects to avoid conflicts
DROP VIEW IF EXISTS user_progress_view;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS lab_step_progress CASCADE;
DROP TABLE IF EXISTS lab_progress CASCADE;
DROP TABLE IF EXISTS user_progress_summary CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- User Progress Summary Table
CREATE TABLE public.user_progress_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_labs INTEGER NOT NULL DEFAULT 0,
  completed_labs INTEGER NOT NULL DEFAULT 0,
  in_progress_labs INTEGER NOT NULL DEFAULT 0,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  earned_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_progress_summary UNIQUE (user_id)
);

-- Lab Progress Table
CREATE TABLE public.lab_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_lab UNIQUE (user_id, lab_id)
);

-- Lab Step Progress Table
CREATE TABLE public.lab_step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_lab_step UNIQUE (user_id, lab_id, step_id)
);

-- User Achievements Table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, name)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column
CREATE TRIGGER update_user_progress_summary_updated_at
BEFORE UPDATE ON public.user_progress_summary
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_lab_progress_updated_at
BEFORE UPDATE ON public.lab_progress
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_lab_step_progress_updated_at
BEFORE UPDATE ON public.lab_step_progress
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_lab_progress_user_id ON public.lab_progress(user_id);
CREATE INDEX idx_lab_progress_lab_id ON public.lab_progress(lab_id);
CREATE INDEX idx_lab_progress_status ON public.lab_progress(status);
CREATE INDEX idx_lab_step_progress_user_id ON public.lab_step_progress(user_id);
CREATE INDEX idx_lab_step_progress_lab_id ON public.lab_step_progress(lab_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Create view for user progress dashboard
CREATE OR REPLACE VIEW public.user_progress_view AS
SELECT 
  u.id AS user_id,
  u.email,
  COALESCE(ps.completed_labs, 0) AS completed_labs,
  COALESCE(ps.in_progress_labs, 0) AS in_progress_labs,
  COALESCE(ps.total_labs, 0) AS total_labs,
  COALESCE(ps.completion_percentage, 0) AS completion_percentage,
  COALESCE(ps.earned_points, 0) AS earned_points,
  COALESCE(ps.last_activity_at, u.created_at) AS last_activity,
  (SELECT COUNT(*) FROM public.user_achievements a WHERE a.user_id = u.id) AS achievements_count,
  u.created_at AS joined_at
FROM 
  auth.users u
LEFT JOIN 
  public.user_progress_summary ps ON u.id = ps.user_id;

-- Now set up RLS after all tables are successfully created
-- Enable RLS on tables
ALTER TABLE public.lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress_summary ENABLE ROW LEVEL SECURITY;

-- Lab Progress Policies
CREATE POLICY lab_progress_select ON public.lab_progress 
  FOR SELECT USING (auth.uid() = public.lab_progress.user_id);

CREATE POLICY lab_progress_insert ON public.lab_progress 
  FOR INSERT WITH CHECK (auth.uid() = public.lab_progress.user_id);

CREATE POLICY lab_progress_update ON public.lab_progress 
  FOR UPDATE USING (auth.uid() = public.lab_progress.user_id);

-- Lab Step Progress Policies
CREATE POLICY lab_step_progress_select ON public.lab_step_progress 
  FOR SELECT USING (auth.uid() = public.lab_step_progress.user_id);

CREATE POLICY lab_step_progress_insert ON public.lab_step_progress 
  FOR INSERT WITH CHECK (auth.uid() = public.lab_step_progress.user_id);

CREATE POLICY lab_step_progress_update ON public.lab_step_progress 
  FOR UPDATE USING (auth.uid() = public.lab_step_progress.user_id);

-- User Achievements Policies
CREATE POLICY user_achievements_select ON public.user_achievements 
  FOR SELECT USING (auth.uid() = public.user_achievements.user_id);

CREATE POLICY user_achievements_insert ON public.user_achievements 
  FOR INSERT WITH CHECK (auth.uid() = public.user_achievements.user_id);

-- User Progress Summary Policies
CREATE POLICY user_progress_summary_select ON public.user_progress_summary 
  FOR SELECT USING (auth.uid() = public.user_progress_summary.user_id);

CREATE POLICY user_progress_summary_insert ON public.user_progress_summary 
  FOR INSERT WITH CHECK (auth.uid() = public.user_progress_summary.user_id);

CREATE POLICY user_progress_summary_update ON public.user_progress_summary 
  FOR UPDATE USING (auth.uid() = public.user_progress_summary.user_id); 