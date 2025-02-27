"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Plus, ChevronRight, Calendar, Trophy, Users } from "lucide-react"

export default function DashboardPage() {
  const [challenges] = useState([
    { id: 1, name: "21-Day Fitness Challenge", progress: 33, participants: 1500 },
    { id: 2, name: "Meditation Mastery", progress: 67, participants: 980 },
    { id: 3, name: "Productivity Boost", progress: 10, participants: 2200 },
  ])

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
          className="relative min-h-screen bg-black/90 text-white"
        >
          <header className="bg-black/50 backdrop-blur-md border-b border-[#00FF00]/20 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link href="/" className="text-[#00FF00] text-xl font-bold">
                VARTI
              </Link>
              <nav>
                <Link href="/profile" className="text-[#00FF00] hover:text-[#00FF00]/80 transition-colors">
                  My Profile
                </Link>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto p-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-8">Welcome back, Challenger!</h1>

              <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Your Active Challenges</h2>
                  <Link
                    href="/create-challenge"
                    className="inline-flex items-center px-4 py-2 bg-[#00FF00] text-black rounded-md hover:bg-[#00FF00]/90 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Challenge
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-black/50 backdrop-blur-md border border-[#00FF00]/20 rounded-lg p-6 hover:border-[#00FF00]/50 transition-all"
                    >
                      <h3 className="text-xl font-semibold mb-2">{challenge.name}</h3>
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div className="mb-4">
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-[#00FF00] rounded-full"
                            style={{ width: `${challenge.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm text-[#00FF00] mt-1">{challenge.progress}% Complete</div>
                      </div>
                      <Link
                        href={`/challenge/${challenge.id}`}
                        className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-black/50 backdrop-blur-md border border-[#00FF00]/20 rounded-lg p-6"
                  >
                    <Calendar className="w-8 h-8 text-[#00FF00] mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Current Streak</h3>
                    <p className="text-3xl font-bold text-[#00FF00]">7 Days</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-black/50 backdrop-blur-md border border-[#00FF00]/20 rounded-lg p-6"
                  >
                    <Trophy className="w-8 h-8 text-[#00FF00] mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Challenges Completed</h3>
                    <p className="text-3xl font-bold text-[#00FF00]">3</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-black/50 backdrop-blur-md border border-[#00FF00]/20 rounded-lg p-6"
                  >
                    <Users className="w-8 h-8 text-[#00FF00] mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Community Rank</h3>
                    <p className="text-3xl font-bold text-[#00FF00]">#42</p>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

