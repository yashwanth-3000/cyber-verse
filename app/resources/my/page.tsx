"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Tag, ExternalLink, CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getUserResources, ResourceWithStats } from "@/lib/supabase/resources";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Custom image component that handles errors
function ResourceImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  
  if (!src || imgError) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black/70 text-gray-400">
        <span className="text-sm font-mono">Resource Image</span>
      </div>
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      onError={() => {
        console.log("Error loading my resource image");
        setImgError(true);
      }}
      unoptimized
    />
  );
}

export default function MyResourcesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [resources, setResources] = useState<ResourceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"latest" | "popular">("latest");

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/resources/my");
    }
  }, [user, authLoading, router]);

  // Update the useEffect for fetching user resources
  useEffect(() => {
    let isMounted = true;

    async function fetchUserResources() {
      if (!user) return;
      
      setLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        console.log("Fetching user resources for:", user.id);
        const { success, resources: fetchedResources, error: fetchError } = await getUserResources(user.id);
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (success && fetchedResources) {
            console.log(`Successfully loaded ${fetchedResources.length} user resources`);
            setResources(fetchedResources);
          } else {
            console.error("Failed to fetch user resources:", fetchError);
            setError(fetchError ? String(fetchError) : "Failed to load your resources. Please try again later.");
            setResources([]); // Set empty array to avoid undefined
          }
        }
      } catch (err) {
        console.error("Error fetching user resources:", err);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again later.");
          setResources([]); // Set empty array to avoid undefined
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (user) {
      fetchUserResources();
    }

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [user]); // Dependency on user ensures reload when user changes

  // Get all unique tags from resources
  const allTags = Array.from(
    new Set(resources.flatMap((resource) => resource.tags || []))
  ).sort();

  // Filter resources based on search query and selected tags
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => resource.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Sort resources based on sort option
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return (b.upvotes_count || 0) - (a.upvotes_count || 0);
    }
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddResource = () => {
    router.push("/resources/add");
  };

  // Update the refresh function to trigger auth refresh
  const handleRefresh = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get Supabase client and refresh the auth session first
      const supabase = createSupabaseBrowserClient();
      
      // This will trigger the "Auth state changed: INITIAL_SESSION" message
      await supabase.auth.refreshSession();
      console.log("Auth session refreshed");
      
      console.log("Manually refreshing user resources...");
      const { success, resources: fetchedResources, error: fetchError } = await getUserResources(user.id);
      
      if (success && fetchedResources) {
        console.log(`Successfully refreshed ${fetchedResources.length} user resources`);
        setResources(fetchedResources);
      } else {
        console.error("Failed to refresh user resources:", fetchError);
        setError(fetchError ? String(fetchError) : "Failed to refresh your resources. Please try again.");
        setResources([]);
      }
    } catch (err) {
      console.error("Error refreshing user resources:", err);
      setError("An unexpected error occurred while refreshing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header: Back to Home on left, Share Resource on right */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-col items-start">
              <Link
                href="/resources"
                className="inline-flex items-center text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Resources
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2ecc71] font-mono tracking-tight mt-2">
                My Shared Resources
              </h1>
              <p className="text-gray-400 mt-2 font-mono">
                Browse and manage the resources you've shared with the community
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-[#2ecc71]/30 text-[#2ecc71] rounded-md font-medium hover:bg-[#2ecc71]/10 transition-all duration-300 font-mono"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleAddResource}
                className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] text-black rounded-md font-medium hover:bg-[#2ecc71]/90 transition-all duration-300 font-mono"
              >
                <Plus className="h-4 w-4" />
                Share New Resource
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-8 bg-black/70 backdrop-blur-md rounded-lg border-2 border-[#2ecc71]/20 p-4">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2ecc71]/60" />
                <input
                  type="text"
                  placeholder="Search your resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#2ecc71]/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all font-mono"
                />
              </div>

              {/* Always visible, centered filter tags */}
              {allTags.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded-sm transition-all duration-300 font-mono ${
                          selectedTags.includes(tag)
                            ? "bg-[#2ecc71]/20 text-[#2ecc71] border border-[#2ecc71]/50"
                            : "bg-black/40 text-gray-400 border border-[#2ecc71]/10 hover:border-[#2ecc71]/30 hover:text-[#2ecc71]"
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors font-mono"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sort by control placed below filter tags */}
              <div className="flex items-center justify-center">
                <label className="mr-2 text-sm text-gray-400 font-mono">
                  Sort by:
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as "latest" | "popular")}
                  className="p-2 rounded-md bg-black/50 border border-[#2ecc71]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all font-mono"
                >
                  <option value="latest">
                    Latest
                  </option>
                  <option value="popular">
                    Popular
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-black/70 backdrop-blur-md rounded-lg border-2 border-[#2ecc71]/30 h-96 animate-pulse"
                />
              ))
            ) : error ? (
              <div className="col-span-full text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30"
                >
                  Try Again
                </Button>
              </div>
            ) : sortedResources.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-400 mb-4">
                  {selectedTags.length > 0 || searchQuery
                    ? "No resources found matching your criteria."
                    : "You haven't shared any resources yet."}
                </p>
                {selectedTags.length > 0 || searchQuery ? (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTags([]);
                    }}
                    className="bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30 mr-4"
                  >
                    Clear Filters
                  </Button>
                ) : null}
                <Button
                  onClick={handleAddResource}
                  className="bg-[#2ecc71] text-black hover:bg-[#2ecc71]/90"
                >
                  Share Your First Resource
                </Button>
              </div>
            ) : (
              sortedResources.map((resource) => (
                <div key={resource.id} className="block">
                  <div
                    className="bg-black/70 backdrop-blur-md rounded-lg border-2 border-[#2ecc71]/30 overflow-hidden hover:border-[#2ecc71]/70 transition-all duration-300 group shadow-lg shadow-[#2ecc71]/5 hover:shadow-[#2ecc71]/20 h-full flex flex-col cursor-pointer"
                    onClick={() => router.push(`/resources/${resource.id}`)}
                  >
                    <div className="relative h-48 w-full flex-shrink-0">
                      <ResourceImage src={resource.image_url} alt={resource.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(resource.tags) && resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-[#2ecc71]/10 text-[#2ecc71] rounded-full flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {resource.tags && resource.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-[#2ecc71]/10 text-[#2ecc71] rounded-full">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          className="access-button bg-[#2ecc71]/20 hover:bg-[#2ecc71]/30 text-[#2ecc71] px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(resource.url, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Access
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 