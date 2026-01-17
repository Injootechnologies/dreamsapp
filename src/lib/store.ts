// Dream$ State Management - Beta Testing Platform
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
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
  type: 'watch' | 'like' | 'comment' | 'save' | 'create' | 'challenge';
  amount: number;
  description: string;
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
  pendingEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  earningHistory: EarningActivity[];
  
  // Interactions
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  watchedVideos: Set<string>;
  commentedVideos: Set<string>;
  
  // Withdrawals
  withdrawalHistory: WithdrawalRequest[];
  
  // Content
  contentCount: number;
  userVideos: Video[];
  
  // Notifications
  notifications: Notification[];
  
  // Admin data (simulated all users)
  allUsers: User[];
  allWithdrawals: WithdrawalRequest[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  addEarning: (activity: Omit<EarningActivity, 'id' | 'timestamp'>) => void;
  requestWithdrawal: (amount: number, bank: string, accountNumber: string, accountName: string) => void;
  incrementContentCount: () => void;
  
  // Interactions
  toggleLike: (videoId: string) => boolean;
  toggleSave: (videoId: string) => boolean;
  addComment: (videoId: string, text: string) => void;
  markVideoWatched: (videoId: string) => boolean;
  
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

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      // Initial ZERO state for new users
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      availableBalance: 0,
      pendingEarnings: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      earningHistory: [],
      withdrawalHistory: [],
      contentCount: 0,
      userVideos: [],
      likedVideos: new Set(),
      savedVideos: new Set(),
      watchedVideos: new Set(),
      commentedVideos: new Set(),
      notifications: [],
      allUsers: [],
      allWithdrawals: [],
      
      // Actions
      login: (user) => {
        const state = get();
        // Add to all users if not exists
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
      
      resetToZeroState: () => set({
        availableBalance: 0,
        pendingEarnings: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        earningHistory: [],
        likedVideos: new Set(),
        savedVideos: new Set(),
        watchedVideos: new Set(),
        commentedVideos: new Set(),
      }),
      
      addEarning: (activity) => {
        const state = get();
        
        const newActivity: EarningActivity = {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };
        
        // Add to available balance immediately (no daily limit in beta)
        set({
          availableBalance: state.availableBalance + activity.amount,
          totalEarned: state.totalEarned + activity.amount,
          earningHistory: [newActivity, ...state.earningHistory].slice(0, 100),
        });
      },
      
      // Interaction actions with earning logic
      toggleLike: (videoId) => {
        const state = get();
        const newLiked = new Set(state.likedVideos);
        let earned = false;
        
        if (newLiked.has(videoId)) {
          newLiked.delete(videoId);
        } else {
          newLiked.add(videoId);
          // Award earning for like
          state.addEarning({
            type: 'like',
            amount: 5,
            description: 'Liked a video',
          });
          earned = true;
        }
        
        set({ likedVideos: newLiked });
        return earned;
      },
      
      toggleSave: (videoId) => {
        const state = get();
        const newSaved = new Set(state.savedVideos);
        let earned = false;
        
        if (newSaved.has(videoId)) {
          newSaved.delete(videoId);
        } else {
          newSaved.add(videoId);
          // Award earning for save
          state.addEarning({
            type: 'save',
            amount: 5,
            description: 'Saved a video',
          });
          earned = true;
        }
        
        set({ savedVideos: newSaved });
        return earned;
      },
      
      addComment: (videoId, text) => {
        const state = get();
        const newCommented = new Set(state.commentedVideos);
        
        if (!newCommented.has(videoId)) {
          newCommented.add(videoId);
          // Award earning for first comment on this video
          state.addEarning({
            type: 'comment',
            amount: 10,
            description: 'Commented on a video',
          });
        }
        
        set({ commentedVideos: newCommented });
      },
      
      markVideoWatched: (videoId) => {
        const state = get();
        const newWatched = new Set(state.watchedVideos);
        
        if (!newWatched.has(videoId)) {
          newWatched.add(videoId);
          // Award earning for watching
          state.addEarning({
            type: 'watch',
            amount: 20,
            description: 'Watched a video',
          });
          set({ watchedVideos: newWatched });
          return true;
        }
        return false;
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
        
        // Add notification for admin
        state.addNotification({
          type: 'admin',
          title: 'New Withdrawal Request',
          message: `${state.user?.username} requested ₦${amount.toLocaleString()}`,
        });
        
        set({
          availableBalance: state.availableBalance - amount,
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
      
      incrementContentCount: () => set((state) => ({ 
        contentCount: state.contentCount + 1 
      })),
      
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
      name: 'dream-storage',
      partialize: (state) => ({
        ...state,
        likedVideos: setToArray(state.likedVideos),
        savedVideos: setToArray(state.savedVideos),
        watchedVideos: setToArray(state.watchedVideos),
        commentedVideos: setToArray(state.commentedVideos),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        likedVideos: arrayToSet(persistedState?.likedVideos || []),
        savedVideos: arrayToSet(persistedState?.savedVideos || []),
        watchedVideos: arrayToSet(persistedState?.watchedVideos || []),
        commentedVideos: arrayToSet(persistedState?.commentedVideos || []),
      }),
    }
  )
);

// Demo videos using free stock video URLs
export const demoVideos: Video[] = [
  // For You videos
  {
    id: 'fy1',
    creator: '@chioma_vibes',
    creatorId: 'u1',
    caption: 'Lagos nightlife hits different 🌃✨ #lagos #vibes #beta',
    likes: 12400,
    comments: [],
    saves: 892,
    shares: 234,
    views: 45000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-sunset-1094-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop',
    category: 'foryou',
    createdAt: new Date(),
  },
  {
    id: 'fy2',
    creator: '@tech_adebayo',
    creatorId: 'u2',
    caption: 'How I made my first ₦100k online 💰 Watch till the end! #money #beta',
    likes: 45200,
    comments: [],
    saves: 3241,
    shares: 1203,
    views: 120000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-coffee-shop-4823-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=700&fit=crop',
    category: 'foryou',
    createdAt: new Date(),
  },
  {
    id: 'fy3',
    creator: '@amaka_cooks',
    creatorId: 'u3',
    caption: 'Jollof rice recipe that slaps 🍚🔥 #foodie #nigerian #beta',
    likes: 8900,
    comments: [],
    saves: 567,
    shares: 189,
    views: 32000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-plate-in-a-kitchen-8402-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=700&fit=crop',
    category: 'foryou',
    createdAt: new Date(),
  },
  {
    id: 'fy4',
    creator: '@dance_king_ng',
    creatorId: 'u4',
    caption: 'New Afrobeats challenge 🕺💥 Can you do this? #dance #beta',
    likes: 67800,
    comments: [],
    saves: 4521,
    shares: 2341,
    views: 230000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-people-dancing-at-a-party-4637-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=700&fit=crop',
    category: 'foryou',
    createdAt: new Date(),
  },
  {
    id: 'fy5',
    creator: '@unilag_babe',
    creatorId: 'u5',
    caption: 'Day in my life as a final year student 📚✨ #student #beta',
    likes: 5600,
    comments: [],
    saves: 234,
    shares: 89,
    views: 18000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-typing-on-a-laptop-in-a-library-42386-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=700&fit=crop',
    category: 'foryou',
    createdAt: new Date(),
  },
  // Following videos
  {
    id: 'fl1',
    creator: '@fave_creator',
    creatorId: 'u6',
    caption: 'Made this just for my followers 💕 #love #beta',
    likes: 23400,
    comments: [],
    saves: 1892,
    shares: 534,
    views: 78000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-a-christmas-tree-4808-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=700&fit=crop',
    category: 'following',
    createdAt: new Date(),
  },
  {
    id: 'fl2',
    creator: '@naija_comedy',
    creatorId: 'u7',
    caption: 'When your mama calls your full name 😂💀 #comedy #beta',
    likes: 89000,
    comments: [],
    saves: 5432,
    shares: 8923,
    views: 450000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-at-a-party-4652-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop',
    category: 'following',
    createdAt: new Date(),
  },
  {
    id: 'fl3',
    creator: '@lagos_hustler',
    creatorId: 'u8',
    caption: 'The hustle never stops 💪🏾 #motivation #beta',
    likes: 34500,
    comments: [],
    saves: 2341,
    shares: 1234,
    views: 95000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-the-city-at-night-4365-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=700&fit=crop',
    category: 'following',
    createdAt: new Date(),
  },
  // Explore videos
  {
    id: 'ex1',
    creator: '@travel_ng',
    creatorId: 'u9',
    caption: 'Hidden gems in Nigeria you need to visit 🌴 #travel #beta',
    likes: 56700,
    comments: [],
    saves: 8923,
    shares: 4532,
    views: 180000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-tropical-beach-resort-4637-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=700&fit=crop',
    category: 'explore',
    createdAt: new Date(),
  },
  {
    id: 'ex2',
    creator: '@fit_naija',
    creatorId: 'u10',
    caption: 'Home workout that burns 500 calories 🔥💪 #fitness #beta',
    likes: 42300,
    comments: [],
    saves: 6721,
    shares: 2345,
    views: 145000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-at-home-5095-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=700&fit=crop',
    category: 'explore',
    createdAt: new Date(),
  },
  {
    id: 'ex3',
    creator: '@style_queen',
    creatorId: 'u11',
    caption: 'Ankara styles for every occasion 👗✨ #fashion #beta',
    likes: 78900,
    comments: [],
    saves: 12432,
    shares: 5678,
    views: 290000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-at-a-beach-1203-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=700&fit=crop',
    category: 'explore',
    createdAt: new Date(),
  },
];

// Mock earning tasks
export const mockTasks = [
  {
    id: '1',
    title: 'Watch sponsored video',
    description: 'Watch a 30-second brand video',
    amount: 20,
    status: 'available' as const,
    icon: 'play',
  },
  {
    id: '2',
    title: 'Create original content',
    description: 'Upload a new video or post',
    amount: 50,
    status: 'available' as const,
    icon: 'video',
  },
  {
    id: '3',
    title: 'Complete daily challenge',
    description: 'Participate in today\'s trending challenge',
    amount: 30,
    status: 'available' as const,
    icon: 'trophy',
  },
  {
    id: '4',
    title: 'Engage with 10 posts',
    description: 'Like and comment on community content',
    amount: 15,
    status: 'available' as const,
    icon: 'heart',
  },
  {
    id: '5',
    title: 'Share to WhatsApp',
    description: 'Share a Dream$ video to your status',
    amount: 25,
    status: 'available' as const,
    icon: 'share',
  },
];

// Extended Nigerian banks (commercial + microfinance)
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
