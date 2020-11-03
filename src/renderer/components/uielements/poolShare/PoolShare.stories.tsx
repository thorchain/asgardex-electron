import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount, AssetBNB, AssetRune67C, baseAmount } from '@xchainjs/xchain-util'

import { ZERO_BN } from '../../../const'
import { PoolShare } from './PoolShare'

export const DefaultPoolShare = () => (
  <PoolShare
    sourceAsset={AssetRune67C}
    targetAsset={AssetBNB}
    assetStakedPrice={assetToBase(assetAmount(120.1))}
    assetStakedShare={assetToBase(assetAmount(500))}
    priceAsset={AssetRune67C}
    loading={false}
    runeStakedPrice={assetToBase(assetAmount(400))}
    runeStakedShare={assetToBase(assetAmount(500))}
    poolShare={bn(100)}
    stakeUnits={assetToBase(assetAmount(2.01))}
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
          assetStakedPrice={baseAmount(0)}
          assetStakedShare={baseAmount(0)}
          priceAsset={AssetRune67C}
          loading={true}
          runeStakedPrice={baseAmount(0)}
          runeStakedShare={baseAmount(0)}
          poolShare={ZERO_BN}
          stakeUnits={baseAmount(0)}
        />
      </div>
    )
  })
