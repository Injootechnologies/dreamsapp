// Dream$ State Management - Beta Testing Platform
// NEW: Earn ONLY from watching 100% of MONETIZED videos
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  university?: string;
  createdAt: Date;
  profilePhoto?: string;
  followers: number;
  following: number;
  totalViews: number;
  isAdmin?: boolean;
}

export interface Video {
  id: string;
  creator: string;
  creatorId: string;
  creatorAvatar?: string;
  caption: string;
  likes: number;
  comments: Comment[];
  saves: number;
  shares: number;
  views: number;
  videoUrl: string;
  thumbnail: string;
  category: 'foryou' | 'following' | 'explore';
  createdAt: Date;
  isMonetized: boolean; // CRITICAL: Only monetized videos earn
  rewardAmount: number; // Amount earned for 100% watch
  duration: number; // Video duration in seconds
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
  likes: number;
}

export interface EarningActivity {
  id: string;
  type: 'watch';
  amount: number;
  description: string;
  videoId: string;
  timestamp: Date;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bank: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  createdAt: Date;
  processedAt?: Date;
  userId: string;
  username: string;
}

export interface Notification {
  id: string;
  type: 'withdrawal_status' | 'earning' | 'admin' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface DreamStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  
  // Earnings (ZERO STATE for new users)
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  earningHistory: EarningActivity[];
  
  // Interactions (NO earnings from these!)
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  
  // Video watch progress tracking
  watchedVideos: Set<string>; // Fully watched (100%)
  videoWatchProgress: Map<string, number>; // Progress 0-100
  earnedFromVideos: Set<string>; // Videos already earned from (prevent replay farming)
  
  // Comments per video
  videoComments: Map<string, Comment[]>;
  
  // Withdrawals
  withdrawalHistory: WithdrawalRequest[];
  
  // Content
  contentCount: number;
  userVideos: Video[];
  
  // Notifications
  notifications: Notification[];
  
  // Admin data
  allUsers: User[];
  allWithdrawals: WithdrawalRequest[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Earning action (ONLY from watching monetized videos)
  earnFromVideo: (videoId: string, amount: number, description: string) => void;
  
  // Video watch tracking
  updateWatchProgress: (videoId: string, progress: number) => void;
  markVideoFullyWatched: (videoId: string, video: Video) => boolean;
  
  // Interactions (NO earnings)
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  addComment: (videoId: string, text: string) => void;
  getVideoComments: (videoId: string) => Comment[];
  
  // Content
  uploadVideo: (video: Video) => void;
  
  // Withdrawal
  requestWithdrawal: (amount: number, bank: string, accountNumber: string, accountName: string) => void;
  
  // Admin actions
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  // Reset for new users
  resetToZeroState: () => void;
}

// Convert Set to Array for persistence
const setToArray = (set: Set<string>): string[] => Array.from(set);
const arrayToSet = (arr: string[]): Set<string> => new Set(arr);
const mapToArray = (map: Map<string, any>): [string, any][] => Array.from(map.entries());
const arrayToMap = <T>(arr: [string, T][]): Map<string, T> => new Map(arr);

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      // Initial ZERO state for new users
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      availableBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      earningHistory: [],
      withdrawalHistory: [],
      contentCount: 0,
      userVideos: [],
      likedVideos: new Set(),
      savedVideos: new Set(),
      watchedVideos: new Set(),
      earnedFromVideos: new Set(),
      videoWatchProgress: new Map(),
      videoComments: new Map(),
      notifications: [],
      allUsers: [],
      allWithdrawals: [],
      
      // Actions
      login: (user) => {
        const state = get();
        const existingUser = state.allUsers.find(u => u.id === user.id);
        if (!existingUser) {
          set({ 
            user, 
            isAuthenticated: true,
            allUsers: [...state.allUsers, user]
          });
        } else {
          set({ user, isAuthenticated: true });
        }
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        hasCompletedOnboarding: false 
      }),
      
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      updateProfile: (updates) => {
        const state = get();
        if (state.user) {
          set({ user: { ...state.user, ...updates } });
        }
      },
      
      resetToZeroState: () => set({
        availableBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        earningHistory: [],
        likedVideos: new Set(),
        savedVideos: new Set(),
        watchedVideos: new Set(),
        earnedFromVideos: new Set(),
        videoWatchProgress: new Map(),
        videoComments: new Map(),
        userVideos: [],
        contentCount: 0,
      }),
      
      // ONLY way to earn: Watch 100% of monetized video
      earnFromVideo: (videoId, amount, description) => {
        const state = get();
        
        // Check if already earned from this video
        if (state.earnedFromVideos.has(videoId)) {
          return; // No replay farming
        }
        
        const newActivity: EarningActivity = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'watch',
          amount,
          description,
          videoId,
          timestamp: new Date(),
        };
        
        const newEarned = new Set(state.earnedFromVideos);
        newEarned.add(videoId);
        
        set({
          availableBalance: state.availableBalance + amount,
          totalEarned: state.totalEarned + amount,
          earningHistory: [newActivity, ...state.earningHistory].slice(0, 100),
          earnedFromVideos: newEarned,
        });
        
        // Add notification
        state.addNotification({
          type: 'earning',
          title: 'Reward Earned! 🎉',
          message: `You earned ₦${amount} for watching a sponsored video`,
        });
      },
      
      updateWatchProgress: (videoId, progress) => {
        const state = get();
        const newProgress = new Map(state.videoWatchProgress);
        newProgress.set(videoId, progress);
        set({ videoWatchProgress: newProgress });
      },
      
      markVideoFullyWatched: (videoId, video) => {
        const state = get();
        const newWatched = new Set(state.watchedVideos);
        
        if (!newWatched.has(videoId)) {
          newWatched.add(videoId);
          set({ watchedVideos: newWatched });
          
          // Only earn if monetized and not already earned
          if (video.isMonetized && !state.earnedFromVideos.has(videoId)) {
            state.earnFromVideo(videoId, video.rewardAmount, `Watched "${video.caption.slice(0, 30)}..."`);
            return true;
          }
        }
        return false;
      },
      
      // Interaction actions - NO EARNINGS
      toggleLike: (videoId) => {
        const state = get();
        const newLiked = new Set(state.likedVideos);
        
        if (newLiked.has(videoId)) {
          newLiked.delete(videoId);
        } else {
          newLiked.add(videoId);
        }
        
        set({ likedVideos: newLiked });
        // NO earnings!
      },
      
      toggleSave: (videoId) => {
        const state = get();
        const newSaved = new Set(state.savedVideos);
        
        if (newSaved.has(videoId)) {
          newSaved.delete(videoId);
        } else {
          newSaved.add(videoId);
        }
        
        set({ savedVideos: newSaved });
        // NO earnings!
      },
      
      addComment: (videoId, text) => {
        const state = get();
        const newComments = new Map(state.videoComments);
        const existing = newComments.get(videoId) || [];
        
        const newComment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: state.user?.id || 'anonymous',
          username: state.user?.username || 'Anonymous',
          text,
          createdAt: new Date(),
          likes: 0,
        };
        
        newComments.set(videoId, [...existing, newComment]);
        set({ videoComments: newComments });
        // NO earnings!
      },
      
      getVideoComments: (videoId) => {
        const state = get();
        return state.videoComments.get(videoId) || [];
      },
      
      uploadVideo: (video) => {
        const state = get();
        set({
          userVideos: [video, ...state.userVideos],
          contentCount: state.contentCount + 1,
        });
        // NO earnings for posting!
      },
      
      requestWithdrawal: (amount, bank, accountNumber, accountName) => {
        const state = get();
        if (amount > state.availableBalance) return;
        
        const withdrawal: WithdrawalRequest = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          bank,
          accountNumber,
          accountName,
          status: 'pending',
          createdAt: new Date(),
          userId: state.user?.id || 'unknown',
          username: state.user?.username || 'Unknown User',
        };
        
        state.addNotification({
          type: 'admin',
          title: 'New Withdrawal Request',
          message: `${state.user?.username} requested ₦${amount.toLocaleString()}`,
        });
        
        set({
          availableBalance: state.availableBalance - amount,
          totalWithdrawn: state.totalWithdrawn + amount,
          withdrawalHistory: [withdrawal, ...state.withdrawalHistory],
          allWithdrawals: [withdrawal, ...state.allWithdrawals],
        });
      },
      
      approveWithdrawal: (withdrawalId) => {
        const state = get();
        const updatedWithdrawals = state.allWithdrawals.map(w => 
          w.id === withdrawalId 
            ? { ...w, status: 'approved' as const, processedAt: new Date() }
            : w
        );
        
        const withdrawal = state.allWithdrawals.find(w => w.id === withdrawalId);
        if (withdrawal) {
          state.addNotification({
            type: 'withdrawal_status',
            title: 'Withdrawal Approved',
            message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been approved!`,
          });
        }
        
        set({ 
          allWithdrawals: updatedWithdrawals,
          withdrawalHistory: updatedWithdrawals.filter(w => w.userId === state.user?.id),
        });
      },
      
      rejectWithdrawal: (withdrawalId) => {
        const state = get();
        const withdrawal = state.allWithdrawals.find(w => w.id === withdrawalId);
        
        const updatedWithdrawals = state.allWithdrawals.map(w => 
          w.id === withdrawalId 
            ? { ...w, status: 'rejected' as const, processedAt: new Date() }
            : w
        );
        
        // Refund the amount
        if (withdrawal && withdrawal.userId === state.user?.id) {
          set({
            availableBalance: state.availableBalance + withdrawal.amount,
            totalWithdrawn: state.totalWithdrawn - withdrawal.amount,
          });
        }
        
        state.addNotification({
          type: 'withdrawal_status',
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request has been rejected. Amount refunded.`,
        });
        
        set({ 
          allWithdrawals: updatedWithdrawals,
          withdrawalHistory: updatedWithdrawals.filter(w => w.userId === state.user?.id),
        });
      },
      
      addNotification: (notification) => {
        const state = get();
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          read: false,
          createdAt: new Date(),
        };
        set({ notifications: [newNotification, ...state.notifications].slice(0, 50) });
      },
      
      markNotificationRead: (notificationId) => {
        const state = get();
        set({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        });
      },
      
      markAllNotificationsRead: () => {
        const state = get();
        set({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        });
      },
    }),
    {
      name: 'dream-storage-v2',
      partialize: (state) => ({
        ...state,
        likedVideos: setToArray(state.likedVideos),
        savedVideos: setToArray(state.savedVideos),
        watchedVideos: setToArray(state.watchedVideos),
        earnedFromVideos: setToArray(state.earnedFromVideos),
        videoWatchProgress: mapToArray(state.videoWatchProgress),
        videoComments: mapToArray(state.videoComments),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        likedVideos: arrayToSet(persistedState?.likedVideos || []),
        savedVideos: arrayToSet(persistedState?.savedVideos || []),
        watchedVideos: arrayToSet(persistedState?.watchedVideos || []),
        earnedFromVideos: arrayToSet(persistedState?.earnedFromVideos || []),
        videoWatchProgress: arrayToMap(persistedState?.videoWatchProgress || []),
        videoComments: arrayToMap(persistedState?.videoComments || []),
      }),
    }
  )
);

// 30+ Demo videos with monetization status
export const demoVideos: Video[] = [
  // FOR YOU - Mix of monetized and non-monetized
  {
    id: 'fy1',
    creator: 'chioma_vibes',
    creatorId: 'u1',
    creatorAvatar: 'CV',
    caption: 'Lagos nightlife hits different 🌃✨ #lagos #vibes',
    likes: 12400,
    comments: [],
    saves: 892,
    shares: 234,
    views: 45000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-sunset-1094-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 25,
    duration: 12,
  },
  {
    id: 'fy2',
    creator: 'tech_adebayo',
    creatorId: 'u2',
    creatorAvatar: 'TA',
    caption: 'How I made my first ₦100k online 💰 Watch till the end!',
    likes: 45200,
    comments: [],
    saves: 3241,
    shares: 1203,
    views: 120000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4823-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 15,
  },
  {
    id: 'fy3',
    creator: 'amaka_cooks',
    creatorId: 'u3',
    creatorAvatar: 'AC',
    caption: 'Jollof rice recipe that slaps 🍚🔥 #foodie #nigerian',
    likes: 8900,
    comments: [],
    saves: 567,
    shares: 189,
    views: 32000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-plate-in-a-kitchen-8402-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 20,
    duration: 18,
  },
  {
    id: 'fy4',
    creator: 'dance_king_ng',
    creatorId: 'u4',
    creatorAvatar: 'DK',
    caption: 'New Afrobeats challenge 🕺💥 Can you do this? #dance',
    likes: 67800,
    comments: [],
    saves: 4521,
    shares: 2341,
    views: 230000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-people-dancing-at-a-party-4637-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 10,
  },
  {
    id: 'fy5',
    creator: 'unilag_babe',
    creatorId: 'u5',
    creatorAvatar: 'UB',
    caption: 'Day in my life as a final year student 📚✨ #student',
    likes: 5600,
    comments: [],
    saves: 234,
    shares: 89,
    views: 18000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-typing-on-a-laptop-in-a-library-42386-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 15,
    duration: 20,
  },
  {
    id: 'fy6',
    creator: 'naija_comedy_king',
    creatorId: 'u20',
    creatorAvatar: 'NC',
    caption: 'When your mama catches you sneaking out 😂💀',
    likes: 156000,
    comments: [],
    saves: 12000,
    shares: 8500,
    views: 890000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-a-christmas-tree-4808-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 30,
    duration: 14,
  },
  {
    id: 'fy7',
    creator: 'lagos_traffic_tales',
    creatorId: 'u21',
    creatorAvatar: 'LT',
    caption: 'Third Mainland at 6am vs 6pm 🚗😩 #lagos #traffic',
    likes: 34000,
    comments: [],
    saves: 1200,
    shares: 890,
    views: 120000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-the-city-at-night-4365-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 16,
  },
  {
    id: 'fy8',
    creator: 'makeup_by_funke',
    creatorId: 'u22',
    creatorAvatar: 'MF',
    caption: 'Wedding guest look under ₦5k 💄✨ #makeup #budget',
    likes: 28000,
    comments: [],
    saves: 5600,
    shares: 1200,
    views: 95000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-at-a-beach-1203-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 20,
    duration: 22,
  },
  {
    id: 'fy9',
    creator: 'fit_naija_boy',
    creatorId: 'u23',
    creatorAvatar: 'FN',
    caption: 'No gym? No problem 💪🏾 Home workout routine',
    likes: 42000,
    comments: [],
    saves: 8900,
    shares: 2100,
    views: 156000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-at-home-5095-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 25,
  },
  {
    id: 'fy10',
    creator: 'abuja_foodie',
    creatorId: 'u24',
    creatorAvatar: 'AF',
    caption: 'Best suya spots in Wuse 2 🍖🔥 #abuja #food',
    likes: 15600,
    comments: [],
    saves: 3400,
    shares: 780,
    views: 67000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-plate-in-a-kitchen-8402-large.mp4',
    thumbnail: '',
    category: 'foryou',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 25,
    duration: 18,
  },
  // FOLLOWING - Mixed monetization
  {
    id: 'fl1',
    creator: 'fave_creator',
    creatorId: 'u6',
    creatorAvatar: 'FC',
    caption: 'Made this just for my followers 💕 #love',
    likes: 23400,
    comments: [],
    saves: 1892,
    shares: 534,
    views: 78000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-a-christmas-tree-4808-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 12,
  },
  {
    id: 'fl2',
    creator: 'naija_comedy',
    creatorId: 'u7',
    creatorAvatar: 'NC',
    caption: 'When your mama calls your full name 😂💀 #comedy',
    likes: 89000,
    comments: [],
    saves: 5432,
    shares: 8923,
    views: 450000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-at-a-party-4652-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 35,
    duration: 15,
  },
  {
    id: 'fl3',
    creator: 'lagos_hustler',
    creatorId: 'u8',
    creatorAvatar: 'LH',
    caption: 'The hustle never stops 💪🏾 #motivation',
    likes: 34500,
    comments: [],
    saves: 2341,
    shares: 1234,
    views: 95000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-the-city-at-night-4365-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 20,
    duration: 18,
  },
  {
    id: 'fl4',
    creator: 'music_maestro',
    creatorId: 'u25',
    creatorAvatar: 'MM',
    caption: 'New track dropping Friday 🎵🔥 #newmusic',
    likes: 67000,
    comments: [],
    saves: 12000,
    shares: 4500,
    views: 234000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-at-a-nightclub-4829-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 20,
  },
  {
    id: 'fl5',
    creator: 'tech_sis',
    creatorId: 'u26',
    creatorAvatar: 'TS',
    caption: 'Coding tutorial for beginners 💻 #tech #coding',
    likes: 18900,
    comments: [],
    saves: 6700,
    shares: 890,
    views: 78000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4823-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 25,
    duration: 25,
  },
  {
    id: 'fl6',
    creator: 'fashion_plug_ng',
    creatorId: 'u27',
    creatorAvatar: 'FP',
    caption: 'Ankara collection 2024 🧵✨ #fashion',
    likes: 45000,
    comments: [],
    saves: 9800,
    shares: 2300,
    views: 167000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-at-a-beach-1203-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 16,
  },
  {
    id: 'fl7',
    creator: 'travel_ng_',
    creatorId: 'u28',
    creatorAvatar: 'TN',
    caption: 'Hidden beach in Calabar you need to visit 🏖️',
    likes: 56000,
    comments: [],
    saves: 14000,
    shares: 5600,
    views: 234000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-tropical-beach-resort-4637-large.mp4',
    thumbnail: '',
    category: 'following',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 30,
    duration: 22,
  },
  // EXPLORE - Mixed monetization
  {
    id: 'ex1',
    creator: 'travel_ng',
    creatorId: 'u9',
    creatorAvatar: 'TN',
    caption: 'Hidden gems in Nigeria you need to visit 🌴 #travel',
    likes: 56700,
    comments: [],
    saves: 8923,
    shares: 4532,
    views: 180000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-tropical-beach-resort-4637-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 30,
    duration: 20,
  },
  {
    id: 'ex2',
    creator: 'fit_naija',
    creatorId: 'u10',
    creatorAvatar: 'FN',
    caption: 'Home workout that burns 500 calories 🔥💪 #fitness',
    likes: 42300,
    comments: [],
    saves: 6721,
    shares: 2345,
    views: 145000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-at-home-5095-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 25,
  },
  {
    id: 'ex3',
    creator: 'style_queen',
    creatorId: 'u11',
    creatorAvatar: 'SQ',
    caption: 'Ankara styles for every occasion 👗✨ #fashion',
    likes: 78900,
    comments: [],
    saves: 12432,
    shares: 5678,
    views: 290000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-at-a-beach-1203-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 25,
    duration: 18,
  },
  {
    id: 'ex4',
    creator: 'crypto_naija',
    creatorId: 'u29',
    creatorAvatar: 'CN',
    caption: 'Bitcoin basics for Nigerians 💰 #crypto #money',
    likes: 34000,
    comments: [],
    saves: 8900,
    shares: 2100,
    views: 120000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4823-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 35,
    duration: 28,
  },
  {
    id: 'ex5',
    creator: 'small_chops_queen',
    creatorId: 'u30',
    creatorAvatar: 'SC',
    caption: 'Puff puff recipe from scratch 🍩 #food #recipe',
    likes: 23000,
    comments: [],
    saves: 5600,
    shares: 1200,
    views: 89000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-plate-in-a-kitchen-8402-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 20,
  },
  {
    id: 'ex6',
    creator: 'hair_by_nkechi',
    creatorId: 'u31',
    creatorAvatar: 'HN',
    caption: 'Knotless braids tutorial 💇🏾‍♀️ #hair #braids',
    likes: 67000,
    comments: [],
    saves: 15000,
    shares: 4500,
    views: 234000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-sunset-1094-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 25,
    duration: 22,
  },
  {
    id: 'ex7',
    creator: 'spoken_word_ng',
    creatorId: 'u32',
    creatorAvatar: 'SW',
    caption: 'This poem will make you cry 😭💔 #poetry',
    likes: 89000,
    comments: [],
    saves: 18000,
    shares: 7800,
    views: 340000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-typing-on-a-laptop-in-a-library-42386-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 15,
  },
  {
    id: 'ex8',
    creator: 'pet_lover_ng',
    creatorId: 'u33',
    creatorAvatar: 'PL',
    caption: 'My dog does the funniest things 🐕😂 #pets',
    likes: 45000,
    comments: [],
    saves: 6700,
    shares: 3400,
    views: 156000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-at-a-party-4652-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 20,
    duration: 12,
  },
  {
    id: 'ex9',
    creator: 'diy_nigeria',
    creatorId: 'u34',
    creatorAvatar: 'DI',
    caption: 'Room makeover under ₦20k 🏠✨ #diy #home',
    likes: 34000,
    comments: [],
    saves: 9800,
    shares: 2100,
    views: 120000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-a-christmas-tree-4808-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: true,
    rewardAmount: 30,
    duration: 24,
  },
  {
    id: 'ex10',
    creator: 'game_reviews_ng',
    creatorId: 'u35',
    creatorAvatar: 'GR',
    caption: 'FIFA 24 review - Worth it? 🎮 #gaming',
    likes: 28000,
    comments: [],
    saves: 4500,
    shares: 1800,
    views: 98000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4823-large.mp4',
    thumbnail: '',
    category: 'explore',
    createdAt: new Date(),
    isMonetized: false,
    rewardAmount: 0,
    duration: 30,
  },
];

// Extended Nigerian banks
export const nigerianBanks = [
  // Commercial Banks
  'Access Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank (GTBank)',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Fidelity Bank',
  'Union Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Wema Bank',
  'Polaris Bank',
  'Ecobank Nigeria',
  'FCMB',
  'Keystone Bank',
  'Unity Bank',
  'Heritage Bank',
  'Providus Bank',
  'SunTrust Bank',
  'Titan Trust Bank',
  'Globus Bank',
  'Parallex Bank',
  'Premium Trust Bank',
  'Signature Bank',
  'Optimus Bank',
  'Lotus Bank',
  // Digital Banks
  'Kuda Bank',
  'Opay',
  'Palmpay',
  'Moniepoint',
  'Carbon',
  'Fairmoney',
  'Rubies Bank',
  'VFD Microfinance Bank',
  'Sparkle',
  'Mint (Finex MFB)',
  // Microfinance Banks
  'Jaiz Bank',
  'LAPO Microfinance Bank',
  'Accion Microfinance Bank',
  'NPF Microfinance Bank',
  'AB Microfinance Bank',
  'Fortis Microfinance Bank',
  'Fina Trust Microfinance Bank',
  'Mutual Trust Microfinance Bank',
  'Hasal Microfinance Bank',
  'Trustbanc J6 Microfinance Bank',
];

// Creator profiles for demo
export const creatorProfiles: Record<string, {
  id: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  totalViews: number;
  avatar: string;
}> = {
  'u1': { id: 'u1', username: 'chioma_vibes', bio: 'Lagos babe 🌃 Content creator', followers: 45000, following: 234, totalViews: 890000, avatar: 'CV' },
  'u2': { id: 'u2', username: 'tech_adebayo', bio: 'Tech entrepreneur 💻', followers: 120000, following: 567, totalViews: 2340000, avatar: 'TA' },
  'u3': { id: 'u3', username: 'amaka_cooks', bio: 'Nigerian food blogger 🍚', followers: 32000, following: 189, totalViews: 456000, avatar: 'AC' },
  'u4': { id: 'u4', username: 'dance_king_ng', bio: 'Professional dancer 🕺', followers: 230000, following: 890, totalViews: 5600000, avatar: 'DK' },
  'u5': { id: 'u5', username: 'unilag_babe', bio: 'Final year student 📚', followers: 18000, following: 456, totalViews: 234000, avatar: 'UB' },
  'u6': { id: 'u6', username: 'fave_creator', bio: 'Your favorite creator 💕', followers: 78000, following: 234, totalViews: 1200000, avatar: 'FC' },
  'u7': { id: 'u7', username: 'naija_comedy', bio: 'Comedy content 😂', followers: 450000, following: 123, totalViews: 8900000, avatar: 'NC' },
  'u8': { id: 'u8', username: 'lagos_hustler', bio: 'Entrepreneur | Motivator 💪🏾', followers: 95000, following: 345, totalViews: 1800000, avatar: 'LH' },
  'u9': { id: 'u9', username: 'travel_ng', bio: 'Exploring Nigeria 🌴', followers: 180000, following: 567, totalViews: 3400000, avatar: 'TN' },
  'u10': { id: 'u10', username: 'fit_naija', bio: 'Fitness coach 💪', followers: 145000, following: 234, totalViews: 2100000, avatar: 'FN' },
  'u11': { id: 'u11', username: 'style_queen', bio: 'Fashion & Style 👗', followers: 290000, following: 456, totalViews: 4500000, avatar: 'SQ' },
};
