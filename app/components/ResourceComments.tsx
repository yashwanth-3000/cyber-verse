import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/supabase/use-session";
import { useRouter } from "next/navigation";
import { addComment } from "@/lib/supabase/resources";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  author_avatar?: string | null;
}

interface ResourceCommentsProps {
  resourceId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
}

export default function ResourceComments({
  resourceId,
  comments,
  onCommentAdded
}: ResourceCommentsProps) {
  const { session } = useSession();
  const router = useRouter();
  
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      // If not logged in, redirect to login
      router.push(`/login?next=/resources/${resourceId}`);
      return;
    }
    
    if (!comment.trim()) {
      // Don't submit empty comments
      return;
    }
    
    if (isSubmittingComment) {
      // Prevent multiple submissions
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const { success, comment: newComment, error } = await addComment(
        resourceId,
        session.user.id,
        comment.trim()
      );
      
      if (success && newComment) {
        // Notify parent component about the new comment
        onCommentAdded(newComment);
        
        // Clear the comment input
        setComment('');
      } else {
        console.error('Failed to submit comment:', error);
        alert(`Failed to submit comment: ${error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
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
              disabled={isSubmittingComment || !session || !comment.trim()}
              className={`bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71]/30 ${
                isSubmittingComment || !session || !comment.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmittingComment ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-[#2ecc71] rounded-full animate-spin"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Comment"
              )}
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
  );
} 