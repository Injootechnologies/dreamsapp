// DREAMS State Management - Concept Demo
// Image-based social feed platform (NO monetization in this demo)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
  profilePhoto?: string;
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  creator: string;
  creatorId: string;
  creatorAvatar?: string;
  caption: string;
  likes: number;
  comments: Comment[];
  saves: number;
  shares: number;
  imageUrl: string;
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

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bank: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  userId: string;
  username: string;
}

interface DreamStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  
  // Wallet (demo only - always ₦0)
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  
  // Interactions
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  
  // Comments per post
  postComments: Map<string, Comment[]>;
  
  // Withdrawals
  withdrawalHistory: WithdrawalRequest[];
  
  // Content
  userPosts: Post[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Interactions
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  getPostComments: (postId: string) => Comment[];
  
  // Content
  uploadPost: (post: Post) => void;
  
  // Withdrawal (demo only)
  requestWithdrawal: (amount: number, bank: string, accountNumber: string, accountName: string) => void;
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
      withdrawalHistory: [],
      userPosts: [],
      likedPosts: new Set(),
      savedPosts: new Set(),
      postComments: new Map(),
      
      // Actions
      login: (user) => {
        set({ user, isAuthenticated: true });
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
      
      // Interaction actions
      toggleLike: (postId) => {
        const state = get();
        const newLiked = new Set(state.likedPosts);
        
        if (newLiked.has(postId)) {
          newLiked.delete(postId);
        } else {
          newLiked.add(postId);
        }
        
        set({ likedPosts: newLiked });
      },
      
      toggleSave: (postId) => {
        const state = get();
        const newSaved = new Set(state.savedPosts);
        
        if (newSaved.has(postId)) {
          newSaved.delete(postId);
        } else {
          newSaved.add(postId);
        }
        
        set({ savedPosts: newSaved });
      },
      
      addComment: (postId, text) => {
        const state = get();
        const newComments = new Map(state.postComments);
        const existing = newComments.get(postId) || [];
        
        const newComment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: state.user?.id || 'anonymous',
          username: state.user?.username || 'Anonymous',
          text,
          createdAt: new Date(),
          likes: 0,
        };
        
        newComments.set(postId, [...existing, newComment]);
        set({ postComments: newComments });
      },
      
      getPostComments: (postId) => {
        const state = get();
        return state.postComments.get(postId) || [];
      },
      
      uploadPost: (post) => {
        const state = get();
        set({
          userPosts: [post, ...state.userPosts],
        });
      },
      
      requestWithdrawal: (amount, bank, accountNumber, accountName) => {
        const state = get();
        
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
        
        set({
          withdrawalHistory: [withdrawal, ...state.withdrawalHistory],
        });
      },
    }),
    {
      name: 'dream-storage-v3',
      partialize: (state) => ({
        ...state,
        likedPosts: setToArray(state.likedPosts),
        savedPosts: setToArray(state.savedPosts),
        postComments: mapToArray(state.postComments),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        likedPosts: arrayToSet(persistedState?.likedPosts || []),
        savedPosts: arrayToSet(persistedState?.savedPosts || []),
        postComments: arrayToMap(persistedState?.postComments || []),
      }),
    }
  )
);

// 30+ Demo posts with Picsum images
export const demoPosts: Post[] = [
  // FOR YOU
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
    imageUrl: 'https://picsum.photos/seed/lagos1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
  },
  {
    id: 'fy2',
    creator: 'tech_adebayo',
    creatorId: 'u2',
    creatorAvatar: 'TA',
    caption: 'How I made my first ₦100k online 💰 Full story in comments!',
    likes: 45200,
    comments: [],
    saves: 3241,
    shares: 1203,
    imageUrl: 'https://picsum.photos/seed/tech1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/food1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/dance1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/student1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/comedy1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/traffic1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/makeup1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/fitness1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/suya1/800/1200',
    category: 'foryou',
    createdAt: new Date(),
  },
  // FOLLOWING
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
    imageUrl: 'https://picsum.photos/seed/fave1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/mama1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/hustle1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/music1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/coding1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/ankara1/800/1200',
    category: 'following',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/beach1/800/1200',
    category: 'following',
    createdAt: new Date(),
  },
  // EXPLORE
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
    imageUrl: 'https://picsum.photos/seed/gems1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/workout1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/style1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/crypto1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/puffpuff1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/braids1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/poetry1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/pets1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/diy1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
    imageUrl: 'https://picsum.photos/seed/gaming1/800/1200',
    category: 'explore',
    createdAt: new Date(),
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
  avatar: string;
}> = {
  'u1': { id: 'u1', username: 'chioma_vibes', bio: 'Lagos babe 🌃 Content creator', followers: 45000, following: 234, avatar: 'CV' },
  'u2': { id: 'u2', username: 'tech_adebayo', bio: 'Tech entrepreneur 💻', followers: 120000, following: 567, avatar: 'TA' },
  'u3': { id: 'u3', username: 'amaka_cooks', bio: 'Nigerian food blogger 🍚', followers: 32000, following: 189, avatar: 'AC' },
  'u4': { id: 'u4', username: 'dance_king_ng', bio: 'Professional dancer 🕺', followers: 230000, following: 890, avatar: 'DK' },
  'u5': { id: 'u5', username: 'unilag_babe', bio: 'Final year student 📚', followers: 18000, following: 456, avatar: 'UB' },
  'u6': { id: 'u6', username: 'fave_creator', bio: 'Your favorite creator 💕', followers: 78000, following: 234, avatar: 'FC' },
  'u7': { id: 'u7', username: 'naija_comedy', bio: 'Comedy content 😂', followers: 450000, following: 123, avatar: 'NC' },
  'u8': { id: 'u8', username: 'lagos_hustler', bio: 'Entrepreneur | Motivator 💪🏾', followers: 95000, following: 345, avatar: 'LH' },
  'u9': { id: 'u9', username: 'travel_ng', bio: 'Exploring Nigeria 🌴', followers: 180000, following: 567, avatar: 'TN' },
  'u10': { id: 'u10', username: 'fit_naija', bio: 'Fitness coach 💪', followers: 145000, following: 234, avatar: 'FN' },
  'u11': { id: 'u11', username: 'style_queen', bio: 'Fashion & Style 👗', followers: 290000, following: 456, avatar: 'SQ' },
  'u20': { id: 'u20', username: 'naija_comedy_king', bio: 'Making Nigeria laugh 😂', followers: 890000, following: 120, avatar: 'NC' },
  'u21': { id: 'u21', username: 'lagos_traffic_tales', bio: 'Daily traffic chronicles 🚗', followers: 120000, following: 340, avatar: 'LT' },
  'u22': { id: 'u22', username: 'makeup_by_funke', bio: 'MUA | Beauty tips 💄', followers: 95000, following: 280, avatar: 'MF' },
  'u23': { id: 'u23', username: 'fit_naija_boy', bio: 'Fitness trainer 💪🏾', followers: 156000, following: 200, avatar: 'FN' },
  'u24': { id: 'u24', username: 'abuja_foodie', bio: 'Food explorer 🍖', followers: 67000, following: 450, avatar: 'AF' },
  'u25': { id: 'u25', username: 'music_maestro', bio: 'Producer | Artist 🎵', followers: 234000, following: 180, avatar: 'MM' },
  'u26': { id: 'u26', username: 'tech_sis', bio: 'Software Developer 💻', followers: 78000, following: 340, avatar: 'TS' },
  'u27': { id: 'u27', username: 'fashion_plug_ng', bio: 'Your fashion connect 🧵', followers: 167000, following: 290, avatar: 'FP' },
  'u28': { id: 'u28', username: 'travel_ng_', bio: 'Travel blogger 🌴', followers: 234000, following: 450, avatar: 'TN' },
};
