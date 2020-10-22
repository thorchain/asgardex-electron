import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

// @TODO (@thatStrangeGuy) Get real component after https://github.com/thorchain/asgardex-electron/issues/447
// @TODO (@thatStrangeGuy) Remove optional props from story component
import { WithdrawStory } from '../../../components/stake/withdraw/Withdraw.stories'
// import { Withdraw } from '../../../components/stake/withdraw'

type Props = {
  stakedAsset: Asset
  runeAsset: Asset
}

export const WithdrawStakeView: React.FC<Props> = (props): JSX.Element => {
  const { stakedAsset, runeAsset } = props

  return <WithdrawStory runeAsset={runeAsset} stakedAsset={stakedAsset} />
}
