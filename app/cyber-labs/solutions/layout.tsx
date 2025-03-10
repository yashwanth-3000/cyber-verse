import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "CyberVerse - Lab Solutions",
  description: "Detailed solutions and explanations for all CyberVerse lab challenges. Learn about cybersecurity techniques and best practices.",
}

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
} 