import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { AssetData } from './AssetData'

const assetValue = assetToBase(assetAmount(2.49274))
const targetValue = assetToBase(assetAmount(0.49555))
const price = assetToBase(assetAmount(217.92))

storiesOf('Components/assets/AssetData', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <AssetData asset={ASSETS_MAINNET.BNB} price={price} />
      <AssetData asset={ASSETS_MAINNET.BNB} assetValue={assetValue} price={price} />
      <AssetData asset={ASSETS_MAINNET.FTM} assetValue={assetValue} price={price} />
      <AssetData asset={ASSETS_MAINNET.RUNE} assetValue={assetValue} price={price} />
      <AssetData asset={ASSETS_MAINNET.BOLT} assetValue={assetValue} price={price} />
      <AssetData asset={ASSETS_MAINNET.TOMO} assetValue={assetValue} price={price} />
      <AssetData
        asset={ASSETS_MAINNET.BNB}
        target={ASSETS_MAINNET.BOLT}
        assetValue={assetValue}
        targetValue={targetValue}
        price={price}
      />
      <AssetData
        asset={ASSETS_MAINNET.BNB}
        target={ASSETS_MAINNET.BOLT}
        assetValue={assetValue}
        targetValue={targetValue}
        price={price}
        size="big"
      />
    </div>
  )
})
