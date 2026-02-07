import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { demoPosts } from '@/lib/store';

export interface PostWithProfile {
  id: string;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: string;
  video_duration: number | null;
  category: string | null;
  is_eligible: boolean;
  eligible_amount: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    full_name: string;
  };
}

export function useFeedPosts() {
  return useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (postsError) throw postsError;
      
      // Get unique user IDs from posts
      const userIds = [...new Set((postsData || []).map(p => p.user_id))];
      
      // Fetch public profile data (excludes financial fields)
      let profilesMap: Record<string, { username: string; avatar_url: string | null; full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles_public')
          .select('user_id, username, full_name, avatar_url')
          .in('user_id', userIds);
        
        (profilesData || []).forEach((p: any) => {
          profilesMap[p.user_id] = { username: p.username, avatar_url: p.avatar_url, full_name: p.full_name };
        });
      }
      
      // Map posts with profile info
      const dbPosts: PostWithProfile[] = (postsData || []).map((post: any) => ({
        ...post,
        profile: profilesMap[post.user_id] || undefined,
      }));

      // Also include demo posts for the MVP to ensure content richness
      const demosAsPosts: PostWithProfile[] = demoPosts.map(dp => ({
        id: `demo-${dp.id}`,
        user_id: dp.creatorId,
        caption: dp.caption,
        media_url: dp.imageUrl,
        media_type: 'image',
        video_duration: null,
        category: dp.category,
        is_eligible: dp.eligibleAmount > 0,
        eligible_amount: dp.eligibleAmount,
        likes_count: dp.likes,
        comments_count: dp.comments.length,
        shares_count: dp.shares,
        views_count: dp.likes * 10,
        created_at: new Date().toISOString(),
        profile: {
          username: dp.creator,
          avatar_url: null,
          full_name: dp.creator,
        },
      }));

      return [...dbPosts, ...demosAsPosts];
    },
    staleTime: 30000,
  });
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PostWithProfile[];
    },
    enabled: !!userId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      caption: string;
      mediaFile: File;
      mediaType: 'image' | 'video';
      category: string;
      videoDuration?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Upload media file
      const fileExt = params.mediaFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, params.mediaFile);
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      // Create post record
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption: params.caption,
          media_url: urlData.publicUrl,
          media_type: params.mediaType,
          video_duration: params.videoDuration || null,
          category: params.category,
          is_eligible: false,
          eligible_amount: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      toast.success("Post created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create post");
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      if (params.isLiked) {
        await supabase.from('likes').delete()
          .eq('user_id', user.id)
          .eq('post_id', params.postId);
      } else {
        await supabase.from('likes').insert({
          user_id: user.id,
          post_id: params.postId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-likes'] });
    },
  });
}

export function useUserLikes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-likes', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);
      
      return new Set((data || []).map(l => l.post_id));
    },
    enabled: !!user,
  });
}

export function useEarnFromPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { postId: string; amount: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('process_earning', {
        p_user_id: user.id,
        p_post_id: params.postId,
        p_amount: params.amount,
      });
      
      if (error) throw error;
      return data; // boolean
    },
    onSuccess: (earned) => {
      if (earned) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });
}
