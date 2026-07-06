import { useState, type ReactNode } from 'react'
import {
  Wallet, X, Calendar, MapPin, Disc3, Shirt, Ticket, Sparkles, CheckCircle,
} from 'lucide-react'
import '../Shop.css'
import { useWallet } from '../hooks/useWallet'
import wooriLogo from '../assets/woori-logo.png'

type ProductCategory = 'digital_album' | 'fashion' | 'concert_ticket' | 'other'

// Mirrors the `products` Supabase table described in the spec.
type Product = {
  id: string
  name: string
  description: string
  category: ProductCategory
  priceWoori: number
  stock: number | null // null = unlimited / digital good
  isActive: boolean
  eventDate?: string
  eventVenue?: string
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  digital_album: '가상 앨범',
  fashion: '패션',
  concert_ticket: '콘서트 티켓',
  other: '기타',
}

const CATEGORY_ICON: Record<ProductCategory, ReactNode> = {
  digital_album: <Disc3 size={28} />,
  fashion: <Shirt size={28} />,
  concert_ticket: <Ticket size={28} />,
  other: <Sparkles size={28} />,
}

// Wallet balance shown when connected — mirrors the mock-balance pattern used on the campaign page.
// TODO: Replace with a real WOORI ERC-20 balanceOf() read.
const MOCK_WOORI_BALANCE = 180

// TODO: Replace with `supabase.from('products').select('*').eq('is_active', true)`
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'OK MADAM 2 X WOORI 스페셜 디지털 앨범',
    description: '오케이 마담 2 OST 전곡과 미공개 스코어 2곡이 수록된 디지털 앨범입니다. 구매 즉시 마이페이지에서 다운로드하실 수 있습니다.',
    category: 'digital_album',
    priceWoori: 50,
    stock: null,
    isActive: true,
  },
  {
    id: 'prod-2',
    name: '미공개 비하인드 트랙 3곡 번들',
    description: '촬영 현장 비하인드 스코어 3곡을 담은 번들입니다.',
    category: 'digital_album',
    priceWoori: 30,
    stock: null,
    isActive: true,
  },
  {
    id: 'prod-3',
    name: 'WOORI × KONET 한정판 후드티',
    description: '캠페인 기념 한정 제작 후드티입니다. 수량 소진 시 재입고되지 않습니다.',
    category: 'fashion',
    priceWoori: 120,
    stock: 6,
    isActive: true,
  },
  {
    id: 'prod-4',
    name: '프리미어 기념 티셔츠',
    description: '오케이 마담 2 프리미어 기념 그래픽 티셔츠입니다.',
    category: 'fashion',
    priceWoori: 60,
    stock: 120,
    isActive: true,
  },
  {
    id: 'prod-5',
    name: '프리미어 시사회 단독 좌석권',
    description: '8월 7일 프리미어 시사회 단독 좌석권입니다. 캠페인 응모와 별도로 즉시 구매 가능한 한정 물량입니다.',
    category: 'concert_ticket',
    priceWoori: 200,
    stock: 8,
    isActive: true,
    eventDate: '2026-08-07',
    eventVenue: '서울 CGV 용산아이파크몰',
  },
  {
    id: 'prod-6',
    name: 'VIP 애프터파티 초대권',
    description: '시사회 종료 후 진행되는 VIP 애프터파티 초대권입니다.',
    category: 'concert_ticket',
    priceWoori: 350,
    stock: 4,
    isActive: true,
    eventDate: '2026-08-07',
    eventVenue: '서울 용산 인근 비공개 장소',
  },
  {
    id: 'prod-7',
    name: '홀로그램 포토카드 세트',
    description: '출연진 홀로그램 포토카드 5종 세트입니다.',
    category: 'other',
    priceWoori: 25,
    stock: 200,
    isActive: true,
  },
  {
    id: 'prod-8',
    name: '디지털 배지 (한정 발행)',
    description: '캠페인 참여자 전용 디지털 배지입니다. 지갑에 즉시 발급됩니다.',
    category: 'other',
    priceWoori: 15,
    stock: null,
    isActive: true,
  },
]

type PurchaseStage = 'idle' | 'confirming' | 'processing' | 'done'

function genMockOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}

export default function ShopPage() {
  const { wallet, connectWallet } = useWallet()
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [purchaseStage, setPurchaseStage] = useState<PurchaseStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)

  const wooriBalance = wallet.connected ? MOCK_WOORI_BALANCE : 0

  const filteredProducts = MOCK_PRODUCTS.filter(
    p => categoryFilter === 'all' || p.category === categoryFilter,
  )

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setPurchaseStage('idle')
    setOrderId(null)
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setPurchaseStage('idle')
    setOrderId(null)
  }

  const handleBuyClick = () => {
    if (!wallet.connected) {
      connectWallet()
      return
    }
    setPurchaseStage('confirming')
  }

  // TODO: Execute the actual WOORI token transfer transaction, then insert a row
  // into the `orders` table (wallet_address, product_id, price_woori, status: 'pending').
  // Once the transaction confirms, update the order's status to 'confirmed'
  // (or 'shipped' later, for physical goods).
  const confirmPurchase = () => {
    if (!selectedProduct || wooriBalance < selectedProduct.priceWoori) return
    setPurchaseStage('processing')
    setTimeout(() => {
      setOrderId(genMockOrderId())
      setPurchaseStage('done')
    }, 900)
  }

  return (
    <div className="shop-page">
      <div className="page-header">
        <h1 className="page-title">굿즈샵</h1>
        <p className="page-desc">WOORI 토큰으로 구매할 수 있는 공식 상품들을 만나보세요.</p>
        {wallet.connected ? (
          <div className="woori-balance-pill">
            <img src={wooriLogo} alt="WOORI" className="woori-icon" />
            보유 WOORI: <strong>{wooriBalance.toLocaleString()}개</strong>
          </div>
        ) : (
          <button className="btn-primary btn-hover-effect mt-3" onClick={connectWallet}>
            <Wallet size={15} /> Connect Wallet
          </button>
        )}
      </div>

      <div className="shop-container">
        <div className="tabs shop-tabs">
          <button className={`tab ${categoryFilter === 'all' ? 'tab-active' : ''}`} onClick={() => setCategoryFilter('all')}>전체</button>
          <button className={`tab ${categoryFilter === 'digital_album' ? 'tab-active' : ''}`} onClick={() => setCategoryFilter('digital_album')}>가상 앨범</button>
          <button className={`tab ${categoryFilter === 'fashion' ? 'tab-active' : ''}`} onClick={() => setCategoryFilter('fashion')}>패션</button>
          <button className={`tab ${categoryFilter === 'concert_ticket' ? 'tab-active' : ''}`} onClick={() => setCategoryFilter('concert_ticket')}>콘서트 티켓</button>
          <button className={`tab ${categoryFilter === 'other' ? 'tab-active' : ''}`} onClick={() => setCategoryFilter('other')}>기타</button>
        </div>

        <div className="shop-grid">
          {filteredProducts.map(product => {
            const lowStock = product.stock !== null && product.stock <= 10
            return (
              <div key={product.id} className="card product-card hover-effect" onClick={() => openProduct(product)}>
                <div className="product-image">
                  {CATEGORY_ICON[product.category]}
                  {lowStock && <span className="stock-badge">품절임박 · {product.stock}개 남음</span>}
                </div>
                <div className="product-body">
                  <span className="tag tag-gray product-category-tag">{CATEGORY_LABEL[product.category]}</span>
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-price">
                    <img src={wooriLogo} alt="WOORI" className="woori-icon" />
                    {product.priceWoori.toLocaleString()}
                  </div>
                  {product.category === 'concert_ticket' && product.eventDate && (
                    <div className="product-event-info">
                      <span><Calendar size={11} /> {product.eventDate}</span>
                      {product.eventVenue && <span><MapPin size={11} /> {product.eventVenue}</span>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}><X size={18} /></button>

            {purchaseStage === 'done' ? (
              <div className="purchase-done">
                <CheckCircle size={40} className="text-gold" />
                <h3>구매가 완료되었습니다</h3>
                <p className="text-muted text-sm">주문번호 <span className="addr-mono">{orderId}</span></p>
                {selectedProduct.stock === null ? (
                  <p className="text-muted text-sm mt-2">
                    {/* TODO: My Page is out of scope for now — link once it exists */}
                    디지털 상품은 마이페이지에서 다운로드 가능합니다.
                  </p>
                ) : (
                  <p className="text-muted text-sm mt-2">실물 상품은 배송 준비가 시작되면 안내드립니다.</p>
                )}
                <button className="btn-primary btn-hover-effect mt-4" onClick={closeModal}>확인</button>
              </div>
            ) : (
              <>
                <div className="modal-product-image">{CATEGORY_ICON[selectedProduct.category]}</div>
                <span className="tag tag-gray">{CATEGORY_LABEL[selectedProduct.category]}</span>
                <h3 className="modal-product-name">{selectedProduct.name}</h3>
                <p className="modal-product-desc">{selectedProduct.description}</p>
                <div className="product-price modal-price">
                  <img src={wooriLogo} alt="WOORI" className="woori-icon" />
                  {selectedProduct.priceWoori.toLocaleString()} WOORI
                </div>

                {purchaseStage === 'idle' && (
                  <button className="btn-primary btn-hover-effect btn-block" onClick={handleBuyClick}>
                    WOORI로 구매하기
                  </button>
                )}

                {purchaseStage === 'confirming' && (
                  wooriBalance < selectedProduct.priceWoori ? (
                    <div className="insufficient-box">
                      WOORI가 부족합니다 (부족한 수량: {(selectedProduct.priceWoori - wooriBalance).toLocaleString()}개)
                    </div>
                  ) : (
                    <div className="confirm-box">
                      <p className="text-sm text-muted">{selectedProduct.priceWoori.toLocaleString()} WOORI를 사용해 구매하시겠습니까?</p>
                      <div className="confirm-actions">
                        <button className="btn-primary btn-hover-effect" onClick={confirmPurchase}>구매 확정</button>
                        <button className="ghost-btn-outline" onClick={() => setPurchaseStage('idle')}>취소</button>
                      </div>
                    </div>
                  )
                )}

                {purchaseStage === 'processing' && (
                  <div className="shop-loading">
                    <span className="shop-loading-spinner" />
                    거래 처리 중...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
