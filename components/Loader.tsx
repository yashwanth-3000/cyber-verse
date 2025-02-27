"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Shield, Lock, Fingerprint, Scan, Key } from 'lucide-react'

export const Loader = () => {
  const [progress, setProgress] = useState(0)

  // Single useEffect for progress
  useEffect(() => {
    // Progress interval
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : prev))
    }, 30)
    
    // Clean up interval on unmount
    return () => {
      clearInterval(progressInterval)
    }
  }, [])

  // Icon animation variants
  const iconVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      scale: 0,
      opacity: 0,
      rotate: 180,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }

  // Get current icon based on progress
  const getCurrentIcon = () => {
    if (progress < 20) return <Shield className="w-12 h-12" />
    if (progress < 40) return <Lock className="w-12 h-12" />
    if (progress < 60) return <Fingerprint className="w-12 h-12" />
    if (progress < 80) return <Scan className="w-12 h-12" />
    return <Key className="w-12 h-12" />
  }

  // Calculate circle path for progress indicator
  const radius = 60; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      <div className="relative">
        {/* Main rotating circle */}
        <motion.div 
          className="w-32 h-32 rounded-full border-2 border-[#00FF00]/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Circular progress bar */}
        <svg className="absolute inset-0 w-32 h-32 -rotate-90">
          <circle 
            cx="64" 
            cy="64" 
            r={radius} 
            stroke="#00FF00" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Pulsing background */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-[#00FF00]/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Scanning line */}
        <motion.div 
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#00FF00]/50 to-transparent transform -translate-y-1/2" />
        </motion.div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center text-[#00FF00]">
          <motion.div
            key={Math.floor(progress / 20)}
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {getCurrentIcon()}
          </motion.div>
        </div>
      </div>

      {/* Status text */}
      <div className="absolute mt-40 font-mono text-sm text-[#00FF00]">
        <span className="mr-1 text-[#00FF00]/80">&gt;</span>
        SECURING {progress}%
      </div>
    </div>
  )
}