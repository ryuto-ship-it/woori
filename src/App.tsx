import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StakingCampaignPage from './pages/StakingCampaignPage';
import CommunityPage from './pages/CommunityPage';
import ShopPage from './pages/ShopPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<div style={{padding: '100px', textAlign: 'center'}}>홈 페이지 (이벤트 페이지로 이동하세요)</div>} />
        <Route path="/campaign/premiere-staking" element={<StakingCampaignPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/shop" element={<ShopPage />} />
      </Routes>
    </div>
  );
}

export default App;
