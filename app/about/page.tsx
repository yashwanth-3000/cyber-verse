"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Github, Linkedin, ExternalLink, Braces, ShieldAlert, Code, Brain, Terminal } from "lucide-react"

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()
  const [cursorBlink, setCursorBlink] = useState(true)
  const [textComplete, setTextComplete] = useState(false)
  const [activeSection, setActiveSection] = useState("about")
  
  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])
  
  // Typewriter effect completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextComplete(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Typing animation settings
  const typeVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.03,
      }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  }

  // Section reveal animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  // Function to create letter by letter animation
  const AnimatedText = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => (
    <motion.span
      variants={typeVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="inline-block"
    >
      {text.split("").map((char: string, i: number) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className={`inline-block ${className}`}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  )

  return (
    <div className="min-h-screen bg-black font-mono text-white overflow-hidden relative">
      {/* Background with minimal styling */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black"></div>

      {/* Enhanced Header with scan line effect */}
      <header className="relative z-10 border-b border-dashed border-[#00FF00]/30">
        <div className="h-1 w-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/30 to-[#00FF00]/0">
          <motion.div 
            initial={{ x: '-100%', width: '30%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut"
            }}
            className="h-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/80 to-[#00FF00]/0"
          />
        </div>
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center">
          <Link href="/">
            <motion.button 
              whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(0, 255, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="p-2 mr-4 border border-dashed border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/10 transition-all duration-300 rounded-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[#00FF00]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <ArrowLeft className="h-6 w-6 relative z-10" />
            </motion.button>
          </Link>
          <div>
            <div className="flex items-center">
              <div className="mr-2 text-[#00FF00]/80">
                <Terminal className="h-6 w-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#00FF00] tracking-tight relative flex items-center">
                <span>ABOUT</span>
                <span className={`ml-1 text-[#00FF00] ${cursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity inline-block`}>_</span>
              </h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-2 text-gray-400 tracking-wide"
            >
              <span className="text-[#00FF00]/80">$</span> whoami | The story behind CyberVerse
            </motion.p>
          </div>
        </div>
      </header>

      {/* Main Content with improved layout */}
      <main className="relative z-10 px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Enhanced Profile */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-black/50 backdrop-blur-md border border-dashed border-[#00FF00]/30 p-6 rounded-lg relative overflow-hidden"
            >
              {/* Enhanced animated accent corners */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#00FF00] opacity-60"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#00FF00] opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#00FF00] opacity-60"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#00FF00] opacity-60"></div>
              
              {/* Enhanced Profile content */}
              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="w-36 h-36 rounded-full p-1 mb-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,255,0,0.3) 100%)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwyNTUsMCwwLjMpIiBzdHJva2Utd2lkdGg9IjEiLz48cmVjdCB4PSIzMCIgeT0iMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjU1LDAsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSI0LDQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjU1LDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20"></div>
                    <Image 
                      src="https://i.imgur.com/tdHUjkg.png" 
                      alt="Yashwanth"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-2xl font-bold text-[#00FF00] mb-1 relative"
                >
                  <span className="relative">
                    Yashwanth Krishna
                    <motion.span 
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00FF00]/30"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                  </span>
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mb-6"
                >
                  <span className="text-[#00FF00] opacity-75 text-sm relative px-3 py-1 bg-[#00FF00]/5 rounded-sm">
                    SANS AI Cybersecurity Hackathon
                  </span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="flex space-x-6"
                >
                  <motion.a 
                    href="https://github.com/yashwanth-3000" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#00FF00] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Github className="h-5 w-5 relative z-10" />
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-[#00FF00] group-hover:w-full transition-all duration-300"></span>
                  </motion.a>
                  <motion.a 
                    href="https://www.linkedin.com/in/pyashwanthkrishna/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#00FF00] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Linkedin className="h-5 w-5 relative z-10" />
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-[#00FF00] group-hover:w-full transition-all duration-300"></span>
                  </motion.a>
                  <motion.a 
                    href="https://devpost.com/yashwanth-3000" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#00FF00] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink className="h-5 w-5 relative z-10" />
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-[#00FF00] group-hover:w-full transition-all duration-300"></span>
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 border border-dashed border-[#00FF00]/30 rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm"
            >
              <div className="flex flex-col divide-y divide-[#00FF00]/10">
                <button 
                  onClick={() => setActiveSection("about")}
                  className={`flex items-center px-6 py-4 text-left transition-all duration-700 ease-in-out relative overflow-hidden ${
                    activeSection === "about" 
                      ? "bg-[#00FF00]/10 text-[#00FF00]" 
                      : "text-gray-400 hover:bg-[#00FF00]/5 hover:text-[#00FF00]/80"
                  }`}
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00FF00]/70 transition-all duration-500 ${activeSection === "about" ? "opacity-100" : "opacity-0"}`}></span>
                  <Code className="h-4 w-4 mr-3" />
                  <span>About Project</span>
                  {activeSection === "about" && (
                    <motion.span 
                      initial={{ x: -10, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ duration: 0.3 }}
                      className="ml-auto text-[#00FF00]"
                    >
                      →
                    </motion.span>
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveSection("features")}
                  className={`flex items-center px-6 py-4 text-left transition-all duration-700 ease-in-out relative overflow-hidden ${
                    activeSection === "features" 
                      ? "bg-[#00FF00]/10 text-[#00FF00]" 
                      : "text-gray-400 hover:bg-[#00FF00]/5 hover:text-[#00FF00]/80"
                  }`}
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00FF00]/70 transition-all duration-500 ${activeSection === "features" ? "opacity-100" : "opacity-0"}`}></span>
                  <ShieldAlert className="h-4 w-4 mr-3" />
                  <span>Key Features</span>
                  {activeSection === "features" && (
                    <motion.span 
                      initial={{ x: -10, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ duration: 0.3 }}
                      className="ml-auto text-[#00FF00]"
                    >
                      →
                    </motion.span>
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveSection("hackathon")}
                  className={`flex items-center px-6 py-4 text-left transition-all duration-700 ease-in-out relative overflow-hidden ${
                    activeSection === "hackathon" 
                      ? "bg-[#00FF00]/10 text-[#00FF00]" 
                      : "text-gray-400 hover:bg-[#00FF00]/5 hover:text-[#00FF00]/80"
                  }`}
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00FF00]/70 transition-all duration-500 ${activeSection === "hackathon" ? "opacity-100" : "opacity-0"}`}></span>
                  <Brain className="h-4 w-4 mr-3" />
                  <span>Hackathon</span>
                  {activeSection === "hackathon" && (
                    <motion.span 
                      initial={{ x: -10, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ duration: 0.3 }}
                      className="ml-auto text-[#00FF00]"
                    >
                      →
                    </motion.span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Enhanced Content */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            <motion.div 
              initial={{ borderColor: "rgba(0, 255, 0, 0.1)" }}
              animate={{ borderColor: "rgba(0, 255, 0, 0.3)" }}
              transition={{ duration: 1.5, delay: 1 }}
              className="bg-black/50 backdrop-blur-md border border-dashed border-[#00FF00]/10 p-8 rounded-lg relative overflow-hidden"
            >
              {/* Terminal header */}
              <div className="mb-6 flex items-center relative z-10">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs text-gray-500 font-mono bg-black/70 border border-gray-800 rounded py-1 px-3 overflow-x-auto whitespace-nowrap relative">
                    <span className="text-blue-400">~/</span>
                    <span className="text-[#00FF00]">cyber-verse</span>
                    <span className="text-gray-400"> [main] </span>
                    <motion.span 
                      className="inline-block w-2 h-4 bg-[#00FF00]/70 ml-1 align-middle"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {activeSection === "about" && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    variants={containerVariants}
                    className="relative z-10"
                  >
                    <motion.h3 
                      variants={itemVariants}
                      className="text-2xl font-bold text-[#00FF00] mb-6 relative inline-block"
                    >
                      CyberVerse Project
                      <motion.span 
                        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00] to-[#00FF00]/0"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                      />
                    </motion.h3>
                    
                    <motion.div variants={itemVariants} className="space-y-5 text-gray-300">
                      <p className="border-l-2 border-[#00FF00]/30 pl-4 py-1 bg-black/20">
                        <span className="text-[#00FF00]">CyberVerse</span> is a comprehensive cybersecurity learning and resource platform designed to help individuals navigate the complex digital security landscape. 
                      </p>
                      
                      <p>
                        Built as a submission for the <a href="https://ai-cybersecurity-hackathon.devpost.com" target="_blank" rel="noopener noreferrer" className="text-[#00FF00] underline hover:no-underline relative group">
                          SANS AI Cybersecurity Hackathon
                          <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#00FF00]/50 group-hover:bg-[#00FF00] transition-colors"></span>
                        </a>, this project integrates cutting-edge AI capabilities with practical cybersecurity tools and educational resources.
                      </p>
                      
                      <p>
                        The platform features interactive phishing training simulations, AI-powered chat assistance, curated cybersecurity resources, and hands-on cyber labs designed to enhance security awareness and practical skills.
                      </p>
                      
                      <div className="mt-8 p-4 bg-black/30 border border-[#00FF00]/20 rounded-md relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/5 to-[#00FF00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <p className="text-[#00FF00] text-sm relative z-10">
                          <span className="text-white opacity-70 font-bold">$</span> Mission: To democratize cybersecurity knowledge and make advanced security concepts accessible to everyone through interactive learning and AI assistance.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                
                {activeSection === "features" && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    variants={containerVariants}
                  >
                    <motion.h3 
                      variants={itemVariants}
                      className="text-2xl font-bold text-[#00FF00] mb-4"
                    >
                      Key Features
                    </motion.h3>
                    
                    <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">🤖 AI-Powered Assistant</h4>
                          <p className="text-sm text-gray-300">Intelligent chatbot providing real-time cybersecurity guidance and answering security-related questions.</p>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">🎓 Interactive Training</h4>
                          <p className="text-sm text-gray-300">Realistic phishing simulations and security awareness training with immediate feedback.</p>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">📚 Resource Hub</h4>
                          <p className="text-sm text-gray-300">Curated cybersecurity resources with community contribution and personalized recommendations.</p>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">🔬 Cyber Labs</h4>
                          <p className="text-sm text-gray-300">Hands-on laboratories for practicing defense techniques and security hardening.</p>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">📰 Security News</h4>
                          <p className="text-sm text-gray-300">Up-to-date cybersecurity news, breaches, and vulnerability alerts.</p>
                        </motion.div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ 
                          y: -5, 
                          boxShadow: "0 10px 25px -5px rgba(0, 255, 0, 0.1)",
                          backgroundColor: "rgba(0, 255, 0, 0.05)"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40 transition-all duration-300"
                      >
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                          <h4 className="text-[#00FF00] font-bold mb-2">📅 Events Calendar</h4>
                          <p className="text-sm text-gray-300">Comprehensive listing of cybersecurity events, conferences, and training opportunities.</p>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
                
                {activeSection === "hackathon" && (
                  <motion.div
                    key="hackathon"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    variants={containerVariants}
                  >
                    <motion.h3 
                      variants={itemVariants}
                      className="text-2xl font-bold text-[#00FF00] mb-4"
                    >
                      SANS AI Cybersecurity Hackathon
                    </motion.h3>
                    
                    <motion.div variants={itemVariants} className="space-y-4 text-gray-300">
                      <p>
                        CyberVerse was developed as a submission for the <a href="https://ai-cybersecurity-hackathon.devpost.com" target="_blank" rel="noopener noreferrer" className="text-[#00FF00] underline hover:no-underline">SANS AI Cybersecurity Hackathon</a> — a global virtual competition focused on developing AI-driven solutions to secure systems, protect sensitive data, and counter emerging cyber threats.
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-4 my-6">
                        <div className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40">
                          <h4 className="text-[#00FF00] font-bold mb-2">🏆 Competition Focus</h4>
                          <p className="text-sm">Create open-source solutions addressing pressing cybersecurity challenges by integrating AI technologies.</p>
                        </div>
                        
                        <div className="p-4 border border-[#00FF00]/20 rounded-md bg-black/40">
                          <h4 className="text-[#00FF00] font-bold mb-2">⏱️ Timeline</h4>
                          <p className="text-sm">February 15 - March 15, 2025<br />Winners announced at AI Cybersecurity Summit (March 31)</p>
                        </div>
                      </div>
                      
                      <p>
                        The hackathon challenges participants to innovate in areas such as threat detection, automated incident response, vulnerability scanning, and security education — all leveraging the power of AI to enhance cybersecurity capabilities.
                      </p>
                      
                      <div className="p-4 mt-4 border border-[#00FF00]/20 rounded-md bg-black/30">
                        <h4 className="text-[#00FF00] font-bold mb-2">Project Inspiration</h4>
                        <p className="text-sm">
                          "I created CyberVerse to address the growing cybersecurity skills gap by making advanced security concepts accessible through interactive learning experiences enhanced by AI. My goal was to build a platform that could scale security education and empower individuals to better protect themselves and their organizations in an increasingly complex threat landscape."
                        </p>
                        <p className="text-sm mt-2 text-right">— Yashwanth Krishna</p>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <motion.a 
                          href="https://ai-cybersecurity-hackathon.devpost.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded-md transition-all duration-300"
                          whileHover={{ 
                            backgroundColor: "rgba(0, 255, 0, 0.15)",
                            boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                            scale: 1.02
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>View Hackathon Details</span>
                          <motion.div 
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </motion.div>
                        </motion.a>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="relative z-10 mt-16 px-8 py-6 border-t border-dashed border-[#00FF00]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/30 to-[#00FF00]/0"></div>
          
          <div className="mb-4 md:mb-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-[#00FF00] text-sm font-mono"
            >
              <span className="text-gray-500">&copy; {new Date().getFullYear()} ·</span> CyberVerse <span className="text-gray-500">· Built by</span> Yashwanth Krishna
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex items-center text-xs text-gray-500"
          >
            <div className="flex items-center mr-3">
              <motion.span 
                className="inline-block w-2 h-2 rounded-full bg-[#00FF00] mr-1"
                animate={{ 
                  boxShadow: ["0 0 2px rgba(0, 255, 0, 0.5)", "0 0 8px rgba(0, 255, 0, 0.7)", "0 0 2px rgba(0, 255, 0, 0.5)"]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              ></motion.span>
              <span>System Operational</span>
            </div>
            <div className="text-[#00FF00]">
              <span className="text-gray-500">v1.0.0</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
} 