import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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

type PurchaseStage = 'idle' | 'confirming' | 'processing' | 'done';

function genMockOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export default function ShopDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { wallet, connectWallet } = useWallet();
  const { products } = useShop();

  const product = products.find(p => p.id === productId);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [purchaseStage, setPurchaseStage] = useState<PurchaseStage>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  // Ticket Options
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');

  const wooriBalance = wallet.connected ? MOCK_WOORI_BALANCE : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    setPurchaseStage('idle');
  }, [productId]);

  if (!product) {
    return (
      <div style={{textAlign: 'center', padding: '100px 20px'}}>
        <h2>상품을 찾을 수 없습니다.</h2>
        <button className="btn-primary mt-4" onClick={() => navigate('/shop')}>목록으로</button>
      </div>
    );
  }

  const mockImages = [
    product.imageUrl,
    product.hoverImageUrl,
    'https://loremflickr.com/800/800/merch?random=33'
  ];

  const handleBuyClick = () => {
    if (!wallet.connected) {
      connectWallet();
      return;
    }
    if (product.category === 'concert_ticket' && (!selectedDate || !selectedSeat)) {
      alert("날짜와 좌석 등급을 선택해주세요.");
      return;
    }
    setPurchaseStage('confirming');
  };

  const confirmPurchase = () => {
    if (wooriBalance < product.priceWoori) return;
    setPurchaseStage('processing');
    setTimeout(() => {
      setOrderId(genMockOrderId());
      setPurchaseStage('done');
    }, 1500);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="shop-detail-page">
      <button className="ghost-btn" style={{marginBottom: '24px'}} onClick={() => navigate('/shop')}>
        <ArrowLeft size={18} /> 굿즈샵 목록으로
      </button>

      <div className="shop-detail-container">
        <div className="detail-gallery">
          <img src={mockImages[activeImageIdx]} alt="main product" className="detail-main-img" />
          <div className="detail-thumbs">
            {mockImages.map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt={`thumb-${i}`} 
                className={`detail-thumb ${i === activeImageIdx ? 'active' : ''}`}
                onClick={() => setActiveImageIdx(i)}
              />
            ))}
          </div>
          <p className="text-xs text-muted mt-2">* 실제 서비스시 picsum URL을 실제 이미지로 교체해야 합니다.</p>
        </div>

        <div className="detail-info">
          <span className="tag tag-gray" style={{alignSelf: 'flex-start'}}>{CATEGORY_LABEL[product.category]}</span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          
          <div className="detail-price-box">
            <h2><img src={wooriLogo} alt="WOORI" style={{width:'24px', height:'24px'}} /> {product.priceWoori.toLocaleString()} WOORI</h2>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px'}}>
              잔여 수량: {product.stock === null ? '무제한 (디지털)' : `${product.stock}개`}
            </div>

            {product.category === 'concert_ticket' && (
              <div className="ticket-options">
                <label>관람일자 선택</label>
                <select className="ticket-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
                  <option value="">날짜를 선택하세요</option>
                  <option value={product.eventDate}>{product.eventDate}</option>
                </select>
                
                <label>좌석 등급</label>
                <select className="ticket-select" value={selectedSeat} onChange={e => setSelectedSeat(e.target.value)}>
                  <option value="">좌석을 선택하세요</option>
                  <option value="VIP">VIP석</option>
                  <option value="R">R석</option>
                </select>
              </div>
            )}

            {purchaseStage === 'idle' && (
              <button className="btn-primary btn-block" style={{padding: '16px', fontSize: '1.1rem'}} onClick={handleBuyClick}>
                WOORI로 구매하기
              </button>
            )}

            {purchaseStage === 'confirming' && (
              <div className="confirm-box" style={{background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px'}}>
                {wooriBalance < product.priceWoori ? (
                  <div style={{color: '#e74c3c', textAlign: 'center'}}>
                    WOORI가 부족합니다. (현재: {wooriBalance} / 필요: {product.priceWoori})
                    <button className="ghost-btn-outline btn-block mt-3" onClick={() => setPurchaseStage('idle')}>취소</button>
                  </div>
                ) : (
                  <div style={{textAlign: 'center'}}>
                    <p style={{marginBottom: '16px'}}>정말 구매하시겠습니까?</p>
                    <div style={{display: 'flex', gap: '12px'}}>
                      <button className="btn-primary" style={{flex: 1}} onClick={confirmPurchase}>결제 확정</button>
                      <button className="ghost-btn-outline" style={{flex: 1}} onClick={() => setPurchaseStage('idle')}>취소</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {purchaseStage === 'processing' && (
              <div style={{textAlign: 'center', padding: '20px', color: 'var(--primary-color)'}}>
                <div className="shop-loading-spinner" style={{display: 'inline-block', margin: '0 auto 12px'}}></div>
                <p>결제 처리 중입니다...</p>
              </div>
            )}

            {purchaseStage === 'done' && (
              <div style={{textAlign: 'center', padding: '20px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', border: '1px solid #2ecc71'}}>
                <CheckCircle size={40} color="#2ecc71" style={{margin: '0 auto 12px'}} />
                <h3 style={{marginBottom: '8px'}}>구매 완료!</h3>
                <p className="text-muted text-sm">주문번호: {orderId}</p>
                <button className="ghost-btn-outline mt-4" onClick={() => setPurchaseStage('idle')}>추가 구매하기</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h3>이런 상품은 어떠세요?</h3>
          <div className="shop-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'}}>
            {relatedProducts.map(rel => (
              <div key={rel.id} className="product-card" onClick={() => navigate(`/shop/${rel.id}`)}>
                <div className="product-image-container">
                  <img src={rel.imageUrl} alt={rel.name} />
                </div>
                <div className="product-info" style={{padding: '12px'}}>
                  <div className="product-title" style={{fontSize: '0.95rem'}}>{rel.name}</div>
                  <div className="product-price" style={{fontSize: '1rem'}}>
                    <img src={wooriLogo} alt="WOORI" style={{width:'14px', height:'14px'}} />
                    {rel.priceWoori}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
