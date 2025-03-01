"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    title: "YOU'VE BEEN SELECTED! 🎉",
    text: "You're one of 10 users selected for our exclusive beta test! Claim now!",
    buttonText: "Join Beta Now",
    type: "prize",
    icon: "🎁",
  },
  {
    title: "⚠️ ACCOUNT RESTRICTION",
    text: "Your account has been flagged for unusual activity. Verify now to avoid suspension.",
    buttonText: "Verify Account",
    type: "warning",
    icon: "🛡️",
  },
  {
    title: "YOU HAVE A NEW MATCH!",
    text: "Someone you might know is interested in connecting with you. View their profile now.",
    buttonText: "View Profile",
    type: "dating",
    icon: "❤️",
  },
  {
    title: "STORAGE ALMOST FULL",
    text: "Your media storage is 90% full. Upgrade now to keep posting photos.",
    buttonText: "Free Upgrade",
    type: "system",
    icon: "🔋",
  },
  {
    title: "EXCLUSIVE OFFER - PREMIUM ACCESS",
    text: "Limited time offer! Get Premium features at 75% off for 6 months.",
    buttonText: "Upgrade Now",
    type: "sale",
    icon: "🛍️",
  },
];

const buttonSpecificAds: { [key: string]: any[] } = {
  "VERIFY YOUR PROFILE": [
    {
      title: "PROFILE VERIFICATION NEEDED",
      text: "Your profile requires verification due to recent security updates. Complete now or face restrictions.",
      buttonText: "Verify Now",
      type: "warning",
      icon: "🔒",
    },
  ],
  "Update Privacy Settings": [
    {
      title: "PRIVACY RISK DETECTED",
      text: "Your posts may be visible to unwanted audiences. Update privacy settings immediately.",
      buttonText: "Fix Privacy",
      type: "warning",
      icon: "🛡️",
    },
  ],
  "RESTORE ACCOUNT": [
    {
      title: "ACCOUNT RECOVERY TOOL",
      text: "Use our secure recovery tool to regain full access to your account features.",
      buttonText: "Recover Account",
      type: "system",
      icon: "🔄",
    },
  ],
  "Accept New Terms": [
    {
      title: "TERMS ACCEPTANCE REWARD",
      text: "Thank you for accepting our updated terms! Claim your special reward now.",
      buttonText: "Claim Reward",
      type: "prize",
      icon: "📝",
    },
  ],
  "Claim Free Premium": [
    {
      title: "PREMIUM UPGRADE READY",
      text: "Your account is eligible for a free premium upgrade. Limited time offer!",
      buttonText: "Get Premium",
      type: "sale",
      icon: "⭐",
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
  const specificAds = buttonSpecificAds[buttonType];
  if (specificAds && specificAds.length > 0) {
    return specificAds[0];
  }
  return fakeAds[adIndex];
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

const EndScreen = ({ gameState, onRestart, pressedGroups, clickedButtonsCount }: EndScreenProps) => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl mt-12 text-center">
    <h1 className="text-3xl font-extrabold mb-4">
      {gameState.success ? "Challenge Complete! 🎉" : "Challenge Failed"}
    </h1>
    <p className="mb-4 text-gray-700">
      {gameState.success
        ? `Congratulations! You successfully avoided all phishing attempts in ${gameState.timeElapsed} seconds!`
        : "You fell for a phishing attempt. Stay vigilant!"}
    </p>
    <div className="bg-gray-50 p-4 rounded border mb-4">
      <h2 className="font-bold mb-2">Challenge Report</h2>
      <p>Time Taken: {gameState.timeElapsed} seconds</p>
      <p>Total Attempts: {gameState.attempts}</p>
      <p>Wrong Clicks: {gameState.wrongClicks}</p>
      <p>Deceptive Groups Clicked: {pressedGroups.length}</p>
      <p>Total Interactions: {clickedButtonsCount}</p>
    </div>
    <button
      onClick={onRestart}
      className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const ExplosionAnimation = () => (
  <div className="fixed inset-0 flex justify-center items-center z-[9999] game-over-overlay">
    <div className="relative w-72 h-72">
      {Array.from({ length: 50 }).map((_, i) => {
        const offsetX = Math.random() * 200 - 100;
        const offsetY = Math.random() * 200 - 100;
        const delay = Math.random() * 0.5;
        const size = 5 + Math.random() * 15;
        const hue = Math.random() * 360;
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              "--offset-x": `${offsetX}px`,
              "--offset-y": `${offsetY}px`,
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            } as React.CSSProperties}
          ></div>
        );
      })}
      <div className="game-over-text">ACCOUNT HACKED!</div>
    </div>
    <style jsx>{`
      @keyframes explode {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0);
        }
        50% {
          opacity: 1;
          transform: translate(calc(-50% + var(--offset-x)), calc(-50% + var(--offset-y))) scale(1.5);
        }
        100% {
          opacity: 0;
          transform: translate(calc(-50% + var(--offset-x)), calc(-50% + var(--offset-y))) scale(0);
        }
      }
      .particle {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        animation: explode 1.5s ease-out forwards;
      }
      @keyframes pulseText {
        0% {
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
        }
      }
      .game-over-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        color: #ff0000;
        font-weight: bold;
        animation: pulseText 1s infinite;
        z-index: 100;
      }
      .game-over-overlay {
        background: radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%);
      }
    `}</style>
  </div>
);

interface AdPopupProps {
  ad: Ad;
  onClose: () => void;
  onAdClick: (buttonType: string) => void;
}

const AdPopup = ({ ad, onClose, onAdClick }: AdPopupProps) => {
  const adContent = getAdForButton(ad.buttonType, ad.adIndex);
  const positions = ad.position.split(" ");

  return (
    <div
      className={`fixed bg-white rounded-lg shadow-xl border overflow-hidden ${positions.join(
        " "
      )} z-[70] animate-fadeInBounce`}
      style={{ width: "320px" }}
    >
      <div
        className={`p-2 flex justify-between items-center ${
          adContent.type === "warning"
            ? "bg-red-600 text-white"
            : adContent.type === "prize"
            ? "bg-yellow-400 text-black"
            : adContent.type === "system"
            ? "bg-blue-600 text-white"
            : adContent.type === "sale"
            ? "bg-purple-600 text-white"
            : "bg-pink-500 text-white"
        }`}
      >
        <span className="font-bold text-sm">{adContent.title}</span>
        <button
          onClick={onClose}
          className="text-white bg-opacity-30 rounded-full h-6 w-6 flex items-center justify-center hover:bg-opacity-50"
        >
          ✕
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start mb-4">
          <div className="mr-3 text-2xl">{adContent.icon}</div>
          <p className="text-sm">{adContent.text}</p>
        </div>
        {adContent.type === "warning" && (
          <div className="h-4 bg-gray-200 rounded mb-2">
            <div className="h-full bg-red-500 rounded" style={{ width: "87%" }}></div>
          </div>
        )}
        {adContent.type === "system" && (
          <div className="flex justify-between text-sm mb-2">
            <span>Processing...</span>
            <span>67%</span>
          </div>
        )}
        {adContent.type === "sale" && (
          <div className="text-center text-sm mb-2">
            <span className="font-bold">Offer expires in: </span>
            <span className="text-red-600 font-bold">04:59</span>
          </div>
        )}
        <button
          onClick={() => {
            onClose();
            onAdClick(ad.buttonType);
          }}
          className={`w-full py-2 px-4 text-white font-bold rounded ${
            adContent.type === "warning"
              ? "bg-red-500 hover:bg-red-600"
              : adContent.type === "prize"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : adContent.type === "system"
              ? "bg-blue-500 hover:bg-blue-600"
              : adContent.type === "sale"
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-pink-500 hover:bg-pink-600"
          } transition-colors`}
        >
          {adContent.buttonText}
        </button>
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
      {/* Only display the timer during gameplay */}
      <div className="fixed top-4 right-4 bg-white p-2 rounded shadow z-50">
        <p>Time Left: {TOTAL_TIME - gameState.timeElapsed}s</p>
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
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
              U
            </div>
            <div>
              <p className="font-bold">User123</p>
              <p className="text-sm text-gray-500">View your profile</p>
            </div>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">🏠</span>
              <span>Home</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">👥</span>
              <span>Friends</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">🎬</span>
              <span>Videos</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span className="text-xl">🔔</span>
              <span>Notifications</span>
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
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10 p-6">
              <h2 className="text-2xl font-extrabold mb-4 text-center">
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
                    className="w-full p-3 border rounded"
                  />
                </div>
                <div className="mb-6">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border rounded"
                  />
                </div>
                <p className="text-sm text-gray-700 mb-4">{mainBtn?.description}</p>
                <button
                  onClick={() => handleButtonClick(true)}
                  className={`w-full ${mainBtn?.className}`}
                >
                  {mainBtn?.text}
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
          <h3 className="font-medium mb-3">Sponsored</h3>
          <div className="bg-white rounded border p-3 mb-4">
            <img
              src="/api/placeholder/320/160"
              alt="Advertisement"
              className="rounded mb-2 w-full"
            />
            <p className="font-medium text-sm">Best deals on electronics - Shop now!</p>
            <p className="text-xs text-gray-500">sponsor.example.com</p>
          </div>

          <h3 className="font-medium mb-3 mt-6">Trending Topics</h3>
          <div className="space-y-3">
            <div className="bg-white rounded p-3 border">
              <p className="text-xs text-gray-500">#trending</p>
              <p className="font-medium">Latest Technology News</p>
              <p className="text-xs text-gray-500">4.2K posts</p>
            </div>
            <div className="bg-white rounded p-3 border">
              <p className="text-xs text-gray-500">Entertainment</p>
              <p className="font-medium">New Movie Release Updates</p>
              <p className="text-xs text-gray-500">2.8K posts</p>
            </div>
          </div>

          <h3 className="font-medium mb-3 mt-6">Contacts</h3>
          <div className="space-y-3">
            {["Friend 1", "Friend 2", "Friend 3", "Friend 4"].map((friend, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <span>{friend}</span>
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

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg border z-50 w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Account Verification</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => handleButtonClick(false, popupBtn?.text || "")}
          >
            ✕
          </button>
        </div>
        <p className="text-sm mb-4">
          Your account requires verification due to unusual login activity.
          {popupBtn?.description}
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => handleButtonClick(false, popupBtn?.text || "")}
            className={popupBtn?.className}
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
    setScreen("start");
  };

  const handleButtonClick = (isReal: boolean, buttonText: string = "") => {
    if (isReal) {
      setGameState((prev) => ({ 
        ...prev, 
        completed: true, 
        success: true,
        attempts: prev.attempts + 1
      }));
      setScreen("end");
    } else {
      setGameState((prev) => ({ 
        ...prev, 
        attempts: prev.attempts + 1,
        wrongClicks: prev.wrongClicks + 1
      }));
      setClickedButtonsCount((prev) => prev + 1);

      // Check for related button groups and stop the game if two in the same group are pressed
      const group = getButtonGroup(buttonText);
      if (group) {
        if (pressedGroups.includes(group)) {
          setGameState((prev) => ({ 
            ...prev, 
            completed: true, 
            scammed: true,
            wrongClicks: prev.wrongClicks + 1
          }));
          setScreen("end");
          return;
        } else {
          setPressedGroups((prev) => [...prev, group]);
        }
      }

      const newAd: Ad = {
        adIndex: getRelatedAdIndex(buttonText),
        position: getRandomPosition(),
        buttonType: buttonText,
      };
      setActiveAds((prev) => [...prev, newAd]);

      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === "game") {
      interval = setInterval(() => {
        setGameState((prev) => {
          const newTime = prev.timeElapsed + 1;
          if (newTime >= TOTAL_TIME) {
            clearInterval(interval);
            return { ...prev, timeElapsed: newTime, completed: true, scammed: true };
          }
          return { ...prev, timeElapsed: newTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    // Save progress and return to content hub after completion
    if (gameState.completed) {
      const progress = JSON.parse(localStorage.getItem("phishingProgress") || "{}");
      progress.simulation2 = {
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
