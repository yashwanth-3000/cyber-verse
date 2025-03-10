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
  description: "Your first mission in cyber reconnaissance. Navigate through a series of increasingly complex challenges designed to test your ability to find what's hidden in plain sight. Remember: in cybersecurity, nothing is ever as it seems.",
  difficulty: "Beginner",
  duration: "30-45 min",
  category: "CTF Challenges",
  tags: ["CTF", "Beginner Friendly", "Web", "Cryptography", "Forensics", "Code Analysis"]
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
    transition: all 0.2s ease;
  }

  .hover-glow:hover {
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
    border-color: rgba(0, 255, 0, 0.4);
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
          <h3 className="text-xl font-semibold text-white">Challenge 1: Digital Fingerprints</h3>
          <p className="text-gray-300">
            Every webpage leaves <span className="text-gray-400">traces</span> of information invisible to the casual visitor. Security analysts know that developers often leave comments, metadata, and other artifacts that can reveal crucial information about a system's vulnerabilities.
          </p>
          
          <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-black/70 rounded-md border border-dashed border-gray-700 hover:border-[#00FF00]/20 transition-colors duration-200">
            <h4 className="text-[#00FF00] mb-2 flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
              Operation Brief
            </h4>
            <p className="text-gray-300">
              This secure terminal appears to contain classified information, but it's not visible on the surface. Your mission is to uncover the hidden flag using standard web reconnaissance techniques.
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              {/* Agents note: Sometimes the most valuable information is hidden in plain sight, just not visible to the naked eye. The key to this challenge is right here on this page. */}
            </p>
            <div className="mt-4 p-4 bg-black rounded border border-dashed border-gray-700" id="challenge-container">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-[#00FF00] mb-0">CLASSIFIED TERMINAL</h5>
                <div className="flex space-x-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                </div>
              </div>
              <p className="text-gray-300 font-mono">
                $ cat /etc/system.conf<br/>
                # System Configuration File<br/>
                # Last modified: 04-12-2023<br/>
                # {/* FLAG_LOCATION: Check HTML comments */}
              </p>
              <p className="text-gray-300 mt-3 font-mono">
                $ ls -la /var/www/hidden/<br/>
                total 12<br/>
                drwxr-xr-x 2 root root 4096 Apr 12 10:24 .<br/>
                drwxr-xr-x 4 root root 4096 Apr 12 09:15 ..<br/>
                -rw-r--r-- 1 root root &nbsp;&nbsp;34 Apr 12 10:24 .secret
              </p>
              <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
                TIP: Professional security analysts always examine page source code for clues.
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Mission Objective:</h4>
            <p className="text-gray-300">
              Locate and extract the hidden flag. Format: <code>flag&#123;...&#125;</code>
            </p>
            {/* The comment below has a subtle hint that relates to viewing page source */}
            {/* <FindMeIfYouCan>flag{html_inspection_master}</FindMeIfYouCan> */}
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <Flag className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                variant="ghost"
                onClick={validateFlag}
                className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-colors duration-200"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[0] && (
              <Alert className="mt-4 bg-red-900/20 border-dashed border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[0] && (
              <Alert className="mt-4 bg-green-900/20 border-dashed border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Challenge Complete!</AlertTitle>
                <AlertDescription>
                  Excellent reconnaissance work! You've successfully discovered the hidden comment in the HTML source. This technique is frequently used by security professionals to find sensitive information that developers accidentally left in production code.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[0] && (
              <Alert className="mt-4 bg-blue-900/20 border-dashed border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Intel Report:</AlertTitle>
                <AlertDescription>
                  Check the page source code (Ctrl+U on Windows/Linux or Cmd+Option+U on Mac). Look carefully for comments that might contain the flag.
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
          <h3 className="text-xl font-semibold text-white">Challenge 2: Caesar's Shadow</h3>
          <p className="text-gray-300">
            Encryption has been used throughout history to protect sensitive information. One of the oldest ciphers, dating back to Julius Caesar, involves shifting letters a fixed number of positions in the alphabet - a technique still relevant for understanding basic cryptographic concepts.
          </p>
          
          <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-black/70 rounded-md border border-dashed border-gray-700 hover:border-[#00FF00]/20 transition-colors duration-200">
            <h4 className="text-[#00FF00] mb-2 flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
              Intercepted Transmission
            </h4>
            <p className="text-gray-300 mb-4">
              Our systems have intercepted an encrypted message from a suspicious source. Intelligence suggests it's using a classic Caesar cipher with a shift of <span className="font-mono text-[#00FF00]/80">3</span> positions.
            </p>
            {/* Hidden clue in the description: the number 3 is highlighted, indicating the shift value */}
            <div className="mt-4 p-4 bg-gray-900/80 rounded-md border border-dashed border-gray-700 font-mono flex items-center space-x-3 group hover:border-[#00FF00]/30 transition-colors duration-200">
              <div className="w-4 flex flex-col space-y-1">
                <span className="h-1 w-1 rounded-full bg-red-500 group-hover:bg-red-400 transition-all duration-300"></span>
                <span className="h-1 w-1 rounded-full bg-yellow-500 group-hover:bg-yellow-400 transition-all duration-300"></span>
                <span className="h-1 w-1 rounded-full bg-green-500 group-hover:bg-green-400 transition-all duration-300"></span>
              </div>
              <div className="space-y-2 w-full">
                <p className="text-gray-400 text-xs">ENCRYPTED_MESSAGE.txt</p>
                <p className="text-[#00FF00] flex-1 overflow-x-auto group-hover:text-[#00FF00]/90 transition-all duration-300" ref={encodedMessageRef}>iodj&#123;fdhvdu_vdodg_lv_gholflrxv&#125;</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-900/50 rounded text-sm border-l-2 border-dashed border-yellow-500">
              <p className="text-gray-300">
                <span className="text-yellow-400 font-medium">Agent Note:</span> The shift value denotes how many positions each letter moves forward in the alphabet. To decrypt, you'll need to reverse the process.
              </p>
              <p className="text-gray-400 mt-2 text-xs">
                Historical fact: While Caesar used a shift of 3, any shift value can be used for this cipher. The key to breaking it is knowing the shift direction and value.
              </p>
              {/* Hidden clue: the historical fact mentions shift direction, hinting that the decryption requires shifting backward (or using -3/23 as the key) */}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Decryption Assignment:</h4>
            <p className="text-gray-300">
              Decrypt the intercepted message and retrieve the flag. Think like a cryptanalyst - what happens when you shift each letter in the opposite direction?
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the decrypted flag"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <Key className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                variant="ghost"
                onClick={validateFlag}
                className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-colors duration-200"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[1] && (
              <Alert className="mt-4 bg-red-900/20 border-dashed border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Decryption Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[1] && (
              <Alert className="mt-4 bg-green-900/20 border-dashed border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Decryption Successful!</AlertTitle>
                <AlertDescription>
                  Outstanding cryptanalysis work! You've successfully decrypted the Caesar cipher. While this is a simple substitution cipher, it forms the foundation of understanding more complex encryption methods. In modern cryptography, these principles extend to vastly more sophisticated algorithms.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[1] && (
              <Alert className="mt-4 bg-blue-900/20 border-dashed border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Decryption Hint:</AlertTitle>
                <AlertDescription>
                  <p>With a Caesar cipher shift of 3, each letter is moved 3 positions forward in the alphabet.</p>
                  <p className="mt-1">To decrypt, shift each letter 3 positions backward (or 23 forward). Example: 'd' → 'a', 'e' → 'b', 'f' → 'c'</p>
                  <p className="mt-2 text-xs opacity-80">Try using an online Caesar cipher decoder if you're having trouble with the manual calculation.</p>
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
          <h3 className="text-xl font-semibold text-white">Challenge 3: The Digital Archaeologist</h3>
          <p className="text-gray-300">
            Digital files often contain more than meets the eye. Metadata—data about data—can reveal crucial information about a file's origin, creation date, and sometimes sensitive information intentionally or unintentionally embedded by its creator.
          </p>
          
          <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-black/70 rounded-md border border-dashed border-gray-700 hover:border-[#00FF00]/20 transition-colors duration-200">
            <h4 className="text-[#00FF00] mb-2 flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
              Forensic Analysis Assignment
            </h4>
            <p className="text-gray-300 mb-2">
              We've obtained an image file suspected to contain hidden intelligence. Digital forensics reveals that the metadata holds the key to unlocking its secrets.
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
                {/* Hidden clue: The colors red, yellow, green often indicate sensitive information in security contexts */}
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-900/80 rounded-md border border-dashed border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Forensic Analysis Output:
                </p>
                <code className="text-[#00FF00] text-xs font-mono bg-gray-900/40 px-2 py-1 rounded">exiftool secret-image.jpg</code>
              </div>
              <div className="mt-2 p-3 border border-gray-700 rounded-md font-mono text-xs bg-gray-900/40">
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
                    <span title="This date might be significant">2023:10:15 09:42:36</span>
                  </p>
                  <p className="text-gray-300 flex">
                    <span className="w-32 text-gray-500">Camera Model:</span>
                    <span>CTF Tutorial Camera</span>
                  </p>
                  <p className="text-gray-300 flex bg-[#00FF00]/5 p-1 rounded">
                    <span className="w-32 text-gray-500">Comment:</span>
                    <span className="text-[#00FF00]">The flag is flag&#123;metadata_reveals_secrets&#125;</span>
                  </p>
                  {/* The metadata is highlighted with a subtle green background to draw attention */}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Extraction Objective:</h4>
            <p className="text-gray-300">
              Analyze the metadata and extract the hidden flag. In real-world scenarios, metadata extraction can reveal confidential information like geolocation, device identifiers, or comments left by authors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag from the metadata"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <FileCode2 className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                variant="ghost"
                onClick={validateFlag}
                className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-colors duration-200"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[2] && (
              <Alert className="mt-4 bg-red-900/20 border-dashed border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Extraction Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[2] && (
              <Alert className="mt-4 bg-green-900/20 border-dashed border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Flag Extracted!</AlertTitle>
                <AlertDescription>
                  Excellent forensic work! You've successfully extracted the hidden information from the file metadata. Digital forensics specialists routinely analyze metadata to discover crucial evidence that may not be apparent from just viewing the file contents.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[2] && (
              <Alert className="mt-4 bg-blue-900/20 border-dashed border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Hint:</AlertTitle>
                <AlertDescription>
                  The metadata contains several fields, but one stands out as particularly interesting. Check the "Comment" field near the bottom of the metadata output - this is often used to store notes or hidden data.
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
          <h3 className="text-xl font-semibold text-white">Challenge 4: Code Breaker</h3>
          <p className="text-gray-300">
            Understanding code is a critical skill for security professionals. Malicious actors often obfuscate their intentions within seemingly innocent code, and being able to reverse-engineer and analyze what code does is essential for threat detection.
          </p>
          
          <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-black/70 rounded-md border border-dashed border-gray-700 hover:border-[#00FF00]/20 transition-colors duration-200">
            <h4 className="text-[#00FF00] mb-2 flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
              Code Analysis Assignment
            </h4>
            <p className="text-gray-300 mb-2">
              We've intercepted a suspicious JavaScript function that appears to be generating a flag through several transformations. Your mission is to analyze the code and determine what output it would produce if executed.
            </p>
            <div className="mt-4 p-4 bg-gray-900/80 rounded-md border border-dashed border-gray-700 font-mono text-sm overflow-x-auto hover:border-[#00FF00]/20 transition-colors duration-200">
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
              {/* Line numbers and spacing are provided to make it easier to analyze */}
              <div className="mt-3 p-2 bg-gray-900/30 rounded text-xs text-gray-400 italic">
                <span className="text-[#00FF00]/70">System Note:</span> {/* Hidden clue in the note */}
                <span> ASCII decimal value 97 corresponds to the character 'a' in standard ASCII encoding.</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg text-white">Reverse Engineering Task:</h4>
            <p className="text-gray-300">
              Analyze the JavaScript code and determine what flag it would generate if executed. 
              <span className="text-gray-400"> Pay special attention to how the various parts are combined and what transformations are applied to the data.</span>
            </p>
            
            <div className="mt-3 mb-4 p-3 bg-gray-900/30 rounded text-sm border-l-2 border-[#00FF00]/30">
              <p className="text-gray-300 flex items-start">
                <span className="text-[#00FF00] font-mono mr-2">{`>`}</span>
                <span>Carefully trace through the code execution. The function builds a string step by step, with part2 requiring a special transformation before being added to the result.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative group">
                  <Input
                    placeholder="Enter the flag the code would generate"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white w-full h-11 pl-4 pr-10 transition-all duration-300 focus:border-[#00FF00]/50 focus:ring-1 focus:ring-[#00FF00]/30 hover:border-[#00FF00]/30"
                  />
                  <BinaryIcon className="absolute right-3 top-3 h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-[#00FF00]/70" />
                </div>
              </div>
              <Button 
                variant="ghost"
                onClick={validateFlag}
                className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-colors duration-200"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Flag
              </Button>
            </div>
            
            {errorMessage && !stepStatus[3] && (
              <Alert className="mt-4 bg-red-900/20 border-dashed border-red-500 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Code Analysis Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {stepStatus[3] && (
              <Alert className="mt-4 bg-green-900/20 border-dashed border-green-500 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Analysis Successful!</AlertTitle>
                <AlertDescription>
                  Outstanding code analysis! You've successfully reverse-engineered the JavaScript function and determined its output. This ability to read and understand code is critical for identifying vulnerabilities, analyzing malware, and understanding how systems can be exploited or protected.
                </AlertDescription>
              </Alert>
            )}
            
            {attempts > 2 && showHint && !stepStatus[3] && (
              <Alert className="mt-4 bg-blue-900/20 border-dashed border-blue-500 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Code Analysis Hint:</AlertTitle>
                <AlertDescription>
                  <p>Focus on the part2 array. Each number in the array is an ASCII code that represents a character.</p>
                  <p className="mt-1">The <code>String.fromCharCode()</code> method converts these ASCII codes to characters.</p>
                  <p className="mt-1">Try working out what word the ASCII codes in part2 represent, then see how all five parts combine to form the flag.</p>
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
              variant="ghost"
              className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 mr-4 transition-colors duration-200"
              onClick={() => router.push('/cyber-labs')}
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
          <Alert className="bg-green-900/20 border-dashed border-green-500 hover-glow">
            <div className="flex items-start">
              <Trophy className="h-12 w-12 text-yellow-400 mr-6 flex-shrink-0 mt-1 pulse-animation" />
              <div>
                <AlertTitle className="text-2xl font-bold text-white mb-2 glitch-effect" data-text="Challenge Complete!">Challenge Complete!</AlertTitle>
                <AlertDescription className="text-gray-300">
                  <p className="mb-4 text-lg">You've successfully completed all challenges in the Beginner CTF Lab! 🎉</p>
                  <div className="p-4 bg-black/80 rounded-lg border border-dashed border-green-500/30 mb-4 scanner-animation">
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
                      <Button className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] hover:border-[#00FF00]/40 border border-dashed border-[#00FF00]/30 px-8 py-6 text-lg transition-colors duration-200">
                        <Trophy className="mr-2 h-5 w-5" />
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
            <Card className="bg-black border border-dashed border-gray-800 overflow-hidden mb-4 card-hover hover-glow">
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
            
            <Card className="bg-black border border-dashed border-gray-800 overflow-hidden card-hover hover-glow">
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
          <Card className="bg-black border border-dashed border-gray-800 overflow-hidden hover-glow">
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
            <CardContent className="p-6 scanner-animation bg-black bg-opacity-5">
              {LAB_STEPS[currentStep].content}
            </CardContent>
            <CardFooter className="border-t border-dashed border-gray-800 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-[#00FF00]/5 to-transparent">
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:bg-[#00FF00]/5 hover:text-[#00FF00] hover:border-[#00FF00]/30 border border-dashed border-gray-700 transition-colors duration-200"
                onClick={() => {
                  setCurrentStep(Math.max(0, currentStep - 1))
                  setUserInput("")
                  setShowHint(false)
                  setAttempts(0)
                  setErrorMessage("")
                }}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Challenge
              </Button>
              
              <Button 
                variant="ghost"
                className="text-amber-400 hover:bg-amber-900/10 hover:border-amber-500/40 border border-dashed border-amber-700/30 mx-2 transition-colors duration-200"
                onClick={() => router.push('/cyber-labs/solutions/beginner-ctf')}
              >
                <Key className="mr-2 h-4 w-4" />
                View Solution
              </Button>
              
              <Button 
                variant="ghost"
                className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] hover:border-[#00FF00]/40 border border-dashed border-[#00FF00]/30 transition-colors duration-200"
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
                    <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                  </>
                ) : (
                  <>
                    Complete Lab
                    <Trophy className="ml-2 h-4 w-4" />
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