import { create } from 'zustand'

const mockAssets = [
  { id: 1, name: 'Zero-Day Exploit Pack', price: '7.40 BTC' },
  { id: 2, name: 'Stealth VPN Tunnel', price: '2.15 BTC' },
  { id: 3, name: 'Quantum Ledger Key', price: '12.90 BTC' },
  { id: 4, name: 'Encrypted Data Vault', price: '5.05 BTC' },
]

export const useMarketStore = create(() => ({
  assets: mockAssets,
}))
