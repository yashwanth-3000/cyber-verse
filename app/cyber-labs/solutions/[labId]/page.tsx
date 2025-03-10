"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Terminal,
  Flag,
  ChevronLeft,
  Key,
  FileCode2,
  BinaryIcon,
  ShieldCheck,
  Lightbulb,
  LockKeyhole,
  KeyRound,
  BookOpenIcon
} from "lucide-react"
import { notFound } from "next/navigation"

// Lab data mapping
const LABS_DATA = {
  "beginner-ctf": {
    title: "Beginner CTF Challenge",
    description: "Solutions for all challenges in the Beginner CTF Lab.",
    labUrl: "/cyber-labs/beginner-ctf",
    solutions: [
      {
        id: "web-inspector",
        title: "Web Inspector Challenge",
        description: "Finding hidden data in HTML comments",
        solution: "flag{html_inspection_master}",
        explanation: "This challenge required examining the HTML source code of the page to find a hidden comment. Developers sometimes leave sensitive information in HTML comments that aren't visible on the rendered page but can be accessed by viewing the page source.",
        technique: "Right-click on the page and select 'View Page Source' or press Ctrl+U (Cmd+Option+U on Mac) to see the HTML source code and look for HTML comments indicated by <!-- -->.",
        realWorldRelevance: "Security professionals routinely check source code for hardcoded credentials, API keys, or other sensitive information that might have been left in comments.",
        category: "Web",
        difficulty: "Easy"
      },
      {
        id: "basic-crypto",
        title: "Caesar Cipher Challenge",
        description: "Decoding a message encrypted with a Caesar cipher",
        solution: "flag{caesar_salad_is_delicious}",
        explanation: "The challenge presented an encrypted message using a Caesar cipher with a shift of 3. To decrypt, each letter needed to be shifted back by 3 positions in the alphabet.",
        technique: "For each letter in the encrypted text, shift it backwards by 3 positions in the alphabet. For example, 'd' becomes 'a', 'e' becomes 'b', etc. Alternatively, you could use an online Caesar cipher decoder with a shift value of -3 or 23.",
        realWorldRelevance: "While simple substitution ciphers like Caesar are easily broken, understanding them builds the foundation for more complex cryptography. This technique teaches the concepts of encryption keys and algorithm reversibility.",
        category: "Crypto",
        difficulty: "Easy"
      },
      {
        id: "hidden-data",
        title: "Metadata Analysis Challenge",
        description: "Extracting hidden information from file metadata",
        solution: "flag{metadata_reveals_secrets}",
        explanation: "This challenge involved analyzing the metadata of an image file to find hidden information. The flag was stored in the 'Comment' field of the image's metadata.",
        technique: "Use metadata extraction tools like ExifTool, or online metadata viewers to examine all metadata fields of a file. Look for unusual or hidden information in comment fields, keywords, or other non-essential metadata fields.",
        realWorldRelevance: "Digital forensics often relies on metadata analysis to establish timelines, verify authenticity, or uncover information about the origins and handling of digital evidence.",
        category: "Forensics",
        difficulty: "Medium"
      },
      {
        id: "code-analysis",
        title: "JavaScript Analysis Challenge",
        description: "Analyzing code to determine what flag it would generate",
        solution: "flag{javascript_logic_expert}",
        explanation: "This challenge required analyzing JavaScript code to understand how it builds a string. The code combined several parts, including converting ASCII values to characters.",
        technique: "Analyze the code step by step, paying attention to string concatenation and transformations. For the ASCII values, convert each number to its corresponding character (e.g., 97 is 'a', 98 is 'b', etc.). Then concatenate all parts to form the final flag.",
        realWorldRelevance: "Code analysis is essential for understanding potential vulnerabilities, malware behavior, or determining what a suspicious script does without executing it.",
        category: "Code",
        difficulty: "Medium"
      }
    ]
  },
  "network-defense-lab": {
    title: "Network Defense Challenge",
    description: "Solutions for the advanced Network Defense Lab challenges.",
    labUrl: "/cyber-labs/network-defense-lab",
    solutions: [
      {
        id: "traffic-analysis",
        title: "Network Traffic Analysis",
        description: "Analyzing packet captures to identify suspicious activity",
        solution: "flag{packet_analysis_complete}",
        explanation: "This challenge involved analyzing network traffic to identify suspicious patterns. By examining packet captures, we could identify potential security threats like port scans, brute force attempts, and other malicious activities.",
        technique: "Use specialized tools like Wireshark or tcpdump to capture and analyze network packets. Look for unusual patterns such as multiple failed login attempts, suspicious port scans, or anomalous TCP flags that might indicate attacks.",
        realWorldRelevance: "Network traffic analysis is a critical skill for security professionals responsible for network monitoring and incident response. It helps detect intrusions, identify lateral movement, and understand the scope of security incidents.",
        category: "Network",
        difficulty: "Medium"
      },
      {
        id: "intrusion-detection",
        title: "Intrusion Detection Systems",
        description: "Configuring IDS rules to detect network attacks",
        solution: "flag{ids_master_defender}",
        explanation: "This challenge focused on configuring and using intrusion detection systems (IDS) to monitor and alert on suspicious network activities. By creating effective detection rules, we could identify and prevent various attack types.",
        technique: "Create specific IDS rules using platforms like Snort or Suricata that can detect known attack signatures. Set appropriate thresholds to balance between detection sensitivity and false positives.",
        realWorldRelevance: "Intrusion detection is a cornerstone of network security, providing automated monitoring of potential security breaches. Organizations use IDS solutions to identify threats that bypass perimeter security and detect suspicious internal activities.",
        category: "Network",
        difficulty: "Hard"
      },
      {
        id: "firewall-config",
        title: "Firewall Configuration",
        description: "Setting up network firewall rules to protect systems",
        solution: "flag{firewall_shield_engaged}",
        explanation: "This challenge involved configuring network firewalls to protect systems from unauthorized access and attacks. By implementing the principle of least privilege, we could secure the network while allowing legitimate traffic to pass.",
        technique: "Start with a default deny policy and explicitly allow only necessary traffic. Implement stateful packet inspection to track connection states and create specific rules for services like SSH, HTTP, and HTTPS with appropriate source restrictions.",
        realWorldRelevance: "Proper firewall configuration is essential for network security in any organization. Firewalls are the first line of defense against unauthorized access and are critical for network segmentation and enforcing security policies.",
        category: "Network",
        difficulty: "Hard"
      }
    ]
  },
  "web-security-lab": {
    title: "Web Vulnerability Lab",
    description: "Solutions for the intermediate Web Security Lab challenges.",
    labUrl: "/cyber-labs/web-security-lab",
    solutions: [
      {
        id: "xss-vulnerability",
        title: "XSS Vulnerability Detection",
        description: "Identifying and exploiting Cross-Site Scripting vulnerabilities",
        solution: "flag{xss_master_hacker}",
        explanation: "This challenge involved identifying and exploiting Cross-Site Scripting (XSS) vulnerabilities in a web application. By injecting malicious JavaScript code into user input fields, we could demonstrate how attackers can execute scripts in users' browsers.",
        technique: "Test various input fields with JavaScript payloads such as <script>alert('XSS')</script> or more advanced payloads that bypass filters. Look for fields where user input is reflected back to the page without proper sanitization.",
        realWorldRelevance: "XSS vulnerabilities remain one of the most common web security issues. They can lead to cookie theft, session hijacking, and phishing attacks, making them critical for developers and security professionals to understand and prevent.",
        category: "Web",
        difficulty: "Medium"
      },
      {
        id: "sql-injection",
        title: "SQL Injection Basics",
        description: "Exploiting SQL injection vulnerabilities to access unauthorized data",
        solution: "flag{sql_injection_expert}",
        explanation: "This challenge focused on identifying and exploiting SQL injection vulnerabilities. By injecting malicious SQL queries into user input fields, we could bypass authentication, retrieve sensitive data, or manipulate database contents.",
        technique: "Test login forms and search fields with SQL injection payloads like ' OR 1=1 -- or more complex payloads. Observe error messages and application responses to determine if the input is being directly inserted into SQL queries without proper validation.",
        realWorldRelevance: "SQL injection attacks continue to threaten web applications, potentially exposing entire databases to unauthorized access. Understanding these vulnerabilities is essential for securing applications that interact with databases.",
        category: "Web",
        difficulty: "Medium"
      },
      {
        id: "csrf-protection",
        title: "CSRF Protection Implementation",
        description: "Understanding and implementing Cross-Site Request Forgery protections",
        solution: "flag{csrf_defense_complete}",
        explanation: "This challenge involved understanding Cross-Site Request Forgery (CSRF) attacks and implementing proper protections. CSRF attacks trick users into executing unwanted actions on websites where they're authenticated by exploiting the trust a website has in a user's browser.",
        technique: "Implement anti-CSRF tokens that must be included with each state-changing request. Ensure tokens are unique per user session and tied to specific actions. Validate the token on the server side before processing any sensitive actions.",
        realWorldRelevance: "CSRF vulnerabilities can lead to unauthorized actions performed on behalf of authenticated users, such as changing passwords, making purchases, or transferring funds. Proper CSRF protections are essential for maintaining the integrity of web applications.",
        category: "Web",
        difficulty: "Hard"
      },
      {
        id: "secure-authentication",
        title: "Secure Authentication Implementation",
        description: "Implementing secure user authentication mechanisms",
        solution: "flag{secure_auth_implemented}",
        explanation: "This challenge focused on implementing secure authentication mechanisms to protect user accounts. This includes proper password storage, multi-factor authentication, and secure session management.",
        technique: "Use strong hashing algorithms like bcrypt or Argon2 for password storage, implement account lockout policies after failed attempts, use secure randomly generated session tokens, and consider adding multi-factor authentication for sensitive operations.",
        realWorldRelevance: "Authentication vulnerabilities can lead to account takeovers and data breaches. Implementing secure authentication is fundamental to protecting user accounts and maintaining trust in web applications.",
        category: "Web",
        difficulty: "Hard"
      },
      {
        id: "content-security",
        title: "Content Security Policy Implementation",
        description: "Implementing and testing Content Security Policy to mitigate attacks",
        solution: "flag{csp_protector_badge}",
        explanation: "This challenge involved implementing Content Security Policy (CSP) headers to prevent various types of attacks including XSS. A properly configured CSP can significantly reduce the attack surface of a web application by controlling which resources can be loaded and executed.",
        technique: "Define CSP headers that restrict script sources, style sources, and other resource types to trusted domains. Use nonce-based or hash-based approaches for inline scripts when necessary, and implement reporting to monitor for potential violations.",
        realWorldRelevance: "Content Security Policy is a powerful defense-in-depth mechanism against XSS and data injection attacks. It's widely adopted by security-conscious organizations as an additional layer of protection beyond input validation and output encoding.",
        category: "Web",
        difficulty: "Medium"
      }
    ]
  }
  // Add more labs here in the future
};

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-400";
    case "medium":
      return "text-amber-400";
    case "hard":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

function getCategoryDetails(category: string) {
  switch (category.toLowerCase()) {
    case "web":
      return { 
        color: "blue-400",
        bgColor: "bg-blue-900/20",
        borderColor: "border-blue-700/30",
        hoverBorder: "hover:border-blue-400/30"
      };
    case "crypto":
      return { 
        color: "purple-400",
        bgColor: "bg-purple-900/20",
        borderColor: "border-purple-700/30",
        hoverBorder: "hover:border-purple-400/30"
      };
    case "forensics":
      return { 
        color: "green-400",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-700/30",
        hoverBorder: "hover:border-green-400/30"
      };
    case "code":
      return { 
        color: "orange-400",
        bgColor: "bg-orange-900/20",
        borderColor: "border-orange-700/30",
        hoverBorder: "hover:border-orange-400/30"
      };
    case "network":
      return { 
        color: "red-400",
        bgColor: "bg-red-900/20",
        borderColor: "border-red-700/30",
        hoverBorder: "hover:border-red-400/30"
      };
    default:
      return { 
        color: "gray-400",
        bgColor: "bg-gray-900/20",
        borderColor: "border-gray-700/30",
        hoverBorder: "hover:border-gray-400/30"
      };
  }
}

export default function LabSolutionsPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  
  // Check if lab exists
  if (!LABS_DATA[labId as keyof typeof LABS_DATA]) {
    notFound();
  }
  
  const labData = LABS_DATA[labId as keyof typeof LABS_DATA];
  const { solutions, title, description, labUrl } = labData;
  
  // Get unique categories from solutions
  const categories = Array.from(new Set(solutions.map(sol => sol.category.toLowerCase())));

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with terminal-style decoration */}
        <div className="relative mb-12 border-b border-dashed border-gray-700 pb-8">
          <div className="absolute -top-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent"></div>
          <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF00]/20 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <div>
              <div className="flex items-center mb-3">
                <Link href="/cyber-labs/solutions">
                  <Button
                    variant="ghost"
                    className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 transition-colors duration-200"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Solutions
                  </Button>
                </Link>
                <Badge className="ml-3 bg-amber-600/20 text-amber-300 border border-amber-500/30 px-3 py-1 uppercase tracking-wide text-xs">Solutions</Badge>
              </div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-white mr-3">{title}</h1>
                <div className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse"></div>
              </div>
              <p className="text-gray-200 mt-2 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Alert className="bg-amber-900/20 border-dashed border-amber-600/30 py-2 px-4">
                <LockKeyhole className="h-4 w-4 text-amber-300 mr-2" />
                <AlertDescription className="text-amber-300 text-sm">
                  Use these solutions as a learning resource after attempting the challenges yourself.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          {/* Direct link to challenge */}
          <div className="mt-6">
            <Link href={labUrl} className="inline-flex items-center text-gray-200 hover:text-[#00FF00] transition-colors">
              <Button 
                variant="ghost"
                className="gap-2 text-amber-300 hover:bg-amber-900/10 hover:text-amber-300 hover:border-amber-500/40 border border-dashed border-amber-700/30 transition-colors duration-200"
              >
                <Terminal className="h-4 w-4" />
                Go to Challenge Lab
              </Button>
            </Link>
          </div>
        </div>

        {/* Solutions Filter with enhanced styling */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Flag className="mr-2 h-5 w-5 text-[#00FF00]" />
            Challenge Solutions
          </h2>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-black/30 border border-dashed border-gray-700 rounded-md p-1 grid grid-cols-5 mb-8 w-full max-w-3xl">
              <TabsTrigger 
                value="all" 
                className="text-gray-300 data-[state=active]:text-[#00FF00] data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-[#00FF00]/40 font-medium hover:text-[#00FF00] transition-colors duration-200"
              >
                All Solutions
              </TabsTrigger>
              {categories.includes("web") && (
                <TabsTrigger 
                  value="web" 
                  className="text-gray-300 data-[state=active]:text-blue-300 data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-blue-400/40 font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  Web
                </TabsTrigger>
              )}
              {categories.includes("crypto") && (
                <TabsTrigger 
                  value="crypto" 
                  className="text-gray-300 data-[state=active]:text-purple-300 data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-purple-400/40 font-medium hover:text-purple-300 transition-colors duration-200"
                >
                  Crypto
                </TabsTrigger>
              )}
              {categories.includes("forensics") && (
                <TabsTrigger 
                  value="forensics" 
                  className="text-gray-300 data-[state=active]:text-green-300 data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-green-400/40 font-medium hover:text-green-300 transition-colors duration-200"
                >
                  Forensics
                </TabsTrigger>
              )}
              {categories.includes("code") && (
                <TabsTrigger 
                  value="code" 
                  className="text-gray-300 data-[state=active]:text-orange-300 data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-orange-400/40 font-medium hover:text-orange-300 transition-colors duration-200"
                >
                  Code
                </TabsTrigger>
              )}
              {categories.includes("network") && (
                <TabsTrigger 
                  value="network" 
                  className="text-gray-300 data-[state=active]:text-red-300 data-[state=active]:bg-black/60 rounded-sm data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-red-400/40 font-medium hover:text-red-300 transition-colors duration-200"
                >
                  Network
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Solutions Cards with improved layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {solutions
            .filter(sol => activeTab === "all" || sol.category.toLowerCase() === activeTab)
            .map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/20 border-dashed border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#00FF00]/30 h-full relative group">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-black/40 to-transparent pointer-events-none"></div>
                  
                  <CardHeader className="bg-black/50 border-b border-dashed border-gray-700 transition-colors duration-200 relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-white flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/60 text-[#00FF00] text-xs mr-2 border border-dashed border-[#00FF00]/30">
                          {index + 1}
                        </span>
                        {solution.title}
                      </CardTitle>
                      {solution.category === "Web" && (
                        <Badge className="bg-blue-900/40 text-blue-300 border border-blue-700/40">Web</Badge>
                      )}
                      {solution.category === "Crypto" && (
                        <Badge className="bg-purple-900/40 text-purple-300 border border-purple-700/40">Crypto</Badge>
                      )}
                      {solution.category === "Forensics" && (
                        <Badge className="bg-green-900/40 text-green-300 border border-green-700/40">Forensics</Badge>
                      )}
                      {solution.category === "Code" && (
                        <Badge className="bg-orange-900/40 text-orange-300 border border-orange-700/40">Code</Badge>
                      )}
                      {solution.category === "Network" && (
                        <Badge className="bg-red-900/40 text-red-300 border border-red-700/40">Network</Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-300 mt-1">
                      {solution.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-5 pt-6">
                    <div className="p-3 bg-black/40 rounded-md border border-dashed border-gray-700 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF00]/10 to-transparent"></div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-200 flex items-center font-medium">
                          <Flag className="h-4 w-4 mr-2 text-[#00FF00]" />
                          Solution Flag:
                        </div>
                        <Badge className="bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30">Flag</Badge>
                      </div>
                      <code className="block w-full bg-black/60 p-3 rounded text-[#00FF00] font-mono text-sm overflow-x-auto border border-dashed border-gray-800">
                        {solution.solution}
                      </code>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="explanation" className="border-dashed border-gray-800 mb-2">
                        <AccordionTrigger className="bg-black/40 border border-dashed border-gray-700 rounded-md hover:bg-black/60 transition-colors duration-200 hover:text-[#00FF00] px-4 py-2 hover:no-underline hover:border-[#00FF00]/30 text-gray-200">
                          <div className="flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2 text-amber-300" />
                            <span className="font-medium">Explanation</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-black/30 rounded-b-md p-4 border border-dashed border-gray-700 border-t-0 mt-1 text-gray-200 leading-relaxed">
                          {solution.explanation}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="technique" className="border-dashed border-gray-800 mb-2">
                        <AccordionTrigger className="bg-black/40 border border-dashed border-gray-700 rounded-md hover:bg-black/60 transition-colors duration-200 hover:text-[#00FF00] px-4 py-2 hover:no-underline hover:border-[#00FF00]/30 text-gray-200">
                          <div className="flex items-center">
                            <KeyRound className="h-4 w-4 mr-2 text-blue-300" />
                            <span className="font-medium">Solution Technique</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-black/30 rounded-b-md p-4 border border-dashed border-gray-700 border-t-0 mt-1 text-gray-200 leading-relaxed">
                          {solution.technique}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="relevance" className="border-dashed border-gray-800">
                        <AccordionTrigger className="bg-black/40 border border-dashed border-gray-700 rounded-md hover:bg-black/60 transition-colors duration-200 hover:text-[#00FF00] px-4 py-2 hover:no-underline hover:border-[#00FF00]/30 text-gray-200">
                          <div className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-300" />
                            <span className="font-medium">Real-World Application</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-black/30 rounded-b-md p-4 border border-dashed border-gray-700 border-t-0 mt-1 text-gray-200 leading-relaxed">
                          {solution.realWorldRelevance}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                  
                  <CardFooter className="border-t border-gray-800 pt-4 text-gray-300 bg-black/20">
                    <div className="flex flex-col w-full">
                      <div className="flex items-center text-xs justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-black/40 rounded-sm border border-dashed border-gray-700">
                            Difficulty: <span className={getDifficultyColor(solution.difficulty)}>{solution.difficulty}</span>
                          </span>
                          <span className="px-2 py-1 bg-black/40 rounded-sm border border-dashed border-gray-700">
                            Type: {solution.category}
                          </span>
                        </div>
                      </div>
                      <Link href={labUrl}>
                        <Button 
                          variant="ghost"
                          className="w-full text-amber-300 hover:bg-amber-900/10 hover:text-amber-300 hover:border-amber-500/40 border border-dashed border-amber-700/30 transition-colors duration-200"
                        >
                          <Terminal className="mr-2 h-4 w-4" />
                          Return to Challenge
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
        </div>
        
        {/* Footer navigation */}
        <div className="mt-12 pt-6 border-t border-dashed border-gray-800 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/cyber-labs/solutions')}
            className="text-gray-300 hover:text-[#00FF00] hover:bg-[#00FF00]/5 border border-dashed border-gray-700 hover:border-[#00FF00]/30 transition-colors duration-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Solutions
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => router.push(labUrl)}
            className="text-amber-300 hover:text-amber-300 hover:bg-amber-900/10 border border-dashed border-amber-700/30 hover:border-amber-500/40 transition-colors duration-200"
          >
            Go to Lab
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 