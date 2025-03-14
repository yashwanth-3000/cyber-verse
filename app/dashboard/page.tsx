"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/providers/auth-provider"
import { ProgressClient } from "@/lib/services/progress-service"
import { UserProgressDashboard } from "@/components/UserProgressDashboard"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Clock, 
  Trophy, 
  BookOpen, 
  Code, 
  User, 
  Shield, 
  Activity,
  ChevronRight,
  GraduationCap,
  Terminal,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [progressSummary, setProgressSummary] = useState<any>(null)
  const [labsProgress, setLabsProgress] = useState<any[]>([])
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!user) {
      router.push("/login?next=/dashboard")
      return
    }

    async function loadDashboardData() {
      try {
        setLoading(true)
        
        // Load user progress summary
        const summary = await ProgressClient.getUserProgressSummary()
        
        // Load labs progress
        const labs = await ProgressClient.getAllLabsProgress()
        
        // Load achievements
        const achievements = await ProgressClient.getUserAchievements()
        
        setProgressSummary(summary)
        setLabsProgress(labs)
        setUserAchievements(achievements)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, router])

  // If no user data is available yet, create a default summary with 0 values
  useEffect(() => {
    if (!loading && !progressSummary && user) {
      setProgressSummary({
        total_labs: 0,
        completed_labs: 0,
        in_progress_labs: 0,
        completion_percentage: 0,
        last_activity_at: new Date().toISOString(),
        earned_points: 0
      })
    }
  }, [loading, progressSummary, user])

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-t-[#00FF00] border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-10">
      {/* Hero section */}
      <div className="bg-gradient-to-b from-black via-[#00FF00]/10 to-black py-10 mb-8">
        <div className="container mx-auto px-4">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              Welcome back, {user.user_metadata?.name || user.email?.split('@')[0] || 'Hacker'}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="ml-4 bg-[#00FF00]/20 text-[#00FF00] text-sm font-normal py-1 px-3 rounded-full border border-[#00FF00]/30"
              >
                <Terminal className="inline-block h-3.5 w-3.5 mr-1" />
                Level {Math.ceil((progressSummary?.completion_percentage || 0) / 10) || 1} CyberHacker
              </motion.span>
            </h1>
            <p className="text-gray-400 mb-8">
              Track your progress and continue your cybersecurity journey
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Overall Progress Card */}
              <Card className="bg-gray-900/40 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md text-gray-300 flex items-center">
                    <Activity className="h-4 w-4 text-[#00FF00] mr-2" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{progressSummary?.completion_percentage || 0}%</div>
                  <Progress 
                    value={progressSummary?.completion_percentage || 0} 
                    className="h-2 bg-gray-800"
                    style={{ "--progress-foreground": "#00FF00" } as React.CSSProperties}
                  />
                </CardContent>
              </Card>

              {/* Labs Completed Card */}
              <Card className="bg-gray-900/40 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md text-gray-300 flex items-center">
                    <Shield className="h-4 w-4 text-[#00FF00] mr-2" />
                    Labs Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {progressSummary?.completed_labs || 0}/{progressSummary?.total_labs || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {progressSummary?.in_progress_labs || 0} labs in progress
                  </p>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card className="bg-gray-900/40 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md text-gray-300 flex items-center">
                    <Trophy className="h-4 w-4 text-[#00FF00] mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {userAchievements?.length || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {userAchievements?.length ? 'Badges earned' : 'Complete labs to earn badges'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto bg-black border border-gray-800 p-1 mb-8">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#00FF00]/10 data-[state=active]:text-[#00FF00] data-[state=active]:border-[#00FF00]/30"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="labs" 
              className="data-[state=active]:bg-[#00FF00]/10 data-[state=active]:text-[#00FF00] data-[state=active]:border-[#00FF00]/30"
            >
              Labs Progress
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-[#00FF00]/10 data-[state=active]:text-[#00FF00] data-[state=active]:border-[#00FF00]/30"
            >
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content - Progress summary */}
              <div className="col-span-2">
                <h2 className="text-2xl font-bold text-white mb-6">Learning Progress</h2>
                <UserProgressDashboard />
                
                {/* Most Recent Lab - New Addition */}
                {labsProgress && labsProgress.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Terminal className="h-5 w-5 text-[#00FF00] mr-2" />
                      Your Most Recent Lab
                    </h3>
                    
                    {(() => {
                      // Find the most recently updated lab
                      const sortedLabs = [...labsProgress].sort((a, b) => 
                        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                      );
                      const recentLab = sortedLabs[0];
                      
                      if (!recentLab) return null;
                      
                      return (
                        <Card className="bg-gray-900/40 border-gray-800">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg text-white">
                                  {recentLab.lab_id.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase())}
                                </CardTitle>
                                <CardDescription>
                                  Last active: {new Date(recentLab.updated_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                recentLab.is_completed 
                                  ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/30' 
                                  : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              }`}>
                                {recentLab.is_completed ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-3">
                            <div className="mb-4">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">{recentLab.completion_percentage}% complete</span>
                                <span className="text-gray-400">{recentLab.completed_steps}/{recentLab.total_steps} steps</span>
                              </div>
                              <Progress 
                                value={recentLab.completion_percentage} 
                                className="h-2 bg-gray-800"
                                style={{ "--progress-foreground": recentLab.is_completed ? "#00FF00" : "#f59e0b" } as React.CSSProperties}
                              />
                            </div>
                            
                            {/* Lab Steps */}
                            {recentLab.steps && recentLab.steps.length > 0 && (
                              <div className="space-y-2 border border-gray-800 rounded-md p-3">
                                <h4 className="text-sm font-medium text-gray-300 border-b border-gray-800 pb-2 mb-3">Lab Steps</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {recentLab.steps.map((step: any, index: number) => (
                                    <div 
                                      key={step.id || index} 
                                      className={`flex items-center p-2 rounded ${
                                        step.is_completed 
                                          ? 'bg-[#00FF00]/10 border border-[#00FF00]/20' 
                                          : 'bg-gray-800/50 border border-gray-800'
                                      }`}
                                    >
                                      <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
                                        step.is_completed 
                                          ? 'bg-[#00FF00]/20 text-[#00FF00]' 
                                          : 'bg-gray-900 text-gray-400'
                                      }`}>
                                        {step.is_completed ? (
                                          <CheckCircle className="h-3.5 w-3.5" />
                                        ) : (
                                          index + 1
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className={`text-xs font-medium ${step.is_completed ? 'text-[#00FF00]' : 'text-gray-300'}`}>
                                          {step.step_title}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {step.is_completed ? 'Completed' : 'Not started'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button
                              variant="ghost"
                              className="w-full text-[#00FF00] hover:bg-[#00FF00]/10 border border-dashed border-[#00FF00]/30"
                              onClick={() => router.push(`/cyber-labs/${recentLab.lab_id}`)}
                            >
                              {recentLab.is_completed ? 'Review Lab' : 'Continue Lab'}
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Sidebar - Achievements and recommendations */}
              <div className="space-y-6">
                {/* Recent achievements */}
                <Card className="bg-gray-900/40 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center">
                      <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userAchievements && userAchievements.length > 0 ? (
                      userAchievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-start">
                          <div className="bg-amber-500/20 p-2 rounded-md mr-3">
                            <Trophy className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{achievement.name}</p>
                            <p className="text-sm text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Trophy className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500">Complete labs to earn achievements</p>
                        <Button 
                          variant="outline" 
                          className="mt-4 border-dashed border-gray-700 text-gray-400 hover:text-[#00FF00] hover:border-[#00FF00]/30 hover:bg-[#00FF00]/5"
                          onClick={() => router.push('/cyber-labs')}
                        >
                          Explore Labs
                        </Button>
                </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full text-[#00FF00] hover:bg-[#00FF00]/10 border border-dashed border-[#00FF00]/30"
                      onClick={() => setActiveTab("achievements")}
                    >
                      View All Achievements
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Recommended next steps */}
                <Card className="bg-gray-900/40 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center">
                      <GraduationCap className="h-5 w-5 text-[#00FF00] mr-2" />
                      Recommended Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-[#00FF00]/5 border border-[#00FF00]/20 rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Shield className="text-[#00FF00] h-5 w-5 mr-2" />
                          <div>
                            <p className="font-medium text-[#00FF00]">Continue XSS Lab</p>
                            <p className="text-xs text-gray-400">You're 60% through this lab</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#00FF00]/30 bg-[#00FF00]/10 text-[#00FF00] h-8"
                          onClick={() => router.push('/cyber-labs/xss-playground')}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-black/30 border border-gray-800 rounded-md hover:bg-black/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Code className="text-purple-400 h-5 w-5 mr-2" />
                          <div>
                            <p className="font-medium text-gray-200">Try SQL Injection Lab</p>
                            <p className="text-xs text-gray-400">Recommended next lab</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-gray-300 h-8"
                          onClick={() => router.push('/cyber-labs/sql-injection')}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Labs Progress Tab */}
          <TabsContent value="labs" className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-white">Your Lab Progress</h2>
              <Button 
                className="bg-[#00FF00] text-black hover:bg-[#00FF00]/90"
                onClick={() => router.push('/cyber-labs')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Browse All Labs
              </Button>
            </div>
            
            {labsProgress && labsProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labsProgress.map((lab) => (
                  <Card key={lab.id} className="bg-gray-900/40 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-white">
                          {lab.lab_id.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase())}
                        </CardTitle>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          lab.is_completed 
                            ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/30' 
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        }`}>
                          {lab.is_completed ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{lab.completion_percentage}% complete</span>
                          <span className="text-gray-400">{lab.completed_steps}/{lab.total_steps} steps</span>
                        </div>
                        <Progress 
                          value={lab.completion_percentage} 
                          className="h-1.5 bg-gray-800"
                          style={{ "--progress-foreground": lab.is_completed ? "#00FF00" : "#f59e0b" } as React.CSSProperties}
                        />
                      </div>
                      
                      {/* Lab Steps Section - New addition */}
                      {lab.steps && lab.steps.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-gray-200 mb-2">Lab Steps:</h4>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            {lab.steps.map((step: any, index: number) => (
                              <div 
                                key={step.id || index} 
                                className={`flex items-center py-1.5 px-2 rounded text-xs ${
                                  step.is_completed 
                                    ? 'bg-[#00FF00]/10 text-[#00FF00]' 
                                    : 'bg-gray-800/50 text-gray-300'
                                }`}
                              >
                                {step.is_completed ? (
                                  <CheckCircle className="h-3.5 w-3.5 mr-2 text-[#00FF00]" />
                                ) : (
                                  <div className="h-3.5 w-3.5 mr-2 rounded-full border border-gray-500"></div>
                                )}
                                <span>{index + 1}. {step.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-400 text-xs mt-3">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Last active: {new Date(lab.updated_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        variant="ghost"
                        className="w-full text-[#00FF00] hover:bg-[#00FF00]/10 border border-dashed border-[#00FF00]/30"
                        onClick={() => router.push(`/cyber-labs/${lab.lab_id}`)}
                      >
                        {lab.is_completed ? 'Review Lab' : 'Continue Lab'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800 text-center p-8">
                <Shield className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <CardTitle className="text-xl text-white mb-2">No Labs Started Yet</CardTitle>
                <CardDescription className="text-gray-400 mb-6">Begin your cybersecurity journey by starting a lab</CardDescription>
                <Button 
                  className="bg-[#00FF00] text-black hover:bg-[#00FF00]/90"
                  onClick={() => router.push('/cyber-labs')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Browse Labs
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Achievements</h2>
              <div className="text-gray-400">
                {userAchievements?.length || 0} badge{userAchievements?.length !== 1 ? 's' : ''} earned
              </div>
            </div>
            
            {userAchievements && userAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAchievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-gray-900/40 border-gray-800">
                    <CardHeader className="text-center pb-2">
                      <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="h-8 w-8 text-amber-500" />
                      </div>
                      <CardTitle className="text-lg text-white">{achievement.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400 text-sm">
                      {achievement.description}
                    </CardContent>
                    <CardFooter className="flex justify-center pt-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800 text-center p-8">
                <Trophy className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <CardTitle className="text-xl text-white mb-2">No Achievements Yet</CardTitle>
                <CardDescription className="text-gray-400 mb-6">Complete labs and challenges to earn achievements</CardDescription>
                <Button 
                  className="bg-[#00FF00] text-black hover:bg-[#00FF00]/90"
                  onClick={() => router.push('/cyber-labs')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Browse Labs
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
                </div>
  )
}

