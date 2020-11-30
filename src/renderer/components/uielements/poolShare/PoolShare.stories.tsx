import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount, AssetBNB, AssetRune67C, baseAmount } from '@xchainjs/xchain-util'

import { ZERO_BN } from '../../../const'
import { PoolShare } from './PoolShare'

export const DefaultPoolShare = () => (
  <PoolShare
    sourceAsset={AssetRune67C}
    targetAsset={AssetBNB}
    assetDepositPrice={assetToBase(assetAmount(120.1))}
    assetDepositShare={assetToBase(assetAmount(500))}
    priceAsset={AssetRune67C}
    loading={false}
    runeDepositPrice={assetToBase(assetAmount(400))}
    runeDepositShare={assetToBase(assetAmount(500))}
    poolShare={bn(100)}
    depositUnits={assetToBase(assetAmount(2.01))}
  />
)

storiesOf('Components/PoolShare', module)
  .add('default', () => {
    return (
      <div style={{ padding: '20px' }}>
        <DefaultPoolShare />
      </div>
    )
  })
  .add('loading', () => {
    return (
      <div style={{ padding: '20px' }}>
        <PoolShare
          sourceAsset={AssetRune67C}
          targetAsset={AssetBNB}
          assetDepositPrice={baseAmount(0)}
          assetDepositShare={baseAmount(0)}
          priceAsset={AssetRune67C}
          loading={true}
          runeDepositPrice={baseAmount(0)}
          runeDepositShare={baseAmount(0)}
          poolShare={ZERO_BN}
          depositUnits={baseAmount(0)}
        />
      </div>
    )
  })
