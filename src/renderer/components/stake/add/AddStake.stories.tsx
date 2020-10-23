import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, AssetBNB, baseAmount, AssetBTC } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { TRANSFER_FEES } from '../../../../shared/mock/fees'
import { AddStake } from './AddStake'

const assetBalance = assetToBase(assetAmount(200))
const runeBalance = assetToBase(assetAmount(100))
const poolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}
const assets = [AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO]
const chainAsset = O.some(AssetBNB)
const fee = RD.success(assetToBase(TRANSFER_FEES.single))
const reloadFeeHandler = () => console.log('reload fee')

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
      reloadFee={reloadFeeHandler}
      chainAsset={chainAsset}
      fee={fee}
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
      chainAsset={chainAsset}
      fee={fee}
      reloadFee={reloadFeeHandler}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
    />
  )
}

storiesOf('Components/Stake/AddStake', module).add('sym', AddSymStakeStory).add('asym', AddAsymStakeStory)
