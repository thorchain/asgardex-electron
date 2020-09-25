import React, { useEffect, useMemo } from 'react'

import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

/**
 * temporary data mock
 * @TODO @thatStrangeGuyThorchain replace mocck after
 * https://github.com/thorchain/asgardex-electron/issues/443 resolved
 */
import { AddStakeStory } from '../../components/stake/AddStake/AddStake.stories'
import { Stake } from '../../components/stake/Stake'
import BackLink from '../../components/uielements/backLink'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { StakeRouteParams } from '../../routes/stake'
import { isLocked } from '../../services/wallet/util'
import { PoolDetailsView } from './PoolDetails/PoolDetailsView'
import { ShareView } from './Share/ShareView'

type Props = {}

const StakeView: React.FC<Props> = (_) => {
  const { asset: assetParam } = useParams<StakeRouteParams>()
  const { service: midgardService } = useMidgardContext()
  const { keystoreService } = useWalletContext()
  const { address$ } = useBinanceContext()

  const keystore = useObservableState(keystoreService.keystore$, O.none)

  const hasWallet = useMemo(() => !pipe(keystore, isLocked), [keystore])

  const asset = assetFromString(assetParam.toUpperCase())

  const walletAddress = useObservableState(address$, O.none)

  useEffect(() => {
    const oAsset = O.fromNullable(asset)
    midgardService.pools.reloadPoolDetailedState(oAsset)
    midgardService.stake.setPoolAsset(oAsset)
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
        hasWallet={hasWallet}
        TopContent={PoolDetailsView}
        ShareContent={ShareView}
        AddStake={AddStakeStory}
      />
    </>
  )
}

export default StakeView
