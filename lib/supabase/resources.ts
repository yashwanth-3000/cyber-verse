import { createSupabaseBrowserClient } from "./browser-client";
import { createSupabaseClientServer } from "./client-server";
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  user_id: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceWithStats extends Resource {
  author_name: string;
  author_avatar: string;
  upvotes_count: number;
  comments_count: number;
  tags: string[];
}

export interface ResourceInput {
  title: string;
  description: string;
  url: string;
  image_url: string;
  tags: string[];
}

// Tag interface to match the actual database schema
export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

// Client-side functions
export const createResource = async (resourceData: ResourceInput, userId: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    // Check if user is authenticated using the secure method
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError?.message);
      return { success: false, error: 'User not authenticated. Please log in again.' };
    }

    // Ensure the user profile exists
    const { success: profileSuccess, error: profileError } = await ensureProfileExists(userId);
    if (!profileSuccess) {
      return { success: false, error: profileError || 'Failed to ensure user profile exists' };
    }

    // 1. Insert the resource
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .insert({
        title: resourceData.title,
        description: resourceData.description,
        url: resourceData.url,
        image_url: resourceData.image_url,
        user_id: userId,
        published: true,
      })
      .select()
      .single();

    if (resourceError) {
      console.error('Error inserting resource:', resourceError);
      return { success: false, error: `Failed to create resource: ${resourceError.message}` };
    }

    // 2. Process tags - first check if they exist, create if they don't
    const processedTags = [];
    
    for (const tagName of resourceData.tags) {
      try {
        // Sanitize tag name to avoid URL encoding issues
        const sanitizedTagName = tagName.toLowerCase()
          .trim()
          // Replace special characters and spaces with hyphens
          .replace(/[^a-z0-9\s-]/g, '')
          // Replace multiple spaces with single space
          .replace(/\s+/g, ' ')
          // Replace spaces with hyphens
          .replace(/\s/g, '-')
          // Remove consecutive hyphens
          .replace(/-+/g, '-')
          // Limit length to 30 chars
          .substring(0, 30);
        
        // Skip empty tags
        if (!sanitizedTagName) {
          console.log('Skipping empty tag after sanitization');
          continue;
        }
        
        console.log(`Original tag: "${tagName}" → Sanitized: "${sanitizedTagName}"`);
        
        // Add the sanitized tag to our processed list
        processedTags.push(sanitizedTagName);
        
        try {
          // Check if tag exists
          const { data: existingTag, error: tagQueryError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', sanitizedTagName)
            .single();

          // Handle specific 406 Not Acceptable error
          if (tagQueryError && tagQueryError.code === '406') {
            console.log(`406 Not Acceptable error for tag "${sanitizedTagName}", creating a new tag instead`);
            
            // Create new tag directly without checking for existence
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: sanitizedTagName })
              .select()
              .single();
              
            if (tagError) {
              console.error('Error creating tag after 406 error:', tagError);
              continue; // Skip to next tag instead of throwing
            }
            
            // Create resource-tag association
            await createResourceTagAssociation(resource.id, newTag.id, supabase);
            continue;
          }

          // Handle other tag query errors except "no rows"
          if (tagQueryError && tagQueryError.code !== 'PGRST116') {
            console.error('Error checking tag existence:', tagQueryError);
            // Continue to next tag instead of throwing
            continue;
          }

          let tagId;
          
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: sanitizedTagName })
              .select()
              .single();
              
            if (tagError) {
              console.error('Error creating tag:', tagError);
              continue; // Skip to next tag instead of throwing
            }
            tagId = newTag.id;
          }

          // Create resource-tag association
          await createResourceTagAssociation(resource.id, tagId, supabase);
        } catch (innerError) {
          console.error(`Inner error processing tag "${sanitizedTagName}":`, innerError);
          // Continue with next tag instead of failing completely
        }
      } catch (tagProcessingError) {
        console.error('Error processing tag:', tagName, tagProcessingError);
        // Continue with other tags instead of failing completely
      }
    }

    console.log(`Successfully processed ${processedTags.length} tags out of ${resourceData.tags.length}`);
    return { success: true, resource };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred while creating the resource'
    };
  }
};

// Separate function to create resource-tag association
const createResourceTagAssociation = async (
  resourceId: string, 
  tagId: string, 
  supabase: ReturnType<typeof createSupabaseBrowserClient>
): Promise<boolean> => {
  try {
    const { error: resourceTagError } = await supabase
      .from('resource_tags')
      .insert({
        resource_id: resourceId,
        tag_id: tagId
      });

    if (resourceTagError) {
      console.error('Error associating tag with resource:', resourceTagError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in createResourceTagAssociation:', error);
    return false;
  }
};

// Get all resources with stats (published only)
export const getResources = async () => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('resources_with_stats')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { success: true, resources: data };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error };
  }
};

// Get a single resource with stats
export const getResourceById = async (id: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('resources_with_stats')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return { success: true, resource: data };
  } catch (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    return { success: false, error };
  }
};

// Toggle upvote on a resource
export const toggleUpvote = async (resourceId: string, userId: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    // First, verify that the user is logged in with a valid session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated for upvote:', userError?.message);
      return { 
        success: false, 
        error: 'User not authenticated. Please log in again.',
        isUpvoted: false
      };
    }
    
    // Ensure the user profile exists before proceeding
    const { success: profileSuccess, error: profileError } = await ensureProfileExists(userId);
    if (!profileSuccess) {
      console.error('Failed to ensure profile exists for upvote:', profileError);
      return { 
        success: false, 
        error: profileError || 'Failed to ensure user profile exists',
        isUpvoted: false 
      };
    }
    
    console.log('Toggling upvote for resource:', resourceId, 'by user:', userId);
    
    // Try to directly insert/delete from upvotes table as a fallback if RPC fails
    try {
      // First check if upvote exists
      const { data: existingUpvote, error: checkError } = await supabase
        .from('upvotes')
        .select('id')
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .single();
        
      let isUpvoted;
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Try the RPC method if there's an unexpected error
        const { data, error } = await supabase
          .rpc('toggle_upvote', {
            resource_id_param: resourceId,
            user_id_param: userId
          });
          
        if (error) throw error;
        return { success: true, isUpvoted: data };
      }
      
      // If upvote exists, remove it
      if (existingUpvote) {
        const { error: deleteError } = await supabase
          .from('upvotes')
          .delete()
          .eq('resource_id', resourceId)
          .eq('user_id', userId);
          
        if (deleteError) throw deleteError;
        isUpvoted = false;
      } 
      // If upvote doesn't exist, add it
      else {
        const { error: insertError } = await supabase
          .from('upvotes')
          .insert({ 
            resource_id: resourceId, 
            user_id: userId
          });
          
        if (insertError) throw insertError;
        isUpvoted = true;
      }
      
      return { success: true, isUpvoted };
    } catch (directError) {
      console.error('Error with direct upvote operation:', directError);
      
      // Final fallback: try the RPC method
      try {
        const { data, error } = await supabase
          .rpc('toggle_upvote', {
            resource_id_param: resourceId,
            user_id_param: userId
          });
          
        if (error) throw error;
        return { success: true, isUpvoted: data };
      } catch (rpcError) {
        console.error('Both direct and RPC upvote methods failed:', rpcError);
        throw rpcError;
      }
    }
  } catch (error) {
    console.error('Error toggling upvote:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      isUpvoted: false
    };
  }
};

// Get related resources
export const getRelatedResources = async (resourceId: string, limit = 3) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .rpc('get_related_resources', {
        resource_id_param: resourceId,
        limit_param: limit
      });
      
    if (error) throw error;
    return { success: true, resources: data };
  } catch (error) {
    console.error('Error fetching related resources:', error);
    return { success: false, error };
  }
};

// Get resources shared by a specific user
export const getUserResources = async (userId: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('resources_with_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { success: true, resources: data };
  } catch (error) {
    console.error('Error fetching user resources:', error);
    return { success: false, error };
  }
};

// Server-side functions
export const getResourcesServer = async () => {
  const supabase = createSupabaseClientServer();
  
  const { data, error } = await supabase
    .from('resources_with_stats')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
  
  return data;
};

export const getResourceByIdServer = async (id: string) => {
  const supabase = createSupabaseClientServer();
  
  const { data, error } = await supabase
    .from('resources_with_stats')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    return null;
  }
  
  return data;
};

// Helper function to ensure a user profile exists
export const ensureProfileExists = async (userId: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    // Check if the user profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // If profile doesn't exist, create it using the API endpoint
    if (profileError && profileError.code === 'PGRST116') { // PGRST116 is "no rows returned" error
      console.log('Profile not found, creating profile for user:', userId);
      
      // Call the API endpoint to create the profile
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating profile via API:', errorData);
        return { success: false, error: errorData.message || 'Failed to create profile' };
      }
      
      const result = await response.json();
      return { success: true, created: result.created };
    } else if (profileError) {
      console.error('Error checking profile:', profileError);
      return { success: false, error: `Error checking user profile: ${profileError.message}` };
    }
    
    return { success: true, created: false };
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

// Add a comment to a resource
export const addComment = async (resourceId: string, userId: string, content: string) => {
  const supabase = createSupabaseBrowserClient();
  
  try {
    // First, verify that the user is logged in with a valid session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated for comment:', userError?.message);
      return { 
        success: false, 
        error: 'User not authenticated. Please log in again.' 
      };
    }
    
    // Ensure the user profile exists before proceeding
    const { success: profileSuccess, error: profileError } = await ensureProfileExists(userId);
    if (!profileSuccess) {
      console.error('Failed to ensure profile exists for comment:', profileError);
      return { 
        success: false, 
        error: profileError || 'Failed to ensure user profile exists' 
      };
    }
    
    console.log('Adding comment to resource:', resourceId, 'by user:', userId);
    
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        resource_id: resourceId,
        user_id: userId,
        content
      })
      .select('*, profiles(full_name, avatar_url)')
      .single();
      
    if (commentError) {
      console.error('Error adding comment:', commentError);
      return { success: false, error: commentError.message };
    }
    
    return { 
      success: true, 
      comment: {
        id: comment.id,
        content: comment.content,
        author: comment.profiles?.full_name || 'Anonymous',
        author_avatar: comment.profiles?.avatar_url,
        date: new Date(comment.created_at).toISOString().split('T')[0]
      } 
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Get comments for a resource
export const getResourceComments = async (resourceId: string) => {
  const supabase = createSupabaseBrowserClient();
  
  interface CommentData {
    id: string;
    content: string;
    created_at: string;
    author_name?: string;
    author_avatar?: string;
    profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    };
  }
  
  interface FormattedComment {
    id: string;
    content: string;
    author: string;
    author_avatar?: string | null;
    date: string;
  }
  
  try {
    // We can try the RPC function first
    let success = false;
    let comments: CommentData[] = [];
    
    try {
      // Try to use the RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_resource_comments', {
          resource_id_param: resourceId
        });
        
      if (!rpcError && rpcData) {
        success = true;
        comments = rpcData as CommentData[];
      }
    } catch (rpcError) {
      console.error('RPC get_resource_comments failed, falling back to direct query:', rpcError);
    }
    
    // Fallback to direct query if RPC failed
    if (!success) {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match the expected format
      comments = data.map((item: any) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        author_name: item.profiles.full_name || 'Anonymous',
        author_avatar: item.profiles.avatar_url
      }));
    }
    
    return { 
      success: true, 
      comments: comments.map((comment: CommentData): FormattedComment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author_name || 'Anonymous',
        author_avatar: comment.author_avatar,
        date: new Date(comment.created_at).toISOString().split('T')[0]
      }))
    };
  } catch (error) {
    console.error('Error fetching resource comments:', error);
    return { success: false, error, comments: [] };
  }
}; 