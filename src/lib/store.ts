// DREAMS State Management - Demo MVP with Monetization
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
  isMonetized: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
  likes: number;
}

export interface EarningRecord {
  id: string;
  postId: string;
  creatorUsername: string;
  amount: number;
  createdAt: Date;
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
  
  // Wallet - Demo earnings
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  earningsHistory: EarningRecord[];
  
  // Track viewed posts for earnings (prevent double earn)
  viewedPosts: Set<string>;
  
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
  
  // Earnings
  earnFromPost: (postId: string, creatorUsername: string) => number;
  hasViewedPost: (postId: string) => boolean;
  
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

// Random earning between ₦5 and ₦20
const getRandomEarning = () => Math.floor(Math.random() * 16) + 5;

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
      earningsHistory: [],
      viewedPosts: new Set(),
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
      
      // Earning from scrolling past monetized posts
      earnFromPost: (postId, creatorUsername) => {
        const state = get();
        const baseId = postId.split('-')[0];
        
        // Already viewed this post
        if (state.viewedPosts.has(baseId)) {
          return 0;
        }
        
        const amount = getRandomEarning();
        const newViewed = new Set(state.viewedPosts);
        newViewed.add(baseId);
        
        const earning: EarningRecord = {
          id: Math.random().toString(36).substr(2, 9),
          postId: baseId,
          creatorUsername,
          amount,
          createdAt: new Date(),
        };
        
        set({
          viewedPosts: newViewed,
          availableBalance: state.availableBalance + amount,
          totalEarned: state.totalEarned + amount,
          earningsHistory: [earning, ...state.earningsHistory],
        });
        
        return amount;
      },
      
      hasViewedPost: (postId) => {
        const state = get();
        const baseId = postId.split('-')[0];
        return state.viewedPosts.has(baseId);
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
      name: 'dream-storage-v4',
      partialize: (state) => ({
        ...state,
        likedPosts: setToArray(state.likedPosts),
        savedPosts: setToArray(state.savedPosts),
        viewedPosts: setToArray(state.viewedPosts),
        postComments: mapToArray(state.postComments),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        likedPosts: arrayToSet(persistedState?.likedPosts || []),
        savedPosts: arrayToSet(persistedState?.savedPosts || []),
        viewedPosts: arrayToSet(persistedState?.viewedPosts || []),
        postComments: arrayToMap(persistedState?.postComments || []),
      }),
    }
  )
);

// 30+ Demo posts with Picsum images - WITH MONETIZATION
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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
    isMonetized: true,
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
    isMonetized: false,
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
    isMonetized: true,
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

// Creator profiles for demo - with totalViews
export const creatorProfiles: Record<string, {
  id: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  avatar: string;
  totalViews: number;
}> = {
  'u1': { id: 'u1', username: 'chioma_vibes', bio: 'Lagos babe 🌃 Content creator', followers: 45000, following: 234, avatar: 'CV', totalViews: 1240000 },
  'u2': { id: 'u2', username: 'tech_adebayo', bio: 'Tech entrepreneur 💻', followers: 120000, following: 567, avatar: 'TA', totalViews: 4520000 },
  'u3': { id: 'u3', username: 'amaka_cooks', bio: 'Nigerian food blogger 🍚', followers: 32000, following: 189, avatar: 'AC', totalViews: 890000 },
  'u4': { id: 'u4', username: 'dance_king_ng', bio: 'Professional dancer 🕺', followers: 230000, following: 890, avatar: 'DK', totalViews: 6780000 },
  'u5': { id: 'u5', username: 'unilag_babe', bio: 'Final year student 📚', followers: 18000, following: 456, avatar: 'UB', totalViews: 560000 },
  'u6': { id: 'u6', username: 'fave_creator', bio: 'Your favorite creator 💕', followers: 78000, following: 234, avatar: 'FC', totalViews: 2340000 },
  'u7': { id: 'u7', username: 'naija_comedy', bio: 'Comedy content 😂', followers: 450000, following: 123, avatar: 'NC', totalViews: 8900000 },
  'u8': { id: 'u8', username: 'lagos_hustler', bio: 'Entrepreneur | Motivator 💪🏾', followers: 95000, following: 345, avatar: 'LH', totalViews: 3450000 },
  'u9': { id: 'u9', username: 'travel_ng', bio: 'Exploring Nigeria 🌴', followers: 180000, following: 567, avatar: 'TN', totalViews: 5670000 },
  'u10': { id: 'u10', username: 'fit_naija', bio: 'Fitness coach 💪', followers: 145000, following: 234, avatar: 'FN', totalViews: 4230000 },
  'u11': { id: 'u11', username: 'style_queen', bio: 'Fashion & Style 👗', followers: 290000, following: 456, avatar: 'SQ', totalViews: 7890000 },
  'u20': { id: 'u20', username: 'naija_comedy_king', bio: 'Making Nigeria laugh 😂', followers: 890000, following: 120, avatar: 'NC', totalViews: 15600000 },
  'u21': { id: 'u21', username: 'lagos_traffic_tales', bio: 'Daily traffic chronicles 🚗', followers: 120000, following: 340, avatar: 'LT', totalViews: 3400000 },
  'u22': { id: 'u22', username: 'makeup_by_funke', bio: 'MUA | Beauty tips 💄', followers: 95000, following: 280, avatar: 'MF', totalViews: 2800000 },
  'u23': { id: 'u23', username: 'fit_naija_boy', bio: 'Fitness trainer 💪🏾', followers: 156000, following: 200, avatar: 'FN', totalViews: 4200000 },
  'u24': { id: 'u24', username: 'abuja_foodie', bio: 'Food explorer 🍖', followers: 67000, following: 450, avatar: 'AF', totalViews: 1560000 },
  'u25': { id: 'u25', username: 'music_maestro', bio: 'Producer | Artist 🎵', followers: 234000, following: 180, avatar: 'MM', totalViews: 6700000 },
  'u26': { id: 'u26', username: 'tech_sis', bio: 'Software Developer 💻', followers: 78000, following: 340, avatar: 'TS', totalViews: 1890000 },
  'u27': { id: 'u27', username: 'fashion_plug_ng', bio: 'Your fashion connect 🧵', followers: 167000, following: 290, avatar: 'FP', totalViews: 4500000 },
  'u28': { id: 'u28', username: 'travel_ng_', bio: 'Travel blogger 🌴', followers: 234000, following: 450, avatar: 'TN', totalViews: 5600000 },
  'u29': { id: 'u29', username: 'crypto_naija', bio: 'Crypto educator 💰', followers: 89000, following: 200, avatar: 'CN', totalViews: 3400000 },
  'u30': { id: 'u30', username: 'small_chops_queen', bio: 'Small chops & baking 🍩', followers: 56000, following: 180, avatar: 'SC', totalViews: 2300000 },
  'u31': { id: 'u31', username: 'hair_by_nkechi', bio: 'Hairstylist 💇🏾‍♀️', followers: 145000, following: 250, avatar: 'HN', totalViews: 6700000 },
  'u32': { id: 'u32', username: 'spoken_word_ng', bio: 'Poet | Writer 📝', followers: 234000, following: 320, avatar: 'SW', totalViews: 8900000 },
  'u33': { id: 'u33', username: 'pet_lover_ng', bio: 'Dog mom 🐕', followers: 98000, following: 450, avatar: 'PL', totalViews: 4500000 },
  'u34': { id: 'u34', username: 'diy_nigeria', bio: 'DIY & Home decor 🏠', followers: 78000, following: 280, avatar: 'DI', totalViews: 3400000 },
  'u35': { id: 'u35', username: 'game_reviews_ng', bio: 'Gaming content 🎮', followers: 67000, following: 340, avatar: 'GR', totalViews: 2800000 },
};
