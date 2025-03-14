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
import { ChevronLeft, Key, Flag, Code, Network, Terminal, AlertTriangle, Eye, RefreshCw, ExternalLink, Database, Book, Shield, Server, Activity } from "lucide-react"
import { ProgressClient } from "@/lib/services/progress-service"
import { toast } from "sonner"
import { useAuth } from "@/lib/providers/auth-provider"

// Lab steps data
const LAB_STEPS = [
  {
    name: "Network Traffic Analysis",
    id: "traffic-analysis",
    description: "Learn to analyze network packets to identify suspicious activities and potential security threats.",
    hint: "Look for unusual traffic patterns and examine TCP/UDP headers for abnormalities. Pay attention to source and destination IPs, ports, and protocols.",
    flag: "flag{packet_analysis_complete}",
    codeSnippet: `
# Using tcpdump to capture suspicious traffic:
tcpdump -i eth0 -n "host 192.168.1.100 and port 22" -w capture.pcap

# Reading captured packets with Wireshark filter:
tcp.flags.syn == 1 and tcp.flags.ack == 0

# Python script to analyze packets with Scapy:
from scapy.all import *

def analyze_packet(packet):
    if TCP in packet and packet[TCP].flags & 2:  # SYN packets
        print(f"SYN packet: {packet[IP].src} -> {packet[IP].dst}")
        
sniff(filter="tcp", prn=analyze_packet)`,
    resources: [
      { name: "Wireshark User Guide", url: "https://www.wireshark.org/docs/wsug_html_chunked/" },
      { name: "TCPDump Tutorial", url: "https://danielmiessler.com/study/tcpdump/" }
    ]
  },
  {
    name: "Intrusion Detection",
    id: "intrusion-detection",
    description: "Configure and use intrusion detection systems (IDS) to monitor and alert on suspicious network activities.",
    hint: "Set up proper rules to detect specific attack patterns. Focus on known signatures for common attacks like port scanning and brute force attempts.",
    flag: "flag{ids_master_defender}",
    codeSnippet: `
# Sample Snort rule to detect SSH brute force attempts:
alert tcp any any -> $HOME_NET 22 (msg:"Potential SSH brute force attempt"; \
  flow:to_server; threshold:type threshold, track by_src, count 5, seconds 60; \
  classtype:attempted-admin; sid:1000001; rev:1;)

# Sample Suricata rule to detect port scanning:
alert tcp any any -> $HOME_NET any (msg:"Potential port scan"; \
  flags:S; threshold:type threshold, track by_src, count 20, seconds 10; \
  classtype:attempted-recon; sid:1000002; rev:1;)

# Python-based IDS monitoring script:
import pyshark

def detect_intrusions(packet):
    try:
        if hasattr(packet, 'tcp') and packet.tcp.flags == '0x00000002':  # SYN flag
            ip_src = packet.ip.src
            if ip_src in scan_count:
                scan_count[ip_src] += 1
                if scan_count[ip_src] > 20:
                    print(f"ALERT: Potential port scan from {ip_src}")
            else:
                scan_count[ip_src] = 1
    except Exception as e:
        pass

capture = pyshark.LiveCapture(interface='eth0')
scan_count = {}
capture.apply_on_packets(detect_intrusions)`,
    resources: [
      { name: "Snort Documentation", url: "https://www.snort.org/documents" },
      { name: "Suricata User Guide", url: "https://suricata.readthedocs.io/en/latest/index.html" }
    ]
  },
  {
    name: "Firewall Configuration",
    id: "firewall-config",
    description: "Learn to configure network firewalls to protect systems from unauthorized access and attacks.",
    hint: "Focus on implementing the principle of least privilege and creating rules that explicitly deny unauthorized traffic while allowing legitimate communications.",
    flag: "flag{firewall_shield_engaged}",
    codeSnippet: `
# iptables rules for basic server protection:
# Clear existing rules
iptables -F

# Set default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH from trusted IPs only
iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Log and drop everything else
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
iptables -A INPUT -j DROP

# Cisco ASA firewall configuration:
access-list OUTSIDE_IN extended permit tcp any host 203.0.113.10 eq 443
access-list OUTSIDE_IN extended permit tcp any host 203.0.113.10 eq 80
access-list OUTSIDE_IN extended deny ip any any log

access-group OUTSIDE_IN in interface outside`,
    resources: [
      { name: "iptables Tutorial", url: "https://www.frozentux.net/iptables-tutorial/iptables-tutorial.html" },
      { name: "pfSense Documentation", url: "https://docs.netgate.com/pfsense/en/latest/index.html" }
    ]
  }
];

export default function NetworkDefenseLab() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [stepStatus, setStepStatus] = useState(Array(LAB_STEPS.length).fill(false));
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [labId] = useState("network-defense-lab");
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
    localStorage.setItem('networkDefenseLabStatus', JSON.stringify(stepStatus));
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
          <h1 className="text-3xl font-bold text-white">Network Defense Lab</h1>
          <Badge className="ml-3 bg-red-900/30 text-red-300 border border-red-700/30">Advanced</Badge>
        </div>
        
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-[#00FF00] hover:bg-[#00FF00]/5 border border-dashed border-gray-700 hover:border-[#00FF00]/30 transition-colors duration-200"
          onClick={() => router.push('/cyber-labs/solutions/network-defense-lab')}
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
                <Link href="https://www.sans.org/security-resources/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <Shield className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">SANS Resources</span>
                      <span className="text-xs opacity-60">Network security guides</span>
                    </div>
                  </Button>
                </Link>
                <Link href="https://www.wireshark.org/docs/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <Network className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">Wireshark Docs</span>
                      <span className="text-xs opacity-60">Packet analysis tool</span>
                    </div>
                  </Button>
                </Link>
                <Link href="https://www.cisecurity.org/controls/cis-controls-list" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start text-gray-300 hover:text-[#00FF00] hover:border-[#00FF00]/30 h-auto py-3">
                    <Server className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block">CIS Controls</span>
                      <span className="text-xs opacity-60">Network defense best practices</span>
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
                    <Shield className="h-10 w-10 text-[#00FF00]" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">Congratulations!</CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    You've completed the Network Defense Lab
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="text-center pt-8 pb-8">
                <p className="text-gray-300 max-w-xl mx-auto">
                  You've successfully completed all levels of the Network Defense Lab. You now have an advanced understanding of network traffic analysis, intrusion detection systems, and firewall configurations.
                </p>
                <div className="flex flex-wrap gap-4 items-center justify-center mt-8">
                  <div className="flex items-center space-x-1 text-red-300">
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
                  <Badge className="bg-red-900/30 text-red-300 border border-red-700/30">Advanced Level</Badge>
                  <Badge className="bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">3 Challenges</Badge>
                </div>
                <div className="flex justify-center mt-6">
                  <Link href="/cyber-labs">
                    <Button className="text-[#00FF00] hover:bg-[#00FF00]/10 hover:text-[#00FF00] hover:border-[#00FF00]/40 border border-dashed border-[#00FF00]/30 px-6 py-5 text-lg transition-colors duration-200">
                      <Network className="mr-2 h-5 w-5" />
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
                    Example Code
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
                  onClick={() => router.push('/cyber-labs/solutions/network-defense-lab')}
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
                      <Network className="ml-2 h-4 w-4" />
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