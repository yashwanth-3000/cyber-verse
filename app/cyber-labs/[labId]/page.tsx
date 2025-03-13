"use client"

import { useState, useEffect, useCallback } from "react"
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
  Lock,
  Clock,
  CheckCircle
} from "lucide-react"
import { LabProgress } from "@/components/LabProgress"
import { LabStepProgress } from "@/components/LabStepProgress"
import { ProgressClient } from "@/lib/services/progress-service"
import { useAuth } from "@/lib/providers/auth-provider"

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

// Helper function to validate solutions
const validateSolution = (labId: string, input: string) => {
  // Basic solution validation - in a real app, this would be more sophisticated
  console.log(`Validating solution for lab ${labId}: ${input}`);
  
  // Mock validation logic - replace with real validation
  const correctAnswers: {[key: string]: string[]} = {
    'xss-playground': ['<script>alert("XSS")</script>', '<img src="x" onerror="alert(\'XSS\')">', '<script>console.log("XSS")</script>'],
    'sql-injection': ['OR 1=1', '\' OR \'1\'=\'1', '1\' OR \'1\'=\'1'],
    'jwt-vulnerabilities': ['none', 'eyJhbGciOiJub25lIn0', 'alg:none'],
  };
  
  const isCorrect = correctAnswers[labId]?.some(answer => 
    input.toLowerCase().includes(answer.toLowerCase())
  );
  
  return {
    success: isCorrect,
    message: isCorrect 
      ? 'Correct! You\'ve successfully completed this challenge.'
      : 'That\'s not quite right. Try again with a different approach.'
  };
};

export default function LabPage() {
  const params = useParams<{ labId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("intro")
  const [lab, setLab] = useState<any>(null)
  const [solution, setSolution] = useState("")
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [submittingFlag, setSubmittingFlag] = useState(false)
  
  useEffect(() => {
    // Find the lab data based on the URL parameter
    const currentLab = LABS.find(l => l.id === params.labId)
    if (currentLab) {
      setLab(currentLab)
    } else {
      router.push("/cyber-labs") // Redirect if lab not found
    }
    
    // Load completed steps from local storage or API
    const loadCompletedSteps = async () => {
      if (!params.labId || !user) return;
      
      try {
        const stepProgress = await ProgressClient.getLabStepProgress(params.labId);
        const completed = stepProgress
          .filter(step => step.is_completed)
          .map(step => step.step_id);
        
        setCompletedSteps(completed);
      } catch (error) {
        console.error('Error loading step progress:', error);
      }
    };
    
    loadCompletedSteps();
  }, [params.labId, router, user]);
  
  const handleStepComplete = useCallback(async (stepId: string) => {
    console.log(`Lab page - handleStepComplete called for step: ${stepId}`);
    
    // Don't mark as completed if already completed
    if (completedSteps.includes(stepId)) {
      console.log(`Step ${stepId} is already completed, skipping`);
      return;
    }
    
    // Add to completed steps locally
    setCompletedSteps(prev => [...prev, stepId]);
    console.log(`Added step ${stepId} to completed steps locally`);
    
    // This will be called if LabStepProgress component's direct update fails
    // It's a backup method for updating step progress
    if (user && lab) {
      try {
        console.log(`Lab page - Backup method: saving step progress for step ${stepId}`);
        
        const stepIndex = lab.steps.findIndex((s: any) => {
          const normalizedStepId = s.name.toLowerCase().replace(/\s+/g, '-');
          console.log(`Comparing step name "${s.name}" (${normalizedStepId}) with stepId "${stepId}"`);
          return normalizedStepId === stepId;
        });
        
        if (stepIndex === -1) {
          console.error(`Could not find step with ID ${stepId} in lab steps`);
        }
        
        const stepTitle = stepIndex >= 0 ? lab.steps[stepIndex].name : stepId;
        console.log(`Found step title: "${stepTitle}" at index ${stepIndex}`);
        
        console.log(`Saving step progress from lab page: Lab ${params.labId}, Step ${stepId}, Title ${stepTitle}`);
        
        // Make sure we're calling the client version
        const result = await ProgressClient.updateStepProgress(
          params.labId as string,
          stepId,
          stepTitle,
          true
        );
        
        console.log("Step progress backup result:", result);
        
        // Check if all steps are completed
        const allSteps = lab.steps.map((s: any) => s.name.toLowerCase().replace(/\s+/g, '-'));
        const newCompletedSteps = [...completedSteps, stepId];
        const allCompleted = allSteps.every((stepIdentifier: string) => newCompletedSteps.includes(stepIdentifier));
        
        console.log(`All steps: [${allSteps.join(', ')}]`);
        console.log(`Completed steps: [${newCompletedSteps.join(', ')}]`);
        console.log(`All steps completed: ${allCompleted}`);
        
        // If all steps are completed, mark the lab as completed
        if (allCompleted) {
          console.log(`All steps completed, completing lab ${params.labId}`);
          const completionResult = await ProgressClient.completeLab(params.labId as string);
          console.log("Lab completion result:", completionResult);
        }
      } catch (error) {
        console.error('Error updating step progress:', error);
      }
    } else {
      console.log("User not logged in or lab not loaded, step progress not saved");
    }
  }, [completedSteps, user, lab, params.labId]);
  
  // Check if step is completed
  const isStepCompleted = (stepName: string) => {
    const stepId = stepName.toLowerCase().replace(/\s+/g, '-');
    return completedSteps.includes(stepId);
  };
  
  // Set up interactive lab elements
  useEffect(() => {
    if (!lab) return;
    
    // This is where you'd initialize any lab-specific JavaScript
    // For example, setting up a terminal, configuring a sandbox environment, etc.
    const setupLabInteractions = () => {
      const container = document.getElementById('lab-interaction-container');
      if (!container) return;
      
      switch (lab.id) {
        case 'xss-playground':
          // Set up XSS lab with input field and submit button
          container.innerHTML = `
            <div class="p-4 bg-black border border-gray-700 rounded-md">
              <h3 class="text-lg font-medium text-white mb-3">XSS Playground</h3>
              <p class="text-gray-300 mb-4">Try to execute an XSS payload in the input field below:</p>
              <div class="mb-4">
                <input type="text" id="xss-input" placeholder="Enter your payload here" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"/>
              </div>
              <div class="flex justify-end">
                <button id="test-xss" class="px-4 py-2 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded hover:bg-[#00FF00]/20">
                  Submit Flag
                </button>
              </div>
              <div id="xss-result" class="mt-4 p-4 border border-dashed border-gray-700 bg-black"></div>
            </div>
          `;
          
          // Set up event listeners
          const testButton = document.getElementById('test-xss');
          const input = document.getElementById('xss-input') as HTMLInputElement;
          const result = document.getElementById('xss-result');
          
          if (testButton && input && result) {
            testButton.addEventListener('click', async () => {
              const payload = input.value.trim();
              if (!payload) return;
              
              setSubmittingFlag(true);
              
              try {
                // Validate solution
                const validation = validateSolution(lab.id, payload);
                setValidationResult(validation);
                
                // If correct, automatically mark the current step as complete
                if (validation.success) {
                  // Get the current active tab as the step ID
                  const currentStepId = activeTab;
                  
                  // Only proceed if this isn't the intro tab and not already completed
                  if (currentStepId !== 'intro' && !completedSteps.includes(currentStepId)) {
                    console.log(`Flag correct! Automatically completing step: ${currentStepId}`);
                    
                    // Find the matching step to get the title
                    const currentStep = lab.steps.find((s: any) => 
                      s.name.toLowerCase().replace(/\s+/g, '-') === currentStepId
                    );
                    
                    if (currentStep) {
                      // Call the step completion handler
                      await handleStepComplete(currentStepId);
                      console.log(`Step ${currentStepId} marked as completed after correct flag submission`);
                    }
                  }
                }
                
                // Display the result - in a real app, this would be in a sandboxed iframe
                try {
                  result.innerHTML = `<div class="text-gray-400">Output:</div><div class="mt-2">${payload}</div>`;
                } catch (e) {
                  result.textContent = 'Error rendering output';
                }
              } finally {
                setSubmittingFlag(false);
              }
            });
          }
          break;
          
        case 'sql-injection':
          container.innerHTML = `
            <div class="p-4 bg-black border border-gray-700 rounded-md">
              <h3 class="text-lg font-medium text-white mb-3">SQL Injection Testing</h3>
              <p class="text-gray-300 mb-4">Try to bypass the login by injecting SQL:</p>
              <div class="mb-3">
                <label class="block text-gray-400 text-sm mb-1">Username</label>
                <input type="text" id="sql-username" placeholder="admin" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"/>
              </div>
              <div class="mb-4">
                <label class="block text-gray-400 text-sm mb-1">Password</label>
                <input type="text" id="sql-password" placeholder="Enter SQL injection payload" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"/>
              </div>
              <div class="flex justify-end">
                <button id="test-sql" class="px-4 py-2 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded hover:bg-[#00FF00]/20">
                  Submit Flag
                </button>
              </div>
              <div id="sql-result" class="mt-4 p-4 border border-dashed border-gray-700 bg-black"></div>
            </div>
          `;
          
          // Set up event listeners
          const sqlButton = document.getElementById('test-sql');
          const passwordInput = document.getElementById('sql-password') as HTMLInputElement;
          const sqlResult = document.getElementById('sql-result');
          
          if (sqlButton && passwordInput && sqlResult) {
            sqlButton.addEventListener('click', async () => {
              const payload = passwordInput.value.trim();
              if (!payload) return;
              
              setSubmittingFlag(true);
              
              try {
                // Validate solution
                const validation = validateSolution(lab.id, payload);
                setValidationResult(validation);
                
                // If correct, automatically mark the current step as complete
                if (validation.success) {
                  // Get the current active tab as the step ID
                  const currentStepId = activeTab;
                  
                  // Only proceed if this isn't the intro tab and not already completed
                  if (currentStepId !== 'intro' && !completedSteps.includes(currentStepId)) {
                    console.log(`Flag correct! Automatically completing step: ${currentStepId}`);
                    
                    // Find the matching step to get the title
                    const currentStep = lab.steps.find((s: any) => 
                      s.name.toLowerCase().replace(/\s+/g, '-') === currentStepId
                    );
                    
                    if (currentStep) {
                      // Call the step completion handler
                      await handleStepComplete(currentStepId);
                      console.log(`Step ${currentStepId} marked as completed after correct flag submission`);
                    }
                  }
                }
                
                sqlResult.innerHTML = validation.success
                  ? `<div class="text-green-500">Access granted! You've successfully bypassed the login.</div>`
                  : `<div class="text-red-500">Access denied. Try a different injection payload.</div>`;
              } finally {
                setSubmittingFlag(false);
              }
            });
          }
          break;
          
        case 'jwt-vulnerabilities':
          container.innerHTML = `
            <div class="p-4 bg-black border border-gray-700 rounded-md">
              <h3 class="text-lg font-medium text-white mb-3">JWT Vulnerabilities Lab</h3>
              <p class="text-gray-300 mb-4">Exploit the vulnerability in the JWT algorithm:</p>
              <div class="mb-4">
                <textarea id="jwt-input" placeholder="Enter your modified JWT or the vulnerable algorithm name" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"></textarea>
              </div>
              <div class="flex justify-end">
                <button id="test-jwt" class="px-4 py-2 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded hover:bg-[#00FF00]/20">
                  Submit Flag
                </button>
              </div>
              <div id="jwt-result" class="mt-4 p-4 border border-dashed border-gray-700 bg-black"></div>
            </div>
          `;
          
          // Set up event listeners
          const jwtButton = document.getElementById('test-jwt');
          const jwtInput = document.getElementById('jwt-input') as HTMLTextAreaElement;
          const jwtResult = document.getElementById('jwt-result');
          
          if (jwtButton && jwtInput && jwtResult) {
            jwtButton.addEventListener('click', async () => {
              const payload = jwtInput.value.trim();
              if (!payload) return;
              
              setSubmittingFlag(true);
              
              try {
                // Validate solution
                const validation = validateSolution(lab.id, payload);
                setValidationResult(validation);
                
                // If correct, automatically mark the current step as complete
                if (validation.success) {
                  // Get the current active tab as the step ID
                  const currentStepId = activeTab;
                  
                  // Only proceed if this isn't the intro tab and not already completed
                  if (currentStepId !== 'intro' && !completedSteps.includes(currentStepId)) {
                    console.log(`Flag correct! Automatically completing step: ${currentStepId}`);
                    
                    // Find the matching step to get the title
                    const currentStep = lab.steps.find((s: any) => 
                      s.name.toLowerCase().replace(/\s+/g, '-') === currentStepId
                    );
                    
                    if (currentStep) {
                      // Call the step completion handler
                      await handleStepComplete(currentStepId);
                      console.log(`Step ${currentStepId} marked as completed after correct flag submission`);
                    }
                  }
                }
                
                jwtResult.innerHTML = validation.success
                  ? `<div class="text-green-500">Success! You've correctly identified the vulnerability.</div>`
                  : `<div class="text-red-500">Incorrect. Review the JWT structure and try again.</div>`;
              } finally {
                setSubmittingFlag(false);
              }
            });
          }
          break;
          
        default:
          container.innerHTML = `<p class="text-gray-400">No interactive elements for this lab.</p>`;
      }
    };
    
    setupLabInteractions();
    
    // Cleanup function
    return () => {
      // Remove event listeners or cleanup resources
    }
  }, [lab, activeTab, completedSteps, handleStepComplete]);  // Add handleStepComplete to dependencies
  
  const handleStepClick = (stepName: string) => {
    const tabId = stepName.toLowerCase().replace(/\s+/g, '-');
    setActiveTab(tabId);
  };
  
  if (!lab) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-t-[#00FF00] border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content - 70% width on large screens */}
          <div className="w-full lg:w-[70%]">
            <div className="mb-6">
              <Link
                href="/cyber-labs"
                className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Labs
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{lab.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {lab.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                    {tag}
          </Badge>
                ))}
      </div>
      
              <p className="text-gray-300 text-lg mb-6">{lab.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-400">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                  <span>Difficulty: <span className="text-white">{lab.difficulty}</span></span>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <Clock className="mr-2 h-5 w-5 text-blue-400" />
                  <span>Time: <span className="text-white">{lab.duration}</span></span>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <GitBranch className="mr-2 h-5 w-5 text-purple-400" />
                  <span>Category: <span className="text-white">{lab.category}</span></span>
                </div>
              </div>
        </div>
        
            {/* Lab content with tabs for steps */}
            <Card className="bg-gray-900/40 border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <div className="overflow-x-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-black/40 border border-gray-800">
                      <TabsTrigger value="intro" className="data-[state=active]:bg-[#00FF00]/10 data-[state=active]:text-[#00FF00]">
                        Introduction
                        {isStepCompleted('Introduction') && (
                          <CheckCircle className="h-3 w-3 ml-1 text-[#00FF00]" />
                        )}
                      </TabsTrigger>
                      
                      {lab.steps.slice(1).map((step: any, index: number) => {
                        const stepId = step.name.toLowerCase().replace(/\s+/g, '-');
                        const completed = isStepCompleted(step.name);
                        
                        return (
                          <TabsTrigger 
                            key={stepId} 
                            value={stepId}
                            className="data-[state=active]:bg-[#00FF00]/10 data-[state=active]:text-[#00FF00]"
                          >
                            {step.name}
                            {completed && (
                              <CheckCircle className="h-3 w-3 ml-1 text-[#00FF00]" />
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    
                    <TabsContent value="intro" className="mt-6 px-1">
                      <div dangerouslySetInnerHTML={{ __html: lab.steps[0].content }} />
                      
                      <div className="mt-6">
                        <LabStepProgress
                          labId={params.labId as string}
                          stepId="introduction"
                          title="Introduction"
                          isCompleted={isStepCompleted('Introduction')}
                          onStepComplete={() => handleStepComplete('introduction')}
                        />
                      </div>
                    </TabsContent>
                    
                    {lab.steps.slice(1).map((step: any, index: number) => {
                      const stepId = step.name.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <TabsContent key={stepId} value={stepId} className="mt-6 px-1">
                          <div dangerouslySetInnerHTML={{ __html: step.content }} />
                          
                          <div className="mt-6">
                            <LabStepProgress
                              labId={params.labId as string}
                              stepId={stepId}
                              title={step.name}
                              isCompleted={isStepCompleted(step.name)}
                              onStepComplete={() => handleStepComplete(stepId)}
                            />
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </div>
            </CardHeader>
              
              <CardContent className="pt-6">
                {/* Lab interaction container */}
                <div id="lab-interaction-container" className="mb-6">
                  {/* Interactive content will be injected here by setupLabInteractions */}
                </div>
                
                {/* Solution validation */}
                {validationResult && (
                  <Alert 
                    className={`mb-6 ${validationResult.success ? 'bg-green-900/20 border-green-900' : 'bg-red-900/20 border-red-900'}`}
                  >
                    <div className={`flex items-center gap-2 ${validationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {validationResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{validationResult.success ? 'Success!' : 'Incorrect'}</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2 text-gray-300">
                      {validationResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
              
              <CardFooter className="flex justify-between border-t border-gray-800 pt-6">
              <Button 
                  variant="ghost"
                  className="border border-dashed border-gray-700 text-gray-400 hover:text-[#00FF00] hover:border-[#00FF00]/30 hover:bg-[#00FF00]/5"
                  onClick={() => router.push("/cyber-labs")}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Labs
              </Button>
              
              <Button 
                  className="bg-[#00FF00] text-black hover:bg-[#00FF00]/90"
                  onClick={() => router.push("/cyber-labs/solutions/" + lab.id)}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  View Solution
              </Button>
            </CardFooter>
          </Card>
          </div>
          
          {/* Sidebar - 30% width on large screens */}
          <div className="w-full lg:w-[30%] space-y-6">
            {/* Lab Progress */}
            {user && (
              <LabProgress labId={params.labId as string} />
            )}
            
            {/* Step Progress */}
            <Card className="bg-gray-900/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Lab Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lab.steps.map((step: any, index: number) => {
                  const stepId = step.name.toLowerCase().replace(/\s+/g, '-');
                  const completed = isStepCompleted(step.name);
                  
                  return (
                    <div 
                      key={stepId}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        activeTab === stepId ? 'bg-[#00FF00]/10 border border-[#00FF00]/30' : 'bg-black/30 border border-gray-800 hover:bg-black/50'
                      }`}
                      onClick={() => handleStepClick(step.name)}
                    >
                      <div className="flex items-center">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                          completed ? 'border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00]' : 'border-gray-600 bg-black/50 text-gray-400'
                        } mr-3`}>
                          {completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span className={completed ? 'text-[#00FF00]' : 'text-gray-300'}>
                          {step.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 