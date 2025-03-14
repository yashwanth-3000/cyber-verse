"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../phishing-style.css"; // Import custom phishing CSS
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useAuth } from "@/lib/providers/auth-provider";

// --- Types ---
interface GameState {
  started: boolean;
  completed: boolean;
  success: boolean;
  scammed: boolean;
  attempts: number;
  timeElapsed: number;
  stage: string;
  wrongClicks: number;
}

interface Ad {
  adIndex: number;
  position: string;
  buttonType: string;
}

// --- Configurations ---
const TOTAL_TIME = 60; // seconds to complete the game

const buttons = [
  {
    text: "VERIFY YOUR PROFILE",
    isReal: false,
    section: "header",
    className:
      "bg-blue-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-blue-600 transition-colors",
    description: "Verify your profile to access new features",
  },
  {
    text: "Update Privacy Settings",
    isReal: false,
    section: "sidebar",
    className:
      "bg-gray-100 text-blue-600 font-medium py-2 px-4 rounded border border-blue-400 hover:bg-gray-200 transition-colors",
    description: "Important: Update required to protect your posts",
  },
  {
    text: "Continue to Feed",
    isReal: true,
    section: "main",
    className:
      "bg-green-600 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-700 transition-colors",
    description: "Access your social media feed",
  },
  {
    text: "RESTORE ACCOUNT",
    isReal: false,
    section: "popup",
    className:
      "bg-red-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-red-600 transition-colors",
    description: "Your account needs verification. Restore access now.",
  },
  {
    text: "Accept New Terms",
    isReal: false,
    section: "footer",
    className:
      "bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded border border-gray-300 hover:bg-gray-300 transition-colors",
    description: "By clicking, you agree to our updated terms",
  },
  {
    text: "Claim Free Premium",
    isReal: false,
    section: "sidebar",
    className:
      "bg-purple-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-purple-600 transition-colors",
    description: "Get 3 months of premium features for free",
  },
];

const fakeAds = [
  {
    title: "Account Security Verification",
    text: "We've detected a new login on your account. Please verify your identity to ensure account security.",
    buttonText: "Verify Now",
    type: "warning",
    icon: "🔒",
    secondaryText: "Not now"
  },
  {
    title: "Privacy Settings Update Required",
    text: "We've updated our privacy controls to give you more options. Please review your settings.",
    buttonText: "Update Settings",
    type: "system",
    icon: "🛡️",
    secondaryText: "Remind me later"
  },
  {
    title: "New Message Notification",
    text: "You have 3 unread messages from connections in your network. View your messages now.",
    buttonText: "View Messages",
    type: "warning",
    icon: "✉️",
    secondaryText: "Mark as read"
  },
  {
    title: "Storage Management",
    text: "Your account storage is 90% full. Upgrade your plan to ensure you don't lose access to your files.",
    buttonText: "Manage Storage",
    type: "system",
    icon: "📂",
    secondaryText: "Learn more"
  },
  {
    title: "Premium Account Benefits",
    text: "Upgrade to Premium for advanced features including enhanced security, priority support, and more customization options.",
    buttonText: "View Premium Plans",
    type: "sale",
    icon: "⭐",
    secondaryText: "No thanks"
  },
];

const buttonSpecificAds: { [key: string]: any[] } = {
  "VERIFY YOUR PROFILE": [
    {
      title: "Identity Verification",
      text: "Please verify your identity to secure your account and access all features. This quick process helps us ensure your account safety.",
      buttonText: "Complete Verification",
      type: "warning",
      icon: "🔒",
      secondaryText: "Learn more about verification"
    },
  ],
  "Update Privacy Settings": [
    {
      title: "Privacy Controls",
      text: "We've enhanced our privacy controls to give you more ways to protect your information. Please review your current settings.",
      buttonText: "Review Settings",
      type: "system",
      icon: "🛡️",
      secondaryText: "Remind me later"
    },
  ],
  "RESTORE ACCOUNT": [
    {
      title: "Account Recovery",
      text: "We've detected you may be having trouble accessing certain features. Complete account recovery to restore full functionality.",
      buttonText: "Start Recovery",
      type: "system",
      icon: "🔄",
      secondaryText: "Contact support instead"
    },
  ],
  "Accept New Terms": [
    {
      title: "Terms of Service Update",
      text: "We've updated our Terms of Service to improve clarity and transparency. Please review the changes to continue using our service.",
      buttonText: "Accept Terms",
      type: "system",
      icon: "📝",
      secondaryText: "Review changes first"
    },
  ],
  "Claim Free Premium": [
    {
      title: "Premium Account Offer",
      text: "You're eligible for a free premium upgrade based on your account activity. Unlock enhanced features and improved security.",
      buttonText: "Activate Premium",
      type: "sale",
      icon: "⭐",
      secondaryText: "No thanks"
    },
  ],
};

// Mapping of button groups to compromised data details
const compromisedDataMapping: { [key: string]: string[] } = {
  verify: ["Full Profile Access", "Private Messages", "Photos"],
  restore: ["Account Recovery Data", "Payment Methods", "User Profile Details"],
  premium: ["Billing Information", "Premium Subscription Data", "User Preferences"],
};

// --- Helper Functions ---
const getButtonGroup = (buttonText: string) => {
  const text = buttonText.toLowerCase();
  if (["verify your profile", "update privacy settings"].includes(text))
    return "verify";
  if (["restore account", "recover account"].includes(text)) return "restore";
  if (["accept new terms", "claim free premium", "get premium"].includes(text))
    return "premium";
  return null;
};

const getRandomPosition = () => {
  const positions = [
    "top-1/4 left-1/4",
    "top-1/4 right-1/4",
    "bottom-1/4 left-1/4",
    "bottom-1/4 right-1/4",
    "top-1/2 left-1/3",
    "top-1/3 right-1/3",
    "bottom-1/3 left-1/3",
    "bottom-1/3 right-1/3",
  ];
  return positions[Math.floor(Math.random() * positions.length)];
};

const getRelatedAdIndex = (buttonType: string) => {
  if (buttonType.includes("VERIFY") || buttonType.includes("Privacy"))
    return 1;
  if (buttonType.includes("RESTORE") || buttonType.includes("account"))
    return 3;
  if (buttonType.includes("Premium")) return 4;
  if (buttonType.includes("Terms")) return 0;
  return Math.floor(Math.random() * fakeAds.length);
};

const getAdForButton = (buttonType: string, adIndex: number) => {
  // First try to get a specific ad for this exact button text
  if (buttonSpecificAds[buttonType] && buttonSpecificAds[buttonType].length > 0) {
    return buttonSpecificAds[buttonType][adIndex % buttonSpecificAds[buttonType].length];
  }
  
  // If no specific ad found, try matching by button group
  const buttonGroup = getButtonGroup(buttonType);
  if (buttonGroup) {
    // Look for any ads that match this button group
    for (const [key, ads] of Object.entries(buttonSpecificAds)) {
      if (getButtonGroup(key) === buttonGroup && ads.length > 0) {
        return ads[0]; // Use the first ad from a matching group
      }
    }
  }
  
  // Fall back to generic fake ads
  return fakeAds[adIndex % fakeAds.length];
};

// --- Components ---

const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl mt-12">
    <h1 className="text-3xl font-extrabold mb-4 text-center text-gray-800">
      Social Media Phishing Simulation
    </h1>
    <p className="mb-4 text-gray-700">
      Identify the single legitimate button hidden among decoys.
    </p>
    <p className="mb-4 text-gray-600">
      Beware: Most buttons are traps that trigger annoying pop-up ads and distract you.
    </p>
    <p className="mb-4 text-red-600 font-semibold">
      WARNING: Clicking two related phishing buttons may lock you out permanently!
    </p>
    <button
      onClick={onStart}
      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-blue-600 transition-colors"
    >
      Start Game
    </button>
  </div>
);

interface EndScreenProps {
  gameState: GameState;
  onRestart: () => void;
  pressedGroups: string[];
  clickedButtonsCount: number;
}

const EndScreen = ({ gameState, onRestart, pressedGroups, clickedButtonsCount }: EndScreenProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full shadow-2xl border border-blue-500/20 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900">
          <h2 className="text-2xl font-bold text-white">
            {gameState.success ? "Phishing Challenge Completed!" : "Phishing Attempt Succeeded"}
          </h2>
          <p className="text-blue-200 mt-2">
            {gameState.success 
              ? "Great job! You successfully identified the safe navigation." 
              : "Oops! You clicked on a deceptive element."}
          </p>
        </div>
        
        <div className="p-6">
          {/* Conditional message based on success */}
          {gameState.success ? (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-900 rounded-md">
              <p className="text-green-400">
                You successfully completed the challenge by identifying the legitimate button!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-md">
                <p className="text-red-400">
                  You fell for a phishing attempt. Don't worry, this is a safe training environment.
                </p>
              </div>
              {gameState.scammed && <ExplosionAnimation />}
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-blue-400 mb-2">Your Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time taken:</span>
                  <span className="text-white">{gameState.timeElapsed} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wrong clicks:</span>
                  <span className="text-white">{gameState.wrongClicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Elements clicked:</span>
                  <span className="text-white">{clickedButtonsCount}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-blue-400 mb-2">Areas Explored</h3>
              {pressedGroups.length > 0 ? (
                <div className="space-y-3">
                  {pressedGroups.includes('verify') && (
                    <div className="bg-red-900/20 p-2 rounded-md border border-red-800">
                      <p className="text-red-400 font-medium">Verification Area</p>
                      <p className="text-xs text-gray-400 mt-1">Clicked profile verification or privacy settings buttons</p>
                    </div>
                  )}
                  {pressedGroups.includes('restore') && (
                    <div className="bg-yellow-900/20 p-2 rounded-md border border-yellow-800">
                      <p className="text-yellow-400 font-medium">Account Restoration</p>
                      <p className="text-xs text-gray-400 mt-1">Clicked account recovery buttons</p>
                    </div>
                  )}
                  {pressedGroups.includes('premium') && (
                    <div className="bg-purple-900/20 p-2 rounded-md border border-purple-800">
                      <p className="text-purple-400 font-medium">Premium Features</p>
                      <p className="text-xs text-gray-400 mt-1">Clicked premium offer or terms acceptance buttons</p>
                    </div>
                  )}
                  {pressedGroups.includes('other') && (
                    <div className="bg-blue-900/20 p-2 rounded-md border border-blue-800">
                      <p className="text-blue-400 font-medium">Other Interactions</p>
                      <p className="text-xs text-gray-400 mt-1">Clicked other interactive elements</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-gray-500 text-sm">No areas explored</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-5">
            <div className="flex flex-col md:flex-row gap-3 justify-end">
              <button
                onClick={onRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Try Again
              </button>
              <Link href="/phising-traning">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Back to Training Hub
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplosionAnimation = () => (
  <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-md">
    <p className="text-yellow-400 font-medium text-center">
      In a real scenario, this could have compromised your account security.
    </p>
  </div>
);

interface AdPopupProps {
  ad: Ad;
  onClose: () => void;
  onAdClick: (buttonType: string) => void;
}

const AdPopup = ({ ad, onClose, onAdClick }: AdPopupProps) => {
  const adContent = getAdForButton(ad.buttonType, ad.adIndex);
  
  // Closing is always the correct action for a phishing popup
  const handleCloseClick = () => {
    // Just close the popup without any wrong click counting
    onClose();
  };
  
  // Clicking any button inside the popup is always wrong
  const handleAdButtonClick = () => {
    // This will count as a wrong click
    onAdClick(ad.buttonType);
  };

  // Choose a trustworthy-looking style based on the ad type
  let headerStyle = "bg-blue-600";
  let logoIcon = "🔒";
  
  if (adContent.type === "warning") {
    headerStyle = "bg-blue-700"; 
    logoIcon = "🔔";
  } else if (adContent.type === "system") {
    headerStyle = "bg-gray-800";
    logoIcon = "💻";
  } else if (adContent.type === "prize") {
    headerStyle = "bg-green-600";
    logoIcon = "🏆";
  } else if (adContent.type === "sale") {
    headerStyle = "bg-blue-600";
    logoIcon = "💎";
  }
  
  return (
    <div
      className={`fixed ${ad.position} z-50 bg-white rounded-lg shadow-xl overflow-hidden w-96 border border-gray-200`}
    >
      {/* Professional-looking header */}
      <div className={`${headerStyle} px-4 py-3 flex justify-between items-center`}>
        <div className="flex items-center">
          <span className="mr-2 text-xl">{logoIcon}</span>
          <h3 className="text-white font-semibold">SocialConnect</h3>
        </div>
        <button
          onClick={handleCloseClick}
          className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full h-6 w-6 flex items-center justify-center transition-colors"
          aria-label="Close popup"
        >
          ×
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-5">
        <div className="mb-3">
          <h4 className="font-bold text-gray-800 text-lg mb-2">{adContent.title}</h4>
          <p className="text-gray-600">{adContent.description}</p>
        </div>
        
        <div className="flex flex-col">
          <button
            onClick={handleAdButtonClick}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            {adContent.buttonText}
          </button>
          
          {adContent.secondaryText && (
            <button
              onClick={handleCloseClick}
              className="text-sm text-gray-500 mt-3 hover:text-gray-700 self-center"
            >
              {adContent.secondaryText}
            </button>
          )}
          
          {/* Add footer for extra legitimacy */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">Privacy Protected</div>
            <div className="text-xs text-gray-500">© SocialConnect Inc.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameScreenProps {
  gameState: GameState;
  handleButtonClick: (isReal: boolean, buttonText?: string) => void;
  activeAds: Ad[];
  closeAd: (index: number) => void;
  shake: boolean;
}

const GameScreen = ({
  gameState,
  handleButtonClick,
  activeAds,
  closeAd,
  shake,
}: GameScreenProps) => {
  const headerBtn = buttons.find((b) => b.section === "header");
  const sidebarPrivacy = buttons.find(
    (b) => b.section === "sidebar" && !b.isReal && b.text === "Update Privacy Settings"
  );
  const sidebarPremium = buttons.find(
    (b) => b.section === "sidebar" && b.text.includes("Premium")
  );
  const mainBtn = buttons.find((b) => b.section === "main");
  const popupBtn = buttons.find((b) => b.section === "popup");
  const footerBtn = buttons.find((b) => b.section === "footer");

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden">
      {/* Timer with improved visibility */}
      <div className="fixed top-4 right-4 bg-white p-3 rounded-md shadow-md z-50 border border-blue-200">
        <p className="font-bold text-gray-800">Time Left: <span className="text-blue-600">{TOTAL_TIME - gameState.timeElapsed}s</span></p>
      </div>

      <header className="bg-blue-600 text-white p-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          <span className="font-bold text-xl">SocialConnect</span>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm w-32 md:w-64"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-blue-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-blue-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-50 p-4 border-r">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              U
            </div>
            <div>
              <p className="font-bold text-gray-800">User123</p>
              <p className="text-sm text-blue-600 hover:underline cursor-pointer">View your profile</p>
            </div>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center space-x-3 p-2 bg-blue-50 rounded cursor-pointer">
              <span className="text-xl">🏠</span>
              <span className="font-medium text-gray-800">Home</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">👥</span>
              <span className="font-medium text-gray-800">Friends</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">🎬</span>
              <span className="font-medium text-gray-800">Videos</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">🔔</span>
              <span className="font-medium text-gray-800">Notifications</span>
            </li>
            <li className="border-t my-2 pt-2">
              <div className="p-3 bg-blue-50 rounded border border-blue-100 mt-2">
                <p className="text-sm text-blue-800 mb-2">{sidebarPrivacy?.description}</p>
                <button
                  onClick={() => handleButtonClick(false, sidebarPrivacy?.text || "")}
                  className={sidebarPrivacy?.className}
                >
                  {sidebarPrivacy?.text}
                </button>
              </div>
            </li>
            <li>
              <div className="p-3 bg-purple-50 rounded border border-purple-100 mt-2">
                <p className="text-sm text-purple-800 mb-2">{sidebarPremium?.description}</p>
                <button
                  onClick={() => handleButtonClick(false, sidebarPremium?.text || "")}
                  className={sidebarPremium?.className}
                >
                  {sidebarPremium?.text}
                </button>
              </div>
            </li>
          </ul>
        </aside>

        <main className="flex-1 p-4 bg-gray-100 relative">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex space-x-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                U
              </div>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="bg-gray-100 rounded-full px-4 py-2 flex-1"
              />
            </div>
            <div className="flex justify-between border-t pt-3">
              <button className="flex items-center text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                <span className="mr-1">📷</span> Photo
              </button>
              <button className="flex items-center text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                <span className="mr-1">📽️</span> Video
              </button>
              <button className="flex items-center text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                <span className="mr-1">😀</span> Feeling
              </button>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow-md p-6 relative transition-transform ${
              shake ? "animate-shake" : ""
            }`}
          >
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-20 p-6 shadow-lg rounded-lg border border-gray-200">
              <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800">
                Welcome to SocialConnect
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Sign in to see posts from friends and family
              </p>
              <div className="w-full max-w-sm">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Email or Phone Number"
                    className="w-full p-3 border rounded text-gray-700"
                  />
                </div>
                <div className="mb-6">
                  <input
                    type="password"
                    placeholder="Password"
                    defaultValue="••••••••" 
                    className="w-full p-3 border rounded text-gray-700"
                  />
                </div>
                <p className="text-sm text-gray-700 mb-4">{mainBtn?.description}</p>
                <button
                  onClick={() => handleButtonClick(true)}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded shadow hover:bg-green-700 transition-colors relative z-20"
                >
                  {mainBtn?.text || "Continue to Feed"}
                </button>
                <div className="text-center mt-4">
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    Forgot Password?
                  </a>
                </div>
              </div>
            </div>

            <div className="opacity-50 pointer-events-none">
              {[1, 2, 3].map((post) => (
                <div key={post} className="bg-white rounded-lg shadow mb-4 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="ml-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 mt-1"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/5 mb-3"></div>
                  <div className="h-48 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="flex justify-between pt-2 border-t">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="w-full md:w-80 p-4 bg-gray-50 border-l hidden md:block">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Sponsored</h3>
          <div className="bg-white rounded-md border border-gray-300 p-4 mb-5 shadow-sm">
            <img
              src="/api/placeholder/320/160"
              alt="Advertisement"
              className="rounded-md mb-3 w-full border border-gray-200"
            />
            <p className="font-medium text-gray-800 text-sm">Best deals on electronics - Shop now!</p>
            <p className="text-xs text-blue-600 mt-1">sponsor.example.com</p>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 mt-6 text-lg">Trending Topics</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-md p-4 border border-gray-300 shadow-sm">
              <p className="text-xs font-medium text-blue-600">#trending</p>
              <p className="font-medium text-gray-800 my-1">Latest Technology News</p>
              <p className="text-xs text-gray-700">4.2K posts</p>
            </div>
            <div className="bg-white rounded-md p-4 border border-gray-300 shadow-sm">
              <p className="text-xs font-medium text-blue-600">Entertainment</p>
              <p className="font-medium text-gray-800 my-1">New Movie Release Updates</p>
              <p className="text-xs text-gray-700">2.8K posts</p>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 mt-6 text-lg">Contacts</h3>
          <div className="space-y-3">
            {["Friend 1", "Friend 2", "Friend 3", "Friend 4"].map((friend, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-md transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {friend[0]}
                </div>
                <span className="text-gray-800">{friend}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 p-4 flex justify-between items-center z-20">
        <p className="text-sm text-gray-600 mr-4">
          We've updated our terms of service and privacy policy.
          {footerBtn?.description}
        </p>
        <button
          onClick={() => handleButtonClick(false, footerBtn?.text || "")}
          className={footerBtn?.className}
        >
          {footerBtn?.text}
        </button>
      </div>

      {/* Account Verification Popup with improved visibility */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl border border-red-200 z-50 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-800">Account Verification</h3>
          <button
            className="text-gray-600 hover:text-gray-800 text-xl"
            onClick={() => {
              // Just close the popup without counting as wrong click
              // We don't pass buttonText here, so it won't be counted
              handleButtonClick(false, "");
            }}
          >
            ✕
          </button>
        </div>
        <p className="text-base text-gray-700 mb-4 leading-relaxed">
          Your account requires verification due to unusual login activity.
          <span className="font-semibold block mt-2 text-gray-800">{popupBtn?.description}</span>
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => handleButtonClick(false, popupBtn?.text || "")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow transition-colors"
          >
            {popupBtn?.text}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-10px);
          }
          40% {
            transform: translateX(10px);
          }
          60% {
            transform: translateX(-10px);
          }
          80% {
            transform: translateX(10px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

// --- Main Application Component ---
const PhishingSimulation = () => {
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
  const [screen, setScreen] = useState<"start" | "game" | "end">("start");
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [clickedButtonsCount, setClickedButtonsCount] = useState(0);
  // Track the unique groups of wrong buttons pressed
  const [pressedGroups, setPressedGroups] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  // Set body class for phishing mode cursor styling
  useEffect(() => {
    // Add the class when component mounts
    document.body.classList.add('phishing-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('phishing-mode');
    }
  }, []);

  const handleStart = () => {
    setScreen("game");
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
    setClickedButtonsCount(0);
    setActiveAds([]);
    setPressedGroups([]);
  };

  const handleRestart = () => {
    // Just go back to start screen, no redirect
    setScreen("start");
  };

  const goToTrainingHub = () => {
    router.push("/phising-traning");
  };

  // Function to completely end the game
  const completeGame = (isSuccessful: boolean, finalWrongClicks: number) => {
    // Calculate score
    const finalTime = gameState.timeElapsed;
    const score = isSuccessful ? calculateScore(finalTime, finalWrongClicks) : 0;
    
    // Save to leaderboard
    saveToLeaderboard({
      level: 1,
      time: finalTime,
      correctClicks: isSuccessful ? 1 : 0, // Just one correct button needed for success
      wrongClicks: finalWrongClicks,
      score: score
    });
    
    // Update game state
    setGameState((prev) => ({
      ...prev,
      completed: true,
      success: isSuccessful,
      scammed: !isSuccessful,
      wrongClicks: finalWrongClicks
    }));
    
    // Clear all popups
    setActiveAds([]);
    
    // Update screen to show end screen
    setScreen("end");
  };

  const handleButtonClick = (isReal: boolean, buttonText: string = "") => {
    // Only process clicks if the game is active
    if (!gameState.started || gameState.completed) return;

    // For empty buttonText with isReal=true, it's the main Continue to Feed button
    // which is correctly identified as the real button
    if (isReal) {
      console.log("Correct button clicked - completing game successfully");
      
      // Track the click for analytics
      if (buttonText) {
        const group = getButtonGroup(buttonText);
        if (group && !pressedGroups.includes(group)) {
          setPressedGroups(prev => [...prev, group]);
        }
        setClickedButtonsCount(prev => prev + 1);
      }
      
      // Correct button clicked - win the game
      completeGame(true, gameState.wrongClicks);
      return;
    }

    // Beyond this point, we're handling non-real buttons

    // For empty buttonText with isReal=false, it's likely a close button which is the correct action
    // We don't count it as a wrong click
    if (!buttonText) {
      console.log("Close button clicked - no penalty");
      return;
    }

    // Track which button group was pressed for non-real buttons with text
    const group = getButtonGroup(buttonText);
    
    // Only track unique button groups in pressedGroups
    if (group && !pressedGroups.includes(group)) {
      setPressedGroups(prev => [...prev, group]);
      console.log(`Added group ${group} to pressedGroups`);
    } else if (buttonText && !group) {
      // If we have button text but couldn't determine a group, track it as 'other'
      if (!pressedGroups.includes('other')) {
        setPressedGroups(prev => [...prev, 'other']);
      }
    }
    
    // Track total clicked buttons with text (real interactions)
    setClickedButtonsCount(prev => prev + 1);

    // Count as a wrong click - we already verified buttonText is not empty above
    setGameState((prev) => ({
      ...prev,
      wrongClicks: prev.wrongClicks + 1,
    }));
    
    // Visual feedback for wrong click
    setShake(true);
    setTimeout(() => setShake(false), 500);
    
    // Add a popup specifically for this button
    // First, try to find a specific ad for this exact button text
    if (buttonSpecificAds[buttonText] && buttonSpecificAds[buttonText].length > 0) {
      // We have a specific ad for this button
      const buttonType = buttonText;
      const adIndex = 0; // Use the first (and typically only) specific ad
      const randomPosition = getRandomPosition();
      
      // Don't exceed 3 active ads
      if (activeAds.length < 3) {
        setActiveAds(prev => [...prev, { adIndex, position: randomPosition, buttonType }]);
      }
    } else {
      // No specific ad, fall back to using button group
      const buttonGroup = getButtonGroup(buttonText) || "unknown";
      const adIndex = getRelatedAdIndex(buttonGroup);
      const randomPosition = getRandomPosition();
      
      // Don't exceed 3 active ads
      if (activeAds.length < 3) {
        setActiveAds(prev => [...prev, { adIndex, position: randomPosition, buttonType: buttonGroup }]);
      }
    }
    
    // After 3 wrong clicks, the user loses
    if (gameState.wrongClicks >= 2) {
      completeGame(false, gameState.wrongClicks + 1);
    }
  };

  // Calculate score based on time and wrong clicks
  const calculateScore = (time: number, wrongClicks: number) => {
    // Base score for completing the level
    const baseScore = 1000;
    
    // Deduct 50 points per wrong click
    const wrongClickPenalty = wrongClicks * 50;
    // Deduct 10 points per second taken
    const timePenalty = Math.floor(time / 5) * 10;
    
    // Calculate raw score
    const rawScore = Math.max(0, baseScore - wrongClickPenalty - timePenalty);
    
    // Convert to 10-point scale (1000 points = 10 points on new scale)
    return Math.min(10, Math.max(0, Math.round((rawScore / 1000) * 10)));
  };
  
  // Save score to Supabase leaderboard
  const saveToLeaderboard = async (levelData: {
    level: number;
    time: number;
    correctClicks: number;
    wrongClicks: number;
    score: number;
  }) => {
    try {
      const { user } = useAuth();
      const supabase = createSupabaseBrowserClient();
      
      // If user is not logged in, save to localStorage as fallback
      if (!user) {
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
        
        // Update level data (keeping the existing localStorage functionality as fallback)
        if (levelData.level === 1) {
          existingData.level1 = {
            completed: true,
            time: levelData.time,
            correctClicks: levelData.correctClicks,
            wrongClicks: levelData.wrongClicks,
            score: levelData.score
          };
        }
        
        // Recalculate total score
        existingData.totalScore = (
          (existingData.level1?.score || 0) +
          (existingData.level2?.score || 0) +
          (existingData.level3?.score || 0)
        );
        
        // Update completion timestamp
        existingData.completedAt = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem('phishing-leaderboard', JSON.stringify(existingData));
        return;
      }
      
      // If logged in, save to Supabase
      // First check if user already has a record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user's nickname
      let nickname = user.email?.split('@')[0] || "Anonymous";
      if (existingRecord?.nickname) {
        nickname = existingRecord.nickname;
      }
        
      if (existingRecord) {
        // Only update if the new score is better than the existing one
        if (levelData.score > existingRecord.score) {
          const { error: updateError } = await supabase
            .from('leaderboard')
            .update({ 
              score: levelData.score,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);
            
          if (updateError) {
            console.error('Error updating leaderboard:', updateError.message);
          }
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('leaderboard')
          .insert({
            user_id: user.id,
            score: levelData.score,
            nickname: nickname
          });
          
        if (insertError) {
          console.error('Error inserting to leaderboard:', insertError.message);
        }
      }
    } catch (error) {
      console.error('Error saving to leaderboard:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === "game" && gameState.started && !gameState.completed) {
      interval = setInterval(() => {
        setGameState((prev) => {
          const newTime = prev.timeElapsed + 1;
          if (newTime >= TOTAL_TIME) {
            // Time's up - complete game as failure
            completeGame(false, prev.wrongClicks);
            return { 
              ...prev, 
              timeElapsed: newTime, 
              completed: true, 
              scammed: true,
              success: false
            };
          }
          return { ...prev, timeElapsed: newTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, gameState.started, gameState.completed]);

  return (
    <div>
      {screen === "start" && <StartScreen onStart={handleStart} />}
      {screen === "game" && (
        <GameScreen
          gameState={gameState}
          handleButtonClick={handleButtonClick}
          activeAds={activeAds}
          closeAd={(index) => setActiveAds((prev) => prev.filter((_, i) => i !== index))}
          shake={shake}
        />
      )}
      {screen === "end" && (
        <EndScreen
          gameState={gameState}
          onRestart={handleRestart}
          pressedGroups={pressedGroups}
          clickedButtonsCount={clickedButtonsCount}
        />
      )}
      {activeAds.map((ad, index) => (
        <AdPopup
          key={index}
          ad={ad}
          onClose={() => setActiveAds((prev) => prev.filter((_, i) => i !== index))}
          onAdClick={(buttonType) => handleButtonClick(false, buttonType)}
        />
      ))}
    </div>
  );
};

export default PhishingSimulation;
