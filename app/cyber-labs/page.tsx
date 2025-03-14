"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronRight, 
  Terminal,
  Shield,
  Network,
  Lock,
  FileDigit,
  Flag,
  Sparkles,
  BookOpen,
  Clock,
  CircleSlash,
  Verified
} from "lucide-react"

// CSS for subtle background pattern and animations
const CyberLabStyles = () => (
  <style jsx global>{`
    .cyber-dot-pattern {
      background-image: radial-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      background-position: center center;
    }
    
    .lab-card {
      transition: transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .lab-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px -5px rgba(0, 255, 0, 0.1);
    }
    
    .subtle-rotate-on-hover {
      transition: transform 0.3s ease;
    }
    
    .subtle-rotate-on-hover:hover {
      transform: rotate(5deg);
    }
    
    .category-count {
      font-size: 0.7rem;
      background-color: rgba(0, 0, 0, 0.6);
      padding: 0.1rem 0.4rem;
      border-radius: 1rem;
      margin-left: 0.3rem;
      opacity: 0.7;
    }
    
    .lab-status-indicator::before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    .lab-status-available::before {
      background-color: #00FF00;
      box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    }
    
    .lab-status-coming-soon::before {
      background-color: #FFC107;
      box-shadow: 0 0 8px rgba(255, 193, 7, 0.3);
    }

    @keyframes glow-pulse {
      0%, 100% {
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
      }
      50% {
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
      }
    }
  `}</style>
);

// Lab categories with icons
const CATEGORIES = [
  { id: "all", name: "All Labs", icon: <Terminal className="h-4 w-4" />, count: 6 },
  { id: "Web Security", name: "Web Security", icon: <Shield className="h-4 w-4" />, count: 2 },
  { id: "Network Defense", name: "Network Defense", icon: <Network className="h-4 w-4" />, count: 2 },
  { id: "Cryptography", name: "Cryptography", icon: <Lock className="h-4 w-4" />, count: 1 },
  { id: "Forensics", name: "Forensics", icon: <FileDigit className="h-4 w-4" />, count: 1 },
  { id: "CTF Challenges", name: "CTF Challenges", icon: <Flag className="h-4 w-4" />, count: 1 },
  { id: "Beginner Friendly", name: "Beginner Friendly", icon: <Sparkles className="h-4 w-4" />, count: 2 }
]

// Labs data
const LABS = [
  {
    id: "beginner-ctf",
    title: "Beginner CTF Challenge",
    description: "Learn the basics of Capture The Flag competitions with challenges covering web inspection, cryptography, metadata analysis, and code review.",
    difficulty: "Beginner",
    categories: ["CTF Challenges", "Beginner Friendly"],
    completionTime: "1-2 hours",
    icon: "🚩"
  },
  {
    id: "web-security-lab",
    title: "Web Vulnerability Lab",
    description: "Hands-on practice identifying and exploiting common web vulnerabilities including XSS, SQL injection, CSRF, and more across 5 progressive levels.",
    difficulty: "Intermediate",
    categories: ["Web Security"],
    completionTime: "2-3 hours",
    icon: "🌐"
  },
  {
    id: "network-defense-lab",
    title: "Network Defense Challenge",
    description: "Advanced network security training with 3 levels covering traffic analysis, intrusion detection, and firewall configuration techniques.",
    difficulty: "Advanced",
    categories: ["Network Defense"],
    completionTime: "3-4 hours",
    icon: "📊"
  },
  {
    id: "crypto-basics",
    title: "Cryptography Fundamentals",
    description: "Learn about encryption, hashing, and cryptographic attacks through interactive challenges and exercises.",
    difficulty: "Beginner",
    categories: ["Cryptography", "Beginner Friendly"],
    completionTime: "1-2 hours",
    icon: "🔐",
    comingSoon: true
  },
  {
    id: "forensic-investigation",
    title: "Digital Forensics Investigation",
    description: "Intermediate forensics training focusing on disk imaging, memory analysis, file recovery, and digital evidence examination with industry-standard tools.",
    difficulty: "Intermediate",
    categories: ["Forensics"],
    completionTime: "2-3 hours",
    icon: "🔍",
    comingSoon: true
  },
  {
    id: "advanced-penetration-testing",
    title: "Advanced Penetration Testing",
    description: "Comprehensive red team training covering advanced exploitation techniques, privilege escalation, lateral movement, and post-exploitation strategies.",
    difficulty: "Advanced",
    categories: ["Web Security", "Network Defense"],
    completionTime: "4-5 hours",
    icon: "⚔️",
    comingSoon: true
  },
]

export default function CyberLabs() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("all")
  const [filteredLabs, setFilteredLabs] = useState(LABS)
  const [mounted, setMounted] = useState(false)
  
  // Set mounted state on initial render
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update filtered labs when filter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredLabs(LABS);
    } else {
      setFilteredLabs(LABS.filter(lab => lab.categories.includes(activeFilter)));
    }
  }, [activeFilter]);
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Beginner": return "text-green-400";
      case "Intermediate": return "text-amber-400"; 
      case "Advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };
  
  return (
    <div className="min-h-screen bg-black cyber-dot-pattern">
      <CyberLabStyles />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with enhanced styling */}
          <div className="relative mb-16 border-b border-dashed border-gray-700 pb-10">
            <div className="absolute -top-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent"></div>
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF00]/20 to-transparent"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mt-4">
              <div>
                <div className="flex items-center mb-2">
                  <Badge className="bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 px-3 py-1 uppercase tracking-wide text-xs">Interactive Training</Badge>
                </div>
                <div className="flex items-center">
                  <h1 className="text-4xl font-bold text-white flex items-center">
                    CyberVerse <span className="text-[#00FF00] ml-2">Labs</span>
                    <div className="ml-3 h-2 w-2 rounded-full bg-[#00FF00] animate-pulse"></div>
                  </h1>
                </div>
                <div className="w-20 h-[1px] bg-gradient-to-r from-[#00FF00]/50 to-transparent my-4"></div>
                <p className="text-gray-300 max-w-2xl leading-relaxed">
                  Hands-on cybersecurity training labs to practice your skills in a safe, controlled environment. 
                  From beginner challenges to advanced scenarios, these labs help you develop practical security skills.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 mt-4 md:mt-0 md:items-end">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-[#00FF00]"></div>
                    <span className="text-gray-300 text-sm">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    <span className="text-gray-300 text-sm">Coming Soon</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-[#00FF00] hover:bg-[#00FF00]/5 border border-dashed border-gray-700 hover:border-[#00FF00]/30 transition-colors duration-200"
                  onClick={() => router.push('/cyber-labs/solutions')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Solutions
                </Button>
              </div>
            </div>
          </div>

          {/* Labs Grid with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLabs.map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={lab.comingSoon ? "#" : `/cyber-labs/${lab.id}`}>
                  <Card className={`lab-card bg-gray-900/20 border-dashed ${lab.comingSoon ? 'border-amber-800/30' : 'border-gray-800'} overflow-hidden hover:shadow-md transition-all duration-300 ${lab.comingSoon ? 'hover:border-amber-500/30' : 'hover:border-[#00FF00]/30'} h-full cursor-pointer relative group`}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${lab.comingSoon ? 'bg-amber-500/20' : 'bg-[#00FF00]/20'}`}></div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-black/40 to-transparent pointer-events-none"></div>
                    
                    <CardHeader className="bg-black/50 border-b border-dashed border-gray-700 transition-colors duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          <span className="text-3xl subtle-rotate-on-hover">{lab.icon}</span>
                          <div className={`flex items-center text-xs ${lab.comingSoon ? 'text-amber-400 lab-status-coming-soon' : 'text-[#00FF00] lab-status-available'} lab-status-indicator font-mono mt-1`}>
                            {lab.comingSoon ? 'COMING SOON' : 'AVAILABLE'}
                          </div>
                        </div>
                        <div>
                          {lab.comingSoon ? 
                            <CircleSlash className="h-5 w-5 text-amber-500/70" /> : 
                            <Verified className="h-5 w-5 text-[#00FF00]/70" />
                          }
                        </div>
                      </div>
                      <CardTitle className="text-xl text-white mt-2 group-hover:text-[#00FF00] transition-colors duration-200">
                        {lab.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mt-1">
                        {lab.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-5">
                      <div className="flex flex-wrap gap-2 mb-5">
                        {lab.categories.map((category, i) => (
                          <Badge 
                            key={i} 
                            className="bg-black/40 text-gray-300 border border-dashed border-gray-700"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-black/30 p-2 rounded border border-dashed border-gray-800 flex items-center gap-2">
                          <Sparkles className={`h-4 w-4 ${getDifficultyColor(lab.difficulty)}`} />
                          <span className="text-gray-300">{lab.difficulty}</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded border border-dashed border-gray-800 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-gray-300">{lab.completionTime}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-gray-800 pt-4 bg-black/20">
                      <Button 
                        variant="ghost"
                        className={`w-full ${lab.comingSoon 
                          ? 'text-amber-300 hover:bg-amber-900/10 hover:text-amber-300 hover:border-amber-500/40 border border-dashed border-amber-700/30' 
                          : 'text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] hover:border-[#00FF00]/40 border border-dashed border-[#00FF00]/30'
                        } transition-colors duration-200 group`}
                        disabled={lab.comingSoon}
                      >
                        {lab.comingSoon ? 'Coming Soon' : (
                          <>
                            Start Lab
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* No results message with improved styling */}
          {filteredLabs.length === 0 && (
            <div className="bg-black/30 border border-dashed border-gray-700 rounded-md p-8 text-center my-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/40 border border-dashed border-gray-700 mb-4">
                  <svg className="h-8 w-8 text-[#00FF00]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Labs Found</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-6">No labs match the selected category. Try a different filter or check back later for more labs.</p>
                
                <Button 
                  variant="ghost"
                  className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 transition-colors duration-200"
                  onClick={() => setActiveFilter("all")}
                >
                  View All Labs
                </Button>
              </div>
            </div>
          )}
          
          {/* Footer with improved styling */}
          <div className="mt-16 pt-6 border-t border-dashed border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0 flex items-center">
              <Terminal className="h-4 w-4 text-[#00FF00] mr-2" />
              Expand your cybersecurity skills with hands-on practice
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                className="text-[#00FF00] hover:text-[#00FF00] hover:bg-[#00FF00]/10 border border-dashed border-[#00FF00]/30 hover:border-[#00FF00]/50 transition-colors duration-200"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 