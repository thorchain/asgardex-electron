import { Network } from '@xchainjs/xchain-client'

import { LedgerErrorId } from '../../../../shared/api/types'

// TODO(@veado) Extend`xchain-bitcoincash` to get derivation path from it
// Similar to default values in `Client` of `xchain-litecoin`
// see https://github.com/xchainjs/xchainjs-lib/blob/56adf1e0d6ceab0bdf93f53fe808fe45bf79930f/packages/xchain-bitcoincash/src/client.ts#L65-L69
export const getDerivationPath = (walletIndex: number, network: Network): string => {
  const DERIVATION_PATHES = {
    [Network.Mainnet]: ["44'", "145'", "0'", 0, walletIndex],
    [Network.Testnet]: ["44'", "1'", "0'", 0, walletIndex],
    [Network.Stagenet]: ["44'", "145'", "0'", 0, walletIndex]
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
