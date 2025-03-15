"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [errorDescription, setErrorDescription] = useState<string | null>(null)
  
  const [errorMessage, setErrorMessage] = useState("There was a problem with your authentication request.")
  const [suggestion, setSuggestion] = useState("Please try again or contact support.")
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Use a synchronous initializer to avoid the initial null values
  useEffect(() => {
    // This function parses error info from both query params and hash
    const parseErrorInfo = () => {
      // First check query params
      const queryError = searchParams.get("error")
      const queryErrorCode = searchParams.get("error_code")
      const queryErrorDescription = searchParams.get("error_description")
      
      // Then check hash fragment if exists
      let hashError = null
      let hashErrorCode = null
      let hashErrorDescription = null
      
      if (typeof window !== 'undefined') {
        // Get the hash without the leading '#'
        const hashString = window.location.hash.startsWith('#') 
          ? window.location.hash.substring(1) 
          : window.location.hash
        
        // Log the raw hash for debugging
        console.log("Raw hash:", hashString)
        
        try {
          // Parse the hash manually to avoid issues with URLSearchParams
          const hashParts = hashString.split('&')
          for (const part of hashParts) {
            if (!part.includes('=')) continue;
            const [key, value] = part.split('=')
            if (key === 'error') hashError = decodeURIComponent(value)
            if (key === 'error_code') hashErrorCode = decodeURIComponent(value)
            if (key === 'error_description') hashErrorDescription = decodeURIComponent(value)
          }
          
          console.log("Parsed hash manually:", { hashError, hashErrorCode, hashErrorDescription })
        } catch (e) {
          console.error("Error parsing hash:", e)
        }
      }
      
      // Use hash params as they're more likely to contain the real error
      // Fall back to query params if hash params don't exist
      const finalError = hashError || queryError
      const finalErrorCode = hashErrorCode || queryErrorCode
      const finalErrorDescription = hashErrorDescription || queryErrorDescription
      
      // Set the state values
      setError(finalError)
      setErrorCode(finalErrorCode)
      setErrorDescription(finalErrorDescription)
      
      // Update the error message and suggestion based on the error info
      updateErrorMessage(finalError, finalErrorCode, finalErrorDescription)
      
      // Mark as loaded so we know the initial values are set
      setIsLoaded(true)
      
      return { finalError, finalErrorCode, finalErrorDescription }
    }
    
    // Update error message based on error info
    const updateErrorMessage = (err: string | null, code: string | null, desc: string | null) => {
      if (desc) {
        setErrorMessage(desc)
        setSuggestion("Please try again with a different account or contact support.")
      } else if (err === "server_error" && code === "unexpected_failure") {
        setErrorMessage("A database error occurred while saving user information.")
        setSuggestion("This is likely a temporary issue. Please try again, or contact support if the problem persists.")
      } else if (err === "server_error" && code === "profile_creation_failed") {
        setErrorMessage("Failed to create your user profile.")
        setSuggestion("Please try again with a different email address, or contact support if the issue persists.")
      } else if (err === "server_error" && code === "database_setup_error") {
        setErrorMessage("The database is not properly set up.")
        setSuggestion("This is a server configuration issue that requires admin attention. Please try again later or contact support.")
      } else if (err === "server_error" && code === "database_error") {
        setErrorMessage("A database error occurred.")
        setSuggestion("This is likely a server configuration issue. Please contact the site administrator.")
      } else if (err === "server_error" && code === "unexpected_error") {
        setErrorMessage("An unexpected error occurred.")
        setSuggestion("Please try again later or contact support if the problem persists.")
      } else if (err === "auth_error") {
        setErrorMessage("Authentication failed.")
        setSuggestion("Please try signing in again or use a different authentication method.")
      } else if (err === "exchange_error") {
        setErrorMessage("Failed to complete authentication.")
        setSuggestion("Please try signing in again with a different method.")
      } else if (err === "missing_code") {
        setErrorMessage("Authentication code is missing.")
        setSuggestion("Please try the sign-in process again from the beginning.")
      } else {
        setErrorMessage("There was a problem with your authentication request.")
        setSuggestion("This could be due to an expired session or an invalid authentication code.")
      }
    }
    
    // Run the parser immediately to set initial values
    const { finalError, finalErrorCode, finalErrorDescription } = parseErrorInfo()
    
    // Log the initial values
    console.log("Initial auth error information:", { 
      error: finalError, 
      errorCode: finalErrorCode, 
      errorDescription: finalErrorDescription,
      hash: typeof window !== 'undefined' ? window.location.hash : null
    })
    
    // Set up a listener for hash changes
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        parseErrorInfo()
      }
      
      window.addEventListener('hashchange', handleHashChange)
      return () => {
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [searchParams]) // Only run on mount and when searchParams changes
  
  // Debug output to help diagnose issues after state updates
  useEffect(() => {
    if (isLoaded) {
      console.log("Updated auth error information:", { 
        error, 
        errorCode, 
        errorDescription,
        hash: typeof window !== 'undefined' ? window.location.hash : null
      })
    }
  }, [error, errorCode, errorDescription, isLoaded])

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
              
              {/* Show Signup button for non-database errors */}
              {!(error === "server_error" && (
                errorCode === "database_setup_error" || 
                errorCode === "database_error" || 
                errorCode === "profile_creation_failed" ||
                errorCode === "unexpected_failure")) && (
                <Link
                  href="/signup"
                  className="w-full px-4 py-2 bg-transparent border border-[#00FF00]/20 text-[#00FF00] rounded-md font-medium hover:bg-[#00FF00]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:ring-offset-2 focus:ring-offset-black text-center"
                >
                  Try Signing Up
                </Link>
              )}
              
              {/* Show contact support button for database errors */}
              {(error === "server_error" && (
                errorCode === "database_setup_error" || 
                errorCode === "database_error" || 
                errorCode === "profile_creation_failed" ||
                errorCode === "unexpected_failure")) && (
                <a
                  href={`mailto:support@cyberverse.com?subject=CyberVerse%20Database%20Error&body=I%20encountered%20a%20database%20error%20when%20trying%20to%20log%20in.%0A%0AError%20details:%0ACode:%20${errorCode}%0ADescription:%20${errorDescription}%0A%0APlease%20help%20resolve%20this%20issue.`}
                  className="w-full px-4 py-2 bg-transparent border border-red-500/50 text-red-400 rounded-md font-medium hover:bg-red-900/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black text-center"
                >
                  Contact Support
                </a>
              )}
              
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