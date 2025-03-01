'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AILayout({ children }: { children: React.ReactNode }) {
  const [cursorVisible, setCursorVisible] = useState(true)
  
  // Blinking cursor effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible(v => !v)
    }, 600)
    
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <motion.section 
      className="flex min-h-screen flex-col items-center justify-between bg-cyberpunk-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Removing the header with back button and logo */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </motion.section>
  )
} 