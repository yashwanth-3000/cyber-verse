"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")
  
  const [errorMessage, setErrorMessage] = useState("")
  const [suggestion, setSuggestion] = useState("")
  
  useEffect(() => {
    // Set appropriate error messages based on the error code
    if (errorDescription) {
      setErrorMessage(errorDescription)
    } else if (error === "server_error" && errorCode === "unexpected_failure") {
      setErrorMessage("A database error occurred while saving user information.")
      setSuggestion("This is likely a temporary issue. Please try again, or contact support if the problem persists.")
    } else if (error === "exchange_error") {
      setErrorMessage("Failed to complete authentication.")
      setSuggestion("Please try signing in again with a different method.")
    } else if (error === "missing_code") {
      setErrorMessage("Authentication code is missing.")
      setSuggestion("Please try the sign-in process again from the beginning.")
    } else {
      setErrorMessage("There was a problem with your authentication request.")
      setSuggestion("This could be due to an expired session or an invalid authentication code.")
    }
  }, [error, errorCode, errorDescription])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background with integrated image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{
            backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0m9O1QEBHRhGRcIwzfxdJ324BLxfi.png')`,
            filter: "brightness(1.2) contrast(1.1)",
          }}
          role="img"
          aria-label="Decorative green cat background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-black/50 backdrop-blur-md rounded-lg border border-[#00FF00]/20 p-8">
            <div className="flex justify-center mb-6">
              <div className="text-[#00FF00] text-4xl font-bold font-mono tracking-wider">
                <span className="mr-1 text-[#00FF00]/80">&gt;</span>
                CYBER_VERSE
                <span className="ml-1 animate-pulse">_</span>
              </div>
            </div>
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-[#FF0000]" />
            </div>
            <h2 className="text-2xl font-bold text-[#00FF00] mb-4 text-center">Authentication Error</h2>
            <p className="text-gray-300 mb-2 text-center">
              {errorMessage}
            </p>
            <p className="text-gray-400 mb-6 text-center text-sm">
              {suggestion}
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                href="/login"
                className="w-full px-4 py-2 bg-[#00FF00] text-black rounded-md font-medium hover:bg-[#00FF00]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:ring-offset-2 focus:ring-offset-black text-center"
              >
                Try Logging In Again
              </Link>
              <Link
                href="/signup"
                className="w-full px-4 py-2 bg-transparent border border-[#00FF00]/20 text-[#00FF00] rounded-md font-medium hover:bg-[#00FF00]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:ring-offset-2 focus:ring-offset-black text-center"
              >
                Create New Account
              </Link>
              <Link
                href="/"
                className="w-full px-4 py-2 bg-transparent text-gray-400 hover:text-white rounded-md font-medium transition-all duration-300 focus:outline-none text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 