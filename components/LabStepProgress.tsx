'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';

interface LabStepProgressProps {
  labId: string;
  stepId: string;
  title: string;
  isCompleted: boolean;
  onStepComplete: () => void;
}

export function LabStepProgress({
  labId,
  stepId,
  title,
  isCompleted,
  onStepComplete
}: LabStepProgressProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleComplete = async () => {
    if (isCompleted || !user || loading) return;
    
    setLoading(true);
    try {
      onStepComplete();
    } catch (error) {
      console.error("Error completing step:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="bg-gray-900/70 border border-gray-700 rounded-md p-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left mb-3 sm:mb-0">
          <p className="text-gray-400 text-sm">Sign in to track your progress</p>
        </div>
        <Button 
          variant="outline"
          className="w-full sm:w-auto border-gray-700 hover:border-[#00FF00]/50 hover:bg-[#00FF00]/10 text-gray-300 hover:text-[#00FF00]"
          onClick={() => window.location.href = "/signin"}
        >
          Sign In
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  if (isCompleted) {
    return (
      <div className="bg-[#00FF00]/5 border border-[#00FF00]/30 rounded-md p-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-3 sm:mb-0">
          <CheckCircle className="text-[#00FF00] h-5 w-5 mr-2" />
          <div>
            <p className="text-[#00FF00] font-medium">{title} completed!</p>
            <p className="text-gray-400 text-sm">You've marked this step as complete</p>
          </div>
        </div>
        <Button 
          variant="outline"
          className="w-full sm:w-auto border-[#00FF00]/30 bg-[#00FF00]/10 text-[#00FF00]"
          disabled
        >
          Completed
          <CheckCircle className="ml-2 h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-md p-4 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-center sm:text-left mb-3 sm:mb-0">
        <p className="text-gray-200 font-medium">Ready to complete this step?</p>
        <p className="text-gray-400 text-sm">Mark this step as complete to track your progress</p>
      </div>
      <Button 
        className="w-full sm:w-auto bg-[#00FF00] hover:bg-[#00FF00]/90 text-black"
        onClick={handleComplete}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-r-transparent rounded-full"></span>
            Processing...
          </>
        ) : (
          <>
            Complete Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
} 