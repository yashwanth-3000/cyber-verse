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
  stage: "initial" | "popup1" | "popup2" | "main" | "end";
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
const TOTAL_TIME = 30; // Reduced time to increase pressure

const securityAlerts: SecurityAlert[] = [
  {
    id: "alert1",
    type: "critical",
    message: "🚨 URGENT: Multiple login attempts detected from Russia",
    action: "Block Access Now",
    isScam: true,
    priority: 1,
  },
  {
    id: "alert2",
    type: "warning",
    message: "⚠️ Your account will be limited in 2 minutes",
    action: "Verify Identity",
    isScam: true,
    priority: 2,
  },
  {
    id: "alert3",
    type: "info",
    message: "💰 Suspicious transaction: $2,499.99 pending",
    action: "Cancel Transaction",
    isScam: true,
    priority: 3,
  },
  {
    id: "alert4",
    type: "success",
    message: "✅ Security update available - Required by your bank",
    action: "Install Update",
    isScam: true,
    priority: 4,
  },
];

const accountActions = [
  {
    text: "View Statement",
    isReal: true,
    className: "text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2",
    description: "View your monthly statement",
    section: "main",
  },
  {
    text: "🔒 SECURE ACCOUNT NOW",
    isReal: false,
    className: "bg-red-500 text-white px-6 py-3 rounded-lg font-bold animate-pulse shadow-lg hover:bg-red-600",
    description: "Critical: Immediate action required",
    section: "main",
  },
  {
    text: "Enable Advanced Protection",
    isReal: false,
    className: "bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700",
    description: "Recommended by your bank",
    section: "sidebar",
  },
  {
    text: "Verify Recent Activity",
    isReal: false,
    className: "text-yellow-600 hover:text-yellow-700 underline",
    description: "Review suspicious login attempts",
    section: "header",
  },
  {
    text: "Update Security Settings",
    isReal: false,
    className: "bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600",
    description: "Required for continued access",
    section: "main",
  },
];

const notifications = [
  "🔔 New security message from your bank",
  "⚠️ Unusual activity detected",
  "🔒 Security check required",
  "💳 Card verification needed",
  "📱 Enable 2FA immediately",
];

// --- Components ---
const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl mt-12">
    <h1 className="text-3xl font-extrabold mb-4 text-center text-gray-800">
      Advanced Security Challenge
    </h1>
    <p className="mb-4 text-gray-700">
      Your mission: Navigate through security measures and find the legitimate action.
    </p>
    <p className="mb-4 text-gray-600">
      Warning: Multiple layers of deception await. Think carefully before each action.
    </p>
    <p className="mb-4 text-red-600 font-semibold">
      CAUTION: One wrong move could end the challenge immediately!
    </p>
    <button
      onClick={onStart}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-colors"
    >
      Begin Challenge
    </button>
  </div>
);

const InitialPopup = ({ onAction }: { onAction: (isCorrect: boolean) => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 relative"
    >
      <div className="absolute -top-3 -right-3">
        <button
          onClick={() => onAction(true)}
          className="text-gray-500 hover:text-gray-700 text-xs bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🎉 Congratulations! 🎉</h2>
        <p className="text-xl font-semibold mb-2">
          You've Been Selected as Today's Lucky Visitor!
        </p>
        <p className="text-green-600 font-bold text-lg">
          Claim Your $1000 Amazon Gift Card Now
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-green-500 text-xl">✓</span>
          <p>You are visitor #1000 today</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-green-500 text-xl">✓</span>
          <p>Your IP: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-green-500 text-xl">✓</span>
          <p>Location: Verified</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
        <p className="text-sm text-yellow-800">
          ⚠️ Limited time offer! Only 2 gift cards remaining. Claim yours before time runs out!
        </p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-medium">Time remaining:</span>
          <span className="text-red-600 font-bold animate-pulse">02:59</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onAction(false)}
          className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:bg-green-600 transition-colors animate-pulse"
        >
          CLAIM NOW!
        </button>
        <button
          onClick={() => onAction(false)}
          className="bg-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors"
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

const SecurityPopup = ({ stage, onAction }: { stage: "popup1" | "popup2", onAction: (isCorrect: boolean) => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
    >
      {stage === "popup1" ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">⚠️ Security Warning</h3>
            <button
              onClick={() => onAction(true)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip verification
            </button>
          </div>
          <p className="mb-4">
            Your device may be infected with malware. Scan now to protect your data.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onAction(false)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded font-bold hover:bg-red-600 transition-colors"
            >
              Quick Scan (Recommended)
            </button>
            <button
              onClick={() => onAction(false)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded font-bold hover:bg-blue-600 transition-colors"
            >
              Full System Scan
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-600">🔒 Verification Required</h3>
            <button
              onClick={() => onAction(true)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Remind me later
            </button>
          </div>
          <p className="mb-4">
            Please verify your identity to continue to the secure area.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onAction(false)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded font-bold hover:bg-green-600 transition-colors"
            >
              Verify with Phone
            </button>
            <button
              onClick={() => onAction(false)}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded font-bold hover:bg-yellow-600 transition-colors"
            >
              Verify with Email
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

  useEffect(() => {
    // Rotate notifications
    const notifInterval = setInterval(() => {
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
    }, 2000);

    // Show random alerts
    const alertInterval = setInterval(() => {
      const randomAlert = securityAlerts[Math.floor(Math.random() * securityAlerts.length)];
      setCurrentAlert(randomAlert);
    }, 3000);

    // Show urgent popup randomly
    const popupInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowUrgentPopup(true);
      }
    }, 5000);

    // Decrease security score
    const scoreInterval = setInterval(() => {
      setSecurityScore((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(notifInterval);
      clearInterval(alertInterval);
      clearInterval(popupInterval);
      clearInterval(scoreInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="https://placehold.co/40x40" alt="Bank Logo" className="h-8 w-8 rounded" />
                <span className="ml-2 text-xl font-semibold text-blue-900">SecureBank™</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Accounts
                </a>
                <a className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Transfers
                </a>
                <a className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Bill Pay
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => onAction(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Verify Identity
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back, John</h1>
              <p className="text-gray-600">Last login: Today at 9:45 AM</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">$18,440.28</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Account Section */}
          <div className="col-span-2 space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Summary</h2>
                <button
                  onClick={() => onAction(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Statement
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Checking Account</p>
                  <p className="text-2xl font-bold text-gray-900">$2,547.83</p>
                  <p className="text-xs text-red-500 animate-pulse mt-1">Pending: -$2,499.99</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Savings Account</p>
                  <p className="text-2xl font-bold text-gray-900">$15,892.45</p>
                  <p className="text-xs text-green-500 mt-1">+2.3% APY</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Amazon Purchase</p>
                      <p className="text-sm text-gray-500">Dec 15, 2023</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-medium">-$299.99</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 rounded-full p-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Direct Deposit</p>
                      <p className="text-sm text-gray-500">Dec 14, 2023</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">+$2,450.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => onAction(false)}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 animate-pulse transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Account Now
                </button>
                <button
                  onClick={() => onAction(false)}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transfer Money
                </button>
                <button
                  onClick={() => onAction(false)}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay Bills
                </button>
              </div>
            </div>

            {/* Security Center */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Center</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Account Security</span>
                    <span className="text-red-600 font-medium">Critical</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${securityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-red-600 mt-2">Multiple security issues detected</p>
                </div>
              </div>
            </div>

            {/* Security Alerts */}
            {currentAlert && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Alert</h2>
                <div className={`p-4 rounded-lg ${
                  currentAlert.type === "critical" ? "bg-red-50 border border-red-100" :
                  currentAlert.type === "warning" ? "bg-yellow-50 border border-yellow-100" :
                  currentAlert.type === "success" ? "bg-green-50 border border-green-100" : "bg-blue-50 border border-blue-100"
                }`}>
                  <p className="mb-3 text-gray-900">{currentAlert.message}</p>
                  <button
                    onClick={() => onAction(false)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    {currentAlert.action}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Popup */}
      <AnimatePresence>
        {showUrgentPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Critical Security Alert</h3>
                </div>
                <button
                  onClick={() => setShowUrgentPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="mb-6 text-gray-700">
                Your account security is severely compromised. Immediate action required to prevent unauthorized access.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => onAction(false)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Secure Account Now
                </button>
                <button
                  onClick={() => setShowUrgentPopup(false)}
                  className="text-gray-600 hover:text-gray-800 font-medium"
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
  <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl mt-12 text-center">
    <h1 className="text-3xl font-extrabold mb-4">
      {gameState.success ? "Incredible Success! 🎉" : "Challenge Failed"}
    </h1>
    <p className="mb-4 text-gray-700">
      {gameState.success
        ? `Congratulations! You successfully navigated all security measures in ${gameState.timeElapsed} seconds!`
        : "You fell for one of the deceptive elements. Better luck next time!"}
    </p>
    <div className="bg-gray-50 p-4 rounded border mb-4">
      <h2 className="font-bold mb-2">Challenge Report</h2>
      <p>Time Taken: {gameState.timeElapsed} seconds</p>
      <p>Stage Reached: {gameState.stage}</p>
      <p>Attempts: {gameState.attempts}</p>
      <p>Wrong Clicks: {gameState.wrongClicks}</p>
    </div>
    <button
      onClick={onRestart}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-colors"
    >
      Try Again
    </button>
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
      progress.simulation3 = {
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
                       prev.stage === "popup2" ? "main" : "end";
      
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

  const handleRestart = () => {
    setGameState({
      started: false,
      completed: false,
      success: false,
      scammed: false,
      attempts: 0,
      timeElapsed: 0,
      stage: "initial",
      wrongClicks: 0
    });
  };

  if (!gameState.started) {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.completed) {
    return <EndScreen gameState={gameState} onRestart={() => {
      handleStart();
      router.push("/content-hub");
    }} />;
  }

  switch (gameState.stage) {
    case "initial":
      return <InitialPopup onAction={handleAction} />;
    case "popup1":
    case "popup2":
      return <SecurityPopup stage={gameState.stage} onAction={handleAction} />;
    case "main":
      return <MainChallenge onAction={handleAction} />;
    default:
      return null;
  }
};

export default SecurityChallenge;
