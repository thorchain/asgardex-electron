import React from 'react'

// TODO (@veado) Replace knobs
// import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { AssetBUSDBAF } from '../../../const'
import { PricePoolAssets, PricePoolAsset } from '../../../views/pools/Pools.types'
import { HeaderPriceSelector } from './HeaderPriceSelector'

const assets: PricePoolAssets = [AssetRuneNative, AssetBTC, AssetETH, AssetBUSDBAF]

storiesOf('Components/HeaderPriceSelector', module).add('desktop / mobile', () => {
  const changeHandler = (asset: PricePoolAsset) => console.log(`changed: ${asset}`)
  // const isDesktopView = boolean('isDesktopView', false)
  return (
    <HeaderPriceSelector
      assets={assets}
      // isDesktopView={isDesktopView}
      isDesktopView={true}
      changeHandler={changeHandler}
      selectedAsset={O.some(AssetBUSDBAF)}
    />
  )
})
