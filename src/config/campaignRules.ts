// Campaign eligibility & reward rules — adjust thresholds here only.
// Basic participation requires MIN_WOORI_THRESHOLD; dual-holder status additionally
// requires MIN_KONET_THRESHOLD so that splitting WOORI across wallets can never beat
// actually holding KONET.

export const MIN_WOORI_THRESHOLD = 500
export const MIN_KONET_THRESHOLD = 100

export const BASE_TICKETS = 1
export const DUAL_HOLDER_TICKETS = 3
