import { useState } from 'react'

export type WalletState = {
  connected: boolean
  address: string
}

// Mirrors the mock wallet connection pattern used on the campaign page —
// kept as a separate shared hook so existing pages don't need to change.
// TODO: Replace with wagmi/ethers.js wallet connection.
const MOCK_ADDRESS = '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b'

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: '' })

  const connectWallet = () => {
    setWallet({ connected: true, address: MOCK_ADDRESS })
  }

  return { wallet, connectWallet }
}

export function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
