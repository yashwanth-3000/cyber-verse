'use client'

import { useEffect, useState, useCallback } from "react"
import { Poppins } from "next/font/google"
import Image from "next/image"
import { Loader } from "@/components/Loader"
import "@/app/globals.css"
import { usePathname } from "next/navigation"
import { AuthProvider } from "@/lib/providers/auth-provider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-poppins",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  
  // Only show background image on home page
  const isHomePage = pathname === "/"

  const updateCursorPosition = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    })
  }, [])

  useEffect(() => {
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener("mousemove", updateCursorPosition)

    // Simulate loading time (reduce to 1.5 seconds for faster initial load)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    // Add event listeners after the component has mounted and DOM is ready
    const setupInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll('a, button, input, [role="button"]')
      interactiveElements.forEach((element) => {
        element.addEventListener("mouseenter", handleMouseEnter)
        element.addEventListener("mouseleave", handleMouseLeave)
      })
    }

    // Initial setup
    setupInteractiveElements()

    // Setup a mutation observer to handle dynamically added elements
    const observer = new MutationObserver(() => {
      setupInteractiveElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("mousemove", updateCursorPosition)
      observer.disconnect()
      
      // Clean up existing listeners
      const interactiveElements = document.querySelectorAll('a, button, input, [role="button"]')
      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter)
        element.removeEventListener("mouseleave", handleMouseLeave)
      })
    }
  }, [updateCursorPosition])

  return (
    <html lang="en" className={`${poppins.variable} font-sans`}>
      <head>
        <title>CyberVerse</title>
        <meta name="description" content="Learn Cybersecurity Through Interactive Challenges" />
      </head>
      <body className={poppins.className}>
        <AuthProvider>
          {isLoading && <Loader />}
          {isHomePage && (
            <div className={`fixed inset-0 z-0 transition-all duration-1000 ${isLoading ? "blur-3xl" : "blur-none"}`}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0m9O1QEBHRhGRcIwzfxdJ324BLxfi.png"
                alt="Background"
                fill
                sizes="100vw"
                quality={100}
                priority
                unoptimized
                className="opacity-40 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1),transparent_70%)]" />
            </div>
          )}
          <div
            className={`cursor-spotlight ${isHovering ? "hovering" : ""}`}
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              transform: `translate(-50%, -50%)`,
              zIndex: 50, // Lower than dropdown menus
            }}
          >
            <div className="inner-circle"></div>
          </div>
          <div className={`transition-all duration-1000 ${isLoading ? "opacity-0 blur-xl" : "opacity-100 blur-none"}`}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
