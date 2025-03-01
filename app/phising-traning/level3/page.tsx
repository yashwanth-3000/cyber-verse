"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-purple-500/20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Cyber Defense Challenge
        </h1>
        <p className="text-gray-400 mb-2">
          Your mission: Navigate through advanced security measures and identify legitimate actions.
        </p>
        <p className="text-purple-400 text-sm mb-4">
          Warning: This challenge employs sophisticated deception techniques.
        </p>
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm font-medium">
            EXTREME CAUTION: One wrong move will terminate the challenge instantly!
          </p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
      >
        Accept Challenge
      </button>
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
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/20 p-8 max-w-md w-full"
    >
      {stage === "popup1" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-red-400">⚠️ Critical Security Warning</h3>
            <button
              onClick={() => onAction(true)}
              className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
          <p className="text-gray-300 mb-6">
            Multiple malware infections detected. Your banking credentials may be compromised.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Remove Threats Now
            </button>
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
            >
              Full System Scan
            </button>
          </div>
        </>
      ) : stage === "popup2" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-400">🔒 Account Security Check</h3>
            <button
              onClick={() => onAction(true)}
              className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              Later
            </button>
          </div>
          <p className="text-gray-300 mb-6">
            Your account requires immediate verification due to suspicious activities.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              Verify with SMS
            </button>
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Verify with Email
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-purple-400">🔐 Enhanced Security Required</h3>
            <button
              onClick={() => onAction(true)}
              className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              Skip
            </button>
          </div>
          <p className="text-gray-300 mb-6">
            Enable advanced security features to protect against recent threats.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              Enable 2FA Now
            </button>
            <button
              onClick={() => onAction(false)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Setup Security Key
            </button>
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
    }
    // If neither scam nor real, do nothing (let them continue playing)
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
                <p className="text-xs text-gray-400">{currentTime.toLocaleTimeString()}</p>
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
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Alex</h2>
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

const EndScreen = ({ gameState, onRestart }: { gameState: GameState; onRestart: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-purple-500/20 text-center">
      <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        {gameState.success ? "Mission Accomplished! 🎉" : "Mission Failed"}
      </h1>
      <p className="text-gray-300 mb-6">
        {gameState.success
          ? `Outstanding! You successfully identified all deceptive elements in ${gameState.timeElapsed} seconds!`
          : "You were deceived by one of the sophisticated traps. Stay vigilant!"}
      </p>
      <div className="bg-gray-700/50 p-6 rounded-xl border border-purple-500/20 mb-6">
        <h2 className="font-bold text-white mb-4">Mission Report</h2>
        <div className="space-y-2 text-gray-300">
          <p>Time: {gameState.timeElapsed} seconds</p>
          <p>Stage: {gameState.stage}</p>
          <p>Attempts: {gameState.attempts}</p>
          <p>Wrong Clicks: {gameState.wrongClicks}</p>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
      >
        Accept New Mission
      </button>
    </div>
  </div>
);

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
    wrongClicks: 0
  });

  useEffect(() => {
    // Save progress and return to content hub after completion
    if (gameState.completed) {
      const progress = JSON.parse(localStorage.getItem("phishingProgress") || "{}");
      progress.simulation4 = {
        completed: true,
        attempts: gameState.attempts,
        timeElapsed: gameState.timeElapsed,
        success: gameState.success,
        lastAttemptDate: new Date().toISOString(),
        wrongClicks: gameState.wrongClicks
      };
      localStorage.setItem("phishingProgress", JSON.stringify(progress));
      
      // Wait 2 seconds before redirecting to show the end screen
      setTimeout(() => {
        router.push("/content-hub");
      }, 2000);
    }
  }, [gameState.completed, router]);

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
    return () => clearInterval(interval);
  }, [gameState.started, gameState.completed]);

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
    if (!isCorrect) {
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
      
      if (nextStage === "end") {
        return {
          ...prev,
          completed: true,
          success: true,
          stage: nextStage,
          attempts: prev.attempts + 1
        };
      }

      return {
        ...prev,
        stage: nextStage,
        attempts: prev.attempts + 1
      };
    });
  };

  if (!gameState.started) {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.completed) {
    return (
      <EndScreen
        gameState={gameState}
        onRestart={() => {
          handleStart();
          router.push("/content-hub");
        }}
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

export default SecurityChallenge;
