// Simple state management for Dream$ MVP
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  university?: string;
  createdAt: Date;
}

interface EarningActivity {
  id: string;
  type: 'watch' | 'create' | 'engage' | 'challenge';
  amount: number;
  description: string;
  timestamp: Date;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  bank: string;
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
}

interface DreamStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  
  // Earnings
  availableBalance: number;
  pendingEarnings: number;
  totalEarned: number;
  todayEarnings: number;
  dailyLimit: number;
  earningHistory: EarningActivity[];
  
  // Withdrawals
  withdrawalHistory: WithdrawalRequest[];
  
  // Content
  contentCount: number;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  addEarning: (activity: Omit<EarningActivity, 'id' | 'timestamp'>) => void;
  requestWithdrawal: (amount: number, bank: string, accountNumber: string) => void;
  incrementContentCount: () => void;
  resetDailyEarnings: () => void;
}

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      availableBalance: 1250,
      pendingEarnings: 300,
      totalEarned: 4550,
      todayEarnings: 0,
      dailyLimit: 300,
      earningHistory: [],
      withdrawalHistory: [],
      contentCount: 3,
      
      // Actions
      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        hasCompletedOnboarding: false 
      }),
      
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      addEarning: (activity) => {
        const state = get();
        const newEarning = state.todayEarnings + activity.amount;
        
        // Enforce daily limit
        if (newEarning > state.dailyLimit) {
          return;
        }
        
        const newActivity: EarningActivity = {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };
        
        set({
          pendingEarnings: state.pendingEarnings + activity.amount,
          totalEarned: state.totalEarned + activity.amount,
          todayEarnings: newEarning,
          earningHistory: [newActivity, ...state.earningHistory].slice(0, 50),
        });
      },
      
      requestWithdrawal: (amount, bank, accountNumber) => {
        const state = get();
        if (amount > state.availableBalance) return;
        
        const withdrawal: WithdrawalRequest = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          bank,
          accountNumber,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set({
          availableBalance: state.availableBalance - amount,
          withdrawalHistory: [withdrawal, ...state.withdrawalHistory],
        });
      },
      
      incrementContentCount: () => set((state) => ({ 
        contentCount: state.contentCount + 1 
      })),
      
      resetDailyEarnings: () => set({ todayEarnings: 0 }),
    }),
    {
      name: 'dream-storage',
    }
  )
);

// Mock video data
export const mockVideos = [
  {
    id: '1',
    creator: '@chioma_vibes',
    caption: 'Lagos nightlife hits different 🌃✨ #lagos #vibes',
    likes: 12400,
    comments: 892,
    earning: 5,
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop',
  },
  {
    id: '2',
    creator: '@tech_adebayo',
    caption: 'How I made my first ₦100k online 💰 Watch till the end!',
    likes: 45200,
    comments: 3241,
    earning: 10,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=700&fit=crop',
  },
  {
    id: '3',
    creator: '@amaka_cooks',
    caption: 'Jollof rice recipe that slaps 🍚🔥 #foodie #nigerian',
    likes: 8900,
    comments: 567,
    earning: 5,
    thumbnail: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=700&fit=crop',
  },
  {
    id: '4',
    creator: '@dance_king_ng',
    caption: 'New Afrobeats challenge 🕺💥 Can you do this?',
    likes: 67800,
    comments: 4521,
    earning: 15,
    thumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=700&fit=crop',
  },
  {
    id: '5',
    creator: '@unilag_babe',
    caption: 'Day in my life as a final year student 📚✨',
    likes: 5600,
    comments: 234,
    earning: 5,
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=700&fit=crop',
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
    status: 'completed' as const,
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

// Nigerian banks
export const nigerianBanks = [
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
  'Jaiz Bank',
  'Opay',
  'Kuda Bank',
  'Moniepoint',
  'Palmpay',
];
