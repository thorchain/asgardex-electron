import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { AssetBTC, AssetETH, AssetRune67C } from '@thorchain/asgardex-util'

import { AssetBUSDBAF } from '../../const'
import { PricePoolAssets, PricePoolAsset } from '../../views/pools/types'
import HeaderPriceSelector from './HeaderPriceSelector'

const assets: PricePoolAssets = [AssetRune67C, AssetBTC, AssetETH, AssetBUSDBAF]

storiesOf('Components/HeaderPriceSelector', module).add('desktop / mobile', () => {
  const changeHandler = (asset: PricePoolAsset) => console.log(`changed: ${asset}`)
  const isDesktopView = boolean('isDesktopView', false)
  return (
    <HeaderPriceSelector
      assets={assets}
      isDesktopView={isDesktopView}
      changeHandler={changeHandler}
      selectedAsset={AssetBUSDBAF}
    />
  )
})
