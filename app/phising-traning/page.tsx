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
  MousePointer,
  BadgeCheck,
  User,
  Key,
  Monitor
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import { useAuth } from "@/lib/providers/auth-provider"

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

// Format time in mm:ss format
const formatTime = (seconds: number): string => {
  if (seconds === 0) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function PhishingTrainingHome() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  return (
    <div className="phishing-container min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white pb-20 relative">
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 150, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 150, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Animated glowing orbs for cyberpunk feel */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-dashed border-blue-500/20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r-2 border-b-2 border-dashed border-blue-500/20"></div>
      
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-[1]"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/what-you-want-to-know" className="flex items-center text-blue-400 hover:text-blue-300 mb-6 group transition-all duration-300">
          <div className="relative">
            <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[5px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="relative">
            Back to Courses
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </span>
                      </Link>
        
        <header className="text-center mb-16 relative">
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-dashed border-blue-500/30 -ml-4 -mt-4"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-dashed border-blue-500/30 -mr-4 -mb-4"></div>
          
          {/* Cyberpunk-styled glitch text effect */}
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold mb-2 text-white cyberpunk-text glitch relative inline-block">
              <span>Phishing Training Simulator</span>
              <span className="glitch-effect" aria-hidden="true">Phishing Training Simulator</span>
            </h1>
            <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0"></div>
                      </div>
                      
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6 relative">
            Master the art of identifying and avoiding phishing attempts through interactive scenarios
            <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0"></span>
          </p>
        </header>
        
        {/* Section Title */}
        <div className="flex items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-400">Training Modules</h2>
          <div className="ml-4 h-px flex-grow bg-gradient-to-r from-blue-500/50 to-blue-500/0"></div>
          <div className="ml-2 text-xs px-2 py-1 border border-dashed border-blue-500/40 text-blue-400">LEVEL-BASED</div>
                      </div>
                      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {levelInstructions.map((level, index) => (
            <motion.div 
              key={index}
              className="cyber-card relative overflow-hidden group"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Level indicator */}
              <div className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border border-dashed border-blue-500/30 rotate-45"></div>
                <span className="text-blue-400 font-mono font-bold">{level.level}</span>
                    </div>
                    
              <div className="p-6 relative z-10">
                <div className="cyber-card-header mb-4 flex items-center">
                  <div className="p-2 mr-3 rounded-md bg-gray-800/50 border border-dashed border-blue-500/20">
                    {index === 0 ? (
                      <Target className="w-6 h-6 text-blue-400" />
                    ) : index === 1 ? (
                      <ShieldAlert className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-400" />
                    )}
                    </div>
                  <div>
                    <div className="text-xs text-blue-400 mb-1 font-mono">LEVEL {level.level}</div>
                    <h3 className="text-xl font-bold text-white">{level.title}</h3>
              </div>
            </div>
            
                {/* Decorative line */}
                <div className="w-full h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 mb-4"></div>
                
                <p className="text-gray-300 mb-4">{level.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-1" /> Skills Trained
                  </h4>
                  <div className="border border-dashed border-blue-500/30 rounded-md p-3 bg-gray-800/30 backdrop-blur-sm">
                    <ul className="list-disc pl-5 text-gray-300 space-y-1">
                      {level.skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                          ))}
                        </ul>
                  </div>
                      </div>
                      
                      <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> Pro Tips
                  </h4>
                  <div className="border border-dashed border-green-500/30 rounded-md p-3 bg-gray-800/30 backdrop-blur-sm">
                    <ul className="list-disc pl-5 text-gray-300 space-y-1">
                      {level.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                <Link href={`/phising-traning/level-${level.level}`} className="mt-6 w-full cyber-button flex items-center justify-center py-3 px-4 group relative overflow-hidden">
                  <span className="relative z-10 font-medium">
                    Start Level {level.level}
                    <ChevronRight className="ml-2 w-5 h-5 inline group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                    </div>
              
              {/* Corner decorative elements */}
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-dashed border-blue-500/30"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-dashed border-blue-500/30"></div>
            </motion.div>
          ))}
                </div>
        
        {/* Section removed: Player Stats, Global Leaderboard, and User Score Card were here */}
        
      </div>
      
      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0"></div>
      
      {/* Floating circuit elements */}
      <div className="absolute top-20 right-10 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute w-full h-full border border-dashed border-blue-500/30 rounded-full"></div>
        <div className="absolute w-5 h-5 bg-blue-500/30 rounded-full top-0 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
        <div className="absolute w-3 h-3 bg-purple-500/30 rounded-full bottom-0 left-1/2 transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-24 h-24 border border-dashed border-blue-500/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="absolute bottom-20 left-10 w-40 h-40 opacity-20 pointer-events-none">
        <div className="absolute w-full h-full border border-dashed border-purple-500/30 rounded-full"></div>
        <div className="absolute w-6 h-6 bg-purple-500/30 rounded-full top-0 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
        <div className="absolute w-4 h-4 bg-blue-500/30 rounded-full bottom-0 left-1/2 transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute w-32 h-32 border border-dashed border-purple-500/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Add styles for cyber spinner and scanline effect */}
      <style jsx global>{`
        /* Cyberpunk text glitch effect */
        .cyberpunk-text {
          position: relative;
          color: white;
          text-shadow: 0 0 5px rgba(0, 150, 255, 0.5);
        }
        
        .glitch-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: rgba(0, 150, 255, 0.5);
          mix-blend-mode: screen;
          opacity: 0.8;
          display: none; /* Hide by default */
        }
        
        .glitch:hover .glitch-effect {
          display: block;
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        
        /* Cyber spinner for loading */
        .cyber-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: rgba(59, 130, 246, 0.8);
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
          position: relative;
        }
        
        .cyber-spinner::before,
        .cyber-spinner::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }
        
        .cyber-spinner::before {
          width: 46px;
          height: 46px;
          border: 1px dashed rgba(59, 130, 246, 0.4);
          animation: spin 5s linear infinite reverse;
        }
        
        .cyber-spinner::after {
          width: 26px;
          height: 26px;
          border: 1px dashed rgba(59, 130, 246, 0.4);
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Scanline effect */
        .bg-scanline {
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 150, 255, 0.1) 50%);
          background-size: 100% 4px;
          background-repeat: repeat;
          animation: scanlines 0.2s linear infinite;
        }
        
        @keyframes scanlines {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 4px;
          }
        }
      `}</style>
    </div>
  )
}
