"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, ExternalLink, ThumbsUp, Share2, Tag, 
  Calendar, User, MessageSquare, Flag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/supabase/use-session";
import { useRouter } from "next/navigation";
import { getResourceById, getRelatedResources, toggleUpvote, ResourceWithStats } from "@/lib/supabase/resources";

// Mock comments for now - will be replaced with actual comments from Supabase later
interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

const MOCK_COMMENTS: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      author: "webdev123",
      content: "This resource has been incredibly helpful for my team. We've integrated these principles into our development workflow.",
      date: "2023-12-05",
    },
    {
      id: "c2",
      author: "securitynewbie",
      content: "As someone new to web security, this was a perfect starting point. Clear explanations and practical examples.",
      date: "2024-01-10",
    },
  ],
  "2": [
    {
      id: "c3",
      author: "coder42",
      content: "This book strikes the perfect balance between theory and practice. The code examples are particularly useful.",
      date: "2023-12-20",
    },
  ],
  "3": [
    {
      id: "c4",
      author: "security_student",
      content: "This repository has been my go-to resource for finding new tools and techniques. Highly recommended!",
      date: "2023-11-05",
    },
    {
      id: "c5",
      author: "pentester",
      content: "I've discovered several tools here that have become essential parts of my workflow. Great curation!",
      date: "2024-01-15",
    },
    {
      id: "c6",
      author: "cybersec_prof",
      content: "I recommend this to all my students as a starting point for their practical exercises.",
      date: "2024-02-01",
    },
  ],
};

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  
  const [resource, setResource] = useState<ResourceWithStats | null>(null);
  const [relatedResources, setRelatedResources] = useState<ResourceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch resource data
  useEffect(() => {
    async function fetchResourceData() {
      setLoading(true);
      try {
        // Fetch the resource
        const { success, resource, error } = await getResourceById(params.id);
        
        if (success && resource) {
          setResource(resource);
          
          // Fetch related resources
          const { success: relatedSuccess, resources: relatedData } = 
            await getRelatedResources(params.id, 3);
            
          if (relatedSuccess && relatedData) {
            setRelatedResources(relatedData);
          }
          
          // Set mock comments for now
          setComments(MOCK_COMMENTS[params.id] || []);
        } else {
          console.error("Failed to fetch resource:", error);
          setError("Resource not found or could not be loaded.");
        }
      } catch (err) {
        console.error("Error fetching resource:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchResourceData();
    }
  }, [params.id]);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !comment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new comment to the local state
      const newComment: Comment = {
        id: `temp-${Date.now()}`,
        author: session.user?.email?.split('@')[0] || 'anonymous',
        content: comment,
        date: new Date().toISOString().split('T')[0],
      };
      
      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
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
          <Link
            href="/resources"
            className="inline-flex items-center text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>

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
                src={resource.image_url}
                alt={resource.title}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{resource.title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {resource.tags && resource.tags.map(tag => (
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
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 border border-gray-800 hover:text-[#2ecc71] hover:border-[#2ecc71]/30 transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] text-black rounded-md font-medium hover:bg-[#2ecc71]/90 transition-all duration-300"
                >
                  Visit Resource
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Comments Section */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Comments ({comments.length})</span>
                  </div>
                </h2>
                
                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-black/50 border border-[#2ecc71]/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#2ecc71]/20 flex items-center justify-center text-[#2ecc71] font-bold mr-3">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{comment.author}</div>
                              <div className="text-xs text-gray-400">{comment.date}</div>
                            </div>
                          </div>
                          <button className="text-gray-500 hover:text-[#2ecc71]">
                            <Flag className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-black/30 rounded-lg border border-[#2ecc71]/10">
                    <p className="text-gray-400 mb-4">No comments yet</p>
                    <p className="text-sm text-gray-500">Be the first to share your thoughts on this resource</p>
                  </div>
                )}
                
                {/* Comment Form */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Add a Comment</h3>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this resource..."
                      className="w-full p-3 bg-black/50 border border-[#2ecc71]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 focus:border-transparent min-h-[120px]"
                      required
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingComment || !session}
                        className={`bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30 ${
                          isSubmittingComment ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                      </Button>
                    </div>
                    {!session && (
                      <p className="text-sm text-yellow-500 mt-2">
                        You must be logged in to comment. <Link href="/login" className="underline">Log in</Link>
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Related Resources */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResources.length > 0 ? (
                relatedResources.map(related => (
                  <Link key={related.id} href={`/resources/${related.id}`}>
                    <div className="bg-black/70 border border-[#2ecc71]/20 rounded-lg overflow-hidden hover:border-[#2ecc71]/50 transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-32 w-full">
                        <Image
                          src={related.image_url}
                          alt={related.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white mb-2 line-clamp-2">{related.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {related.tags && related.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-[#2ecc71]">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
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
