"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Lab categories
const CATEGORIES = [
  "Web Security",
  "Network Defense",
  "Cryptography",
  "Forensics",
  "CTF Challenges",
  "Beginner Friendly"
]

// Sample lab data (to be replaced with real data from your database)
const LABS = [
  {
    id: "web-xss-lab",
    title: "Cross-Site Scripting (XSS) Playground",
    description: "Learn to identify and exploit XSS vulnerabilities in a safe environment.",
    difficulty: "Beginner",
    duration: "30 min",
    category: "Web Security",
    image: "/images/labs/xss-lab.jpg",
    tags: ["XSS", "Web Security", "Beginner Friendly"]
  },
  {
    id: "network-packet-analysis",
    title: "Network Packet Analysis",
    description: "Analyze network traffic to identify suspicious activities and potential attacks.",
    difficulty: "Intermediate",
    duration: "45 min",
    category: "Network Defense",
    image: "/images/labs/packet-analysis.jpg",
    tags: ["Wireshark", "Network Analysis", "Traffic Monitoring"]
  },
  {
    id: "crypto-challenge",
    title: "Encryption Challenge",
    description: "Break different encryption schemes and understand cryptographic weaknesses.",
    difficulty: "Advanced",
    duration: "60 min",
    category: "Cryptography",
    image: "/images/labs/crypto.jpg",
    tags: ["Encryption", "Cryptography", "Math"]
  },
  {
    id: "forensics-disk-image",
    title: "Disk Image Investigation",
    description: "Recover deleted files and discover hidden data from a disk image.",
    difficulty: "Intermediate",
    duration: "60 min",
    category: "Forensics",
    image: "/images/labs/forensics.jpg",
    tags: ["Digital Forensics", "Data Recovery"]
  },
  {
    id: "beginner-ctf",
    title: "Beginner CTF Challenge",
    description: "A simple Capture The Flag challenge designed for newcomers to cybersecurity.",
    difficulty: "Beginner",
    duration: "20 min",
    category: "CTF Challenges",
    image: "/images/labs/beginner-ctf.jpg",
    tags: ["CTF", "Beginner Friendly"]
  }
]

export default function CyberLabs() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredLabs, setFilteredLabs] = useState(LABS)
  
  // Filter labs based on selected category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredLabs(LABS)
    } else {
      setFilteredLabs(LABS.filter(lab => 
        lab.category === selectedCategory || 
        lab.tags.includes(selectedCategory)
      ))
    }
  }, [selectedCategory])

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#00FF00] mb-4">
            Interactive Cybersecurity Labs
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Practice real-world security techniques in a safe, controlled environment. 
            Our hands-on labs will help you develop practical skills for today's cybersecurity challenges.
          </p>
        </div>

        {/* Category Filter */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto p-1 w-full">
            <TabsTrigger 
              value="all"
              onClick={() => setSelectedCategory("all")}
              className="data-[state=active]:bg-[#00FF00]/20 data-[state=active]:text-[#00FF00]"
            >
              All Labs
            </TabsTrigger>
            {CATEGORIES.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="data-[state=active]:bg-[#00FF00]/20 data-[state=active]:text-[#00FF00]"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full flex flex-col bg-black border border-gray-800 hover:border-[#00FF00]/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-white">{lab.title}</CardTitle>
                    <Badge variant="outline" className="bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30">
                      {lab.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {lab.duration} · {lab.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-300 mb-4">{lab.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {lab.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={lab.id === "beginner-ctf" ? `/cyber-labs/beginner-ctf` : `/cyber-labs/${lab.id}`} className="w-full">
                    <Button className="w-full bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30">
                      Launch Lab
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 