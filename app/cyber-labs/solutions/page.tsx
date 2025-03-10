"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, KeyRound, Flag, ShieldCheck, Terminal, LockKeyhole, BookOpenIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

// Available labs with solutions
const LABS = [
  {
    id: "beginner-ctf",
    title: "Beginner CTF Challenge",
    description: "Solutions for the Beginner CTF Lab with Web Inspection, Cryptography, Metadata, and Code Analysis challenges",
    difficulty: "Beginner",
    totalChallenges: 4,
    icon: "🚩",
    color: "green",
    categories: ["Web", "Crypto", "Forensics", "Code"]
  },
  {
    id: "network-defense-lab",
    title: "Network Defense Challenge",
    description: "Solutions for the advanced Network Defense Lab covering traffic analysis, intrusion detection, and firewall configuration",
    difficulty: "Advanced",
    totalChallenges: 3,
    icon: "📊",
    color: "red",
    categories: ["Network"]
  },
  {
    id: "web-security-lab",
    title: "Web Vulnerability Lab",
    description: "Solutions for the Web Security Lab covering XSS, SQL injection, CSRF, authentication, and Content Security Policy",
    difficulty: "Intermediate",
    totalChallenges: 5,
    icon: "🌐",
    color: "blue",
    categories: ["Web"]
  },
  // Add more labs here in the future
]

export default function SolutionsLandingPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with terminal-style decoration */}
        <div className="relative mb-12 border-b border-dashed border-gray-700 pb-8">
          <div className="absolute -top-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent"></div>
          <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF00]/20 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <div>
              <div className="flex items-center mb-3">
                <Link href="/cyber-labs">
                  <Button
                    variant="ghost"
                    className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 transition-colors duration-200"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Labs
                  </Button>
                </Link>
                <Badge className="ml-3 bg-amber-600/20 text-amber-300 border border-amber-500/30 px-3 py-1 uppercase tracking-wide text-xs">Solutions</Badge>
              </div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-white mr-3">Lab Solutions Hub</h1>
                <div className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse"></div>
              </div>
              <p className="text-gray-200 mt-2 max-w-2xl leading-relaxed">
                Select a lab to view detailed solutions and explanations for its challenges. These solutions help you understand the techniques and concepts behind each challenge.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Alert className="bg-amber-900/20 border-dashed border-amber-600/30 py-2 px-4">
                <LockKeyhole className="h-4 w-4 text-amber-300 mr-2" />
                <AlertDescription className="text-amber-300 text-sm">
                  These solutions are learning resources. Try to solve challenges on your own first!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Available Labs Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BookOpenIcon className="mr-2 h-5 w-5 text-[#00FF00]" />
            Available Labs with Solutions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {LABS.map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/cyber-labs/solutions/${lab.id}`}>
                  <Card className="bg-gray-900/20 border-dashed border-gray-800 overflow-hidden hover:shadow-md hover:border-[#00FF00]/30 transition-all duration-300 h-full cursor-pointer relative group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-black/40 to-transparent pointer-events-none"></div>
                    
                    <CardHeader className="bg-black/50 border-b border-dashed border-gray-700 transition-colors duration-200 pb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-4xl mr-2 filter group-hover:drop-shadow-glow transition-all duration-300">{lab.icon}</div>
                        <Badge className="bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                          {lab.totalChallenges} Challenges
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl text-white mt-3 group-hover:text-[#00FF00] transition-colors duration-200">{lab.title}</CardTitle>
                      <CardDescription className="text-gray-300 mt-2">
                        {lab.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-2">
                        {lab.categories.map((category, i) => (
                          <div key={i} className="flex items-center bg-black/40 px-3 py-2 rounded-sm border border-dashed border-gray-700 text-sm">
                            {category === "Web" && (
                              <span className="text-blue-300">Web</span>
                            )}
                            {category === "Crypto" && (
                              <span className="text-purple-300">Crypto</span>
                            )}
                            {category === "Forensics" && (
                              <span className="text-green-300">Forensics</span>
                            )}
                            {category === "Code" && (
                              <span className="text-orange-300">Code</span>
                            )}
                            {category === "Network" && (
                              <span className="text-red-300">Network</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2 text-[#00FF00]" />
                          <span className="text-gray-300">Difficulty: {lab.difficulty}</span>
                        </div>
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 mr-2 text-amber-400" />
                          <span className="text-gray-300">Complete Solutions</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-gray-800 pt-4 bg-black/20">
                      <Button 
                        variant="ghost"
                        className="w-full text-amber-300 hover:bg-amber-900/10 hover:text-amber-300 hover:border-amber-500/40 border border-dashed border-amber-700/30 transition-colors duration-200"
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        View Solutions
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer navigation */}
        <div className="pt-6 border-t border-dashed border-gray-800 flex items-center justify-between">
          <div className="text-gray-300 text-sm flex items-center">
            <Terminal className="h-4 w-4 mr-2 text-[#00FF00]" />
            Ready to practice? Return to labs to start a challenge
          </div>
          
          <Button
            variant="ghost"
            onClick={() => router.push('/cyber-labs')}
            className="text-gray-300 hover:text-[#00FF00] hover:bg-[#00FF00]/5 border border-dashed border-gray-700 hover:border-[#00FF00]/30 transition-colors duration-200"
          >
            Back to Labs
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 