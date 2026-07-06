// Confirmed provisional campaign schedule — swap these date strings for the
// final confirmed dates when available. All dates are interpreted in KST.

export type CampaignScheduleItem = {
  id: number
  startDate: string // 'YYYY-MM-DD'
  endDate?: string // 'YYYY-MM-DD', for multi-day steps
  title: string
  description: string
}

export const CAMPAIGN_SCHEDULE: CampaignScheduleItem[] = [
  {
    id: 1,
    startDate: '2026-07-07',
    title: '응모 접수 시작',
    description: '지갑을 연결하고 캠페인에 참여하세요. 이 시점부터 매일 자동으로 보유량 스냅샷이 기록됩니다.',
  },
  {
    id: 2,
    startDate: '2026-07-27',
    title: '응모 접수 마감',
    description: '이 날짜까지의 보유 이력을 기준으로 최종 응모권이 산정됩니다.',
  },
  {
    id: 3,
    startDate: '2026-07-28',
    endDate: '2026-07-29',
    title: '당첨자 추첨',
    description: 'KONET에 기록된 참여 데이터를 기반으로 공정하게 추첨이 진행됩니다.',
  },
  {
    id: 4,
    startDate: '2026-07-30',
    title: '당첨자 발표 및 NFT 티켓 발송',
    description: '당첨자에게는 이메일로 개별 안내되며, 시사회 초청 NFT가 지갑으로 자동 전송됩니다.',
  },
  {
    id: 5,
    startDate: '2026-08-07',
    title: '프리미어 시사회',
    description: 'NFT 티켓을 소지하신 분들을 시사회 현장에서 만나 뵙습니다.',
  },
  {
    id: 6,
    startDate: '2026-08-12',
    title: '전국 개봉',
    description: '오케이 마담 2, 전국 극장에서 만나보세요.',
  },
]
