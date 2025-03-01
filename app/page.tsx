"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import AuthButtons from "@/components/AuthButtons"

export default function Home() {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [currentNavIndex, setCurrentNavIndex] = useState(0)
  const [activeLink, setActiveLink] = useState("home")
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 800)
    return () => clearInterval(cursorInterval)
  }, [])
  
  // Navigation items
  const navItems = [
    { name: "CyberVerse", path: "/", id: "home" },
    { name: "Resources", path: "/resources", id: "resources" },
    { name: "Contact", path: "/contact", id: "contact" }
  ]

  // Terminal scan effect
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setCurrentNavIndex(prev => (prev + 1) % navItems.length)
    }, 3000)
    return () => clearInterval(scanInterval)
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Navigation Header with decreased height and bottom dashed border */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 bg-black/90 backdrop-blur-sm border-b border-dashed border-[#00FF00]">
          <nav className="relative flex items-center justify-between">
            {/* Logo with terminal-like cursor */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-[#00FF00] font-mono text-lg font-bold flex items-center"
            >
              <span className="mr-1 text-[#00FF00]/80">&gt;</span>
              <span>CYBER_VERSE</span>
              <motion.span
                animate={{ opacity: cursorVisible ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="ml-1"
              >
                _
              </motion.span>
            </motion.div>
            
            {/* Navigation links */}
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
                    transition={{ duration: 1 }}
                    className="relative group"
                    onMouseEnter={() => setActiveLink(item.id)}
                  >
                    <Link 
                      href={item.path} 
                      className="relative z-10 text-[#00FF00] group-hover:text-white transition-colors duration-500"
                    >
                      {item.name.toUpperCase()}
                      {currentNavIndex === index && (
                        <motion.span
                          animate={{ opacity: cursorVisible ? 1 : 0 }}
                          transition={{ duration: 0.4 }}
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
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute -bottom-2 left-0 h-0.5 bg-[#00FF00]"
                    />
                    {/* Digital noise on hover */}
                    <motion.div 
                      className="absolute -inset-1 bg-[#00FF00]/5 opacity-0 group-hover:opacity-100 -z-10 rounded transition-opacity duration-400"
                      animate={{ 
                        opacity: [0, 0.03, 0.01, 0.04, 0.02, 0.01],
                        scale: [0.99, 1, 0.995, 1.005, 1, 0.995]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden text-[#00FF00]">
              <button className="relative px-3 py-3 rounded overflow-hidden group">
                <span className="block w-5 h-0.5 bg-[#00FF00] mb-1 group-hover:translate-x-1 transition-transform duration-500"></span>
                <span className="block w-5 h-0.5 bg-[#00FF00] mb-1 transition-all duration-500"></span>
                <span className="block w-5 h-0.5 bg-[#00FF00] group-hover:-translate-x-1 transition-transform duration-500"></span>
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#00FF00]/10 -z-10 transition-opacity duration-500"
                  animate={{ opacity: [0, 0.05, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
              </button>
            </div>
            
            {/* Auth Button with pill-shaped dashed border */}
            <div className="hidden md:block">
              <div className="inline-flex items-center justify-center rounded-full border border-dashed border-[#00FF00]">
                <AuthButtons variant="minimal" />
              </div>
            </div>
          </nav>
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
                {/* START LEARNING button styled as a rectangle with dashed border and curved corners */}
                <Link
                  href="/what-you-want-to-know"
                  className="inline-flex items-center justify-center border border-dashed border-[#00FF00] rounded-md px-8 py-4 text-sm tracking-wider text-[#00FF00] hover:bg-[#00FF00]/10 transition-all duration-300"
                >
                  START LEARNING
                </Link>
                {/* GitHub button with a standard style and less intense green */}
                <Link
                  href="https://github.com/your-repo"  // Replace with your actual GitHub repo URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#00FF00]/5 text-[#00FF00]/80 px-8 py-4 text-sm tracking-wider rounded-sm hover:bg-[#00FF00]/10 transition-all duration-300"
                >
                  <svg
                    className="h-6 w-6 inline-block mr-2"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  GitHub
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
