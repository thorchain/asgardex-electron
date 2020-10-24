import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, AssetBNB, baseAmount, AssetBTC } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { TRANSFER_FEES } from '../../../../shared/mock/fees'
import { StakeFeesRD } from '../../../services/chain/types'
import { AddStake } from './AddStake'

const assetBalance = assetToBase(assetAmount(200))
const runeBalance = assetToBase(assetAmount(100))
const poolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}
const assets = [AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO]
const fees: StakeFeesRD = RD.success({
  base: assetToBase(TRANSFER_FEES.single),
  cross: O.none
})
const reloadFeesHandler = () => console.log('reload fees')

export const AddAsymStakeStory = () => {
  return (
    <AddStake
      type="asym"
      asset={AssetBNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      onStake={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={fees}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
    />
  )
}

export const AddAsymCrossStakeStory = () => {
  return (
    <AddStake
      type="asym"
      asset={AssetBTC}
      runeAsset={AssetRune67C}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      onStake={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={RD.success({
        base: assetToBase(TRANSFER_FEES.single),
        cross: O.some(baseAmount(12300))
      })}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
    />
  )
}

export const AddSymStakeStory = () => {
  return (
    <AddStake
      type="sym"
      asset={AssetBNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      onStake={console.log}
      onChangeAsset={console.log}
      fees={fees}
      reloadFees={reloadFeesHandler}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
    />
  )
}

storiesOf('Components/Stake/AddStake', module)
  .add('sym', AddSymStakeStory)
  .add('asym', AddAsymStakeStory)
  .add('asym - cross-chain', AddAsymCrossStakeStory)
