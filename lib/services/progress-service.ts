import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Initialize Supabase client - handles both server and browser environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Function to get the appropriate Supabase client based on environment
const getSupabaseClient = () => {
  // In browser environments, use the browser client to ensure consistent auth
  if (typeof window !== 'undefined') {
    return createSupabaseBrowserClient();
  }
  
  // In server environments, use a direct client
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

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
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot get user progress summary");
        return null;
      }
      
      console.log("Authenticated user for summary:", user.id);
      
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
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot get all labs progress");
        return [];
      }
      
      console.log("Authenticated user for all labs:", user.id);
      
      // Get all labs progress
      const { data, error } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const labsWithSteps = await Promise.all((data || []).map(async (lab: LabProgress) => {
        // Get steps for each lab
        const { data: steps, error: stepError } = await supabase
          .from('lab_step_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lab_id', lab.lab_id)
          .order('id');
        
        if (stepError) {
          console.error(`Error getting steps for lab ${lab.lab_id}:`, stepError);
          return lab;
        }
        
        // Add steps to the lab object
        return {
          ...lab,
          steps: steps || []
        };
      }));
      
      return labsWithSteps || [];
    } catch (error) {
      console.error('Error getting all labs progress:', error);
      return [];
    }
  }
  
  // Get progress for a specific lab
  static async getLabProgress(labId: string): Promise<LabProgress | null> {
    try {
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot get lab progress");
        return null;
      }
      
      console.log("Authenticated user for lab progress:", user.id);
      
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
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot start lab");
        return null;
      }
      
      console.log("Authenticated user for starting lab:", user.id);
      
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
      console.log(`===== COMPLETING LAB =====`);
      console.log(`Lab ID: ${labId}`);
      
      const supabase = getSupabaseClient();
      
      // Verify parameter
      if (!labId) {
        console.error("Invalid lab ID for completeLab");
        return null;
      }
      
      // Ensure user is logged in
      const authResponse = await supabase.auth.getUser();
      if (!authResponse.data?.user) {
        console.error("User not logged in - cannot complete lab");
        return null;
      }
      
      const user = authResponse.data.user;
      console.log(`Authenticated User ID: ${user.id}`);
      
      // First get the current lab progress
      const { data, error } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .single();
      
      if (error) {
        console.error("Error getting lab progress:", error);
        return null;
      }
      
      // Check if the lab is already completed to prevent duplicate updates
      if (data && data.is_completed) {
        console.log(`Lab ${labId} is already completed, skipping update`);
        return data;
      }
      
      if (!data) {
        console.error(`No lab progress found for lab ${labId}`);
        const newProgress = await this.startLab(labId);
        if (!newProgress) {
          console.error("Failed to create new lab progress");
          return null;
        }
        console.log(`Created new lab progress: ${newProgress.id}`);
      }
      
      // Get all steps for this lab
      const stepProgress = await this.getLabStepProgress(labId);
      console.log(`Found ${stepProgress.length} steps for lab ${labId}`);
      
      if (stepProgress.length === 0) {
        console.error("No steps found for lab, cannot calculate completion");
        return null;
      }
      
      // Calculate completion
      const totalSteps = stepProgress.length;
      const completedSteps = stepProgress.filter((step: LabStepProgress) => step.is_completed).length;
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      
      console.log(`Completion calculation: ${completedSteps}/${totalSteps} steps completed (${completionPercentage}%)`);
      
      // Update lab progress as completed
      const now = new Date().toISOString();
      const updates = {
        status: 'completed',
        is_completed: true,
        completed_at: now,
        updated_at: now,
        completion_percentage: completionPercentage,
        total_steps: totalSteps,
        completed_steps: completedSteps
      };
      
      console.log(`Updating lab progress with completion status`);
      
      // Update the lab progress
      const { data: updatedData, error: updateError } = await supabase
        .from('lab_progress')
        .update(updates)
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .select();
      
      if (updateError) {
        console.error("Error updating lab progress:", updateError);
        console.error("Error details:", updateError.details, updateError.hint, updateError.code);
        return null;
      }
      
      if (!updatedData || updatedData.length === 0) {
        console.error("No data returned after updating lab progress");
        return null;
      }
      
      const result = updatedData[0];
      console.log(`Updated lab progress with completion status: ${result.id}`);
      
      // Update user progress summary
      console.log("Updating user progress summary with completed lab");
      await this.updateUserProgressSummary();
      
      return result;
    } catch (error) {
      console.error('Error completing lab:', error);
      // Add more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }
  
  // Get step progress for a lab
  static async getLabStepProgress(labId: string): Promise<LabStepProgress[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot get step progress");
        return [];
      }
      
      console.log("Authenticated user for step progress:", user.id);
      
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
      console.log(`===== UPDATING STEP PROGRESS =====`);
      console.log(`Lab ID: ${labId}`);
      console.log(`Step ID: ${stepId}`);
      console.log(`Step Title: ${stepTitle}`);
      console.log(`Is Completed: ${isCompleted}`);
      
      const supabase = getSupabaseClient();
      
      // Verify parameters are valid
      if (!labId || !stepId || !stepTitle) {
        console.error("Invalid parameters for updateStepProgress:", { labId, stepId, stepTitle });
        return null;
      }
      
      // Ensure user is logged in
      const authResponse = await supabase.auth.getUser();
      console.log("Auth response:", authResponse);
      
      if (!authResponse.data?.user) {
        console.error("User not logged in - cannot update step progress");
        return null;
      }
      
      const user = authResponse.data.user;
      console.log(`Authenticated User ID: ${user.id}`);
      
      // First ensure the lab progress entry exists
      console.log(`Checking if lab progress exists for lab ${labId}`);
      const labProgress = await this.getLabProgress(labId);
      
      if (!labProgress) {
        console.log(`No lab progress found, starting lab ${labId}`);
        const newLabProgress = await this.startLab(labId);
        if (!newLabProgress) {
          console.error(`Failed to create lab progress for lab ${labId}`);
          return null;
        }
        console.log(`Created new lab progress entry: ${newLabProgress.id}`);
      } else {
        console.log(`Found existing lab progress: ${labProgress.id}`);
      }
      
      const now = new Date().toISOString();
      
      // Check if step progress exists
      console.log(`Checking if step progress exists for step ${stepId}`);
      const { data: existingSteps, error: queryError } = await supabase
        .from('lab_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .eq('step_id', stepId);
      
      if (queryError) {
        console.error("Error querying step progress:", queryError);
        return null;
      }
      
      const existingStep = existingSteps && existingSteps.length > 0 ? existingSteps[0] : null;
      console.log(`Step exists: ${!!existingStep}`);
      
      let result;
      
      if (!existingStep) {
        // Create new step progress
        console.log(`Creating new step progress record for step ${stepId}`);
        const newStep = {
          user_id: user.id,
          lab_id: labId,
          step_id: stepId,
          step_title: stepTitle,
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null
        };
        
        console.log(`New step data:`, newStep);
        
        // Use upsert instead of insert to avoid potential race conditions
        const { data, error } = await supabase
          .from('lab_step_progress')
          .upsert([newStep], { onConflict: 'user_id,lab_id,step_id' })
          .select();
        
        if (error) {
          console.error("Error inserting step progress:", error);
          console.error("Error details:", error.details, error.hint, error.code);
          return null;
        }
        
        if (!data || data.length === 0) {
          console.error("No data returned after inserting step progress");
          return null;
        }
        
        result = data[0];
        console.log(`Created step progress record with ID: ${result.id}`);
      } else {
        // Only update if not already completed
        if (!existingStep.is_completed && isCompleted) {
          // Update existing step progress
          console.log(`Updating existing step progress record for step ${stepId}`);
          const { data, error } = await supabase
            .from('lab_step_progress')
            .update({
              is_completed: isCompleted,
              completed_at: isCompleted ? now : null
            })
            .eq('id', existingStep.id)
            .select();
          
          if (error) {
            console.error("Error updating step progress:", error);
            console.error("Error details:", error.details, error.hint, error.code);
            return null;
          }
          
          if (!data || data.length === 0) {
            console.error("No data returned after updating step progress");
            return null;
          }
          
          result = data[0];
          console.log(`Updated step progress record with ID: ${result.id}`);
        } else {
          console.log(`Step ${stepId} is already ${existingStep.is_completed ? 'completed' : 'not completed'}, not updating`);
          result = existingStep;
        }
      }
      
      // Update lab progress summary
      console.log("Updating lab progress with step changes");
      await this.updateLabProgress(labId);
      
      return result;
    } catch (error) {
      console.error('Error updating step progress:', error);
      // Add more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }
  
  // Update lab progress based on completed steps
  private static async updateLabProgress(labId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in - cannot update lab progress");
        return;
      }
      
      // Get all steps for this lab
      console.log(`Getting all step progress for lab ${labId}`);
      const { data: steps, error: stepsError } = await supabase
        .from('lab_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId);
      
      if (stepsError) {
        console.error("Error getting lab steps:", stepsError);
        throw stepsError;
      }
      
      console.log(`Found ${steps?.length || 0} steps for lab ${labId}`);
      
      if (!steps || steps.length === 0) {
        console.log("No steps found, skipping lab progress update");
        return;
      }
      
      // Calculate progress
      const totalSteps = steps.length;
      const completedSteps = steps.filter((step: LabStepProgress) => step.is_completed).length;
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      const isCompleted = completedSteps > 0 && completedSteps === totalSteps;
      
      console.log(`Lab progress calculation: ${completedSteps}/${totalSteps} steps completed (${completionPercentage}%)`);
      console.log(`Is lab completed: ${isCompleted}`);
      
      // Update lab progress
      const now = new Date().toISOString();
      const updates: any = {
        updated_at: now,
        total_steps: totalSteps,
        completed_steps: completedSteps,
        completion_percentage: completionPercentage,
        status: isCompleted ? 'completed' : 'in_progress',
        is_completed: isCompleted
      };
      
      // If lab is completed and wasn't before, set completed_at
      if (isCompleted) {
        const { data: currentProgress, error: progressError } = await supabase
          .from('lab_progress')
          .select('is_completed')
          .eq('user_id', user.id)
          .eq('lab_id', labId)
          .single();
        
        if (progressError) {
          console.error("Error checking current lab progress:", progressError);
        }
        
        if (!currentProgress || !currentProgress.is_completed) {
          console.log("Lab newly completed, setting completed_at timestamp");
          updates.completed_at = now;
        }
      }
      
      console.log(`Updating lab_progress for lab ${labId} with:`, updates);
      
      const { error: updateError } = await supabase
        .from('lab_progress')
        .update(updates)
        .eq('user_id', user.id)
        .eq('lab_id', labId);
      
      if (updateError) {
        console.error("Error updating lab progress:", updateError);
        throw updateError;
      }
      
      console.log(`Lab progress updated successfully for ${labId}`);
      
      // Update user progress summary
      await this.updateUserProgressSummary();
    } catch (error) {
      console.error('Error updating lab progress:', error);
    }
  }
  
  // Update user progress summary
  private static async updateUserProgressSummary(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
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
      const completedLabs = labsProgress.filter((lab: LabProgress) => lab.is_completed).length;
      const inProgressLabs = labsProgress.filter((lab: LabProgress) => !lab.is_completed && lab.completion_percentage > 0).length;
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
      const supabase = getSupabaseClient();
      
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
      const supabase = getSupabaseClient();
      
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