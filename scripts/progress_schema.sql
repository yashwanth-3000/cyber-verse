-- Progress Tracking Extension for CyberVerse
-- This schema adds user progress tracking for labs

-- ======== LAB PROGRESS TRACKING TABLES ========

-- Table to track user's progress in labs
CREATE TABLE lab_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL, -- e.g., 'beginner-ctf', 'web-security-lab'
  
  -- Progress data
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_percentage SMALLINT NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  
  -- Constraints
  UNIQUE(user_id, lab_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to track detailed step progress for multi-step labs
CREATE TABLE lab_step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_progress_id UUID NOT NULL REFERENCES lab_progress(id) ON DELETE CASCADE,
  
  -- Step data
  step_id TEXT NOT NULL, -- e.g., 'step1', 'injection-challenge'
  step_title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  
  -- Constraints
  UNIQUE(lab_progress_id, step_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to track achievements and badges
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Achievement data
  achievement_id TEXT NOT NULL, -- e.g., 'first-lab-complete', 'web-security-expert'
  achievement_title TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  badge_icon TEXT, -- URL or identifier for badge icon
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, achievement_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to track overall user stats
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall stats
  total_labs_completed INTEGER NOT NULL DEFAULT 0,
  total_steps_completed INTEGER NOT NULL DEFAULT 0,
  total_achievements_earned INTEGER NOT NULL DEFAULT 0,
  total_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  average_completion_time_seconds INTEGER DEFAULT NULL,
  favorite_category TEXT,
  
  -- Specific category stats (JSON for flexibility)
  category_stats JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======== VIEWS ========

-- View for user dashboard summary
CREATE VIEW user_progress_summary AS
SELECT 
  u.id AS user_id,
  u.email,
  p.full_name,
  COUNT(DISTINCT lp.lab_id) FILTER (WHERE lp.status = 'completed') AS completed_labs,
  COUNT(DISTINCT lp.lab_id) FILTER (WHERE lp.status = 'in_progress') AS in_progress_labs,
  COUNT(DISTINCT lp.lab_id) AS total_labs_attempted,
  COALESCE(us.total_achievements_earned, 0) AS achievements_earned,
  COALESCE(MAX(lp.updated_at), NOW()) AS last_active_at
FROM 
  auth.users u
LEFT JOIN
  profiles p ON u.id = p.id
LEFT JOIN
  lab_progress lp ON u.id = lp.user_id
LEFT JOIN
  user_stats us ON u.id = us.user_id
GROUP BY
  u.id, u.email, p.full_name, us.total_achievements_earned;

-- View for each lab's statistics
CREATE VIEW lab_statistics AS
SELECT
  lab_id,
  COUNT(DISTINCT user_id) AS total_users,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'completed') AS users_completed,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'in_progress') AS users_in_progress,
  ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE completed_at IS NOT NULL))::INTEGER AS avg_completion_time_seconds,
  MIN(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE completed_at IS NOT NULL)::INTEGER AS fastest_completion_time_seconds,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE completed_at IS NOT NULL)::INTEGER AS slowest_completion_time_seconds
FROM
  lab_progress
GROUP BY
  lab_id;

-- ======== FUNCTIONS ========

-- Function to update lab completion percentage
CREATE OR REPLACE FUNCTION update_lab_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_steps INTEGER;
  completed_steps INTEGER;
BEGIN
  -- Count total and completed steps
  SELECT 
    COUNT(*), 
    COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO 
    total_steps, 
    completed_steps
  FROM 
    lab_step_progress
  WHERE 
    lab_progress_id = NEW.lab_progress_id;
  
  -- Calculate and update the percentage in lab_progress
  IF total_steps > 0 THEN
    UPDATE lab_progress
    SET 
      completion_percentage = (completed_steps * 100 / total_steps),
      updated_at = NOW(),
      -- If all steps are completed, mark the lab as completed
      status = CASE 
                WHEN completed_steps = total_steps THEN 'completed'
                ELSE status
              END,
      completed_at = CASE 
                      WHEN completed_steps = total_steps AND completed_at IS NULL THEN NOW()
                      ELSE completed_at
                    END
    WHERE id = NEW.lab_progress_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lab completion percentage when a step is updated
CREATE TRIGGER update_lab_completion_after_step_change
AFTER INSERT OR UPDATE OF is_completed ON lab_step_progress
FOR EACH ROW
EXECUTE FUNCTION update_lab_completion_percentage();

-- Function to update user stats when lab is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_lab_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Insert or update user stats
    INSERT INTO user_stats (
      user_id, 
      total_labs_completed,
      total_time_spent_seconds
    )
    VALUES (
      NEW.user_id, 
      1,
      EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      total_labs_completed = user_stats.total_labs_completed + 1,
      total_time_spent_seconds = user_stats.total_time_spent_seconds + 
        EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER,
      average_completion_time_seconds = (
        (user_stats.total_time_spent_seconds + 
         EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER) / 
        (user_stats.total_labs_completed + 1)
      ),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a lab is completed
CREATE TRIGGER update_user_stats_after_lab_completion
AFTER UPDATE OF status ON lab_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_lab_completion();

-- ======== RLS POLICIES ========

-- Enable RLS on all tables
ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_progress
CREATE POLICY "Users can view their own progress"
ON lab_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON lab_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON lab_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for lab_step_progress
CREATE POLICY "Users can view their own step progress"
ON lab_step_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM lab_progress lp 
  WHERE lp.id = lab_progress_id AND lp.user_id = auth.uid()
));

CREATE POLICY "Users can create their own step progress"
ON lab_step_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM lab_progress lp 
  WHERE lp.id = lab_progress_id AND lp.user_id = auth.uid()
));

CREATE POLICY "Users can update their own step progress"
ON lab_step_progress FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM lab_progress lp 
  WHERE lp.id = lab_progress_id AND lp.user_id = auth.uid()
));

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON user_achievements FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for user_stats
CREATE POLICY "Users can view their own stats"
ON user_stats FOR SELECT
USING (auth.uid() = user_id);

-- ======== INDICES ========

-- Indices for faster querying
CREATE INDEX lab_progress_user_id_idx ON lab_progress(user_id);
CREATE INDEX lab_progress_lab_id_idx ON lab_progress(lab_id);
CREATE INDEX lab_progress_status_idx ON lab_progress(status);
CREATE INDEX lab_step_progress_lab_progress_id_idx ON lab_step_progress(lab_progress_id);
CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id); 