// Presentational-only mock data (discount badges, star ratings, reviews) derived
// deterministically from a product id, so it stays stable across re-renders
// without needing new fields on the real `products` data.

function seedHash(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash
}

export function getProductDecoration(productId: string) {
  const discountRoll = seedHash(`${productId}-discount`) % 3
  const discountPercent = discountRoll === 0 ? [10, 20, 30][seedHash(productId) % 3] : 0
  const rating = (4 + (seedHash(`${productId}-rating`) % 11) / 10).toFixed(1)
  const reviewCount = 20 + (seedHash(`${productId}-reviews`) % 480)
  const isBest = seedHash(`${productId}-best`) % 4 === 0

  return { discountPercent, rating, reviewCount, isBest }
}

const REVIEW_POOL = [
  { author: '0x8a3f...9046', text: '배송도 빠르고 퀄리티 정말 좋아요! 재구매 의사 있습니다.', rating: 5, daysAgo: 2 },
  { author: '0x3c9b...d805', text: '생각보다 사이즈가 크게 나와요. 그래도 만족스러운 구매였습니다.', rating: 4, daysAgo: 5 },
  { author: '0xf12d...4c07', text: '기대 이상이에요! 마감 퀄리티도 좋고 포장도 꼼꼼했어요.', rating: 5, daysAgo: 9 },
  { author: '0x627a...2b90', text: '가격 대비 괜찮은 것 같아요. 다음에 또 살게요.', rating: 4, daysAgo: 14 },
  { author: '0xd41f...3086', text: '색상이 사진이랑 살짝 다르지만 전체적으로 만족합니다.', rating: 4, daysAgo: 21 },
  { author: '0x59e2...3b6f', text: '친구 추천으로 샀는데 저도 만족스럽네요. 강추합니다.', rating: 5, daysAgo: 30 },
]

export type MockReview = {
  author: string
  text: string
  rating: number
  date: string
}

export function getMockReviews(productId: string): MockReview[] {
  const offset = seedHash(productId) % REVIEW_POOL.length
  const count = 3 + (seedHash(`${productId}-count`) % 2) // 3~4 reviews
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const item = REVIEW_POOL[(offset + i) % REVIEW_POOL.length]
    const date = new Date(now - item.daysAgo * 24 * 60 * 60 * 1000)
    return {
      author: item.author,
      text: item.text,
      rating: item.rating,
      date: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
    }
  })
}
