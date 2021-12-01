import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount, AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { ZERO_BN, ZERO_BASE_AMOUNT } from '../../../const'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'
import { PoolShare } from './PoolShare'

export const DefaultPoolShare = () => (
  <PoolShare
    asset={{ asset: AssetBNB, decimal: BNB_DECIMAL }}
    assetPrice={assetToBase(assetAmount(120.1))}
    shares={{ rune: assetToBase(assetAmount(1500)), asset: assetToBase(assetAmount(500)) }}
    addresses={{ rune: O.some(RUNE_ADDRESS_TESTNET), asset: O.some(BNB_ADDRESS_TESTNET) }}
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
        addresses={{ rune: O.none, asset: O.some(BNB_ADDRESS_TESTNET) }}
        priceAsset={AssetRuneNative}
        loading={true}
        runePrice={ZERO_BASE_AMOUNT}
        poolShare={ZERO_BN}
        depositUnits={ZERO_BN}
      />
    </div>
  ))
