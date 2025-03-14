"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, ExternalLink, ThumbsUp, Share2, Tag, 
  Calendar, User, MessageSquare, Flag, Share, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/supabase/use-session";
import { useRouter } from "next/navigation";
import { 
  getResourceById, 
  getRelatedResources, 
  toggleUpvote, 
  getResourceComments,
  ResourceWithStats 
} from "@/lib/supabase/resources";
import ResourceComments from "@/app/components/ResourceComments";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Define the Comment interface for use in the component
interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  author_avatar?: string | null;
}

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  
  const [resource, setResource] = useState<ResourceWithStats | null>(null);
  const [relatedResources, setRelatedResources] = useState<ResourceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  // Fetch resource data
  useEffect(() => {
    let isMounted = true;
    
    async function fetchResourceData() {
      if (!params.id) return;
      
      setLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        console.log("Fetching resource details for:", params.id);
        // Fetch the resource
        const { success, resource: fetchedResource, error: fetchError } = await getResourceById(params.id);
        
        if (!isMounted) return;
        
        if (success && fetchedResource) {
          console.log("Resource loaded successfully:", fetchedResource.id);
          setResource(fetchedResource);
          
          // Fetch related resources
          const { success: relatedSuccess, resources: relatedData, error: relatedError } = 
            await getRelatedResources(params.id, 3);
            
          if (isMounted) {
            if (relatedSuccess && relatedData) {
              console.log(`Found ${relatedData.length} related resources`);
              setRelatedResources(relatedData);
            } else {
              console.warn("Failed to fetch related resources:", relatedError);
              setRelatedResources([]);
            }
            
            // Fetch real comments from Supabase
            const { success: commentsSuccess, comments: commentsData, error: commentsError } = 
              await getResourceComments(params.id);
              
            if (commentsSuccess && commentsData) {
              console.log(`Found ${commentsData.length} comments`);
              setComments(commentsData);
            } else {
              console.warn("Failed to fetch comments:", commentsError);
              setComments([]);
            }
          }
        } else {
          console.error("Failed to fetch resource:", fetchError);
          setError("Resource not found or could not be loaded");
          // Reset states
          setResource(null);
          setRelatedResources([]);
          setComments([]);
        }
      } catch (err) {
        console.error("Error fetching resource:", err);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again later.");
          // Reset states
          setResource(null);
          setRelatedResources([]);
          setComments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchResourceData();

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [params.id]); // Dependency on params.id ensures reload when the ID changes

  // Add a keyboard shortcut to share directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+S or Cmd+Shift+S to avoid conflict with browser save
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault(); // Prevent the browser's default action
        
        // Directly copy to clipboard
        try {
          navigator.clipboard.writeText(window.location.origin + window.location.pathname)
            .then(() => {
              setShowCopiedTooltip(true);
              setTimeout(() => setShowCopiedTooltip(false), 1500);
            });
        } catch (err) {
          console.error("Keyboard shortcut share failed:", err);
        }
      }
    };
    
    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUpvote = async () => {
    if (!session?.user) {
      router.push('/login?next=/resources/' + params.id);
      return;
    }
    
    setUpvoteLoading(true);
    try {
      const { success, isUpvoted: newUpvoteState, error } = 
        await toggleUpvote(params.id, session.user.id);
        
      if (success) {
        setIsUpvoted(newUpvoteState);
        // Update the upvote count in the resource state
        if (resource) {
          setResource({
            ...resource,
            upvotes_count: newUpvoteState 
              ? (resource.upvotes_count || 0) + 1 
              : Math.max((resource.upvotes_count || 0) - 1, 0)
          });
        }
      } else {
        console.error("Failed to toggle upvote:", error);
      }
    } catch (err) {
      console.error("Error toggling upvote:", err);
    } finally {
      setUpvoteLoading(false);
    }
  };

  // Handle new comment added through the component
  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  // Remove the old duplicate handleShare implementation and keep only the new one
  const handleShare = () => {
    // Don't show the tooltip again if it's already shown
    if (showCopiedTooltip) return;
    
    try {
      // Use current URL for sharing
      const shareUrl = window.location.href;
      
      // Try to use the clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setShowCopiedTooltip(true);
            setTimeout(() => setShowCopiedTooltip(false), 2000);
          })
          .catch(err => {
            console.error("Failed to copy:", err);
            alert("Could not copy the URL. Please copy it manually.");
          });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';  // Prevent scrolling to the bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
          setShowCopiedTooltip(true);
          setTimeout(() => setShowCopiedTooltip(false), 2000);
        } else {
          alert("Could not copy the URL. Please copy it manually.");
        }
      }
    } catch (err) {
      console.error("Error sharing resource:", err);
      alert("Could not copy the URL. Please copy it manually.");
    }
  };

  // Update the refresh function to trigger auth refresh
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get Supabase client and refresh the auth session first
      const supabase = createSupabaseBrowserClient();
      
      // This will trigger the "Auth state changed: INITIAL_SESSION" message
      await supabase.auth.refreshSession();
      console.log("Auth session refreshed");
      
      console.log("Manually refreshing resource data...");
      
      // Fetch the resource
      const { success, resource: fetchedResource, error: fetchError } = await getResourceById(params.id);
      
      if (success && fetchedResource) {
        console.log("Resource refreshed successfully:", fetchedResource.id);
        setResource(fetchedResource);
        
        // Fetch related resources
        const { resources: relatedData } = await getRelatedResources(params.id, 3);
        if (relatedData) {
          setRelatedResources(relatedData);
        }
        
        // Fetch comments
        const { comments: commentsData } = await getResourceComments(params.id);
        if (commentsData) {
          setComments(commentsData);
        }
      } else {
        console.error("Failed to refresh resource:", fetchError);
        setError("Failed to refresh resource. Please try again.");
      }
    } catch (err) {
      console.error("Error refreshing resource:", err);
      setError("An unexpected error occurred while refreshing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-[#2ecc71] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Resource Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "The requested resource could not be found."}</p>
          <Button
            onClick={() => router.push('/resources')}
            className="bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/resources"
              className="inline-flex items-center text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
            
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-[#2ecc71]/30 text-[#2ecc71] rounded-md font-medium hover:bg-[#2ecc71]/10 transition-all duration-300 font-mono"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-md rounded-lg border border-[#2ecc71]/20 overflow-hidden mb-8"
          >
            {/* Terminal-style header bar */}
            <div className="flex items-center space-x-2 p-2 bg-black/70">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-[#2ecc71]">resource-detail@terminal</span>
            </div>

            {/* Resource header with image */}
            <div className="relative h-48 md:h-64 w-full">
              <Image
                src={resource.image_url || "/placeholder.jpg"}
                alt={resource.title || "Resource"}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  console.log("Error loading image, using fallback");
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{resource.title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.isArray(resource.tags) && resource.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 text-xs bg-[#2ecc71]/10 text-[#2ecc71] rounded-full flex items-center"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <span className="flex items-center mr-4 bg-black/40 px-3 py-1 rounded-full border border-[#2ecc71]/20">
                    {resource.author_avatar ? (
                      <img 
                        src={resource.author_avatar} 
                        alt={resource.author_name || 'Anonymous'} 
                        className="w-5 h-5 rounded-full border border-[#2ecc71]/30 mr-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).className = "hidden";
                        }}
                      />
                    ) : (
                      <User className="h-4 w-4 mr-2 text-[#2ecc71]" />
                    )}
                    <span className="text-[#2ecc71] font-medium">@{resource.author_name || 'Anonymous'}</span>
                  </span>
                  <span className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-gray-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource content */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#2ecc71] mb-3">About this resource</h2>
                <p className="text-gray-300 leading-relaxed">{resource.description}</p>
              </div>

              {/* Author section */}
              <div className="mb-6 p-4 bg-black/30 border border-[#2ecc71]/10 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Shared by</h3>
                <div className="flex items-center">
                  <div className="mr-3">
                    {resource.author_avatar ? (
                      <img 
                        src={resource.author_avatar} 
                        alt={resource.author_name || 'Anonymous'} 
                        className="w-10 h-10 rounded-full border-2 border-[#2ecc71]/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#2ecc71]/10 border border-[#2ecc71]/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#2ecc71]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[#2ecc71] font-medium">@{resource.author_name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">Shared on {new Date(resource.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleUpvote}
                    disabled={upvoteLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isUpvoted 
                        ? "bg-[#2ecc71]/30 text-[#2ecc71]" 
                        : "bg-black/50 text-gray-300 hover:bg-[#2ecc71]/10 hover:text-[#2ecc71]"
                    } ${upvoteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isUpvoted ? "fill-[#2ecc71]" : ""}`} />
                    <span>{resource.upvotes_count || 0} Upvotes</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 py-1 px-3 bg-transparent border border-[#2ecc71]/30 rounded-full hover:bg-[#2ecc71]/10 transition-colors text-sm"
                    >
                      <Share className="h-4 w-4 text-[#2ecc71]" />
                      <span className="text-white">Share</span>
                    </button>
                    
                    {showCopiedTooltip && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#2ecc71] text-black px-3 py-1 rounded text-xs">
                        URL Copied!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#2ecc71] rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <button 
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 border border-gray-800 hover:text-red-400 hover:border-red-900/30 transition-all duration-300"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </button>
                </div>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation to resource detail page
                    console.log("Visiting external resource URL:", resource.url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] text-black rounded-md font-medium hover:bg-[#2ecc71]/90 transition-all duration-300"
                >
                  Visit Resource
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Use ResourceComments Component */}
              <ResourceComments 
                resourceId={params.id}
                comments={comments}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </motion.div>

          {/* Related Resources */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResources.length > 0 ? (
                relatedResources.map(related => (
                  <div key={related.id} className="block">
                    <div 
                      className="bg-black/70 border border-[#2ecc71]/20 rounded-lg overflow-hidden hover:border-[#2ecc71]/50 transition-all duration-300 h-full flex flex-col cursor-pointer"
                      onClick={() => router.push(`/resources/${related.id}`)}
                    >
                      <div className="relative h-32 w-full">
                        <Image
                          src={related.image_url || "/placeholder.jpg"}
                          alt={related.title || "Related resource"}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            console.log("Error loading related resource image, using fallback");
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white mb-2 line-clamp-2">{related.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {Array.isArray(related.tags) && related.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-[#2ecc71]">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No related resources found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
