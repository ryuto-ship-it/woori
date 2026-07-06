import { useState, useEffect, useRef, type RefObject, type ReactNode } from 'react'
import {
  Wallet, Film, Star, CheckCircle, ListChecks, Stamp,
  Trophy, Zap, ChevronRight, ExternalLink,
  ShieldCheck, Gift, Search, Ticket, Bell, Send,
  User, Mail, Phone, Lock, ChevronDown, XCircle,
} from 'lucide-react'
import '../Campaign.css'
import {
  MIN_WOORI_THRESHOLD, MIN_KONET_THRESHOLD, BASE_TICKETS, DUAL_HOLDER_TICKETS,
} from '../config/campaignRules'
import { CAMPAIGN_SCHEDULE, type CampaignScheduleItem } from '../config/campaignSchedule'
import konetLogo from '../assets/konet-logo.png'
import wooriFooterLogo from '../assets/woori-logo.png'
import posterImg from '../assets/ok-madam-2-poster.png'

const TRAILER_YOUTUBE_ID = '5LYLZgxcUPE'

type WalletState = {
  connected: boolean
  address: string
}

type StepState = 1 | 2 | 3 | 4 | 5

type InfoSubmitState = 'idle' | 'loading' | 'done'

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'WOORI 토큰을 얼마나 보유해야 응모할 수 있나요?',
    a: `${MIN_WOORI_THRESHOLD.toLocaleString()} WOORI 이상 보유 시 기본 응모 자격이 주어집니다.`,
  },
  {
    q: '토큰을 락업(잠금)해야 하나요?',
    a: '아니요. 스테이킹처럼 토큰을 묶어둘 필요 없이, 보유하고 계신 것만으로 응모 자격이 주어집니다. 캠페인 기간 중 정해진 시점마다 보유량을 확인(스냅샷)합니다.',
  },
  {
    q: 'KONET도 꼭 보유해야 하나요?',
    a: `필수는 아니지만, WOORI ${MIN_WOORI_THRESHOLD.toLocaleString()}개 + KONET ${MIN_KONET_THRESHOLD.toLocaleString()}개를 함께 보유하시면 듀얼 홀더 자격으로 응모권 ${DUAL_HOLDER_TICKETS}장과 동반 1인 무료 초청 혜택을 받으실 수 있습니다.`,
  },
  {
    q: '참여 기록은 어떻게 확인하나요?',
    a: '각 참여 단계마다 KONET 블록체인에 기록된 트랜잭션 해시와 조회 블록 번호가 제공되며, KONET Explorer에서 누구나 직접 확인하실 수 있습니다.',
  },
  {
    q: '당첨 결과는 언제, 어떻게 알 수 있나요?',
    a: '개봉 전 이메일 및 앱 알림으로 개별 안내됩니다.',
  },
  {
    q: '여러 지갑으로 참여하면 응모권을 더 받을 수 있나요?',
    a: '각 지갑은 독립적으로 최소 보유 기준을 충족해야 응모 자격이 주어지며, 캠페인은 실제 보유 자산을 기준으로 공정하게 운영됩니다.',
  },
]

type ScheduleStatus = 'completed' | 'active' | 'upcoming'

function getScheduleStatus(item: CampaignScheduleItem, now: Date): ScheduleStatus {
  const start = new Date(`${item.startDate}T00:00:00+09:00`)
  const end = new Date(`${item.endDate ?? item.startDate}T23:59:59+09:00`)
  if (now > end) return 'completed'
  if (now >= start) return 'active'
  return 'upcoming'
}

function formatScheduleDate(item: CampaignScheduleItem) {
  const start = new Date(`${item.startDate}T00:00:00+09:00`)
  const startLabel = `${start.getMonth() + 1}월 ${start.getDate()}일`
  if (!item.endDate) return startLabel
  const end = new Date(`${item.endDate}T00:00:00+09:00`)
  return `${startLabel}~${end.getDate()}일`
}

// Custom hook for count-up animation
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeProgress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])
  return count
}

// Fires once when the element scrolls into view — powers the section fade-ins
function useInView<T extends HTMLElement>(threshold = 0.15): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'faq-item-open' : ''}`}>
      <button type="button" className="faq-question" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <ChevronRight size={16} className="faq-chevron" />
      </button>
      <div className="faq-answer-wrap">
        <p className="faq-answer">{a}</p>
      </div>
    </div>
  )
}

// Floating-label input used by the participant info step — shows a live
// valid/invalid icon once the field has content, without nagging on an empty field.
function FloatingField({
  icon, label, value, onChange, valid, showError, errorMessage, inputMode, maxLength,
}: {
  icon: ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  valid: boolean
  showError: boolean
  errorMessage: string
  inputMode?: 'text' | 'email' | 'tel'
  maxLength?: number
}) {
  const hasValue = value.length > 0
  return (
    <div className={`float-field ${hasValue ? 'float-field-filled' : ''} ${showError ? 'float-field-error' : ''}`}>
      <span className="float-field-icon">{icon}</span>
      <input
        className="float-field-input"
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder=" "
        onChange={e => onChange(e.target.value)}
      />
      <label className="float-field-label">{label}</label>
      <span className="float-field-status">
        {hasValue && valid && <CheckCircle size={16} className="float-field-check" />}
        {showError && <XCircle size={16} className="float-field-x" />}
      </span>
      {showError && <p className="float-field-error-msg">{errorMessage}</p>}
    </div>
  )
}

export default function StakingCampaignPage() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: '' })
  const [currentStep, setCurrentStep] = useState<StepState>(1)
  const [selectedOption, setSelectedOption] = useState<'snapshot' | 'dual' | null>(null)

  // Entry states
  const [entryHash, setEntryHash] = useState<string | null>(null)
  const [tickets, setTickets] = useState(0)

  // Participant info step (mock submission — no Supabase write here)
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentExpanded, setConsentExpanded] = useState(false)
  const [infoSubmitState, setInfoSubmitState] = useState<InfoSubmitState>('idle')

  // KONET balance lookup — brief loading state + mock block number
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [snapshotBlock, setSnapshotBlock] = useState<number | null>(null)

  // Mock Data
  const MOCK_AVG_WOORI = 1500
  const MOCK_KONET = 250
  const MOCK_SNAPSHOT_COUNT = 5
  const MOCK_TOTAL_PARTICIPANTS = 1284
  const MOCK_TOTAL_ONCHAIN_RECORDS = 1284
  const MOCK_LATEST_BLOCK = 1284392

  const woori = wallet.connected ? MOCK_AVG_WOORI : 0
  const konet = wallet.connected ? MOCK_KONET : 0
  const isBasicEligible = wallet.connected && woori >= MIN_WOORI_THRESHOLD
  const isDualHolder = isBasicEligible && konet >= MIN_KONET_THRESHOLD
  const wooriShortfall = Math.max(0, MIN_WOORI_THRESHOLD - woori)
  const konetShortfall = Math.max(0, MIN_KONET_THRESHOLD - konet)

  const animatedWoori = useCountUp(wallet.connected && !balanceLoading ? MOCK_AVG_WOORI : 0)
  const animatedParticipants = useCountUp(currentStep === 5 ? MOCK_TOTAL_PARTICIPANTS : 0, 1200)
  const animatedRecords = useCountUp(currentStep === 5 ? MOCK_TOTAL_ONCHAIN_RECORDS : 0, 1200)

  // Scroll-triggered fade-ins for the new landing-page sections
  const [trailerRef, trailerInView] = useInView<HTMLElement>()
  const [overviewRef, overviewInView] = useInView<HTMLElement>()
  const [hiwRef, hiwInView] = useInView<HTMLElement>()
  const [benefitsRef, benefitsInView] = useInView<HTMLElement>()
  const [trustRef, trustInView] = useInView<HTMLElement>()
  const [nftRef, nftInView] = useInView<HTMLElement>()
  const [faqRef, faqInView] = useInView<HTMLElement>()

  // Used to derive each timeline step's completed/active/upcoming status
  const now = new Date()

  // Trust section counters animate once the section scrolls into view, not on mount
  const trustParticipants = useCountUp(trustInView ? MOCK_TOTAL_PARTICIPANTS : 0, 1500)
  const trustRecords = useCountUp(trustInView ? MOCK_TOTAL_ONCHAIN_RECORDS : 0, 1500)
  const trustBlock = useCountUp(trustInView ? MOCK_LATEST_BLOCK : 0, 1500)

  // D-Day auto calc
  const [dDay, setDDay] = useState<number>(0)
  useEffect(() => {
    const targetDate = new Date('2026-08-12T00:00:00+09:00').getTime()
    const now = new Date().getTime()
    const diff = targetDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    setDDay(days > 0 ? days : 0)
  }, [])

  // TODO: Replace with wagmi/ethers.js wallet connection + KONET balanceOf/getBlockNumber reads
  const connectWallet = () => {
    setWallet({ connected: true, address: '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b' })
    setBalanceLoading(true)
    setTimeout(() => {
      setBalanceLoading(false)
      setSnapshotBlock(1_000_000 + Math.floor(Math.random() * 500_000))
    }, 800)
  }

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const genMockTxHash = () => {
    const chars = '0123456789abcdef'
    let hash = '0x'
    for (let i = 0; i < 40; i++) hash += chars[Math.floor(Math.random() * chars.length)]
    return hash
  }

  const executeAction = () => {
    const earnedTickets = selectedOption === 'dual' ? DUAL_HOLDER_TICKETS : BASE_TICKETS
    setTickets(earnedTickets)
    setEntryHash(genMockTxHash())
    setCurrentStep(5)
  }

  // Participant info validation — errors only surface once the field has content,
  // so an untouched empty field doesn't show red on first render.
  const isNameValid = participantName.trim().length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail)
  const isPhoneValid = /^01[016789]-\d{3,4}-\d{4}$/.test(participantPhone)
  const isInfoFormValid = isNameValid && isEmailValid && isPhoneValid && consentChecked

  const formatPhoneInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    if (digits.length < 4) return digits
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  // TODO: Insert participant info into Supabase (table: participants) — mock only for now.
  const submitParticipantInfo = () => {
    if (!isInfoFormValid || infoSubmitState !== 'idle') return
    setInfoSubmitState('loading')
    setTimeout(() => {
      setInfoSubmitState('done')
      setTimeout(() => setCurrentStep(4), 500)
    }, 800)
  }

  return (
    <div className="campaign-page">
      {/* ── Section 1: Hero ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg cinematic-bg">
          <div className="hero-glow glow-gold" />
          <div className="hero-glow glow-purple" />
          <div className="film-grain-overlay" />
        </div>
        <div className="hero-layout">
          <div className="hero-content">
            <div className="hero-badge pill-badge">
              <Film size={13} />
              <span>Exclusive Premiere Access</span>
            </div>
            <h1 className="hero-title tracking-tight">
              WOORI <span className="x-accent">×</span> OK Madam 2
            </h1>
            <div className="countdown-pill mt-4">
              <span className="d-day">D-{dDay}</span>
              <span className="date">8월 12일 대개봉</span>
            </div>
            <p className="hero-powered mt-4">
              <img src={konetLogo} alt="KONET" className="konet-logo-inline" />
              Powered by KONET
            </p>
            <p className="hero-powered-desc">
              KONET은 이 캠페인의 참여 기록을 블록체인에 남기는 인프라입니다.
            </p>
            <a href="#wizard" className="btn-primary btn-hover-effect mt-5">
              지금 응모하기 <ChevronRight size={16} />
            </a>
          </div>
          <div className="hero-poster-wrap">
            <img src={posterImg} alt="오케이 마담 2 포스터" className="hero-poster" />
          </div>
        </div>
      </section>

      {/* ── Section 2: Official Trailer ───────────────────────────────── */}
      <section
        ref={trailerRef}
        className={`spacing-rhythm-lg fade-in-section ${trailerInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">오케이 마담 2 공식 예고편 <span className="text-muted text-sm">Official Trailer</span></h3>
          <div className="trailer-frame">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${TRAILER_YOUTUBE_ID}`}
              title="오케이 마담 2 공식 예고편"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <p className="trailer-caption text-center mt-3">8월 12일, 스크린에서 만나기 전 먼저 확인해보세요.</p>
        </div>
      </section>

      {/* ── Section 3: Campaign Overview ─────────────────────────────── */}
      <section
        ref={overviewRef}
        className={`campaign-desc spacing-rhythm-lg fade-in-section ${overviewInView ? 'fade-in-visible' : ''}`}
      >
        <div className="desc-inner">
          <h2 className="desc-headline">
            당신을 오케이 마담 2 프리미어 시사회에 초대합니다
          </h2>
          <p className="desc-invite-sub mt-3">
            8월 12일, 스크린에 오르기 전 — 가장 먼저 그 순간을 만날 분들을 찾습니다.
            지금 WOORI를 보유하고 계신다면, 이미 초대장은 준비되어 있습니다.
          </p>
          <p className="desc-subline mt-4">
            지갑을 연결하는 것만으로 응모가 시작됩니다. 별도로 뭔가를 사거나, 토큰을 묶어두거나, 복잡한 절차를 거칠 필요는 없습니다.
          </p>
          <p className="desc-subline mt-2">
            이번 캠페인은 한 가지가 더 다릅니다. 여러분의 참여 기록은 KONET 블록체인에 그대로 남습니다.
            조회에 사용된 블록 번호를 공개하니, 원하시면 KONET Explorer에서 직접 확인하실 수 있습니다.
          </p>

          <div className="overview-grid mt-5">
            <div className="card overview-card">
              <Wallet size={36} className="icon-gold overview-icon" />
              <h3 className="overview-title">무엇을 하나요</h3>
              <p className="overview-desc">WOORI 보유만으로 시사회 응모 자격을 얻습니다.</p>
            </div>
            <div className="card overview-card">
              <ShieldCheck size={36} className="icon-purple overview-icon" />
              <h3 className="overview-title">어떻게 증명되나요</h3>
              <p className="overview-desc">모든 참여가 KONET 블록체인에 검증 가능하게 기록됩니다.</p>
            </div>
            <div className="card overview-card">
              <Gift size={36} className="icon-gold overview-icon" />
              <h3 className="overview-title">무엇을 받나요</h3>
              <p className="overview-desc">시사회 초청권과 KONET 듀얼 홀더 추가 혜택을 받습니다.</p>
            </div>
          </div>

          <div className="cta-inline mt-5">
            <a href="#wizard" className="btn-primary btn-hover-effect">
              지금 참여 조건 확인하기 <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 4: How it Works ───────────────────────────────────── */}
      <section
        ref={hiwRef}
        className={`section-shade-b spacing-rhythm-lg fade-in-section ${hiwInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">참여 방법</h3>
          <div className="hiw-grid">
            <div className="hiw-step">
              <div className="hiw-icon"><Wallet size={26} /></div>
              <span className="hiw-num">STEP 1</span>
              <h4 className="hiw-title">지갑 연결</h4>
              <p className="hiw-desc">WOORI 지갑을 연결하세요</p>
            </div>
            <ChevronRight size={18} className="hiw-arrow" />
            <div className="hiw-step">
              <div className="hiw-icon"><Search size={26} /></div>
              <span className="hiw-num">STEP 2</span>
              <h4 className="hiw-title">보유량 확인</h4>
              <p className="hiw-desc">KONET에서 실시간으로 보유량을 확인합니다</p>
            </div>
            <ChevronRight size={18} className="hiw-arrow" />
            <div className="hiw-step">
              <div className="hiw-icon"><Ticket size={26} /></div>
              <span className="hiw-num">STEP 3</span>
              <h4 className="hiw-title">응모권 발급</h4>
              <p className="hiw-desc">보유량에 따라 응모권이 자동 지급됩니다</p>
            </div>
            <ChevronRight size={18} className="hiw-arrow" />
            <div className="hiw-step">
              <div className="hiw-icon"><Bell size={26} /></div>
              <span className="hiw-num">STEP 4</span>
              <h4 className="hiw-title">결과 발표</h4>
              <p className="hiw-desc">개봉 전 이메일로 당첨 결과를 안내합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Benefits Comparison ────────────────────────────── */}
      <section
        ref={benefitsRef}
        className={`spacing-rhythm-lg fade-in-section ${benefitsInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">참여 혜택 비교</h3>

          <div className="benefits-table-wrap">
            <table className="benefits-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>조건</th>
                  <th>응모권</th>
                  <th>추가 혜택</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>기본 참여</td>
                  <td>WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 이상 보유</td>
                  <td>{BASE_TICKETS}장</td>
                  <td>-</td>
                </tr>
                <tr className="benefits-row-featured">
                  <td><span className="benefits-badge">추천</span>듀얼 홀더</td>
                  <td>WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 + KONET {MIN_KONET_THRESHOLD.toLocaleString()}개 이상 보유</td>
                  <td>{DUAL_HOLDER_TICKETS}장</td>
                  <td>동반 1인 무료 초청</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="benefits-cards">
            <div className="card benefits-card">
              <h4 className="opt-title">기본 참여</h4>
              <dl className="benefits-card-list">
                <div><dt>조건</dt><dd>WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 이상 보유</dd></div>
                <div><dt>응모권</dt><dd>{BASE_TICKETS}장</dd></div>
                <div><dt>추가 혜택</dt><dd>-</dd></div>
              </dl>
            </div>
            <div className="card benefits-card benefits-card-featured">
              <span className="benefits-badge">추천</span>
              <h4 className="opt-title">듀얼 홀더</h4>
              <dl className="benefits-card-list">
                <div><dt>조건</dt><dd>WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 + KONET {MIN_KONET_THRESHOLD.toLocaleString()}개 이상 보유</dd></div>
                <div><dt>응모권</dt><dd>{DUAL_HOLDER_TICKETS}장</dd></div>
                <div><dt>추가 혜택</dt><dd>동반 1인 무료 초청</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="main wizard-container spacing-rhythm-lg" id="wizard">
        {/* ── Section 6: Journey Stepper ───────────────────────────── */}
        <div className="stepper">
          
          {/* STEP 1: Wallet */}
          <div className={`step-card spacing-rhythm-sm ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'locked'}`}>
            <div className="step-header" onClick={() => currentStep > 1 && setCurrentStep(1)}>
              <div className="step-icon">
                {currentStep > 1 ? <CheckCircle size={20} /> : <Wallet size={20} />}
              </div>
              <h3 className="step-title">지갑 연결 및 스냅샷 확인</h3>
              {currentStep > 1 && (
                <div className="step-summary">
                  <span className="addr-mono">{short(wallet.address)}</span>
                </div>
              )}
            </div>
            
            {currentStep === 1 && (
              <div className="step-body transition-slide">
                <p className="step-desc text-muted">지갑을 연결하여 캠페인 기간 동안 기록된 보유량 스냅샷을 확인하세요.</p>
                {!wallet.connected ? (
                  <button className="btn-primary btn-large btn-hover-effect" onClick={connectWallet}>
                    <Wallet size={18} /> Connect Wallet
                  </button>
                ) : balanceLoading ? (
                  <div className="chain-loading">
                    <span className="chain-loading-spinner" />
                    KONET 네트워크에서 확인 중...
                  </div>
                ) : (
                  <div className="snapshot-card">
                    <div className="snapshot-header">
                      <Zap size={16} className="text-purple"/>
                      <span>홀더 로열티 스냅샷 활성화 됨</span>
                    </div>
                    <div className="snapshot-body">
                      <div className="snapshot-stat">
                        <span className="stat-label">누적 스냅샷 기록</span>
                        <span className="stat-value">{MOCK_SNAPSHOT_COUNT}회</span>
                      </div>
                      <div className="snapshot-divider" />
                      <div className="snapshot-stat">
                        <span className="stat-label">평균 WOORI 보유량</span>
                        <span className="stat-value text-gold count-anim">{animatedWoori.toLocaleString()}</span>
                        {/* TODO: real block number from provider.getBlockNumber() at read time */}
                        {snapshotBlock && (
                          <span className="block-ref">KONET 블록 #{snapshotBlock.toLocaleString()} 기준</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted mt-3 text-center">캠페인 기간 중 보유 스냅샷이 매일 자동으로 기록됩니다.</p>
                    {/* TODO: link to KONET Explorer address/block page once available */}
                    <div className="text-center mt-3">
                      <a href="#" className="explorer-link" onClick={e => e.preventDefault()}>
                        KONET Explorer에서 확인 <ExternalLink size={12} />
                      </a>
                    </div>
                    <button className="btn-primary btn-hover-effect mt-4" onClick={() => setCurrentStep(2)}>
                      다음 단계로 <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Option Select */}
          <div className={`step-card spacing-rhythm-sm ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'locked'}`}>
            <div className="step-header" onClick={() => (currentStep > 2 || currentStep === 2) && wallet.connected && setCurrentStep(2)}>
              <div className="step-icon">
                {currentStep > 2 ? <CheckCircle size={20} /> : <ListChecks size={20} />}
              </div>
              <h3 className="step-title">참여 방식 선택</h3>
              {currentStep > 2 && selectedOption && (
                <div className="step-summary">
                  <span>{selectedOption === 'snapshot' ? '기본 참여' : '듀얼 홀더'} 선택됨</span>
                </div>
              )}
            </div>

            {currentStep === 2 && (
              <div className="step-body transition-slide">
                <p className="step-desc text-muted">원하시는 참여 방식을 선택해주세요.</p>
                <div className="option-cards">
                  {/* Option 1: Basic Snapshot */}
                  <div
                    className={`opt-card hover-effect ${selectedOption === 'snapshot' ? 'selected' : ''} ${!isBasicEligible ? 'disabled' : ''}`}
                    onClick={() => isBasicEligible && setSelectedOption('snapshot')}
                  >
                    <Star size={24} className="opt-icon-gold mb-2" />
                    <h4 className="opt-title">기본 참여</h4>
                    <p className="opt-desc">WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 이상 → 응모권 {BASE_TICKETS}장</p>
                    {!isBasicEligible && wallet.connected && (
                      <span className="badge-locked mt-2">WOORI {wooriShortfall.toLocaleString()}개 부족</span>
                    )}
                  </div>

                  {/* Option 2: Dual Holder — emphasized as the preferred path */}
                  <div
                    className={`opt-card opt-card-featured hover-effect ${selectedOption === 'dual' ? 'selected' : ''} ${!isDualHolder ? 'disabled' : ''}`}
                    onClick={() => isDualHolder && setSelectedOption('dual')}
                  >
                    <span className="opt-ribbon">추천</span>
                    <Trophy size={24} className="opt-icon-purple mb-2" />
                    <h4 className="opt-title">듀얼 홀더</h4>
                    <div className="opt-ticket-highlight">
                      {DUAL_HOLDER_TICKETS}<span className="opt-ticket-unit">장</span>
                    </div>
                    <p className="opt-desc">
                      WOORI {MIN_WOORI_THRESHOLD.toLocaleString()}개 + KONET {MIN_KONET_THRESHOLD.toLocaleString()}개 이상
                      <br />동반 1인 무료 초청 포함
                    </p>
                    {!isDualHolder && wallet.connected && (
                      <span className="badge-locked mt-2">
                        {wooriShortfall > 0 && konetShortfall > 0
                          ? `WOORI ${wooriShortfall.toLocaleString()}개 · KONET ${konetShortfall.toLocaleString()}개 부족`
                          : wooriShortfall > 0
                            ? `WOORI ${wooriShortfall.toLocaleString()}개 부족`
                            : `KONET ${konetShortfall.toLocaleString()}개 부족`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="step-actions mt-4 text-center">
                  <button
                    className="btn-primary btn-hover-effect"
                    disabled={!selectedOption}
                    onClick={() => setCurrentStep(3)}
                  >
                    이 조건으로 계속하기 <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Participant Info */}
          <div className={`step-card spacing-rhythm-sm ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'locked'}`}>
            <div className="step-header" onClick={() => currentStep > 3 && setCurrentStep(3)}>
              <div className="step-icon">
                {currentStep > 3 ? <CheckCircle size={20} /> : <User size={20} />}
              </div>
              <h3 className="step-title">참여자 정보 입력</h3>
            </div>

            {currentStep === 3 && (
              <div className="step-body transition-slide-spring">
                <div className="info-form-card">
                  <div className="info-security-note">
                    <Lock size={14} className="info-security-icon" />
                    <span>안전하게 보호됩니다</span>
                  </div>

                  <FloatingField
                    icon={<User size={16} />}
                    label="이름"
                    value={participantName}
                    onChange={setParticipantName}
                    valid={isNameValid}
                    showError={participantName.length > 0 && !isNameValid}
                    errorMessage="이름을 2자 이상 입력해주세요."
                  />
                  <FloatingField
                    icon={<Mail size={16} />}
                    label="이메일"
                    value={participantEmail}
                    onChange={setParticipantEmail}
                    valid={isEmailValid}
                    showError={participantEmail.length > 0 && !isEmailValid}
                    errorMessage="올바른 이메일 형식이 아닙니다."
                    inputMode="email"
                  />
                  <FloatingField
                    icon={<Phone size={16} />}
                    label="휴대폰번호"
                    value={participantPhone}
                    onChange={v => setParticipantPhone(formatPhoneInput(v))}
                    valid={isPhoneValid}
                    showError={participantPhone.length > 0 && !isPhoneValid}
                    errorMessage="010-0000-0000 형식으로 입력해주세요."
                    inputMode="tel"
                    maxLength={13}
                  />

                  <div className="consent-row">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={consentChecked}
                      className={`consent-checkbox ${consentChecked ? 'consent-checkbox-checked' : ''}`}
                      onClick={() => setConsentChecked(c => !c)}
                    >
                      <svg viewBox="0 0 16 16" className="consent-checkbox-svg">
                        <path d="M3 8.5L6.5 12L13 4.5" />
                      </svg>
                    </button>
                    <span className="consent-label">개인정보 수집 및 이용에 동의합니다 (필수)</span>
                  </div>

                  <button
                    type="button"
                    className="consent-accordion-toggle"
                    onClick={() => setConsentExpanded(e => !e)}
                  >
                    상세 내용 보기
                    <ChevronDown size={14} className={`consent-accordion-chevron ${consentExpanded ? 'rotated' : ''}`} />
                  </button>
                  <div className={`consent-accordion-panel ${consentExpanded ? 'open' : ''}`}>
                    <div className="consent-accordion-inner">
                      <p className="consent-accordion-text">
                        수집 항목: 이름, 이메일, 휴대폰번호. 수집 목적: 시사회 초청 안내 및 당첨자 발표.
                        보유 기간: 캠페인 종료 후 즉시 파기됩니다. 동의를 거부하실 수 있으나,
                        미동의 시 시사회 초청 안내를 받으실 수 없습니다.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary btn-hover-effect btn-block info-submit-btn mt-4"
                    disabled={!isInfoFormValid || infoSubmitState !== 'idle'}
                    onClick={submitParticipantInfo}
                  >
                    {infoSubmitState === 'loading' ? (
                      <span className="btn-spinner" />
                    ) : infoSubmitState === 'done' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <>다음 단계로 <ChevronRight size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: Execution */}
          <div className={`step-card spacing-rhythm-sm ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'locked'}`}>
            <div className="step-header" onClick={() => currentStep > 4 && setCurrentStep(4)}>
              <div className="step-icon">
                {currentStep > 4 ? <CheckCircle size={20} /> : <Stamp size={20} />}
              </div>
              <h3 className="step-title">인증 및 실행</h3>
            </div>

            {currentStep === 4 && (
              <div className="step-body transition-slide">
                <div className="exec-box">
                  <Stamp size={32} className="text-purple mb-2" />
                  <p className="text-muted">모든 참여 기록은 KONET 메인넷에 투명하게 기록됩니다.</p>
                  <button className="btn-primary btn-exec btn-hover-effect mt-4" onClick={executeAction}>
                    참여 기록 온체인에 인증하기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: Complete */}
          <div className={`step-card spacing-rhythm-sm ${currentStep === 5 ? 'active' : 'locked'}`}>
            <div className="step-header">
              <div className="step-icon">
                <CheckCircle size={20} className="text-gold" />
              </div>
              <h3 className="step-title">참여 완료</h3>
            </div>

            {currentStep === 5 && (
              <div className="step-body transition-slide text-center">
                <div className="complete-hero">
                  <Trophy size={48} className="text-gold mb-3 mx-auto complete-check-bounce" style={{ margin: '0 auto' }} />
                  <h2>참여가 완료되었습니다!</h2>
                  <p className="final-tickets mt-2">최종 응모권: <strong>{tickets}장</strong></p>
                </div>

                <div className="onchain-record-card hover-effect">
                  <div className="rc-head">
                    <Zap size={14} className="text-purple"/> 내 참여 기록 보기 (KONET)
                  </div>
                  <div className="rc-body">
                    <div className="rc-row">
                      <span className="text-muted text-sm">참여 트랜잭션</span>
                      <span className="hash-badge">{entryHash ? short(entryHash) : ''}</span>
                    </div>
                    {/* TODO: link to KONET Explorer tx page once available, e.g. `https://explorer.konet.network/tx/${entryHash}` */}
                    <a href="#" className="explorer-link" onClick={e => e.preventDefault()}>Explorer에서 확인 <ExternalLink size={12}/></a>
                  </div>
                </div>

                <p className="global-counter-line mt-4">
                  지금까지 <strong className="text-gold">{animatedParticipants.toLocaleString()}</strong>명이 참여했고,{' '}
                  <strong className="text-purple">{animatedRecords.toLocaleString()}</strong>건이 KONET에 기록되었습니다.
                </p>

                <p className="email-notice mt-4 text-muted text-sm">
                  시사회 응모 결과는 추후 이메일 및 앱 알림으로 안내될 예정입니다.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 7: Trust Indicators / Live Stats ──────────────────── */}
      <section
        ref={trustRef}
        className={`section-shade-b spacing-rhythm-lg fade-in-section ${trustInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">실시간 캠페인 현황</h3>
          <div className="trust-grid">
            <div className="trust-stat">
              <span className="trust-value text-gold">{trustParticipants.toLocaleString()}</span>
              <span className="trust-label">누적 참여자 수</span>
              {/* TODO: link to KONET Explorer address list once available */}
              <a href="#" className="trust-link" onClick={e => e.preventDefault()}>
                KONET Explorer에서 확인하기 <ExternalLink size={11} />
              </a>
            </div>
            <div className="trust-stat">
              <span className="trust-value text-purple">{trustRecords.toLocaleString()}</span>
              <span className="trust-label">KONET 온체인 기록 건수</span>
              {/* TODO: link to KONET Explorer tx list once available */}
              <a href="#" className="trust-link" onClick={e => e.preventDefault()}>
                KONET Explorer에서 확인하기 <ExternalLink size={11} />
              </a>
            </div>
            <div className="trust-stat">
              <span className="trust-value text-gold">#{trustBlock.toLocaleString()}</span>
              <span className="trust-label">최근 조회 블록 번호</span>
              {/* TODO: link to KONET Explorer block page once available */}
              <a href="#" className="trust-link" onClick={e => e.preventDefault()}>
                KONET Explorer에서 확인하기 <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="main wizard-container spacing-rhythm-lg">
        {/* ── Section 8: Campaign Schedule (vertical timeline) ────────── */}
        <section className="round-section spacing-rhythm-lg">
          <h3 className="section-heading text-center">캠페인 진행 일정</h3>
          <div className="timeline">
            {CAMPAIGN_SCHEDULE.map(item => {
              const status = getScheduleStatus(item, now)
              const icon = item.id === 4
                ? <Send size={16} />
                : item.id === 5
                  ? <Film size={16} />
                  : undefined
              return (
                <div key={item.id} className={`timeline-item timeline-item-${status}`}>
                  <div className="timeline-marker-col">
                    <div className={`timeline-marker ${icon ? 'timeline-marker-featured' : ''}`}>
                      {icon ?? (status === 'completed' ? <CheckCircle size={14} /> : null)}
                    </div>
                    <div className="timeline-line" />
                  </div>
                  <div className="timeline-card">
                    <span className="timeline-date">{formatScheduleDate(item)}</span>
                    <h4 className="timeline-title">{item.title}</h4>
                    <p className="timeline-desc">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Roadmap Note ──────────────────────────────────────────── */}
        <section className="roadmap-note-card spacing-rhythm-sm">
          <Zap size={18} className="text-purple" />
          <div className="rm-text">
            <p>이 참여 기록은 향후 KONET 결제 솔루션 및 영수증 NFT 인프라와 연동될 예정입니다.</p>
            <p className="text-muted text-sm mt-1">KONET은 ZEKTO가 운영하는 결제 증빙 전용 블록체인 인프라입니다.</p>
          </div>
        </section>
      </div>

      {/* ── Section 9: NFT Ticket Delivery Flow ───────────────────────── */}
      <section
        ref={nftRef}
        className={`spacing-rhythm-lg fade-in-section ${nftInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">시사회 초청은 이렇게 전달됩니다</h3>
          <div className="nft-flow-grid">
            <div className="nft-flow-step">
              <div className="nft-flow-icon"><Trophy size={28} /></div>
              <h4 className="nft-flow-title">당첨 확정</h4>
              <p className="nft-flow-desc">
                추첨 결과가 확정되면 여러분의 지갑 주소로 당첨 여부가 자동으로 매칭됩니다.
                결과는 KONET에 기록되어 임의로 변경될 수 없습니다.
              </p>
            </div>
            <ChevronRight size={20} className="nft-flow-arrow" />
            <div className="nft-flow-step">
              <div className="nft-flow-icon"><Send size={28} /></div>
              <h4 className="nft-flow-title">NFT 티켓 발행</h4>
              <p className="nft-flow-desc">
                당첨자의 지갑 주소로 시사회 초청 NFT가 발행됩니다. 이 과정에서 발생하는
                네트워크 수수료(가스비)는 WOORI Foundation이 전액 부담하므로, 당첨자는
                별도 비용 없이 받으실 수 있습니다.
              </p>
            </div>
            <ChevronRight size={20} className="nft-flow-arrow" />
            <div className="nft-flow-step">
              <div className="nft-flow-icon"><Wallet size={28} /></div>
              <h4 className="nft-flow-title">메타마스크에서 확인</h4>
              <p className="nft-flow-desc">
                발송된 NFT는 여러분의 지갑(메타마스크 등)에서 바로 확인 가능합니다.
                이 NFT가 곧 여러분의 시사회 초청장입니다. 시사회 당일 지갑 화면을 제시해
                주시면 입장이 확인됩니다.
              </p>
            </div>
          </div>
          <p className="nft-flow-note text-center mt-4">
            지갑 사용이 처음이신가요? NFT 확인 방법을 별도로 안내해 드립니다.
            {/* TODO: link to a dedicated wallet/NFT viewing guide page once available */}
            <a href="#" className="nft-flow-note-link" onClick={e => e.preventDefault()}>가이드 보기 →</a>
          </p>
        </div>
      </section>

      {/* ── Section 10: FAQ ────────────────────────────────────────────── */}
      <section
        ref={faqRef}
        className={`section-shade-b spacing-rhythm-lg fade-in-section ${faqInView ? 'fade-in-visible' : ''}`}
      >
        <div className="section-inner">
          <h3 className="section-heading text-center">자주 묻는 질문</h3>
          <div className="faq-list">
            {FAQ_ITEMS.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="cta-inline mt-5">
            <a href="#wizard" className="btn-primary btn-hover-effect">
              지금 참여하기 <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 11: Footer ────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logos">
          <img src={wooriFooterLogo} alt="WOORI" className="footer-logo-mark" />
          <img src={konetLogo} alt="KONET" className="footer-logo-mark" />
        </div>
        <p>WOORI × OK Madam 2 Premiere Event · Powered by KONET</p>
        <p className="footer-note">PoC demo — on-chain transactions &amp; Supabase integration pending.</p>
      </footer>
    </div>
  )
}
