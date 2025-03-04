"use client"
import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Link from "next/link"

// Define the shape of a resource object
interface Resource {
  id: number;
  title: string;
  description: string;
  link: string;
  image: string;
}

// Define the props for the ResourceCard component
interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  // Enhanced spring animation settings for smoother transitions
  const transitionSettings = prefersReducedMotion 
    ? { duration: 0.1 }
    : { 
        type: "spring", 
        stiffness: 250, 
        damping: 25, 
        mass: 0.5,
        velocity: 2
      }
  
  // Define button animation variants based on hover state
  const buttonVariants = {
    normal: {
      scale: 1,
      backgroundColor: "transparent",
      borderColor: "rgba(0, 255, 0, 0.3)"
    },
    highlighted: {
      scale: prefersReducedMotion ? 1 : 1.05,
      backgroundColor: "rgba(0, 255, 0, 0.15)",
      borderColor: "rgba(0, 255, 0, 0.6)"
    }
  }

  return (
    <motion.div
      layout
      layoutId={`resource-${resource.id}`}
      transition={transitionSettings}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: prefersReducedMotion ? 1 : 1.03,
        boxShadow: "0 0 15px rgba(0, 255, 0, 0.15)"
      }}
      className="relative overflow-hidden border border-dashed border-[#00FF00] rounded-none bg-black/40"
    >
      {/* Text Content & Explore Button with enhanced animations */}
      <motion.div
        className="p-6 flex flex-col sm:flex-row items-center justify-between"
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div>
          <motion.h2 
            className="text-2xl font-bold mb-2 text-[#00FF00]"
            initial={{ opacity: 0.8, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {resource.title}
          </motion.h2>
          <motion.p 
            className="text-sm text-gray-400"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {resource.description}
          </motion.p>
        </div>
        <Link href={resource.link}>
          <motion.button
            animate={isHovered ? "highlighted" : "normal"}
            variants={buttonVariants}
            whileTap={{ 
              scale: prefersReducedMotion ? 1 : 0.97,
              backgroundColor: "rgba(0, 255, 0, 0.25)"
            }}
            transition={{ 
              duration: 0.2, 
              ease: [0.2, 0.65, 0.3, 0.9]
            }}
            className="mt-4 sm:mt-0 text-[#00FF00] border border-dashed px-4 py-2 rounded hover:bg-[#00FF00]/10 transition-all duration-300"
          >
            Explore
          </motion.button>
        </Link>
      </motion.div>
      {/* Image hover effect with smoother animations */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.25 }
            }}
            className="w-full aspect-[6/1] relative overflow-hidden"
          >
            <motion.img
              initial={{ scale: 1.1, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 1.05, y: 5 }}
              transition={{ duration: 0.5 }}
              src={resource.image}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Resources() {
  // Define an array of resources using the Resource type
  const resources: Resource[] = [
    {
      id: 1,
      title: "Cybersecurity Resources",
      description: "Discover and share valuable cybersecurity resources with the community",
      link: "/resources",
      image: "https://i.imgur.com/hVbtsgQ.jpeg"
    },
    {
      id: 2,
      title: "Cyber-verse Chat Bot",
      description: "Your guide to the digital realm. Ask chat bot about anything about cybersecurity, hacking, defense, or technical concepts.",
      link: "/ai-chat",
      image: "https://i.imgur.com/pjCk3R2.jpeg"
    },
    {
      id: 3,
      title: "Resource Three",
      description: "A brief overview of Resource Three.",
      link: "/resources/3",
      image: "/images/resource3.jpg"
    },
    {
      id: 4,
      title: "Resource Four",
      description: "A brief overview of Resource Four.",
      link: "/resources/4",
      image: "/images/resource4.jpg"
    }
  ]

  const prefersReducedMotion = useReducedMotion()

  // Staggered entrance animation variants for the resource cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  return (
    <div
      className="relative min-h-screen bg-black overflow-hidden"
      style={{
        fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace"
      }}
    >
      {/* Header with scan line effect and back arrow button */}
      <header className="relative z-10 border-b border-dashed border-[#00FF00]/20">
        <div className="h-1 w-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/30 to-[#00FF00]/0">
          <motion.div 
            initial={{ x: '-100%', width: '25%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 3.5, 
              ease: "easeInOut",
              repeatType: "loop"
            }}
            className="h-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/80 to-[#00FF00]/0"
          />
        </div>
        <div className="max-w-7xl mx-auto px-8 py-6 bg-black/90 backdrop-blur-sm flex items-center">
          <Link href="/">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 mr-4 border border-dashed border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black transition-all duration-300 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </Link>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="text-4xl font-bold text-[#00FF00]"
            >
              RESOURCES
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ 
                duration: 1, 
                delay: 0.3,
                ease: [0.25, 1, 0.5, 1] 
              }}
              className="mt-2 text-gray-400 tracking-wide"
            >
              Explore our collection of cyber resources.
            </motion.p>
          </div>
        </div>
      </header>

      {/* Main Content with staggered animations */}
      <main className="relative z-10 px-8 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto flex flex-col gap-4"
        >
          {resources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={itemVariants}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer with pulsating effect */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 text-xs text-gray-500">
            <span>0</span>
            <motion.span 
              animate={{ 
                opacity: [0.4, 1, 0.4], 
                textShadow: ["0 0 0px #00FF00", "0 0 8px #00FF00", "0 0 0px #00FF00"]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="text-[#00FF00]"
            >
              1
            </motion.span>
          </div>
          <div className="text-[10px] text-gray-500">
            2025 © CyberVerse: Beyond All Things Cyber.
          </div>
        </div>
      </footer>

      {/* Enhanced background grid effect with subtle animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(#00FF00 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ 
            opacity: [0.03, 0.06, 0.03],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(#00FF00 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            backgroundPosition: '25px 25px'
          }}
        />
      </div>
    </div>
  )
}
