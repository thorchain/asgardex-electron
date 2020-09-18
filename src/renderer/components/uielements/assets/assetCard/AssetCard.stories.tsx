import React, { useCallback, useState } from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, baseAmount } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../../const'
import AssetCard from './AssetCard'

storiesOf('Components/Assets/AssetCard', module).add('default', () => {
  const [selectedAmount, setSelectedAmount] = useState(baseAmount(0))

  const onChange = useCallback((value) => setSelectedAmount(baseAmount(value)), [])
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetCard
        title="Title here"
        asset={ASSETS_MAINNET.BNB}
        assetData={[
          {
            asset: ASSETS_MAINNET.BNB,
            price: ONE_ASSET_BASE_AMOUNT
          },
          {
            asset: ASSETS_MAINNET.TOMO,
            price: ONE_ASSET_BASE_AMOUNT
          }
        ]}
        amount={assetToBase(assetAmount(1.354))}
        selectedAmount={selectedAmount}
        onChange={onChange}
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        withPercentSlider
      />
    </div>
  )
})
