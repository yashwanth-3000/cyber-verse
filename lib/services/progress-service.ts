import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for progress tracking
export interface UserProgressSummary {
  total_labs: number;
  completed_labs: number;
  in_progress_labs: number;
  completion_percentage: number;
  last_activity_at: string;
  earned_points: number;
}

export interface LabProgress {
  id: string;
  user_id: string;
  lab_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string;
  updated_at: string;
  completed_at: string | null;
  completion_percentage: number;
  total_steps: number;
  completed_steps: number;
  is_completed: boolean;
}

export interface LabStepProgress {
  id: string;
  user_id: string;
  lab_id: string;
  step_id: string;
  step_title: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export class ProgressClient {
  // Get user progress summary
  static async getUserProgressSummary(): Promise<UserProgressSummary | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Get progress summary from the database
      const { data, error } = await supabase
        .from('user_progress_summary')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      // If no summary exists, create a default one
      if (!data) {
        return {
          total_labs: 0,
          completed_labs: 0,
          in_progress_labs: 0,
          completion_percentage: 0,
          last_activity_at: new Date().toISOString(),
          earned_points: 0
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user progress summary:', error);
      return null;
    }
  }
  
  // Get all lab progress for a user
  static async getAllLabsProgress(): Promise<LabProgress[]> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get all labs progress
      const { data, error } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting all labs progress:', error);
      return [];
    }
  }
  
  // Get progress for a specific lab
  static async getLabProgress(labId: string): Promise<LabProgress | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Get lab progress
      const { data, error } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows returned' error
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error('Error getting lab progress:', error);
      return null;
    }
  }
  
  // Start a lab (create progress entry)
  static async startLab(labId: string): Promise<LabProgress | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Check if progress already exists
      const existingProgress = await this.getLabProgress(labId);
      if (existingProgress) return existingProgress;
      
      // Create new progress entry
      const now = new Date().toISOString();
      const newProgress = {
        user_id: user.id,
        lab_id: labId,
        status: 'in_progress',
        started_at: now,
        updated_at: now,
        completed_at: null,
        completion_percentage: 0,
        total_steps: 0, // Will be updated when steps are loaded
        completed_steps: 0,
        is_completed: false
      };
      
      const { data, error } = await supabase
        .from('lab_progress')
        .insert([newProgress])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user progress summary
      await this.updateUserProgressSummary();
      
      return data;
    } catch (error) {
      console.error('Error starting lab:', error);
      return null;
    }
  }
  
  // Complete a lab
  static async completeLab(labId: string): Promise<LabProgress | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Update lab progress
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('lab_progress')
        .update({
          status: 'completed',
          completed_at: now,
          updated_at: now,
          completion_percentage: 100,
          is_completed: true
        })
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user progress summary
      await this.updateUserProgressSummary();
      
      return data;
    } catch (error) {
      console.error('Error completing lab:', error);
      return null;
    }
  }
  
  // Get step progress for a lab
  static async getLabStepProgress(labId: string): Promise<LabStepProgress[]> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get step progress
      const { data, error } = await supabase
        .from('lab_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting step progress:', error);
      return [];
    }
  }
  
  // Update step progress
  static async updateStepProgress(
    labId: string,
    stepId: string,
    stepTitle: string,
    isCompleted: boolean
  ): Promise<LabStepProgress | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const now = new Date().toISOString();
      
      // Check if step progress exists
      const { data: existingStep, error: checkError } = await supabase
        .from('lab_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .eq('step_id', stepId)
        .single();
      
      let result;
      
      if (!existingStep) {
        // Create new step progress
        const newStep = {
          user_id: user.id,
          lab_id: labId,
          step_id: stepId,
          step_title: stepTitle,
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null
        };
        
        const { data, error } = await supabase
          .from('lab_step_progress')
          .insert([newStep])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Update existing step progress
        const { data, error } = await supabase
          .from('lab_step_progress')
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? now : null
          })
          .eq('id', existingStep.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      // Update lab progress
      await this.updateLabProgress(labId);
      
      return result;
    } catch (error) {
      console.error('Error updating step progress:', error);
      return null;
    }
  }
  
  // Update lab progress based on completed steps
  private static async updateLabProgress(labId: string): Promise<void> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get all steps for this lab
      const { data: steps, error: stepsError } = await supabase
        .from('lab_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId);
      
      if (stepsError) throw stepsError;
      
      if (!steps || steps.length === 0) return;
      
      // Calculate progress
      const totalSteps = steps.length;
      const completedSteps = steps.filter(step => step.is_completed).length;
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      const isCompleted = completionPercentage === 100;
      
      // Update lab progress
      const now = new Date().toISOString();
      const updates = {
        updated_at: now,
        total_steps: totalSteps,
        completed_steps: completedSteps,
        completion_percentage: completionPercentage,
        status: isCompleted ? 'completed' : 'in_progress',
        is_completed: isCompleted
      };
      
      // If lab is completed and wasn't before, set completed_at
      if (isCompleted) {
        const { data: currentProgress } = await supabase
          .from('lab_progress')
          .select('is_completed')
          .eq('user_id', user.id)
          .eq('lab_id', labId)
          .single();
        
        if (currentProgress && !currentProgress.is_completed) {
          Object.assign(updates, { completed_at: now });
        }
      }
      
      const { error: updateError } = await supabase
        .from('lab_progress')
        .update(updates)
        .eq('user_id', user.id)
        .eq('lab_id', labId);
      
      if (updateError) throw updateError;
      
      // Update user progress summary
      await this.updateUserProgressSummary();
    } catch (error) {
      console.error('Error updating lab progress:', error);
    }
  }
  
  // Update user progress summary
  private static async updateUserProgressSummary(): Promise<void> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get all labs progress
      const { data: labsProgress, error: progressError } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (progressError) throw progressError;
      
      if (!labsProgress || labsProgress.length === 0) return;
      
      // Calculate summary
      const totalLabs = labsProgress.length;
      const completedLabs = labsProgress.filter(lab => lab.is_completed).length;
      const inProgressLabs = labsProgress.filter(lab => !lab.is_completed && lab.completion_percentage > 0).length;
      const completionPercentage = Math.round((completedLabs / totalLabs) * 100);
      const now = new Date().toISOString();
      
      // Get existing summary or create new
      const { data: existingSummary, error: summaryError } = await supabase
        .from('user_progress_summary')
        .select('id, earned_points')
        .eq('user_id', user.id)
        .single();
      
      if (summaryError && summaryError.code !== 'PGRST116') {
        throw summaryError;
      }
      
      const earnedPoints = existingSummary?.earned_points || 0;
      
      if (!existingSummary) {
        // Create new summary
        const newSummary = {
          user_id: user.id,
          total_labs: totalLabs,
          completed_labs: completedLabs,
          in_progress_labs: inProgressLabs,
          completion_percentage: completionPercentage,
          last_activity_at: now,
          earned_points: earnedPoints
        };
        
        const { error: insertError } = await supabase
          .from('user_progress_summary')
          .insert([newSummary]);
        
        if (insertError) throw insertError;
      } else {
        // Update existing summary
        const { error: updateError } = await supabase
          .from('user_progress_summary')
          .update({
            total_labs: totalLabs,
            completed_labs: completedLabs,
            in_progress_labs: inProgressLabs,
            completion_percentage: completionPercentage,
            last_activity_at: now
          })
          .eq('id', existingSummary.id);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating user progress summary:', error);
    }
  }
  
  // Get user achievements
  static async getUserAchievements(): Promise<Achievement[]> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get user achievements
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }
  
  // Award an achievement
  static async awardAchievement(name: string, description: string, icon: string): Promise<Achievement | null> {
    try {
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Check if achievement already exists
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', name)
        .single();
      
      if (existingAchievement) return existingAchievement;
      
      // Create new achievement
      const now = new Date().toISOString();
      const newAchievement = {
        user_id: user.id,
        name,
        description,
        icon,
        earned_at: now
      };
      
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([newAchievement])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }
} 