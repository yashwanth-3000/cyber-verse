'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, PlayCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { LabProgress as LabProgressType, ProgressClient } from '@/lib/services/progress-service';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/providers/auth-provider';

interface LabProgressProps {
  labId: string;
}

export function LabProgress({ labId }: LabProgressProps) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabProgress = async () => {
      if (!labId || !user) {
        setLoading(false);
        return;
      }
      
      try {
        const progressData = await ProgressClient.getLabProgress(labId);
        setProgressData(progressData);
      } catch (error) {
        console.error("Error fetching lab progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabProgress();
  }, [labId, user]);

  // Start tracking lab progress when component mounts
  useEffect(() => {
    async function initLab() {
      if (!loading && !progressData && user) {
        try {
          const started = await ProgressClient.startLab(labId);
          if (started) {
            setProgressData(started);
          }
        } catch (err) {
          console.error("Error starting lab tracking:", err);
        }
      }
    }
    
    initLab();
  }, [labId, loading, progressData, user]);

  if (loading) {
    return (
      <Card className="bg-gray-900/40 border-gray-800 animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg text-white h-6 bg-gray-800 rounded"></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-5 bg-gray-800 rounded w-2/3"></div>
          <div className="h-8 bg-gray-800 rounded"></div>
          <div className="h-5 bg-gray-800 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const progress = progressData ? progressData.completion_percentage || 0 : 0;
  const startedTime = progressData?.started_at ? new Date(progressData.started_at) : null;
  const updatedTime = progressData?.updated_at ? new Date(progressData.updated_at) : null;
  
  const getStatusLabel = () => {
    if (!progressData) return "Not Started";
    if (progressData.is_completed) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };
  
  const getStatusColor = () => {
    if (!progressData) return "text-gray-400";
    if (progressData.is_completed) return "text-[#00FF00]";
    if (progress > 0) return "text-amber-400";
    return "text-gray-400";
  };

  return (
    <Card className="bg-gray-900/40 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Status:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300 text-sm">{progress}% Complete</span>
            <span className="text-gray-300 text-sm">{progressData?.completed_steps || 0}/{progressData?.total_steps || 0} Steps</span>
          </div>
          <Progress
            value={progress}
            className="h-2.5 bg-gray-800"
            style={{ 
              "--progress-foreground": "#00FF00" 
            } as React.CSSProperties}
          />
        </div>
        
        {startedTime && (
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="mr-2 h-4 w-4" />
            <span>Started: {startedTime.toLocaleDateString()}</span>
          </div>
        )}
        
        {updatedTime && (
          <div className="flex items-center text-gray-400 text-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Last Activity: {updatedTime.toLocaleDateString()}</span>
          </div>
        )}
        
        {progressData?.is_completed && progressData?.completed_at && (
          <div className="flex items-center text-[#00FF00] text-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Completed on: {new Date(progressData.completed_at).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 