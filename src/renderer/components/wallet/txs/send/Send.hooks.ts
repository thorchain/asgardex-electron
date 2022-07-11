import { useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useNavigate } from 'react-router-dom'

import { WalletType } from '../../../../../shared/wallet/types'
import * as walletRoutes from '../../../../routes/wallet'

export const useChangeAssetHandler = () => {
  const navigate = useNavigate()

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
      walletIndex: number
    }) => {
      const path = walletRoutes.send.path({
        asset: assetToString(asset),
        walletAddress,
        walletType,
        walletIndex: walletIndex.toString()
      })
      navigate(path)
    },
    [navigate]
  )
  return handler
}
