import { useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../../routes/wallet'
import { WalletType } from '../../../../services/wallet/types'

export const useChangeAssetHandler = () => {
  const history = useHistory()

  const handler = useCallback(
    ({
      asset,
      walletAddress,
      walletType,
      walletIndex
    }: {
      asset: Asset
      walletAddress: Address
      walletType: WalletType
      walletIndex: string
    }) => {
      const path = walletRoutes.send.path({ asset: assetToString(asset), walletAddress, walletType, walletIndex })
      history.push(path)
    },
    [history]
  )
  return handler
}
