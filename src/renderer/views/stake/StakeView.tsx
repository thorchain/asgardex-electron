import React, { useEffect } from 'react'

import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/Option'
import { useParams } from 'react-router-dom'

/**
 * temporary data mock
 * @TODO @thatStrangeGuyThorchain replace mocck after
 * https://github.com/thorchain/asgardex-electron/issues/443 resolved
 */
import { AddStakeStory } from '../../components/stake/AddStake/AddStake.stories'
import { Stake } from '../../components/stake/Stake'
import BackLink from '../../components/uielements/backLink'
/**
 * temporary data mock
 * @TODO @thatStrangeGuyThorchain replace mocck after
 * https://github.com/thorchain/asgardex-electron/issues/441 resolved
 */
import { defaultPoolShare } from '../../components/uielements/poolShare/PoolShare.stories'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { StakeRouteParams } from '../../routes/stake'
import { PoolDetailsView } from './PoolDetails/PoolDetailsView'

type Props = {}

const StakeView: React.FC<Props> = (_) => {
  const { asset: assetParam } = useParams<StakeRouteParams>()
  const { service: midgardService } = useMidgardContext()

  const asset = assetFromString(assetParam)

  useEffect(() => {
    midgardService.pools.reloadPoolDetailedState(O.fromNullable(asset))
  }, [asset, midgardService.pools])

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
      <Stake topContent={<PoolDetailsView />} shareContent={defaultPoolShare} AddStake={AddStakeStory} />
    </>
  )
}

export default StakeView
