import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, AssetBNB, baseAmount, AssetBTC } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { TRANSFER_FEES } from '../../../../shared/mock/fees'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { StakeFeesRD } from '../../../services/chain/types'
import { AddStake } from './AddStake'

const assetBalance = O.some(assetToBase(assetAmount(200)))
const runeBalance = O.some(assetToBase(assetAmount(100)))
const baseChainAssetBalance = O.some(assetToBase(assetAmount(55)))
const crossChainAssetBalance = O.some(assetToBase(assetAmount(44)))
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
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      baseChainAssetBalance={baseChainAssetBalance}
      crossChainAssetBalance={crossChainAssetBalance}
      onStake={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={fees}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  )
}

export const AddAsymCrossStakeStory = () => {
  return (
    <AddStake
      type="asym"
      asset={AssetBTC}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      baseChainAssetBalance={baseChainAssetBalance}
      crossChainAssetBalance={O.none}
      isCrossChain
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
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  )
}

export const AddSymStakeStory = () => {
  return (
    <AddStake
      type="sym"
      asset={AssetBNB}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      baseChainAssetBalance={baseChainAssetBalance}
      crossChainAssetBalance={O.none}
      onStake={console.log}
      onChangeAsset={console.log}
      fees={fees}
      reloadFees={reloadFeesHandler}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  )
}

storiesOf('Components/Stake/AddStake', module)
  .add('sym', AddSymStakeStory)
  .add('sym - balance error', () => {
    return (
      <AddStake
        type="sym"
        asset={AssetBNB}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={O.some(ZERO_BASE_AMOUNT)}
        runeBalance={O.some(ZERO_BASE_AMOUNT)}
        baseChainAssetBalance={O.none}
        crossChainAssetBalance={O.none}
        onStake={console.log}
        onChangeAsset={console.log}
        fees={fees}
        reloadFees={reloadFeesHandler}
        poolData={poolData}
        priceAsset={AssetRune67C}
        assets={assets}
        poolAddress={O.none}
        symDepositMemo={O.none}
        asymDepositMemo={O.none}
      />
    )
  })
  .add('sym - fee error', () => {
    return (
      <AddStake
        type="sym"
        asset={AssetBNB}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={assetBalance}
        runeBalance={runeBalance}
        baseChainAssetBalance={O.none}
        crossChainAssetBalance={O.none}
        onStake={console.log}
        onChangeAsset={console.log}
        fees={fees}
        reloadFees={reloadFeesHandler}
        poolData={poolData}
        priceAsset={AssetRune67C}
        assets={assets}
        poolAddress={O.none}
        symDepositMemo={O.none}
        asymDepositMemo={O.none}
      />
    )
  })
  .add('asym', AddAsymStakeStory)
  .add('asym - balance error', () => (
    <AddStake
      type="asym"
      asset={AssetBNB}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={O.some(ZERO_BASE_AMOUNT)}
      runeBalance={O.some(ZERO_BASE_AMOUNT)}
      baseChainAssetBalance={baseChainAssetBalance}
      crossChainAssetBalance={crossChainAssetBalance}
      onStake={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={fees}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  ))

  .add('asym - cross-chain', AddAsymCrossStakeStory)
  .add('asym - cross chain - fee error', () => {
    return (
      <AddStake
        type="asym"
        asset={AssetBTC}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={assetBalance}
        runeBalance={runeBalance}
        baseChainAssetBalance={O.none}
        crossChainAssetBalance={O.none}
        isCrossChain
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
        poolAddress={O.none}
        symDepositMemo={O.none}
        asymDepositMemo={O.none}
      />
    )
  })
