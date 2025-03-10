import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Network Defense Lab - CyberVerse",
  description: "Advanced network security training with hands-on challenges covering traffic analysis, intrusion detection, and firewall configuration techniques.",
}

export default function NetworkDefenseLabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
} 