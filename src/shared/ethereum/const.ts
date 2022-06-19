import { FeeBounds, Network } from '@xchainjs/xchain-client'

export const DEFAULT_APPROVE_GAS_LIMIT_FALLBACK = '65000'

export const FEE_BOUNDS: Record<Network, FeeBounds | undefined> = {
  /* for main|stagenet use default values defined in ETH.Client */
  [Network.Mainnet]: undefined,
  [Network.Stagenet]: undefined,
  [Network.Testnet]: {
    lower: 1,
    upper: 150_000_000_000_000_0000 // 1.5 ETH (in case testnet gas fees are going to be crazy)
  }
}
