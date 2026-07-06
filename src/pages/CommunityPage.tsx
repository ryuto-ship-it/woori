import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Image as ImageIcon, Video, X, ChevronLeft, ChevronRight, Flame, Edit3 } from 'lucide-react';
import '../Community.css';
import { useWallet, shortenAddress } from '../hooks/useWallet';
import { useCommunity } from '../context/CommunityContext';
import { getPlaceholderImage } from '../config/placeholderImages';
import wooriLogo from '../assets/woori-logo.png';

// TODO: swap these Unsplash placeholders for licensed real campaign/artist imagery once available.
const COMMUNITY_BANNER_SLIDES = [
  { id: 1, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=500&fit=crop&q=80' },
  { id: 2, image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=500&fit=crop&q=80' },
  { id: 3, image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&h=500&fit=crop&q=80' },
];

// NOTE: tag filtering is UI-only for now (posts don't carry tag data yet) —
// wire this up to real hashtags once posts support them.
const TRENDING_TAGS = ['#응원법', '#콘서트후기', '#직캠', '#시사회후기', '#굿즈추천', '#크루즈현장'];

const HOT_LIKE_THRESHOLD = 10;

export function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  
  return `${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
}

type TabType = 'all' | 'image' | 'video' | 'text';
type SortType = 'latest' | 'popular' | 'view';

export default function CommunityPage() {
  const { wallet, connectWallet } = useWallet();
  const { posts, addPost } = useCommunity();
  const navigate = useNavigate();

  const [filterTab, setFilterTab] = useState<TabType>('all');
  const [sortTab, setSortTab] = useState<SortType>('latest');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const [bannerIndex, setBannerIndex] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(i => (i + 1) % COMMUNITY_BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setBannerIndex(i => (i - 1 + COMMUNITY_BANNER_SLIDES.length) % COMMUNITY_BANNER_SLIDES.length);
  const nextSlide = () => setBannerIndex(i => (i + 1) % COMMUNITY_BANNER_SLIDES.length);

  const openComposer = () => (wallet.connected ? setIsWriteModalOpen(true) : connectWallet());

  // Write Modal State
  const [writeText, setWriteText] = useState('');
  const [writeImageUrls, setWriteImageUrls] = useState<string[]>(['']);
  const [writeVideoUrl, setWriteVideoUrl] = useState('');

  let filteredPosts = posts;
  if (filterTab === 'image') filteredPosts = posts.filter(p => p.mediaType === 'image');
  if (filterTab === 'video') filteredPosts = posts.filter(p => p.mediaType === 'video');
  if (filterTab === 'text') filteredPosts = posts.filter(p => p.mediaType === 'none');

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortTab === 'popular') return b.likeCount - a.likeCount;
    if (sortTab === 'view') return b.viewCount - a.viewCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handlePostClick = (postId: string) => {
    navigate(`/community/${postId}`);
  };

  const top5Posts = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);

  const topContributors = Object.entries(
    posts.reduce<Record<string, number>>((acc, p) => {
      acc[p.walletAddress] = (acc[p.walletAddress] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleWriteSubmit = () => {
    if (!wallet.connected || !writeText.trim()) return;
    
    let mediaType: 'none' | 'image' | 'video' = 'none';
    let mediaUrls: string[] = [];
    
    if (writeVideoUrl.trim()) {
      mediaType = 'video';
      mediaUrls = [writeVideoUrl.trim()];
    } else {
      const validImages = writeImageUrls.filter(url => url.trim() !== '');
      if (validImages.length > 0) {
        mediaType = 'image';
        mediaUrls = validImages;
      }
    }

    addPost({
      walletAddress: wallet.address,
      content: writeText,
      mediaType,
      mediaUrls,
    });

    setIsWriteModalOpen(false);
    setWriteText('');
    setWriteImageUrls(['']);
    setWriteVideoUrl('');
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...writeImageUrls];
    newUrls[index] = value;
    if (index === writeImageUrls.length - 1 && value.trim() !== '' && writeImageUrls.length < 5) {
      newUrls.push('');
    }
    setWriteImageUrls(newUrls);
  };

  return (
    <div className="community-page">
      <div className="page-blob page-blob-1" />
      <div className="page-blob page-blob-2" />

      <div className="community-content-wrap">
      <div className="community-header">
        <div>
          <h1 className="page-title">커뮤니티</h1>
          <p className="page-desc" style={{ marginTop: '8px' }}>자유롭게 소통하고 WOORI 토큰 보상을 받으세요.</p>
        </div>
        {wallet.connected ? (
          <button className="btn-primary" onClick={() => setIsWriteModalOpen(true)}>
            글쓰기
          </button>
        ) : (
          <button className="btn-primary" onClick={connectWallet}>
            <Wallet size={15} style={{marginRight: '6px', verticalAlign: 'text-bottom'}} />
            지갑 연결
          </button>
        )}
      </div>

      <div className="community-layout">
        <aside className="community-sidebar">
          <div className="sidebar-banner" style={{ backgroundImage: `url(${getPlaceholderImage('concert', 0, 400, 520)})` }}>
            <span className="sidebar-banner-ad">AD</span>
          </div>
          <div className="sidebar-widget">
            <h4 className="sidebar-widget-title">이번 달 인기글 TOP 5</h4>
            <ol className="community-rank-list">
              {top5Posts.map((post, i) => (
                <li key={post.id} className="community-rank-item" onClick={() => handlePostClick(post.id)}>
                  <span className="community-rank-num">{i + 1}</span>
                  <span className="community-rank-title">{post.content.length > 22 ? post.content.slice(0, 22) + '...' : post.content}</span>
                  <span className="community-rank-likes">♥ {post.likeCount}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="community-main">
      {/* Promo banner carousel */}
      <div className="community-banner">
        <span className="banner-ad-label">PROMOTION</span>
        {COMMUNITY_BANNER_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`banner-slide ${i === bannerIndex ? 'banner-slide-active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="banner-overlay" />
        <div className="banner-content">
          <h2 className="banner-title">지금, 가장 뜨거운 순간을 함께</h2>
          <p className="banner-subtitle">여러분의 이야기가 WOORI 커뮤니티를 채웁니다</p>
        </div>
        <button className="banner-arrow banner-arrow-left" onClick={prevSlide} aria-label="이전 배너">
          <ChevronLeft size={20} />
        </button>
        <button className="banner-arrow banner-arrow-right" onClick={nextSlide} aria-label="다음 배너">
          <ChevronRight size={20} />
        </button>
        <div className="banner-dots">
          {COMMUNITY_BANNER_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              className={`banner-dot ${i === bannerIndex ? 'banner-dot-active' : ''}`}
              onClick={() => setBannerIndex(i)}
              aria-label={`배너 ${i + 1}로 이동`}
            />
          ))}
        </div>
      </div>

      {/* Trending hashtags */}
      <div className="trending-tags">
        <span className="trending-label"><Flame size={13} /> 지금 뜨는 이야기</span>
        <div className="trending-tag-scroll">
          {TRENDING_TAGS.map(tag => (
            <button
              key={tag}
              className={`trending-tag ${activeTag === tag ? 'trending-tag-active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="community-filters">
        <div className="community-tabs">
          <button className={`tab ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>전체</button>
          <button className={`tab ${filterTab === 'image' ? 'active' : ''}`} onClick={() => setFilterTab('image')}>📷 사진</button>
          <button className={`tab ${filterTab === 'video' ? 'active' : ''}`} onClick={() => setFilterTab('video')}>🎬 영상</button>
          <button className={`tab ${filterTab === 'text' ? 'active' : ''}`} onClick={() => setFilterTab('text')}>💬 자유글</button>
        </div>
        <div className="community-tabs">
          <button className={`tab ${sortTab === 'latest' ? 'active' : ''}`} onClick={() => setSortTab('latest')}>최신순</button>
          <button className={`tab ${sortTab === 'popular' ? 'active' : ''}`} onClick={() => setSortTab('popular')}>인기순</button>
          <button className={`tab ${sortTab === 'view' ? 'active' : ''}`} onClick={() => setSortTab('view')}>조회순</button>
        </div>
      </div>

      {/* Table Layout */}
      <table className="community-board">
        <thead>
          <tr>
            <th style={{width: '60px'}}>번호</th>
            <th className="col-title">제목</th>
            <th style={{width: '120px'}}>글쓴이</th>
            <th style={{width: '80px'}}>작성일</th>
            <th style={{width: '60px'}}>조회</th>
            <th style={{width: '60px'}}>추천</th>
            <th style={{width: '100px'}}>적립금</th>
          </tr>
        </thead>
        <tbody>
          {sortedPosts.map(post => {
            // Extract a mock post ID number for display (just digits from ID)
            const postNum = post.id.replace(/\D/g, '');
            return (
              <tr key={post.id} onClick={() => handlePostClick(post.id)}>
                <td style={{color: '#888'}}>{postNum}</td>
                <td className="col-title">
                  <div className="board-title-wrapper">
                    {post.likeCount >= HOT_LIKE_THRESHOLD && <span className="hot-badge">HOT</span>}
                    <span className="board-title-text">{post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}</span>
                    {post.comments.length > 0 && (
                      <span className="board-comment-count">[{post.comments.length}]</span>
                    )}
                    {post.mediaType === 'image' && <span className="board-media-icon"><ImageIcon size={14}/></span>}
                    {post.mediaType === 'video' && <span className="board-media-icon"><Video size={14}/></span>}
                  </div>
                </td>
                <td><span className="board-author">{shortenAddress(post.walletAddress)}</span></td>
                <td style={{color: '#888'}}>{formatRelativeTime(post.createdAt)}</td>
                <td style={{color: '#888'}}>{post.viewCount}</td>
                <td style={{color: '#888'}}>{post.likeCount}</td>
                <td>
                  {post.rewardAmount > 0 ? (
                    <div className="board-woori-reward">
                      <img src={wooriLogo} alt="W" style={{width:'14px', height:'14px'}} />
                      +{post.rewardAmount}
                    </div>
                  ) : (
                    <span style={{color: '#555'}}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
          {sortedPosts.length === 0 && (
            <tr>
              <td colSpan={7} style={{padding: '40px', color: '#888'}}>게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
        </div>

        <aside className="community-sidebar">
          <div className="sidebar-banner" style={{ backgroundImage: `url(${getPlaceholderImage('concert', 1, 400, 520)})` }}>
            <span className="sidebar-banner-ad">AD</span>
          </div>
          <div className="sidebar-widget">
            <h4 className="sidebar-widget-title">커뮤니티 랭킹</h4>
            <ol className="community-rank-list">
              {topContributors.map(([addr, count], i) => (
                <li key={addr} className="community-rank-item">
                  <span className="community-rank-num">{i + 1}</span>
                  <span className="community-rank-title">{shortenAddress(addr)}</span>
                  <span className="community-rank-likes">{count}개</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
      </div>

      <button className="fab-write-btn" onClick={openComposer} aria-label="글쓰기">
        <Edit3 size={22} />
      </button>

      {isWriteModalOpen && (
        <div className="write-modal-overlay" onClick={() => setIsWriteModalOpen(false)}>
          <div className="write-modal" onClick={e => e.stopPropagation()}>
            <button className="write-modal-close" onClick={() => setIsWriteModalOpen(false)}><X size={24}/></button>
            <h2>새 글 쓰기</h2>
            <textarea 
              className="write-textarea" 
              placeholder="내용을 입력하세요 (최대 1000자)"
              maxLength={1000}
              value={writeText}
              onChange={e => setWriteText(e.target.value)}
            />
            
            <div className="write-attachments">
              <label className="text-sm text-muted">이미지 업로드 (최대 5장)</label>
              {writeImageUrls.map((url, i) => (
                <div key={i} className="attachment-input-group">
                  <ImageIcon size={18} className="text-muted" style={{alignSelf:'center'}} />
                  <input 
                    className="attachment-input" 
                    placeholder={`이미지 URL ${i+1}`}
                    value={url}
                    onChange={e => updateImageUrl(i, e.target.value)}
                    disabled={writeVideoUrl.trim() !== ''} 
                  />
                </div>
              ))}
              <p className="text-xs text-muted" style={{marginTop: '-4px', marginBottom: '8px'}}>* 실제 배포시 Supabase Storage 파일 업로드로 대체 필요</p>
              
              <label className="text-sm text-muted">영상 첨부 (유튜브 링크)</label>
              <div className="attachment-input-group">
                <Video size={18} className="text-muted" style={{alignSelf:'center'}} />
                <input 
                  className="attachment-input" 
                  placeholder="유튜브 URL을 입력하세요"
                  value={writeVideoUrl}
                  onChange={e => setWriteVideoUrl(e.target.value)}
                  disabled={writeImageUrls[0] !== ''} 
                />
              </div>
            </div>

            <div className="write-footer">
              <span className="text-muted text-sm">{writeText.length}/1000</span>
              <button className="btn-primary" disabled={!writeText.trim()} onClick={handleWriteSubmit}>
                게시하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
