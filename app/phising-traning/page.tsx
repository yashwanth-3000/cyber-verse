"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import "./phishing-style.css" // Import custom phishing CSS
import { 
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  Target,
  Clock,
  Award,
  Medal,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Brain,
  Eye,
  MousePointer
} from "lucide-react"

// Types for leaderboard entries
interface LeaderboardEntry {
  id: string
  name: string
  level1: {
    completed: boolean
    time: number // in seconds
    correctClicks: number
    wrongClicks: number
    score: number
  }
  level2: {
    completed: boolean
    time: number
    correctClicks: number
    wrongClicks: number
    score: number
  }
  level3: {
    completed: boolean
    time: number
    correctClicks: number
    wrongClicks: number
    score: number
  }
  totalScore: number
  completedAt: string
}

// Game instructions for each level
const levelInstructions = [
  {
    level: 1,
    title: "Social Media Deception",
    description: "Spot the red flags in fake social media interfaces. Can you identify suspicious elements before you click?",
    skills: ["Profile verification", "Privacy setting traps", "Suspicious prompts"],
    tips: ["Check for unusual requests", "Verify sender identities", "Be wary of urgent language"]
  },
  {
    level: 2,
    title: "Email Security Challenge",
    description: "Navigate through increasingly deceptive email scenarios. Time pressure adds to the challenge!",
    skills: ["Identifying suspicious senders", "Link verification", "Security alert analysis"],
    tips: ["Hover before you click", "Check email domains carefully", "Question unexpected attachments"]
  },
  {
    level: 3,
    title: "Advanced Phishing Defense",
    description: "Face sophisticated phishing attempts that mimic legitimate security alerts. This is where real expertise is tested!",
    skills: ["Security popup analysis", "System alert verification", "Multi-layered deception detection"],
    tips: ["Question urgency", "Verify through official channels", "Look for technical inconsistencies"]
  }
]

// Mock leaderboard data
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: "user1",
    name: "CyberSentinel",
    level1: {
      completed: true,
      time: 45,
      correctClicks: 5,
      wrongClicks: 0,
      score: 950
    },
    level2: {
      completed: true,
      time: 62,
      correctClicks: 7,
      wrongClicks: 1,
      score: 870
    },
    level3: {
      completed: true,
      time: 98,
      correctClicks: 12,
      wrongClicks: 2,
      score: 790
    },
    totalScore: 2610,
    completedAt: "2023-02-15T14:23:45Z"
  },
  {
    id: "user2",
    name: "PhishFighter",
    level1: {
      completed: true,
      time: 52,
      correctClicks: 5,
      wrongClicks: 1,
      score: 880
    },
    level2: {
      completed: true,
      time: 59,
      correctClicks: 7,
      wrongClicks: 0,
      score: 910
    },
    level3: {
      completed: true,
      time: 120,
      correctClicks: 12,
      wrongClicks: 3,
      score: 720
    },
    totalScore: 2510,
    completedAt: "2023-02-16T09:12:33Z"
  },
  {
    id: "user3",
    name: "SecureClicker",
    level1: {
      completed: true,
      time: 38,
      correctClicks: 5,
      wrongClicks: 0,
      score: 980
    },
    level2: {
      completed: true,
      time: 71,
      correctClicks: 7,
      wrongClicks: 2,
      score: 810
    },
    level3: {
      completed: false,
      time: 0,
      correctClicks: 0,
      wrongClicks: 0,
      score: 0
    },
    totalScore: 1790,
    completedAt: "2023-02-14T16:45:21Z"
  },
  {
    id: "user4",
    name: "ByteDefender",
    level1: {
      completed: true,
      time: 49,
      correctClicks: 5,
      wrongClicks: 1,
      score: 900
    },
    level2: {
      completed: true,
      time: 64,
      correctClicks: 7,
      wrongClicks: 1,
      score: 860
    },
    level3: {
      completed: true,
      time: 110,
      correctClicks: 12,
      wrongClicks: 4,
      score: 700
    },
    totalScore: 2460,
    completedAt: "2023-02-17T11:33:44Z"
  },
  {
    id: "user5",
    name: "ThreatNeutralizr",
    level1: {
      completed: true,
      time: 60,
      correctClicks: 5,
      wrongClicks: 2,
      score: 830
    },
    level2: {
      completed: true,
      time: 75,
      correctClicks: 7,
      wrongClicks: 3,
      score: 770
    },
    level3: {
      completed: true,
      time: 105,
      correctClicks: 12,
      wrongClicks: 1,
      score: 840
    },
    totalScore: 2440,
    completedAt: "2023-02-18T08:21:15Z"
  }
]

// Format time in mm:ss format
const formatTime = (seconds: number): string => {
  if (seconds === 0) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function PhishingTrainingHome() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch leaderboard data (mock implementation)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Get data from localStorage if available
        const localStorageData = localStorage.getItem('phishing-leaderboard');
        
        if (localStorageData) {
          const userData = JSON.parse(localStorageData);
          // Convert single user data to array format expected by component
          const formattedData = [userData];
          
          // Add mock data for competition if needed
          const combinedData = [...formattedData, ...mockLeaderboardData.slice(0, 4)];
          
          // Sort by total score
          combinedData.sort((a, b) => b.totalScore - a.totalScore);
          
          setLeaderboardData(combinedData);
        } else {
          // Fall back to mock data if no localStorage data exists
          setLeaderboardData(mockLeaderboardData);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData(mockLeaderboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Set body class for phishing mode cursor styling
  useEffect(() => {
    // Add the class when component mounts
    document.body.classList.add('phishing-mode')
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('phishing-mode')
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute w-[500px] h-[500px] top-0 left-1/4 bg-purple-500/5 blur-[150px] rounded-full"></div>
          <div className="absolute w-[300px] h-[300px] bottom-1/4 right-1/3 bg-red-500/5 blur-[150px] rounded-full"></div>
          
          {/* Terminal-inspired background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80"></div>
          
          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-[0.03] z-0"
              style={{
                backgroundImage: `linear-gradient(transparent 50%, rgba(0, 0, 0, 0.8) 50%)`,
                backgroundSize: '100% 4px',
                animation: 'scanlines 0.2s linear infinite'
              }}
            />
          </div>
        </div>

        {/* Add scan line animation */}
        <style jsx global>{`
          @keyframes scanlines {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(4px);
            }
          }
          
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          
          .typing-animation {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid #FF3333;
            animation: 
              typing 3.5s steps(40, end),
              blink-caret 0.75s step-end infinite;
          }
          
          @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: #FF3333 }
          }
          
          @keyframes pulse-red {
            0%, 100% { 
              box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.4);
            }
            50% { 
              box-shadow: 0 0 0 10px rgba(255, 51, 51, 0);
            }
          }
        `}</style>

        {/* Main content */}
        <div className="relative z-10 p-4 md:p-8" style={{
          fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
          cursor: "default"
        }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col mb-8">
              <div className="flex items-center mb-2">
                <Link
                  href="/what-you-want-to-know"
                  className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Resources
                </Link>
                <div className="h-px flex-grow bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0"></div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-red-500/70 text-xs font-mono mb-1">
                    <span className="mr-1">$</span>
                    <span className="typing-animation">init-training --mode=phishing-defense</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-red-500 font-mono tracking-tight">
                    Phishing<span className="text-white">Defense</span>
                  </h1>
                  <p className="text-gray-400 mt-2 font-mono max-w-2xl">
                    Train your cybersecurity skills by identifying and avoiding sophisticated phishing attempts in realistic scenarios.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main game info section */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-gray-900/80 to-black border-2 border-dashed border-red-500/60 rounded-xl overflow-hidden shadow-lg shadow-red-500/5 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Game description */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">Mission Briefing</h2>
                    <p className="text-gray-300 mb-4">
                      You're about to enter a realistic simulation of the dangerous world of phishing attacks. 
                      Your mission is to identify and avoid social engineering attempts designed to trick you 
                      into revealing sensitive information or taking harmful actions.
                    </p>
                    <p className="text-gray-300 mb-6">
                      Progress through increasingly challenging levels that test your ability to spot the warning signs 
                      of phishing attempts. Remember, in cybersecurity, hesitation and caution are virtues.
                    </p>
                    
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-red-400" />
                      Key Skills You'll Develop
                    </h3>
                    <ul className="text-gray-300 mb-6 space-y-2">
                      <li className="flex items-start">
                        <Eye className="h-4 w-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                        <span>Identifying suspicious elements in emails, websites, and popups</span>
                      </li>
                      <li className="flex items-start">
                        <MousePointer className="h-4 w-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                        <span>Developing safe clicking habits under pressure</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                        <span>Recognizing social engineering tactics</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldAlert className="h-4 w-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                        <span>Building reflexive security awareness</span>
                      </li>
                    </ul>
                    
                    <div className="mt-6">
                      <Link href="/phising-traning/level-1">
                        <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center group">
                          Start Training
                          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Scoring system */}
                  <div className="md:w-80 bg-black/50 rounded-lg p-5 border border-red-500/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Award className="mr-2 h-5 w-5 text-red-400" />
                      Scoring System
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-green-400 font-bold">Correct Actions</p>
                          <p className="text-gray-400 text-sm">+100 points for each safe interaction</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-red-400 font-bold">Wrong Actions</p>
                          <p className="text-gray-400 text-sm">-50 points for falling for phishing attempts</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-blue-400 font-bold">Time Bonus</p>
                          <p className="text-gray-400 text-sm">Up to +200 points based on completion speed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Target className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-purple-400 font-bold">Level Completion</p>
                          <p className="text-gray-400 text-sm">+300 points for completing each level</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-5 border-t border-gray-800">
                      <p className="text-gray-300 text-sm italic">
                        Remember: In real cybersecurity, a single mistake can be costly. Train to achieve a perfect record!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Level details with tabs */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Training Levels</h2>
              
              <div className="flex border-b border-gray-800">
                {levelInstructions.map((level, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLevel(index)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      selectedLevel === index
                        ? "text-red-500 border-b-2 border-red-500"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Level {index + 1}
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                {selectedLevel !== null && (
                  <motion.div
                    key={selectedLevel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900/30 p-6 rounded-lg mt-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">
                      {levelInstructions[selectedLevel].title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {levelInstructions[selectedLevel].description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="text-red-400 text-sm font-bold uppercase mb-2">Skills Trained</h4>
                        <ul className="space-y-1">
                          {levelInstructions[selectedLevel].skills.map((skill, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 mr-2"></div>
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-red-400 text-sm font-bold uppercase mb-2">Pro Tips</h4>
                        <ul className="space-y-1">
                          {levelInstructions[selectedLevel].tips.map((tip, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 mr-2"></div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Link href={selectedLevel === 2 ? `/phising-traning/level3` : `/phising-traning/level-${selectedLevel + 1}`}>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-md transition-colors flex items-center">
                          Start Level {selectedLevel + 1}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {selectedLevel === null && (
                <div className="bg-gray-900/30 p-6 rounded-lg mt-6 text-center">
                  <p className="text-gray-400">Select a level above to view details</p>
                </div>
              )}
            </div>
            
            {/* Leaderboard section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Trophy className="h-6 w-6 text-amber-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900/50 border-b border-gray-800">
                        <th className="p-3 text-left text-gray-400 font-medium">Rank</th>
                        <th className="p-3 text-left text-gray-400 font-medium">Player</th>
                        <th className="p-3 text-center text-gray-400 font-medium">Level 1</th>
                        <th className="p-3 text-center text-gray-400 font-medium">Level 2</th>
                        <th className="p-3 text-center text-gray-400 font-medium">Level 3</th>
                        <th className="p-3 text-right text-gray-400 font-medium">Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.sort((a, b) => b.totalScore - a.totalScore).map((entry, index) => (
                        <tr 
                          key={entry.id} 
                          className={`border-b border-gray-800 hover:bg-gray-900/30 ${
                            index === 0 ? 'bg-amber-900/10' : 
                            index === 1 ? 'bg-gray-400/10' : 
                            index === 2 ? 'bg-amber-700/10' : ''
                          }`}
                        >
                          <td className="p-3 text-left">
                            <div className="flex items-center">
                              {index === 0 ? (
                                <Medal className="h-5 w-5 text-amber-500 mr-1" />
                              ) : index === 1 ? (
                                <Medal className="h-5 w-5 text-gray-400 mr-1" />
                              ) : index === 2 ? (
                                <Medal className="h-5 w-5 text-amber-700 mr-1" />
                              ) : (
                                <span className="text-gray-500 w-5 text-center mr-1">{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-left text-white font-medium">{entry.name}</td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${entry.level1.completed ? 'text-green-500' : 'text-gray-500'}`}>
                                {entry.level1.score}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                <span title="Time">{formatTime(entry.level1.time)}</span>
                                <span className="mx-1">•</span>
                                <span title="Correct/Wrong">{entry.level1.correctClicks}/{entry.level1.wrongClicks}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${entry.level2.completed ? 'text-green-500' : 'text-gray-500'}`}>
                                {entry.level2.score}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                <span title="Time">{formatTime(entry.level2.time)}</span>
                                <span className="mx-1">•</span>
                                <span title="Correct/Wrong">{entry.level2.correctClicks}/{entry.level2.wrongClicks}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${entry.level3.completed ? 'text-green-500' : 'text-gray-500'}`}>
                                {entry.level3.score}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                <span title="Time">{formatTime(entry.level3.time)}</span>
                                <span className="mx-1">•</span>
                                <span title="Correct/Wrong">{entry.level3.correctClicks}/{entry.level3.wrongClicks}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-xl font-bold text-white">{entry.totalScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Call to action */}
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Test Your Skills?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Phishing attacks are becoming increasingly sophisticated. The best defense is knowledge and practice.
                Start your training now and become a phishing defense expert!
              </p>
              <div className="inline-block relative">
                <Link href="/phising-traning/level-1">
                  <button 
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
                    style={{ animation: 'pulse-red 2s infinite' }}
                  >
                    Begin Training Mission
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
