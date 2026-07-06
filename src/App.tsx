import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StakingCampaignPage from './pages/StakingCampaignPage';
import CommunityPage from './pages/CommunityPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import ShopPage from './pages/ShopPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CartPage from './pages/CartPage';
import { CommunityProvider } from './context/CommunityContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CommunityProvider>
      <ShopProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <Routes>
              <Route path="/" element={<div style={{padding: '100px', textAlign: 'center'}}>홈 페이지 (이벤트 페이지로 이동하세요)</div>} />
              <Route path="/campaign/premiere-staking" element={<StakingCampaignPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:postId" element={<CommunityDetailPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/cart" element={<CartPage />} />
              <Route path="/shop/:productId" element={<ShopDetailPage />} />
            </Routes>
          </div>
        </CartProvider>
      </ShopProvider>
    </CommunityProvider>
  );
}

export default App;
