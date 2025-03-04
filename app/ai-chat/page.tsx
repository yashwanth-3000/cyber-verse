"use client";

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Sparkles, ChevronsDown, Trash2, SendHorizontal, BotIcon, UserCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Futuristic cyberpunk-themed animations
const glitchAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, type: "spring" }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 15px rgba(60, 255, 100, 0.3)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 8
    }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 0 5px rgba(60, 255, 100, 0.5)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10
    }
  }
};

const scanlineEffect = {
  initial: { y: '-100%', opacity: 0.5 },
  animate: { 
    y: '200%', 
    opacity: [0.5, 0.7, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear"
    }
  }
};

const pulseGlow = {
  initial: { boxShadow: "0 0 0px rgba(60, 255, 100, 0)" },
  animate: {
    boxShadow: [
      "0 0 0px rgba(60, 255, 100, 0)",
      "0 0 10px rgba(60, 255, 100, 0.5)",
      "0 0 20px rgba(60, 255, 100, 0.3)",
      "0 0 10px rgba(60, 255, 100, 0.5)",
      "0 0 0px rgba(60, 255, 100, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const sendButtonAnimation = {
  initial: { 
    boxShadow: "0 0 0 rgba(60, 255, 100, 0)",
    background: "rgba(0, 0, 0, 1)"
  },
  hover: {
    scale: 1.05,
    boxShadow: [
      "0 0 15px rgba(60, 255, 100, 0.5), inset 0 0 8px rgba(60, 255, 100, 0.4)",
      "0 0 18px rgba(60, 255, 100, 0.6), inset 0 0 10px rgba(60, 255, 100, 0.5)",
      "0 0 15px rgba(60, 255, 100, 0.5), inset 0 0 8px rgba(60, 255, 100, 0.4)"
    ],
    background: "linear-gradient(45deg, rgba(10, 10, 10, 1), rgba(20, 20, 20, 0.9))",
    transition: {
      boxShadow: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
      scale: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    }
  },
  tap: {
    scale: 0.97,
    boxShadow: "0 0 5px rgba(60, 255, 100, 0.7), inset 0 0 15px rgba(60, 255, 100, 0.6)",
    background: "linear-gradient(45deg, rgba(20, 20, 20, 1), rgba(10, 10, 10, 0.9))",
    transition: {
      duration: 0.1,
      ease: "easeIn"
    }
  },
  active: {
    boxShadow: [
      "0 0 10px rgba(60, 255, 100, 0.3), inset 0 0 5px rgba(60, 255, 100, 0.2)",
      "0 0 15px rgba(60, 255, 100, 0.5), inset 0 0 8px rgba(60, 255, 100, 0.4)",
      "0 0 10px rgba(60, 255, 100, 0.3), inset 0 0 5px rgba(60, 255, 100, 0.2)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const markdownStyles = `
.markdown-wrapper {
  font-size: 0.85rem;
  line-height: 1.5;
  font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
  overflow-wrap: break-word;
  word-break: break-word;
}
.markdown-wrapper p {
  margin-bottom: 0.8rem;
  color: rgb(220, 220, 220);
  font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
  white-space: pre-wrap;
}
.markdown-wrapper h1, 
.markdown-wrapper h2, 
.markdown-wrapper h3, 
.markdown-wrapper h4, 
.markdown-wrapper h5, 
.markdown-wrapper h6 {
  font-weight: 600;
  color: rgb(240, 240, 240);
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
  font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
}
.markdown-wrapper h1 {
  font-size: 1.25rem;
  margin-top: 1.6rem;
}
.markdown-wrapper h2 {
  font-size: 1.15rem;
  border-bottom: 1px solid rgba(80, 80, 80, 0.5);
  padding-bottom: 0.3rem;
}
.markdown-wrapper h3 {
  font-size: 1rem;
}
.markdown-wrapper a {
  color: #3CFF64;
  text-decoration: none;
  border-bottom: 1px dotted rgba(60, 255, 100, 0.4);
  transition: all 0.2s ease;
}
.markdown-wrapper a:hover {
  border-bottom: 1px solid rgba(60, 255, 100, 0.8);
}
.markdown-wrapper ul, 
.markdown-wrapper ol {
  margin: 0.75rem 0 1.25rem 0;
  padding-left: 1.5rem;
  list-style-position: outside;
}
.markdown-wrapper ul {
  list-style-type: disc;
}
.markdown-wrapper ol {
  list-style-type: decimal;
}
.markdown-wrapper li {
  margin-bottom: 0.5rem;
  color: rgb(215, 215, 215);
  padding-left: 0.5rem;
}
.markdown-wrapper blockquote {
  border-left: 3px solid rgba(60, 255, 100, 0.5);
  padding: 0.5rem 0 0.5rem 1rem;
  margin: 1.5rem 0;
  background: rgba(25, 25, 25, 0.5);
  border-radius: 0 4px 4px 0;
}
.markdown-wrapper blockquote p {
  color: rgb(200, 200, 200);
  font-style: italic;
}
.markdown-wrapper table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9rem;
}
.markdown-wrapper th, 
.markdown-wrapper td {
  padding: 0.75rem;
  border: 1px solid rgb(60, 60, 60);
  color: rgb(210, 210, 210);
}
.markdown-wrapper tr:nth-child(even) {
  background-color: rgba(30, 30, 30, 0.5);
}
.markdown-wrapper hr {
  border: 0;
  height: 1px;
  background: rgb(60, 60, 60);
  margin: 2rem 0;
}
.markdown-wrapper img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1.5rem 0;
  border: 1px solid rgb(40, 40, 40);
}
.markdown-wrapper pre {
  background-color: rgba(20, 20, 20, 0.8) !important;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}
.markdown-wrapper code {
  font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
  padding: 0.2rem 0.4rem;
  font-size: 0.9em;
  background: rgba(30, 30, 30, 0.6);
  border-radius: 3px;
}
.markdown-wrapper pre code {
  padding: 0;
  background: transparent;
}
`;

const cyberpunkButtonStyles = `
  @keyframes borderFlicker {
    0% { opacity: 0.4; box-shadow: 0 0 0 rgba(60, 255, 100, 0.2); }
    25% { opacity: 0.7; box-shadow: 0 0 4px rgba(60, 255, 100, 0.5); }
    50% { opacity: 0.4; box-shadow: 0 0 8px rgba(60, 255, 100, 0.3); }
    75% { opacity: 0.7; box-shadow: 0 0 4px rgba(60, 255, 100, 0.5); }
    100% { opacity: 0.4; box-shadow: 0 0 0 rgba(60, 255, 100, 0.2); }
  }
  .cyber-btn-send {
    position: relative;
    overflow: hidden;
    border: 1px dashed rgba(60, 255, 100, 0.3);
    transition: all 0.3s ease;
  }
  .cyber-btn-send:hover {
    border-color: rgba(60, 255, 100, 0.7);
    animation: borderFlicker 2s infinite;
  }
  .cyber-btn-send:before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 200%;
    background: linear-gradient(to bottom, transparent 0%, rgba(60, 255, 100, 0.1) 45%, rgba(60, 255, 100, 0.2) 50%, rgba(60, 255, 100, 0.1) 55%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    background-size: 100% 100%;
    z-index: 1;
  }
  .cyber-btn-send:hover:before {
    opacity: 1;
  }
  .cyber-btn-send .cyber-icon {
    position: relative;
    z-index: 2;
    display: inline-block;
  }
  .cyber-btn-send:hover .cyber-icon {
    animation: glitchEffect 2s infinite;
    color: rgb(60, 255, 100) !important;
  }
  .cyber-btn-send:hover .cyber-glow-border {
    opacity: 1;
  }
  .cyber-glow-border {
    position: absolute;
    top: -1px; left: -1px; right: -1px; bottom: -1px;
    border: 1px dashed rgba(60, 255, 100, 0.8);
    pointer-events: none;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
`;

// Add this to ensure ReactMarkdown is properly loaded
const ReactMarkdownWithNoSSR = dynamic(
  () => import('react-markdown'),
  { ssr: false }
);

// Function to render portal content
const ClientPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) return null;
  
  return createPortal(children, document.body);
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [highlightClearBtn, setHighlightClearBtn] = useState(false);
  
  // URL inputs
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);
  const [isYoutubeMode, setIsYoutubeMode] = useState(false); // New state to track YouTube mode
  const router = useRouter();
  const { toast } = useToast();

  // Fetch user profile from /api/account
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        
        // Check if we have a cached profile
        const cachedProfile = localStorage.getItem('user-profile');
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile);
            setUserProfile(parsedProfile);
            // Still fetch in background to update if needed
          } catch (e) {
            console.error('Failed to parse cached profile:', e);
          }
        }
        
        const response = await fetch('/api/account');
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          // Cache the profile
          localStorage.setItem('user-profile', JSON.stringify(data));
        } else {
          // If there's no authenticated user, we'll use default values
          console.log('No authenticated user found');
          // Clear cache if no longer authenticated
          localStorage.removeItem('user-profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-area-viewport');
    if (scrollContainer && isAtBottom) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100);
    }
  }, [messages, isLoading, isAtBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const formatApiResponse = (text: string): string => {
    let formatted = text.trim();
    
    // Ensure proper spacing around markdown elements
    formatted = formatted.replace(/\n(#{1,6}\s[^\n]+)/g, '\n\n$1');
    formatted = formatted.replace(/\n(\d+\.\s+|\*\s+|\-\s+)/g, '\n\n$1');
    
    // Properly handle code blocks
    formatted = formatted.replace(/\n```(\w*)\n/g, '\n\n```$1\n');
    formatted = formatted.replace(/\n```\n/g, '\n```\n\n');
    
    // Handle bold and italic text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    formatted = formatted.replace(/\*([^*]+)\*/g, '*$1*');
    
    // Ensure proper line breaks
    formatted = formatted.replace(/\n\n\n+/g, '\n\n');
    
    return formatted;
  };

  // Call webhook for YouTube analysis
  const callYoutubeWebhook = async (url: string) => {
    // DEBUG EVERYTHING
    console.log("---------------------------------------------");
    console.log("🔴 YOUTUBE WEBHOOK CALLED");
    console.log("🔴 Input text:", input);
    console.log("🔴 YouTube URL:", url);
    console.log("---------------------------------------------");
    
    // CRITICAL FIX: Ensure we have both a URL and query
    if (!url) {
      console.log("🔴 ERROR: Missing YouTube URL - cannot proceed");
      alert("Error: YouTube URL is missing. Please add a YouTube URL first.");
      return null;
    }
    
    if (!input) {
      console.log("🔴 ERROR: No query text provided");
      alert("Please enter a question about the video.");
      return null;
    }
    
    try {
      // Build a payload with exactly what we need
      const payload = {
        user_url: url,         // The YouTube URL
        user_querry: input,    // The user's query about the video
        user_memory: ""        // No memory needed for initial implementation
      };
      
      console.log("🔴 YouTube URL:", payload.user_url);
      console.log("🔴 Query:", payload.user_querry);
      console.log("🔴 RAW PAYLOAD:", JSON.stringify(payload, null, 2));
      
      // Send the POST request - ONLY to YouTube webhook
      const response = await fetch('https://api-lr.agent.ai/v1/agent/ebgd50lk0tczyd8r/webhook/1c9f7a54', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await response.text();
      console.log("🔴 WEBHOOK RESPONSE:", responseText);
      
      if (!response.ok) {
        console.error("🔴 WEBHOOK FAILED WITH STATUS:", response.status);
        alert("YouTube analysis failed. Please try again.");
        return null;
      }
      
      console.log("🔴 WEBHOOK CALL SUCCESSFUL");
      
      // Parse the response JSON and return it
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log("🔴 PARSED RESPONSE:", parsedResponse);
        
        // Return the parsed response so we can use it directly
        return parsedResponse;
      } catch (parseError) {
        console.error("🔴 ERROR PARSING RESPONSE:", parseError);
        return null;
      }
      
    } catch (error) {
      console.error("🔴 ERROR CALLING WEBHOOK:", error);
      alert("Error analyzing YouTube video. Please try again later.");
      return null;
    }
  };

  // Save YouTube URL
  const handleYoutubeUrlSave = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log("---------------------------------------------");
    console.log("🔴 YOUTUBE SAVE BUTTON PRESSED");
    console.log("🔴 Current URL:", youtubeUrl || "NONE");
    console.log("---------------------------------------------");
    
    // Validate YouTube URL
    if (!youtubeUrl || !youtubeUrl.trim()) {
      console.log("🔴 Empty YouTube URL, showing error");
      alert("Please enter a YouTube URL");
      return;
    }
    
    const trimmedUrl = youtubeUrl.trim();
    const isValidUrl = trimmedUrl.includes('youtube.com/watch') || 
                      trimmedUrl.includes('youtu.be/') || 
                      trimmedUrl.includes('youtube.com/embed/');
    
    if (!isValidUrl) {
      console.log("🔴 Invalid YouTube URL format:", trimmedUrl);
      alert("Please enter a valid YouTube URL (youtube.com/watch or youtu.be)");
      return;
    }
    
    // CRITICAL FIX: URL is valid, set it and close the modal immediately
    console.log("🔴 Valid YouTube URL saved:", trimmedUrl);
    
    // Clear any website URL
    if (websiteUrl) {
      setWebsiteUrl('');
    }
    
    // Save URL and activate YouTube mode
    setYoutubeUrl(trimmedUrl);
    setIsYoutubeMode(true);
    
    // Close modal immediately 
    setShowYoutubeInput(false);
    
    // Show success message
    alert("YouTube URL saved! Now type your question about the video and click Send.");
    
    // DON'T call the webhook yet - we'll wait for the user to enter their query and hit Send
  };
  
  // Handle YouTube button click
  const toggleYoutubeInput = () => {
    console.log("[SERVER] ===== YOUTUBE BUTTON CLICKED =====");
    console.log(`[SERVER] Current YouTube mode: ${isYoutubeMode ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`[SERVER] Current YouTube URL: '${youtubeUrl || ''}'`);
    console.log(`[SERVER] Show YouTube input: ${showYoutubeInput ? 'SHOWING' : 'HIDDEN'}`);
    
    // Toggle YouTube input visibility
    if (showYoutubeInput) {
      console.log("[SERVER] HIDING YouTube input modal");
      setShowYoutubeInput(false);
      return;
    }
    
    // Close website input if open and clear its value
    if (showWebsiteInput) {
      console.log("[SERVER] Closing website input and clearing website URL");
      setShowWebsiteInput(false);
      setWebsiteUrl('');
    }
    
    // Show YouTube input
    console.log("[SERVER] SHOWING YouTube input modal");
    setShowYoutubeInput(true);
    
    // If there's already a YouTube URL, make sure mode is active
    // But don't call webhook yet - that happens on form submit
    if (youtubeUrl) {
      console.log(`[SERVER] Existing YouTube URL found: '${youtubeUrl}'`);
      console.log("[SERVER] Ensuring YouTube mode is active");
      
      if (!isYoutubeMode) {
        console.log("[SERVER] Activating YouTube mode");
        setIsYoutubeMode(true);
      }
    }
  };
  
  // Clear YouTube URL
  const clearYoutubeUrl = () => {
    console.log("[SERVER] ===== CLEARING YOUTUBE URL =====");
    console.log("[SERVER] Removing YouTube URL from state and session storage");
    setYoutubeUrl('');
    sessionStorage.removeItem('lastYoutubeUrl');
    console.log("[SERVER] Deactivating YouTube mode");
    setIsYoutubeMode(false);
    console.log("[SERVER] YouTube mode deactivated");
  };
  
  // Handle website button click
  const toggleWebsiteInput = () => {
    console.log("---------------------------------------------");
    console.log("🔵 WEBSITE INPUT TOGGLED");
    console.log("🔵 Current state:", showWebsiteInput ? "SHOWING" : "HIDDEN");
    console.log("---------------------------------------------");
    
    // If website input is already showing, just hide it
    if (showWebsiteInput) {
      console.log("🔵 Hiding website input field");
      setShowWebsiteInput(false);
      return;
    }
    
    // Close YouTube input if open and clear its value
    if (showYoutubeInput) {
      console.log("🔵 Closing YouTube input and clearing YouTube URL");
      setShowYoutubeInput(false);
      setYoutubeUrl('');
      setIsYoutubeMode(false);
    }
    
    // Show website input
    console.log("🔵 Showing website input field");
    setShowWebsiteInput(true);
  };
  
  // Save website URL
  const handleWebsiteUrlSave = (e: FormEvent) => {
    e.preventDefault();
    
    console.log("---------------------------------------------");
    console.log("🔵 WEBSITE SAVE BUTTON PRESSED");
    console.log("🔵 Current URL:", websiteUrl || "NONE");
    console.log("---------------------------------------------");
    
    // Validate website URL
    if (!websiteUrl || !websiteUrl.trim()) {
      console.log("🔵 Empty website URL, showing error");
      alert("Please enter a website URL");
      return;
    }
    
    const trimmedUrl = websiteUrl.trim();
    
    // Basic URL validation
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      console.log("🔵 Invalid website URL format:", trimmedUrl);
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    // URL is valid, clear any YouTube URL if present
    if (youtubeUrl) {
      console.log("🔵 Clearing YouTube URL since website URL is being used");
      setYoutubeUrl('');
      setIsYoutubeMode(false);
    }
    
    // Save the URL and close the modal
    console.log("🔵 Valid website URL saved:", trimmedUrl);
    setWebsiteUrl(trimmedUrl);
    setShowWebsiteInput(false);
  };
  
  // Clear website URL
  const clearWebsiteUrl = () => {
    console.log("---------------------------------------------");
    console.log("🔵 CLEARING WEBSITE URL");
    console.log("🔵 Current URL being cleared:", websiteUrl);
    console.log("---------------------------------------------");
    setWebsiteUrl('');
  };

  // Modify the handleSubmit function to call the webhook when a message with YouTube URL is sent
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!input.trim()) {
      console.log("🔴 Submit canceled: No input text provided");
      return;
    }
    
    if (isLoading) {
      console.log("🔴 Submit canceled: Already processing a request");
      return;
    }
    
    // Check if both URL inputs are present
    if (youtubeUrl && websiteUrl) {
      console.log("🔴 Submit canceled: Both YouTube and website URLs present");
      alert("Please use either YouTube URL or website URL, not both at the same time");
      return;
    }
    
    console.log("---------------------------------------------");
    console.log("🔴 SUBMITTING MESSAGE");
    console.log("🔴 YouTube Mode:", isYoutubeMode ? "ACTIVE" : "INACTIVE");
    console.log("🔴 YouTube URL:", youtubeUrl || "NONE");
    console.log("🔴 Website URL:", websiteUrl || "NONE");
    console.log("🔴 Input Text:", input);
    console.log("---------------------------------------------");
    
    // Create message content for display in the chat
    let messageContent = input.trim();
    
    // Add URL to the message content for display purposes only
    if (youtubeUrl) {
      messageContent += `\n\nYouTube URL: ${youtubeUrl}`;
      console.log("🔴 Including YouTube URL in displayed message");
    } else if (websiteUrl) {
      messageContent += `\n\nWebsite URL: ${websiteUrl}`;
      console.log("🔵 Including Website URL in displayed message");
    }
    
    // Add the user message to the chat
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Handle different modes with completely separate logic paths
      if (youtubeUrl) {
        console.log("🔴 USING YOUTUBE WEBHOOK EXCLUSIVELY");
        
        // Make sure YouTube mode is active
        if (!isYoutubeMode) {
          setIsYoutubeMode(true);
        }
        
        // Call the YouTube webhook and get the response directly
        const youtubeResponse = await callYoutubeWebhook(youtubeUrl);
        
        if (youtubeResponse && youtubeResponse.response) {
          // Use the YouTube webhook response directly
          console.log("🔴 USING YOUTUBE RESPONSE DIRECTLY");
          
          // Add the assistant's response to the chat
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: youtubeResponse.response }
          ]);
          
          // Clear input field but keep the YouTube URL
          setInput('');
          
          // Highlight the clear button
          setTimeout(() => {
            setHighlightClearBtn(true);
          }, 1000);
        } else {
          // Handle error
          console.error("🔴 No valid response from YouTube webhook");
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: 'Sorry, there was an error analyzing the YouTube video.' }
          ]);
        }
      } else if (websiteUrl) {
        console.log("🔵 USING WEBSITE WEBHOOK EXCLUSIVELY");
        
        // Call the website webhook and get the response directly
        const websiteResponse = await callWebsiteWebhook(websiteUrl);
        
        if (websiteResponse && websiteResponse.response) {
          // Use the website webhook response directly
          console.log("🔵 USING WEBSITE RESPONSE DIRECTLY");
          
          // Add the assistant's response to the chat
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: websiteResponse.response }
          ]);
          
          // Clear input field but keep the website URL
          setInput('');
          
          // Highlight the clear button
          setTimeout(() => {
            setHighlightClearBtn(true);
          }, 1000);
        } else {
          // Handle error
          console.error("🔵 No valid response from website webhook");
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: 'Sorry, there was an error analyzing the website.' }
          ]);
        }
      } else {
        console.log("🔴 USING REGULAR WEBHOOK EXCLUSIVELY");
        
        // Call regular webhook
        await callRegularWebhook(messageContent);
        
        // Clear input
        setInput('');
        
        // Get API response for chat display
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...messages, userMessage],
            metadata: {
              youtubeUrl: youtubeUrl,
              websiteUrl: websiteUrl
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        // Format and display the response
        const responseText = await response.text();
        const formattedResponse = formatApiResponse(responseText);
        
        setMessages(prev => [...prev, { role: 'assistant', content: formattedResponse }]);
        
        // Highlight the clear button
        setTimeout(() => {
          setHighlightClearBtn(true);
        }, 1000);
      }
    } catch (error) {
      console.error("🔴 Error sending message:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat-messages');
    setHighlightClearBtn(false); // Stop highlighting after clearing
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    const scrollContainer = document.querySelector('.scroll-area-viewport');
    if (scrollContainer) {
      // Use a small timeout to ensure DOM updates are complete before scrolling
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setIsAtBottom(true);
      }, 100);
    }
  };

  // Call the regular webhook for non-YouTube messages
  const callRegularWebhook = async (message: string) => {
    if (!message) {
      console.log("🔴 Regular webhook NOT called: No message provided");
      return;
    }
    
    console.log(`📝 CALLING REGULAR WEBHOOK with message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    console.log(`📝 YouTube Mode: ${isYoutubeMode ? 'ACTIVE' : 'INACTIVE'}`);
    
    try {
      // Prepare the payload for the webhook
      const payload = {
        user_input: message
      };
      
      console.log('📝 Regular webhook payload:', JSON.stringify(payload, null, 2));
      
      // Send the POST request to the regular webhook URL
      const response = await fetch('https://api-lr.agent.ai/v1/agent/k5liv1l80kqmz028/webhook/e6cee581', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error(`🔴 Regular webhook failed with status: ${response.status}`);
        throw new Error(`Regular webhook API responded with status: ${response.status}`);
      }
      
      console.log('✅ Regular webhook successfully called');
      
    } catch (error) {
      console.error('🔴 Regular webhook error:', error);
    }
  };
  
  // Call the website webhook - handles website URL analysis
  const callWebsiteWebhook = async (url: string) => {
    // DEBUG EVERYTHING
    console.log("---------------------------------------------");
    console.log("🔵 WEBSITE WEBHOOK CALLED");
    console.log("🔵 Input text:", input);
    console.log("🔵 Website URL:", url);
    console.log("---------------------------------------------");
    
    // Validate inputs
    if (!url) {
      console.log("🔵 ERROR: Missing website URL - cannot proceed");
      alert("Error: Website URL is missing. Please add a website URL first.");
      return null;
    }
    
    if (!input) {
      console.log("🔵 ERROR: No query text provided");
      alert("Please enter a question about the website.");
      return null;
    }
    
    try {
      // Build a payload with exactly what the webhook expects
      const payload = {
        user_web_url: url,      // The website URL
        user_querry: input,    // The user's query about the website
        user_memory: ""        // No memory needed for initial implementation
      };
      
      console.log("🔵 Website URL:", payload.user_web_url);
      console.log("🔵 Query:", payload.user_querry);
      console.log("🔵 RAW PAYLOAD:", JSON.stringify(payload, null, 2));
      
      // Send the POST request to the website webhook
      const response = await fetch('https://api-lr.agent.ai/v1/agent/5hobyze3r505nzf6/webhook/7f30add9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await response.text();
      console.log("🔵 WEBHOOK RESPONSE:", responseText);
      
      if (!response.ok) {
        console.error("🔵 WEBHOOK FAILED WITH STATUS:", response.status);
        alert("Website analysis failed. Please try again.");
        return null;
      }
      
      console.log("🔵 WEBHOOK CALL SUCCESSFUL");
      
      // Parse the response JSON and return it
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log("🔵 PARSED RESPONSE:", parsedResponse);
        
        // Return the parsed response so we can use it directly
        return parsedResponse;
      } catch (parseError) {
        console.error("🔵 ERROR PARSING RESPONSE:", parseError);
        return null;
      }
      
    } catch (error) {
      console.error("🔵 ERROR CALLING WEBHOOK:", error);
      alert("Error analyzing website. Please try again later.");
      return null;
    }
  };

  return (
    <>
      <style jsx global>{`
        ${markdownStyles}
        ${cyberpunkButtonStyles}
        
        /* Terminal font - applied globally */
        @font-face {
          font-family: 'SFMono';
          src: local('SF Mono'), local('SFMono-Regular');
          font-weight: normal;
          font-style: normal;
        }
        
        :root {
          font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
          font-size: 14px;
        }
        
        body, html, #__next, div, p, span, h1, h2, h3, h4, h5, h6, 
        button, a, input, textarea, pre, code, li, ul, ol {
          font-family: 'SFMono', Menlo, Monaco, 'Courier New', monospace !important;
        }
        
        /* Override default Tailwind styles that might interfere with markdown */
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: rgb(240, 240, 240) !important;
          margin-top: 1.2rem !important;
          margin-bottom: 0.6rem !important;
        }
        
        .prose p {
          margin-bottom: 0.8rem !important;
        }
        
        /* Remove typing animation styles since it's no longer used */
        
        /* Make sure markdown syntax is properly rendered */
        .ReactMarkdown {
          width: 100%;
        }
        
        /* Make sure code blocks maintain formatting */
        .markdown-wrapper pre {
          margin: 1rem 0 !important;
          border-radius: 6px !important;
          background-color: rgb(30, 30, 30) !important;
          white-space: pre-wrap !important;
          overflow-x: auto !important;
        }
        
        /* Input container fixed positioning */
        .fixed-input-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: black;
          z-index: 50;
          border-top: 1px solid rgba(60, 255, 100, 0.3);
          padding: 0.8rem;
          width: 100%;
        }

        /* Adjust scroll area to account for fixed input */
        .chat-scroll-area {
          height: 100%;
          min-height: calc(100vh - 120px);
          padding-bottom: 120px;
          width: 100%;
          overflow-y: auto !important;
        }
        
        /* Ensure the ScrollArea viewport takes full height */
        .scroll-area-viewport {
          height: 100% !important;
          max-height: none !important;
          overflow-y: auto !important;
        }
        
        /* Center content vertically from top */
        .centered-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 0;
          min-height: calc(100vh - 180px);
          width: 100%;
        }
        
        /* When there are messages, adjust padding */
        .has-messages .centered-content {
          padding-top: 0;
        }
        
        /* Empty state centering - make less centered, more like a chatbot */
        .empty-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: auto;
          padding-top: 2rem;
          margin-top: 1rem;
        }
        
        /* Ensure proper vertical padding for top centering */
        .space-y-5 {
          padding-top: 0;
          margin: 0 1rem;
        }
        
        /* Fixed width for grid suggestions */
        .suggestion-grid {
          max-width: 30rem;
          margin: 0 auto;
        }

        /* Explicitly ensure cursor is visible for all inputs */
        input[type="text"],
        input:not([type]),
        textarea {
          caret-color: #3CFF64 !important; /* Bright green cursor */
          cursor: text !important;
          color: white !important;
          text-shadow: 0 0 0 transparent !important;
        }
        
        /* Messages container spacing adjustments for better chat-like appearance */
        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          padding: 3rem 0.75rem 0.75rem;
        }
        
        /* Ensure bot message has the right appearance */
        .bot-message .prose p,
        .bot-message .prose li {
          color: #e0e0e0 !important;
        }
        
        /* Ensure user message has the right appearance */
        .user-message .text-green-500 {
          color: #3CFF64 !important;
        }

        /* Make message containers look more like a chatbot */
        .max-w-[85%] {
          max-width: 80%;
        }
        
        /* Align user messages right and bot messages left */
        .user-message {
          margin-left: auto;
        }
        
        .bot-message {
          margin-right: auto;
        }
        
        /* Remove max width constraint to fill more of the screen */
        .form-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }

        /* Make back button look more like part of a chatbot header */
        .back-button {
          position: fixed;
          top: 0.5rem;
          left: 0.5rem;
          z-index: 30;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }
        
        /* Messages container - standard chat app styling */
        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          padding-top: 3rem; /* Space for virtual header */
        }

        /* Ensure the cursor is visible on all interactive elements */
        button, a {
          cursor: pointer !important;
        }

        /* User avatar styles */
        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(60, 255, 100, 0.5);
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.3);
        }
        
        /* Default user circle styles when no avatar */
        .default-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(60, 255, 100, 0.1);
          border: 1px dashed rgba(60, 255, 100, 0.5);
        }
        
        /* Avatar shimmer loading effect */
        .avatar-loading {
          position: relative;
          overflow: hidden;
        }
        
        .avatar-loading::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(60, 255, 100, 0) 0,
            rgba(60, 255, 100, 0.1) 20%,
            rgba(60, 255, 100, 0.2) 60%,
            rgba(60, 255, 100, 0)
          );
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Rotating border animation for the Clear button */
        @keyframes rotateBorder {
          0% {
            border-style: dashed;
            border-color: rgba(60, 255, 100, 0.3);
            box-shadow: 0 0 3px rgba(60, 255, 100, 0.2);
          }
          50% {
            border-style: dashed;
            border-color: rgba(60, 255, 100, 0.8);
            box-shadow: 0 0 15px rgba(60, 255, 100, 0.6);
          }
          100% {
            border-style: dashed;
            border-color: rgba(60, 255, 100, 0.3);
            box-shadow: 0 0 3px rgba(60, 255, 100, 0.2);
          }
        }
        
        /* Pulsating glow animation for Clear button */
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 5px rgba(60, 255, 100, 0.2);
          }
          50% {
            box-shadow: 0 0 15px rgba(60, 255, 100, 0.6), 0 0 20px rgba(60, 255, 100, 0.3);
          }
          100% {
            box-shadow: 0 0 5px rgba(60, 255, 100, 0.2);
          }
        }
        
        .clear-btn-highlight {
          animation: pulseGlow 3s ease-in-out infinite, rotateBorder 8s linear infinite;
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
        }
        
        .clear-btn-highlight::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(60, 255, 100, 0.1) 25%, 
            rgba(60, 255, 100, 0.3) 50%,
            rgba(60, 255, 100, 0.1) 75%,
            transparent 100%
          );
          animation: rotate 4s linear infinite;
          z-index: -1;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Make scroll bar visible on all browsers */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(60, 255, 100, 0.3);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(60, 255, 100, 0.5);
        }
        
        /* Style the Radix scrollbar */
        [data-radix-scroll-area-scrollbar] {
          width: 10px !important;
          padding: 0 !important;
          background-color: rgba(0, 0, 0, 0.2) !important;
        }
        
        [data-radix-scroll-area-thumb] {
          background-color: rgba(60, 255, 100, 0.3) !important;
          border-radius: 10px !important;
        }
        
        [data-radix-scroll-area-thumb]:hover {
          background-color: rgba(60, 255, 100, 0.5) !important;
        }
      `}</style>
      <div className="flex flex-col h-screen bg-black text-gray-300">
        <div className="absolute top-4 left-4 z-20 back-button">
          <Link href="/what-you-want-to-know">
            <motion.div
              className="flex items-center p-2 border border-dashed border-[#00FF00] bg-black/60 backdrop-blur-sm rounded-md"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(60, 255, 100, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00FF00]">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="ml-1 text-xs text-[#00FF00]">Back</span>
            </motion.div>
          </Link>
        </div>

        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div 
              className="absolute top-4 right-4 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                variants={glitchAnimation}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                className="mt-1 mr-1 p-1"
              >
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  title={highlightClearBtn ? "Clear this conversation" : "Clear chat"}
                  aria-label="Clear conversation"
                  className={`h-8 px-3 py-2 text-white group transition-all duration-200 bg-black/40 backdrop-blur-sm border border-dashed border-[#00FF00] shadow-md relative overflow-hidden cyber-btn ${highlightClearBtn ? 'clear-btn-highlight' : ''}`}
                >
                  <div className="matrix-drop"></div>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium">{highlightClearBtn ? "Clear Chat" : "Clear"}</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative" style={{ height: 'calc(100vh - 120px)' }}>
          <ScrollArea 
            className={`h-full chat-scroll-area ${messages.length > 0 ? 'has-messages' : ''}`} 
            onScroll={handleScroll}
          >
            <div className="centered-content">
              <div className="messages-container">
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-center empty-state-container"
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-black border border-dashed border-[#00FF00] relative overflow-hidden"
                      variants={pulseGlow}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="cyberpunk-scanline cyberpunk-scanline-active"></div>
                      <Sparkles className="h-7 w-7 text-[#00FF00]" />
                    </motion.div>
                    
                    <motion.h2 
                      className="text-lg font-semibold mb-2 text-white relative inline-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      CyberVerse AI Assistant
                      <motion.div 
                        className="absolute -bottom-1 left-0 h-[2px] bg-[#00FF00]/40"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      />
                    </motion.h2>
                    
                    <motion.p 
                      className="text-white text-xs max-w-md mx-auto mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      Your guide to the digital realm. Ask me anything about cybersecurity, hacking, defense, or technical concepts.
                    </motion.p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 suggestion-grid text-xs">
                      {[
                        "What is the OWASP Top 10?",
                        "Explain zero-day vulnerabilities",
                        "How does a VPN work?",
                        "What is ethical hacking?"
                      ].map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.2, 
                            delay: 0.7 + (i * 0.05),
                            type: "spring",
                            stiffness: 400
                          }}
                          onClick={() => {
                            setInput(suggestion);
                            setTimeout(() => {
                              const form = document.querySelector('form');
                              if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                            }, 100);
                          }}
                          className="p-2 border border-dashed border-[#00FF00] rounded-lg text-left bg-black/40 text-white shadow-lg relative overflow-hidden cyberpunk-glitch cyber-btn text-xs"
                          whileHover={{ 
                            scale: 1.02,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 10
                            }
                          }}
                          whileTap={{ 
                            scale: 0.98,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 10
                            }
                          }}
                        >
                          <div className="matrix-drop"></div>
                          <div className="relative z-10">
                            {suggestion}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 150 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div 
                      className={`max-w-[85%] relative ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
                      whileHover={{ 
                        scale: 1.01,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }
                      }}
                    >
                      <div className="cyberpunk-scanline"></div>
                      <Card 
                        className="border border-dashed border-[#00FF00] bg-black/40 shadow-sm transition-all duration-200 relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 opacity-0 pointer-events-none"
                          animate={{ opacity: 0 }}
                          whileHover={{ opacity: 0.05, transition: { duration: 0.2 } }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF00]/10 to-transparent" style={{ backgroundSize: '200% 100%' }}></div>
                        </motion.div>
                        <CardHeader className="py-2 px-3 flex flex-row items-center gap-2 border-b border-dashed border-[#00FF00] relative">
                          <motion.div
                            whileHover={{
                              scale: 1.1,
                              transition: { type: "spring", stiffness: 500, damping: 10 }
                            }}
                          >
                            {message.role === 'user' ? (
                              isLoadingProfile ? (
                                <div className="default-avatar avatar-loading">
                                  <UserCircle className="h-4 w-4 text-green-500 opacity-50" />
                                </div>
                              ) : userProfile && userProfile.avatar ? (
                                <div className="user-avatar">
                                  <Image 
                                    src={userProfile.avatar} 
                                    alt={userProfile.name || 'User'} 
                                    width={24} 
                                    height={24}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="default-avatar">
                                  <UserCircle className="h-4 w-4 text-green-500" />
                                </div>
                              )
                            ) : (
                              <BotIcon className="h-4 w-4 text-white" />
                            )}
                          </motion.div>
                          <CardTitle className={`text-xs ${message.role === 'user' ? 'text-green-500' : 'text-white'}`}>
                            {message.role === 'user' ? 
                              (isLoadingProfile 
                                ? 'You' 
                                : (userProfile && userProfile.name 
                                   ? userProfile.name 
                                   : 'You')
                              ) 
                              : 'Assistant'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 px-3 prose prose-invert prose-sm max-w-none">
                          {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap text-xs text-green-500">
                              {message.content}
                            </div>
                          ) : (
                            <div className="markdown-wrapper">
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdownWithNoSSR
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <motion.div whileHover={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", transition: { duration: 0.2 } }}>
                                          <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        </motion.div>
                                      ) : (
                                        <code className="px-1 py-0.5 bg-black/40 rounded text-sm" {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    // Focus on the essential elements only to reduce complexity
                                    h1: ({ children, ...props }: any) => <h1 className="text-xl font-bold my-4 text-white" {...props}>{children}</h1>,
                                    h2: ({ children, ...props }: any) => <h2 className="text-lg font-bold my-3 text-white border-b border-gray-700 pb-1" {...props}>{children}</h2>,
                                    h3: ({ children, ...props }: any) => <h3 className="text-md font-bold my-2 text-white" {...props}>{children}</h3>,
                                    p: ({ children, ...props }: any) => <p className="my-3 text-gray-300" {...props}>{children}</p>,
                                    ul: ({ children, ...props }: any) => <ul className="list-disc pl-5 my-3" {...props}>{children}</ul>,
                                    ol: ({ children, ...props }: any) => <ol className="list-decimal pl-5 my-3" {...props}>{children}</ol>,
                                    li: ({ children, ...props }: any) => <li className="mb-1" {...props}>{children}</li>,
                                    a: ({ children, ...props }: any) => <a className="text-green-500 hover:underline" {...props}>{children}</a>,
                                    strong: ({ children, ...props }: any) => <strong className="font-bold text-white" {...props}>{children}</strong>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdownWithNoSSR>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%]">
                      <Card className="border border-dashed border-[#00FF00] bg-black/40 shadow-sm">
                        <CardHeader className="py-2 px-3 flex flex-row items-center gap-2 border-b border-dashed border-[#00FF00]">
                          <BotIcon className="h-4 w-4 text-white" />
                          <CardTitle className="text-xs text-white">Assistant</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 px-3">
                          <div className="flex space-x-2">
                            <motion.div 
                              animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.1, 0.9], boxShadow: ["0 0 0px rgba(60, 255, 100, 0)", "0 0 6px rgba(60, 255, 100, 0.5)", "0 0 0px rgba(60, 255, 100, 0)"] }} 
                              transition={{ duration: 1, repeat: Infinity }}
                              className="h-2 w-2 bg-[#00FF00]/70 rounded-full"
                            ></motion.div>
                            <motion.div 
                              animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.1, 0.9], boxShadow: ["0 0 0px rgba(60, 255, 100, 0)", "0 0 6px rgba(60, 255, 100, 0.5)", "0 0 0px rgba(60, 255, 100, 0)"] }} 
                              transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
                              className="h-2 w-2 bg-[#00FF00]/70 rounded-full"
                            ></motion.div>
                            <motion.div 
                              animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.1, 0.9], boxShadow: ["0 0 0px rgba(60, 255, 100, 0)", "0 0 6px rgba(60, 255, 100, 0.5)", "0 0 0px rgba(60, 255, 100, 0)"] }} 
                              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                              className="h-2 w-2 bg-[#00FF00]/70 rounded-full"
                            ></motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </ScrollArea>

          {!isAtBottom && messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-20 right-4 bg-black/40 border border-dashed border-[#00FF00] rounded-full p-1.5 text-white shadow-xl backdrop-blur-sm cyber-btn relative overflow-hidden z-40"
              onClick={scrollToBottom}
              whileHover={{ scale: 1.12, transition: { type: "spring", stiffness: 500, damping: 8 } }}
              whileTap={{ scale: 0.9, transition: { type: "spring", stiffness: 500, damping: 10 } }}
            >
              <div className="matrix-drop"></div>
              <ChevronsDown className="h-4 w-4 relative z-10" />
            </motion.button>
          )}
        </div>

        <div className="fixed-input-container">
          <form onSubmit={handleSubmit} className="form-container flex gap-2">
            <div className="flex items-center gap-2 w-full">
              {/* User avatar in input area */}
              <div className="flex-shrink-0">
                {isLoadingProfile ? (
                  <div className="default-avatar avatar-loading w-8 h-8">
                    <UserCircle className="h-4 w-4 text-green-500 opacity-50" />
                  </div>
                ) : userProfile && userProfile.avatar ? (
                  <div className="user-avatar w-8 h-8">
                    <Image 
                      src={userProfile.avatar} 
                      alt={userProfile.name || 'User'} 
                      width={32} 
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="default-avatar w-8 h-8">
                    <UserCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <motion.div whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 500, damping: 20 } }}>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${isLoadingProfile ? 'CyberVerse AI' : userProfile?.name ? 'as ' + userProfile.name : 'CyberVerse AI'}...`}
                    className="bg-black border-dashed border-[#00FF00] text-white focus:border-[#00FF00] focus:ring-[#00FF00]/10 pl-3 pr-8 py-5 rounded-md transition-all duration-200 cyberpunk-input text-xs cursor-text caret-[#3CFF64]"
                    disabled={isLoading}
                    style={{ caretColor: '#3CFF64' }}
                  />
                </motion.div>
                {input && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <motion.div 
                      className="h-1.5 w-1.5 bg-[#00FF00]/60 rounded-full"
                      animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0px rgba(60, 255, 100, 0.2)", "0 0 8px rgba(60, 255, 100, 0.8)", "0 0 0px rgba(60, 255, 100, 0.2)"] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    ></motion.div>
                  </motion.div>
                )}
              </div>
              
              {/* URL Input buttons */}
              <div className="flex items-center">
                <div className="flex space-x-2">
                  {/* YouTube button */}
                  <motion.button
                    type="button"
                    onClick={toggleYoutubeInput}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative rounded-md p-2 ${youtubeUrl ? 'bg-red-500/20' : 'bg-black/40'} border border-dashed ${youtubeUrl ? 'border-red-500' : 'border-[#00FF00]'} transition-colors duration-300`}
                    title={youtubeUrl ? "YouTube URL added - Click to edit" : "Add YouTube URL"}
                    disabled={isLoading}
                  >
                    {youtubeUrl && (
                      <motion.div 
                        className="absolute inset-0 bg-red-500/10 rounded-md"
                        animate={{ boxShadow: ['0 0 5px rgba(255, 0, 0, 0.3)', '0 0 10px rgba(255, 0, 0, 0.6)', '0 0 5px rgba(255, 0, 0, 0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <svg className={`w-4 h-4 ${youtubeUrl ? 'text-red-500' : websiteUrl ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </motion.button>

                  {/* Website button */}
                  <motion.button
                    type="button"
                    onClick={toggleWebsiteInput}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative rounded-md p-2 ${websiteUrl ? 'bg-blue-500/20' : 'bg-black/40'} border border-dashed ${websiteUrl ? 'border-blue-500' : 'border-[#00FF00]'} transition-colors duration-300`}
                    title={websiteUrl ? "Website URL added - Click to edit" : "Add website URL"}
                    disabled={isLoading}
                  >
                    {websiteUrl && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-500/10 rounded-md"
                        animate={{ boxShadow: ['0 0 5px rgba(0, 100, 255, 0.3)', '0 0 10px rgba(0, 100, 255, 0.6)', '0 0 5px rgba(0, 100, 255, 0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <svg className={`w-4 h-4 ${websiteUrl ? 'text-blue-500' : youtubeUrl ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
            <motion.div
              variants={sendButtonAnimation}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              animate={!isLoading && input.trim() ? "active" : "initial"}
              className="relative"
            >
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-black/40 border border-dashed border-[#00FF00] text-white h-10 px-3 rounded-md transition-all duration-200 relative overflow-hidden cyber-btn-send text-xs"
              >
                <div className="cyber-glow-border"></div>
                {isLoading ? (
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="relative z-10 text-xs">
                    Processing...
                  </motion.span>
                ) : (
                  <motion.div 
                    className="relative z-10 flex items-center justify-center cyber-icon"
                    animate={{ x: input.trim() ? [0, 2, 0] : 0, transition: { duration: 0.6, repeat: input.trim() ? Infinity : 0, repeatType: "reverse", ease: "easeInOut" } }}
                  >
                    <SendHorizontal className="h-4 w-4 text-green-500" />
                  </motion.div>
                )}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF00]/10 to-transparent" 
                  style={{ backgroundSize: '200% 100%', opacity: 0 }}
                  animate={{ opacity: input.trim() ? [0, 0.1, 0] : 0, backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 1.5, repeat: input.trim() ? Infinity : 0, ease: "easeInOut" }}
                />
              </Button>
            </motion.div>
          </form>
          <div className="text-[10px] text-center mt-1">
            {(youtubeUrl || websiteUrl) ? (
              <div className="space-y-1">
                <div className={`${youtubeUrl && websiteUrl ? 'text-yellow-400' : youtubeUrl ? 'text-red-400' : 'text-blue-400'}`}>
                  {youtubeUrl && websiteUrl ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Note: Only one URL will be processed with your message.
                    </motion.div>
                  ) : youtubeUrl ? (
                    <span>YouTube video added to query</span>
                  ) : (
                    <span>Website URL added to query</span>
                  )}
                </div>
                <div className="text-[#00FF00]">
                  CyberVerse AI may display inaccurate information.
                </div>
              </div>
            ) : (
              <div className="text-[#00FF00]">
                CyberVerse AI may display inaccurate information.
              </div>
            )}
          </div>
        </div>

        {/* YouTube URL Input Modal */}
        {showYoutubeInput && (
          <ClientPortal>
            <div className="fixed inset-0 flex items-center justify-center z-[100]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowYoutubeInput(false)}></div>
              <AnimatePresence>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-black/90 border border-dashed border-red-500 rounded-lg p-4 w-full max-w-md z-[101] relative mx-4"
                >
                  <form onSubmit={handleYoutubeUrlSave} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white text-sm font-bold flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Add YouTube Video
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setShowYoutubeInput(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    
                    {websiteUrl && (
                      <div className="bg-yellow-500/20 border border-dashed border-yellow-500 rounded px-3 py-2 text-yellow-200 text-xs mb-2">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                          <span>You already have a website URL. Adding a YouTube URL will replace it. Only one can be used at a time.</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <Input
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Paste YouTube URL here..."
                        className="bg-black border-dashed border-red-500 text-white focus:border-red-500 focus:ring-red-500/10 pl-3 pr-8 py-5 rounded-md transition-all duration-200 text-xs"
                        autoFocus
                      />
                      {youtubeUrl && (
                        <button 
                          type="button" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={clearYoutubeUrl}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-red-500/20 hover:bg-red-500/30 border border-dashed border-red-500 text-white py-2 px-4 rounded-md text-xs flex-1"
                      >
                        Save
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setShowYoutubeInput(false)}
                        className="bg-black/40 border border-dashed border-gray-500 text-white py-2 px-4 rounded-md text-xs flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </ClientPortal>
        )}

        {/* Website URL Input Modal */}
        {showWebsiteInput && (
          <ClientPortal>
            <div className="fixed inset-0 flex items-center justify-center z-[100]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowWebsiteInput(false)}></div>
              <AnimatePresence>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-black/90 border border-dashed border-blue-500 rounded-lg p-4 w-full max-w-md z-[101] relative mx-4"
                >
                  <form onSubmit={handleWebsiteUrlSave} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white text-sm font-bold flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                        </svg>
                        Add Website URL
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setShowWebsiteInput(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    
                    {youtubeUrl && (
                      <div className="bg-yellow-500/20 border border-dashed border-yellow-500 rounded px-3 py-2 text-yellow-200 text-xs mb-2">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                          <span>You already have a YouTube URL. Adding a website URL will replace it. Only one can be used at a time.</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="Paste website URL here (https://...)..."
                        className="bg-black border-dashed border-blue-500 text-white focus:border-blue-500 focus:ring-blue-500/10 pl-3 pr-8 py-5 rounded-md transition-all duration-200 text-xs"
                        autoFocus
                      />
                      {websiteUrl && (
                        <button 
                          type="button" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={clearWebsiteUrl}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-dashed border-blue-500 text-white py-2 px-4 rounded-md text-xs flex-1"
                      >
                        Save
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setShowWebsiteInput(false)}
                        className="bg-black/40 border border-dashed border-gray-500 text-white py-2 px-4 rounded-md text-xs flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </ClientPortal>
        )}
      </div>
    </>
  );
}
