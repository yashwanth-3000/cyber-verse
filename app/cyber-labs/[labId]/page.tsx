"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Terminal, 
  AlertCircle, 
  ChevronLeft, 
  Trophy, 
  CheckCircle2, 
  GitBranch, 
  Lock
} from "lucide-react"

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
    tags: ["XSS", "Web Security", "Beginner Friendly"],
    steps: [
      {
        name: "Introduction",
        content: `
          <h3>Cross-Site Scripting (XSS) Introduction</h3>
          <p>Cross-Site Scripting (XSS) attacks are a type of injection where malicious scripts are injected into websites. An attacker can use XSS to send malicious code to an unsuspecting user. The end user's browser has no way to know that the script should not be trusted, and will execute the script.</p>
          
          <p>In this lab, you'll learn:</p>
          <ul>
            <li>How to identify XSS vulnerabilities</li>
            <li>Different types of XSS (reflected, stored, DOM-based)</li>
            <li>How to exploit XSS vulnerabilities</li>
            <li>How to protect against XSS attacks</li>
          </ul>
          
          <p>This lab provides a safe sandbox where you can practice XSS techniques without any real-world consequences.</p>
        `
      },
      {
        name: "Reflected XSS",
        content: `
          <h3>Reflected XSS Challenge</h3>
          <p>Reflected XSS occurs when the malicious script comes from the current HTTP request.</p>
          
          <h4>Scenario:</h4>
          <p>You've discovered a simple search form on a website. The search results page displays the search term back to the user, but doesn't properly sanitize the input.</p>
          
          <div class="my-6 p-4 bg-gray-900 rounded-md">
            <p class="text-gray-400 mb-2">Search Form:</p>
            <div class="flex gap-2">
              <input 
                type="text" 
                id="search-input" 
                placeholder="Search..." 
                class="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-white"
              />
              <button 
                id="search-button"
                class="bg-[#00FF00]/20 text-[#00FF00] px-4 py-2 rounded hover:bg-[#00FF00]/30 transition-colors"
              >
                Search
              </button>
            </div>
            <div id="search-result" class="mt-4 p-3 border border-gray-700 rounded min-h-[50px] hidden">
              <p>Search results for: <span id="search-term"></span></p>
            </div>
          </div>
          
          <h4>Challenge:</h4>
          <p>Your goal is to inject JavaScript code that will display an alert box with the message "XSS Successful!" when the search results are displayed.</p>
          
          <h4>Hint:</h4>
          <p>Try entering the following in the search box: <code>&lt;script&gt;alert('XSS Successful!')&lt;/script&gt;</code></p>
        `
      },
      {
        name: "Stored XSS",
        content: `
          <h3>Stored XSS Challenge</h3>
          <p>Stored XSS (also known as persistent XSS) occurs when the malicious script is stored on the target server and then later retrieved by victims when they visit the vulnerable page.</p>
          
          <h4>Scenario:</h4>
          <p>You've found a comment section on a blog post that doesn't properly sanitize user input before storing it in the database.</p>
          
          <div class="my-6 p-4 bg-gray-900 rounded-md">
            <p class="text-gray-400 mb-2">Comment Form:</p>
            <div class="space-y-3">
              <input 
                type="text" 
                id="name-input" 
                placeholder="Your Name" 
                class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
              />
              <textarea 
                id="comment-input" 
                placeholder="Your Comment" 
                rows="3"
                class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
              ></textarea>
              <button 
                id="comment-button"
                class="bg-[#00FF00]/20 text-[#00FF00] px-4 py-2 rounded hover:bg-[#00FF00]/30 transition-colors"
              >
                Post Comment
              </button>
            </div>
            <div id="comments-section" class="mt-4 border border-gray-700 rounded p-3">
              <h5 class="text-gray-300 mb-2">Comments:</h5>
              <div id="comments-list">
                <div class="comment p-2 border-b border-gray-700">
                  <strong>John Doe:</strong> Great article on cybersecurity!
                </div>
              </div>
            </div>
          </div>
          
          <h4>Challenge:</h4>
          <p>Your goal is to inject JavaScript code in your comment that will change the background color of the entire comments section to red when the page loads.</p>
          
          <h4>Hint:</h4>
          <p>You might need to inject HTML with an onload event or script tag that targets the comments-section element.</p>
        `
      },
      {
        name: "Mitigation Techniques",
        content: `
          <h3>XSS Mitigation Techniques</h3>
          <p>Now that you understand how XSS vulnerabilities can be exploited, let's learn how to prevent them:</p>
          
          <h4>Input Validation and Sanitization</h4>
          <p>Always validate and sanitize user input on the server-side. Client-side validation can be bypassed.</p>
          <pre class="bg-gray-900 p-3 rounded text-sm overflow-x-auto my-2">
// Example of input sanitization in JavaScript
function sanitizeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
          </pre>
          
          <h4>Content Security Policy (CSP)</h4>
          <p>Implement Content Security Policy headers to restrict the sources from which scripts can be loaded:</p>
          <pre class="bg-gray-900 p-3 rounded text-sm overflow-x-auto my-2">
// Example CSP header
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com
          </pre>
          
          <h4>Use Framework Protections</h4>
          <p>Modern frameworks like React, Angular, and Vue automatically escape content by default. Use these built-in protections.</p>
          
          <h4>HttpOnly Cookies</h4>
          <p>Set the HttpOnly flag on cookies containing sensitive information to prevent JavaScript from accessing them.</p>
          
          <h4>Contextual Output Encoding</h4>
          <p>Use the appropriate encoding for the context where data will be displayed (HTML, CSS, JavaScript, URL, etc.).</p>
        `
      },
      {
        name: "Challenge",
        content: `
          <h3>Final XSS Challenge</h3>
          <p>Now it's time to test your skills with a more complex challenge!</p>
          
          <div class="my-6 p-4 bg-gray-900 rounded-md">
            <p class="text-gray-400 mb-2">Profile Preview:</p>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-sm text-gray-400">Username</label>
                  <input 
                    type="text" 
                    id="username-input" 
                    value="user123" 
                    class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label class="text-sm text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    id="fullname-input" 
                    value="John Smith" 
                    class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label class="text-sm text-gray-400">Bio</label>
                <textarea 
                  id="bio-input" 
                  rows="3"
                  class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
                >Cybersecurity enthusiast</textarea>
              </div>
              <div>
                <label class="text-sm text-gray-400">Website</label>
                <input 
                  type="text" 
                  id="website-input" 
                  value="https://example.com" 
                  class="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <button 
                id="preview-button"
                class="bg-[#00FF00]/20 text-[#00FF00] px-4 py-2 rounded hover:bg-[#00FF00]/30 transition-colors"
              >
                Preview Profile
              </button>
            </div>
            <div id="profile-preview" class="mt-4 border border-gray-700 rounded p-3 hidden">
              <h4 class="text-xl font-bold" id="preview-name"></h4>
              <p class="text-sm text-gray-400" id="preview-username"></p>
              <p class="mt-2" id="preview-bio"></p>
              <p class="mt-2">
                <span class="text-gray-400">Website: </span>
                <a href="#" id="preview-website" class="text-blue-400 hover:underline"></a>
              </p>
            </div>
          </div>
          
          <h4>Challenge:</h4>
          <p>Your mission is to find at least two different XSS vulnerabilities in this profile preview functionality. Try to:</p>
          <ol>
            <li>Make the page show an alert with the message "Admin access granted"</li>
            <li>Change the text color of the profile name to red</li>
          </ol>
          
          <p>When you have successfully completed the challenges, you'll earn a badge for this lab.</p>
        `
      }
    ]
  },
  {
    id: "network-packet-analysis",
    title: "Network Packet Analysis",
    description: "Analyze network traffic to identify suspicious activities and potential attacks.",
    difficulty: "Intermediate",
    duration: "45 min",
    category: "Network Defense",
    image: "/images/labs/packet-analysis.jpg",
    tags: ["Wireshark", "Network Analysis", "Traffic Monitoring"],
    steps: [
      {
        name: "Introduction",
        content: `
          <h3>Network Packet Analysis Introduction</h3>
          <p>In this lab, you'll learn how to analyze network traffic to identify suspicious activities and potential attacks. We'll use packet analysis techniques to examine traffic patterns and detect anomalies.</p>
          
          <h4>Learning Objectives:</h4>
          <ul>
            <li>Understand TCP/IP packet structure</li>
            <li>Identify common attack patterns in network traffic</li>
            <li>Learn how to use packet analysis tools</li>
            <li>Detect unusual traffic patterns that may indicate an attack</li>
          </ul>
        `
      }
      // More steps would be defined here for a complete lab
    ]
  }
  // Other lab definitions would follow here
]

// Simulate flag/solution validation
const validateSolution = (labId: string, input: string) => {
  // In a real application, this would check against actual solutions
  // stored securely in your backend
  const solutions: { [key: string]: string } = {
    "web-xss-lab": "<script>alert('XSS Successful!')</script>",
    "network-packet-analysis": "suspicious_traffic.pcap"
  }
  
  return input.includes(solutions[labId])
}

export default function LabPage() {
  const router = useRouter()
  const params = useParams()
  const labId = params.labId as string
  
  const [lab, setLab] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [success, setSuccess] = useState(false)
  const [attemptsMade, setAttemptsMade] = useState(0)
  
  // Simulating lab data fetch
  useEffect(() => {
    const findLab = LABS.find(l => l.id === labId)
    if (findLab) {
      setLab(findLab)
    } else {
      // Lab not found
      router.push('/cyber-labs')
    }
    setLoading(false)
  }, [labId])
  
  // Set up interactive lab elements
  useEffect(() => {
    if (!lab || loading) return
    
    // This is where you'd initialize any lab-specific JavaScript
    // In a real application, you might load an iframe, a VM, or
    // other interactive elements based on the lab type
    
    const setupLabInteractions = () => {
      if (lab.id === "web-xss-lab") {
        // Set up XSS lab interactions
        const searchButton = document.getElementById('search-button')
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        const searchResult = document.getElementById('search-result')
        const searchTerm = document.getElementById('search-term')
        
        if (searchButton && searchInput && searchResult && searchTerm) {
          searchButton.addEventListener('click', () => {
            searchResult?.classList.remove('hidden')
            // Deliberately vulnerable to XSS for demonstration purposes
            searchTerm.innerHTML = searchInput.value
            
            // Check if user has successfully completed the challenge
            if (searchInput.value.includes("<script>alert('XSS Successful!')</script>")) {
              setTimeout(() => {
                setSuccess(true)
              }, 1000)
            }
          })
        }
        
        // Set up comment form for stored XSS example
        const commentButton = document.getElementById('comment-button')
        const nameInput = document.getElementById('name-input') as HTMLInputElement
        const commentInput = document.getElementById('comment-input') as HTMLTextAreaElement
        const commentsList = document.getElementById('comments-list')
        
        if (commentButton && nameInput && commentInput && commentsList) {
          commentButton.addEventListener('click', () => {
            const newComment = document.createElement('div')
            newComment.className = 'comment p-2 border-b border-gray-700'
            // Again, deliberately vulnerable for demo purposes
            newComment.innerHTML = `<strong>${nameInput.value}:</strong> ${commentInput.value}`
            commentsList.appendChild(newComment)
            nameInput.value = ''
            commentInput.value = ''
          })
        }
        
        // Set up profile preview for the final challenge
        const previewButton = document.getElementById('preview-button')
        const usernameInput = document.getElementById('username-input') as HTMLInputElement
        const fullnameInput = document.getElementById('fullname-input') as HTMLInputElement
        const bioInput = document.getElementById('bio-input') as HTMLTextAreaElement
        const websiteInput = document.getElementById('website-input') as HTMLInputElement
        const profilePreview = document.getElementById('profile-preview')
        const previewName = document.getElementById('preview-name')
        const previewUsername = document.getElementById('preview-username')
        const previewBio = document.getElementById('preview-bio')
        const previewWebsite = document.getElementById('preview-website') as HTMLAnchorElement
        
        if (previewButton && profilePreview && previewName && previewUsername && previewBio && previewWebsite) {
          previewButton.addEventListener('click', () => {
            profilePreview?.classList.remove('hidden')
            
            // Deliberately vulnerable for demo purposes
            previewName.innerHTML = fullnameInput.value
            previewUsername.innerText = '@' + usernameInput.value
            previewBio.innerHTML = bioInput.value
            previewWebsite.innerText = websiteInput.value
            previewWebsite.href = websiteInput.value
          })
        }
      }
    }
    
    // Call the setup function after a short delay to ensure the DOM is ready
    setTimeout(setupLabInteractions, 500)
    
    // Cleanup function
    return () => {
      // Remove event listeners or cleanup resources
    }
  }, [lab, loading, currentStep])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF00]"></div>
      </div>
    )
  }
  
  if (!lab) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Lab not found. Please select a valid lab.</AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button 
            onClick={() => router.push('/cyber-labs')}
            variant="outline"
            className="text-[#00FF00]"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Labs
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <Button 
          onClick={() => router.push('/cyber-labs')}
          variant="outline"
          className="text-[#00FF00]"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Labs
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30">
            {lab.difficulty}
          </Badge>
          <span className="text-gray-400">{lab.duration}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with lab information and progress */}
        <div className="lg:col-span-1">
          <Card className="bg-black border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">{lab.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{lab.description}</p>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium text-white">Progress</h3>
                <div className="space-y-2">
                  {lab.steps.map((step: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-full text-left px-3 py-2 rounded flex items-center ${
                        currentStep === index 
                          ? 'bg-[#00FF00]/20 text-[#00FF00]' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 text-[#00FF00]" />
                      ) : currentStep === index ? (
                        <GitBranch className="mr-2 h-4 w-4" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4 text-gray-500" />
                      )}
                      {step.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area for lab */}
        <div className="lg:col-span-2">
          <Card className="bg-black border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Step {currentStep + 1}: {lab.steps[currentStep].name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lab content - using dangerouslySetInnerHTML for rich content 
                  In a real application, you'd want to use a safer approach */}
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lab.steps[currentStep].content }}
              />
              
              {/* Success message shown after completing a challenge */}
              {success && (
                <Alert className="mt-6 bg-green-900/20 border-green-500 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Challenge Completed!</AlertTitle>
                  <AlertDescription>
                    You've successfully completed this challenge. Move on to the next step to continue.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-800 flex justify-between">
              <Button 
                variant="outline" 
                className="text-gray-400"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <Button 
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30"
                onClick={() => {
                  if (currentStep < lab.steps.length - 1) {
                    setCurrentStep(currentStep + 1)
                  } else {
                    // Final step completed - award badge or certificate
                    router.push('/cyber-labs')
                  }
                }}
                disabled={currentStep === lab.steps.length - 1 && !success}
              >
                {currentStep < lab.steps.length - 1 ? 'Next' : 'Complete Lab'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 