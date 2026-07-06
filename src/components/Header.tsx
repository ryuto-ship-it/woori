import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import wooriLogo from '../assets/woori-logo.png';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isCampaignActive = location.pathname.startsWith('/campaign');

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src={wooriLogo} alt="WOORI" className="logo-mark" />
          <span className="logo-text">WOORI<span className="x-accent">.</span>Foundation</span>
        </Link>
        
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>홈</Link>
          <Link to="/campaign/premiere-staking" className={`nav-link ${isCampaignActive ? 'active' : ''}`}>캠페인</Link>
          <Link to="/community" className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}>커뮤니티</Link>
          <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>굿즈샵</Link>
          <a href="#" className="nav-link">생태계</a>
          <a href="#" className="nav-link">거버넌스</a>
        </nav>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="mobile-nav">
          <Link to="/" className={`mob-nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>홈</Link>
          <Link to="/campaign/premiere-staking" className={`mob-nav-link ${isCampaignActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>캠페인</Link>
          <Link to="/community" className={`mob-nav-link ${location.pathname === '/community' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>커뮤니티</Link>
          <Link to="/shop" className={`mob-nav-link ${location.pathname === '/shop' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>굿즈샵</Link>
          <a href="#" className="mob-nav-link">생태계</a>
          <a href="#" className="mob-nav-link">거버넌스</a>
        </div>
      )}
    </header>
  );
}
