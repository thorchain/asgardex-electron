import { Network } from '@xchainjs/xchain-client'

import { LedgerErrorId } from '../../../../shared/api/types'

// TODO(@veado) Extend`xchain-bitcoin` to get derivation path from it
// Similar to default values in `Client` of `xchain-bitcoin`
// see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-bitcoin/src/client.ts#L55-L58
export const getDerivationPath = (walletIndex: number, network: Network): string => {
  const DERIVATION_PATHES = {
    [Network.Mainnet]: ["84'", "0'", "0'", 0, walletIndex],
    [Network.Testnet]: ["84'", "1'", "0'", 0, walletIndex],
    [Network.Stagenet]: ["84'", "0'", "0'", 0, walletIndex]
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
