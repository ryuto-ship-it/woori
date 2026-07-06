import { useState } from 'react'
import {
  Wallet, Heart, MessageCircle, Send, Image as ImageIcon, Award, Clock, TrendingUp,
} from 'lucide-react'
import '../Community.css'
import { useWallet, shortenAddress } from '../hooks/useWallet'

type RewardStatus = 'pending' | 'reviewed' | 'rewarded' | 'rejected'

type CommunityComment = {
  id: string
  walletAddress: string
  content: string
  createdAt: string // ISO
}

// Mirrors the `posts` / `post_comments` Supabase tables described in the spec.
type CommunityPost = {
  id: string
  walletAddress: string
  content: string
  imageUrl: string | null
  createdAt: string // ISO
  likeCount: number
  rewardStatus: RewardStatus
  rewardTxHash: string | null
  comments: CommunityComment[]
}

const MAX_POST_LENGTH = 500

// TODO: Replace with `supabase.from('posts').select('*, post_comments(*)').order('created_at', { ascending: false })`
const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'p5',
    walletAddress: '0x9F2c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9a',
    content: '오케이 마담 2 예고편 방금 봤는데 크루즈 배경이 미쳤네요... 8월이 너무 기다려집니다 🚢',
    imageUrl: null,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    likeCount: 3,
    rewardStatus: 'pending',
    rewardTxHash: null,
    comments: [],
  },
  {
    id: 'p4',
    walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
    content: 'WOORI 듀얼 홀더 응모권 3장 받았습니다! 다들 KONET도 같이 챙기세요 ㅎㅎ 저는 시사회 동반 초청까지 노려봅니다.',
    imageUrl: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likeCount: 14,
    rewardStatus: 'reviewed',
    rewardTxHash: null,
    comments: [
      {
        id: 'c1',
        walletAddress: '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b',
        content: '오 저도 방금 인증 완료! 화이팅입니다',
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'p3',
    walletAddress: '0x7C1e3A5b8D0f2A4c6E8b0D2f4A6c8E0b2D4f6A8c',
    content: '시사회 초청 NFT가 진짜 지갑으로 온다는 게 신기하네요. 메타마스크로 받아본 적은 없어서 살짝 긴장됩니다 😅',
    imageUrl: null,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    likeCount: 27,
    rewardStatus: 'rewarded',
    rewardTxHash: '0x4f9a2b7c1d3e5f8a0b2c4d6e8f0a2b4c6d8e0f1a',
    comments: [
      {
        id: 'c2',
        walletAddress: '0x3B7d9E1f2A4c6D8e0F1a3B5c7D9e1F3a5B7c9D1e',
        content: '메타마스크 앱 켜고 NFT 탭만 확인하면 돼요! 어렵지 않아요',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'c3',
        walletAddress: '0x9F2c1A4b7D3e5F6a8B0c2D4e6F8a0B1c3D5e7F9a',
        content: '리워드까지 받으셨네요 축하드려요!',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'p2',
    walletAddress: '0x5D9f1B3c6E8a0C2e4F6b8D0a2C4e6F8b0D2a4C6e',
    content: '박정화 배우님 액션씬 스틸컷 보고 소름 돋았습니다. 1편보다 스케일이 훨씬 커진 느낌!',
    imageUrl: null,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    likeCount: 8,
    rewardStatus: 'pending',
    rewardTxHash: null,
    comments: [],
  },
  {
    id: 'p1',
    walletAddress: '0x7C1e3A5b8D0f2A4c6E8b0D2f4A6c8E0b2D4f6A8c',
    content: '캠페인 참여 인증 완료! WOORI 보유 스냅샷 기록되는 거 보니까 이번엔 진짜 투명하게 운영되는 느낌이라 좋네요.',
    imageUrl: null,
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    likeCount: 19,
    rewardStatus: 'rejected',
    rewardTxHash: null,
    comments: [],
  },
]

function formatRelativeTime(iso: string) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}시간 전`
  return `${Math.floor(diffHr / 24)}일 전`
}

export default function CommunityPage() {
  const { wallet, connectWallet } = useWallet()

  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS)
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest')
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [pulsingPostId, setPulsingPostId] = useState<string | null>(null)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const [composerText, setComposerText] = useState('')
  const [composerImageUrl, setComposerImageUrl] = useState('')

  const sortedPosts = [...posts].sort((a, b) =>
    sortMode === 'popular'
      ? b.likeCount - a.likeCount
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // TODO: On submit, insert into Supabase `posts` table (wallet_address, content, image_url).
  // TODO: If an image file (not URL) is attached, upload to Supabase Storage first and store the resulting URL.
  const submitPost = () => {
    if (!wallet.connected || !composerText.trim()) return
    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      walletAddress: wallet.address,
      content: composerText.trim().slice(0, MAX_POST_LENGTH),
      imageUrl: composerImageUrl.trim() || null,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      rewardStatus: 'pending',
      rewardTxHash: null,
      comments: [],
    }
    setPosts(prev => [newPost, ...prev])
    setComposerText('')
    setComposerImageUrl('')
  }

  // TODO: Insert/delete a row in `post_likes` (unique on post_id + wallet_address) instead of local state.
  const toggleLike = (postId: string) => {
    if (!wallet.connected) return
    const alreadyLiked = likedPostIds.has(postId)
    setLikedPostIds(prev => {
      const next = new Set(prev)
      if (alreadyLiked) next.delete(postId)
      else next.add(postId)
      return next
    })
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likeCount: p.likeCount + (alreadyLiked ? -1 : 1) } : p,
    ))
    if (!alreadyLiked) {
      setPulsingPostId(postId)
      setTimeout(() => setPulsingPostId(null), 300)
    }
  }

  // TODO: Insert into Supabase `post_comments` table (post_id, wallet_address, content).
  const submitComment = (postId: string) => {
    const text = (commentDrafts[postId] ?? '').trim()
    if (!wallet.connected || !text) return
    const newComment: CommunityComment = {
      id: `local-${Date.now()}`,
      walletAddress: wallet.address,
      content: text,
      createdAt: new Date().toISOString(),
    }
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
    ))
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }))
  }

  return (
    <div className="community-page">
      <div className="page-header">
        <h1 className="page-title">커뮤니티</h1>
        <p className="page-desc">
          여러분이 좋아하는 아티스트에 대한 이야기를 자유롭게 나눠주세요.
          활발하고 좋은 게시물은 운영진 검토를 거쳐 WOORI 토큰으로 보답해 드립니다.
        </p>
      </div>

      <div className="community-container">
        {/* ── Wallet gate / composer ─────────────────────────────────── */}
        <section className="card composer-card">
          {!wallet.connected ? (
            <div className="wallet-idle">
              <p className="muted-text">지갑을 연결하고 커뮤니티에 참여하세요.</p>
              <button className="btn-primary" onClick={connectWallet}>
                <Wallet size={15} /> Connect Wallet
              </button>
            </div>
          ) : (
            <div className="composer">
              <textarea
                className="composer-input"
                placeholder="어떤 이야기를 나누고 싶으신가요?"
                value={composerText}
                maxLength={MAX_POST_LENGTH}
                onChange={e => setComposerText(e.target.value)}
              />
              <div className="composer-image-row">
                <ImageIcon size={14} className="text-muted" />
                <input
                  type="text"
                  className="composer-image-input"
                  placeholder="이미지 URL (선택)"
                  value={composerImageUrl}
                  onChange={e => setComposerImageUrl(e.target.value)}
                />
                {/* TODO: swap the URL input above for a Supabase Storage file upload once configured */}
              </div>
              <div className="composer-footer">
                <span className="composer-count">{composerText.length}/{MAX_POST_LENGTH}</span>
                <button
                  className="btn-primary btn-hover-effect"
                  disabled={!composerText.trim()}
                  onClick={submitPost}
                >
                  게시하기
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Sort tabs ───────────────────────────────────────────────── */}
        <div className="tabs mt-3">
          <button className={`tab ${sortMode === 'latest' ? 'tab-active' : ''}`} onClick={() => setSortMode('latest')}>
            <Clock size={12} /> 최신순
          </button>
          <button className={`tab ${sortMode === 'popular' ? 'tab-active' : ''}`} onClick={() => setSortMode('popular')}>
            <TrendingUp size={12} /> 인기순
          </button>
        </div>

        {/* ── Feed ────────────────────────────────────────────────────── */}
        <div className="feed">
          {sortedPosts.map(post => {
            const liked = likedPostIds.has(post.id)
            const expanded = expandedPostId === post.id
            return (
              <article key={post.id} className="card feed-card">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="feed-image" />
                )}
                <div className="feed-body">
                  <div className="feed-meta">
                    <span className="addr-mono">{shortenAddress(post.walletAddress)}</span>
                    <span className="feed-dot">·</span>
                    <span className="feed-time">{formatRelativeTime(post.createdAt)}</span>
                    {post.rewardStatus === 'rewarded' ? (
                      <span className="reward-badge reward-rewarded">
                        <Award size={11} /> 리워드 지급됨
                        {post.rewardTxHash && (
                          <span className="reward-tx">{shortenAddress(post.rewardTxHash)}</span>
                        )}
                      </span>
                    ) : (
                      <span className="reward-badge reward-pending">검토중</span>
                    )}
                  </div>
                  <p className="feed-content">{post.content}</p>
                  <div className="feed-actions">
                    <button
                      className={`feed-action ${liked ? 'feed-action-liked' : ''}`}
                      onClick={() => toggleLike(post.id)}
                      disabled={!wallet.connected}
                    >
                      <Heart size={15} className={pulsingPostId === post.id ? 'heart-bounce' : ''} fill={liked ? 'currentColor' : 'none'} />
                      {post.likeCount}
                    </button>
                    <button
                      className="feed-action"
                      onClick={() => setExpandedPostId(expanded ? null : post.id)}
                    >
                      <MessageCircle size={15} /> {post.comments.length}
                    </button>
                  </div>

                  {expanded && (
                    <div className="comments-panel">
                      {post.comments.map(c => (
                        <div key={c.id} className="comment-row">
                          <span className="addr-mono">{shortenAddress(c.walletAddress)}</span>
                          <span className="comment-text">{c.content}</span>
                        </div>
                      ))}
                      {wallet.connected ? (
                        <div className="comment-input-row">
                          <input
                            type="text"
                            className="comment-input"
                            placeholder="댓글을 남겨보세요"
                            value={commentDrafts[post.id] ?? ''}
                            onChange={e => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                          />
                          <button className="ghost-btn" onClick={() => submitComment(post.id)}>
                            <Send size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-muted text-sm">댓글을 남기려면 지갑을 연결하세요.</p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
