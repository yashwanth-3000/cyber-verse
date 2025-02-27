"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateChallengePage() {
  const [challengeName, setChallengeName] = useState("")
  const [challengeDescription, setChallengeDescription] = useState("")
  const [challengeDuration, setChallengeDuration] = useState("21")
  const [challengeType, setChallengeType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle challenge creation logic here
    console.log({ challengeName, challengeDescription, challengeDuration, challengeType })
  }

  return (
    <div className="relative min-h-screen bg-black/90 text-white">
      <header className="bg-black/50 backdrop-blur-md border-b border-[#00FF00]/20 p-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-8">Create a New Challenge</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="challengeName" className="block text-sm font-medium text-gray-300 mb-1">
                Challenge Name
              </label>
              <input
                type="text"
                id="challengeName"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                placeholder="Enter challenge name"
                required
              />
            </div>

            <div>
              <label htmlFor="challengeDescription" className="block text-sm font-medium text-gray-300 mb-1">
                Challenge Description
              </label>
              <textarea
                id="challengeDescription"
                value={challengeDescription}
                onChange={(e) => setChallengeDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                placeholder="Describe your challenge"
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="challengeDuration" className="block text-sm font-medium text-gray-300 mb-1">
                Challenge Duration (days)
              </label>
              <input
                type="number"
                id="challengeDuration"
                value={challengeDuration}
                onChange={(e) => setChallengeDuration(e.target.value)}
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="challengeType" className="block text-sm font-medium text-gray-300 mb-1">
                Challenge Type
              </label>
              <select
                id="challengeType"
                value={challengeType}
                onChange={(e) => setChallengeType(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                required
              >
                <option value="">Select a challenge type</option>
                <option value="fitness">Fitness</option>
                <option value="meditation">Meditation</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#00FF00] text-black rounded-md font-medium hover:bg-[#00FF00]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              Create Challenge
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}

