"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import AuthButtons from "@/components/AuthButtons"

export default function Home() {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [currentNavIndex, setCurrentNavIndex] = useState(0)
  const [activeLink, setActiveLink] = useState("home")
  
  // Blinking cursor effect with slower, smoother transition
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 800) // Slowed down from 500ms to 800ms
    
    return () => {
      clearInterval(cursorInterval)
    }
  }, [])
  
  // Navigation items with hover animations
  const navItems = [
    { name: "CyberVerse", path: "/", id: "home" },
    { name: "Resources", path: "/resources", id: "resources" },
    { name: "Contact", path: "/contact", id: "contact" }
  ]

  // Terminal scans effect - with smoother, slower transitions
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setCurrentNavIndex(prev => (prev + 1) % navItems.length)
    }, 3000) // Slowed down from 2000ms to 3000ms
    
    return () => clearInterval(scanInterval)
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Improved Navigation Header */}
      <header className="relative z-10 border-b border-[#00FF00]/20">
        {/* Matrix-inspired digital rain line at top of navbar - smoother animation */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/30 to-[#00FF00]/0">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 5, // Slowed down from 3s to 5s
              ease: "easeInOut" // Changed from "linear" to "easeInOut"
            }}
            className="h-full w-32 bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/60 to-[#00FF00]/0"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 py-6 bg-black/90 backdrop-blur-sm">
          <nav className="flex items-center justify-between">
            {/* Logo with terminal-like cursor */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }} // Slowed down from 0.5s to 1s
              className="text-[#00FF00] font-mono text-lg font-bold flex items-center"
            >
              <span className="mr-1 text-[#00FF00]/80">&gt;</span>
              <span>CYBER_VERSE</span>
              <motion.span
                animate={{ opacity: cursorVisible ? 1 : 0 }}
                transition={{ duration: 0.4 }} // Added smooth fade instead of abrupt change
                className="ml-1"
              >
                _
              </motion.span>
            </motion.div>
            
            {/* Navigation links with terminal scan effect */}
            <div className="flex-1 flex justify-center">
              <div className="hidden md:flex gap-10 font-mono text-sm tracking-widest">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0.7 }}
                    animate={{ 
                      opacity: currentNavIndex === index ? 1 : 0.7,
                      color: currentNavIndex === index ? "#00FF00" : "#AAFFAA"
                    }}
                    transition={{ duration: 1 }} // Slowed down from 0.3s to 1s
                    className="relative group"
                    onMouseEnter={() => setActiveLink(item.id)}
                  >
                    <Link 
                      href={item.path} 
                      className="relative z-10 text-[#00FF00] group-hover:text-white transition-colors duration-500" // Slowed from 300ms to 500ms
                    >
                      {item.name.toUpperCase()}
                      {currentNavIndex === index && (
                        <motion.span
                          animate={{ opacity: cursorVisible ? 1 : 0 }}
                          transition={{ duration: 0.4 }} // Added smooth fade
                          className="ml-1"
                        >
                          |
                        </motion.span>
                      )}
                    </Link>
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ 
                        width: activeLink === item.id ? '100%' : '0%',
                        opacity: activeLink === item.id ? 0.8 : 0
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }} // Smoothed animation
                      className="absolute -bottom-2 left-0 h-0.5 bg-[#00FF00]"
                    />
                    {/* Digital noise on hover - with more subtle animation */}
                    <motion.div 
                      className="absolute -inset-1 bg-[#00FF00]/5 opacity-0 group-hover:opacity-100 -z-10 rounded transition-opacity duration-400"
                      animate={{ 
                        opacity: [0, 0.03, 0.01, 0.04, 0.02, 0.01], // Reduced intensity
                        scale: [0.99, 1, 0.995, 1.005, 1, 0.995] // More subtle scale changes
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, // Slowed from 2s to 3s
                        repeatType: "reverse",
                        ease: "easeInOut" // Added easing
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Mobile menu button (shows on small screens) */}
            <div className="md:hidden text-[#00FF00]">
              <button className="relative px-3 py-3 border border-[#00FF00]/30 rounded overflow-hidden group">
                <span className="block w-5 h-0.5 bg-[#00FF00] mb-1 group-hover:translate-x-1 transition-transform duration-500"></span>
                <span className="block w-5 h-0.5 bg-[#00FF00] mb-1 transition-all duration-500"></span>
                <span className="block w-5 h-0.5 bg-[#00FF00] group-hover:-translate-x-1 transition-transform duration-500"></span>
                {/* Scan line animation on hover - smoother */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#00FF00]/10 -z-10 transition-opacity duration-500"
                  animate={{ opacity: [0, 0.05, 0] }} // Reduced intensity
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} // Slowed and smoothed
                />
              </button>
            </div>
            
            {/* Auth Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }} // Slowed from 0.5s to 1s
              className="hidden md:block relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/10 to-[#00FF00]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" /> {/* Slowed transition */}
              <AuthButtons variant="minimal" />
            </motion.div>
          </nav>
        </div>
        
        {/* Circuit-line pattern below navbar - smoother, more subtle */}
        <div className="h-[1px] w-full bg-black overflow-hidden">
          <div className="w-full h-full bg-[#00FF00]/10 flex">
            {[...Array(15)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0.05, 0.3, 0] }} // Reduced intensity
                transition={{ 
                  duration: 4, // Slowed from 3s to 4s
                  delay: i * 0.3, // More spacing between animations
                  repeat: Infinity,
                  repeatDelay: Math.random() * 7, // More randomness
                  ease: "easeInOut" // Smoother transitions
                }}
                style={{ width: `${Math.floor(Math.random() * 5) + 2}%` }}
                className="h-full bg-[#00FF00]"
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="text-xs tracking-wider text-gray-400">
                Powered by{" "}
                <Link
                  href="https://sans.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
                >
                  SANS AI
                </Link>
              </div>
              <h1
                className="text-7xl font-bold tracking-tighter text-white"
                style={{ fontFamily: "Arial Black" }}
              >
                <span className="inline-block transform -skew-x-12">CYB</span>
                <span className="inline-block transform skew-x-12">ER</span>
                <span className="block mt-2">
                  <span className="inline-block transform -skew-x-12">VER</span>
                  <span className="inline-block transform skew-x-12">SE</span>
                </span>
              </h1>
              <div className="space-y-1">
                <p className="text-[#00FF00] text-sm">"FROM BASICS TO BRILLANCE "</p>
                <p className="text-gray-400 text-xs tracking-wider">
                Unlock the Infinite World of Cyber Knowledge.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link
                  href="/what-you-want-to-know"
                  className="inline-block bg-transparent border border-[#00FF00]/20 text-[#00FF00] 
                           px-8 py-4 text-sm tracking-wider rounded-sm hover:bg-[#00FF00]/10 
                           transition-all duration-300"
                >
                  START LEARNING
                </Link>
                <Link
                  href="/learn"
                  className="inline-block bg-[#00FF00]/10 text-[#00FF00] 
                           px-8 py-4 text-sm tracking-wider rounded-sm hover:bg-[#00FF00]/20 
                           transition-all duration-300"
                >
                  LEARN MORE
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 text-xs text-gray-500">
            <span>0</span>
            <span className="text-[#00FF00]">1</span>
          </div>
          <div className="text-[10px] text-gray-500">
            2025 © CyberVerse: Beyond All Things Cyber.
          </div>
        </div>
      </footer>
    </div>
  )
}