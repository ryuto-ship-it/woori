import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Image as ImageIcon, Video, X } from 'lucide-react';
import '../Community.css';
import { useWallet, shortenAddress } from '../hooks/useWallet';
import { useCommunity } from '../context/CommunityContext';
import wooriLogo from '../assets/woori-logo.png';

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

      <div className="community-filters">
        <div className="community-tabs">
          <button className={`tab ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>전체</button>
          <button className={`tab ${filterTab === 'image' ? 'active' : ''}`} onClick={() => setFilterTab('image')}>사진</button>
          <button className={`tab ${filterTab === 'video' ? 'active' : ''}`} onClick={() => setFilterTab('video')}>영상</button>
          <button className={`tab ${filterTab === 'text' ? 'active' : ''}`} onClick={() => setFilterTab('text')}>자유글</button>
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
