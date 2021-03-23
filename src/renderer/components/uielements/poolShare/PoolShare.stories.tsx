import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount, AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { ZERO_BN, ZERO_BASE_AMOUNT } from '../../../const'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'
import { PoolShare } from './PoolShare'

export const DefaultPoolShare = () => (
  <PoolShare
    asset={{ asset: AssetBNB, decimal: BNB_DECIMAL }}
    assetPrice={assetToBase(assetAmount(120.1))}
    shares={{ rune: assetToBase(assetAmount(500)), asset: assetToBase(assetAmount(500)) }}
    priceAsset={AssetRuneNative}
    runePrice={assetToBase(assetAmount(400))}
    poolShare={bn(100)}
    depositUnits={bn(20100000)}
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
  .add('loading', () => (
    <div style={{ padding: '20px' }}>
      <PoolShare
        asset={{ asset: AssetBNB, decimal: BNB_DECIMAL }}
        assetPrice={ZERO_BASE_AMOUNT}
        shares={{ rune: ZERO_BASE_AMOUNT, asset: ZERO_BASE_AMOUNT }}
        priceAsset={AssetRuneNative}
        loading={true}
        runePrice={ZERO_BASE_AMOUNT}
        poolShare={ZERO_BN}
        depositUnits={ZERO_BN}
      />
    </div>
  ))
