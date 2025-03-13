'use client';

import { useEffect, useState } from 'react';
import { ProgressClient, UserProgressSummary, LabProgress } from '@/lib/services/progress-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Trophy, BookOpen, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/providers/auth-provider';

export function UserProgressDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserProgressSummary | null>(null);
  const [labProgress, setLabProgress] = useState<LabProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        const [progressSummary, progressData] = await Promise.all([
          ProgressClient.getUserProgressSummary(),
          ProgressClient.getAllLabsProgress()
        ]);
        
        setSummary(progressSummary);
        setLabProgress(progressData);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  // Fallback for first-time users with no progress data yet
  useEffect(() => {
    if (!loading && !summary && user) {
      // Create a default summary for users with no data yet
      setSummary({
        total_labs: 0,
        completed_labs: 0,
        in_progress_labs: 0,
        completion_percentage: 0,
        last_activity_at: new Date().toISOString(),
        earned_points: 0
      });
    }
  }, [loading, summary, user]);

  if (loading) {
    return <ProgressDashboardSkeleton />;
  }

  if (!summary) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No Progress Data Available</h3>
        <p className="text-gray-400 mb-4">
          Start exploring labs to track your progress.
        </p>
        <Link
          href="/cyber-labs"
          className="inline-flex items-center px-4 py-2 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] rounded transition-colors"
        >
          Browse Labs
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Calculate overall percentage
  const calculateOverallProgress = () => {
    if (!labProgress.length) return 0;
    
    const totalPercentage = labProgress.reduce((sum, lab) => sum + lab.completion_percentage, 0);
    return Math.round(totalPercentage / labProgress.length);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall progress */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">{calculateOverallProgress()}%</div>
            <Progress
              value={calculateOverallProgress()}
              className="h-2 bg-gray-800"
              style={{ "--progress-foreground": "#00FF00" } as React.CSSProperties}
            />
          </CardContent>
        </Card>
        
        {/* Completed labs */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Completed Labs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <CheckCircle className="h-8 w-8 text-[#00FF00] mr-4" />
            <div>
              <div className="text-2xl font-bold text-white">{summary.completed_labs}</div>
              <p className="text-xs text-gray-500">
                {summary.in_progress_labs > 0 ? `${summary.in_progress_labs} in progress` : 'No labs in progress'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Trophy className="h-8 w-8 text-amber-500 mr-4" />
            <div>
              <div className="text-2xl font-bold text-white">{0}</div>
              <p className="text-xs text-gray-500">
                Complete labs to earn achievements
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Last active */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Last Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-8 w-8 text-blue-400 mr-4" />
            <div>
              <div className="text-lg font-medium text-white">
                {formatDistanceToNow(new Date(summary.last_activity_at), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed progress */}
      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lab Progress</CardTitle>
          <CardDescription>Track your progress across all labs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="bg-black/30 border border-gray-800">
              <TabsTrigger value="all">All Labs</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {labProgress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg text-gray-300 mb-1">No Labs Started Yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Start your cybersecurity journey by exploring our labs
                  </p>
                  <Link
                    href="/cyber-labs"
                    className="inline-flex items-center px-4 py-2 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] rounded transition-colors"
                  >
                    Browse Labs
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <LabProgressList labs={labProgress} />
              )}
            </TabsContent>
            
            <TabsContent value="in-progress" className="mt-4">
              {labProgress.filter(lab => lab.status === 'in_progress').length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg text-gray-300 mb-1">No Labs In Progress</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Resume a lab or start a new one
                  </p>
                </div>
              ) : (
                <LabProgressList labs={labProgress.filter(lab => lab.status === 'in_progress')} />
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {labProgress.filter(lab => lab.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg text-gray-300 mb-1">No Labs Completed Yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete labs to see them here
                  </p>
                </div>
              ) : (
                <LabProgressList labs={labProgress.filter(lab => lab.status === 'completed')} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LabProgressList({ labs }: { labs: LabProgress[] }) {
  // Map of lab IDs to user-friendly names
  const labNames: Record<string, string> = {
    'beginner-ctf': 'Beginner CTF Challenge',
    'web-security-lab': 'Web Vulnerability Lab',
    'network-defense-lab': 'Network Defense Challenge',
    'crypto-basics': 'Cryptography Fundamentals',
    'forensic-investigation': 'Digital Forensics Investigation',
    'advanced-penetration-testing': 'Advanced Penetration Testing'
  };

  return (
    <div className="space-y-3">
      {labs.map(lab => (
        <Link
          key={lab.id}
          href={`/cyber-labs/${lab.lab_id}`}
          className="flex items-center justify-between p-3 bg-black/30 border border-gray-800 rounded-md hover:bg-black/40 transition-colors"
        >
          <div>
            <h4 className="font-medium text-gray-200">
              {labNames[lab.lab_id] || lab.lab_id}
            </h4>
            <div className="text-xs text-gray-500 mt-1">
              Started {formatDistanceToNow(new Date(lab.started_at), { addSuffix: true })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-32">
              <div className="text-xs text-gray-400 mb-1">{lab.completion_percentage}% complete</div>
              <Progress
                value={lab.completion_percentage}
                className="h-1.5 bg-gray-800"
                style={{ 
                  "--progress-foreground": lab.status === 'completed' ? "#00FF00" : "#f59e0b" 
                } as React.CSSProperties}
              />
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProgressDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-black/50 border-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Detailed progress skeleton */}
      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 