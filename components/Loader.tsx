'use client'

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export const Loader = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress < 100 ? prevProgress + 1 : prevProgress))
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const leafVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-xl">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <motion.path
            d="M100 180V20"
            stroke="#00FF00"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
          />
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.path
              key={index}
              d={`M100 ${180 - index * 40} Q${110 + index * 5} ${170 - index * 40} ${120 + index * 10} ${180 - index * 40}`}
              stroke="#00FF00"
              strokeWidth="3"
              fill="#00FF00"
              variants={leafVariants}
              custom={index}
              initial="hidden"
              animate={progress >= (index + 1) * 20 ? "visible" : "hidden"}
            />
          ))}
        </svg>
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[#00FF00] text-xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          CULTIVATING HABITS
        </motion.div>
      </div>
    </div>
  )
}

