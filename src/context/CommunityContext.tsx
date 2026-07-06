import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type RewardStatus = 'pending' | 'reviewed' | 'rewarded' | 'rejected';

export type MediaType = 'image' | 'video' | 'none';

export type CommunityComment = {
  id: string;
  walletAddress: string;
  content: string;
  createdAt: string; // ISO
};

export type CommunityPost = {
  id: string;
  walletAddress: string;
  content: string;
  mediaUrls: string[]; // text[] array
  mediaType: MediaType;
  createdAt: string; // ISO
  likeCount: number;
  viewCount: number;
  rewardStatus: RewardStatus;
  rewardTxHash: string | null;
  rewardAmount: number; // 적립된 WOORI 양
  comments: CommunityComment[];
};

// More posts for realistic feel
const INITIAL_MOCK_POSTS: CommunityPost[] = [
  {
    id: 'p15',
    walletAddress: '0x9F2c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9a',
    content: '방금 프리미어 시사회 예매 성공했습니다!!!',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    likeCount: 5,
    viewCount: 42,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xabc...',
    rewardAmount: 10,
    comments: [
      { id: 'c1', walletAddress: '0x3B7d...', content: '와 부럽습니다 ㅠㅠ', createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
      { id: 'c2', walletAddress: '0x1A2b...', content: '저도 간신히 잡았네요 ㅋㅋ', createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() }
    ],
  },
  {
    id: 'p14',
    walletAddress: '0x7C1e3A5b8D0f2A4c6E8b0D2f4A6c8E0b2D4f6A8c',
    content: '이번 오케이 마담 2 스틸컷 고화질 배경화면 나눔합니다.',
    mediaUrls: ['https://loremflickr.com/800/600/movie?random=5'],
    mediaType: 'image',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    likeCount: 120,
    viewCount: 450,
    rewardStatus: 'rewarded',
    rewardTxHash: '0x123...',
    rewardAmount: 50,
    comments: [],
  },
  {
    id: 'p13',
    walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
    content: 'WOORI 토큰 스테이킹 이자율 괜찮네요. 계속 유지할 예정입니다.',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likeCount: 15,
    viewCount: 130,
    rewardStatus: 'pending',
    rewardTxHash: null,
    rewardAmount: 0,
    comments: [
      { id: 'c3', walletAddress: '0x5D9f...', content: '맞아요 저도 계속 묶어두려구요', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
    ],
  },
  {
    id: 'p12',
    walletAddress: '0x5D9f1B3c6E8a0C2e4F6b8D0a2C4e6F8b0D2a4C6e',
    content: '배우님들 무대인사 일정 언제 뜨나요?',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likeCount: 2,
    viewCount: 56,
    rewardStatus: 'reviewed',
    rewardTxHash: null,
    rewardAmount: 0,
    comments: [],
  },
  {
    id: 'p11',
    walletAddress: '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b',
    content: '오케이 마담 2 1차 예고편 분석 영상 (유튜브 펌)',
    mediaUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    mediaType: 'video',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likeCount: 88,
    viewCount: 620,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xdef...',
    rewardAmount: 30,
    comments: [],
  },
  {
    id: 'p10',
    walletAddress: '0x2F8c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9c',
    content: '굿즈샵 후드티 퀄리티 미쳤습니다 꼭 사세요',
    mediaUrls: ['https://loremflickr.com/800/600/hoodie?random=10'],
    mediaType: 'image',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    likeCount: 45,
    viewCount: 310,
    rewardStatus: 'rewarded',
    rewardTxHash: '0x456...',
    rewardAmount: 20,
    comments: [],
  },
  {
    id: 'p9',
    walletAddress: '0x8E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e2F',
    content: '게시판 활동 열심히 하면 토큰 진짜로 주나요?',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likeCount: 12,
    viewCount: 180,
    rewardStatus: 'rejected',
    rewardTxHash: null,
    rewardAmount: 0,
    comments: [],
  },
  {
    id: 'p8',
    walletAddress: '0x5C7D9e1F3a5B7c9D1e3B7d9E1f2A4c6D8e0F1a',
    content: '1편 다시 정주행 중입니다 ㅋㅋ 비행기 씬은 다시 봐도 레전드',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    likeCount: 22,
    viewCount: 145,
    rewardStatus: 'rewarded',
    rewardTxHash: '0x789...',
    rewardAmount: 15,
    comments: [],
  },
  {
    id: 'p7',
    walletAddress: '0x9F2c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9a',
    content: '크루즈 촬영장 직찍.jpg',
    mediaUrls: ['https://loremflickr.com/800/600/cruise?random=20'],
    mediaType: 'image',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 340,
    viewCount: 1500,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xaaa...',
    rewardAmount: 100,
    comments: [],
  },
  {
    id: 'p6',
    walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
    content: 'WOORI 생태계 백서 읽어봤는데 비전이 좋네요.',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    likeCount: 18,
    viewCount: 95,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xbbb...',
    rewardAmount: 10,
    comments: [],
  },
  {
    id: 'p5',
    walletAddress: '0x9F2c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9a',
    content: '오케이 마담 2 예고편 방금 봤는데 크루즈 배경이 미쳤네요... 8월이 너무 기다려집니다 🚢',
    mediaUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'], // Example youtube embed
    mediaType: 'video',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    likeCount: 43,
    viewCount: 315,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xccc...',
    rewardAmount: 30,
    comments: [],
  },
  {
    id: 'p4',
    walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
    content: 'WOORI 듀얼 홀더 응모권 3장 받았습니다! 다들 KONET도 같이 챙기세요 ㅎㅎ 저는 시사회 동반 초청까지 노려봅니다.',
    mediaUrls: ['https://loremflickr.com/800/600/ticket?random=1', 'https://loremflickr.com/800/600/ticket?random=2'],
    mediaType: 'image',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    likeCount: 14,
    viewCount: 52,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xddd...',
    rewardAmount: 20,
    comments: [
      {
        id: 'c1_old',
        walletAddress: '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b',
        content: '오 저도 방금 인증 완료! 화이팅입니다',
        createdAt: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'p3',
    walletAddress: '0x7C1e3A5b8D0f2A4c6E8b0D2f4A6c8E0b2D4f6A8c',
    content: '시사회 초청 NFT가 진짜 지갑으로 온다는 게 신기하네요. 메타마스크로 받아본 적은 없어서 살짝 긴장됩니다 😅',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    likeCount: 27,
    viewCount: 105,
    rewardStatus: 'rewarded',
    rewardTxHash: '0x4f9a...',
    rewardAmount: 15,
    comments: [
      {
        id: 'c2_old',
        walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
        content: '메타마스크 앱 켜고 NFT 탭만 확인하면 돼요! 어렵지 않아요',
        createdAt: new Date(Date.now() - 95 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'p2',
    walletAddress: '0x5D9f1B3c6E8a0C2e4F6b8D0a2C4e6F8b0D2a4C6e',
    content: '박정화 배우님 액션씬 스틸컷 보고 소름 돋았습니다. 1편보다 스케일이 훨씬 커진 느낌!',
    mediaUrls: ['https://loremflickr.com/800/600/action?random=99'],
    mediaType: 'image',
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    likeCount: 108,
    viewCount: 830,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xeee...',
    rewardAmount: 50,
    comments: [],
  },
  {
    id: 'p1',
    walletAddress: '0x7C1e3A5b8D0f2A4c6E8b0D2f4A6c8E0b2D4f6A8c',
    content: '캠페인 참여 인증 완료! WOORI 보유 스냅샷 기록되는 거 보니까 이번엔 진짜 투명하게 운영되는 느낌이라 좋네요.',
    mediaUrls: [],
    mediaType: 'none',
    createdAt: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString(),
    likeCount: 19,
    viewCount: 88,
    rewardStatus: 'rewarded',
    rewardTxHash: '0xfff...',
    rewardAmount: 10,
    comments: [],
  },
];

type CommunityContextType = {
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'viewCount' | 'rewardStatus' | 'rewardTxHash' | 'rewardAmount' | 'comments'>) => void;
  toggleLike: (postId: string, walletAddress: string) => void;
  addComment: (postId: string, walletAddress: string, content: string) => void;
  incrementViewCount: (postId: string) => void;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_MOCK_POSTS);
  const [, setLikedPostsMap] = useState<Record<string, Set<string>>>({});

  const addPost = (postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'viewCount' | 'rewardStatus' | 'rewardTxHash' | 'rewardAmount' | 'comments'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      viewCount: 0,
      rewardStatus: 'pending',
      rewardTxHash: null,
      rewardAmount: 0,
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = (postId: string, walletAddress: string) => {
    setLikedPostsMap(prev => {
      const userLikes = prev[walletAddress] || new Set();
      const newSet = new Set(userLikes);
      let likeDelta = 0;
      if (newSet.has(postId)) {
        newSet.delete(postId);
        likeDelta = -1;
      } else {
        newSet.add(postId);
        likeDelta = 1;
      }
      
      setPosts(currentPosts => currentPosts.map(p => 
        p.id === postId ? { ...p, likeCount: p.likeCount + likeDelta } : p
      ));

      return { ...prev, [walletAddress]: newSet };
    });
  };

  const addComment = (postId: string, walletAddress: string, content: string) => {
    const newComment: CommunityComment = {
      id: `local-${Date.now()}`,
      walletAddress,
      content,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    ));
  };

  const incrementViewCount = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p
    ));
  };

  return (
    <CommunityContext.Provider value={{ posts, addPost, toggleLike, addComment, incrementViewCount }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
