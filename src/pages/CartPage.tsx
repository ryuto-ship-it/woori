import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, CheckCircle } from 'lucide-react';
import '../Shop.css';
import { useWallet } from '../hooks/useWallet';
import { useShop } from '../context/ShopContext';
import type { Product } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { genMockOrderId } from '../utils/mockOrder';
import wooriLogo from '../assets/woori-logo.png';

const MOCK_WOORI_BALANCE = 180;

type PurchaseStage = 'idle' | 'confirming' | 'processing' | 'done';
type CartLine = { product: Product; quantity: number };

export default function CartPage() {
  const navigate = useNavigate();
  const { wallet, connectWallet } = useWallet();
  const { products } = useShop();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

  const [purchaseStage, setPurchaseStage] = useState<PurchaseStage>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  const wooriBalance = wallet.connected ? MOCK_WOORI_BALANCE : 0;

  const cartLines: CartLine[] = items.flatMap(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });

  const totalPrice = cartLines.reduce((sum, line) => sum + line.product.priceWoori * line.quantity, 0);

  const handleBuyClick = () => {
    if (!wallet.connected) {
      connectWallet();
      return;
    }
    setPurchaseStage('confirming');
  };

  // TODO: Execute the actual WOORI token transfer transaction, then insert an
  // `orders` row per line item (wallet_address, product_id, price_woori, status: 'pending').
  const confirmPurchase = () => {
    if (wooriBalance < totalPrice) return;
    setPurchaseStage('processing');
    setTimeout(() => {
      setOrderId(genMockOrderId());
      setPurchaseStage('done');
      clearCart();
    }, 1200);
  };

  return (
    <div className="shop-detail-page cart-page">
      <button className="ghost-btn" style={{ marginBottom: '24px' }} onClick={() => navigate('/shop')}>
        <ArrowLeft size={18} /> 굿즈샵 계속 둘러보기
      </button>

      <h1 className="page-title" style={{ marginBottom: '24px' }}>장바구니</h1>

      {purchaseStage === 'done' ? (
        <div className="cart-done-box">
          <CheckCircle size={44} className="text-gold" />
          <h3>구매가 완료되었습니다</h3>
          <p className="text-muted text-sm">주문번호 <span className="addr-mono">{orderId}</span></p>
          <button className="btn-primary btn-hover-effect mt-4" onClick={() => navigate('/shop')}>굿즈샵으로 돌아가기</button>
        </div>
      ) : cartLines.length === 0 ? (
        <div className="cart-empty">
          <p className="text-muted">장바구니가 비어 있습니다.</p>
          <button className="btn-primary mt-3" onClick={() => navigate('/shop')}>상품 보러가기</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cartLines.map(({ product, quantity }) => (
              <div key={product.id} className="cart-line">
                <img src={product.imageUrl} alt={product.name} className="cart-line-img" />
                <div className="cart-line-info">
                  <div className="cart-line-name">{product.name}</div>
                  <div className="product-price">
                    <img src={wooriLogo} alt="WOORI" className="woori-icon" />
                    {product.priceWoori.toLocaleString()}
                  </div>
                </div>
                <div className="cart-qty-control">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="수량 감소"><Minus size={14} /></button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={product.stock !== null && quantity >= product.stock}
                    aria-label="수량 증가"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="cart-line-subtotal">{(product.priceWoori * quantity).toLocaleString()} W</div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(product.id)} aria-label="삭제">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            {wallet.connected && (
              <div className="woori-balance-pill" style={{ marginBottom: '16px' }}>
                <img src={wooriLogo} alt="WOORI" className="woori-icon" />
                보유 WOORI: <strong>{wooriBalance.toLocaleString()}개</strong>
              </div>
            )}
            <div className="cart-total-row">
              <span>총 결제금액</span>
              <span className="cart-total-price">
                <img src={wooriLogo} alt="WOORI" className="woori-icon" />
                {totalPrice.toLocaleString()} WOORI
              </span>
            </div>

            {purchaseStage === 'idle' && (
              <button className="btn-primary btn-block btn-hover-effect" onClick={handleBuyClick}>구매하기</button>
            )}
            {purchaseStage === 'confirming' && (
              wooriBalance < totalPrice ? (
                <div className="insufficient-box">
                  WOORI가 부족합니다 (부족한 수량: {(totalPrice - wooriBalance).toLocaleString()}개)
                </div>
              ) : (
                <div className="confirm-box">
                  <p className="text-sm text-muted">{totalPrice.toLocaleString()} WOORI로 결제하시겠습니까?</p>
                  <div className="confirm-actions">
                    <button className="btn-primary" onClick={confirmPurchase}>결제 확정</button>
                    <button className="ghost-btn-outline" onClick={() => setPurchaseStage('idle')}>취소</button>
                  </div>
                </div>
              )
            )}
            {purchaseStage === 'processing' && (
              <div className="shop-loading"><span className="shop-loading-spinner" />결제 처리 중...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
