"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon, Tag, Plus, X, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/supabase/use-session";
import { useRouter } from "next/navigation";
import { createResource, ResourceInput } from "@/lib/supabase/resources";

// Common cybersecurity tags for suggestions
const SUGGESTED_TAGS = [
  "web security",
  "network security",
  "cryptography",
  "penetration testing",
  "ethical hacking",
  "malware analysis",
  "cloud security",
  "mobile security",
  "IoT security",
  "OSINT",
  "forensics",
  "CTF",
  "tools",
  "education",
  "best practices",
  "vulnerabilities",
  "threat intelligence",
  "incident response",
  "privacy",
  "authentication",
];

export default function AddResourcePage() {
  const { session, loading } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    imageUrl: "",
    tags: [] as string[],
  });

  const [customTag, setCustomTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login?next=/resources/add");
    }
  }, [session, loading, router]);

  // Generate preview URL from the provided image URL
  useEffect(() => {
    if (formData.imageUrl) {
      try {
        new URL(formData.imageUrl);
        setPreviewUrl(formData.imageUrl);
      } catch (e) {
        setPreviewUrl("");
      }
    } else {
      setPreviewUrl("");
    }
  }, [formData.imageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim().toLowerCase();
    if (formData.tags.includes(normalizedTag)) return;
    if (formData.tags.length >= 5) return; // Limit to 5 tags
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, normalizedTag],
    }));
    setCustomTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 300) {
      newErrors.description = "Description must be less than 300 characters";
    }
    if (!formData.url.trim()) {
      newErrors.url = "Resource URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch (e) {
        newErrors.url = "Please enter a valid Resource URL";
      }
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    } else {
      try {
        new URL(formData.imageUrl);
      } catch (e) {
        newErrors.imageUrl = "Please enter a valid Image URL";
      }
    }
    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    if (!session?.user) {
      setSubmitStatus("error");
      setErrors({ form: "You must be logged in to submit a resource" });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const resourceData: ResourceInput = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        image_url: formData.imageUrl,
        tags: formData.tags,
      };
      
      const { success, error } = await createResource(resourceData, session.user.id);
      
      if (success) {
        setSubmitStatus("success");
        // Redirect after successful submission
        setTimeout(() => {
          router.push("/resources");
        }, 2000);
      } else {
        console.error("Error submitting resource:", error);
        setSubmitStatus("error");
        setErrors({ form: error || "Failed to create resource. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting resource:", error);
      setSubmitStatus("error");
      setErrors({ form: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-[#2ecc71] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/resources"
            className="inline-flex items-center text-[#2ecc71] hover:text-[#2ecc71]/80 transition-colors mb-8 font-mono"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-md rounded-lg border border-[#2ecc71]/20 p-6 md:p-8"
          >
            {/* Terminal-style header bar */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-[#2ecc71] font-mono">share-resource@terminal</span>
            </div>

            <h1 className="text-3xl font-bold text-[#2ecc71] mb-6 font-mono">
              Share a Cybersecurity Resource
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Form error message */}
              {errors.form && (
                <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-md flex items-start mb-4">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{errors.form}</p>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#2ecc71] mb-1">
                  Resource Title <span className="text-[#2ecc71]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-black/50 border ${
                    errors.title ? "border-red-500" : "border-[#2ecc71]/20"
                  } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all`}
                  placeholder="E.g., OWASP Top 10 Web Application Security Risks"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Resource URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-[#2ecc71] mb-1">
                  Resource URL <span className="text-[#2ecc71]">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2ecc71]" />
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 bg-black/50 border ${
                      errors.url ? "border-red-500" : "border-[#2ecc71]/20"
                    } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all`}
                    placeholder="https://example.com/resource"
                  />
                </div>
                {errors.url && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.url}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-[#2ecc71] mb-1">
                  Image URL <span className="text-[#2ecc71]">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2ecc71]" />
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 bg-black/50 border ${
                      errors.imageUrl ? "border-red-500" : "border-[#2ecc71]/20"
                    } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all`}
                    placeholder="https://example.com/image.png"
                  />
                </div>
                {errors.imageUrl && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.imageUrl}
                  </p>
                )}

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-2 p-2 bg-black/30 rounded-md border border-[#2ecc71]/10">
                    <p className="text-xs text-gray-400 mb-1 font-mono">Image Preview</p>
                    <div className="relative h-20 w-full rounded-md overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }}
                      />
                      {!previewUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                          <span className="text-sm font-mono">Image URL is empty</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#2ecc71] mb-1">
                  Description <span className="text-[#2ecc71]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 bg-black/50 border ${
                    errors.description ? "border-red-500" : "border-[#2ecc71]/20"
                  } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all resize-none`}
                  placeholder="Briefly describe what this resource is about and why it's valuable"
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {formData.description.length}/300 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-[#2ecc71] mb-1">
                  Tags <span className="text-[#2ecc71]">*</span> <span className="text-xs text-gray-500">(max 5)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-[#2ecc71]/20 text-[#2ecc71] rounded-full"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-[#2ecc71] hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2ecc71]" />
                    <input
                      type="text"
                      id="customTag"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(customTag);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2 bg-black/50 border ${
                        errors.tags ? "border-red-500" : "border-[#2ecc71]/20"
                      } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]/50 transition-all`}
                      placeholder="Add a tag"
                      disabled={formData.tags.length >= 5}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addTag(customTag)}
                    disabled={!customTag.trim() || formData.tags.length >= 5}
                    className="px-4 py-2 bg-[#2ecc71]/20 text-[#2ecc71] rounded-md hover:bg-[#2ecc71]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.tags}
                  </p>
                )}
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.filter((tag) => !formData.tags.includes(tag))
                      .slice(0, 10)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.length >= 5}
                          className="px-2 py-1 text-xs bg-black/30 text-gray-400 rounded-full border border-gray-800 hover:border-[#2ecc71]/30 hover:text-[#2ecc71] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                    submitStatus === "success"
                      ? "bg-green-600 text-white"
                      : submitStatus === "error"
                      ? "bg-red-600 text-white"
                      : "bg-[#2ecc71] text-black hover:bg-[#2ecc71]/90"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin mr-2"></span>
                      Submitting...
                    </span>
                  ) : submitStatus === "success" ? (
                    <span className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Resource Shared Successfully!
                    </span>
                  ) : submitStatus === "error" ? (
                    <span className="flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Error Sharing Resource
                    </span>
                  ) : (
                    "Share Resource"
                  )}
                </Button>
                {submitStatus === "error" && (
                  <p className="mt-2 text-sm text-red-500 text-center">
                    There was an error sharing your resource. Please try again.
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
