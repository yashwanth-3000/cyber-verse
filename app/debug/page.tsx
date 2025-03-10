"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function DebugPage() {
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const [hostname, setHostname] = useState<string>("");
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Unknown");
  
  useEffect(() => {
    // Gather environment variables (only public ones can be shown in client)
    const envVars = {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "Not set",
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || "Not set",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set (value hidden)" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (value hidden)" : "Not set",
      NODE_ENV: process.env.NODE_ENV || "Not set",
    };
    
    setEnvVariables(envVars);
    
    // Get hostname
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
      
      // Test Supabase connection
      const testSupabase = async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          
          // Just make a simple query to test the connection
          const { error } = await supabase.from("profiles").select("id").limit(1);
          
          if (error) {
            console.error("Supabase query error:", error);
            setSupabaseStatus(`Error: ${error.message}`);
          } else {
            setSupabaseStatus("Connected successfully");
          }
        } catch (err) {
          console.error("Supabase connection error:", err);
          setSupabaseStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }
      };
      
      testSupabase();
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl text-[#00FF00] font-bold mb-8">Debug Information</h1>
        
        <div className="mb-8">
          <h2 className="text-xl mb-2 border-b border-gray-700 pb-2">Environment</h2>
          <div className="bg-gray-900 p-4 rounded-md">
            <p><span className="text-gray-400">Hostname:</span> {hostname}</p>
            <p><span className="text-gray-400">Environment:</span> {process.env.NODE_ENV}</p>
            <p><span className="text-gray-400">Is Production:</span> {hostname !== "localhost" && hostname !== "127.0.0.1" ? "Yes" : "No"}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl mb-2 border-b border-gray-700 pb-2">Environment Variables</h2>
          <div className="bg-gray-900 p-4 rounded-md">
            {Object.entries(envVariables).map(([key, value]) => (
              <p key={key} className="mb-2">
                <span className="text-gray-400">{key}:</span> {value}
              </p>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl mb-2 border-b border-gray-700 pb-2">Supabase Connection Test</h2>
          <div className="bg-gray-900 p-4 rounded-md">
            <p><span className="text-gray-400">Status:</span> 
              <span className={supabaseStatus.includes("Error") ? "text-red-400" : "text-green-400"}>
                {supabaseStatus}
              </span>
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-md p-4 mt-8">
          <h3 className="text-yellow-400 mb-2">Important Note</h3>
          <p className="text-gray-300">
            This debug page only shows values of public environment variables (NEXT_PUBLIC_*). 
            Server-side variables cannot be viewed directly from the client for security reasons.
          </p>
        </div>
      </div>
    </div>
  );
} 