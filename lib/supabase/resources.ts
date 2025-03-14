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
    for (const tagName of resourceData.tags) {
      try {
        // Check if tag exists
        const { data: existingTag, error: tagQueryError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName.toLowerCase())
          .single();

        if (tagQueryError && tagQueryError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error checking tag existence:', tagQueryError);
          throw tagQueryError;
        }

        let tagId;
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName.toLowerCase() })
            .select()
            .single();
            
          if (tagError) {
            console.error('Error creating tag:', tagError);
            throw tagError;
          }
          tagId = newTag.id;
        }

        // 3. Create resource-tag association
        const { error: resourceTagError } = await supabase
          .from('resource_tags')
          .insert({
            resource_id: resource.id,
            tag_id: tagId
          });

        if (resourceTagError) {
          console.error('Error associating tag with resource:', resourceTagError);
          throw resourceTagError;
        }
      } catch (tagProcessingError) {
        console.error('Error processing tag:', tagName, tagProcessingError);
        // Continue with other tags instead of failing completely
      }
    }

    return { success: true, resource };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred while creating the resource'
    };
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
    const { data, error } = await supabase
      .rpc('toggle_upvote', {
        resource_id_param: resourceId,
        user_id_param: userId
      });
      
    if (error) throw error;
    return { success: true, isUpvoted: data };
  } catch (error) {
    console.error('Error toggling upvote:', error);
    return { success: false, error };
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