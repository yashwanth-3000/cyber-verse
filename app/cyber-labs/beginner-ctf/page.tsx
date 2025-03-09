"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Terminal, 
  AlertCircle, 
  ChevronLeft, 
  Trophy, 
  CheckCircle2, 
  GitBranch, 
  Lock,
  Flag,
  FileCode2,
  BinaryIcon,
  Key
} from "lucide-react"

// Lab metadata
const LAB_META = {
  title: "Beginner CTF Challenge",
  description: "A simple Capture The Flag challenge designed for newcomers to cybersecurity.",
  difficulty: "Beginner",
  duration: "30 min",
  category: "CTF Challenges",
  tags: ["CTF", "Beginner Friendly", "Web", "Cryptography"]
}

// Flags/solutions for each challenge
const CHALLENGE_FLAGS = {
  webInspector: "flag{html_inspection_master}",
  basicCrypto: "flag{caesar_salad_is_delicious}",
  hiddenData: "flag{metadata_reveals_secrets}",
  codeAnalysis: "flag{javascript_logic_expert}"
}

export default function BeginnerCTFLab() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [stepStatus, setStepStatus] = useState([false, false, false, false]) // track which steps are completed
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [showCongrats, setShowCongrats] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const encodedMessageRef = useRef<HTMLParagraphElement>(null)
  
  // Define the CSS styles here, inside the component
  const styles = `
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink {
    50% { opacity: 0 }
  }

  @keyframes glitch {
    0% {
      clip-path: inset(40% 0 61% 0);
      transform: translate(-1px, 1px);
    }
    20% {
      clip-path: inset(92% 0 1% 0);
      transform: translate(0.5px, 0.5px);
    }
    40% {
      clip-path: inset(43% 0 1% 0);
      transform: translate(-0.5px, 0.5px);
    }
    60% {
      clip-path: inset(25% 0 58% 0);
      transform: translate(-1px, -1px);
    }
    80% {
      clip-path: inset(54% 0 7% 0);
      transform: translate(1px, -0.5px);
    }
    100% {
      clip-path: inset(58% 0 43% 0);
      transform: translate(-1px, 1px);
    }
  }

  @keyframes scan {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 0% 100%;
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.9; }
  }

  .terminal-header {
    position: relative;
    overflow: hidden;
  }

  .terminal-header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.5), transparent);
    animation: scan 3s linear infinite;
  }

  .typing-animation {
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    position: relative;
    animation: typing 3.5s steps(40, end);
  }

  .cursor-blink {
    animation: blink 1s step-end infinite;
  }

  .hover-glow {
    transition: all 0.3s ease;
  }

  .hover-glow:hover {
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
    transform: translateY(-1px);
  }

  .hover-glow:active {
    transform: translateY(1px);
  }

  .glitch-effect:hover::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    text-shadow: -1px 0 rgba(0, 255, 0, 0.5);
    animation: glitch 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation-delay: 0s;
    animation-iteration-count: 1;
  }

  .glitch-effect:hover::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    text-shadow: 1px 0 rgba(0, 255, 0, 0.5);
    animation: glitch 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;
    animation-delay: 0s;
    animation-iteration-count: 1;
  }

  .card-hover {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
  }

  .button-hover-slide {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .button-hover-slide::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 255, 0, 0.08);
    transform: scaleX(0);
    transform-origin: 0 50%;
    transition: transform 0.3s ease-out;
  }

  .button-hover-slide:hover::before {
    transform: scaleX(1);
  }

  .scanner-animation {
    background: linear-gradient(to bottom, transparent, rgba(0, 255, 0, 0.02), transparent);
    background-size: 100% 200%;
    animation: scan 4s linear infinite;
  }

  .pulse-animation {
    animation: pulse 3s ease-in-out infinite;
  }
  `;
  
  // Inject the styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
      
      return () => {
        // Clean up on unmount
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      };
    }
  }, []);
  
  // Add a cool matrix-like animation effect to the page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Create matrix animation background with reduced opacity
      const matrixEl = document.createElement('div');
      matrixEl.style.position = 'fixed';
      matrixEl.style.top = '0';
      matrixEl.style.left = '0';
      matrixEl.style.width = '100%';
      matrixEl.style.height = '100%';
      matrixEl.style.pointerEvents = 'none';
      matrixEl.style.zIndex = '-1';
      matrixEl.style.opacity = '0.02'; // Reduced opacity for a more subtle effect
      document.body.appendChild(matrixEl);
      
      // Matrix animation function
      let canvas: HTMLCanvasElement | null = null;
      let ctx: CanvasRenderingContext2D | null = null;
      const initMatrix = () => {
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        matrixEl.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
        
        if (!ctx) return () => {}; // Early return if context cannot be obtained
        
        // Use a more professional character set
        const matrix = "10";
        const matrixChars = matrix.split('');
        
        const fontSize = 10;
        const columns = Math.floor(canvas.width / fontSize);
        
        const drops: number[] = [];
        for (let i = 0; i < columns; i++) {
          drops[i] = 1;
        }
        
        const draw = () => {
          if (!ctx || !canvas) return;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'; // More subtle fade
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // More transparent text
          ctx.font = fontSize + 'px monospace';
          
          for (let i = 0; i < drops.length; i++) {
            // Only draw some columns for a sparser effect
            if (Math.random() > 0.5) {
              const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
              ctx.fillText(text, i * fontSize, drops[i] * fontSize);
              
              if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
              }
              
              drops[i]++;
            }
          }
        };
        
        // Slower animation rate
        const matrixInterval = setInterval(draw, 80);
        
        return () => {
          clearInterval(matrixInterval);
          if (canvas && matrixEl.contains(canvas)) {
            matrixEl.removeChild(canvas);
          }
          if (matrixEl && document.body.contains(matrixEl)) {
            document.body.removeChild(matrixEl);
          }
        };
      };
      
      let cleanup = initMatrix();
      
      const handleResize = () => {
        if (cleanup) cleanup();
        cleanup = initMatrix();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        if (cleanup) cleanup();
        window.removeEventListener('resize', handleResize);
        if (document.body.contains(matrixEl)) {
          document.body.removeChild(matrixEl);
        }
      };
    }
  }, []);
  
  // Update overall progress whenever stepStatus changes
  useEffect(() => {
    const completedSteps = stepStatus.filter(status => status).length
    const progress = (completedSteps / stepStatus.length) * 100
    setOverallProgress(progress)
    
    // Show congratulations when all challenges are completed
    if (completedSteps === stepStatus.length) {
      setShowCongrats(true)
    }
  }, [stepStatus])
  
  // Validate the user's flag submission
  const validateFlag = () => {
    // Reset error message
    setErrorMessage("")
    
    // Check if input is empty
    if (!userInput.trim()) {
      setErrorMessage("Please enter a flag before submitting")
      return false
    }
    
    const expectedFlag = Object.values(CHALLENGE_FLAGS)[currentStep]
    const isCorrect = userInput.trim() === expectedFlag
    
    if (isCorrect) {
      // Update the step status
      const newStepStatus = [...stepStatus]
      newStepStatus[currentStep] = true
      setStepStatus(newStepStatus)
      
      // Clear the input
      setUserInput("")
      
      // Auto-advance to next step if not on the last step
      if (currentStep < LAB_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
          setShowHint(false)
          setAttempts(0)
        }, 1500)
      }
    } else {
      // Increment attempts
      setAttempts(attempts + 1)
      
      // Show hint after 3 failed attempts
      if (attempts >= 2 && !showHint) {
        setShowHint(true)
      }
      
      // Show error message
      setErrorMessage("Incorrect flag. Try again!")
    }
    
    return isCorrect
  }
  
  // Set up the Caesar cipher for challenge 2
  useEffect(() => {
    if (currentStep === 1 && encodedMessageRef.current) {
      const originalText = "flag{caesar_salad_is_delicious}"
      const shiftAmount = 3
      
      // Apply Caesar cipher (shift right by 3)
      const encodedText = originalText.split('').map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0)
          
          // Handle uppercase letters
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shiftAmount) % 26) + 65)
          }
          // Handle lowercase letters
          else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shiftAmount) % 26) + 97)
          }
        }
        return char
      }).join('')
      
      encodedMessageRef.current.textContent = encodedText
    }
  }, [currentStep])
  
  // Hide secret comment in HTML for challenge 1
  useEffect(() => {
    if (currentStep === 0) {
      // This will be visible in the page source (HTML comment)
      const comment = document.createComment(" The flag is: flag{html_inspection_master} ")
      document.getElementById('challenge-container')?.appendChild(comment)
    }
  }, [currentStep])
  
  // Lab step definitions with content
  const LAB_STEPS = [
    {
      name: "Web Inspector",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Challenge 1: The Hidden Comment</h3>
          <p className="text-gray-300">
            In CTF competitions, information is often hidden in plain sight. Websites may contain hidden data in their HTML source code, which isn't visible on the page but can be found by examining the page source.
          </p>
          
          <div className="my-6 p-4 bg-gray-900 rounded-md" id="challenge-container">
            <h4 className="text-[#00FF00] mb-2">Welcome to the Secret Page</h4>
            <p className="text-gray-300">
              This webpage looks simple, but it contains a hidden message. Can you find it?
            </p>
            <div className="mt-4 p-4 bg-black rounded border border-gray-700">
              <p className="text-gray-400">Try using your browser's "View Page Source" or inspect element feature to find hidden HTML comments.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Your Task:</h4>
            <p className="text-gray-300">
              Find the hidden flag in this webpage. The flag format is <code>flag&#123;...&#125;</code>
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-black border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <Flag className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                onClick={validateFlag}
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] button-hover-slide"
              >
                <Flag className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[0] && (
              <Alert className="mt-4 bg-red-900/20 border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[0] && (
              <Alert className="mt-4 bg-green-900/20 border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Challenge Completed!</AlertTitle>
                <AlertDescription>
                  Great job! You've found the hidden HTML comment. This technique is commonly used to find initial clues in CTF challenges.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[0] && (
              <Alert className="mt-4 bg-blue-900/20 border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hint:</AlertTitle>
                <AlertDescription>
                  Right-click on the page and select "View Page Source" or press Ctrl+U (Cmd+Option+U on Mac). Look for text between &lt;!-- and --&gt; tags.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )
    },
    {
      name: "Basic Cryptography",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Challenge 2: Caesar's Secret</h3>
          <p className="text-gray-300">
            Cryptography is the art of writing and solving codes. One of the oldest and simplest forms of encryption is the Caesar Cipher, where each letter is shifted a certain number of places down the alphabet.
          </p>
          
          <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-gray-900/70 rounded-md border border-gray-700 hover:border-[#00FF00]/20 transition-all duration-300 hover-glow">
            <h4 className="text-[#00FF00] mb-2 flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
              Encrypted Message
            </h4>
            <p className="text-gray-300 mb-4">
              We've intercepted an encrypted message. It appears to be using a simple Caesar cipher with a shift of 3 places.
            </p>
            <div className="mt-4 p-4 bg-black rounded-md border border-gray-700 font-mono flex items-center space-x-3 group hover:border-[#00FF00]/30 transition-all duration-300">
              <div className="w-4 flex flex-col space-y-1">
                <span className="h-1 w-1 rounded-full bg-red-500 group-hover:bg-red-400 transition-all duration-300"></span>
                <span className="h-1 w-1 rounded-full bg-yellow-500 group-hover:bg-yellow-400 transition-all duration-300"></span>
                <span className="h-1 w-1 rounded-full bg-green-500 group-hover:bg-green-400 transition-all duration-300"></span>
              </div>
              <p className="text-[#00FF00] flex-1 overflow-x-auto group-hover:text-[#00FF00]/90 transition-all duration-300" ref={encodedMessageRef}>iodj&#123;fdhvdu_vdodg_lv_gholflrxv&#125;</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Your Task:</h4>
            <p className="text-gray-300">
              Decrypt the message to find the flag. Remember, the Caesar cipher shifts each letter by a fixed number of positions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the decrypted flag"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-black border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <Key className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                onClick={validateFlag}
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px]"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[1] && (
              <Alert className="mt-4 bg-red-900/20 border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[1] && (
              <Alert className="mt-4 bg-green-900/20 border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Challenge Completed!</AlertTitle>
                <AlertDescription>
                  Excellent work! You've successfully decrypted the Caesar cipher. This is a fundamental cryptographic technique used throughout history.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[1] && (
              <Alert className="mt-4 bg-blue-900/20 border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hint:</AlertTitle>
                <AlertDescription>
                  For a Caesar cipher with a shift of 3, you need to shift each letter backward by 3 places. For example, 'D' becomes 'A', 'E' becomes 'B', etc. Try an online Caesar cipher decoder and use the shift value of -3 or 23.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )
    },
    {
      name: "Hidden Data",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Challenge 3: The Hidden Metadata</h3>
          <p className="text-gray-300">
            Files often contain hidden metadata - data about the data. Images, documents, and other files can contain information about when they were created, by whom, and sometimes even location data or hidden comments.
          </p>
          
          <div className="my-6 p-4 bg-gray-900 rounded-md">
            <h4 className="text-[#00FF00] mb-2">Suspicious Image</h4>
            <p className="text-gray-300 mb-2">
              We've received this image, but we believe it contains hidden information in its metadata.
            </p>
            <div className="mt-4 flex justify-center">
              {/* This is a placeholder image - in a real implementation, you would have an actual image with embedded metadata */}
              <div className="relative h-52 w-72 border border-gray-700 overflow-hidden rounded-md group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileCode2 className="h-16 w-16 text-[#00FF00]/30 group-hover:text-[#00FF00]/50 transition-all duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 flex justify-between items-center">
                  <span className="text-sm text-gray-300">secret-image.jpg</span>
                  <div className="flex space-x-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-black rounded-md border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Command output:
                </p>
                <code className="text-[#00FF00] text-xs font-mono bg-black/40 px-2 py-1 rounded">exiftool secret-image.jpg</code>
              </div>
              <div className="mt-2 p-3 border border-gray-700 rounded-md font-mono text-xs bg-black/40">
                <div className="flex flex-col space-y-1">
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">File Name:</span>
                    <span>secret-image.jpg</span>
                  </p>
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">File Size:</span>
                    <span>24 kB</span>
                  </p>
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">Image Size:</span>
                    <span>640x480</span>
                  </p>
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">Date Created:</span>
                    <span>2023:10:15 09:42:36</span>
                  </p>
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">Camera Model:</span>
                    <span>CTF Tutorial Camera</span>
                  </p>
                  <p className="text-gray-300 flex bg-[#00FF00]/5 p-1 rounded">
                    <span className="w-32 text-gray-500">Comment:</span>
                    <span className="text-[#00FF00]">The flag is flag&#123;metadata_reveals_secrets&#125;</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Your Task:</h4>
            <p className="text-gray-300">
              Extract the hidden flag from the image metadata. In a real CTF, you would download the image and use metadata extraction tools.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag from the metadata"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-black border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <FileCode2 className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                onClick={validateFlag}
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px]"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[2] && (
              <Alert className="mt-4 bg-red-900/20 border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[2] && (
              <Alert className="mt-4 bg-green-900/20 border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Challenge Completed!</AlertTitle>
                <AlertDescription>
                  Well done! You've extracted information from file metadata, a crucial skill for digital forensics and CTF competitions.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[2] && (
              <Alert className="mt-4 bg-blue-900/20 border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hint:</AlertTitle>
                <AlertDescription>
                  Look at the "Comment" field in the metadata output. That's where the flag is hidden.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )
    },
    {
      name: "Code Analysis",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Challenge 4: The JavaScript Puzzle</h3>
          <p className="text-gray-300">
            Many CTF challenges involve analyzing code to understand what it does and how to extract a flag from it. This challenge introduces basic code analysis.
          </p>
          
          <div className="my-6 p-4 bg-gray-900 rounded-md">
            <h4 className="text-[#00FF00] mb-2">Mysterious JavaScript Function</h4>
            <p className="text-gray-300 mb-2">
              This JavaScript function generates a flag, but we need to understand what it does to get the correct output.
            </p>
            <div className="mt-4 p-4 bg-black rounded-md border border-gray-700 font-mono text-sm overflow-x-auto hover:border-[#00FF00]/30 transition-all duration-300 hover-glow">
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex space-x-2">
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-300">generateFlag.js</span>
                  <span className="px-2 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 transition-colors duration-300">JavaScript</span>
                </div>
                <div className="flex space-x-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors duration-300"></span>
                  <span className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors duration-300"></span>
                  <span className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors duration-300"></span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-gray-700 flex flex-col text-xs text-gray-500 bg-gray-900/30">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-6 flex items-center justify-center">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <pre className="text-gray-300 pl-12">
{`function generateFlag() {
  const part1 = "flag{";
  const part2 = [106, 97, 118, 97, 115, 99, 114, 105, 112, 116];
  const part3 = "_";
  const part4 = "logic" + "_";
  const part5 = "expert}";
  
  let result = part1;
  
  // Add part2 (convert ASCII values to characters)
  for (let i = 0; i < part2.length; i++) {
    result += String.fromCharCode(part2[i]);
  }
  
  result += part3 + part4 + part5;
  
  return result;
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Your Task:</h4>
            <p className="text-gray-300">
              Analyze the JavaScript code to determine what flag it would generate. You don't need to run the code - you can analyze it manually or use an online JavaScript console.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag the code would generate"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-black border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <BinaryIcon className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                onClick={validateFlag}
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px]"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[3] && (
              <Alert className="mt-4 bg-red-900/20 border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[3] && (
              <Alert className="mt-4 bg-green-900/20 border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Challenge Completed!</AlertTitle>
                <AlertDescription>
                  Congratulations! You've successfully analyzed the JavaScript code to extract the flag. Code analysis is a fundamental skill in cybersecurity.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[3] && (
              <Alert className="mt-4 bg-blue-900/20 border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hint:</AlertTitle>
                <AlertDescription>
                  The part2 array contains ASCII character codes. Convert them to characters (part2 spells "javascript" when converted). The complete flag will be part1 + part2 (converted) + part3 + part4 + part5.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )
    }
  ]
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Lab header with terminal-style design */}
      <div className="relative mb-8 bg-black border border-[#00FF00]/30 rounded-md overflow-hidden terminal-header">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-black to-[#00FF00]/10 border-b border-[#00FF00]/30">
          <div className="flex items-center">
            <Button 
              onClick={() => router.push('/cyber-labs')}
              variant="outline"
              className="text-[#00FF00] mr-4 border-[#00FF00]/40 hover:bg-[#00FF00]/10 button-hover-slide"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl md:text-2xl font-mono text-[#00FF00] relative">
              <span className="text-white opacity-70 mr-2">$</span>
              <span className="typing-animation">{LAB_META.title}</span>
              <span className="cursor-blink">_</span>
            </h1>
          </div>
          <Badge variant="outline" className="bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30 pulse-animation">
            {LAB_META.difficulty} · {LAB_META.duration}
          </Badge>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#00FF00] animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">Challenge Progress</span>
          </div>
          <span className="text-sm font-mono text-[#00FF00]">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-[#00FF00]/80 to-[#00FF00] h-full scanner-animation"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Congratulations message when all challenges are completed */}
      {showCongrats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Alert className="bg-green-900/20 border-green-500 hover-glow">
            <div className="flex items-start">
              <Trophy className="h-12 w-12 text-yellow-400 mr-6 flex-shrink-0 mt-1 pulse-animation" />
              <div>
                <AlertTitle className="text-2xl font-bold text-white mb-2 glitch-effect" data-text="Challenge Complete!">Challenge Complete!</AlertTitle>
                <AlertDescription className="text-gray-300">
                  <p className="mb-4 text-lg">You've successfully completed all challenges in the Beginner CTF Lab! 🎉</p>
                  <div className="p-4 bg-black/40 rounded-lg border border-green-500/30 mb-4 scanner-animation">
                    <p className="font-medium text-white mb-2">Skills Demonstrated:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-5 list-disc marker:text-[#00FF00]">
                      <li className="hover:text-[#00FF00] transition-colors duration-300">Web inspection and HTML analysis</li>
                      <li className="hover:text-[#00FF00] transition-colors duration-300">Basic cryptography and decoding</li>
                      <li className="hover:text-[#00FF00] transition-colors duration-300">Metadata extraction and analysis</li>
                      <li className="hover:text-[#00FF00] transition-colors duration-300">Code analysis and interpretation</li>
                    </ul>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Link href="/cyber-labs">
                      <Button className="bg-[#00FF00]/20 text-[#00FF00] hover:bg-[#00FF00]/30 px-8 py-6 text-lg button-hover-slide">
                        <Trophy className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        Return to Labs
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
      
      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar with lab information and progress */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <Card className="bg-black border border-gray-800 overflow-hidden mb-4 card-hover hover-glow">
              <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800">
                <CardTitle className="text-xl text-white flex items-center">
                  <Flag className="mr-2 h-5 w-5 text-[#00FF00]"/>
                  Lab Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-gray-300 mb-4">{LAB_META.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {LAB_META.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="border-t border-gray-800 pt-5 mt-2">
                  <h3 className="text-lg font-medium text-white flex items-center mb-3">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-[#00FF00]" />
                    Challenges
                  </h3>
                  <div className="space-y-2">
                    {LAB_STEPS.map((step, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-300 ${
                          currentStep === index 
                            ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.15)]' 
                            : 'text-gray-300 hover:bg-gray-800 border border-transparent hover:border-[#00FF00]/20 hover:shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                        }`}
                      >
                        <div className="mr-3 flex-shrink-0">
                          {stepStatus[index] ? (
                            <div className="h-6 w-6 rounded-full bg-[#00FF00]/20 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-[#00FF00]" />
                            </div>
                          ) : currentStep === index ? (
                            <div className="h-6 w-6 rounded-full bg-[#00FF00]/10 flex items-center justify-center border border-[#00FF00]/30">
                              <GitBranch className="h-4 w-4 text-[#00FF00]" />
                            </div> 
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
                              <Flag className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="block">{step.name}</span>
                          <span className="text-xs opacity-60">Challenge {index + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border border-gray-800 overflow-hidden card-hover hover-glow">
              <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800">
                <CardTitle className="text-xl text-white flex items-center">
                  <FileCode2 className="mr-2 h-5 w-5 text-[#00FF00]"/>
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="space-y-3">
                  <Link href="https://ctflearn.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3 transition-all duration-300 button-hover-slide">
                      <BinaryIcon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <div className="text-left">
                        <span className="block transition-transform duration-300 hover:translate-x-1">CTF Learn</span>
                        <span className="text-xs opacity-60">Practice more challenges</span>
                      </div>
                    </Button>
                  </Link>
                  <Link href="https://www.cryptoclub.org/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                      <Key className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <span className="block">Cryptography Basics</span>
                        <span className="text-xs opacity-60">Learn more about ciphers</span>
                      </div>
                    </Button>
                  </Link>
                  <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                      <FileCode2 className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <span className="block">JavaScript Guide</span>
                        <span className="text-xs opacity-60">JavaScript reference</span>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Main content area for lab */}
        <div className="lg:col-span-9">
          <Card className="bg-black border border-gray-800 overflow-hidden hover-glow">
            <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800 flex flex-row justify-between items-center">
              <CardTitle className="text-xl text-white flex items-center">
                <span className="h-6 w-6 rounded-full bg-[#00FF00]/20 flex items-center justify-center mr-3 flex-shrink-0 pulse-animation">
                  <span className="text-[#00FF00] text-sm font-mono">{currentStep + 1}</span>
                </span>
                <span className="glitch-effect relative" data-text={LAB_STEPS[currentStep].name}>{LAB_STEPS[currentStep].name}</span>
              </CardTitle>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse"></span>
                <span>LIVE</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 scanner-animation bg-opacity-5">
              {LAB_STEPS[currentStep].content}
            </CardContent>
            <CardFooter className="border-t border-gray-800 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-[#00FF00]/5 to-transparent">
              <Button 
                variant="outline" 
                className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300 button-hover-slide"
                onClick={() => {
                  setCurrentStep(Math.max(0, currentStep - 1))
                  setUserInput("")
                  setShowHint(false)
                  setAttempts(0)
                  setErrorMessage("")
                }}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Previous Challenge
              </Button>
              
              <Button 
                className="bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/30 transition-all duration-300 button-hover-slide"
                onClick={() => {
                  if (currentStep < LAB_STEPS.length - 1) {
                    setCurrentStep(currentStep + 1)
                    setUserInput("")
                    setShowHint(false)
                    setAttempts(0)
                    setErrorMessage("")
                  } else {
                    router.push('/cyber-labs')
                  }
                }}
                disabled={currentStep === LAB_STEPS.length - 1 && !stepStatus[LAB_STEPS.length - 1]}
              >
                {currentStep < LAB_STEPS.length - 1 ? (
                  <>
                    Next Challenge
                    <ChevronLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Complete Lab
                    <Trophy className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 