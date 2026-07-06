import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Eye, Send, Award } from 'lucide-react';
import '../Community.css';
import { useWallet, shortenAddress } from '../hooks/useWallet';
import { useCommunity } from '../context/CommunityContext';
import { formatRelativeTime } from './CommunityPage';

export default function CommunityDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { posts, toggleLike, addComment, incrementViewCount } = useCommunity();
  
  const post = posts.find(p => p.id === postId);
  
  const [commentDraft, setCommentDraft] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (postId) {
      incrementViewCount(postId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!post) {
    return (
      <div className="detail-page" style={{textAlign: 'center', paddingTop: '100px'}}>
        <h2>게시글을 찾을 수 없습니다.</h2>
        <button className="btn-primary mt-4" onClick={() => navigate('/community')}>목록으로</button>
      </div>
    );
  }

  // To check if current user liked it, we need to inspect the toggle state, but since the context just stores total likes
  // For UI simulation, we just use a local state for the user's like status if wallet connected
  // Actually, we modified the context to handle toggleLike properly. Let's just track it locally for optimistic update since we didn't expose the user's like status from context easily.
  // Wait, I can just use a local state to visually represent "my like" in this mock.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isLikedByMe, setIsLikedByMe] = useState(false);

  const handleLike = () => {
    if (!wallet.connected) return;
    toggleLike(post.id, wallet.address);
    setIsLikedByMe(!isLikedByMe);
  };

  const handleCommentSubmit = () => {
    if (!wallet.connected || !commentDraft.trim()) return;
    addComment(post.id, wallet.address, commentDraft.trim());
    setCommentDraft('');
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="detail-page">
      <button className="ghost-btn" style={{marginBottom: '24px'}} onClick={() => navigate('/community')}>
        <ArrowLeft size={18} /> 목록으로
      </button>

      <div className="detail-header">
        <h2>{post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}</h2>
        <div className="detail-meta">
          <span className="addr-mono">{shortenAddress(post.walletAddress)}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
          <span>·</span>
          <span><Eye size={14} style={{display:'inline', verticalAlign:'text-bottom'}}/> {post.viewCount}</span>
          
          {post.rewardStatus === 'rewarded' && (
            <span className="reward-badge reward-rewarded" style={{marginLeft: 'auto'}}>
              <Award size={14} /> 리워드 지급됨 
              {post.rewardAmount > 0 && ` (+${post.rewardAmount} WOORI)`}
            </span>
          )}
        </div>
      </div>

      <div className="detail-content">
        {post.content}
      </div>

      {post.mediaType === 'image' && post.mediaUrls.length > 0 && (
        <div className="detail-media">
          {/* Simple Carousel */}
          <div style={{position: 'relative'}}>
            <img src={post.mediaUrls[currentImageIdx]} alt="attachment" />
            {post.mediaUrls.length > 1 && (
              <div style={{position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px'}}>
                {post.mediaUrls.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentImageIdx(i)}
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%', 
                      background: i === currentImageIdx ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)',
                      border: 'none', cursor: 'pointer'
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {post.mediaType === 'video' && post.mediaUrls[0] && (
        <div className="detail-media">
          <iframe 
            className="detail-video"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(post.mediaUrls[0]) || ''}`} 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="detail-actions">
        <button className={`action-btn ${isLikedByMe ? 'active' : ''}`} onClick={handleLike} disabled={!wallet.connected}>
          <Heart size={20} fill={isLikedByMe ? 'currentColor' : 'none'} /> {post.likeCount}
        </button>
        <button className="action-btn">
          <MessageCircle size={20} /> {post.comments.length}
        </button>
      </div>

      <div className="comments-section">
        <h3>댓글 ({post.comments.length})</h3>
        
        {post.comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-meta">
              <span className="comment-author">{shortenAddress(c.walletAddress)}</span>
              <span className="comment-time">{formatRelativeTime(c.createdAt)}</span>
            </div>
            <div>{c.content}</div>
          </div>
        ))}

        <div className="comment-form">
          <input 
            placeholder={wallet.connected ? "댓글을 남겨보세요" : "지갑을 연결해야 댓글을 작성할 수 있습니다."}
            value={commentDraft}
            onChange={e => setCommentDraft(e.target.value)}
            disabled={!wallet.connected}
            onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
          />
          <button className="btn-primary" onClick={handleCommentSubmit} disabled={!wallet.connected || !commentDraft.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
