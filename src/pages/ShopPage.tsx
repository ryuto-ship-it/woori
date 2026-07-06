import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import '../Shop.css';
import { useWallet } from '../hooks/useWallet';
import { useShop } from '../context/ShopContext';
import type { ProductCategory } from '../context/ShopContext';
import wooriLogo from '../assets/woori-logo.png';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  digital_album: '가상 앨범',
  fashion: '패션',
  concert_ticket: '콘서트 티켓',
  other: '기타',
};

const MOCK_WOORI_BALANCE = 180;

type SortType = 'newest' | 'popular' | 'price';

export default function ShopPage() {
  const { wallet, connectWallet } = useWallet();
  const { products } = useShop();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [sortMode, setSortMode] = useState<SortType>('newest');

  const wooriBalance = wallet.connected ? MOCK_WOORI_BALANCE : 0;

  const filteredProducts = products.filter(
    p => (categoryFilter === 'all' || p.category === categoryFilter) && p.isActive
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortMode === 'price') return a.priceWoori - b.priceWoori;
    // Mock sorting
    if (sortMode === 'popular') return a.stock === null ? -1 : 1; 
    return a.isNew ? -1 : 1;
  });

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <h1>WOORI Goods Shop</h1>
        <p>WOORI 토큰으로 구매할 수 있는 공식 K-POP MD 상품들을 만나보세요.</p>
        {!wallet.connected && (
          <button className="btn-primary mt-4" onClick={connectWallet} style={{padding: '12px 24px'}}>
            <Wallet size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} /> 
            지갑 연결하고 구매하기
          </button>
        )}
      </div>

      <div className="shop-container">
        <div className="shop-top-bar">
          <div className="shop-tabs">
            <button className={`tab ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>전체</button>
            <button className={`tab ${categoryFilter === 'digital_album' ? 'active' : ''}`} onClick={() => setCategoryFilter('digital_album')}>가상 앨범</button>
            <button className={`tab ${categoryFilter === 'fashion' ? 'active' : ''}`} onClick={() => setCategoryFilter('fashion')}>패션</button>
            <button className={`tab ${categoryFilter === 'concert_ticket' ? 'active' : ''}`} onClick={() => setCategoryFilter('concert_ticket')}>콘서트 티켓</button>
            <button className={`tab ${categoryFilter === 'other' ? 'active' : ''}`} onClick={() => setCategoryFilter('other')}>기타</button>
          </div>
          
          <div style={{display:'flex', gap:'16px', alignItems: 'center'}}>
            {wallet.connected && (
              <div style={{color: '#d3a956', fontWeight: 'bold'}}>
                보유: {wooriBalance.toLocaleString()} WOORI
              </div>
            )}
            <select 
              value={sortMode} 
              onChange={e => setSortMode(e.target.value as SortType)}
              style={{background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px'}}
            >
              <option value="newest">신상품순</option>
              <option value="popular">인기순</option>
              <option value="price">낮은 가격순</option>
            </select>
          </div>
        </div>

        <div className="shop-grid">
          {sortedProducts.map(product => {
            const lowStock = product.stock !== null && product.stock <= 10;
            return (
              <div key={product.id} className="product-card" onClick={() => navigate(`/shop/${product.id}`)}>
                <div className="product-image-container">
                  <img src={product.imageUrl} alt={product.name} className="product-image-main" />
                  <img src={product.hoverImageUrl} alt={product.name} className="product-image-hover" />
                  <div className="product-badges">
                    {product.isNew && <span className="badge badge-new">NEW</span>}
                    {lowStock && <span className="badge badge-stock">품절임박</span>}
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-category">{CATEGORY_LABEL[product.category]}</span>
                  <div className="product-title">{product.name}</div>
                  <div className="product-price">
                    <img src={wooriLogo} alt="WOORI" style={{width:'16px', height:'16px'}} />
                    {product.priceWoori.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
