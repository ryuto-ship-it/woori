import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ProductCategory = 'digital_album' | 'fashion' | 'concert_ticket' | 'other';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceWoori: number;
  stock: number | null;
  isActive: boolean;
  eventDate?: string;
  eventVenue?: string;
  isNew?: boolean;
  imageUrl: string;
  hoverImageUrl: string;
};

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'BTS PROOF Standard Edition',
    description: '방탄소년단의 역사가 담긴 앤솔러지 앨범 PROOF 스탠다드 에디션입니다.',
    category: 'digital_album',
    priceWoori: 120,
    stock: null,
    isActive: true,
    isNew: true,
    imageUrl: 'https://loremflickr.com/400/400/bts,album?random=1',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,album?random=2',
  },
  {
    id: 'prod-2',
    name: 'BLACKPINK BORN PINK (Digital)',
    description: '블랙핑크 정규 2집 BORN PINK 디지털 음원 스페셜 패키지입니다.',
    category: 'digital_album',
    priceWoori: 85,
    stock: null,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/blackpink,album?random=3',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,album?random=4',
  },
  {
    id: 'prod-3',
    name: 'BTS PTD ON STAGE 후드티',
    description: '퍼미션 투 댄스 온 스테이지 서울 투어 공식 굿즈 짚업 후드입니다.',
    category: 'fashion',
    priceWoori: 180,
    stock: 15,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/bts,hoodie?random=5',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,hoodie?random=6',
  },
  {
    id: 'prod-4',
    name: 'BLACKPINK WORLD TOUR 크롭티',
    description: '블랙핑크 월드투어 [BORN PINK] 공식 크롭 반팔 티셔츠입니다.',
    category: 'fashion',
    priceWoori: 75,
    stock: 50,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/blackpink,shirt?random=7',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,shirt?random=8',
  },
  {
    id: 'prod-5',
    name: 'BTS 아미밤 (오피셜 라이트 스틱)',
    description: '방탄소년단 공식 응원봉 아미밤 스페셜 에디션입니다.',
    category: 'other',
    priceWoori: 95,
    stock: 300,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/bts,lightstick?random=9',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,lightstick?random=10',
  },
  {
    id: 'prod-6',
    name: 'BLACKPINK 블핑봉 (버전 2)',
    description: '블랙핑크 공식 응원봉 뿅봉(블핑봉) 버전 2 한정판입니다.',
    category: 'other',
    priceWoori: 90,
    stock: 120,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/blackpink,lightstick?random=11',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,lightstick?random=12',
  },
  {
    id: 'prod-7',
    name: 'BTS 10주년 페스타 VIP 티켓',
    description: '여의도 한강공원에서 열리는 방탄소년단 10주년 페스타 VIP 라운지 입장권입니다.',
    category: 'concert_ticket',
    priceWoori: 500,
    stock: 3,
    isActive: true,
    eventDate: '2026-06-17',
    eventVenue: '서울 여의도 한강공원',
    imageUrl: 'https://loremflickr.com/400/400/bts,concert?random=13',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,crowd?random=14',
  },
  {
    id: 'prod-8',
    name: 'BLACKPINK 앙코르 콘서트 티켓',
    description: '고척 스카이돔에서 열리는 월드투어 앙코르 피날레 콘서트 스탠딩석입니다.',
    category: 'concert_ticket',
    priceWoori: 450,
    stock: 10,
    isActive: true,
    eventDate: '2026-09-16',
    eventVenue: '서울 고척 스카이돔',
    imageUrl: 'https://loremflickr.com/400/400/blackpink,concert?random=15',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,crowd?random=16',
  },
  {
    id: 'prod-9',
    name: 'BTS TinyTAN 미니 피규어',
    description: '타이니탄 다이너마이트 버전 미니 피규어 세트입니다.',
    category: 'other',
    priceWoori: 55,
    stock: 80,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/bts,figure?random=17',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,figure?random=18',
  },
  {
    id: 'prod-10',
    name: 'BLACKPINK 미공개 포카 세트',
    description: '코첼라 무대 비하인드 미공개 포토카드 4종 세트입니다.',
    category: 'other',
    priceWoori: 40,
    stock: 500,
    isActive: true,
    isNew: true,
    imageUrl: 'https://loremflickr.com/400/400/blackpink,photocard?random=19',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,photocard?random=20',
  },
  {
    id: 'prod-11',
    name: 'BTS Butter 로고 볼캡',
    description: 'Butter 앨범 컨셉의 옐로우 컬러 포인트 볼캡입니다.',
    category: 'fashion',
    priceWoori: 45,
    stock: 35,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/bts,cap?random=21',
    hoverImageUrl: 'https://loremflickr.com/400/400/bts,cap?random=22',
  },
  {
    id: 'prod-12',
    name: 'BLACKPINK 제니 착용 선글라스 (레플리카)',
    description: '공항패션에서 선보인 스타일의 한정판 레플리카 선글라스입니다.',
    category: 'fashion',
    priceWoori: 110,
    stock: 12,
    isActive: true,
    imageUrl: 'https://loremflickr.com/400/400/blackpink,sunglasses?random=23',
    hoverImageUrl: 'https://loremflickr.com/400/400/blackpink,sunglasses?random=24',
  }
];

type ShopContextType = {
  products: Product[];
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [products] = useState<Product[]>(INITIAL_MOCK_PRODUCTS);

  return (
    <ShopContext.Provider value={{ products }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
