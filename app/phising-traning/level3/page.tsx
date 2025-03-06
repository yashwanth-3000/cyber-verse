"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../phishing-style.css"; // Import custom phishing CSS

// --- Types ---
interface GameState {
  started: boolean;
  completed: boolean;
  success: boolean;
  scammed: boolean;
  attempts: number;
  timeElapsed: number;
  stage: "initial" | "popup1" | "popup2" | "popup3" | "main" | "end";
  wrongClicks: number;
}

interface SecurityAlert {
  id: string;
  type: "warning" | "critical" | "info" | "success";
  message: string;
  action: string;
  isScam: boolean;
  priority: number;
}

// --- Configurations ---
const TOTAL_TIME = 45; // Increased time for more challenges

const notifications = [
  "🔔 Urgent: Security certificate expired",
  "⚠️ Multiple login attempts detected",
  "🔒 Account access may be restricted",
  "💳 Unusual transaction activity detected",
  "📱 Enable advanced protection now",
  "🚨 Critical: Account vulnerability found",
  "⚡ Immediate action required",
  "🔑 Password may be compromised",
];

const securityAlerts: SecurityAlert[] = [
  {
    id: "alert1",
    type: "critical",
    message: "🚨 CRITICAL: Multiple unauthorized access attempts detected from Beijing, China",
    action: "Lock Account Immediately",
    isScam: true,
    priority: 1,
  },
  {
    id: "alert2",
    type: "warning",
    message: "⚠️ Your account access will be permanently restricted in 60 seconds",
    action: "Verify Identity Now",
    isScam: true,
    priority: 2,
  },
  {
    id: "alert3",
    type: "info",
    message: "💳 Unusual transaction pattern: Multiple international charges detected",
    action: "Review & Block",
    isScam: true,
    priority: 3,
  },
  {
    id: "alert4",
    type: "success",
    message: "✅ Required: Install new security certificate from your bank",
    action: "Install Certificate",
    isScam: true,
    priority: 4,
  },
];

// --- Components ---
const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl border border-purple-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-5">
        <h1 className="text-2xl font-bold text-white">Advanced Phishing Defense</h1>
        <p className="text-purple-200 text-sm mt-1">Challenge Level 3</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="text-purple-300 mb-4 font-medium">
            This is the most sophisticated level of training. You'll face layered deception techniques used by advanced threat actors.
          </div>
          
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="bg-gray-900/70 rounded-md p-3 border border-gray-700">
              <h3 className="font-bold text-purple-400 mb-1.5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Challenge Features
              </h3>
              <ul className="space-y-1 pl-6 list-disc">
                <li>Multiple security popups with varying levels of deception</li>
                <li>Simulated system interfaces that appear legitimate</li>
                <li>Time pressure tactics combined with fear messaging</li>
                <li>Security alerts that mimic legitimate warnings</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/70 rounded-md p-3 border border-gray-700">
              <h3 className="font-bold text-purple-400 mb-1.5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Succeed
              </h3>
              <ul className="space-y-1 pl-6 list-disc">
                <li>Look for subtle inconsistencies in visuals and messaging</li>
                <li>Question any request for immediate action under threat</li>
                <li>Evaluate whether the security action makes logical sense</li>
                <li>Look for safe dismiss options (often small or hidden)</li>
              </ul>
            </div>
            
            <div className="bg-purple-900/30 rounded-md p-3 border border-purple-800">
              <h3 className="font-bold text-purple-300 mb-1.5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Limit
              </h3>
              <p>You have <span className="font-bold text-white">45 seconds</span> to complete this challenge.</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onStart}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-md flex items-center justify-center"
        >
          Begin Advanced Challenge
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const InitialPopup = ({ onAction }: { onAction: (isCorrect: boolean) => void }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/20 p-8 max-w-2xl w-full relative"
    >
      <div className="absolute -top-3 -right-3 z-10">
        <button
          onClick={() => onAction(true)}
          className="text-gray-400 hover:text-gray-200 text-xs bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
          🎉 Exclusive Winner Alert! 🎉
        </h2>
        <p className="text-2xl font-bold text-white mb-2">
          You've Been Selected as Today's Special Visitor!
        </p>
        <p className="text-emerald-400 font-bold text-xl">
          Claim Your $5000 Apple Gift Card Instantly
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400 text-xl">✓</span>
          <p className="text-gray-300">You are visitor #1000000 today</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400 text-xl">✓</span>
          <p className="text-gray-300">Location: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400 text-xl">✓</span>
          <p className="text-gray-300">Device: Verified & Eligible</p>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <p className="text-yellow-400 text-sm">
          ⚠️ Ultra-Exclusive: Only 1 gift card remaining. Claim within 60 seconds!
        </p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-400">Time remaining:</span>
          <span className="text-red-400 font-bold animate-pulse">00:59</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onAction(false)}
          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          CLAIM NOW!
        </button>
        <button
          onClick={() => onAction(false)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
        >
          Verify & Claim
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        *By claiming, you agree to our terms and conditions
      </p>
    </motion.div>
  </div>
);

const SecurityPopup = ({ stage, onAction }: { stage: "popup1" | "popup2" | "popup3", onAction: (isCorrect: boolean) => void }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
    >
      {stage === "popup1" ? (
        <>
          <div className="bg-red-600 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">⚠️ Critical Security Warning</h2>
            <button
              onClick={() => onAction(true)}
              className="text-white bg-red-700 hover:bg-red-800 h-6 w-6 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 text-gray-800">
            <p className="mb-3 font-bold text-red-600">
              Multiple malware infections detected. Your banking credentials may be compromised.
            </p>
            <p className="mb-4">
              Our security scan has detected unusual activity targeting your financial accounts. 
              Immediate action is required to prevent unauthorized transactions.
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => onAction(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all"
              >
                Remove Threats Now
              </button>
              <button
                onClick={() => onAction(false)}
                className="bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 px-4 rounded-lg font-bold hover:from-purple-600 hover:to-violet-600 transition-all"
              >
                Full System Scan
              </button>
            </div>
          </div>
        </>
      ) : stage === "popup2" ? (
        <>
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">🔒 System Security Update</h2>
            <button
              onClick={() => onAction(true)}
              className="text-white bg-blue-700 hover:bg-blue-800 h-6 w-6 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 text-gray-800">
            <p className="mb-3 font-bold text-blue-600">
              Important system security update available
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Security Update KB29384756</span>
              </div>
              <p className="text-sm mb-1">This update addresses critical security vulnerabilities in your system.</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Size: 14.3 MB</span>
                <span>Released: Today</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => onAction(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-colors"
              >
                Install Update Now
              </button>
              <button
                onClick={() => onAction(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-600 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">✅ Account Security Verification</h2>
            <button
              onClick={() => onAction(true)}
              className="text-white bg-green-700 hover:bg-green-800 h-6 w-6 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 text-gray-800">
            <p className="mb-3 font-medium">
              Your account shows unusual activity. Please verify your identity to maintain access.
            </p>
            
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm text-gray-600 mb-1">🔒 Security Status</div>
                <div className="font-medium text-orange-500">Verification Required</div>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm text-gray-600 mb-1">⚠️ Risk Level</div>
                <div className="font-medium text-red-500">High</div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => onAction(false)}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold transition-colors"
              >
                Verify Account Now
              </button>
              <button
                onClick={() => onAction(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
              >
                I'll Do This Later
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  </div>
);

const MainChallenge = ({ onAction }: { onAction: (isCorrect: boolean) => void }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SecurityAlert | null>(null);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);
  const [securityScore, setSecurityScore] = useState(35);
  const [showNotification, setShowNotification] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);
  const [showFakeText, setShowFakeText] = useState(true);

  useEffect(() => {
    const notifInterval = setInterval(() => {
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
    }, 2000);

    const alertInterval = setInterval(() => {
      const randomAlert = securityAlerts[Math.floor(Math.random() * securityAlerts.length)];
      setCurrentAlert(randomAlert);
    }, 3000);

    const popupInterval = setInterval(() => {
      if (Math.random() > 4) {
        setShowUrgentPopup(true);
      }
    }, 5000);

    const scoreInterval = setInterval(() => {
      setSecurityScore((prev) => Math.max(0, prev - 1));
    }, 1000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(notifInterval);
      clearInterval(alertInterval);
      clearInterval(popupInterval);
      clearInterval(scoreInterval);
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout;
    if (isHovering) {
      hoverTimeout = setTimeout(() => {
        setShowFakeText(false);
      }, 2000);
    } else {
      setShowFakeText(true);
    }
    return () => clearTimeout(hoverTimeout);
  }, [isHovering]);

  const handleButtonClick = (isScam: boolean, isReal: boolean = false) => {
    if (isReal) {
      onAction(true);
    } else if (isScam) {
      onAction(false);
    } else {
      // If neither scam nor real, do nothing (let them continue playing)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Top Bar */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-full px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SecureBank Pro™</h1>
                <p className="text-sm text-white font-medium">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleButtonClick(true)}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold border border-red-500/30 hover:bg-red-500/30 animate-pulse"
              >
                ⚠️ Security Warning
              </button>
              <button
                onClick={() => handleButtonClick(false)}
                className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-500/30 hover:bg-yellow-500/30"
              >
                🔔 Notifications ({Math.floor(Math.random() * 10) + 1})
              </button>
              <button
                onClick={() => handleButtonClick(false)}
                className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-bold border border-blue-500/30 hover:bg-blue-500/30"
              >
                👤 Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="col-span-2 space-y-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <div>
                  <p className="font-bold text-white">User123</p>
                  <p className="text-sm text-purple-300 hover:text-purple-200 cursor-pointer">View your profile</p>
                </div>
              </div>
              <h3 className="text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg text-sm font-bold hover:from-purple-600 hover:to-pink-600"
                >
                  🔒 Lock Account
                </button>
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-cyan-600"
                >
                  💳 Cards
                </button>
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg text-sm font-bold hover:from-green-600 hover:to-emerald-600"
                >
                  📱 Mobile Banking
                </button>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-white font-bold mb-3">Navigation</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3 p-2 bg-purple-500/20 rounded cursor-pointer">
                  <span className="text-xl">🏠</span>
                  <span className="font-medium text-white">Home</span>
                </li>
                <li className="flex items-center space-x-3 p-2 hover:bg-purple-500/10 rounded cursor-pointer">
                  <span className="text-xl">👥</span>
                  <span className="font-medium text-white">Friends</span>
                </li>
                <li className="flex items-center space-x-3 p-2 hover:bg-purple-500/10 rounded cursor-pointer">
                  <span className="text-xl">🎬</span>
                  <span className="font-medium text-white">Videos</span>
                </li>
                <li className="flex items-center space-x-3 p-2 hover:bg-purple-500/10 rounded cursor-pointer">
                  <span className="text-xl">🔔</span>
                  <span className="font-medium text-white">Notifications</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20 animate-pulse">
              <h3 className="text-red-400 font-bold mb-2">⚠️ Security Center</h3>
              <p className="text-xs text-red-400 mb-4">Multiple issues detected!</p>
              <button
                onClick={() => handleButtonClick(true)}
                className="w-full bg-red-500 text-white p-2 rounded-lg text-sm font-bold hover:bg-red-600"
              >
                Fix Issues Now
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-7 space-y-4">
            {/* Account Overview */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome back, <span className="text-purple-300">User123</span></h2>
                  <p className="text-sm text-red-400 animate-pulse">⚠️ Last login: Unknown Location</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-3xl font-bold text-white">$284,532.91</p>
                  <p className="text-xs text-red-400 animate-pulse">Pending: -$25,000.00</p>
                </div>
              </div>

              {/* Real and Fake Button Container */}
              <div 
                className="relative mb-6"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Real Button - Now slightly visible */}
                <button
                  onClick={() => handleButtonClick(false, true)}
                  className={`absolute inset-0 ${isHovering && !showFakeText ? 'opacity-100' : 'opacity-5'} bg-blue-500 text-white py-3 rounded-xl font-bold transition-all duration-300 z-20 cursor-pointer flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500`}
                >
                  🔒 Secure Account Access
                </button>
                {/* Fake Button Overlay */}
                <button
                  onClick={() => handleButtonClick(true)}
                  className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 relative z-10 ${!showFakeText ? 'opacity-0' : 'opacity-100'}`}
                >
                  {showFakeText && "🛡️ Enable Advanced Account Protection"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="text-purple-400 font-bold mb-2">Checking</h4>
                  <p className="text-xl text-white font-bold">$42,123.45</p>
                  <button
                    onClick={() => handleButtonClick(false)}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                  >
                    View Details →
                  </button>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="text-blue-400 font-bold mb-2">Savings</h4>
                  <p className="text-xl text-white font-bold">$142,409.46</p>
                  <button
                    onClick={() => handleButtonClick(false)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Details →
                  </button>
                </div>
                <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                  <h4 className="text-pink-400 font-bold mb-2">Investment</h4>
                  <p className="text-xl text-white font-bold">$100,000.00</p>
                  <button
                    onClick={() => handleButtonClick(false)}
                    className="mt-2 text-xs text-pink-400 hover:text-pink-300"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <button
                  onClick={() => handleButtonClick(false)}
                  className="text-purple-400 text-sm hover:text-purple-300"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-500/20 rounded-lg p-2">
                      <span className="text-red-400">⚠️</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Suspicious Transfer</p>
                      <p className="text-sm text-red-400">1 minute ago</p>
                    </div>
                  </div>
                  <span className="text-red-400 font-medium">-$25,000.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500/20 rounded-lg p-2">
                      <span className="text-green-400">💰</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Salary Deposit</p>
                      <p className="text-sm text-gray-400">2 days ago</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-medium">+$8,500.00</span>
                </div>
              </div>
            </div>

            {/* Quick Transfer */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Quick Transfer</h3>
              <div className="grid grid-cols-4 gap-4">
                {['Alice', 'Bob', 'Charlie', 'David'].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleButtonClick(false)}
                    className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl mb-2">
                      {name[0]}
                    </div>
                    <span className="text-white text-sm">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-4">
            {/* Security Score */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-white font-bold mb-4">Security Score</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Account Protection</span>
                    <span className="text-red-400 font-medium animate-pulse">CRITICAL</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${securityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-red-400 mt-2">Multiple vulnerabilities detected</p>
                </div>
              </div>
            </div>

            {/* Security Alerts */}
            {currentAlert && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20"
              >
                <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Security Alert</h3>
                <p className="text-white mb-4">{currentAlert.message}</p>
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
                >
                  {currentAlert.action}
                </button>
              </motion.div>
            )}

            {/* Promotions */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <h3 className="text-white font-bold mb-4">Special Offers</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600"
                >
                  🎁 Claim $500 Bonus
                </button>
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600"
                >
                  💎 Premium Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <button
          onClick={() => handleButtonClick(false)}
          className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:from-red-600 hover:to-pink-600 animate-pulse"
        >
          🔒
        </button>
        <button
          onClick={() => handleButtonClick(false)}
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:from-blue-600 hover:to-cyan-600"
        >
          💬
        </button>
      </div>

      {/* Notification Banner */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg">
          <button
            onClick={() => setShowNotification(false)}
            className="absolute -top-2 -right-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ×
          </button>
          <p className="text-sm font-bold">{notifications[notificationIndex]}</p>
        </div>
      )}

      {/* Urgent Popup */}
      <AnimatePresence>
        {showUrgentPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-red-500/20 p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 rounded-lg p-2">
                    <span className="text-red-400 text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Critical Alert</h3>
                </div>
                <button
                  onClick={() => setShowUrgentPopup(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Suspicious activity detected. Your account will be locked in 60 seconds unless verified.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleButtonClick(false)}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  Verify Now
                </button>
                <button
                  onClick={() => setShowUrgentPopup(false)}
                  className="w-full bg-gray-700 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-600"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EndScreen = ({ gameState, onRestart }: { gameState: GameState; onRestart: () => void }) => {
  const router = useRouter();
  
  // Calculate score based on time and wrong clicks
  const calculateScore = () => {
    if (!gameState.success) return 0;
    
    // Base score of 1500 for level 3 (more difficult)
    const baseScore = 1500;
    // Deduct 50 points per wrong click
    const wrongClickPenalty = gameState.wrongClicks * 50;
    // Deduct 3 points per second taken
    const timePenalty = Math.floor(gameState.timeElapsed * 3);
    
    return Math.max(0, baseScore - wrongClickPenalty - timePenalty);
  };
  
  const finalScore = calculateScore();
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-lg shadow-2xl border border-purple-500/30 max-w-2xl w-full overflow-hidden text-white"
      >
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {gameState.success ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Advanced Phishing Challenge Complete!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Phishing Attempt Succeeded
              </>
            )}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            {gameState.success ? (
              <div className="text-green-400 bg-green-900/30 border border-green-800 rounded-md p-4 mb-5">
                <p className="font-medium">
                  Congratulations! You successfully navigated through sophisticated phishing attempts. 
                  You demonstrated excellent security awareness under pressure.
                </p>
              </div>
            ) : (
              <div className="text-red-400 bg-red-900/30 border border-red-800 rounded-md p-4 mb-5">
                <p className="font-medium">
                  Unfortunately, you fell for a sophisticated phishing attack. 
                  Don't worry - learning from these simulations helps build better security habits.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
                <h3 className="font-bold text-purple-400 mb-2">Your Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-mono">{gameState.timeElapsed}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wrong Clicks:</span>
                    <span className="font-mono">{gameState.wrongClicks}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                    <span className="text-gray-300 font-medium">Final Score:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {finalScore}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
                <h3 className="font-bold text-purple-400 mb-2">Key Lessons</h3>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Security popups from legitimate sources won't use urgent threats</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>System warnings appear differently than browser popups</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Real security alerts offer multiple resolution options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Legitimate warnings contain specific, actionable details</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-md p-4 border border-gray-700 mb-6">
              <h3 className="font-bold text-purple-400 mb-3">Advanced Security Tips</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-white">1. Verify Visual Elements</h4>
                  <p className="text-gray-400">Sophisticated phishing attempts often contain small visual inconsistencies in logos, colors, or layouts.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white">2. Check For Multiple Pressure Tactics</h4>
                  <p className="text-gray-400">Legitimate security alerts don't combine urgency, threats, and limited-time offers to force quick action.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white">3. Unusual Security Language</h4>
                  <p className="text-gray-400">Real security messages use precise technical language, not vague threats or emotional appeals.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/phising-traning')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              Return to Training Hub
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Component ---
const SecurityChallenge = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    completed: false,
    success: false,
    scammed: false,
    attempts: 0,
    timeElapsed: 0,
    stage: "initial",
    wrongClicks: 0,
  });

  // Set body class for phishing mode cursor styling
  useEffect(() => {
    // Add the class when component mounts
    document.body.classList.add('phishing-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('phishing-mode');
    }
  }, []);

  // Timer effect to track elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.started && !gameState.completed) {
      interval = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.started, gameState.completed]);

  // Remove automatic redirect after completion
  
  const handleStart = () => {
    setGameState({
      started: true,
      completed: false,
      success: false,
      scammed: false,
      attempts: 0,
      timeElapsed: 0,
      stage: "initial",
      wrongClicks: 0
    });
  };

  const handleAction = (isCorrect: boolean) => {
    // If incorrect action, end game as failure
    if (!isCorrect) {
      const finalScore = 0; // No score for failure
      
      saveToLeaderboard({
        level: 3,
        time: gameState.timeElapsed,
        correctClicks: 0,
        wrongClicks: gameState.wrongClicks + 1,
        score: finalScore
      });
      
      setGameState((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
        wrongClicks: prev.wrongClicks + 1,
        completed: true,
        success: false,
        scammed: true
      }));
      return;
    }

    // Progress to next stage
    setGameState((prev) => {
      const nextStage = prev.stage === "initial" ? "popup1" :
                       prev.stage === "popup1" ? "popup2" :
                       prev.stage === "popup2" ? "popup3" :
                       prev.stage === "popup3" ? "main" : "end";
      
      // If reached the end, successfully complete the game
      if (nextStage === "end") {
        const finalTime = prev.timeElapsed;
        const finalWrongClicks = prev.wrongClicks;
        
        // Calculate score
        const score = calculateScore(finalTime, finalWrongClicks);
        
        // Save to leaderboard
        saveToLeaderboard({
          level: 3,
          time: finalTime,
          correctClicks: 4, // Navigated through all 4 stages correctly
          wrongClicks: finalWrongClicks,
          score: score
        });
        
        return {
          ...prev,
          completed: true,
          success: true,
          stage: nextStage,
          attempts: prev.attempts + 1
        };
      }

      // Otherwise continue to next stage
      return {
        ...prev,
        stage: nextStage,
        attempts: prev.attempts + 1
      };
    });
  };

  // Calculate score based on time and wrong clicks
  const calculateScore = (time: number, wrongClicks: number) => {
    // Base score of 1500 for level 3 (more difficult)
    const baseScore = 1500;
    // Deduct 50 points per wrong click
    const wrongClickPenalty = wrongClicks * 50;
    // Deduct 3 points per second taken
    const timePenalty = Math.floor(time * 3);
    
    return Math.max(0, baseScore - wrongClickPenalty - timePenalty);
  };
  
  // Save score to leaderboard (via localStorage)
  const saveToLeaderboard = (levelData: {
    level: number;
    time: number;
    correctClicks: number;
    wrongClicks: number;
    score: number;
  }) => {
    try {
      // Get existing data
      const existingDataStr = localStorage.getItem('phishing-leaderboard');
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : { 
        id: 'user-' + Date.now(),
        name: 'Player',
        level1: { completed: false, time: 0, correctClicks: 0, wrongClicks: 0, score: 0 },
        level2: { completed: false, time: 0, correctClicks: 0, wrongClicks: 0, score: 0 },
        level3: { completed: false, time: 0, correctClicks: 0, wrongClicks: 0, score: 0 },
        totalScore: 0,
        completedAt: new Date().toISOString()
      };
      
      // Update level data
      if (levelData.level === 3) {
        existingData.level3 = { 
          completed: true,
          time: levelData.time,
          correctClicks: levelData.correctClicks,
          wrongClicks: levelData.wrongClicks,
          score: levelData.score
        };
      }
      
      // Recalculate total score
      existingData.totalScore = (existingData.level1?.score || 0) + 
                               (existingData.level2?.score || 0) + 
                               (existingData.level3?.score || 0);
      
      existingData.completedAt = new Date().toISOString();
      
      // Save back to localStorage
      localStorage.setItem('phishing-leaderboard', JSON.stringify(existingData));
      
      console.log('Saved to leaderboard:', existingData);
    } catch (error) {
      console.error('Failed to save to leaderboard:', error);
    }
  };

  // Render different screens based on game state
  if (!gameState.started) {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.completed) {
    return (
      <EndScreen
        gameState={gameState}
        onRestart={handleRestart}
      />
    );
  }

  switch (gameState.stage) {
    case "initial":
      return <InitialPopup onAction={handleAction} />;
    case "popup1":
    case "popup2":
    case "popup3":
      return <SecurityPopup stage={gameState.stage} onAction={handleAction} />;
    case "main":
      return <MainChallenge onAction={handleAction} />;
    default:
      return null;
  }
};

// Add the missing handleRestart function
const handleRestart = () => {
  window.location.href = "/phising-traning";
};

export default SecurityChallenge;
