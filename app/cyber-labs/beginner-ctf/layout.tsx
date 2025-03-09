import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "CyberVerse - Beginner CTF Challenge | Learn Cybersecurity Skills",
  description: "Practice essential cybersecurity skills with our beginner-friendly CTF challenges. Learn web inspection, cryptography, metadata analysis, and code review techniques in a safe environment.",
  keywords: "CTF challenge, beginner cybersecurity, web inspection, cryptography, metadata analysis, code review, cybersecurity training",
  authors: [{ name: "CyberVerse" }],
  openGraph: {
    title: "Beginner CTF Challenge - Practice Essential Cybersecurity Skills",
    description: "Try our interactive Capture The Flag challenges designed for beginners to learn cybersecurity fundamentals",
    type: "website"
  }
}

export default function BeginnerCTFLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
} 