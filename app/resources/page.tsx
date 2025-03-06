"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Tag, ExternalLink, ThumbsUp, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/supabase/use-session";
import { useRouter } from "next/navigation";
import { getResources, ResourceWithStats } from "@/lib/supabase/resources";

// Custom image component that handles errors
function ResourceImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  if (!src || imgError) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-800 text-white">
        <span className="text-sm font-mono">Image URL is empty</span>
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
      onError={() => setImgError(true)}
      unoptimized
    />
  );
}

export default function ResourcesPage() {
  const { session } = useSession();
  const router = useRouter();
  
  // Replace MOCK_RESOURCES with state for real data
  const [resources, setResources] = useState<ResourceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"latest" | "popular">("latest");

  // Fetch resources from Supabase
  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const { success, resources, error } = await getResources();
        if (success && resources) {
          setResources(resources);
        } else {
          console.error("Failed to fetch resources:", error);
          setError("Failed to load resources. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

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
    if (!session) {
      router.push("/login?next=/resources/add");
    } else {
      router.push("/resources/add");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header: Back to Home on left, Share Resource on right */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-col items-start">
              <Link
                href="/what-you-want-to-know"
                className="inline-flex items-center text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2ecc71] font-mono tracking-tight mt-2">
                Cybersecurity Resources
              </h1>
              <p className="text-gray-400 mt-2 font-mono">
                Discover and share valuable cybersecurity resources with the community
              </p>
            </div>
            <Button
              onClick={handleAddResource}
              className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] text-black rounded-md font-medium hover:bg-[#2ecc71]/90 transition-all duration-300 font-mono"
            >
              <Plus className="h-4 w-4" />
              Share Resource
            </Button>
          </div>

          {/* Filter Section */}
          <div className="mb-8 bg-black/70 backdrop-blur-md rounded-lg border-2 border-[#2ecc71]/20 p-4">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2ecc71]/60" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#2ecc71]/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all font-mono"
                />
              </div>

              {/* Always visible, centered filter tags */}
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
                <p className="text-gray-400 mb-4">No resources found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTags([]);
                  }}
                  className="bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              sortedResources.map((resource) => (
                <Link 
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  onClick={(e) => {
                    // Prevent navigation if clicking on the Access button
                    if ((e.target as HTMLElement).closest('.access-button')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-black/70 backdrop-blur-md rounded-lg border-2 border-[#2ecc71]/30 overflow-hidden hover:border-[#2ecc71]/70 transition-all duration-300 group shadow-lg shadow-[#2ecc71]/5 hover:shadow-[#2ecc71]/20 cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative h-48 w-full flex-shrink-0">
                      <ResourceImage src={resource.image_url} alt={resource.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                      {/* Terminal-style header bar */}
                      <div className="absolute top-0 left-0 right-0 bg-[#2ecc71]/10 border-b border-[#2ecc71]/30 px-4 py-1 flex justify-between items-center backdrop-blur-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.author_avatar ? (
                            <img 
                              src={resource.author_avatar} 
                              alt={resource.author_name || 'Anonymous'} 
                              className="w-4 h-4 rounded-full border border-[#2ecc71]/30"
                            />
                          ) : (
                            <User className="w-3 h-3 text-[#2ecc71]" />
                          )}
                          <span className="text-xs text-[#2ecc71] font-mono">
                            @{resource.author_name || 'anonymous'}
                          </span>
                        </div>
                      </div>

                      {/* Upvote count badge */}
                      <div className="absolute top-8 right-3 bg-black/80 border border-[#2ecc71]/40 px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                        <ThumbsUp className="h-3 w-3 text-[#2ecc71]" />
                        <span className="text-xs font-mono text-[#2ecc71]">
                          {resource.upvotes_count || 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.tags && resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-[#2ecc71]/10 text-[#2ecc71] rounded-full flex items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!selectedTags.includes(tag)) {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
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
                        <span className="text-xs text-gray-500">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="access-button bg-[#2ecc71]/20 hover:bg-[#2ecc71]/30 text-[#2ecc71] px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(resource.url, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Access
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
