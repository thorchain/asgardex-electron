import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, AssetBNB, baseAmount, AssetBTC } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { DepositFeesRD } from '../../../services/chain/types'
import { AddDeposit } from './AddDeposit'

const assetBalance = O.some(assetToBase(assetAmount(200)))
const runeBalance = O.some(assetToBase(assetAmount(100)))
const chainAssetBalance = O.some(assetToBase(assetAmount(55)))
const poolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}
const assets = [AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO]
const symFees: DepositFeesRD = RD.success({
  thor: O.some(baseAmount(100)),
  asset: baseAmount(12300)
})

const asymFees: DepositFeesRD = RD.success({
  thor: O.none,
  asset: baseAmount(123)
})

const reloadFeesHandler = () => console.log('reload fees')

export const AddAsymDepositStory = () => {
  return (
    <AddDeposit
      type="asym"
      asset={AssetBNB}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      chainAssetBalance={chainAssetBalance}
      onDeposit={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={asymFees}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  )
}

export const AddSymDepositStory = () => {
  return (
    <AddDeposit
      type="sym"
      asset={AssetBNB}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetBalance}
      runeBalance={runeBalance}
      chainAssetBalance={chainAssetBalance}
      onDeposit={console.log}
      onChangeAsset={console.log}
      fees={symFees}
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

storiesOf('Components/Deposit/AddDeposit', module)
  .add('sym', AddSymDepositStory)
  .add('sym - balance error', () => {
    return (
      <AddDeposit
        type="sym"
        asset={AssetBNB}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={O.some(ZERO_BASE_AMOUNT)}
        runeBalance={O.some(ZERO_BASE_AMOUNT)}
        chainAssetBalance={O.none}
        onDeposit={console.log}
        onChangeAsset={console.log}
        fees={symFees}
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
      <AddDeposit
        type="sym"
        asset={AssetBNB}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={assetBalance}
        runeBalance={O.some(baseAmount(1))}
        chainAssetBalance={assetBalance}
        onDeposit={console.log}
        onChangeAsset={console.log}
        fees={symFees}
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
  .add('asym', AddAsymDepositStory)
  .add('asym - balance error', () => (
    <AddDeposit
      type="asym"
      asset={AssetBNB}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={O.some(ZERO_BASE_AMOUNT)}
      runeBalance={O.some(ZERO_BASE_AMOUNT)}
      chainAssetBalance={chainAssetBalance}
      onDeposit={console.log}
      onChangeAsset={console.log}
      reloadFees={reloadFeesHandler}
      fees={asymFees}
      poolData={poolData}
      priceAsset={AssetRune67C}
      assets={assets}
      poolAddress={O.none}
      symDepositMemo={O.none}
      asymDepositMemo={O.none}
    />
  ))
  .add('asym - fee error', () => {
    return (
      <AddDeposit
        type="asym"
        asset={AssetBTC}
        assetPrice={bn(2)}
        runePrice={bn(1)}
        assetBalance={O.some(baseAmount(1))}
        runeBalance={runeBalance}
        chainAssetBalance={O.none}
        onDeposit={console.log}
        onChangeAsset={console.log}
        reloadFees={reloadFeesHandler}
        fees={asymFees}
        poolData={poolData}
        priceAsset={AssetRune67C}
        assets={assets}
        poolAddress={O.none}
        symDepositMemo={O.none}
        asymDepositMemo={O.none}
      />
    )
  })
