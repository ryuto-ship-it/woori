import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import '../Shop.css';
import { useWallet } from '../hooks/useWallet';
import { useShop } from '../context/ShopContext';
import type { ProductCategory } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { getPlaceholderImage } from '../config/placeholderImages';
import { getProductDecoration } from '../utils/mockProductDecoration';
import wooriLogo from '../assets/woori-logo.png';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  digital_album: '가상 앨범',
  fashion: '패션',
  concert_ticket: '콘서트 티켓',
  other: '기타',
};

const MOCK_WOORI_BALANCE = 180;

type SortType = 'newest' | 'popular' | 'price';

// TODO: swap these Unsplash placeholders (see src/config/placeholderImages.ts) for licensed real campaign imagery.
const HERO_SLIDES = [
  {
    image: getPlaceholderImage('concert', 0, 1600, 520),
    badge: 'NEW ARRIVAL',
    title: '이번 시즌 신상품 컬렉션',
    desc: '가장 먼저 만나는 신규 굿즈, 지금 확인해보세요',
  },
  {
    image: getPlaceholderImage('fashion', 0, 1600, 520),
    badge: '한정판 콜라보',
    title: 'WOORI × KONET 스페셜 에디션',
    desc: '단 하나뿐인 한정판 아이템, 놓치지 마세요',
  },
  {
    image: getPlaceholderImage('concert', 1, 1600, 520),
    badge: 'NEW ARRIVAL',
    title: '콘서트 티켓 최신 오픈',
    desc: '가장 뜨거운 무대의 주인공이 되어보세요',
  },
];

export default function ShopPage() {
  const { wallet, connectWallet } = useWallet();
  const { products } = useShop();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [sortMode, setSortMode] = useState<SortType>('newest');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const wooriBalance = wallet.connected ? MOCK_WOORI_BALANCE : 0;

  const filteredProducts = products.filter(
    p => (categoryFilter === 'all' || p.category === categoryFilter) && p.isActive
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortMode === 'price') return a.priceWoori - b.priceWoori;
    if (sortMode === 'popular') return a.stock === null ? -1 : 1;
    return a.isNew ? -1 : 1;
  });

  // mock widgets — not real recently-viewed tracking, just a stable subset of the catalog
  const bestOfWeek = products.slice(0, 3);
  const recentlyViewed = products.slice(3, 6);

  const activeSlide = HERO_SLIDES[heroIndex];

  return (
    <div className="shop-page">
      <div className="shop-hero-carousel">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`shop-hero-slide ${i === heroIndex ? 'shop-hero-slide-active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="shop-hero-overlay" />
        <div className="shop-hero-content">
          <span className="shop-hero-badge">{activeSlide.badge}</span>
          <h1>{activeSlide.title}</h1>
          <p>{activeSlide.desc}</p>
          <a href="#shop-grid" className="btn-primary btn-hover-effect">지금 보러가기</a>
        </div>
        <button
          className="banner-arrow banner-arrow-left"
          onClick={() => setHeroIndex(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="이전 배너"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="banner-arrow banner-arrow-right"
          onClick={() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length)}
          aria-label="다음 배너"
        >
          <ChevronRight size={20} />
        </button>
        <div className="banner-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`banner-dot ${i === heroIndex ? 'banner-dot-active' : ''}`}
              onClick={() => setHeroIndex(i)}
              aria-label={`배너 ${i + 1}로 이동`}
            />
          ))}
        </div>
      </div>

      <div className="shop-container">
        <div className="shop-connect-bar">
          {wallet.connected ? (
            <div className="woori-balance-pill">
              <img src={wooriLogo} alt="WOORI" className="woori-icon" />
              보유 WOORI: <strong>{wooriBalance.toLocaleString()}개</strong>
            </div>
          ) : (
            <button className="btn-primary btn-hover-effect" onClick={connectWallet}>
              <Wallet size={16} /> 지갑 연결하고 구매하기
            </button>
          )}
        </div>

        <div className="shop-layout">
          {/* ── Left sidebar (desktop only) ────────────────────────── */}
          <aside className="shop-sidebar shop-sidebar-left">
            <div className="sidebar-widget">
              <h4 className="sidebar-widget-title">카테고리</h4>
              <div className="sidebar-category-list">
                <button className={`sidebar-category-item ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>전체</button>
                <button className={`sidebar-category-item ${categoryFilter === 'digital_album' ? 'active' : ''}`} onClick={() => setCategoryFilter('digital_album')}>가상 앨범</button>
                <button className={`sidebar-category-item ${categoryFilter === 'fashion' ? 'active' : ''}`} onClick={() => setCategoryFilter('fashion')}>패션</button>
                <button className={`sidebar-category-item ${categoryFilter === 'concert_ticket' ? 'active' : ''}`} onClick={() => setCategoryFilter('concert_ticket')}>콘서트 티켓</button>
                <button className={`sidebar-category-item ${categoryFilter === 'other' ? 'active' : ''}`} onClick={() => setCategoryFilter('other')}>기타</button>
              </div>
            </div>

            <div className="sidebar-widget">
              <h4 className="sidebar-widget-title">이번 주 베스트</h4>
              <div className="sidebar-mini-list">
                {bestOfWeek.map(p => (
                  <div key={p.id} className="sidebar-mini-item" onClick={() => navigate(`/shop/${p.id}`)}>
                    <img src={p.imageUrl} alt={p.name} />
                    <div>
                      <div className="sidebar-mini-name">{p.name}</div>
                      <div className="sidebar-mini-price"><img src={wooriLogo} className="woori-icon" alt="WOORI" />{p.priceWoori.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-banner" style={{ backgroundImage: `url(${getPlaceholderImage('fashion', 1, 400, 520)})` }}>
              <span className="sidebar-banner-ad">AD</span>
              <div className="sidebar-banner-text">
                <strong>회원 전용 혜택</strong>
                <span>WOORI 홀더만을 위한 특별 할인</span>
              </div>
            </div>
          </aside>

          {/* ── Main content ────────────────────────────────────────── */}
          <div className="shop-main">
            <div className="shop-top-bar">
              <div className="shop-tabs">
                <button className={`tab ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>전체</button>
                <button className={`tab ${categoryFilter === 'digital_album' ? 'active' : ''}`} onClick={() => setCategoryFilter('digital_album')}>가상 앨범</button>
                <button className={`tab ${categoryFilter === 'fashion' ? 'active' : ''}`} onClick={() => setCategoryFilter('fashion')}>패션</button>
                <button className={`tab ${categoryFilter === 'concert_ticket' ? 'active' : ''}`} onClick={() => setCategoryFilter('concert_ticket')}>콘서트 티켓</button>
                <button className={`tab ${categoryFilter === 'other' ? 'active' : ''}`} onClick={() => setCategoryFilter('other')}>기타</button>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortType)}
                  style={{ background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}
                >
                  <option value="newest">신상품순</option>
                  <option value="popular">인기순</option>
                  <option value="price">낮은 가격순</option>
                </select>
              </div>
            </div>

            <div className="shop-grid" id="shop-grid">
              {sortedProducts.map(product => {
                const lowStock = product.stock !== null && product.stock <= 10;
                const { discountPercent, rating, reviewCount, isBest } = getProductDecoration(product.id);
                const discountedPrice = discountPercent > 0
                  ? Math.round(product.priceWoori * (1 - discountPercent / 100))
                  : product.priceWoori;

                return (
                  <div key={product.id} className="product-card" onClick={() => navigate(`/shop/${product.id}`)}>
                    <div className="product-image-container">
                      <img src={product.imageUrl} alt={product.name} className="product-image-main" />
                      <img src={product.hoverImageUrl} alt={product.name} className="product-image-hover" />
                      <div className="product-badges">
                        {product.isNew && <span className="badge badge-new">NEW</span>}
                        {!product.isNew && isBest && <span className="badge badge-best">BEST</span>}
                        {discountPercent > 0 && <span className="badge badge-discount">{discountPercent}% OFF</span>}
                        {lowStock && <span className="badge badge-stock">품절임박</span>}
                      </div>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{CATEGORY_LABEL[product.category]}</span>
                      <div className="product-title">{product.name}</div>
                      <div className="product-rating">
                        <Star size={12} fill="currentColor" /> {rating}
                        <span className="product-review-count">({reviewCount})</span>
                      </div>
                      <div className="product-price-row">
                        {discountPercent > 0 && (
                          <span className="product-price-original">{product.priceWoori.toLocaleString()}</span>
                        )}
                        <div className="product-price">
                          <img src={wooriLogo} alt="WOORI" style={{ width: '16px', height: '16px' }} />
                          {discountedPrice.toLocaleString()}
                        </div>
                      </div>
                      <button
                        className="add-to-cart-btn"
                        onClick={e => { e.stopPropagation(); addToCart(product.id); }}
                      >
                        <ShoppingCart size={14} /> 장바구니 담기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="shop-bottom-banner"
              style={{ backgroundImage: `url(${getPlaceholderImage('concert', 0, 1600, 360)})` }}
            >
              <div className="shop-bottom-banner-overlay" />
              <div className="shop-bottom-banner-content">
                <h3>WOORI 홀더 전용 특가</h3>
                <p>지금 보유하신 WOORI로 한정 수량 특가 상품을 만나보세요</p>
              </div>
            </div>
          </div>

          {/* ── Right sidebar (desktop only) ───────────────────────── */}
          <aside className="shop-sidebar shop-sidebar-right">
            <div className="sidebar-widget">
              <h4 className="sidebar-widget-title">최근 본 상품</h4>
              <div className="sidebar-mini-list">
                {recentlyViewed.map(p => (
                  <div key={p.id} className="sidebar-mini-item" onClick={() => navigate(`/shop/${p.id}`)}>
                    <img src={p.imageUrl} alt={p.name} />
                    <div>
                      <div className="sidebar-mini-name">{p.name}</div>
                      <div className="sidebar-mini-price"><img src={wooriLogo} className="woori-icon" alt="WOORI" />{p.priceWoori.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-banner" style={{ backgroundImage: `url(${getPlaceholderImage('concert', 1, 400, 520)})` }}>
              <span className="sidebar-banner-ad">AD</span>
              <div className="sidebar-banner-text">
                <strong>신규 가입 혜택</strong>
                <span>첫 구매 시 WOORI 10개 증정</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
