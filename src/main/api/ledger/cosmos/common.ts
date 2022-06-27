// import { Network } from '@xchainjs/xchain-client'
// import { getDefaultRootDerivationPaths } from '@xchainjs/xchain-cosmos'

import { LedgerErrorId } from '../../../../shared/api/types'

export const getDerivationPath = (walletIndex: number) => {
  // Same path for all networks
  // TODO (@veado): Get derivation path from `xchain-cosmos`
  // See https://github.com/xchainjs/xchainjs-lib/pull/603
  // const path = getDefaultRootDerivationPaths()[Network.Mainnet]
  const path = `44'/118'/0'/0/`
  return `${path}${walletIndex}`
}

export const fromLedgerErrorType = (error: number): LedgerErrorId => {
  switch (error) {
    default:
      return LedgerErrorId.UNKNOWN
  }
}
