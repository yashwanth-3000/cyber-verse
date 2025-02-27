"use client"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Resources() {
  const resources = [
    {
      id: 1,
      title: "Cybersecurity Resources",
      description: "Discover and share valuable cybersecurity resources with the community Share Resource",
      link: "/resources",
      image: "https://i.imgur.com/hVbtsgQ.jpeg"
    },
    {
      id: 2,
      title: "Resource Two",
      description: "A brief overview of Resource Two.",
      link: "/resources/2",
      image: "/images/resource2.jpg"
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

  return (
    <div
      className="relative min-h-screen bg-black overflow-hidden"
      style={{
        fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace"
      }}
    >
      {/* Header with dashed border and digital rain line */}
      <header className="relative z-10 border-b border-dashed border-[#00FF00]/20">
        <div className="h-1 w-full bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/30 to-[#00FF00]/0">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="h-full w-32 bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/60 to-[#00FF00]/0"
          />
        </div>
        <div className="max-w-7xl mx-auto px-8 py-6 bg-black/90 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-[#00FF00]">RESOURCES</h1>
          <p className="mt-2 text-gray-400 tracking-wide">
            Explore our collection of cyber resources.
          </p>
        </div>
      </header>

      {/* Main Content: Resource cards with increased spacing */}
      <main className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-rows-4 gap-4">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                className="relative overflow-hidden border border-dashed border-[#00FF00] rounded-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.3 }}
              >
                {/* Background image with subtle scaling on hover */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${resource.image})` }}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.8, ease: "easeInOut" } }}
                />

                {/* Gradient overlay for smooth fade on the sides */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 1 }}
                  whileHover={{ opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } }}
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 10%, transparent 50%, rgba(0,0,0,0.85) 90%, rgba(0,0,0,0.95) 100%)"
                  }}
                />

                {/* Resource content */}
                <div className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between bg-black/40">
                  <div>
                    <motion.h2 
                      className="text-2xl font-bold mb-2 text-[#00FF00]"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {resource.title}
                    </motion.h2>
                    <motion.p 
                      className="text-sm text-gray-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      {resource.description}
                    </motion.p>
                  </div>
                  <Link href={resource.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="mt-4 sm:mt-0 text-[#00FF00] border border-dashed border-[#00FF00]/30 px-4 py-2 rounded hover:bg-[#00FF00]/10 transition-colors duration-300"
                    >
                      Explore
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
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
