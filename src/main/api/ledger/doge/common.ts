import { Network } from '@xchainjs/xchain-client'

import { LedgerErrorId } from '../../../../shared/api/types'

// TODO(@veado) Extend`xchain-doge` to get derivation path from it
// Similar to default values in `Client` of `xchain-doge`
// see https://github.com/xchainjs/xchainjs-lib/blob/1f892f0cbd95b39df84e5800b0396e487b20c277/packages/xchain-doge/src/client.ts#L50-L54
export const getDerivationPath = (walletIndex: number, network: Network): string => {
  const DERIVATION_PATHES = {
    [Network.Mainnet]: ["44'", "3'", "0'", 0, walletIndex],
    [Network.Testnet]: ["44'", "1'", "0'", 0, walletIndex],
    [Network.Stagenet]: ["44'", "3'", "0'", 0, walletIndex]
  }
  const path = DERIVATION_PATHES[network].join('/')
  return path
}

export const fromLedgerErrorType = (error: number): LedgerErrorId => {
  switch (error) {
    default:
      return LedgerErrorId.UNKNOWN
  }
}
