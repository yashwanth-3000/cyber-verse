import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "CyberVerse - Interactive Cybersecurity Labs",
  description: "Practice hands-on cybersecurity skills in our interactive labs. Learn about web security, network defense, cryptography, and more in a safe environment.",
}

export default function CyberLabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
} 