import { useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../../shared/api/types'
import * as walletRoutes from '../../../../routes/wallet'

export const useChangeAssetHandler = () => {
  const history = useHistory()

  const handler = useCallback(
    (asset: Asset, walletAddress: Address, network: Network) => {
      const path = walletRoutes.send.path({ asset: assetToString(asset), walletAddress, network })
      history.push(path)
    },
    [history]
  )
  return handler
}
