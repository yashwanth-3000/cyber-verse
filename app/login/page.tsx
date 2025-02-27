"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { GoogleLoginButton } from "@/components/GoogleLoginButton"

// Fallback component for Suspense
const GoogleLoginButtonFallback = () => (
  <button
    disabled
    className="w-full px-4 py-2 bg-gray-800 text-gray-400 rounded-md font-medium flex items-center justify-center gap-2"
  >
    <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-400 animate-spin"></div>
    Loading...
  </button>
)

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

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
            <h2 className="text-3xl font-bold text-[#00FF00] mb-6">Login to VARTI</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-2 bg-black/50 border border-[#00FF00]/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00FF00] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 bg-black border-[#00FF00]/20 rounded focus:ring-[#00FF00]/50 transition-all"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-[#00FF00] hover:text-[#00FF00]/80 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#00FF00] text-black rounded-md font-medium hover:bg-[#00FF00]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  Sign in
                </button>
              </div>
              
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#00FF00]/10"></div>
                </div>
                <div className="relative px-4 bg-black/50 text-xs text-gray-400">
                  OR CONTINUE WITH
                </div>
              </div>
              
              <div>
                <Suspense fallback={<GoogleLoginButtonFallback />}>
                  <GoogleLoginButton variant="accent" className="w-full" />
                </Suspense>
              </div>
            </form>
          </div>
          <p className="mt-8 text-center text-sm text-gray-400">
            Not a member?{" "}
            <Link href="/signup" className="text-[#00FF00] hover:text-[#00FF00]/80 transition-colors">
              Start your 21-day challenge now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

