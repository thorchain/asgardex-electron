import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { PoolAsset, PricePoolAssets, PricePoolAsset } from '../../views/pools/types'
import HeaderCurrency from './HeaderCurrency'

const assets: PricePoolAssets = [PoolAsset.RUNE, PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]

storiesOf('Components/HeaderCurrency', module).add('desktop / mobile', () => {
  const changeHandler = (asset: PricePoolAsset) => console.log(`changed: ${asset}`)
  const isDesktopView = boolean('isDesktopView', false)
  return (
    <HeaderCurrency
      assets={assets}
      isDesktopView={isDesktopView}
      changeHandler={changeHandler}
      selectedAsset={PoolAsset.TUSDB}
    />
  )
})
