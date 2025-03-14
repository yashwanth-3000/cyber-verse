"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Key, Flag, Code, ShieldAlert, Terminal, AlertTriangle, Eye, RefreshCw, ExternalLink, Database, Book } from "lucide-react"
import { ProgressClient } from "@/lib/services/progress-service"
import { toast } from "sonner"
import { useAuth } from "@/lib/providers/auth-provider"

// Lab steps data
const LAB_STEPS = [
  {
    name: "XSS Vulnerability Detection",
    id: "xss-detection",
    description: "Learn to identify and exploit Cross-Site Scripting (XSS) vulnerabilities in web applications.",
    hint: "Look for user input fields that don't properly sanitize script tags. Try injecting simple JavaScript like <script>alert('XSS')</script>",
    flag: "flag{xss_detection_complete}",
    codeSnippet: `
// Vulnerable code:
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML += comment;
}

// Secure code:
function displayUserComment(comment) {
  const sanitized = DOMPurify.sanitize(comment);
  document.getElementById('comments').innerHTML += sanitized;
}`,
    resources: [
      { name: "OWASP XSS Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
      { name: "PortSwigger XSS Tutorial", url: "https://portswigger.net/web-security/cross-site-scripting" }
    ]
  },
  {
    name: "SQL Injection Basics",
    id: "sql-injection",
    description: "Learn how to identify and exploit SQL injection vulnerabilities in web applications.",
    hint: "Try adding single quotes or SQL syntax like ' OR 1=1 -- to input fields to manipulate database queries.",
    flag: "flag{sql_injection_master}",
    codeSnippet: `
// Vulnerable code:
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";

// Secure code using prepared statements:
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
connection.query(query, [username, password], function(error, results) {
  // Handle results...
});`,
    resources: [
      { name: "OWASP SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
      { name: "PortSwigger SQL Injection Tutorial", url: "https://portswigger.net/web-security/sql-injection" }
    ]
  },
  {
    name: "CSRF Protection",
    id: "csrf-protection",
    description: "Learn about Cross-Site Request Forgery (CSRF) attacks and how to implement proper protections.",
    hint: "Check for missing CSRF tokens in state-changing operations. Valid CSRF protections include tokens and same-site cookies.",
    flag: "flag{csrf_shield_activated}",
    codeSnippet: `
// Vulnerable form without CSRF protection:
<form action="/transfer" method="POST">
  <input type="hidden" name="to" value="account123">
  <input type="hidden" name="amount" value="1000">
  <input type="submit" value="Click here to claim prize">
</form>

// Protected form with CSRF token:
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random_token_tied_to_user_session">
  <input type="hidden" name="to" value="account123">
  <input type="hidden" name="amount" value="1000">
  <input type="submit" value="Transfer funds">
</form>`,
    resources: [
      { name: "OWASP CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
      { name: "Implement Anti-CSRF Tokens", url: "https://portswigger.net/web-security/csrf/tokens" }
    ]
  },
  {
    name: "Secure Authentication",
    id: "secure-auth",
    description: "Implement and test secure authentication mechanisms to protect user accounts.",
    hint: "Check for proper password hashing, brute force protection, and multi-factor authentication options.",
    flag: "flag{secure_auth_implemented}",
    codeSnippet: `
// Insecure password storage:
function storePassword(password) {
  return md5(password); // MD5 is NOT secure for passwords
}

// Secure password storage:
const bcrypt = require('bcrypt');
async function storePassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password:
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}`,
    resources: [
      { name: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
      { name: "Password Storage Guide", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" }
    ]
  },
  {
    name: "Content Security Policy",
    id: "csp-implementation",
    description: "Learn how to implement and test Content Security Policy (CSP) to mitigate various attacks.",
    hint: "Review the HTTP headers and implement a CSP that restricts resource loading and inline scripts appropriately.",
    flag: "flag{csp_shield_engaged}",
    codeSnippet: `
// Basic CSP header implementation:
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' https://trusted-cdn.com; img-src 'self' data: https:; connect-src 'self' https://api.example.com"
  );
  next();
});

// CSP report-only mode for testing:
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; report-uri /csp-violation-report-endpoint"
  );
  next();
});`,
    resources: [
      { name: "OWASP Content Security Policy", url: "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html" },
      { name: "CSP Evaluator Tool", url: "https://csp-evaluator.withgoogle.com/" }
    ]
  }
];

export default function WebSecurityLab() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [stepStatus, setStepStatus] = useState(Array(LAB_STEPS.length).fill(false));
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [labId] = useState("web-security-lab");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialLoadDoneRef = useRef(false);
  const labCompletionTriggeredRef = useRef(false);
  
  // Load completed steps from Supabase when component mounts or auth state changes
  useEffect(() => {
    const loadCompletedSteps = async () => {
      try {
        if (!user) {
          console.log("User not logged in, cannot load completed steps");
          return;
        }
        
        // Skip if we've already loaded steps once to prevent infinite loops
        if (initialLoadDoneRef.current) {
          console.log("Initial load already done, skipping to prevent loop");
          return;
        }
        
        console.log("Loading completed steps for lab:", labId);
        console.log("User ID:", user.id);
        
        const stepProgress = await ProgressClient.getLabStepProgress(labId);
        console.log("Loaded step progress:", stepProgress);
        
        if (stepProgress && stepProgress.length > 0) {
          // Use functional update to avoid dependency on stepStatus
          setStepStatus(prevStatus => {
            const newStepStatus = [...prevStatus];
            
            // Update step status based on progress
            stepProgress.forEach(step => {
              const stepIndex = LAB_STEPS.findIndex(
                labStep => labStep.id.toLowerCase().includes(step.step_title.toLowerCase()) ||
                          labStep.name.toLowerCase().includes(step.step_title.toLowerCase())
              );
              
              if (stepIndex !== -1 && step.is_completed) {
                console.log(`Marking step ${stepIndex} (${step.step_title}) as completed`);
                newStepStatus[stepIndex] = true;
              }
            });
            
            // Find the first incomplete step
            const firstIncompleteIndex = newStepStatus.findIndex(status => !status);
            if (firstIncompleteIndex !== -1) {
              console.log(`Navigating to first incomplete step: ${firstIncompleteIndex}`);
              setCurrentStep(firstIncompleteIndex);
            }
            
            // Mark that we've done the initial load
            initialLoadDoneRef.current = true;
            
            return newStepStatus;
          });
        } else {
          // If no steps are completed yet, still mark initial load as done
          initialLoadDoneRef.current = true;
        }
      } catch (error) {
        console.error("Error loading completed steps:", error);
        // Even on error, mark as done to prevent infinite retries
        initialLoadDoneRef.current = true;
      }
    };
    
    // Only load completed steps if a user is logged in and initial load hasn't been done
    if (user && !initialLoadDoneRef.current) {
      loadCompletedSteps();
    }
  }, [user, labId]);

  // Update overall progress when step status changes
  useEffect(() => {
    // Show congrats if all steps are completed
    const completedSteps = stepStatus.filter(Boolean).length;
    
    if (completedSteps === stepStatus.length) {
      setCongratsVisible(true);
      
      // Mark entire lab as completed, but only once
      if (user && !labCompletionTriggeredRef.current) {
        labCompletionTriggeredRef.current = true;
        ProgressClient.completeLab(labId)
          .then(result => {
            console.log("Lab completed:", result);
            toast.success("Congratulations! Lab completed successfully.");
          })
          .catch(error => {
            console.error("Error completing lab:", error);
            // Reset the flag if there was an error, to allow retry
            labCompletionTriggeredRef.current = false;
          });
      }
    }
    
    // Still update localStorage as a fallback for non-logged-in users
    localStorage.setItem('webSecurityLabStatus', JSON.stringify(stepStatus));
  }, [stepStatus, user, labId]);
  
  const validateFlag = () => {
    // Reset error message
    setErrorMessage("");
    setIsSubmitting(true);
    
    // Check if input is empty
    if (!userInput.trim()) {
      setErrorMessage("Please enter a flag before submitting");
      setIsSubmitting(false);
      return;
    }
    
    const correctFlag = LAB_STEPS[currentStep].flag;
    
    if (userInput.trim() === correctFlag) {
      // Success - update local state first for immediate feedback
      const newStepStatus = [...stepStatus];
      newStepStatus[currentStep] = true;
      setStepStatus(newStepStatus);
      setErrorMessage("");
      setUserInput("");
      
      // Save progress to Supabase if user is logged in
      if (user) {
        console.log(`User is logged in, saving progress for step ${LAB_STEPS[currentStep].id}`);
        
        // Force a delay to ensure any race conditions are avoided
        setTimeout(async () => {
          try {
            const result = await ProgressClient.updateStepProgress(
              labId,
              `step-${currentStep + 1}`,
              LAB_STEPS[currentStep].name,
              true
            );
            
            if (result) {
              console.log("Successfully saved step progress:", result);
              toast.success(`Challenge completed! Progress saved.`);
            } else {
              console.error("Failed to save step progress - result was null");
              toast.error("Failed to save progress. Please try again.");
            }
          } catch (progressError) {
            console.error("Exception saving progress:", progressError);
            toast.error("Error saving progress. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }, 500);
      } else {
        console.log("User not logged in, cannot save progress");
        toast.warning("Log in to save your progress!");
        setIsSubmitting(false);
      }
      
      // Move to next step if not the last one
      if (currentStep < LAB_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setShowHint(false);
          setAttempts(0);
        }, 1500);
      }
    } else {
      // Failure
      setAttempts(attempts + 1);
      setErrorMessage("Incorrect flag. Try again.");
      setIsSubmitting(false);
      
      // Show hint after 3 failed attempts
      if (attempts >= 2 && !showHint) {
        setShowHint(true);
      }
    }
  };
  
  const styles = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.02); opacity: 0.9; }
    }
    
    .pulse-animation {
      animation: pulse 3s ease-in-out infinite;
    }
    
    .hover-glow {
      transition: all 0.2s ease;
    }
    
    .hover-glow:hover {
      box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
      border-color: rgba(0, 255, 0, 0.4);
    }
  `;
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <style>{styles}</style>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 mr-4 transition-colors duration-200"
            onClick={() => router.push('/cyber-labs')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Web Security Lab</h1>
          <Badge className="ml-3 bg-amber-900/30 text-amber-300 border border-amber-700/30">Intermediate</Badge>
        </div>
        
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-[#00FF00] hover:bg-[#00FF00]/5 border border-dashed border-gray-700 hover:border-[#00FF00]/30 transition-colors duration-200"
          onClick={() => router.push('/cyber-labs/solutions/web-security-lab')}
        >
          <Key className="mr-2 h-4 w-4" />
          View Solutions
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="bg-black border border-dashed border-gray-800 hover-glow">
            <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800">
              <CardTitle className="text-xl text-white">Lab Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {LAB_STEPS.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md border border-dashed flex items-center cursor-pointer hover:bg-black/40 transition-colors duration-200 
                      ${currentStep === index ? 'bg-black/50 border-[#00FF00]/30' : 'border-gray-800'} 
                      ${stepStatus[index] ? 'border-[#00FF00]/30' : ''}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3
                      ${stepStatus[index] ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'bg-gray-900 text-gray-400'}`}
                    >
                      {stepStatus[index] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${stepStatus[index] ? 'text-[#00FF00]' : 'text-gray-300'}`}>{step.name}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{step.id}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="text-xs text-gray-500 mb-2">Overall Progress</div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00FF00] transition-all duration-500" 
                    style={{ width: `${(stepStatus.filter(Boolean).length / LAB_STEPS.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {stepStatus.filter(Boolean).length} / {LAB_STEPS.length} completed
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border border-dashed border-gray-800 mt-6 hover-glow">
            <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800">
              <CardTitle className="text-xl text-white flex items-center">
                <Key className="mr-2 h-5 w-5 text-[#00FF00]" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Link href="https://owasp.org/Top10/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">OWASP Top 10</span>
                      <span className="text-xs opacity-60">Common web vulnerabilities</span>
                    </div>
                  </Button>
                </Link>
                <Link href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <Terminal className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">PortSwigger Academy</span>
                      <span className="text-xs opacity-60">Web security learning materials</span>
                    </div>
                  </Button>
                </Link>
                <Link href="https://cheatsheetseries.owasp.org/Glossary.html" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <Code className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">OWASP Cheat Sheets</span>
                      <span className="text-xs opacity-60">Security implementation guides</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-9">
          {/* Success message */}
          {stepStatus[currentStep] && (
            <div className="mb-4 p-4 bg-[#00FF00]/10 border border-dashed border-[#00FF00]/30 rounded-md flex items-center">
              <div className="bg-[#00FF00]/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FF00]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[#00FF00] font-medium">Challenge Completed!</p>
                <p className="text-gray-300 text-sm">You've successfully completed this challenge. Continue to the next one or explore other challenges.</p>
              </div>
            </div>
          )}
          
          {/* Congratulations message */}
          {congratsVisible ? (
            <Card className="bg-black border border-dashed border-[#00FF00]/30 overflow-hidden hover-glow">
              <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/10 border-b border-gray-800 text-center pt-8 pb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 rounded-full bg-[#00FF00]/20 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="h-10 w-10 text-[#00FF00]" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">Congratulations!</CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    You've completed the Web Security Lab
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="text-center pt-8 pb-8">
                <p className="text-gray-300 max-w-xl mx-auto">
                  You've successfully completed all 5 levels of the Web Security Lab. You now have a solid understanding of common web vulnerabilities and how to protect against them.
                </p>
                <div className="flex flex-wrap gap-4 items-center justify-center mt-8">
                  <div className="flex items-center space-x-1 text-amber-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <Badge className="bg-amber-900/30 text-amber-300 border border-amber-700/30">Intermediate Level</Badge>
                  <Badge className="bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">5 Challenges</Badge>
                </div>
                <div className="flex justify-center mt-6">
                  <Link href="/cyber-labs">
                    <Button className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] hover:border-[#00FF00]/40 border border-dashed border-[#00FF00]/30 px-6 py-5 text-lg transition-colors duration-200">
                      <ShieldAlert className="mr-2 h-5 w-5" />
                      Return to Labs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border border-dashed border-gray-800 overflow-hidden hover-glow">
              <CardHeader className="bg-gradient-to-r from-black to-[#00FF00]/5 border-b border-gray-800 flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-white flex items-center">
                  <span className="h-6 w-6 rounded-full bg-[#00FF00]/20 flex items-center justify-center mr-3 flex-shrink-0 pulse-animation">
                    <span className="text-[#00FF00] text-sm font-mono">{currentStep + 1}</span>
                  </span>
                  <span>{LAB_STEPS[currentStep].name}</span>
                </CardTitle>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse"></span>
                  <span>ACTIVE</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <h3 className="text-[#00FF00] text-lg font-medium mb-2">Challenge Description</h3>
                <p className="text-gray-300">
                  {LAB_STEPS[currentStep].description}
                </p>
                
                <div className="my-6 p-4 bg-gradient-to-b from-gray-900 to-black/70 rounded-md border border-dashed border-gray-700 hover:border-[#00FF00]/20 transition-colors duration-200">
                  <h4 className="text-[#00FF00] mb-2 flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-[#00FF00] mr-2 pulse-animation"></span>
                    Example Vulnerable Code
                  </h4>
                  <div className="mt-4 p-4 bg-gray-900/80 rounded-md border border-dashed border-gray-700 font-mono text-sm overflow-x-auto hover:border-[#00FF00]/20 transition-colors duration-200">
                    <pre className="text-gray-300 whitespace-pre-wrap">{LAB_STEPS[currentStep].codeSnippet}</pre>
                  </div>
                </div>
                
                {/* Resources for this challenge */}
                <div className="mb-6 p-4 bg-gray-900/30 rounded-md border border-dashed border-gray-700">
                  <h4 className="text-[#00FF00] mb-3 flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learning Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {LAB_STEPS[currentStep].resources.map((resource, index) => (
                      <a 
                        key={index} 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-black/40 rounded border border-dashed border-gray-800 hover:border-[#00FF00]/30 transition-colors duration-200"
                      >
                        <div className="bg-gray-900 p-1.5 rounded mr-3">
                          <Book className="h-4 w-4 text-[#00FF00]" />
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-300 font-medium">{resource.name}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                
                {/* Submit flag */}
                <div className="mt-8">
                  <h3 className="text-[#00FF00] text-lg font-medium mb-3">Enter Flag to Complete Challenge</h3>
                  
                  {/* Show hint after 3 attempts */}
                  {showHint && (
                    <div className="mb-4 p-4 bg-amber-900/10 border border-dashed border-amber-700/30 rounded-md">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-400 font-medium">Hint</p>
                          <p className="text-gray-300 text-sm mt-1">{LAB_STEPS[currentStep].hint}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Enter flag here (e.g., flag{...})"
                      className="bg-gray-900/50 border-gray-700 text-gray-200 focus:border-[#00FF00]/50 placeholder:text-gray-600"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && validateFlag()}
                    />
                    <Button 
                      variant="ghost"
                      onClick={validateFlag}
                      className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] border border-dashed border-[#00FF00]/30 whitespace-nowrap h-11 min-w-[130px] transition-colors duration-200"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Submit Flag
                    </Button>
                  </div>
                  
                  {/* Error message */}
                  {errorMessage && (
                    <p className="mt-2 text-red-400 text-sm">{errorMessage}</p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-gray-800 py-4 flex justify-between">
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
                  onClick={() => router.push('/cyber-labs/solutions/web-security-lab')}
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
                      <ShieldAlert className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 