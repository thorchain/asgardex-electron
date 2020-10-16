import React, { useCallback, useState } from 'react'

import { storiesOf } from '@storybook/react'
import { bn, BaseAmount, AssetBNB, AssetBTC, AssetRuneB1A, assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { AssetCard } from './AssetCard'

storiesOf('Components/Assets/AssetCard', module).add('default', () => {
  const [selectedAmount, setSelectedAmount] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percent, setPercent] = useState(0)

  const onChangeAssetAmount = useCallback((value) => setSelectedAmount(value), [])
  const onChangePercent = useCallback((percent) => {
    console.log('percent', percent)
    setPercent(percent)
  }, [])

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetCard
        title="Title here"
        asset={AssetBNB}
        assets={[AssetBNB, AssetBTC, AssetRuneB1A]}
        selectedAmount={selectedAmount}
        onChangeAssetAmount={onChangeAssetAmount}
        onChangePercent={onChangePercent}
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        percentValue={percent}
        maxAmount={assetToBase(assetAmount(10))}
      />
    </div>
  )
})
