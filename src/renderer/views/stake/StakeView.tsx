import React, { useEffect } from 'react'

import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import { Stake } from '../../components/stake/Stake'
import BackLink from '../../components/uielements/backLink'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { StakeRouteParams } from '../../routes/stake'
import { AddStakeView } from './AddStake/AddStakeView'
import { PoolDetailsView } from './PoolDetails/PoolDetailsView'
import { ShareView } from './Share/ShareView'

type Props = {}

const StakeView: React.FC<Props> = (_) => {
  const { asset: assetParam } = useParams<StakeRouteParams>()
  const { service: midgardService } = useMidgardContext()
  const { keystoreService } = useWalletContext()
  const { address$ } = useBinanceContext()

  const keystore = useObservableState(keystoreService.keystore$, O.none)

  const asset = assetFromString(assetParam.toUpperCase())

  const walletAddress = useObservableState(address$, O.none)

  useEffect(() => {
    const oAsset = O.fromNullable(asset)
    midgardService.pools.reloadPoolDetailedState(oAsset)
    midgardService.stake.setAddress(walletAddress)
  }, [asset, midgardService.pools, midgardService.stake, walletAddress])
  if (!asset) {
    return (
      <>
        <BackLink />
      </>
    )
  }

  return (
    <>
      <BackLink />
      <Stake
        asset={asset}
        keystoreState={keystore}
        TopContent={PoolDetailsView}
        ShareContent={ShareView}
        AddStake={AddStakeView}
      />
    </>
  )
}

export default StakeView
